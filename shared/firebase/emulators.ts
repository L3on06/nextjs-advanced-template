import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { connectAuthEmulator } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import { connectFirestoreEmulator } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { connectStorageEmulator } from "firebase/storage";

export interface EmulatorHosts {
  auth: string;
  firestore: string;
  storage: string;
}

const DEFAULT_HOSTS: EmulatorHosts = {
  auth: "127.0.0.1:9099",
  firestore: "127.0.0.1:8080",
  storage: "127.0.0.1:9199",
};

/**
 * Pure resolution of emulator hosts: explicit env wins, otherwise the
 * `firebase.json` defaults. Exported for unit testing.
 */
export function resolveEmulatorConfig(env: Record<string, string | undefined>): EmulatorHosts {
  return {
    auth: env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? DEFAULT_HOSTS.auth,
    firestore: env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST ?? DEFAULT_HOSTS.firestore,
    storage: env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST ?? DEFAULT_HOSTS.storage,
  };
}

/** True when running against the Emulator Suite (dev only, never production). */
export function useEmulators(): boolean {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS === "true" ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined ||
    process.env.FIRESTORE_EMULATOR_HOST !== undefined ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST !== undefined
  );
}

function splitHostPort(hostPort: string): [string, number] {
  const [host, port] = hostPort.split(":");
  return [host, Number(port)];
}

/**
 * Connect client SDKs to the local emulators. Call once at app boot in
 * development. Refuses to run in production builds so emulator wiring can
 * never leak into a deploy.
 */
export function connectEmulatorsInDev(
  _app: FirebaseApp,
  auth: Auth,
  db: Firestore,
  storage: FirebaseStorage,
): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("[firebase] Emulators must never connect in production.");
  }
  if (!useEmulators()) return;
  const hosts = resolveEmulatorConfig(process.env);
  const [authHost, authPort] = splitHostPort(hosts.auth);
  const [dbHost, dbPort] = splitHostPort(hosts.firestore);
  const [storageHost, storagePort] = splitHostPort(hosts.storage);
  connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, dbHost, dbPort);
  connectStorageEmulator(storage, storageHost, storagePort);
}
