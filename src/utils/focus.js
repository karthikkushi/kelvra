// src/utils/focus.js
// Focus & distraction tracker logic. Research basis: self-monitoring works best when progress is
// recorded and reviewed (d ≈ 0.40). Scare claims ("a phone nearby lowers IQ") are contested, so tips
// stay practical. Focus data is private to the student. Pure functions: tested in logic.test.js.

export const LEAVE_TAGS = [
  { id: "lookup", label: "Looked something up" },
  { id: "phone",  label: "Phone / messages" },
  { id: "break",  label: "Short break" },
  { id: "people", label: "Someone needed me" },
  { id: "other",  label: "Other" },
];

export const PULLS = [
  { id: "phone",  label: "Phone",        tip: "Next session, put the phone in another room or turn on Do Not Disturb before you press start." },
  { id: "social", label: "Social media", tip: "Log out of one app for exam week, or keep it only on a family member's phone." },
  { id: "noise",  label: "Noise",        tip: "Try Kelvra's soft noise or earplugs, or study at a quieter time of day." },
  { id: "people", label: "People",       tip: "Tell your family your focus time (for example 7–8 pm). A closed door or a note helps." },
  { id: "tired",  label: "Tired",        tip: "Tiredness is a sleep signal, not a willpower problem. Shorter sessions today and an earlier night help more." },
  { id: "hungry", label: "Hungry",       tip: "Keep water and a small snack at your desk before you start." },
  { id: "stuck",  label: "Stuck on a doubt", tip: "Note the doubt, skip it, and ask your mentor or AI tutor after the session." },
  { id: "none",   label: "Nothing, I focused!", tip: "" },
];

export const PRESETS = [
  { id: "25", study: 25, rest: 5, label: "25 / 5" },
  { id: "50", study: 50, rest: 10, label: "50 / 10" },
];

const DAY = 86400000;

export function summarizeFocus(sessions, now = new Date()) {
  const week = (sessions || []).filter((s) => now - new Date(s.created_at) < 7 * DAY);
  const count = week.length;
  const minutes = Math.round(week.reduce((a, s) => a + (s.actual_min || 0), 0));
  const rated = week.filter((s) => Number.isInteger(s.rating));
  const avgRating = rated.length ? Math.round((rated.reduce((a, s) => a + s.rating, 0) / rated.length) * 10) / 10 : null;
  const pulls = {};
  week.forEach((s) => (s.pulled || []).forEach((p) => { if (p !== "none") pulls[p] = (pulls[p] || 0) + 1; }));
  const top = Object.entries(pulls).sort((a, b) => b[1] - a[1])[0];
  const topDistraction = top ? PULLS.find((p) => p.id === top[0]) : null;
  const studyMin = week.reduce((a, s) => a + (s.actual_min || 0), 0);
  // Needs 20+ minutes of data, or one short session gives a silly number
  const leavesPer25 = studyMin >= 20 ? Math.round((week.reduce((a, s) => a + (s.leaves || 0), 0) / studyMin) * 25 * 10) / 10 : null;
  const completed = week.filter((s) => s.completed).length;

  let tip = topDistraction?.tip || "";
  if (!tip && count >= 3 && leavesPer25 != null && leavesPer25 <= 1) tip = "Your focus is steady. Try one longer 50-minute session for your hardest topic.";
  if (!tip && count === 0) tip = "Start one 25-minute session today. Pick one small task before you press start.";
  return { count, minutes, avgRating, topDistraction, leavesPer25, completed, tip };
}
