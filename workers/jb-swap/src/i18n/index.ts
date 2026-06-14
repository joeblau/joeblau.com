import { en } from "./messages/en";
import { es } from "./messages/es";
import { fr } from "./messages/fr";
import { ko } from "./messages/ko";
import { zh } from "./messages/zh";

/** Supported UI locales (the 5 languages shown in the language picker). */
export type Locale = "en" | "es" | "zh" | "ko" | "fr";

/** A flat catalog: dotted message key → translated string. */
export type Messages = Record<string, string>;

export const defaultLocale: Locale = "en";

export const messages: Record<Locale, Messages> = { en, es, zh, ko, fr };
