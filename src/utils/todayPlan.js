// src/utils/todayPlan.js
// Builds today's 3-4 tasks from real data: due flashcards, open mistakes, weak topics, exam date.
// No AI needed, so it works offline and costs nothing. Pure function: tested in todayPlan.test.js.

export const MAX_TASKS = 4;

/**
 * @param {object} s
 * @param {number} s.dueCards        flashcards due for review now
 * @param {number} s.openMistakes    mistakes not yet mastered
 * @param {string} [s.mistakeTopic]  topic with the most open mistakes
 * @param {{topic:string, avg:number}} [s.weakTopic]  lowest-scoring quiz topic
 * @param {string} [s.recentTopic]   last studied topic
 * @param {{name:string, daysLeft:number, dailyMinutes?:number}} [s.exam]
 * @param {boolean} [s.studiedToday]
 * @returns {{tasks: Array<{id,icon,title,detail,path,minutes}>, focusMinutes:number, headline:string}}
 */
export function buildTodayPlan(s) {
  const tasks = [];
  const examSoon = s.exam && s.exam.daysLeft >= 0 && s.exam.daysLeft <= 7;

  if (s.dueCards > 0) {
    const n = Math.min(s.dueCards, 30);
    tasks.push({
      id: "review",
      icon: "repeat",
      title: `Review ${n} due flashcard${n === 1 ? "" : "s"}`,
      detail: "These are the cards you are about to forget.",
      path: "/review",
      minutes: Math.max(5, Math.ceil(n / 3)),
    });
  }

  if (s.openMistakes > 0) {
    const n = Math.min(s.openMistakes, 10);
    tasks.push({
      id: "mistakes",
      icon: "assignment_late",
      title: `Retest ${n} past mistake${n === 1 ? "" : "s"}`,
      detail: s.mistakeTopic ? `Most of them are in ${s.mistakeTopic}.` : "Fix them before the exam asks again.",
      path: "/mistakes",
      minutes: Math.max(5, n * 2),
    });
  }

  if (s.weakTopic && s.weakTopic.avg < 70) {
    tasks.push({
      id: "weak",
      icon: "trending_up",
      title: `Strengthen ${s.weakTopic.topic}`,
      detail: `Your quiz average is ${s.weakTopic.avg}%. Make a fresh quiz from your notes and aim for 70%+.`,
      path: "/study",
      minutes: 20,
    });
  }

  if (tasks.length < 2) {
    tasks.push(s.recentTopic
      ? { id: "continue", icon: "menu_book", title: `Continue ${s.recentTopic}`, detail: "Add the next chapter of notes and make a study kit.", path: "/study", minutes: 25 }
      : { id: "start", icon: "upload_file", title: "Make your first study kit", detail: "Paste notes or upload a PDF to get flashcards and a quiz.", path: "/study", minutes: 15 });
  }

  if (!examSoon && tasks.length < MAX_TASKS) {
    tasks.push({
      id: "explore",
      icon: "explore",
      title: "See where this is used in real life",
      detail: "Explore real jobs and a small project for a topic you are studying.",
      path: "/explore",
      minutes: 10,
    });
  }

  const planned = tasks.slice(0, MAX_TASKS);
  const sum = planned.reduce((a, t) => a + t.minutes, 0);
  const focusMinutes = Math.max(sum, s.exam?.dailyMinutes || 0);

  let headline;
  if (s.exam && s.exam.daysLeft === 0) headline = `${s.exam.name} is today. Light review only, and rest well.`;
  else if (examSoon) headline = `${s.exam.daysLeft} day${s.exam.daysLeft === 1 ? "" : "s"} to ${s.exam.name}. Focus on what you get wrong.`;
  else if (s.studiedToday) headline = "Good start today. Finish the list to keep your streak.";
  else headline = "Small steps every day beat one long night before the exam.";

  return { tasks: planned, focusMinutes, headline };
}

export const MOODS = [
  { id: 1, emoji: "😫", label: "Rough" },
  { id: 2, emoji: "😕", label: "Meh" },
  { id: 3, emoji: "🙂", label: "Good" },
  { id: 4, emoji: "😄", label: "Great" },
];
