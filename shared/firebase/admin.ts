import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getClientEnv, getServerEnv, hasServiceAccount } from "@/shared/firebase/env";

/**
 * Server side Firebase Admin. SERVER ONLY: the `server-only` import above
 * makes any client bundle import fail at build time.
 *
 * SEPARATION OF POWERS (read before touching this file):
 *
 * 1. Client SDK (`shared/firebase/client`, `auth`, `firestore`, `storage`)
 *    acts as the signed in user. Firestore and Storage Security Rules apply
 *    to every call. This is the only SDK client components may use.
 * 2. Admin SDK (this module) acts with full privilege and COMPLETELY BYPASSES
 *    Firestore and Storage Security Rules. A read or write here succeeds even
 *    when the rules would deny the same call from a client.
 * 3. Because rules do not protect Admin access, every Admin use MUST enforce
 *    authorization itself: verify the caller's session, check roles against
 *    `shared/permissions`, and validate inputs with Zod at the entry point
 *    (server action, route handler, or Cloud Function). Application level
 *    authorization and IAM scoping remain required on the server side.
 * 4. Security Rules (`firestore.rules`, `storage.rules`) protect direct
 *    client access only. Functions authorization (`functions/`) and
 *    application authorization (guards) are separate layers that each
 *    recheck; none of them may assume another layer already checked.
 *
 * Init order: full service account when configured (deploys), project ID only
 * when talking to emulators, otherwise a clear error telling the operator
 * what to set. Never commit service account JSON; credentials arrive by env.
 */

function initAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];
  const serverEnv = getServerEnv();
  if (hasServiceAccount(serverEnv)) {
    return initializeApp({
      credential: cert({
        projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  const projectId = serverEnv.FIREBASE_ADMIN_PROJECT_ID ?? getClientEnv().NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (process.env.FIRESTORE_EMULATOR_HOST ?? process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return initializeApp({ projectId });
  }
  throw new Error(
    "[firebase] Admin credentials missing. Set FIREBASE_ADMIN_PROJECT_ID, " +
      "FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY, or run " +
      "against the Emulator Suite. See .env.example.",
  );
}

/** Privileged Admin app. Bypasses security rules: authorize every use. */
export function getAdminApp(): App {
  return initAdminApp();
}

/** Privileged Auth (verify tokens, manage users). Bypasses rules: authorize. */
export function getAdminAuth(): Auth {
  return getAuth(initAdminApp());
}

/** Privileged Firestore. Bypasses rules: authorize every read and write. */
export function getAdminDb(): Firestore {
  return getFirestore(initAdminApp());
}

/** Privileged Storage. Bypasses rules: authorize every use. */
export function getAdminStorage(): Storage {
  return getStorage(initAdminApp());
}
