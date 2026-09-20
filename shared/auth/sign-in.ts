import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type UserCredential,
} from "firebase/auth";
import { z } from "zod";
import { getFirebaseAuth } from "@/shared/firebase/auth";

/** Credential shape validated before anything reaches the SDK. */
export const EmailCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export type EmailCredentials = z.infer<typeof EmailCredentialsSchema>;

export async function signInWithEmail(input: EmailCredentials): Promise<UserCredential> {
  const parsed = EmailCredentialsSchema.parse(input);
  return signInWithEmailAndPassword(getFirebaseAuth(), parsed.email, parsed.password);
}

export async function signUpWithEmail(input: EmailCredentials): Promise<UserCredential> {
  const parsed = EmailCredentialsSchema.parse(input);
  return createUserWithEmailAndPassword(getFirebaseAuth(), parsed.email, parsed.password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}
