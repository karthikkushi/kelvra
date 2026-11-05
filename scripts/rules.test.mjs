// Security-rule checks against the Firestore + Auth emulators.
// Run: npm run emulators   (in another terminal), then: npm run test:rules
import { test } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInAnonymously, signOut } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, doc, setDoc, getDoc, getDocs, collection, updateDoc, increment, writeBatch } from "firebase/firestore";

const config = { apiKey: "demo-key", authDomain: "demo-kelvra.firebaseapp.com", projectId: "demo-kelvra", appId: "demo" };
const run = Date.now();

async function client(name, signedIn = true, anonymous = false) {
  const app = initializeApp(config, `${name}-${run}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  let uid = null;
  if (anonymous) uid = (await signInAnonymously(auth)).user.uid;
  else if (signedIn) uid = (await createUserWithEmailAndPassword(auth, `${name}-${run}@test.dev`, "secret123")).user.uid;
  return { app, auth, db, uid };
}

const denied = (p) => assert.rejects(p, (e) => e.code === "permission-denied");

const alice = await client("alice");
const bob = await client("bob");
const guest = await client("guest", false);
const anon = await client("anon", false, true);   // a Daily Grid player without an account
const anon2 = await client("anon2", false, true);

test("a student can save and read their own data", async () => {
  await setDoc(doc(alice.db, "users", alice.uid), { full_name: "Alice" });
  await setDoc(doc(alice.db, "users", alice.uid, "quiz_scores", "q1"), { topic: "Cells", pct: 80, created_at: new Date().toISOString() });
  assert.equal((await getDoc(doc(alice.db, "users", alice.uid))).data().full_name, "Alice");
  assert.equal((await getDocs(collection(alice.db, "users", alice.uid, "quiz_scores"))).size, 1);
});

test("a student cannot read or write another student's data", async () => {
  await denied(getDoc(doc(bob.db, "users", alice.uid)));
  await denied(getDocs(collection(bob.db, "users", alice.uid, "quiz_scores")));
  await denied(setDoc(doc(bob.db, "users", alice.uid, "meta", "mentor"), { goals: [] }));
  await denied(getDoc(doc(guest.db, "users", alice.uid)));
});

test("leaderboard: opt-in only; XP only goes up, by at most 50", async () => {
  const row = doc(alice.db, "leaderboard", alice.uid);
  await setDoc(row, { total_xp: 10, weekly_xp: 10, level: 1, badges: [] });
  await denied(getDoc(doc(bob.db, "leaderboard", alice.uid)));   // private by default
  assert.equal((await getDoc(row)).data().total_xp, 10);           // owner can read
  await setDoc(row, { public: true }, { merge: true });            // Alice opts in
  await setDoc(row, { total_xp: 25, weekly_xp: 25 }, { merge: true });
  await denied(setDoc(row, { total_xp: 9999, weekly_xp: 9999 }, { merge: true }));
  await denied(setDoc(row, { total_xp: 5, weekly_xp: 5 }, { merge: true }));
  await denied(setDoc(doc(bob.db, "leaderboard", alice.uid), { total_xp: 30, weekly_xp: 30 }, { merge: true }));
  await denied(setDoc(doc(bob.db, "leaderboard", bob.uid), { total_xp: 500, weekly_xp: 500 }));
  assert.equal((await getDoc(doc(bob.db, "leaderboard", alice.uid))).data().total_xp, 25);
  await denied(getDocs(collection(guest.db, "leaderboard")));
  // Public rows can be listed only with the public filter
  const { query, where } = await import("firebase/firestore");
  const pub = await getDocs(query(collection(bob.db, "leaderboard"), where("public", "==", true)));
  assert.ok(pub.docs.some((d) => d.id === alice.uid));
  await denied(getDocs(collection(bob.db, "leaderboard")));
});

test("shared kits: anyone with the link can open and count a view, nothing else", async () => {
  const id = `kit${run}`; // unique per run: rules (correctly) refuse to overwrite an existing kit
  await setDoc(doc(alice.db, "shared_kits", id), { share_id: id, user_id: alice.uid, topic: "Cells", views: 0 });
  assert.equal((await getDoc(doc(guest.db, "shared_kits", id))).data().topic, "Cells");
  await updateDoc(doc(guest.db, "shared_kits", id), { views: increment(1) });
  await denied(updateDoc(doc(guest.db, "shared_kits", id), { topic: "Hacked" }));
  await denied(updateDoc(doc(guest.db, "shared_kits", id), { views: 1000 }));
  await denied(getDocs(collection(guest.db, "shared_kits")));
  await denied(getDocs(collection(bob.db, "shared_kits")));
  const { query, where } = await import("firebase/firestore");
  const own = await getDocs(query(collection(alice.db, "shared_kits"), where("user_id", "==", alice.uid)));
  assert.equal(own.size, 1);
  await denied(getDocs(query(collection(bob.db, "shared_kits"), where("user_id", "==", alice.uid))));
  await denied(setDoc(doc(bob.db, "shared_kits", `zzz${run}`), { user_id: alice.uid, views: 0 }));
});

test("anonymous Daily Grid players can't touch study data, the leaderboard or shared kits", async () => {
  await denied(setDoc(doc(anon.db, "users", anon.uid), { full_name: "x" }));
  await denied(setDoc(doc(anon.db, "users", anon.uid, "mistakes", "m1"), { q: "x" }));
  await denied(setDoc(doc(anon.db, "leaderboard", anon.uid), { total_xp: 10, weekly_xp: 10 }));
  await denied(getDocs(collection(anon.db, "leaderboard")));
  await denied(setDoc(doc(anon.db, "shared_kits", `anon${run}`), { user_id: anon.uid, views: 0 }));
});

// Helper: one full Daily Grid vote (vote doc + 5 counters) in one batch, like the app does
function vote(c, key, picks) {
  const b = writeBatch(c.db);
  b.set(doc(c.db, "grid_votes", `${key}_${c.uid}`), { puzzle: key, uid: c.uid, answers: picks, score: 0, created_at: "now" });
  picks.forEach((p, i) => b.set(doc(c.db, "grid_stats", `${key}_q${i}`), { [p]: increment(1), total: increment(1) }, { merge: true }));
  return b.commit();
}

test("daily grid: one vote per player, counters only +1, crowd counts public", async () => {
  const key = `neet-${run % 100000}`;
  await vote(anon, key, ["A", "B", "C", "D", "A"]);
  await vote(anon2, key, ["A", "C", "C", "D", "B"]);
  const q0 = (await getDoc(doc(guest.db, "grid_stats", `${key}_q0`))).data();   // readable without any account
  assert.deepEqual({ A: q0.A, total: q0.total }, { A: 2, total: 2 });
  const q1 = (await getDoc(doc(guest.db, "grid_stats", `${key}_q1`))).data();
  assert.deepEqual([q1.B, q1.C, q1.total], [1, 1, 2]);
  // Same player again: the vote already exists, so the whole batch is refused
  await denied(vote(anon, key, ["B", "B", "B", "B", "B"]));
  assert.equal((await getDoc(doc(guest.db, "grid_stats", `${key}_q0`))).data().total, 2);
  // Counters can't be changed without a new vote, or by more than 1
  await denied(updateDoc(doc(anon.db, "grid_stats", `${key}_q0`), { A: increment(1), total: increment(1) }));
  const b = writeBatch(bob.db);
  b.set(doc(bob.db, "grid_votes", `${key}_${bob.uid}`), { puzzle: key, uid: bob.uid, answers: ["A", "A", "A", "A", "A"], score: 0, created_at: "now" });
  b.set(doc(bob.db, "grid_stats", `${key}_q0`), { A: increment(5), total: increment(5) }, { merge: true });
  await denied(b.commit());
  // Players see only their own vote; a vote can't be filed under someone else's id
  assert.equal((await getDoc(doc(anon.db, "grid_votes", `${key}_${anon.uid}`))).data().answers[0], "A");
  await denied(getDoc(doc(anon2.db, "grid_votes", `${key}_${anon.uid}`)));
  await denied(setDoc(doc(anon2.db, "grid_votes", `${key}_${anon.uid}`), { puzzle: key, uid: anon.uid, answers: ["A", "A", "A", "A", "A"] }));
});

test.after(async () => {
  for (const c of [alice, bob, guest, anon, anon2]) { await signOut(c.auth); await deleteApp(c.app); }
});
