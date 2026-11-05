// src/utils/account.js
// Student data rights (India's DPDP Act): download everything Kelvra stores about you,
// and delete your account with all of its data.
import {
  collection, doc, getDocs, getDoc, query, where, writeBatch, terminate, clearIndexedDbPersistence,
} from "firebase/firestore";
import { EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, deleteUser } from "firebase/auth";
import { auth, db, friendlyAuthError } from "./firebase";

// Every sub-collection under users/{uid}. Keep in sync when a new kind of data is added.
export const USER_COLLECTIONS = [
  "study_sessions", "quiz_scores", "mistakes", "cards", "daily", "explorations",
  "confidence", "focus", "answers", "debriefs", "meta",
];

async function readAll(uid) {
  const data = {};
  for (const name of USER_COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", uid, name));
    data[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  const profile = await getDoc(doc(db, "users", uid));
  const board = await getDoc(doc(db, "leaderboard", uid));
  const kits = await getDocs(query(collection(db, "shared_kits"), where("user_id", "==", uid)));
  return {
    profile: profile.exists() ? profile.data() : null,
    leaderboard: board.exists() ? board.data() : null,
    shared_kits: kits.docs.map((d) => ({ id: d.id, ...d.data() })),
    ...data,
  };
}

// Downloads a JSON file with all of the student's data.
export async function downloadMyData() {
  const user = auth?.currentUser;
  if (!user) throw new Error("Please sign in again.");
  if (!navigator.onLine) throw new Error("Connect to the internet to download your data.");
  const data = await readAll(user.uid);
  const file = {
    exported_at: new Date().toISOString(),
    account: { id: user.uid, email: user.email, email_verified: user.emailVerified, created: user.metadata?.creationTime },
    ...data,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `kelvra-my-data-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Firebase asks for a fresh sign-in before deleting an account.
async function reauthenticate(password) {
  const user = auth.currentUser;
  const provider = user.providerData?.[0]?.providerId;
  if (provider === "google.com") return reauthenticateWithPopup(user, new GoogleAuthProvider());
  if (!password) throw new Error("Enter your password to confirm.");
  return reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
}

/**
 * Deletes ALL the student's data and then the account. Cannot be undone.
 * Order: confirm identity first (so nothing is deleted if the password is wrong), then data, then login.
 */
export async function deleteMyAccount({ password } = {}) {
  const user = auth?.currentUser;
  if (!user) throw new Error("Please sign in again.");
  if (!navigator.onLine) throw new Error("Connect to the internet to delete your account.");
  try {
    await reauthenticate(password);
  } catch (err) {
    throw new Error(err.code ? friendlyAuthError(err) : err.message);
  }

  const uid = user.uid;
  const refs = [];
  for (const name of USER_COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", uid, name));
    snap.docs.forEach((d) => refs.push(d.ref));
  }
  const kits = await getDocs(query(collection(db, "shared_kits"), where("user_id", "==", uid)));
  kits.docs.forEach((d) => refs.push(d.ref));
  refs.push(doc(db, "leaderboard", uid), doc(db, "users", uid));

  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }

  await deleteUser(user);

  // Remove the copies kept on this device
  try { Object.keys(localStorage).filter((k) => k.startsWith("kelvra_")).forEach((k) => localStorage.removeItem(k)); } catch { /* blocked */ }
  try { sessionStorage.clear(); } catch { /* blocked */ }
  try { indexedDB.deleteDatabase("kelvra_offline"); } catch { /* not available */ }
  try { await terminate(db); await clearIndexedDbPersistence(db); } catch { /* cache already gone */ }
  return { deleted: refs.length };
}
