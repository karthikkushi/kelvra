// src/utils/gridData.js
// Daily Grid storage. Votes and crowd counts are shared across all players:
//   grid_votes/{puzzleKey}_{uid}   one per player per puzzle: { puzzle, uid, answers[5], score, created_at }
//   grid_stats/{puzzleKey}_q{i}    public counts per question: { A, B, C, D, total }
// Security rules only let a counter go up by exactly one, and only in the same write that creates
// that player's single vote for the puzzle (see firestore.rules).
import { doc, getDoc, getDocs, collection, query, where, writeBatch, increment } from "firebase/firestore";
import { db, auth, readDoc, ensurePlayer } from "./firebase";

const statRef = (key, i) => doc(db, "grid_stats", `${key}_q${i}`);
const voteRef = (key, uid) => doc(db, "grid_votes", `${key}_${uid}`);

// Counts for each question of a puzzle (before the player's own answers).
export async function loadStats(key, count = 5) {
  if (!db) return Array(count).fill(null);
  return Promise.all(Array.from({ length: count }, async (_, i) => {
    try {
      const snap = await readDoc(statRef(key, i), 5000);
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  }));
}

// The player's saved result for this puzzle, if they already played (on any device, same account).
export async function myVote(key) {
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(voteRef(key, uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

/**
 * Saves one vote and adds it to the crowd counts in a single batch.
 * @param {Array<{picked:string, confidence:string, right:boolean}>} results
 */
export async function submitGrid(key, results) {
  const uid = await ensurePlayer();
  if (!uid || !db) return false;
  const batch = writeBatch(db);
  batch.set(voteRef(key, uid), {
    puzzle: key,
    uid,
    answers: results.map((r) => r.picked),
    confidence: results.map((r) => r.confidence || null),
    score: results.filter((r) => r.right).length,
    created_at: new Date().toISOString(),
  });
  results.forEach((r, i) => batch.set(statRef(key, i), { [r.picked]: increment(1), total: increment(1) }, { merge: true }));
  try {
    await batch.commit();
    return true;
  } catch (err) {
    console.error("Daily Grid vote not saved:", err.code || err.message);
    return false;
  }
}

// For "download my data" / "delete my account".
export async function myVotes(uid) {
  if (!db || !uid) return [];
  const snap = await getDocs(query(collection(db, "grid_votes"), where("uid", "==", uid)));
  return snap.docs;
}
