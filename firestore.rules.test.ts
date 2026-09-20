import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";

/**
 * Firestore rules tests against GENERATED rules. Run against the Emulator
 * Suite, never production:
 *   npm run test:rules
 * Project id `demo-starter` keeps all emulator traffic local. These tests
 * prove the generated output, not a hand written file.
 */
// @vitest-environment node

const PROJECT_ID = "demo-starter";
const OWNER = "owner-uid";
const STRANGER = "stranger-uid";
const ADMIN = "admin-uid";
const EDITOR = "editor-uid";
const INVITEE_EMAIL = "invitee@example.com";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID });
});

afterAll(async () => {
  await testEnv.cleanup();
});

async function seed() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const profile = (uid: string, roles: string[]) =>
      setDoc(doc(db, "users", uid), {
        uid,
        email: `${uid}@example.com`,
        displayName: uid,
        roles,
      });
    await profile(OWNER, ["viewer"]);
    await profile(ADMIN, ["admin"]);
    await profile(EDITOR, ["editor"]);
    await setDoc(doc(db, "invites", "invite-1"), {
      email: INVITEE_EMAIL,
      role: "viewer",
      status: "pending",
    });
  });
}

describe("firestore.rules: users", () => {
  it("denies signed out reads of everything", async () => {
    await seed();
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users", OWNER)));
  });

  it("lets owners read their own profile", async () => {
    await seed();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertSucceeds(getDoc(doc(db, "users", OWNER)));
  });

  it("denies strangers reading another profile", async () => {
    await seed();
    const db = testEnv.authenticatedContext(STRANGER).firestore();
    await assertFails(getDoc(doc(db, "users", OWNER)));
  });

  it("lets admins read any profile", async () => {
    await seed();
    const db = testEnv.authenticatedContext(ADMIN).firestore();
    await assertSucceeds(getDoc(doc(db, "users", OWNER)));
  });

  it("denies listing the users collection", async () => {
    await seed();
    const db = testEnv.authenticatedContext(ADMIN).firestore();
    await assertFails(getDocs(collection(db, "users")));
  });

  it("lets owners create their own profile with the viewer role", async () => {
    await seed();
    const db = testEnv.authenticatedContext("new-uid").firestore();
    await assertSucceeds(
      setDoc(doc(db, "users", "new-uid"), {
        uid: "new-uid",
        email: "new@example.com",
        displayName: "New",
        roles: ["viewer"],
      }),
    );
  });

  it("denies self granted admin on create", async () => {
    await seed();
    const db = testEnv.authenticatedContext("new-uid").firestore();
    await assertFails(
      setDoc(doc(db, "users", "new-uid"), {
        uid: "new-uid",
        email: "new@example.com",
        displayName: "New",
        roles: ["admin"],
      }),
    );
  });

  it("denies creating another user's profile", async () => {
    await seed();
    const db = testEnv.authenticatedContext(STRANGER).firestore();
    await assertFails(
      setDoc(doc(db, "users", OWNER), {
        uid: OWNER,
        email: "x@y.z",
        displayName: "X",
        roles: ["viewer"],
      }),
    );
  });

  it("lets owners update everything except roles", async () => {
    await seed();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertSucceeds(updateDoc(doc(db, "users", OWNER), { displayName: "Renamed" }));
  });

  it("denies owners escalating their own roles", async () => {
    await seed();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(updateDoc(doc(db, "users", OWNER), { roles: ["admin"] }));
  });

  it("lets admins delete, denies owners deleting", async () => {
    await seed();
    const adminDb = testEnv.authenticatedContext(ADMIN).firestore();
    await assertSucceeds(deleteDoc(doc(adminDb, "users", STRANGER)));
    const ownerDb = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(deleteDoc(doc(ownerDb, "users", OWNER)));
  });

  it("denies writes to unknown collections by default", async () => {
    await seed();
    const db = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(setDoc(doc(db, "anything", "x"), { a: 1 }));
  });
});

describe("firestore.rules: invites with status transitions", () => {
  it("lets managers create invites, denies viewers", async () => {
    await seed();
    const editorDb = testEnv.authenticatedContext(EDITOR).firestore();
    await assertSucceeds(
      setDoc(doc(editorDb, "invites", "invite-2"), {
        email: "a@b.c",
        role: "viewer",
        status: "pending",
      }),
    );
    const viewerDb = testEnv.authenticatedContext(OWNER).firestore();
    await assertFails(
      setDoc(doc(viewerDb, "invites", "invite-3"), {
        email: "a@b.c",
        role: "viewer",
        status: "pending",
      }),
    );
  });

  it("lets the invitee read their own invite, denies strangers", async () => {
    await seed();
    const inviteeDb = testEnv.authenticatedContext("invitee-uid", { email: INVITEE_EMAIL }).firestore();
    await assertSucceeds(getDoc(doc(inviteeDb, "invites", "invite-1")));
    const strangerDb = testEnv.authenticatedContext(STRANGER).firestore();
    await assertFails(getDoc(doc(strangerDb, "invites", "invite-1")));
  });

  it("lets the invitee accept without touching frozen fields", async () => {
    await seed();
    const inviteeDb = testEnv.authenticatedContext("invitee-uid", { email: INVITEE_EMAIL }).firestore();
    await assertSucceeds(updateDoc(doc(inviteeDb, "invites", "invite-1"), { status: "accepted" }));
  });

  it("denies the invitee escalating their invited role", async () => {
    await seed();
    const inviteeDb = testEnv.authenticatedContext("invitee-uid", { email: INVITEE_EMAIL }).firestore();
    await assertFails(updateDoc(doc(inviteeDb, "invites", "invite-1"), { status: "accepted", role: "admin" }));
  });
});
