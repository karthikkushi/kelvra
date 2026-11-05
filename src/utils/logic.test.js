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
