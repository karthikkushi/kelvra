// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule, newCard, isDue, nextIntervalLabel } from "./srs.js";
import { buildTodayPlan } from "./todayPlan.js";
import { textId, localDateKey } from "./hash.js";

const now = new Date("2026-11-05T10:00:00Z");
const days = (iso) => Math.round((new Date(iso) - now) / 86400000);

test("srs: a new card answered Good comes back in 1 day, then 3, then grows by ease", () => {
  let c = schedule(newCard(now), "good", now);
  assert.equal(c.interval, 1);
  assert.equal(days(c.due), 1);
  c = schedule(c, "good", now);
  assert.equal(c.interval, 3);
  c = schedule(c, "good", now);
  assert.equal(c.interval, Math.round(3 * 2.5));
  assert.equal(c.reps, 3);
});

test("srs: Again resets the card, comes back in 10 minutes, lowers ease and counts a lapse", () => {
  const learned = { interval: 20, ease: 2.5, reps: 5, lapses: 0 };
  const c = schedule(learned, "again", now);
  assert.equal(c.interval, 0);
  assert.equal(c.reps, 0);
  assert.equal(c.lapses, 1);
  assert.equal(c.ease, 2.3);
  assert.equal(new Date(c.due) - now, 10 * 60 * 1000);
});

test("srs: Easy waits longer than Good, Hard shorter; ease never drops below 1.3", () => {
  const card = { interval: 10, ease: 2.5, reps: 4, lapses: 0 };
  const hard = schedule(card, "hard", now).interval;
  const good = schedule(card, "good", now).interval;
  const easy = schedule(card, "easy", now).interval;
  assert.ok(hard < good && good < easy, `${hard} < ${good} < ${easy}`);
  let c = { interval: 5, ease: 1.35, reps: 3, lapses: 0 };
  for (let i = 0; i < 5; i++) c = schedule(c, "again", now);
  assert.equal(c.ease, 1.3);
  assert.ok(schedule({ interval: 300, ease: 3, reps: 9, lapses: 0 }, "easy", now).interval <= 365);
});

test("srs: due check and button labels", () => {
  assert.equal(isDue({ due: "2026-11-04T00:00:00Z" }, now), true);
  assert.equal(isDue({ due: "2026-11-06T00:00:00Z" }, now), false);
  assert.equal(nextIntervalLabel(newCard(now), "again", now), "10 min");
  assert.equal(nextIntervalLabel(newCard(now), "good", now), "1 day");
  assert.equal(nextIntervalLabel(newCard(now), "easy", now), "4 days");
  assert.throws(() => schedule(newCard(now), "maybe", now));
});

test("today plan: brand-new student gets a first study kit task", () => {
  const p = buildTodayPlan({ dueCards: 0, openMistakes: 0 });
  assert.equal(p.tasks[0].id, "start");
  assert.ok(p.tasks.length <= 4);
});

test("today plan: due cards, mistakes and a weak topic come first, in that order", () => {
  const p = buildTodayPlan({
    dueCards: 45, openMistakes: 3, mistakeTopic: "Optics",
    weakTopic: { topic: "Thermodynamics", avg: 52 }, recentTopic: "Optics",
  });
  assert.deepEqual(p.tasks.map((t) => t.id).slice(0, 3), ["review", "mistakes", "weak"]);
  assert.match(p.tasks[0].title, /Review 30 due flashcards/); // capped at 30
  assert.match(p.tasks[1].detail, /Optics/);
});

test("today plan: no 'explore' detour in the last week before the exam; exam minutes respected", () => {
  const p = buildTodayPlan({ dueCards: 2, openMistakes: 0, exam: { name: "Physics", daysLeft: 3, dailyMinutes: 90 } });
  assert.ok(!p.tasks.some((t) => t.id === "explore"));
  assert.equal(p.focusMinutes, 90);
  assert.match(p.headline, /3 days to Physics/);
  assert.match(buildTodayPlan({ dueCards: 0, openMistakes: 0, exam: { name: "Physics", daysLeft: 0 } }).headline, /today/);
});

