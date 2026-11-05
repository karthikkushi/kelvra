// src/utils/mentor.js
// AI Mentor: a long-running mentor that knows the student's real progress
// (quiz scores, study sessions, exam date) and gives practical, real-world guidance.
// Conversation and weekly goals are saved in users/{uid}/meta/mentor.
import { groqFetch, aiErrorMessage } from "./claudeAPI";
import { listRecent, getMeta, setMeta } from "./firebase";
import { getLearningSnapshot } from "./learning";
import { MOODS } from "./todayPlan";
import { SAFETY_RULES } from "./safety";
import { localDateKey } from "./hash";
import { getConfidenceRecords, getFocusSessions, getActivityEvents } from "./learning";
import { calibrationSummary } from "./confidence";
import { summarizeFocus } from "./focus";
import { buildBehaviourReport, ifThenSentence, experimentProgress } from "./habits";

const MAX_SAVED_MESSAGES = 40;   // kept in the database
const MAX_SENT_MESSAGES = 12;    // sent to the AI each turn (keeps requests small)

// Sunday of this week, YYYY-MM-DD: weekly goals start fresh each week.
export function weekStart(date = new Date()) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return localDateKey(d); // local date, so the week flips at the student's own midnight
}

export function calcStreak(sessions) {
  const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1); // today not studied yet: count from yesterday
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Average quiz % per topic, lowest first.
export function topicAverages(scores) {
  const byTopic = {};
  scores.forEach((s) => { (byTopic[s.topic] ||= []).push(s.pct); });
  return Object.entries(byTopic)
    .map(([topic, list]) => ({ topic, avg: Math.round(list.reduce((a, b) => a + b, 0) / list.length), attempts: list.length }))
    .sort((a, b) => a.avg - b.avg);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exam = new Date(dateStr); exam.setHours(0, 0, 0, 0);
  return Math.ceil((exam - today) / 86400000);
}

// Everything the mentor needs to know, loaded in one go. Works offline from the local cache.
export async function loadMentorContext(user) {
  const uid = user?.id;
  const [scores, sessions, exam, state, learning, confidence, focus, events, habit] = await Promise.all([
    listRecent(uid, "quiz_scores", { max: 60 }).catch(() => []),
    listRecent(uid, "study_sessions", { max: 40 }).catch(() => []),
    getMeta(uid, "exam_goal"),
    getMeta(uid, "mentor"),
    getLearningSnapshot(uid).catch(() => ({ dueCards: 0, openMistakes: 0, mistakeTopics: [], checkins: [] })),
    getConfidenceRecords(uid, 150),
    getFocusSessions(uid, 40),
    getActivityEvents(uid).catch(() => []),
    getMeta(uid, "habit"),
  ]);
  const behaviour = buildBehaviourReport(events);
  const averages = topicAverages(scores);
  const meta = user?.user_metadata || {};
  const thisWeek = weekStart();
  return {
    name: (meta.full_name || "").split(" ")[0] || "there",
    ageGroup: meta.age_group || null,
    studyType: meta.study_type || null,
    goal: meta.goal || null,
    learningStyle: meta.learning_style || null,
    exam: exam?.exam_name ? { name: exam.exam_name, date: exam.exam_date, daysLeft: daysUntil(exam.exam_date), dailyMinutes: exam.daily_goal_minutes } : null,
    streak: calcStreak(sessions),
    sessionsThisMonth: sessions.filter((s) => Date.now() - new Date(s.created_at) < 30 * 86400000).length,
    quizCount: scores.length,
    avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length) : null,
    weakTopics: averages.filter((t) => t.avg < 70).slice(0, 4),
    strongTopics: averages.filter((t) => t.avg >= 85).slice(-3).reverse(),
    recentTopics: [...new Set(sessions.map((s) => s.topic))].slice(0, 5),
    calibration: calibrationSummary(confidence),
    focus: summarizeFocus(focus),
    behaviour: { activeDays: behaviour.activeDays, patterns: behaviour.patterns.map((p) => p.title) },
    habit: habit?.current && habit.current.week_start === weekStart() ? { sentence: ifThenSentence(habit.current), ...experimentProgress(habit.current) } : null,
    dueCards: learning.dueCards,
    openMistakes: learning.openMistakes,
    mistakeTopics: learning.mistakeTopics.slice(0, 3),
    checkins: learning.checkins,
    messages: Array.isArray(state?.messages) ? state.messages : [],
    goals: state?.week_start === thisWeek && Array.isArray(state?.goals) ? state.goals : [],
    lastWeekGoals: state?.week_start && state.week_start !== thisWeek && Array.isArray(state?.goals) ? state.goals : [],
  };
}

