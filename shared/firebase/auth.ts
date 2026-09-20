import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseApp } from "@/shared/firebase/client";

/** Client Auth instance. Session state flows through `shared/auth/`. */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