test("ids: same question gives the same id regardless of spacing/case; date key is local", () => {
  assert.equal(textId("What is  LTP?"), textId("what is ltp?"));
  assert.notEqual(textId("What is LTP?"), textId("What is DNA?"));
  assert.equal(localDateKey(new Date(2026, 0, 5)), "2026-01-05");
});

import { calibrationSummary, sureButWrong } from "./confidence.js";

test("confidence: counts right/wrong per level and finds sure-but-wrong topics", () => {
  const recs = [
    ...Array(6).fill(0).map((_, i) => ({ confidence: "sure", correct: i < 3, topic: i < 3 ? "A" : "Optics" })),
    ...Array(5).fill(0).map((_, i) => ({ confidence: "unsure", correct: i < 4, topic: "B" })),
    { confidence: "guess", correct: false },
    { confidence: "bogus", correct: true },
  ];
  const s = calibrationSummary(recs);
  assert.equal(s.total, 12);
  assert.deepEqual(s.levels.sure, { count: 6, correct: 3, pct: 50 });
  assert.equal(s.levels.unsure.pct, 80);
  assert.deepEqual(s.sureWrongTopics, [{ topic: "Optics", count: 3 }]);
  assert.ok(s.tips.some((t) => /3 of 6 were right/.test(t)));
  assert.ok(s.tips.some((t) => /know more than you think/.test(t)));
  assert.ok(s.tips.every((t) => !/overconfident/i.test(t)), "never label the person");
  assert.equal(s.enough, true);
});

test("confidence: empty input is safe; sureButWrong", () => {
  const s = calibrationSummary([]);
  assert.equal(s.total, 0);
  assert.equal(s.levels.sure.pct, null);
  assert.equal(s.enough, false);
  assert.equal(sureButWrong("sure", false), true);
  assert.equal(sureButWrong("unsure", false), false);
});

import { cleanEvaluation, overallBand, weakestCriterion, speechStats, targetWords } from "./answerCoach.js";

test("answer coach: cleans a messy AI reply into safe bands and a marks range", () => {
  const e = cleanEvaluation({
    criteria: { accuracy: { band: 3, comment: "ok" }, keyterms: { band: "1" }, structure: { band: 9 }, example: { band: -2 } },
    marks_range: [4, 99], certainty: "very", missing_points: ["a", 2],
  }, 5);
  assert.equal(e.criteria.accuracy.band, 3);
  assert.equal(e.criteria.keyterms.band, 1);
  assert.equal(e.criteria.structure.band, 3);  // clamped
  assert.equal(e.criteria.example.band, 0);    // clamped
  assert.equal(e.criteria.clarity.band, 0);    // missing -> 0
  assert.deepEqual(e.marks_range, [4, 5]);     // never above the question's marks
  assert.equal(e.certainty, "medium");
  assert.deepEqual(e.missing_points, ["a", "2"]);
  assert.equal(e.overall, overallBand(e.criteria));
});

test("answer coach: weakest criterion uses first attempts; speech stats; length target", () => {
  const hist = [
    { attempts: [{ criteria: { accuracy: { band: 3 }, example: { band: 0 }, clarity: { band: 2 } } }, { criteria: { example: { band: 3 } } }] },
    { attempts: [{ criteria: { accuracy: { band: 2 }, example: { band: 1 }, clarity: { band: 2 } } }] },
  ];
  assert.equal(weakestCriterion(hist).id, "example");
  assert.equal(weakestCriterion([]), null);
  const s = speechStats("Um so basically photosynthesis um makes food like using light", 30);
  assert.equal(s.words, 10);
  assert.equal(s.wpm, 20);
  assert.equal(s.fillers.um, 2);
  assert.equal(s.fillerTotal, 4);
  assert.deepEqual(targetWords(5), { min: 100, max: 200 });
});

import { summarizeFocus } from "./focus.js";