// Plain-text profile the AI reads before every answer.
export function describeStudent(ctx) {
  const lines = [
    `Name: ${ctx.name}`,
    ctx.ageGroup && !isAdult(ctx.ageGroup)
      ? `Age group: ${ctx.ageGroup} (under 18: keep advice age-appropriate; for big decisions encourage talking with parents or teachers)`
      : ctx.ageGroup ? `Age group: ${ctx.ageGroup}` : "Age: not given (treat as under 18)",
    ctx.studyType && `Studies: ${ctx.studyType}`,
    ctx.goal && `Main goal: ${ctx.goal}`,
    ctx.learningStyle && `Learns best by: ${ctx.learningStyle}`,
    ctx.exam && `Exam: ${ctx.exam.name} on ${ctx.exam.date} (${ctx.exam.daysLeft} days left), target ${ctx.exam.dailyMinutes} min/day`,
    `Study streak: ${ctx.streak} day(s); study sessions in last 30 days: ${ctx.sessionsThisMonth}`,
    ctx.quizCount ? `Quizzes taken: ${ctx.quizCount}, average score ${ctx.avgScore}%` : "No quizzes taken yet",
    ctx.weakTopics.length && `Weak topics (avg score): ${ctx.weakTopics.map((t) => `${t.topic} ${t.avg}%`).join(", ")}`,
    ctx.strongTopics.length && `Strong topics: ${ctx.strongTopics.map((t) => `${t.topic} ${t.avg}%`).join(", ")}`,
    ctx.recentTopics.length && `Recently studied: ${ctx.recentTopics.join(", ")}`,
    ctx.behaviour && `Study days in last 7: ${ctx.behaviour.activeDays}${ctx.behaviour.patterns.length ? `; patterns: ${ctx.behaviour.patterns.join("; ")}` : ""}`,
    ctx.habit && `This week's if-then habit: "${ctx.habit.sentence}" (done ${ctx.habit.doneThisWeek} of ${ctx.habit.daysSoFar} days)`,
    ctx.focus?.count && `Focus this week: ${ctx.focus.count} sessions, ${ctx.focus.minutes} min, avg focus ${ctx.focus.avgRating ?? "?"}/5${ctx.focus.topDistraction ? `, top distraction: ${ctx.focus.topDistraction.label}` : ""}`,
    ctx.calibration?.enough && `Confidence check: Sure answers ${ctx.calibration.levels.sure.correct}/${ctx.calibration.levels.sure.count} right, Unsure ${ctx.calibration.levels.unsure.correct}/${ctx.calibration.levels.unsure.count}${ctx.calibration.sureWrongTopics.length ? `; sure-but-wrong most in ${ctx.calibration.sureWrongTopics[0].topic}` : ""}`,
    ctx.openMistakes && `Open mistakes in notebook: ${ctx.openMistakes} (most in ${ctx.mistakeTopics.map((t) => `${t.topic} x${t.count}`).join(", ")})`,
    ctx.dueCards && `Flashcards due for review now: ${ctx.dueCards}`,
    ctx.checkins?.length && `Recent daily check-ins: ${ctx.checkins.map((c) => `${c.date}: ${MOODS.find((m) => m.id === c.checkin.mood)?.label || "?"} mood, ${c.checkin.minutes || 0} min${c.checkin.note ? `, "${c.checkin.note}"` : ""}`).join("; ")}`,
    ctx.goals.length && `This week's goals: ${ctx.goals.map((g) => `${g.done ? "[done]" : "[open]"} ${g.text}`).join("; ")}`,
    ctx.lastWeekGoals.length && `Last week's goals: ${ctx.lastWeekGoals.filter((g) => g.done).length} of ${ctx.lastWeekGoals.length} done`,
  ];
  return lines.filter(Boolean).join("\n");
}

export const isAdult = (ageGroup) => ageGroup === "18-21" || ageGroup === "22+";

const MENTOR_RULES = `You are Kelvra Mentor: a warm, honest, experienced mentor for a student. You are like a senior who has been through it and now guides others.

How you help:
- Use the student facts below and mention them specifically (their exam, weak topics, streak). Never pretend to know facts you were not given.
- Connect what they study to the real world: where it is used, which jobs use it, a concrete everyday example.
- Give practical next steps they can do today (at most 3), sized to their time left before the exam.
- Be honest. If they are behind, say so kindly and give a recovery plan. Do not flatter.
- Do not invent statistics, salaries, exam dates, cut-offs, names of institutions or links. If unsure, say so and suggest how to find out.
- You can suggest Kelvra tools when useful: Study (make flashcards/quiz from notes), Review (due flashcards), Mistakes (retest wrong answers), Answer coach (practise full written/spoken exam answers), Habits (one if-then experiment a week), Focus timer, Explore (careers and projects for a topic), AI Tutor (Socratic questions).
- Coach behaviour, not just knowledge: notice patterns (late nights, cramming, distractions, "sure but wrong" answers) and suggest ONE small, specific change. Praise effort and strategy, never intelligence.
- If recent check-ins show low mood or very little study, notice it kindly and adjust the plan to something small and doable.
- If the student mentions self-harm, abuse or a crisis, respond with care and encourage them to talk to a trusted adult, a counsellor, or a local emergency/helpline number right away.
- Reply in the language the student writes in.

Style: under 170 words. Short paragraphs or "- " bullets. Use **bold** for key words. End with one short question that helps them reflect or commit to an action.

${SAFETY_RULES}`;

