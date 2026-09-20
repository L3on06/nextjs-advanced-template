import al from "./al.json";
import en from "./en.json";

// Build-time contracts for every translation file:
// 1. Flat string maps only (a nested object value fails this check).
// 2. Identical key sets across locales (a missing or extra key fails this check).
// These bindings are intentionally value-unused; their assignments are the check.
/* eslint-disable @typescript-eslint/no-unused-vars */
const _enFlat: Record<string, string> = en;
const _alFlat: Record<string, string> = al;
const _alHasEveryEnKey: Record<keyof typeof en, string> = al;
const _enHasEveryAlKey: Record<keyof typeof al, string> = en;
/* eslint-enable @typescript-eslint/no-unused-vars */

export { al, en };
export type TranslationKey = keyof typeof en;
