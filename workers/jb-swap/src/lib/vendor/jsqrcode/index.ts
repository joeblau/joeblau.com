import { createQrcode } from './qrcode.js';

// One decoder instance per module. The factory produces an isolated `qrcode`
// object keyed to its own closure — we hold onto a single instance so the
// 40 Version tables, GF256 fields, and other heavy load-time setup only
// happen once. Decode state (width/height/imagedata) is overwritten on every
// call, so there's no cross-frame leakage even though the instance is shared.
type QrcodeInstance = ReturnType<typeof createQrcode>;
let instance: QrcodeInstance | null = null;

function getInstance(): QrcodeInstance {
  if (!instance) {
    instance = createQrcode();
  }
  return instance;
}

export type DecodeResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Flip the R/G/B bytes of an RGBA pixel buffer in place. Alpha is untouched.
 * jsqrcode's FinderPatternFinder is polarity-sensitive — its row scanner
 * only matches dark-light-dark-light-dark transitions starting from a dark
 * pixel, so a white-on-black QR (common for dark-mode wallet UIs) yields
 * zero finder pattern candidates. Flipping the pixel colors before a retry
 * makes the same QR look like a standard black-on-white one to the decoder.
 */
function invertRgbInPlace(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

function tryDecode(imageData: ImageData): DecodeResult {
  const qrcode = getInstance();
  qrcode.width = imageData.width;
  qrcode.height = imageData.height;
  qrcode.imagedata = imageData;

  try {
    // `qrcode.process` only uses its ctx argument inside `if (qrcode.debug)`
    // branches, which are disabled by default. Pass null so we don't have to
    // materialize a 2d context we'd never draw to.
    const result = qrcode.process(null);
    if (typeof result === 'string' && result.length > 0) {
      return { ok: true, value: result };
    }
    return { ok: false, error: 'empty result' };
  } catch (err) {
    const error =
      typeof err === 'string'
        ? err
        : err instanceof Error
          ? err.message
          : 'decode failed';
    return { ok: false, error };
  }
}

/**
 * Decode the QR code in an ImageData frame. Tries the pixels as-is first;
 * on failure, flips R/G/B in place and tries once more so inverted (light
 * modules on a dark background) QR codes still decode. If both passes fail
 * the first error is returned — it's the one that matches the "no QR in
 * view" case most callers care about.
 *
 * NOTE: this mutates `imageData.data` on the invert retry path. In practice
 * the scanner calls `ctx.getImageData` fresh each frame so mutation is local,
 * but don't reuse the buffer after calling decodeQr without re-fetching it.
 */
export function decodeQr(imageData: ImageData): DecodeResult {
  const first = tryDecode(imageData);
  if (first.ok) return first;

  invertRgbInPlace(imageData.data);
  const second = tryDecode(imageData);
  if (second.ok) return second;

  return first;
}
