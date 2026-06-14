"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import { defaultLocale, type Locale, messages } from "@/i18n";

/** Shared with the old usePersistentState language key so saved prefs carry over. */
const STORAGE_KEY = "jbswap:language";

type Vars = Record<string, string | number>;

interface LocaleContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	/** Translate `key` in the active locale; falls back to English then the key.
	    `{name}` tokens in the string are replaced from `vars`. */
	t: (key: string, vars?: Vars) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Holds the active UI locale and broadcasts changes to every consumer (so the
 * whole app re-renders into the new language the instant it's picked). The
 * choice is persisted to localStorage under the same key the language picker
 * used before, and read back after mount to stay SSR-safe.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(defaultLocale);

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Locale;
				if (parsed in messages) setLocaleState(parsed);
			}
		} catch {
			// ignore unavailable / malformed storage
		}
	}, []);

	// Expose the locale on <html> so globals.css can swap the display font
	// (Chinese / Korean use dedicated rounded CJK fonts). Reactive, so the font
	// changes the instant the locale does.
	useEffect(() => {
		document.documentElement.setAttribute("data-locale", locale);
	}, [locale]);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {
			// ignore write failures (quota, private mode)
		}
	}, []);

	const t = useCallback(
		(key: string, vars?: Vars) => {
			const dict = messages[locale] ?? messages.en;
			let result = dict[key] ?? messages.en[key] ?? key;
			if (vars) {
				for (const name of Object.keys(vars)) {
					result = result.replaceAll(`{${name}}`, String(vars[name]));
				}
			}
			return result;
		},
		[locale],
	);

	return (
		<LocaleContext.Provider value={{ locale, setLocale, t }}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale() {
	const ctx = useContext(LocaleContext);
	if (!ctx) {
		throw new Error("useLocale must be used within a LocaleProvider");
	}
	return ctx;
}

/** Convenience hook for components that only need the translate function. */
export function useTranslations() {
	return useLocale().t;
}
