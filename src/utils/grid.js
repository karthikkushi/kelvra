// src/utils/grid.js
// Daily Grid: one shared 5-question puzzle per track per day ("Wordle for your syllabus").
// Research basis: Wordle's same-puzzle-for-everyone + spoiler-free emoji grid; retrieval practice.
// Guardrails: no ranks or leaderboards for under-18s, "X of last 7 days" (never a lost streak),
// crowd results as percentages only, one puzzle a day with an end screen, labelled as practice.
// Pure functions: tested in logic.test.js.

export const TRACKS = [
  { id: "cbse10", label: "CBSE Class 10", short: "CBSE 10" },
  { id: "cbse12", label: "CBSE Class 12", short: "CBSE 12" },
  { id: "jee",    label: "JEE",           short: "JEE" },
  { id: "neet",   label: "NEET",          short: "NEET" },
  { id: "cuet",   label: "CUET",          short: "CUET" },
];
export const trackById = (id) => TRACKS.find((t) => t.id === id) || null;

// Puzzle #1 is 1 Nov 2026 (India time). The grid changes at midnight India time for everyone.
export const GRID_EPOCH = "2026-11-01";
const DAY = 86400000;

export function istDateKey(now = Date.now()) {
  return new Date(Number(now) + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

export function puzzleNumber(now = Date.now()) {
  const days = Math.round((Date.parse(`${istDateKey(now)}T00:00:00Z`) - Date.parse(`${GRID_EPOCH}T00:00:00Z`)) / DAY);
  return Math.max(1, days + 1);
}

// Milliseconds until the next puzzle (midnight India time).
export function msUntilNextPuzzle(now = Date.now()) {
  const nextMidnightIst = Date.parse(`${istDateKey(now)}T00:00:00Z`) + DAY - 5.5 * 3600 * 1000;
  return Math.max(0, nextMidnightIst - Number(now));
}

export const puzzleKey = (track, n) => `${track}-${n}`;

export function puzzleFor(bank, track, n) {
  const list = bank?.[track];
  if (!Array.isArray(list) || !list.length) return null;
  return list[(n - 1) % list.length];
}

// 🟩 right and sure · 🟨 right but guessed/unsure · ⬛ wrong. Gives nothing away.
export function emojiRow(results) {
  return (results || []).map((r) => (r.right ? (r.confidence === "sure" ? "🟩" : "🟨") : "⬛")).join("");
}

export function shareText(track, n, results, url) {
  const t = trackById(track);
  const score = (results || []).filter((r) => r.right).length;
  return `Kelvra ${t ? t.short : track} #${n} ${score}/${(results || []).length}\n${emojiRow(results)}${url ? `\nPlay today's grid: ${url}` : ""}`;
}

// Percent of players who picked each option (rounded). Counts come from grid_stats.
export function optionShares(stat, optionIds = ["A", "B", "C", "D"]) {
  const total = Number(stat?.total) || 0;
  return Object.fromEntries(optionIds.map((id) => [id, total ? Math.round(((Number(stat?.[id]) || 0) / total) * 100) : 0]));
}

// The wrong option most players fell for, if anyone fell for one.
export function commonTrap(stat, correct, optionIds = ["A", "B", "C", "D"]) {
  let best = null;
  for (const id of optionIds) {
    if (id === correct) continue;
    const n = Number(stat?.[id]) || 0;
    if (n > 0 && (!best || n > best.count)) best = { id, count: n };
  }
  return best ? best.id : null;
}

// Forgiving consistency: how many of the last 7 puzzles (including today's) were played.
export function daysPlayedLast7(playedNumbers, today) {
  const set = new Set((playedNumbers || []).map(Number));
  let c = 0;
  for (let n = today; n > today - 7; n--) if (set.has(n)) c++;
  return c;
}

// Basic shape check for a puzzle in the bank.
export function validPuzzle(p) {
  return Boolean(p && Array.isArray(p.questions) && p.questions.length === 5 && p.questions.every((q) =>
    q.q && q.why && q.subject && q.options && ["A", "B", "C", "D"].every((k) => typeof q.options[k] === "string" && q.options[k].trim()) &&
    ["A", "B", "C", "D"].includes(q.answer) && new Set(Object.values(q.options)).size === 4));
}