async function chat(messages, { maxTokens = 600, temperature = 0.6 } = {}) {
  const response = await groqFetch({ messages, temperature, max_tokens: maxTokens });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(aiErrorMessage(response.status, data));
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The mentor did not answer. Please try again.");
  return text;
}

// history: [{ role: "user" | "assistant", content }]
export async function askMentor(ctx, history) {
  return chat([
    { role: "system", content: `${MENTOR_RULES}\n\nStudent facts:\n${describeStudent(ctx)}` },
    ...history.slice(-MAX_SENT_MESSAGES).map((m) => ({ role: m.role, content: m.content })),
  ]);
}

// Three small, checkable goals for this week, based on real progress.
export async function suggestWeeklyGoals(ctx) {
  const raw = await chat([
    { role: "system", content: "You are a practical study mentor. Reply with JSON only." },
    {
      role: "user",
      content: `Student facts:\n${describeStudent(ctx)}\n\nSuggest exactly 3 goals for this week. Each goal must be specific, small enough to finish this week, and checkable (e.g. "Score 70%+ on a Thermodynamics quiz"). Focus on weak topics and the exam if there is one. Max 12 words each.\nReply as: {"goals": ["...", "...", "..."]}`,
    },
  ], { maxTokens: 300, temperature: 0.4 });
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not read the suggested goals. Please try again.");
  const goals = JSON.parse(match[0]).goals;
  if (!Array.isArray(goals) || goals.length === 0) throw new Error("No goals were suggested. Please try again.");
  return goals.slice(0, 3).map((g) => String(g).trim()).filter(Boolean);
}

// Save the conversation and this week's goals (in the background, works offline).
export function saveMentorState(userId, { messages, goals }) {
  setMeta(userId, "mentor", {
    week_start: weekStart(),
    goals,
    messages: messages.slice(-MAX_SAVED_MESSAGES),
  });
}

// ── Career & project explorer ──
// For one topic: where it is used, jobs that use it, a small hands-on project and interview questions.
export async function exploreTopic(topic, ctx) {
  const raw = await chat([
    { role: "system", content: "You are a practical career and learning mentor for students. Reply with JSON only, no markdown." },
    {
      role: "user",
      content: `Topic: "${topic}"
${ctx ? `Student: ${[ctx.studyType && `studies ${ctx.studyType}`, ctx.goal && `goal: ${ctx.goal}`].filter(Boolean).join(", ") || "student"}` : ""}

Explain how this topic matters outside the classroom. Be concrete and accurate. Do NOT invent salaries, statistics, company claims or links.
Reply exactly in this JSON shape:
{
  "summary": "one sentence: what this topic is really about, in plain words",
  "realWorld": ["3 concrete real-life or industry uses, one sentence each"],
  "careers": [{"title": "job title", "how": "how this job uses the topic, one sentence", "skills": ["2-3 skills to build"]}],
  "project": {"title": "a small project a student can build or do", "goal": "what they will learn", "steps": ["4-6 short steps"], "time": "rough time, e.g. 2 weekends", "tools": ["free tools or materials"]},
  "interview": [{"q": "an interview or viva question about this topic", "hint": "what a good answer covers"}]
}
Give exactly 3 careers and 5 interview questions.`,
    },
  ], { maxTokens: 1600, temperature: 0.5 });
  const match = raw.match(/\{[\s\S]*\}/);
  let data;
  try { data = JSON.parse(match?.[0]); } catch { /* handled below */ }
  if (!data?.careers || !data?.project) throw new Error("The explorer's answer was incomplete. Please try again.");
  const arr = (v) => (Array.isArray(v) ? v : []);
  return {
    summary: String(data.summary || ""),
    realWorld: arr(data.realWorld).map(String).slice(0, 4),
    careers: arr(data.careers).slice(0, 4).map((c) => ({ title: String(c.title || ""), how: String(c.how || ""), skills: arr(c.skills).map(String).slice(0, 4) })),
    project: {
      title: String(data.project.title || ""), goal: String(data.project.goal || ""),
      steps: arr(data.project.steps).map(String).slice(0, 8), time: String(data.project.time || ""), tools: arr(data.project.tools).map(String).slice(0, 6),
    },
    interview: arr(data.interview).slice(0, 6).map((x) => ({ q: String(x.q || ""), hint: String(x.hint || "") })),
  };
}
