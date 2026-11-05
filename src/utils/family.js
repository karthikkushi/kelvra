// src/utils/family.js
// Student-controlled family digest. Research rules this follows:
// - Parents learn most when teens CHOOSE to share (disclosure), not from monitoring.
// - Lead with effort and strategy; scores only if the student opts in, never a rank.
// - Give parents conversation prompts (talking about goals/plans helps; nagging and pressure harm).
// - Never share mood, chat, raw logs or location. The student sends it themselves (WhatsApp/copy).
// Pure functions: tested in logic.test.js.

export const SHARE_ITEMS = [
  { id: "days",     label: "How many days I studied",        defaultOn: true },
  { id: "focus",    label: "Focus minutes",                  defaultOn: true },
  { id: "topics",   label: "Topics I worked on",             defaultOn: true },
  { id: "mistakes", label: "Mistakes I fixed",               defaultOn: true },
  { id: "habit",    label: "My habit experiment",            defaultOn: false },
  { id: "answers",  label: "Answer-writing practice",        defaultOn: false },
  { id: "scores",   label: "Quiz score trend (no marks list)", defaultOn: false },
];

export const defaultShare = () => Object.fromEntries(SHARE_ITEMS.map((i) => [i.id, i.defaultOn]));

const T = {
  en: {
    hello: (name) => `Hi! Here is ${name}'s study week on Kelvra.`,
    days: (n) => `📅 Studied on ${n} of the last 7 days.`,
    focus: (m, s) => `⏱️ ${m} minutes of focused study in ${s} session${s === 1 ? "" : "s"}.`,
    topics: (t) => `📚 Worked on: ${t}.`,
    mistakes: (n) => `✅ Fixed ${n} past mistake${n === 1 ? "" : "s"} by retesting them.`,
    habit: (sentence, d, of) => (d > 0 ? `🌱 Habit experiment: "${sentence}" (done ${d} of ${of} days).` : `🌱 Trying a new habit this week: "${sentence}"`),
    answers: (n, better) => `✍️ Practised ${n} full exam answer${n === 1 ? "" : "s"}${better ? `, and improved ${better} after rewriting` : ""}.`,
    scores: (trend) => `📈 Quiz scores are ${trend} this week.`,
    trend: { up: "going up", steady: "steady", down: "a bit lower (working on it)" },
    note: (n) => `💬 A note from me: ${n}`,
    explainer: (t, url) => `📖 A 1-minute read for you: ${t} ${url}`,
    promptsTitle: "One way to talk about it:",
    footer: "Sent by me from Kelvra. I chose what to share.",
    paused: "",
  },
  hi: {
    hello: (name) => `नमस्ते! Kelvra पर ${name} का इस हफ़्ते का पढ़ाई का हाल।`,
    days: (n) => `📅 पिछले 7 में से ${n} दिन पढ़ाई की।`,
    focus: (m, s) => `⏱️ ${s} सेशन में ${m} मिनट ध्यान से पढ़ाई की।`,
    topics: (t) => `📚 इन विषयों पर काम किया: ${t}।`,
    mistakes: (n) => `✅ पुरानी ${n} गलतियाँ दोबारा टेस्ट करके सुधारीं।`,
    habit: (sentence, d, of) => (d > 0 ? `🌱 आदत का प्रयोग: "${sentence}" (${of} में से ${d} दिन किया)।` : `🌱 इस हफ़्ते एक नई आदत आज़मा रहा/रही हूँ: "${sentence}"`),
    answers: (n, better) => `✍️ ${n} पूरे परीक्षा-उत्तर लिखने का अभ्यास किया${better ? `, ${better} उत्तर दोबारा लिखकर बेहतर हुए` : ""}।`,
    scores: (trend) => `📈 इस हफ़्ते क्विज़ के अंक ${trend}।`,
    trend: { up: "बढ़ रहे हैं", steady: "स्थिर हैं", down: "थोड़े कम हैं (मैं इस पर काम कर रहा/रही हूँ)" },
    note: (n) => `💬 मेरी तरफ़ से: ${n}`,
    explainer: (t, url) => `📖 आपके लिए 1 मिनट की जानकारी: ${t} ${url}`,
    promptsTitle: "बात करने का एक तरीका:",
    footer: "यह मैंने Kelvra से भेजा है। क्या बताना है, यह मैंने चुना।",
  },
};

