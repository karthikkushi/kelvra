// src/utils/debrief.js
// "Bad test day" debrief: turn a disappointing test into causes and ONE fix, not a fight.
// Research: task-focused feedback helps; pressure/psychological control from parents harms;
// praising effort and strategy beats praising ability. Pure functions: tested in logic.test.js.

export const REASONS = [
  { id: "concept",  label: "Didn't understand a concept", icon: "psychology_alt",
    fix: { cue: "I start studying this week", action: "re-learn one weak concept with the AI Tutor, then make a 5-question quiz on it" } },
  { id: "careless", label: "Careless slips (units, signs, misread)", icon: "error",
    fix: { cue: "I finish a question in a test", action: "spend 10 seconds checking units, signs and what was asked" } },
  { id: "time",     label: "Ran out of time", icon: "timer_off",
    fix: { cue: "I start a practice paper", action: "set a timer and move on from any question after 2 minutes" } },
  { id: "nerves",   label: "Nerves / blanked out", icon: "sentiment_stressed",
    fix: { cue: "I sit down for a test", action: "take 3 slow breaths and remind myself my racing heart is my body getting ready" } },
  { id: "revision", label: "Didn't revise enough / forgot", icon: "history",
    fix: { cue: "I finish dinner", action: "review my due flashcards for 10 minutes" } },
  { id: "unknown",  label: "Questions I'd never seen", icon: "help",
    fix: { cue: "I plan my week", action: "do one past-paper question from a chapter I haven't practised" } },
];

export const AMOUNTS = [
  { v: 0, label: "None" },
  { v: 1, label: "Some" },
  { v: 2, label: "A lot" },
];

/** @param {Record<string, 0|1|2>} amounts */
export function topReason(amounts) {
  const ranked = REASONS.map((r) => ({ ...r, amount: amounts?.[r.id] || 0 })).filter((r) => r.amount > 0).sort((a, b) => b.amount - a.amount);
  return ranked[0] || null;
}

const PARENT_SCRIPT = {
  en: (test, learned, fix) => [
    `My ${test} didn't go the way I wanted.`,
    learned ? `What I learned: ${learned}` : null,
    fix ? `My plan for next time: ${fix}` : null,
    "",
    "What helps me most right now:",
    "• Ask me what I learned from it, not just the marks.",
    "• Notice the effort I'm putting in.",
    "• Please don't compare me with others.",
    "",
    "Sent from Kelvra.",
  ],
  hi: (test, learned, fix) => [
    `मेरा ${test} वैसा नहीं गया जैसा मैं चाहता/चाहती था/थी।`,
    learned ? `मैंने क्या सीखा: ${learned}` : null,
    fix ? `अगली बार के लिए मेरी योजना: ${fix}` : null,
    "",
    "अभी मुझे सबसे ज़्यादा मदद इससे मिलेगी:",
    "• मुझसे पूछें कि मैंने इससे क्या सीखा, सिर्फ़ अंक नहीं।",
    "• मेरी मेहनत पर ध्यान दें।",
    "• कृपया मेरी तुलना दूसरों से न करें।",
    "",
    "Kelvra से भेजा गया।",
  ],
};

export function parentMessage({ test, learned, fix, lang = "en" }) {
  return (PARENT_SCRIPT[lang] || PARENT_SCRIPT.en)(test || "test", (learned || "").trim(), (fix || "").trim())
    .filter((l) => l !== null).join("\n");
}

// Tips shown TO PARENTS inside the app's parent guide (also used in the debrief share).
export const PARENT_TIPS = [
  "Ask what they learned from the test before asking about marks.",
  "Praise the effort and the plan (\"You worked out why you lost marks, that's smart\"), not \"you're so clever\".",
  "Never compare with siblings, cousins or classmates.",
  "Help with structure (quiet time, sleep, food), not by checking every task.",
  "If your child seems hopeless or talks about not wanting to live, stay with them and call Tele-MANAS 14416.",
];
