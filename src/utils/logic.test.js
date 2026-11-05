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

import { buildFamilyDigest, defaultShare, scoreTrend, whatsappLink } from "./family.js";
import { topReason, parentMessage } from "./debrief.js";

test("family digest: shares only what the student picked; effort first; never rank, mood or marks list", () => {
  const stats = { name: "Asha", activeDays: 5, focusMinutes: 120, focusSessions: 4, topics: ["Optics", "Cells"], mistakesFixed: 3,
    habit: { sentence: "When I finish dinner, I will review 10 cards.", done: 4, of: 5 }, answers: { count: 2, improved: 1 }, scoreTrend: "down" };
  const d = buildFamilyDigest(stats, defaultShare(), "en", "Tough week, need Sunday off");
  assert.match(d.text, /Studied on 5 of the last 7 days/);
  assert.match(d.text, /Fixed 3 past mistakes/);
  assert.match(d.text, /Tough week, need Sunday off/);
  assert.ok(!/habit experiment/i.test(d.text), "habit is off by default");
  assert.ok(!/Quiz scores/.test(d.text), "scores are off by default");
  assert.ok(!/rank/i.test(d.lines.join(" ")), "never rank");
  assert.match(d.text, /steady effort/);
  assert.match(d.text, /avoid: comparing/);
  const withScores = buildFamilyDigest(stats, { ...defaultShare(), scores: true, habit: true }, "en");
  assert.match(withScores.text, /a bit lower \(working on it\)/);
  assert.match(withScores.text, /done 4 of 5 days/);
  const hi = buildFamilyDigest(stats, defaultShare(), "hi");
  assert.match(hi.text, /पिछले 7 में से 5 दिन/);
  assert.match(whatsappLink("a b"), /^https:\/\/wa\.me\/\?text=a%20b$/);
});

test("family digest: score trend compares this week with last week", () => {
  const now = new Date("2026-11-05T12:00:00Z");
  const s = (daysAgo, pct) => ({ created_at: new Date(now - daysAgo * 86400000).toISOString(), pct });
  assert.equal(scoreTrend([s(1, 80), s(2, 70), s(9, 60)], now), "up");
  assert.equal(scoreTrend([s(1, 60), s(9, 70)], now), "down");
  assert.equal(scoreTrend([s(1, 70), s(9, 72)], now), "steady");
  assert.equal(scoreTrend([s(1, 70)], now), null);
});

