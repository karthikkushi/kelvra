// src/utils/answerCoach.js
// Answer-writing coach. Research rules this follows:
// - Feedback on the task, tied to rubric points, with ONE biggest fix, then a rewrite (feedback d ≈ 0.48).
// - AI scores are only fair-to-moderately reliable, so show bands and a marks RANGE, never exact marks.
// - The AI never writes the student's answer; the model answer appears only after the student's attempts.
// Pure helpers at the top are tested in logic.test.js.

export const CRITERIA = [
  { id: "accuracy",  label: "Accuracy",              hint: "Are the facts and ideas correct?" },
  { id: "keyterms",  label: "Key terms",             hint: "Does it use the words examiners look for?" },
  { id: "structure", label: "Structure",             hint: "Intro, points in order, conclusion; matches the marks." },
  { id: "example",   label: "Example / application", hint: "A diagram, example, formula or real use." },
  { id: "clarity",   label: "Clarity",               hint: "Short sentences, easy to follow, no repetition." },
];

export const BANDS = ["Missing", "Needs work", "Good", "Strong"]; // 0..3

export const BOARDS = ["CBSE", "ICSE", "State board", "University", "UPSC / state PSC", "Other"];
export const MARKS = [2, 3, 5, 10];

// Rough length target: examiners expect about 30 words per mark in Indian board answers.
export const targetWords = (marks) => ({ min: Math.round(marks * 20), max: Math.round(marks * 40) });

export function overallBand(criteria) {
  const vals = CRITERIA.map((c) => criteria?.[c.id]?.band).filter((b) => Number.isInteger(b));
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Criterion that is lowest on average across recent attempts (first attempts only = honest picture).
export function weakestCriterion(history) {
  const sums = {};
  const counts = {};
  for (const h of history || []) {
    const first = h.attempts?.[0]?.criteria;
    if (!first) continue;
    for (const c of CRITERIA) {
      const b = first[c.id]?.band;
      if (!Number.isInteger(b)) continue;
      sums[c.id] = (sums[c.id] || 0) + b;
      counts[c.id] = (counts[c.id] || 0) + 1;
    }
  }
  const avgs = CRITERIA.filter((c) => counts[c.id]).map((c) => ({ ...c, avg: sums[c.id] / counts[c.id] }));
  if (avgs.length === 0) return null;
  return avgs.sort((a, b) => a.avg - b.avg)[0];
}

const FILLERS = ["um", "uh", "umm", "like", "basically", "actually", "you know", "matlab", "na", "toh"];

// Speaking stats for spoken answers. Shown as information only: there is no evidence that
// cutting filler words improves marks, so we never score them.
export function speechStats(transcript, seconds) {
  const text = String(transcript || "").toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const fillers = {};
  for (const f of FILLERS) {
    const n = (text.match(new RegExp(`\\b${f}\\b`, "g")) || []).length;
    if (n) fillers[f] = n;
  }
  const wpm = seconds > 5 ? Math.round(words.length / (seconds / 60)) : null;
  return { words: words.length, wpm, fillers, fillerTotal: Object.values(fillers).reduce((a, b) => a + b, 0) };
}

// Clamp and clean whatever the AI returned, so the UI never breaks on a bad reply.
export function cleanEvaluation(raw, marks) {
  const band = (v) => Math.max(0, Math.min(3, Math.round(Number(v)) || 0));
  const criteria = {};
  for (const c of CRITERIA) {
    const r = raw?.criteria?.[c.id] || {};
    criteria[c.id] = { band: band(r.band), comment: String(r.comment || "").slice(0, 300) };
  }
  let [lo, hi] = Array.isArray(raw?.marks_range) ? raw.marks_range.map(Number) : [0, 0];
  lo = Math.max(0, Math.min(marks, Number.isFinite(lo) ? lo : 0));
  hi = Math.max(lo, Math.min(marks, Number.isFinite(hi) ? hi : lo));
  return {
    criteria,
    overall: overallBand(criteria),
    strength: String(raw?.strength || "").slice(0, 300),
    biggest_fix: String(raw?.biggest_fix || "").slice(0, 400),
    missing_points: (Array.isArray(raw?.missing_points) ? raw.missing_points : []).map(String).slice(0, 5),
    marks_range: [Math.round(lo * 2) / 2, Math.round(hi * 2) / 2],
    certainty: ["low", "medium", "high"].includes(raw?.certainty) ? raw.certainty : "medium",
  };
}

// ── AI calls (browser only) ──
async function ai(messages, maxTokens) {
  const { groqFetch, aiErrorMessage } = await import("./claudeAPI");
  const response = await groqFetch({ messages, temperature: 0.2, max_tokens: maxTokens });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(aiErrorMessage(response.status, data));
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("The AI sent back an empty answer. Please try again.");
  return text;
}

function parseJSON(text) {
  const m = text.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m?.[0]); } catch { return null; }
}

export async function evaluateAnswer({ question, marks, board, answer, previous }) {
  const text = await ai([
    {
      role: "system",
      content: `You are a fair, encouraging ${board} examiner coaching a student. Reply with JSON only.
Rules:
- Judge the ANSWER, never the person. Be specific and kind.
- Do NOT write or rewrite the student's answer, and do not give a full model answer. Point to what to add or change.
- Score each criterion as a band: 0 Missing, 1 Needs work, 2 Good, 3 Strong.
- Give marks as an approximate range for a ${marks}-mark question. If the question is vague or outside your knowledge, set certainty "low".
- missing_points: up to 4 points a good answer would include, phrased as short hints/questions ("Did you mention ...?"), not full sentences of the answer.`,
    },
    {
      role: "user",
      content: `Question (${marks} marks): ${question}
${previous ? `This is a REWRITE. Earlier feedback's biggest fix was: "${previous.biggest_fix}". Say in "strength" what improved, if anything.\n` : ""}Student answer:
"""${answer}"""

Reply exactly as:
{"criteria":{"accuracy":{"band":0-3,"comment":"..."},"keyterms":{...},"structure":{...},"example":{...},"clarity":{...}},
"strength":"one thing done well","biggest_fix":"the ONE change that would gain the most marks","missing_points":["..."],
"marks_range":[low,high],"certainty":"low|medium|high"}`,
    },
  ], 1200);
  const parsed = parseJSON(text);
  if (!parsed?.criteria) throw new Error("Could not read the feedback. Please try again.");
  return cleanEvaluation(parsed, marks);
}

export async function getModelAnswer({ question, marks, board }) {
  return (await ai([
    { role: "system", content: `You are an expert ${board} teacher. Write a model answer a top student could write in the exam. Use the structure examiners expect. Plain text with short headings or "- " points.` },
    { role: "user", content: `Question (${marks} marks, about ${targetWords(marks).max} words max): ${question}` },
  ], 900)).trim();
}

export async function suggestQuestion({ topic, marks, board }) {
  return (await ai([
    { role: "system", content: "You write realistic exam questions. Reply with the question only, one line, no answer." },
    { role: "user", content: `Write one ${marks}-mark ${board}-style descriptive question on: ${topic}` },
  ], 120)).trim().replace(/^["']|["']$/g, "");
}
