// src/utils/offlineStorage.js
// Store flashcards in IndexedDB for offline review

const DB_NAME = "kelvra_offline";
const DB_VERSION = 1;
const STORE_NAME = "flashcards";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("topic", "topic", { unique: false });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };
  });
}

// Save a flashcard set offline
export async function saveFlashcardsOffline(topic, cards) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const id = `${topic}_${Date.now()}`;
    store.put({ id, topic, cards, savedAt: new Date().toISOString() });
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); });
  } catch (err) {
    console.error("Offline save error:", err);
    return false;
  }
}

// Get all saved offline flashcard sets
export async function getOfflineFlashcards() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// Delete an offline set
export async function deleteOfflineSet(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    return true;
  } catch {
    return false;
  }
}

// Check if app is offline
export function isOffline() {
  return !navigator.onLine;
}
