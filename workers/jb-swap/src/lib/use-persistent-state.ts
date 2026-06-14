"use client";

import { useEffect, useState } from "react";

/**
 * useState that mirrors its value into localStorage under `key`. SSR-safe: the
 * first client render uses `initial` (matching the server), then the stored
 * value is read in after mount, so there's no hydration mismatch. Subsequent
 * changes are written back. Reads/writes are wrapped so private-mode or quota
 * failures degrade to plain in-memory state.
 */
export function usePersistentState<T>(key: string, initial: T) {
	const [value, setValue] = useState<T>(initial);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(key);
			if (stored !== null) setValue(JSON.parse(stored) as T);
		} catch {
			// Ignore unavailable / malformed storage.
		}
		setHydrated(true);
	}, [key]);

	useEffect(() => {
		if (!hydrated) return;
		try {
			window.localStorage.setItem(key, JSON.stringify(value));
		} catch {
			// Ignore write failures (quota, private mode).
		}
	}, [key, value, hydrated]);

	return [value, setValue] as const;
}
