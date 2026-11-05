// src/utils/learning.js
// Data for the learning features. Everything lives under users/{uid}/..., so the existing
// security rule (only the owner can read/write) already covers it, and it all works offline.
//   users/{uid}/mistakes/{id}      wrong quiz answers: question, options, correct, chosen, explanation, topic, wrong_count, mastered
//   users/{uid}/cards/{id}         flashcard deck: question, answer, topic + schedule (interval, ease, reps, lapses, due)
//   users/{uid}/daily/{YYYY-MM-DD} done: [task ids], checkin: { mood, minutes, note }
//   users/{uid}/explorations/{id}  career & project explorer results
import { collection, doc, addDoc, setDoc, deleteDoc, query, where, orderBy, limit, increment } from "firebase/firestore";
import { db, readDoc, readQuery, saveLater, listRecent } from "./firebase";
import { textId, localDateKey } from "./hash";
import { newCard, schedule } from "./srs";

const col = (uid, name) => collection(db, "users", uid, name);
const ref = (uid, name, id) => doc(db, "users", uid, name, id);
const nowIso = () => new Date().toISOString();
const ok = (uid) => Boolean(db && uid);

async function list(uid, name, ...constraints) {
  if (!ok(uid)) return [];
  try {
    const snap = await readQuery(query(col(uid, name), ...constraints));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`Load ${name} failed:`, err);
    return [];
  }
}

// ── Mistake notebook ──
// options: [{ id: "A", text }]. Saving the same question again counts it as another miss.
export function saveMistake(uid, { question, options, correct, chosen, explanation, topic, confidence = null }) {
  if (!ok(uid) || !question) return;
  saveLater(setDoc(ref(uid, "mistakes", textId(question, "m")), {
    question,
    options: options.map((o) => ({ id: o.id, text: o.text })),
    correct,
    chosen,
    explanation: explanation || "",
    topic: topic || "General",
    wrong_count: increment(1),
    mastered: false,
    // "Sure but wrong" mistakes are fixed first (hypercorrection effect)
    confident: confidence === "sure",
    confidence: confidence || null,
    last_wrong: nowIso(),
  }, { merge: true }), "Save mistake");
}

export const getMistakes = (uid) => list(uid, "mistakes", orderBy("last_wrong", "desc"), limit(200));

export function markMistake(uid, id, correctNow) {
  if (!ok(uid)) return;
  saveLater(setDoc(ref(uid, "mistakes", id), correctNow
    ? { mastered: true, mastered_at: nowIso() }
    : { mastered: false, wrong_count: increment(1), last_wrong: nowIso() }, { merge: true }), "Update mistake");
}

export function deleteMistake(uid, id) {
  if (ok(uid)) saveLater(deleteDoc(ref(uid, "mistakes", id)), "Delete mistake");
}

// ── Confidence check ──
// users/{uid}/confidence/{id}: { topic, confidence: guess|unsure|sure, correct, source, created_at }
export function saveConfidence(uid, { topic, confidence, correct, source = "quiz" }) {
  if (!ok(uid) || !confidence) return;
  saveLater(addDoc(col(uid, "confidence"), { topic: topic || "General", confidence, correct: !!correct, source, created_at: nowIso() }), "Save confidence");
}

export const getConfidenceRecords = (uid, max = 300) => list(uid, "confidence", orderBy("created_at", "desc"), limit(max));

// ── Answer-writing coach ──
// users/{uid}/answers/{id}: question, marks, board, topic, attempts[], model_answer, created_at
export function newAnswerId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 20); // random id, works offline
}

export function saveAnswer(uid, id, data) {
  if (ok(uid)) saveLater(setDoc(ref(uid, "answers", id), { ...data, updated_at: nowIso() }, { merge: true }), "Save answer");
}

export const getAnswers = (uid, max = 30) => list(uid, "answers", orderBy("created_at", "desc"), limit(max));

// ── Focus & distraction tracker (private to the student) ──
// users/{uid}/focus/{id}: task, planned_min, actual_min, completed, leaves, away_sec, leave_tags, rating, pulled, created_at
export function saveFocusSession(uid, data) {
  if (ok(uid)) saveLater(addDoc(col(uid, "focus"), { ...data, created_at: nowIso() }), "Save focus session");
}

export const getFocusSessions = (uid, max = 60) => list(uid, "focus", orderBy("created_at", "desc"), limit(max));

// ── Flashcard deck (spaced repetition) ──
// Adds cards from a study kit. Cards already in the deck keep their schedule.
export async function addCardsToDeck(uid, cards, topic) {
  if (!ok(uid) || !Array.isArray(cards)) return 0;
  const existing = new Set((await list(uid, "cards", limit(1000))).map((c) => c.id));
  let added = 0;
  cards.forEach((c) => {
    if (!c?.question || !c?.answer) return;
    const id = textId(c.question, "c");
    if (existing.has(id)) return;
    added++;
    saveLater(setDoc(ref(uid, "cards", id), {
      question: c.question, answer: c.answer, topic: topic || c.topic || "General",
      ...newCard(), created_at: nowIso(),
    }), "Add card");
  });
  return added;
}

export const getDueCards = (uid, max = 50) => list(uid, "cards", where("due", "<=", nowIso()), orderBy("due", "asc"), limit(max));
export const getDeck = (uid) => list(uid, "cards", orderBy("due", "asc"), limit(1000));

