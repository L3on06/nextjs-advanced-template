import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/shared/firebase/admin";

/**
 * Server side session resolution. Verifies the caller's ID token with the
 * Admin SDK and returns the decoded identity. Server only: `server-only`
 * fails any client import at build time.
 *
 * Knowing WHO the caller is not permission to act: every server action and
 * route handler must still authorize against `shared/permissions` before
 * touching data, including through the Admin SDK (which bypasses rules).
 */
export async function getServerSession(idToken: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifyIdToken(idToken);
}
