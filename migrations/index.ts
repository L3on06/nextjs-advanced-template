import type { Migration } from "../scripts/starter/migrate";

/**
 * Migration registry. New migration: add migrations/NNNN-slug.ts exporting a
 * Migration, then list it here. Ranges are inclusive of `to`, exclusive of
 * `from`; the runner orders by semver and runs each once.
 */
export const MIGRATIONS: Migration[] = [];
