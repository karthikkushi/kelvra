// src/utils/srs.js
// Spaced repetition (a simplified SM-2, the method behind Anki).
// Each card remembers how many days to wait (interval) and how easy it is (ease).
// Pure functions only, so they run in Node tests and in the browser.

export const RATINGS = ["again", "hard", "good", "easy"];

const DAY = 24 * 60 * 60 * 1000;
const AGAIN_DELAY = 10 * 60 * 1000; // a forgotten card comes back in 10 minutes
const MIN_EASE = 1.3;
const MAX_INTERVAL = 365;

export function newCard(now = new Date()) {
  return { interval: 0, ease: 2.5, reps: 0, lapses: 0, due: now.toISOString() };
}

// Returns the card's new schedule after the student rates it.
export function schedule(card, rating, now = new Date()) {
  if (!RATINGS.includes(rating)) throw new Error(`Unknown rating: ${rating}`);
  const prev = { ...newCard(now), ...card };
  let { interval, ease, reps, lapses } = prev;

  if (rating === "again") {
    return {
      interval: 0,
      ease: Math.max(MIN_EASE, round2(ease - 0.2)),
      reps: 0,
      lapses: lapses + 1,
      due: new Date(now.getTime() + AGAIN_DELAY).toISOString(),
      last_rating: rating,
      last_reviewed: now.toISOString(),
    };
  }

  if (rating === "hard") {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(MIN_EASE, round2(ease - 0.15));
  } else if (rating === "good") {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(Math.max(interval, 1) * ease);
  } else {
    interval = reps === 0 ? 4 : Math.round(Math.max(interval, 1) * ease * 1.3);
    ease = round2(ease + 0.15);
  }
  interval = Math.min(MAX_INTERVAL, interval);

  return {
    interval,
    ease,
    reps: reps + 1,
    lapses,
    due: new Date(now.getTime() + interval * DAY).toISOString(),
    last_rating: rating,
    last_reviewed: now.toISOString(),
  };
}

// Text for the rating buttons, e.g. "10 min", "1 day", "3 days".
export function nextIntervalLabel(card, rating, now = new Date()) {
  const next = schedule(card, rating, now);
  if (next.interval === 0) return "10 min";
  if (next.interval < 30) return `${next.interval} day${next.interval === 1 ? "" : "s"}`;
  const months = Math.round(next.interval / 30);
  return `${months} mo`;
}

export function isDue(card, now = new Date()) {
  return !card.due || new Date(card.due) <= now;
}

const round2 = (n) => Math.round(n * 100) / 100;
