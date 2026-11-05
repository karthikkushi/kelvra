// src/utils/forecast.js
// Exam forecast numbers, shown honestly: a RANGE with its assumptions instead of one exact
// "readiness %" or "predicted grade" (false precision makes students and parents treat a guess
// as a promise). Pure functions: tested in logic.test.js.
import { localDateKey } from "./hash.js";

const GRADES = [
  { min: 90, label: "A+" },
  { min: 80, label: "A" },
  { min: 70, label: "B+" },
  { min: 60, label: "B" },
  { min: 50, label: "C" },
  { min: 0,  label: "below C" },
];

export const gradeFor = (pct) => GRADES.find((g) => pct >= g.min).label;

/**
 * @param {Array<{pct:number}>} scores newest first
 * @returns {null | { center, low, high, n, gradeLow, gradeHigh, note }}
 */
export function readinessRange(scores) {
  const pcts = (scores || []).map((s) => Number(s.pct)).filter((p) => Number.isFinite(p));
  const n = pcts.length;
  if (n < 3) return null;

  // Recent quizzes count more (same weighting as before), but we report the uncertainty too.
  let weighted = 0, weights = 0;
  pcts.forEach((p, i) => { const w = 1 / (i + 1); weighted += p * w; weights += w; });
  const center = Math.round(weighted / weights);

  const mean = pcts.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(pcts.reduce((a, p) => a + (p - mean) ** 2, 0) / (n - 1));
  const margin = Math.max(5, Math.round((1.96 * sd) / Math.sqrt(n)));
  const low = Math.max(0, center - margin);
  const high = Math.min(100, center + margin);

  return {
    center, low, high, n,
    gradeLow: gradeFor(low),
    gradeHigh: gradeFor(high),
    note: `Based on your last ${n} quiz scores in Kelvra. It assumes the real exam is like these quizzes. More quizzes make the range narrower. This is not an official prediction.`,
  };
}

// Days studied in the last 7 days (forgiving, unlike a streak that breaks after one missed day).
export function daysStudiedLast7(dates, now = new Date()) {
  const keys = new Set((dates || []).filter(Boolean).map((d) => localDateKey(new Date(d))));
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (keys.has(localDateKey(new Date(now.getTime() - i * 86400000)))) count++;
  }
  return count;
}
