"use client";

import { useEffect, useRef, useState } from "react";

import { extractEvmAddress } from "@/lib/evm-address";
import { useTranslations } from "@/i18n/locale-provider";

// ~7 Hz decode cadence. jsqrcode's `process` does a full ZXing-style
// finder-pattern sweep at the full camera resolution — ~60-100 ms per pass
// on an iPhone at 720p — so 150 ms leaves headroom for React render work.
const DECODE_INTERVAL_MS = 150;

// Settle delay after video.play() resolves before the decode loop starts.
// Empirical iOS-Safari hack — on iOS the video element reports
// readyState >= 2 before the underlying pipeline is actually producing
// usable frames.
const POST_PLAY_SETTLE_MS = 500;

interface QrScannerProps {
	onScan: (address: string) => void;
	/** Chain-specific address extractor. Defaults to EVM. */
	extract?: (data: string) => string | null;
	/** Error copy shown when a QR was readable but didn't yield an address of
	 *  the expected shape. */
	unsupportedMessage?: string;
}

export function QrScanner({
	onScan,
	extract = extractEvmAddress,
	unsupportedMessage,
}: QrScannerProps) {
	const t = useTranslations();
	const videoRef = useRef<HTMLVideoElement>(null);
	const onScanRef = useRef(onScan);
	const [error, setError] = useState<string | null>(null);
	const resolvedUnsupportedMessage =
		unsupportedMessage ?? t("qrScanner.unsupportedFormat");

	useEffect(() => {
		onScanRef.current = onScan;
	}, [onScan]);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		let cancelled = false;
		let scanned = false;
		let stream: MediaStream | null = null;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let decodeQr:
			| ((
					imageData: ImageData,
			  ) => import("@/lib/vendor/jsqrcode").DecodeResult)
			| null = null;
		let canvas: HTMLCanvasElement | null = null;
		let ctx: CanvasRenderingContext2D | null = null;
		let lastRejectedPayload: string | null = null;

		const tick = () => {
			if (cancelled || scanned || !decodeQr || !canvas || !ctx) return;

			if (video.readyState >= 2 && video.videoWidth > 0) {
				const w = video.videoWidth;
				const h = video.videoHeight;
				if (canvas.width !== w) canvas.width = w;
				if (canvas.height !== h) canvas.height = h;

				let result:
					| import("@/lib/vendor/jsqrcode").DecodeResult
					| { ok: false; error: string } = { ok: false, error: "skipped" };
				try {
					ctx.drawImage(video, 0, 0, w, h);
					const imageData = ctx.getImageData(0, 0, w, h);
					result = decodeQr(imageData);
				} catch (err) {
					result = {
						ok: false,
						error:
							err instanceof Error ? err.message : String(err) || "frame error",
					};
				}
				if (cancelled || scanned) return;

				if (result.ok) {
					const raw = result.value;
					const address = extract(raw);
					if (!address) {
						if (lastRejectedPayload !== raw) {
							lastRejectedPayload = raw;
							console.warn("Unsupported QR payload:", raw);
							setError(resolvedUnsupportedMessage);
						}
					} else {
						setError(null);
						scanned = true;
						onScanRef.current(address);
						return;
					}
				}
			}

			if (!cancelled && !scanned) {
				timeoutId = setTimeout(tick, DECODE_INTERVAL_MS);
			}
		};

		(async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						facingMode: { ideal: "environment" },
						width: { ideal: 720 },
						height: { ideal: 720 },
					},
				});
				if (cancelled) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}

				video.srcObject = stream;

				// iOS Safari sometimes stalls if you call play() before
				// loadedmetadata fires. Gate on readyState (HAVE_METADATA = 1).
				await new Promise<void>((resolve) => {
					if (video.readyState >= 1) {
						resolve();
						return;
					}
					const onMeta = () => {
						video.removeEventListener("loadedmetadata", onMeta);
						resolve();
					};
					video.addEventListener("loadedmetadata", onMeta);
				});
				if (cancelled) return;

				try {
					await video.play();
				} catch (playErr) {
					if (cancelled) return;
					console.error("video.play() rejected:", playErr);
					setError(t("qrScanner.previewCouldNotStart"));
					return;
				}
				if (cancelled) return;

				await new Promise((r) => setTimeout(r, POST_PLAY_SETTLE_MS));
				if (cancelled) return;

				// Lazy-load the vendored jsqrcode decoder so the ~120 KB of port
				// code only hits the bundle on the scanner screen.
				const mod = await import("@/lib/vendor/jsqrcode");
				if (cancelled) return;
				decodeQr = mod.decodeQr;

				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d", { willReadFrequently: true });
				if (!ctx) {
					setError(t("qrScanner.canvasUnavailable"));
					return;
				}

				tick();
			} catch (err) {
				if (cancelled) return;
				console.error("QR scanner init failed:", err);
				setError(t("qrScanner.cameraAccessDenied"));
			}
		})();

		return () => {
			cancelled = true;
			if (timeoutId !== null) clearTimeout(timeoutId);
			timeoutId = null;

			if (stream) {
				stream.getTracks().forEach((t) => t.stop());
				stream = null;
			}

			// iOS-specific hardware release: nulling srcObject + load() forces
			// Safari to drop the camera handle immediately. Without this the
			// green "camera in use" indicator can stick around after the
			// scanner unmounts.
			if (video) {
				video.srcObject = null;
				video.load();
			}

			decodeQr = null;
			canvas = null;
			ctx = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="flex flex-col gap-3">
			<div className="relative aspect-square w-full">
				{/* autoPlay + muted + playsInline — all three required on iOS Safari.
				    playsInline prevents fullscreen takeover, muted satisfies the
				    autoplay policy, autoPlay kicks the pipeline without a user
				    gesture. object-cover fills the square without distorting the
				    native camera aspect ratio. */}
				<video
					ref={videoRef}
					autoPlay
					muted
					playsInline
					className="absolute inset-0 h-full w-full rounded-2xl bg-black object-cover"
				/>
				{/* Decorative corner brackets — decoder runs against the full
				    frame; these are just a framing hint for the user. */}
				<div className="pointer-events-none absolute inset-[8%]">
					<div className="absolute left-0 top-0 size-10 rounded-tl-md border-l-2 border-t-2 border-white" />
					<div className="absolute right-0 top-0 size-10 rounded-tr-md border-r-2 border-t-2 border-white" />
					<div className="absolute bottom-0 left-0 size-10 rounded-bl-md border-b-2 border-l-2 border-white" />
					<div className="absolute bottom-0 right-0 size-10 rounded-br-md border-b-2 border-r-2 border-white" />
				</div>
			</div>
			{error ? (
				<p className="text-center text-sm text-destructive">{error}</p>
			) : null}
		</div>
	);
}
