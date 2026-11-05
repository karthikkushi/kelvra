// src/utils/sharing.js
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db, saveLater, withTimeout, readDoc } from "./firebase";

// Random, hard-to-guess share ID (16 characters, a-z0-9)
function generateShareId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
}

// Share a study kit — returns a share URL
export async function shareStudyKit(userId, topic, results) {
  try {
    const shareId = generateShareId();
    if (!db || !userId) throw new Error("Please sign in to share.");
    if (!navigator.onLine) throw new Error("You are offline. Connect to the internet to share a study kit.");
    await withTimeout(setDoc(doc(db, "shared_kits", shareId), {
      share_id: shareId,
      user_id: userId,
      topic,
      summary:    results.summary    ? JSON.stringify(results.summary)    : null,
      flashcards: results.flashcards ? JSON.stringify(results.flashcards) : null,
      quiz:       results.quiz       ? JSON.stringify(results.quiz)       : null,
      plan:       results.plan       ? JSON.stringify(results.plan)       : null,
      views: 0,
      created_at: new Date().toISOString(),
    }), 10000);
    return {
      success: true,
      shareId,
      shareUrl: `${window.location.origin}/shared/${shareId}`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get a shared kit by ID
export async function getSharedKit(shareId) {
  try {
    if (!db) throw new Error("The app is not connected to its database yet.");
    const snap = await readDoc(doc(db, "shared_kits", shareId));
    if (!snap.exists()) throw new Error("This study kit does not exist or was removed.");
    const data = snap.data();

    // Count the view (best effort)
    saveLater(updateDoc(doc(db, "shared_kits", shareId), { views: increment(1) }), "Count view");

    return {
      success: true,
      kit: {
        ...data,
        summary:    data.summary    ? JSON.parse(data.summary)    : null,
        flashcards: data.flashcards ? JSON.parse(data.flashcards) : null,
        quiz:       data.quiz       ? JSON.parse(data.quiz)       : null,
        plan:       data.plan       ? JSON.parse(data.plan)       : null,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
