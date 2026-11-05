// src/utils/yourWorld.js
// Your-world problems: practice questions retold in a world the student CHOSE (cricket, music,
// coding...). Research: personalising problems to real interests raised interest and sped up
// mastery; relevance written by the student raised interest and grades for low-expectancy students.
// Guardrails:
// - Interests are picked by the student, never inferred from behaviour (also avoids DPDP profiling).
// - Only the question STEM is retold; the options and the correct answer stay exactly the same.
// - Every number in the original stem must survive the rewrite, or we keep the original.
// - The student can always see the original question.

export const INTERESTS = [
  { id: "cricket",  label: "Cricket",        emoji: "🏏" },
  { id: "football", label: "Football",       emoji: "⚽" },
  { id: "music",    label: "Music",          emoji: "🎵" },
  { id: "movies",   label: "Movies",         emoji: "🎬" },
  { id: "gaming",   label: "Gaming",         emoji: "🎮" },
  { id: "coding",   label: "Coding",         emoji: "💻" },
  { id: "cooking",  label: "Cooking",        emoji: "🍳" },
  { id: "farming",  label: "Farming",        emoji: "🌾" },
  { id: "business", label: "Business & money", emoji: "💰" },
  { id: "space",    label: "Space",          emoji: "🚀" },
  { id: "fashion",  label: "Fashion",        emoji: "👗" },
  { id: "fitness",  label: "Fitness",        emoji: "🏋️" },
];
export const MAX_INTERESTS = 3;
export const interestById = (id) => INTERESTS.find((i) => i.id === id);

// All numbers in a text, normalised ("1,200" -> "1200", "2.50" -> "2.5").
export function numbersIn(text) {
  const found = String(text || "").match(/\d[\d,]*(?:\.\d+)?/g) || [];
  return found.map((n) => String(Number(n.replace(/,/g, ""))));
}

// True if every number in the original also appears in the rewrite (as many times).
export function numbersPreserved(original, rewritten) {
  const left = numbersIn(rewritten);
  for (const n of numbersIn(original)) {
    const i = left.indexOf(n);
    if (i === -1) return false;
    left.splice(i, 1);
  }
  return true;
}

/**
 * Attach a checked "world" stem to each question. Anything that fails a check keeps the original.
 * @returns {{ questions: Array, kept: number }} kept = how many were safely rewritten
 */
export function applyWorldStems(questions, stems, interestId) {
  let kept = 0;
  const out = questions.map((q, i) => {
    const stem = typeof stems?.[i] === "string" ? stems[i].trim() : "";
    const ok = stem.length >= 10 && stem.length <= 600 && stem !== q.question && numbersPreserved(q.question, stem);
    if (!ok) return { ...q, world_question: null, world: null };
    kept++;
    return { ...q, world_question: stem, world: interestId };
  });
  return { questions: out, kept };
}

// ── AI call (browser only) ──
export async function worldify(questions, interestId, topic = "") {
  const interest = interestById(interestId);
  if (!interest) throw new Error("Pick an interest first.");
  const { groqFetch, aiErrorMessage } = await import("./claudeAPI");
  const list = questions.map((q, i) => {
    const opts = (Array.isArray(q.options) ? q.options : Object.entries(q.options || {}).map(([id, text]) => ({ id, text })))
      .map((o) => `${o.id}) ${o.text}`).join(" | ");
    return `${i + 1}. ${q.question}\n   Options (do not change): ${opts}\n   Correct: ${q.correct}`;
  }).join("\n");
  const response = await groqFetch({
    temperature: 0.4,
    max_tokens: 1500,
    messages: [
      { role: "system", content: "You retell exam questions in a student's chosen interest so they feel real. Reply with JSON only." },
      {
        role: "user",
        content: `Topic: ${topic || "general"}. Student's chosen interest: ${interest.label}.
Rewrite ONLY the question text of each item below into a short, realistic ${interest.label} situation.
Rules:
- Ask exactly the same thing. The options and the correct answer must stay correct without any change.
- Keep every number exactly as written, with the same units. Do not add or change numbers.
- Use realistic, respectful details. No real people's names. Keep it under 60 words.
- If an item cannot be retold without changing its meaning, return it unchanged.
Items:
${list}
Reply as: {"stems": ["...", "..."]} with exactly ${questions.length} strings in the same order.`,
      },
    ],
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(aiErrorMessage(response.status, data));
  const text = data?.choices?.[0]?.message?.content || "";
  let parsed = null;
  try { parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0]); } catch { /* handled below */ }
  if (!Array.isArray(parsed?.stems)) throw new Error("Could not retell these questions. Please try again.");
  return applyWorldStems(questions, parsed.stems, interestId);
}
