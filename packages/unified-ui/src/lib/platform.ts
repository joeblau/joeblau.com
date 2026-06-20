let _hapticOverlay: boolean | null = null;

/**
 * True only on iOS WebKit, where the Project Fathom `<input switch>` haptic
 * works. Gates the invisible haptic overlay so it never renders on
 * desktop/Android. Memoized and SSR-safe (returns false when `navigator` is
 * undefined). NEVER call at module load — call it from an effect so the server
 * and first client paint agree.
 */
export function shouldUseHapticOverlay(): boolean {
	if (_hapticOverlay !== null) return _hapticOverlay;
	if (typeof navigator === "undefined") return false; // SSR
	const platform = navigator.platform ?? "";
	const isIOS =
		/iP(hone|ad|od)/.test(platform) ||
		// iPadOS 13+ reports "MacIntel" with touch points.
		(platform === "MacIntel" && navigator.maxTouchPoints > 1);
	// The Vibration API is absent on every iOS browser; that absence is the
	// canonical "no script haptic" tell, so require iOS AND no-vibrate.
	const noVibration = typeof navigator.vibrate !== "function";
	_hapticOverlay = isIOS && noVibration;
	return _hapticOverlay;
}
