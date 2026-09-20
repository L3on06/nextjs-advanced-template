import { z } from "zod";

/**
 * Firebase environment schemas. Parsed once at boot with fail fast: the app
 * refuses to start when a required key is missing, so bad config surfaces
 * immediately instead of as a runtime mystery.
 */

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, "missing"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1, "missing"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, "missing"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST: z.string().min(1).optional(),
});

const ServerEnvSchema = z.object({
  FIREBASE_ADMIN_PROJECT_ID: z.string().min(1).optional(),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().min(1).optional(),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().min(1).optional(),
});

export type FirebaseClientEnv = z.infer<typeof ClientEnvSchema>;
export type FirebaseServerEnv = z.infer<typeof ServerEnvSchema>;

let cachedClientEnv: FirebaseClientEnv | null = null;
let cachedServerEnv: FirebaseServerEnv | null = null;

function failFast(issues: string): never {
  throw new Error(`[firebase] Invalid environment:\n${issues}`);
}

/** Validated public Firebase config. Safe for client bundles. */
export function getClientEnv(): FirebaseClientEnv {
  if (cachedClientEnv) return cachedClientEnv;
  const parsed = ClientEnvSchema.safeParse(process.env);
  if (!parsed.success) failFast(parsed.error.issues.map((i) => ` - ${i.path.join(".")}: ${i.message}`).join("\n"));
  cachedClientEnv = parsed.data;
  return cachedClientEnv;
}

/**
 * Validated Admin credentials. Server only: never import this module (or
 * `shared/firebase/admin`) from client components. All fields are optional so
 * local emulator runs work without a service account; `admin.ts` decides how
 * to initialize from what is present.
 */
export function getServerEnv(): FirebaseServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) failFast(parsed.error.issues.map((i) => ` - ${i.path.join(".")}: ${i.message}`).join("\n"));
  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/** True when a full service account is configured for Admin init. */
export function hasServiceAccount(env: FirebaseServerEnv): boolean {
  return Boolean(env.FIREBASE_ADMIN_PROJECT_ID && env.FIREBASE_ADMIN_CLIENT_EMAIL && env.FIREBASE_ADMIN_PRIVATE_KEY);
}
