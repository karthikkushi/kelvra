// src/utils/firebase.js
// Login (Firebase Auth) and data (Cloud Firestore) for Kelvra.
// Firestore keeps a copy of the data in the browser (IndexedDB), so the app still reads
// and saves while offline; queued writes are sent when the connection comes back.
//
// Data layout (security rules: firestore.rules):
//   users/{uid}                        profile: full_name, study_type, goal, learning_style, onboarding_done
//   users/{uid}/study_sessions/{id}    topic, summary, flashcards, quiz, plan, created_at
//   users/{uid}/quiz_scores/{id}       topic, score, total, pct, created_at
//   users/{uid}/meta/exam_goal         exam_name, exam_date, daily_goal_minutes
//   users/{uid}/meta/agent_plan        exam_name, exam_date, plan
//   users/{uid}/meta/mentor            goals, messages (AI mentor)
//   leaderboard/{uid}                  display_name, total_xp, weekly_xp, week_start, level, badges
//   shared_kits/{shareId}              public study kits (read by anyone with the link)
import { initializeApp } from "firebase/app";
import {
  getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously,
  signInWithPopup, GoogleAuthProvider, signOut as fbSignOut, updateProfile, sendPasswordResetEmail, sendEmailVerification,
} from "firebase/auth";
import {
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  collection, doc, addDoc, setDoc, getDoc, getDocs, getDocFromCache, getDocsFromCache, query, where, orderBy, limit,
} from "firebase/firestore";

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
if (!firebaseReady) console.error("Firebase keys missing. Copy .env.example to .env and fill in the VITE_FIREBASE_* values.");

const app = firebaseReady ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      // Preview mode: reach the Firestore emulator through the app's own address (see vite.config.js proxy)
      ...(import.meta.env.VITE_FIREBASE_EMULATOR_PROXY === "true" ? { host: window.location.host, ssl: window.location.protocol === "https:" } : {}),
    })
  : null;

// Local development against `npm run emulators` (never set this on Vercel).
if (app && import.meta.env.VITE_FIREBASE_EMULATOR === "true") {
  if (import.meta.env.VITE_FIREBASE_EMULATOR_PROXY === "true") {
    connectAuthEmulator(auth, window.location.origin, { disableWarnings: true });
  } else {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
}

// ── Small helpers ──
const nowIso = () => new Date().toISOString();
const sinceIso = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const userCol = (uid, name) => collection(db, "users", uid, name);
export const metaDoc = (uid, name) => doc(db, "users", uid, "meta", name);

// Writes are not awaited: offline, Firestore queues them and the promise only settles
// once the server confirms. Waiting would freeze the screen, so we log failures instead.
export function saveLater(promise, label) {
  promise.catch((err) => console.error(`${label} failed:`, err));
}

// Rejects after `ms` so a read never hangs on a bad connection.
export function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("The database took too long to answer.")), ms)),
  ]);
}

// Read one document / a query. Offline (or when the network is slow) we answer from the
// copy Firestore keeps in the browser instead of waiting for the server.
export async function readDoc(ref, ms = 6000) {
  if (!navigator.onLine) return getDocFromCache(ref);
  try {
    return await withTimeout(getDoc(ref), ms);
  } catch (err) {
    try { return await getDocFromCache(ref); } catch { throw err; }
  }
}

export async function readQuery(q, ms = 8000) {
  if (!navigator.onLine) return getDocsFromCache(q);
  try {
    return await withTimeout(getDocs(q), ms);
  } catch (err) {
    try { return await getDocsFromCache(q); } catch { throw err; }
  }
}

const AUTH_ERRORS = {
  "auth/invalid-credential":     "Wrong email or password.",
  "auth/wrong-password":         "Wrong email or password.",
  "auth/user-not-found":         "No account with this email. Sign up first.",
  "auth/email-already-in-use":   "An account with this email already exists. Log in instead.",
  "auth/invalid-email":          "That email address does not look right.",
  "auth/weak-password":          "Password must be at least 6 characters.",
  "auth/too-many-requests":      "Too many tries. Wait a minute and try again.",
  "auth/network-request-failed": "No internet connection. Check your network and try again.",
  "auth/popup-closed-by-user":   "Google sign-in was closed before it finished.",
  "auth/popup-blocked":          "Your browser blocked the Google pop-up. Allow pop-ups for this site.",
  "auth/unauthorized-domain":    "This website is not allowed to use Google sign-in yet (add it in Firebase > Authentication > Settings > Authorized domains).",
};
export function friendlyAuthError(err) {
  return AUTH_ERRORS[err?.code] || err?.message || "Something went wrong. Please try again.";
}