export function rateCard(uid, card, rating) {
  const next = schedule(card, rating);
  if (ok(uid)) saveLater(setDoc(ref(uid, "cards", card.id), next, { merge: true }), "Save review");
  return next;
}

// Used by the Flashcards page: rate a card from a study kit by its text.
export async function rateCardByText(uid, question, rating) {
  if (!ok(uid) || !question) return;
  const id = textId(question, "c");
  try {
    const snap = await readDoc(ref(uid, "cards", id), 4000);
    if (snap.exists()) rateCard(uid, { id, ...snap.data() }, rating);
  } catch { /* card not in the deck: nothing to schedule */ }
}

// ── Today plan + check-in ──
export async function getDay(uid, date = new Date()) {
  if (!ok(uid)) return null;
  try {
    const snap = await readDoc(ref(uid, "daily", localDateKey(date)));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export function saveDay(uid, data, date = new Date()) {
  if (ok(uid)) saveLater(setDoc(ref(uid, "daily", localDateKey(date)), { ...data, date: localDateKey(date), updated_at: nowIso() }, { merge: true }), "Save day");
}

export const getRecentCheckins = async (uid, max = 5) =>
  (await list(uid, "daily", orderBy("date", "desc"), limit(14))).filter((d) => d.checkin).slice(0, max);

// ── Career & project explorer ──
export function saveExploration(uid, topic, result) {
  const id = textId(topic, "x");
  if (ok(uid)) saveLater(setDoc(ref(uid, "explorations", id), { topic, ...result, created_at: nowIso() }), "Save exploration");
  return id;
}

export const getExplorations = (uid) => list(uid, "explorations", orderBy("created_at", "desc"), limit(30));

export function deleteExploration(uid, id) {
  if (ok(uid)) saveLater(deleteDoc(ref(uid, "explorations", id)), "Delete exploration");
}

// ── Summary used by the dashboard plan and the mentor ──
export async function getLearningSnapshot(uid) {
  const [due, mistakes, checkins] = await Promise.all([getDueCards(uid, 100), getMistakes(uid), getRecentCheckins(uid, 3)]);
  const open = mistakes.filter((m) => !m.mastered);
  const byTopic = {};
  open.forEach((m) => { byTopic[m.topic] = (byTopic[m.topic] || 0) + 1; });
  const mistakeTopics = Object.entries(byTopic).sort((a, b) => b[1] - a[1]).map(([topic, count]) => ({ topic, count }));
  return { dueCards: due.length, openMistakes: open.length, mistakeTopics, checkins };
}

// ── Habit & behaviour coach ──
// All study activity as simple events for the behaviour report (last ~4 weeks).
export async function getActivityEvents(uid) {
  if (!ok(uid)) return [];
  const safe = (p) => p.catch(() => []);
  const [sessions, scores, deck, focus, answers] = await Promise.all([
    safe(listRecent(uid, "study_sessions", { days: 30 })),
    safe(listRecent(uid, "quiz_scores", { days: 30 })),
    getDeck(uid),
    getFocusSessions(uid, 100),
    getAnswers(uid, 50),
  ]);
  return [
    ...sessions.map((s) => ({ at: s.created_at, kind: "session" })),
    ...scores.map((s) => ({ at: s.created_at, kind: "quiz" })),
    ...deck.filter((c) => c.last_reviewed).map((c) => ({ at: c.last_reviewed, kind: "review" })),
    ...focus.map((f) => ({ at: f.created_at, kind: "focus", minutes: f.actual_min })),
    ...answers.map((a) => ({ at: a.created_at, kind: "answer" })),
  ].filter((e) => e.at);
}

// ── "Bad test day" debriefs ──
export function saveDebrief(uid, data) {
  if (ok(uid)) saveLater(addDoc(col(uid, "debriefs"), { ...data, created_at: nowIso() }), "Save debrief");
}
export const getDebriefs = (uid, max = 10) => list(uid, "debriefs", orderBy("created_at", "desc"), limit(max));

// ── Weekly numbers for the family digest (last 7 days) ──
export async function getWeekStats(uid) {
  const DAY = 86400000;
  const recent = (iso) => iso && Date.now() - new Date(iso) < 7 * DAY;
  const safe = (p) => p.catch(() => []);
  const [sessions, scores, mistakes, focus, answers] = await Promise.all([
    safe(listRecent(uid, "study_sessions", { days: 7 })),
    safe(listRecent(uid, "quiz_scores", { days: 14 })),
    getMistakes(uid),
    getFocusSessions(uid, 50),
    getAnswers(uid, 30),
  ]);
  const weekFocus = focus.filter((f) => recent(f.created_at));
  const weekAnswers = answers.filter((a) => recent(a.created_at));
  return {
    sessions,
    scores,
    topics: [...new Set(sessions.map((s) => s.topic).filter((t) => t && t.length < 50))],
    mistakesFixed: mistakes.filter((m) => m.mastered && recent(m.mastered_at)).length,
    focusMinutes: weekFocus.reduce((a, f) => a + (f.actual_min || 0), 0),
    focusSessions: weekFocus.length,
    answers: {
      count: weekAnswers.length,
      improved: weekAnswers.filter((a) => (a.attempts?.length || 0) > 1 && a.attempts.at(-1).overall > a.attempts[0].overall).length,
    },
  };
}
