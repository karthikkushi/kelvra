// src/utils/confidence.js
// Confidence check (metacognitive calibration): before seeing if an answer is right,
// the student says Guess / Unsure / Sure. "Sure but wrong" mistakes are the most valuable
// to fix (the hypercorrection effect), so they go to the top of the Mistake notebook.
// Feedback is always about questions, never about the person ("you are overconfident").

export const LEVELS = [
  { id: "guess",  label: "Guess",  icon: "casino" },
  { id: "unsure", label: "Unsure", icon: "help" },
  { id: "sure",   label: "Sure",   icon: "verified" },
];

/**
 * @param {Array<{confidence:"guess"|"unsure"|"sure", correct:boolean, topic?:string}>} records
 */
export function calibrationSummary(records) {
  const levels = Object.fromEntries(LEVELS.map((l) => [l.id, { count: 0, correct: 0, pct: null }]));
  const sureWrongByTopic = {};
  for (const r of records || []) {
    const bucket = levels[r.confidence];
    if (!bucket) continue;
    bucket.count++;
    if (r.correct) bucket.correct++;
    if (r.confidence === "sure" && !r.correct && r.topic) sureWrongByTopic[r.topic] = (sureWrongByTopic[r.topic] || 0) + 1;
  }
  for (const b of Object.values(levels)) b.pct = b.count ? Math.round((b.correct / b.count) * 100) : null;

  const total = LEVELS.reduce((a, l) => a + levels[l.id].count, 0);
  const sure = levels.sure, guess = levels.guess, unsure = levels.unsure;
  const tips = [];
  if (sure.count >= 5 && sure.pct < 80) {
    tips.push(`When you said Sure, ${sure.correct} of ${sure.count} were right. Slow down on "sure" questions: re-read the question and check units and keywords.`);
  }
  if (unsure.count >= 5 && unsure.pct >= 70) {
    tips.push(`You were right on ${unsure.correct} of ${unsure.count} "Unsure" answers. You know more than you think, so trust your first reasoning a bit more.`);
  }
  if (guess.count >= 5 && guess.pct >= 50) {
    tips.push(`Your guesses were right ${guess.pct}% of the time. Some of these are not really guesses: revise them once and they become sure marks.`);
  }
  if (sure.count >= 5 && sure.pct >= 90) {
    tips.push(`Your "Sure" answers are reliable (${sure.pct}% right). Keep spending your time on the Unsure ones.`);
  }
  const sureWrongTopics = Object.entries(sureWrongByTopic).sort((a, b) => b[1] - a[1]).map(([topic, count]) => ({ topic, count }));
  return { total, levels, tips, sureWrongTopics, enough: total >= 10 };
}

export const sureButWrong = (confidence, correct) => confidence === "sure" && !correct;
