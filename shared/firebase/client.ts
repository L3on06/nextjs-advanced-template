import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getClientEnv } from "@/shared/firebase/env";

/**
 * Client Firebase app singleton. Constructed lazily so importing this module
 * performs no IO. Never import Admin modules from client code; the barrel
 * (`shared/firebase/index.ts`) deliberately excludes them.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  const env = getClientEnv();
  return initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}
