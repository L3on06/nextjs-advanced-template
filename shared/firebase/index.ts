/**
 * Client safe barrel. Admin modules are DELIBERATELY excluded: importing
 * `shared/firebase/admin` (or `server.ts` under `shared/auth/`) from a client
 * component must always fail loudly via `server-only`, never silently bundle
 * privileged credentials. Server code imports Admin modules by direct path.
 */
export { getFirebaseApp } from "@/shared/firebase/client";
export { getFirebaseAuth } from "@/shared/firebase/auth";
export { getFirestoreDb, typedDoc } from "@/shared/firebase/firestore";
export { getFirebaseStorage, userFileRef } from "@/shared/firebase/storage";
export { getClientEnv } from "@/shared/firebase/env";
export {
  connectEmulatorsInDev,
  resolveEmulatorConfig,
  useEmulators,
  type EmulatorHosts,
} from "@/shared/firebase/emulators";
export {
  USERS_COLLECTION,
  UserProfileSchema,
  UserRoleSchema,
  userProfilePath,
  type UserProfile,
  type UserRole,
} from "@/shared/firebase/user-profiles";
