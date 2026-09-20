import { z } from "zod";

/**
 * Generic starter resource for the authentication/RBAC foundation: one profile
 * document per user at `users/{uid}`. This is identity plumbing, not business
 * data. Features own their own collections; nothing business specific belongs
 * here or in the rules.
 */

export const USERS_COLLECTION = "users";

export const UserRoleSchema = z.enum(["viewer", "editor", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().max(120).nullable(),
  roles: z.array(UserRoleSchema).min(1),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/** Document path for a user's starter profile. */
export function userProfilePath(uid: string): string {
  return `${USERS_COLLECTION}/${uid}`;
}
