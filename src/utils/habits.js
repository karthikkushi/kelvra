// src/utils/habits.js
// Habit & behaviour coach. Research basis:
// - If-then plans ("When X, I will Y") d ≈ 0.65; adding the obstacle + plan B (WOOP / MCII) helps teens practise more.
// - Recorded self-monitoring d ≈ 0.40. Spacing beats cramming.
// - Habits take weeks (median 66 days) and missing a day does not matter, so we count "X of 7 days",
//   never a fragile streak, and never shame a missed day.
// Pure functions: tested in logic.test.js.
import { localDateKey } from "./hash.js";

const DAY = 86400000;

export const TIME_BUCKETS = [
  { id: "morning",   label: "Morning (5am–12pm)",   from: 5,  to: 12 },
  { id: "afternoon", label: "Afternoon (12–5pm)",   from: 12, to: 17 },
  { id: "evening",   label: "Evening (5–10pm)",     from: 17, to: 22 },
  { id: "night",     label: "Late night (10pm–5am)", from: 22, to: 29 },
];

const bucketOf = (date) => {
  const h = date.getHours();
  const hh = h < 5 ? h + 24 : h;
  return TIME_BUCKETS.find((b) => hh >= b.from && hh < b.to).id;
};

/**
 * @param {Array<{at:string, kind:string, minutes?:number}>} events  study activity (sessions, quizzes, reviews, focus, answers)
 */
export function buildBehaviourReport(events, now = new Date()) {
  const inLast = (days) => (events || []).filter((e) => e?.at && now - new Date(e.at) < days * DAY && new Date(e.at) <= now);
  const last7 = inLast(7);
  const last14 = inLast(14);
  const last28 = inLast(28);

  // Days studied in the last 7 days, oldest first (for the dots)
  const keys7 = new Set(last7.map((e) => localDateKey(new Date(e.at))));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * DAY);
    return { date: localDateKey(d), day: d.toLocaleDateString("en-IN", { weekday: "short" }), active: keys7.has(localDateKey(d)) };
  });
  const activeDays = week.filter((d) => d.active).length;

  const buckets = Object.fromEntries(TIME_BUCKETS.map((b) => [b.id, 0]));
  last28.forEach((e) => { buckets[bucketOf(new Date(e.at))]++; });
  const total28 = last28.length;
  const bestTime = total28 ? TIME_BUCKETS.slice().sort((a, b) => buckets[b.id] - buckets[a.id])[0] : null;
  const lateNightShare = total28 ? buckets.night / total28 : 0;

  const perDay14 = {};
  last14.forEach((e) => { const k = localDateKey(new Date(e.at)); perDay14[k] = (perDay14[k] || 0) + 1; });
  const busiest = Math.max(0, ...Object.values(perDay14));
  const crammingShare = last14.length ? busiest / last14.length : 0;

  const focus = last14.filter((e) => e.kind === "focus" && e.minutes);
  const avgFocusMin = focus.length ? Math.round(focus.reduce((a, e) => a + e.minutes, 0) / focus.length) : null;

  const patterns = [];
  if (total28 >= 6 && lateNightShare >= 0.3) {
    patterns.push({ id: "late_night", tone: "watch", title: "A lot of late-night study",
      detail: `${Math.round(lateNightShare * 100)}% of your study in the last 4 weeks was after 10pm. Sleep is when memory gets saved, so late nights can undo the work.` });
  }
  if (last14.length >= 6 && crammingShare >= 0.5) {
    patterns.push({ id: "cramming", tone: "watch", title: "Study comes in one big burst",
      detail: `${Math.round(crammingShare * 100)}% of the last 2 weeks happened on a single day. The same hours spread over 4–5 days are remembered much better.` });
  }
  if (activeDays <= 2) {
    patterns.push({ id: "few_days", tone: "watch", title: activeDays === 0 ? "No study logged this week" : `Studied on ${activeDays} of the last 7 days`,
      detail: "Short, frequent sessions beat rare long ones. Even 15 minutes counts." });
  }
  if (avgFocusMin != null && focus.length >= 3 && avgFocusMin < 15) {
    patterns.push({ id: "short_sessions", tone: "watch", title: "Focus sessions end early",
      detail: `Your focus sessions last about ${avgFocusMin} minutes. Try a smaller first task so starting feels easy.` });
  }
  if (activeDays >= 5) {
    patterns.push({ id: "steady", tone: "good", title: `Steady: ${activeDays} of 7 days`, detail: "Consistency is the habit that matters most. Keep it light so it lasts." });
  }
  if (bestTime && bestTime.id !== "night" && total28 >= 6) {
    patterns.push({ id: "best_time", tone: "good", title: `You study most in the ${bestTime.label.split(" (")[0].toLowerCase()}`,
      detail: "Put your hardest topic in that slot." });
  }

  return { activeDays, week, buckets, bestTime, lateNightShare, crammingShare, avgFocusMin, patterns, total28 };
}

// Ready-made if-then plans, picked to fit the patterns found.
const LIBRARY = {
  late_night:     { cue: "it is 10:30 pm", action: "put my phone on charge outside my room and stop studying", why: "Protects sleep, which locks in what you studied." },
  cramming:       { cue: "I finish dinner on a school day", action: "review my due flashcards for 10 minutes", why: "Spreads study across the week instead of one big day." },
  few_days:       { cue: "I sit down at my desk after school or college", action: "do one 15-minute task from today's plan", why: "A tiny daily start builds the habit; the rest follows." },
  short_sessions: { cue: "I start a focus session", action: "write the one small thing I will finish before the timer ends", why: "A clear, small target makes it easier to keep going." },
  phone:          { cue: "I press Start on the focus timer", action: "put my phone in another room", why: "Removes the most common pull away." },
  mistakes:       { cue: "I get a question wrong", action: "write one line on why, in my own words, before moving on", why: "Turns mistakes into learning." },
  default:        { cue: "I open Kelvra in the evening", action: "check today's plan and finish the first task", why: "One clear first step every day." },
};

export function suggestExperiments(report, { topDistraction } = {}) {
  const ids = report.patterns.filter((p) => p.tone === "watch").map((p) => p.id);
  if (topDistraction === "phone" || topDistraction === "social") ids.push("phone");
  ids.push("mistakes", "default");
  return [...new Set(ids)].filter((id) => LIBRARY[id]).slice(0, 3).map((id) => ({ id, ...LIBRARY[id] }));
}

// How many days this week (Sun–Sat, local) the student did their if-then plan.
export function experimentProgress(experiment, now = new Date()) {
  if (!experiment) return { doneThisWeek: 0, doneToday: false, daysSoFar: 0 };
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: now.getDay() + 1 }, (_, i) => localDateKey(new Date(start.getTime() + i * DAY)));
  const done = new Set(experiment.days_done || []);
  return {
    doneThisWeek: days.filter((d) => done.has(d)).length,
    doneToday: done.has(localDateKey(now)),
    daysSoFar: days.length,
  };
}

export const ifThenSentence = (e) => `When ${e.cue}, I will ${e.action}.`;
