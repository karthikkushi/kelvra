// src/utils/plotTwist.js
// Plot Twist mode. Research basis (see reports/Kelvra unique curiosity features.md):
// - Guessing BEFORE studying improves learning of that material (meta-analysis g ≈ 0.54; 0.65 when
//   the student produces an answer).
// - Errors made with high confidence are corrected best after feedback ("hypercorrection"), and the
//   surprise predicts later exploring. So "Sure but wrong" gets a special reveal and comes back
//   later the same session and the next day.
// Guardrails: guesses never count toward scores or XP; never call a student "overconfident".
// Pure functions: tested in logic.test.js.
import { localDateKey } from "./hash.js";

export const GUESS_INTRO =
  "Guess first. Wrong guesses are fine: trying before you study helps you remember the right answer better. These don't count toward any score.";

const valid = (q) => q && q.question && q.correct && Array.isArray(q.options) && q.options.length >= 2;

// Up to n questions spread evenly across the quiz (deterministic, so the same kit gives the same guesses).
export function pickGuessQuestions(questions, n = 3) {
  const pool = (questions || []).filter(valid);
  if (pool.length <= n) return pool;
  const step = pool.length / n;
  return Array.from({ length: n }, (_, i) => pool[Math.floor(i * step)]);
}

export const isPlotTwist = (confidence, correct) => confidence === "sure" && !correct;

// The day a plot twist comes back (tomorrow, in the student's own time zone).
export function twistDueKey(now = new Date()) {
  return localDateKey(new Date(now.getTime() + 86400000));
}

// Open plot twists whose replay day has come.
export function twistsDue(mistakes, now = new Date()) {
  const today = localDateKey(now);
  return (mistakes || []).filter((m) => m.confident && !m.mastered && m.twist_due && m.twist_due <= today);
}

// Brag-safe growth stat: plot twists fixed in the last 7 days.
export function twistsFixedThisWeek(mistakes, now = new Date()) {
  return (mistakes || []).filter((m) => m.confident && m.mastered && m.mastered_at && now - new Date(m.mastered_at) < 7 * 86400000).length;
}

// Options shown in a fresh order on replay, so the student can't just remember the position.
export function shuffledOptions(options, seed = Date.now()) {
  const a = [...options];
  let x = seed % 2147483647 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 48271) % 2147483647;
    const j = x % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Study-kit quizzes store options as { A: "text", ... }; the screens need [{ id, text }].
export function normalizeQuestion(q) {
  if (!q) return q;
  return {
    ...q,
    options: Array.isArray(q.options) ? q.options : Object.entries(q.options || {}).map(([id, text]) => ({ id, text })),
  };
}
