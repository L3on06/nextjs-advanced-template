import { getStorage, ref, type FirebaseStorage, type StorageReference } from "firebase/storage";
import { getFirebaseApp } from "@/shared/firebase/client";

/** Client Storage instance (storage rules apply to every call made here). */
export function getFirebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

/**
 * Reference inside the signed in user's own folder, mirroring storage.rules.
 * Nothing here grants access; the rules decide.
 */
export function userFileRef(userId: string, filePath: string): StorageReference {
  return ref(getFirebaseStorage(), `users/${userId}/${filePath}`);
}
