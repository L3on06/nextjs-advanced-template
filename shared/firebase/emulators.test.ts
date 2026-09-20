import { describe, expect, it } from "vitest";
import { resolveEmulatorConfig, useEmulators } from "@/shared/firebase/emulators";

describe("resolveEmulatorConfig", () => {
  it("falls back to firebase.json defaults", () => {
    expect(resolveEmulatorConfig({})).toEqual({
      auth: "127.0.0.1:9099",
      firestore: "127.0.0.1:8080",
      storage: "127.0.0.1:9199",
    });
  });

  it("prefers explicit env hosts", () => {
    expect(
      resolveEmulatorConfig({ NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: "127.0.0.1:8085" }).firestore,
    ).toBe("127.0.0.1:8085");
  });
});

describe("useEmulators", () => {
  it("is off without emulator indicators", () => {
    expect(useEmulators()).toBe(false);
  });
});
