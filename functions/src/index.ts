import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { z } from "zod";

/**
 * Cloud Functions (2nd generation) foundation.
 *
 * AUTHORIZATION LAYERS: Admin SDK calls below BYPASS Firestore Security
 * Rules, so each function enforces authorization itself — verify the caller,
 * check roles, validate inputs with Zod at the entry. Application guards and
 * rules are separate layers that recheck independently.
 */

if (getApps().length === 0) {
  initializeApp();
}

const REGION = "europe-west1";

/** Authenticated liveness probe. Proves Functions auth wiring end to end. */
export const ping = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in first.");
  }
  return { ok: true, uid: request.auth.uid, now: new Date().toISOString() };
});

const EnsureProfileInput = z.object({}).strict();

/**
 * Idempotent starter profile seed for the auth/RBAC foundation. Creates
 * `users/{uid}` with the default `viewer` role when missing, returns the
 * existing document otherwise. Generic plumbing only, no business data.
 */
export const ensureUserProfile = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in first.");
  }
  EnsureProfileInput.parse(request.data ?? {});
  const uid = request.auth.uid;
  const ref = getFirestore().doc(`users/${uid}`);
  const snap = await ref.get();
  if (snap.exists) return { created: false as const, uid };
  const authUser = await getAuth().getUser(uid);
  await ref.create({
    uid,
    email: authUser.email ?? null,
    displayName: authUser.displayName ?? null,
    roles: ["viewer"],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { created: true as const, uid };
});
