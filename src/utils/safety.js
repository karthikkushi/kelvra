// src/utils/safety.js
// Crisis safety for the AI mentor, tutor and check-ins.
// If a student writes something that sounds like self-harm or suicide, Kelvra stops tutoring,
// does NOT send the text to the AI and does NOT save it, and shows real help right away.
// The AI also gets the same instruction as a backup (see SAFETY_RULES), because no word list is complete.
// Pure functions: tested in safety.test.js.

export const HELPLINES = [
  { name: "Tele-MANAS (free, 24x7, 20+ languages)", number: "14416", tel: "14416" },
  { name: "Tele-MANAS toll-free", number: "1-800-891-4416", tel: "18008914416" },
  { name: "Emergency", number: "112", tel: "112" },
];

// Phrases, not single words, so "this chapter is killing me" or "I died laughing" do not trigger.
// English + Hindi/Hinglish (Latin script) + Hindi (Devanagari).
const PATTERNS = [
  /\bkill(ing)?\s+my\s*self\b/i,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/i,
  /\bend\s+it\s+all\b/i,
  /\b(commit|thinking (of|about)|attempt(ed)?)\s+suicide\b/i,
  /\bsuicid(e|al)\b/i,
  /\b(want|wanna|going)\s+to\s+die\b/i,
  /\bi\s+(don'?t|do not)\s+want\s+to\s+(live|be alive|exist)\b/i,
  /\bno\s+(reason|point)\s+(to|in)\s+(live|living)\b/i,
  /\bbetter\s+off\s+(dead|without me)\b/i,
  /\bself[\s-]?harm(ing)?\b/i,
  /\b(cut|cutting|hurt|hurting)\s+my\s*self\b/i,
  /\b(khud\s*khushi|khudkushi|aatm\s*hatya|atmahatya)\b/i,
  /\bmar\s+(jaana|jana|jaunga|jaungi|jaoon|jau)\b/i,
  /\bmarna\s+(chahta|chahti|hai)\b/i,
  /\bjeena\s+nahi\s+(chahta|chahti|hai)\b/i,
  /\bzindagi\s+(khatam|se\s+tang)\b/i,
  /आत्महत्या|खुदकुशी|मर\s*जाना|मरना\s*चाहत|जीना\s*नहीं\s*चाहत/,
];

export function detectCrisis(text) {
  if (!text || typeof text !== "string") return false;
  return PATTERNS.some((p) => p.test(text));
}

// Added to every mentor/tutor system prompt.
export const SAFETY_RULES = `Safety rules (always follow):
- You are an AI study coach, not a person, friend or partner. If asked, say clearly that you are an AI. Never roleplay romance or claim feelings.
- You do not diagnose, give therapy or give medical/medicine advice. For health worries, suggest a doctor, counsellor or trusted adult.
- If the student mentions self-harm, suicide, abuse or wanting to die (in any language): stop tutoring, respond with care in 2-3 short sentences, tell them they deserve support right now, and give these Indian helplines: Tele-MANAS 14416 or 1-800-891-4416 (free, 24x7), emergency 112. Encourage them to tell a trusted adult. Do not continue with study content in that reply.
- Never compare the student to others, never shame marks or rank, never predict exam failure.`;