function notReady() {
  return { data: null, error: new Error("The app is not connected to its database yet (Firebase keys missing).") };
}

// ── The signed-in user ──
// Pages get { id, email, user_metadata: { full_name, study_type, goal, learning_style, onboarding_done } }.
const PROFILE_CACHE = (uid) => `kelvra_profile_${uid}`;
let currentUser;            // undefined = still checking, null = signed out
const listeners = new Set();

function readCachedProfile(uid) {
  try { return JSON.parse(localStorage.getItem(PROFILE_CACHE(uid))) || {}; } catch { return {}; }
}
function writeCachedProfile(uid, profile) {
  try { localStorage.setItem(PROFILE_CACHE(uid), JSON.stringify(profile)); } catch { /* storage full or blocked */ }
}

async function buildUser(fbUser) {
  let profile = readCachedProfile(fbUser.uid);
  try {
    const snap = await readDoc(doc(db, "users", fbUser.uid), 5000);
    if (snap.exists()) {
      profile = snap.data();
      writeCachedProfile(fbUser.uid, profile);
    }
  } catch { /* offline: keep the cached profile */ }
  return {
    id: fbUser.uid,
    email: fbUser.email,
    email_verified: fbUser.emailVerified,
    provider: fbUser.providerData?.[0]?.providerId || "password",
    user_metadata: { ...profile, full_name: profile.full_name || fbUser.displayName || "" },
  };
}

function emit(user) {
  currentUser = user;
  listeners.forEach((cb) => cb(user));
}

if (auth) {
  // Anonymous sessions (used only to play the public Daily Grid) count as signed out for the app.
  onAuthStateChanged(auth, async (fbUser) => emit(fbUser && !fbUser.isAnonymous ? await buildUser(fbUser) : null));
} else {
  currentUser = null;
}

export function onUserChange(cb) {
  listeners.add(cb);
  if (currentUser !== undefined) cb(currentUser);
  return () => listeners.delete(cb);
}

export function getCurrentUser() {
  return currentUser ?? null;
}

export async function resendVerification() {
  if (!auth?.currentUser) return { error: new Error("Please sign in again.") };
  try {
    await sendEmailVerification(auth.currentUser, { url: `${window.location.origin}/dashboard` });
    return { error: null };
  } catch (err) {
    return { error: new Error(friendlyAuthError(err)) };
  }
}

// Re-reads the account from Firebase (e.g. after the student clicks the link in the email).
export async function reloadUser() {
  if (!auth?.currentUser) return null;
  await auth.currentUser.reload();
  await refreshUser();
  return getCurrentUser();
}

export async function refreshUser() {
  if (auth?.currentUser) emit(await buildUser(auth.currentUser));
}

// Fresh ID token for /api/groq (the server checks it with Firebase).
export async function getIdToken() {
  return auth?.currentUser ? auth.currentUser.getIdToken() : "";
}

// ── Auth ──
export async function signUp(email, password, fullName) {
  if (!auth) return notReady();
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Verification link (needed before AI features work); don't block sign-up if it fails
    saveLater(sendEmailVerification(cred.user, { url: `${window.location.origin}/dashboard` }), "Send verification email");
    await updateProfile(cred.user, { displayName: fullName });
    await setDoc(doc(db, "users", cred.user.uid), { full_name: fullName, created_at: nowIso() }, { merge: true });
    await refreshUser();
    return { data: { user: getCurrentUser() }, error: null };
  } catch (err) {
    return { data: null, error: new Error(friendlyAuthError(err)) };
  }
}

export async function signIn(email, password) {
  if (!auth) return notReady();
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { data: { user: await buildUser(cred.user) }, error: null };
  } catch (err) {
    return { data: null, error: new Error(friendlyAuthError(err)) };
  }
}