test("focus: weekly summary, top distraction and tip; old sessions ignored", () => {
  const now = new Date("2026-11-05T12:00:00Z");
  const s = summarizeFocus([
    { created_at: "2026-11-05T08:00:00Z", actual_min: 25, rating: 4, pulled: ["phone"], leaves: 2, completed: true },
    { created_at: "2026-11-04T08:00:00Z", actual_min: 25, rating: 3, pulled: ["phone", "noise"], leaves: 1, completed: true },
    { created_at: "2026-11-03T08:00:00Z", actual_min: 10, rating: 2, pulled: ["none"], leaves: 0, completed: false },
    { created_at: "2026-10-01T08:00:00Z", actual_min: 99, rating: 1, pulled: ["noise"], leaves: 9 },
  ], now);
  assert.equal(s.count, 3);
  assert.equal(s.minutes, 60);
  assert.equal(s.avgRating, 3);
  assert.equal(s.topDistraction.id, "phone");
  assert.match(s.tip, /another room/);
  assert.equal(s.leavesPer25, 1.3);
  assert.equal(s.completed, 2);
  assert.equal(summarizeFocus([], now).count, 0);
  assert.match(summarizeFocus([], now).tip, /Start one 25-minute session/);
});

import { buildBehaviourReport, suggestExperiments, experimentProgress, ifThenSentence } from "./habits.js";

const at = (d, h) => { const x = new Date(2026, 10, d, h, 0, 0); return x.toISOString(); };

test("habits: finds late-night study and cramming, suggests matching if-then plans", () => {
  const now = new Date(2026, 10, 5, 12, 0, 0); // 5 Nov, local time
  const events = [
    ...[23, 23, 0, 1, 23].map((h) => ({ at: at(4, h), kind: "quiz" })),
    { at: at(1, 23), kind: "session" }, { at: at(2, 9), kind: "session" },
  ];
  const r = buildBehaviourReport(events, now);
  assert.ok(r.patterns.some((p) => p.id === "late_night"), JSON.stringify(r.patterns));
  assert.ok(r.patterns.some((p) => p.id === "cramming"));
  assert.equal(r.week.length, 7);
  assert.equal(r.week[6].date, "2026-11-05");
  const ideas = suggestExperiments(r, { topDistraction: "phone" });
  assert.equal(ideas.length, 3);
  assert.equal(ideas[0].id, "late_night");
  assert.match(ifThenSentence(ideas[0]), /^When it is 10:30 pm, I will /);
});

test("habits: steady student gets positive patterns; empty data is safe", () => {
  const now = new Date(2026, 10, 7, 20, 0, 0);
  const events = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ at: at(d, 18), kind: "session" }));
  const r = buildBehaviourReport(events, now);
  assert.equal(r.activeDays, 7);
  assert.ok(r.patterns.some((p) => p.id === "steady"));
  assert.ok(r.patterns.some((p) => p.id === "best_time" && /evening/.test(p.title)));
  assert.ok(!r.patterns.some((p) => p.tone === "watch"));
  const empty = buildBehaviourReport([], now);
  assert.equal(empty.activeDays, 0);
  assert.ok(empty.patterns.some((p) => p.id === "few_days"));
});

test("habits: weekly progress counts only this week's days (forgiving, no streak)", () => {
  const now = new Date(2026, 10, 5, 12); // Thursday
  const p = experimentProgress({ days_done: ["2026-11-01", "2026-11-03", "2026-11-05", "2026-10-30"] }, now);
  assert.equal(p.doneThisWeek, 3); // Sun 1, Tue 3, Thu 5 — last week's Fri 30 Oct not counted
  assert.equal(p.doneToday, true);
  assert.equal(p.daysSoFar, 5);
  assert.equal(experimentProgress(null, now).doneThisWeek, 0);
});

test("today plan: an unfinished if-then habit is the first task; done habit is not shown", () => {
  const p = buildTodayPlan({ dueCards: 3, openMistakes: 0, habit: { sentence: "When I finish dinner, I will review 10 cards.", doneToday: false } });
  assert.equal(p.tasks[0].id, "habit");
  assert.match(p.tasks[0].detail, /finish dinner/);
  const q = buildTodayPlan({ dueCards: 3, openMistakes: 0, habit: { sentence: "x", doneToday: true } });
  assert.ok(!q.tasks.some((t) => t.id === "habit"));
});

test("focus: no tab-leave rate from too little data", () => {
  const s = summarizeFocus([{ created_at: new Date().toISOString(), actual_min: 1, leaves: 1, pulled: ["phone"] }]);
  assert.equal(s.leavesPer25, null);
});
