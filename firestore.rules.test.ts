import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Firestore rules tests. Run against the Emulator Suite, never production:
 *   npm run test:rules
 * Project id `demo-starter` keeps all emulator traffic local.
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

async function seedOwnerProfile() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users", OWNER), {
      uid: OWNER,
      email: "owner@example.com",
      displayName: "Owner",
      roles: ["viewer"],
    });
  });
}

describe("firestore.rules", () => {
  it("denies signed out reads of everything", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users", OWNER)));
  });

  it("lets owners read their own profile", async () => {
    await seedOwnerProfile();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertSucceeds(getDoc(doc(db, "users", OWNER)));
  });

  it("denies strangers reading another profile", async () => {
    await seedOwnerProfile();
    const db = testEnv.authenticatedContext(STRANGER).firestore();
    await assertFails(getDoc(doc(db, "users", OWNER)));
  });

  it("denies listing the users collection", async () => {
    await seedOwnerProfile();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    const { collection, getDocs } = await import("firebase/firestore");
    await assertFails(getDocs(collection(db, "users")));
  });

  it("denies writes to unknown collections by default", async () => {
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(setDoc(doc(db, "anything", "x"), { a: 1 }));
  });
});
