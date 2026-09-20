import {
  doc,
  getFirestore,
  type DocumentData,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseApp } from "@/shared/firebase/client";

/** Client Firestore instance (security rules apply to every call made here). */
export function getFirestoreDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Typed document reference helper so features share one ref convention. */
export function typedDoc<T extends DocumentData>(path: string): DocumentReference<T> {
  return doc(getFirestoreDb(), path) as DocumentReference<T>;
}