export async function signInWithGoogle() {
  if (!auth) return notReady();
  try {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const user = await buildUser(cred.user);
    if (!user.user_metadata.full_name && cred.user.displayName) {
      saveLater(setDoc(doc(db, "users", cred.user.uid), { full_name: cred.user.displayName }, { merge: true }), "Save name");
    }
    return { data: { user }, error: null };
  } catch (err) {
    return { data: null, error: new Error(friendlyAuthError(err)) };
  }
}

export async function resetPassword(email) {
  if (!auth) return notReady();
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (err) {
    return { error: new Error(friendlyAuthError(err)) };
  }
}

export async function signOut() {
  if (!auth) return { error: null };
  try {
    await fbSignOut(auth);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

export async function getUser() {
  return getCurrentUser();
}

// Merge fields into the profile (name, onboarding answers) and update everyone listening.
export async function updateUserProfile(fields) {
  const uid = auth?.currentUser?.uid;
  if (!uid) return notReady();
  writeCachedProfile(uid, { ...readCachedProfile(uid), ...fields });
  saveLater(setDoc(doc(db, "users", uid), fields, { merge: true }), "Save profile");
  if (fields.full_name) saveLater(updateProfile(auth.currentUser, { displayName: fields.full_name }), "Save display name");
  emit({
    ...currentUser,
    user_metadata: { ...currentUser?.user_metadata, ...fields },
  });
  return { data: null, error: null };
}

export async function saveOnboardingPrefs(studyType, goal, learningStyle, ageGroup = null) {
  return updateUserProfile({ study_type: studyType, goal, learning_style: learningStyle, age_group: ageGroup, onboarding_done: true });
}

// ── Study data ──
export async function listRecent(userId, name, { days, max } = {}) {
  if (!db || !userId) return [];
  const parts = [orderBy("created_at", "desc")];
  if (days) parts.unshift(where("created_at", ">=", sinceIso(days)));
  if (max) parts.push(limit(max));
  const snap = await readQuery(query(userCol(userId, name), ...parts));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function safeList(userId, name, opts) {
  try {
    return { data: await listRecent(userId, name, opts), error: null };
  } catch (error) {
    console.error(`Load ${name} failed:`, error);
    return { data: [], error };
  }
}

export async function saveStudySession(userId, topic, results) {
  if (!db || !userId) return notReady();
  saveLater(addDoc(userCol(userId, "study_sessions"), {
    topic,
    summary:    results.summary    ? JSON.stringify(results.summary)    : null,
    flashcards: results.flashcards ? JSON.stringify(results.flashcards) : null,
    quiz:       results.quiz       ? JSON.stringify(results.quiz)       : null,
    plan:       results.plan       ? JSON.stringify(results.plan)       : null,
    created_at: nowIso(),
  }), "Save study session");
  return { data: null, error: null };
}

export async function saveQuizScore(userId, topic, score, total) {
  if (!db || !userId) return notReady();
  saveLater(addDoc(userCol(userId, "quiz_scores"), {
    topic,
    score,
    total,
    pct: total ? Math.round((score / total) * 100) : 0,
    created_at: nowIso(),
  }), "Save quiz score");
  return { data: null, error: null };
}

export const getStudySessions = (userId, days = 30) => safeList(userId, "study_sessions", { days });
export const getQuizScores    = (userId, days = 30) => safeList(userId, "quiz_scores", { days });
export const getUserSessions  = (userId)            => safeList(userId, "study_sessions", { max: 10 });

// ── Single documents under users/{uid}/meta ──
export async function getMeta(userId, name) {
  if (!db || !userId) return null;
  try {
    const snap = await readDoc(metaDoc(userId, name));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error(`Load ${name} failed:`, err);
    return null;
  }
}

export function setMeta(userId, name, data) {
  if (!db || !userId) return;
  saveLater(setDoc(metaDoc(userId, name), { ...data, updated_at: nowIso() }, { merge: true }), `Save ${name}`);
}

// Daily Grid can be played without an account: it uses a silent anonymous session, which the
// rest of the app treats as signed out. Returns the uid, or null if Firebase isn't set up.
export async function ensurePlayer() {
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser.uid;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch (err) {
    console.error("Anonymous play is not available:", err.code || err.message);
    return null;
  }
}

export const isRealUser = () => Boolean(auth?.currentUser && !auth.currentUser.isAnonymous);
