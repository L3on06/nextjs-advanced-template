import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

/**
 * Storage rules tests. Run against the Emulator Suite, never production:
 *   npm run test:rules
 */
// @vitest-environment node

const PROJECT_ID = "demo-starter";
const OWNER = "owner-uid";
const STRANGER = "stranger-uid";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("storage.rules", () => {
  it("denies signed out uploads", async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/a.txt`), new Uint8Array([1])));
  });

  it("lets owners write their own folder", async () => {
    const storage = testEnv.authenticatedContext(OWNER).storage();
    await assertSucceeds(uploadBytes(ref(storage, `users/${OWNER}/a.txt`), new Uint8Array([1])));
  });

  it("denies strangers writing another folder", async () => {
    const storage = testEnv.authenticatedContext(STRANGER).storage();
    await assertFails(uploadBytes(ref(storage, `users/${OWNER}/a.txt`), new Uint8Array([1])));
  });

  it("denies reads of the written file to strangers", async () => {
    const ownerStorage = testEnv.authenticatedContext(OWNER).storage();
    await uploadBytes(ref(ownerStorage, `users/${OWNER}/b.txt`), new Uint8Array([1]));
    const strangerStorage = testEnv.authenticatedContext(STRANGER).storage();
    await assertFails(getDownloadURL(ref(strangerStorage, `users/${OWNER}/b.txt`)));
  });

  it("denies writes outside user folders by default", async () => {
    const storage = testEnv.authenticatedContext(OWNER).storage();
    await assertFails(uploadBytes(ref(storage, "public/a.txt"), new Uint8Array([1])));
  });
});