// Conversation prompts: ask about learning and plans, praise effort, never compare or ask about rank.
const PROMPTS = {
  en: {
    steady: "Say: \"You studied on most days this week. That steady effort really counts.\"",
    few: "Ask: \"What would make it easier to study a little each day next week? How can I help?\"",
    mistakes: "Ask: \"Which mistake did you finally understand this week? Can you explain it to me?\"",
    answers: "Ask: \"What did you change when you rewrote your answers?\"",
    general: "Ask: \"What is one thing you understood better this week?\"",
    avoid: "Try to avoid: comparing with others, asking about rank, or only asking about marks.",
  },
  hi: {
    steady: "कहें: \"इस हफ़्ते तुमने ज़्यादातर दिन पढ़ाई की। यह लगातार मेहनत बहुत मायने रखती है।\"",
    few: "पूछें: \"अगले हफ़्ते रोज़ थोड़ा पढ़ना आसान कैसे हो? मैं कैसे मदद करूँ?\"",
    mistakes: "पूछें: \"इस हफ़्ते कौन-सी गलती आख़िरकार समझ आई? मुझे समझाओगे?\"",
    answers: "पूछें: \"उत्तर दोबारा लिखते समय तुमने क्या बदला?\"",
    general: "पूछें: \"इस हफ़्ते कौन-सी एक चीज़ पहले से बेहतर समझ आई?\"",
    avoid: "कोशिश करें: दूसरों से तुलना न करें, रैंक न पूछें, सिर्फ़ अंकों की बात न करें।",
  },
};

/**
 * @param {object} stats { name, activeDays, focusMinutes, focusSessions, topics[], mistakesFixed, habit?{sentence,done,of}, answers?{count,improved}, scoreTrend?: "up"|"steady"|"down" }
 * @param {object} share  { days: bool, focus: bool, ... } chosen by the student
 * @param {"en"|"hi"} lang
 * @param {string} note   optional note from the student
 * @param {{title:{en,hi}, url:string}} [explainer] optional Parent Explainer the student chose to attach
 */
export function buildFamilyDigest(stats, share, lang = "en", note = "", explainer = null) {
  const t = T[lang] || T.en;
  const p = PROMPTS[lang] || PROMPTS.en;
  const lines = [t.hello(stats.name || "my")];
  if (share.days) lines.push(t.days(stats.activeDays || 0));
  if (share.focus && stats.focusSessions) lines.push(t.focus(stats.focusMinutes, stats.focusSessions));
  if (share.topics && stats.topics?.length) lines.push(t.topics(stats.topics.slice(0, 4).join(", ")));
  if (share.mistakes && stats.mistakesFixed) lines.push(t.mistakes(stats.mistakesFixed));
  if (share.habit && stats.habit) lines.push(t.habit(stats.habit.sentence, stats.habit.done, stats.habit.of));
  if (share.answers && stats.answers?.count) lines.push(t.answers(stats.answers.count, stats.answers.improved));
  if (share.scores && stats.scoreTrend && t.trend[stats.scoreTrend]) lines.push(t.scores(t.trend[stats.scoreTrend]));
  if (note.trim()) lines.push(t.note(note.trim().slice(0, 200)));
  if (explainer?.url) lines.push(t.explainer(explainer.title?.[lang] || explainer.title?.en || "", explainer.url));

  const prompts = [];
  if (share.days && stats.activeDays >= 4) prompts.push(p.steady);
  else if (share.days && stats.activeDays <= 2) prompts.push(p.few);
  if (share.mistakes && stats.mistakesFixed) prompts.push(p.mistakes);
  else if (share.answers && stats.answers?.count) prompts.push(p.answers);
  if (prompts.length === 0) prompts.push(p.general);

  const text = [...lines, "", t.promptsTitle, ...prompts.slice(0, 2).map((x) => `• ${x}`), `• ${p.avoid}`, "", t.footer].join("\n");
  return { text, lines, prompts: prompts.slice(0, 2) };
}

export const whatsappLink = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;

// Compare this week's quiz average with last week's (trend only, never marks or rank).
export function scoreTrend(scores, now = new Date()) {
  const DAY = 86400000;
  const avg = (list) => (list.length ? list.reduce((a, s) => a + s.pct, 0) / list.length : null);
  const thisWeek = avg(scores.filter((s) => now - new Date(s.created_at) < 7 * DAY));
  const lastWeek = avg(scores.filter((s) => { const d = now - new Date(s.created_at); return d >= 7 * DAY && d < 14 * DAY; }));
  if (thisWeek == null || lastWeek == null) return null;
  if (thisWeek - lastWeek >= 5) return "up";
  if (lastWeek - thisWeek >= 5) return "down";
  return "steady";
}
