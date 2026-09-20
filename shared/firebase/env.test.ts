import { describe, expect, it } from "vitest";
import { getClientEnv, getServerEnv, hasServiceAccount } from "@/shared/firebase/env";

process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??= "test-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??= "test.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??= "test-project";

describe("getClientEnv", () => {
  it("parses the required public keys", () => {
    const env = getClientEnv();
    expect(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe("test-project");
  });

  it("is cached between calls", () => {
    expect(getClientEnv()).toBe(getClientEnv());
  });
});

describe("getServerEnv", () => {
  it("allows empty admin credentials for emulator runs", () => {
    const env = getServerEnv();
    expect(env.FIREBASE_ADMIN_PROJECT_ID).toBeUndefined();
    expect(hasServiceAccount(env)).toBe(false);
  });
});