test("debrief: top reason picks the biggest cause; parent message never mentions marks or rank", () => {
  assert.equal(topReason({ careless: 1, time: 2, nerves: 1 }).id, "time");
  assert.equal(topReason({}), null);
  const m = parentMessage({ test: "Physics mock", learned: "I rush unit conversions", fix: "check units for 10 seconds" });
  assert.match(m, /Physics mock/);
  assert.match(m, /I rush unit conversions/);
  assert.match(m, /don't compare/);
  assert.ok(!/\d+\s*\/\s*\d+|rank/i.test(m));
});

test("today plan: poor sleep gives a lighter plan; near exam adds the stress reset", () => {
  const p = buildTodayPlan({ dueCards: 40, openMistakes: 5, weakTopic: { topic: "X", avg: 40 }, sleep: "poor" });
  assert.equal(p.tasks.length, 2);
  assert.match(p.headline, /Lighter day/);
  assert.ok(p.tasks.every((t) => t.minutes <= 10));
  const q = buildTodayPlan({ dueCards: 1, openMistakes: 0, exam: { name: "Bio", daysLeft: 2 } });
  assert.equal(q.tasks[0].id, "reset");
});

test("family digest: a habit not done yet is shared without a '0 days' count", () => {
  const d = buildFamilyDigest({ name: "A", activeDays: 1, habit: { sentence: "When X, I will Y.", done: 0, of: 3 } }, { habit: true }, "en");
  assert.match(d.text, /Trying a new habit this week/);
  assert.ok(!/0 of 3/.test(d.text));
});

import { SECTIONS, ALL_PAGES, sectionOf, sectionTarget } from "./nav.js";
import { readFileSync } from "node:fs";

test("nav: 5 sections hold every app page exactly once (no feature lost from the menu)", () => {
  assert.equal(SECTIONS.length, 5);
  const app = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
  const routes = [...app.matchAll(/path="(\/[a-z]+)"/g)].map((m) => m[1])
    .filter((p) => !["/auth", "/onboarding", "/shared", "/privacy", "/terms", "/explain"].includes(p));
  const navPaths = ALL_PAGES.map((p) => p.path);
  for (const r of routes) assert.ok(navPaths.includes(r), `route ${r} is missing from the menu`);
  assert.equal(new Set(ALL_PAGES.map((p) => p.id)).size, ALL_PAGES.length, "page ids unique");
  assert.ok(SECTIONS.every((s) => s.pages.length <= 5), "no section has more than 5 pages");
});

test("nav: section lookup and last-used page", () => {
  assert.equal(sectionOf("mistakes").id, "practice");
  assert.equal(sectionOf("unknown").id, "home");
  const coach = SECTIONS.find((s) => s.id === "coach");
  assert.equal(sectionTarget(coach, {}), "/mentor");
  assert.equal(sectionTarget(coach, { coach: "habits" }), "/habits");
  assert.equal(sectionTarget(coach, { coach: "gone" }), "/mentor");
});

import { randomId } from "./hash.js";
test("ids: randomId works without crypto.randomUUID", () => {
  const a = randomId(), b = randomId();
  assert.equal(a.length, 20);
  assert.match(a, /^[a-z0-9]+$/);
  assert.notEqual(a, b);
});

import { readinessRange, gradeFor, daysStudiedLast7 } from "./forecast.js";

test("forecast: readiness is a range with assumptions, never one exact number", () => {
  assert.equal(readinessRange([{ pct: 80 }, { pct: 70 }]), null, "needs 3+ quizzes");
  const r = readinessRange([{ pct: 80 }, { pct: 60 }, { pct: 70 }, { pct: 50 }, { pct: 90 }]);
  assert.ok(r.low < r.center && r.center < r.high, JSON.stringify(r));
  assert.ok(r.high - r.low >= 10, "at least ±5");
  assert.match(r.note, /not an official prediction/);
  const steady = readinessRange(Array(20).fill({ pct: 75 }));
  assert.deepEqual([steady.low, steady.high], [70, 80], "minimum ±5 even with identical scores");
  const few = readinessRange([{ pct: 95 }, { pct: 40 }, { pct: 70 }]);
  assert.ok(few.high - few.low > 30, "few, noisy quizzes give a wide range");
  assert.ok(few.low >= 0 && few.high <= 100);
  assert.equal(gradeFor(85), "A");
  assert.equal(gradeFor(10), "below C");
});

test("forecast: days studied in the last 7 days instead of a streak", () => {
  const now = new Date(2026, 10, 5, 12);
  const d = (day) => new Date(2026, 10, day, 9).toISOString();
  assert.equal(daysStudiedLast7([d(5), d(5), d(3), d(1), new Date(2026, 9, 20, 9).toISOString()], now), 3); // 20 Oct is too old
  assert.equal(daysStudiedLast7([], now), 0);
  assert.equal(daysStudiedLast7([d(5), d(4), d(3), d(2), d(1), new Date(2026, 9, 31, 9).toISOString(), new Date(2026, 9, 30, 9).toISOString()], now), 7);
});

import { pickGuessQuestions, isPlotTwist, twistDueKey, twistsDue, twistsFixedThisWeek, shuffledOptions } from "./plotTwist.js";

test("plot twist: picks up to 3 valid questions spread across the quiz", () => {
  const qs = Array.from({ length: 6 }, (_, i) => ({ question: `Q${i}`, options: [{ id: "A" }, { id: "B" }], correct: "A" }));
  assert.deepEqual(pickGuessQuestions(qs).map((q) => q.question), ["Q0", "Q2", "Q4"]);
  assert.equal(pickGuessQuestions(qs.slice(0, 2)).length, 2);
  assert.equal(pickGuessQuestions([{ question: "no options" }, ...qs.slice(0, 1)]).length, 1);
  assert.deepEqual(pickGuessQuestions(null), []);
});

test("plot twist: only sure-and-wrong is a plot twist; replay is tomorrow; due and fixed counts", () => {
  assert.equal(isPlotTwist("sure", false), true);
  assert.equal(isPlotTwist("unsure", false), false);
  assert.equal(isPlotTwist("sure", true), false);
  const now = new Date(2026, 10, 5, 22, 30);
  assert.equal(twistDueKey(now), "2026-11-06");
  const ms = [
    { confident: true, mastered: false, twist_due: "2026-11-05" },
    { confident: true, mastered: false, twist_due: "2026-11-06" },
    { confident: false, mastered: false, twist_due: "2026-11-01" },
    { confident: true, mastered: true, twist_due: "2026-11-01", mastered_at: new Date(2026, 10, 4).toISOString() },
    { confident: true, mastered: true, mastered_at: new Date(2026, 9, 1).toISOString() },
  ];
  assert.equal(twistsDue(ms, now).length, 1);
  assert.equal(twistsFixedThisWeek(ms, now), 1);
});

test("plot twist: replay shuffles option order but keeps every option", () => {
  const opts = ["A", "B", "C", "D"].map((id) => ({ id }));
  const s = shuffledOptions(opts, 12345);
  assert.deepEqual([...s].map((o) => o.id).sort(), ["A", "B", "C", "D"]);
  assert.deepEqual(shuffledOptions(opts, 12345), s, "same seed, same order");
});

test("today plan: plot twists due get their own task, not counted twice with other mistakes", () => {
  const p = buildTodayPlan({ dueCards: 0, openMistakes: 5, plotTwistsDue: 2 });
  assert.deepEqual(p.tasks.slice(0, 2).map((t) => t.id), ["twists", "mistakes"]);
  assert.match(p.tasks[0].title, /Replay 2 plot twists/);
  assert.match(p.tasks[1].title, /Retest 3 past mistakes/);
  const only = buildTodayPlan({ dueCards: 0, openMistakes: 1, plotTwistsDue: 1 });
  assert.ok(!only.tasks.some((t) => t.id === "mistakes"));
});

import { normalizeQuestion } from "./plotTwist.js";
test("plot twist: kit questions with option objects are normalized and pickable", () => {
  const kit = [{ question: "Q", options: { A: "x", B: "y" }, correct: "B" }];
  const n = kit.map(normalizeQuestion);
  assert.deepEqual(n[0].options, [{ id: "A", text: "x" }, { id: "B", text: "y" }]);
  assert.equal(pickGuessQuestions(n).length, 1);
  assert.equal(pickGuessQuestions(kit).length, 0, "raw objects are not valid until normalized");
});

import { numbersIn, numbersPreserved, applyWorldStems } from "./yourWorld.js";

test("your-world: numbers must survive the rewrite, or the original question is kept", () => {
  assert.deepEqual(numbersIn("A 1,200 kg car at 2.50 m/s for 3 s"), ["1200", "2.5", "3"]);
  assert.equal(numbersPreserved("A ball is hit at 30 m/s at 45°", "Virat hits the ball at 30 m/s at an angle of 45°"), true);
  assert.equal(numbersPreserved("A ball is hit at 30 m/s", "A ball is hit at 35 m/s"), false);
  assert.equal(numbersPreserved("2 apples and 2 pears", "2 bats"), false, "count matters");
  assert.equal(numbersPreserved("Which organ pumps blood?", "In a cricket match, which organ pumps blood to a sprinting fielder's legs?"), true);
  const qs = [
    { question: "A car moves at 20 m/s for 5 s. Distance?", correct: "B" },
    { question: "A body of 2 kg falls. Weight?", correct: "A" },
    { question: "Capital of India?", correct: "C" },
  ];
  const { questions, kept } = applyWorldStems(qs, [
    "A bowler's run-up: he moves at 20 m/s for 5 s. How far does he run?",
    "A cricket ball of 3 kg falls. Weight?",          // changed number -> rejected
    "",                                                // empty -> rejected
  ], "cricket");
  assert.equal(kept, 1);
  assert.match(questions[0].world_question, /bowler/);
  assert.equal(questions[1].world_question, null);
  assert.equal(questions[0].correct, "B", "answer key untouched");
  assert.equal(applyWorldStems(qs, null, "cricket").kept, 0);
});

import { EXPLAINERS, explainerById, explainerText } from "../data/explainers.js";

test("explainers: every explainer has English + Hindi title, body, 'say' lines and an official https source", () => {
  assert.ok(EXPLAINERS.length >= 8);
  assert.equal(new Set(EXPLAINERS.map((e) => e.id)).size, EXPLAINERS.length, "ids unique");
  for (const e of EXPLAINERS) {
    for (const lang of ["en", "hi"]) {
      assert.ok(e.title[lang], `${e.id} title ${lang}`);
      assert.ok(e.body[lang]?.length >= 2, `${e.id} body ${lang}`);
      assert.ok(e.say[lang]?.length >= 1, `${e.id} say ${lang}`);
    }
    assert.ok(e.sources.length && e.sources.every((s) => s.url.startsWith("https://")), `${e.id} sources`);
    assert.ok(!/rank\s*\d|guarantee/i.test(explainerText(e, "en")), `${e.id} makes no rank promises`);
  }
  assert.equal(explainerById("percentile").id, "percentile");
  assert.equal(explainerById("nope"), null);
});

test("family digest + debrief: an explainer link can be attached; debrief can add a parent guide", () => {
  const e = explainerById("after-test");
  const d = buildFamilyDigest({ name: "A", activeDays: 3 }, { days: true }, "hi", "", { title: e.title, url: "https://kelvra.app/explain/after-test" });
  assert.match(d.text, /खराब टेस्ट के बाद क्या कहें https:\/\/kelvra\.app\/explain\/after-test/);
  const m = parentMessage({ test: "Maths test", guideUrl: "https://kelvra.app/explain/after-test" });
  assert.match(m, /A 1-minute guide on what helps: https:\/\/kelvra\.app\/explain\/after-test/);
  assert.ok(!/guide/.test(parentMessage({ test: "Maths test" })), "no guide line unless asked");
});

import { TRACKS, istDateKey, puzzleNumber, msUntilNextPuzzle, puzzleFor, emojiRow, shareText, optionShares, commonTrap, daysPlayedLast7, validPuzzle } from "./grid.js";
import { GRID_BANK } from "../data/gridBank.js";

test("grid: puzzle number and date follow India time (changes at IST midnight)", () => {
  assert.equal(istDateKey(Date.parse("2026-11-05T18:29:00Z")), "2026-11-05");
  assert.equal(istDateKey(Date.parse("2026-11-05T18:31:00Z")), "2026-11-06");
  assert.equal(puzzleNumber(Date.parse("2026-11-01T00:00:00+05:30")), 1);
  assert.equal(puzzleNumber(Date.parse("2026-11-05T12:00:00+05:30")), 5);
  assert.equal(puzzleNumber(Date.parse("2026-10-01T12:00:00+05:30")), 1, "never below 1");
  assert.equal(msUntilNextPuzzle(Date.parse("2026-11-05T23:00:00+05:30")), 3600000);
});

test("grid: puzzles cycle through the bank; share grid gives nothing away", () => {
  assert.equal(puzzleFor(GRID_BANK, "neet", 1), GRID_BANK.neet[0]);
  assert.equal(puzzleFor(GRID_BANK, "neet", 4), GRID_BANK.neet[0]);
  assert.equal(puzzleFor(GRID_BANK, "nope", 1), null);
  const results = [{ right: true, confidence: "sure" }, { right: true, confidence: "guess" }, { right: false, confidence: "sure" }];
  assert.equal(emojiRow(results), "🟩🟨⬛");
  const text = shareText("neet", 12, results, "https://kelvra.app/grid");
  assert.equal(text, "Kelvra NEET #12 2/3\n🟩🟨⬛\nPlay today's grid: https://kelvra.app/grid");
  assert.ok(!/[ABCD]\)/.test(text), "no answers in the share text");
});

test("grid: crowd shares and the most common trap", () => {
  const stat = { A: 2, B: 6, C: 1, total: 9 };
  assert.deepEqual(optionShares(stat), { A: 22, B: 67, C: 11, D: 0 });
  assert.deepEqual(optionShares(null), { A: 0, B: 0, C: 0, D: 0 });
  assert.equal(commonTrap(stat, "B"), "A");
  assert.equal(commonTrap({ B: 5, total: 5 }, "B"), null);
  assert.equal(daysPlayedLast7([10, 9, 7, 3, 2], 10), 3);
  assert.equal(daysPlayedLast7([], 10), 0);
});

test("grid bank: every track has puzzles, each with 5 well-formed questions", () => {
  for (const t of TRACKS) {
    assert.ok(GRID_BANK[t.id]?.length >= 3, `${t.id} has puzzles`);
    GRID_BANK[t.id].forEach((p, i) => assert.ok(validPuzzle(p), `${t.id} puzzle ${i + 1} is well-formed`));
  }
  assert.equal(validPuzzle({ questions: [{ q: "x", why: "y", subject: "z", options: { A: "1", B: "1", C: "2", D: "3" }, answer: "A" }] }), false);
});
