// src/utils/claudeAPI.js
// ── Using Groq API (free — 14,400 requests/day, no rate limit issues) ──

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt) {
  if (!API_KEY) {
    throw new Error("Groq API key not found. Add VITE_GROQ_API_KEY to your .env file and restart the server.");
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });
  } catch (networkErr) {
    throw new Error("Network error: " + networkErr.message);
  }

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || JSON.stringify(data);
    throw new Error(`Groq API Error ${response.status}: ${msg}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq: " + JSON.stringify(data));

  return text;
}

// ── Parse helpers ──
function parseFlashcards(raw) {
  const cards = [];
  const lines = raw.split("\n");
  let cur = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Q:")) {
      cur = { question: trimmed.slice(2).trim(), answer: "" };
    } else if (trimmed.startsWith("A:") && cur) {
      cur.answer = trimmed.slice(2).trim();
      if (cur.question && cur.answer) cards.push(cur);
      cur = null;
    }
  }
  return cards;
}

function parseQuiz(raw) {
  const questions = [];
  const blocks = raw.split(/(?=QUESTION:)/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const qm = block.match(/QUESTION:\s*(.+)/);
    const opts = {};
    ["A", "B", "C", "D"].forEach((l) => {
      const m = block.match(new RegExp(`${l}\\)\\s*(.+)`));
      if (m) opts[l] = m[1].trim();
    });
    const cm = block.match(/CORRECT:\s*([ABCD])/);
    const em = block.match(/EXPLANATION:\s*([\s\S]+?)(?=QUESTION:|$)/);
    if (qm && cm && Object.keys(opts).length >= 2) {
      questions.push({
        question: qm[1].trim(),
        options: opts,
        correct: cm[1].trim(),
        explanation: em ? em[1].trim() : "",
        topic: "Generated",
      });
    }
  }
  return questions;
}

function parseSummary(raw) {
  const lines = raw.split("\n").filter((l) => l.trim());
  const bullets = lines.filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
  const paras = lines.filter((l) => !l.trim().startsWith("•") && !l.trim().startsWith("-") && l.trim().length > 30);
  return {
    paragraphs: paras,
    points: bullets.map((b) => b.replace(/^[•-]\s*/, "").trim()),
  };
}

function parseSchedule(raw) {
  const days = [];
  const blocks = raw.split(/(?=DAY \d)/i);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const dm = block.match(/DAY (\d):\s*(.+)/i);
    const tasks = [...block.matchAll(/TASK:\s*(.+)/gi)].map((m) => m[1].trim());
    const dur = block.match(/DURATION:\s*(.+)/i);
    if (dm) days.push({ day: dm[1], theme: dm[2].trim(), tasks, duration: dur ? dur[1].trim() : "" });
  }
  return days;
}

// ── Public functions ──

export async function generateFlashcards(content, language = "English") {
  const prompt = `You are an expert study material creator. Based on the following content, create exactly 8 high-quality flashcard pairs.

Content: ${content}
Output language: ${language}

Format each flashcard EXACTLY like this with no extra text:
Q: [clear specific question]
A: [comprehensive but concise answer]

Q: [next question]
A: [next answer]

Create exactly 8 flashcards covering the most important concepts.`;

  const raw = await callGroq(prompt);
  const cards = parseFlashcards(raw);
  if (cards.length === 0) throw new Error("Could not parse flashcards. Please try again.");
  return cards;
}

export async function generateQuiz(content, language = "English") {
  const prompt = `You are an expert quiz creator. Based on the following content, create exactly 6 multiple choice questions.

Content: ${content}
Output language: ${language}

Format EXACTLY like this for each question:
QUESTION: [question text]
A) [option A]
B) [option B]
C) [option C]
D) [option D]
CORRECT: [A/B/C/D]
EXPLANATION: [brief explanation]

Create exactly 6 questions. No extra text outside this format.`;

  const raw = await callGroq(prompt);
  const questions = parseQuiz(raw);
  if (questions.length === 0) throw new Error("Could not parse quiz. Please try again.");
  return questions;
}

export async function generateSummary(content, language = "English") {
  const prompt = `You are an expert study assistant. Summarize the following content for a student.

Content: ${content}
Output language: ${language}

Write 2-3 clear paragraphs summarizing the key concepts.
Then list exactly 6 key points, each starting with "• ".

Keep it educational and easy to understand.`;

  const raw = await callGroq(prompt);
  return parseSummary(raw);
}

export async function generateStudyPlan(content, language = "English") {
  const prompt = `You are an expert study planner. Create a 5-day study plan for the following content.

Content: ${content}
Output language: ${language}

Format EXACTLY like this:
DAY 1: [day theme]
TASK: [specific task]
TASK: [specific task]
DURATION: [total minutes]

DAY 2: [theme]
TASK: [task]
TASK: [task]
DURATION: [minutes]

Continue for DAY 3, DAY 4, DAY 5. Be specific and actionable.`;

  const raw = await callGroq(prompt);
  const plan = parseSchedule(raw);
  if (plan.length === 0) throw new Error("Could not parse study plan. Please try again.");
  return plan;
}

export async function generateStudyKit(content, options = {}, language = "English") {
  const { flashcards: doFlashcards = true, quiz: doQuiz = true, summary: doSummary = true, plan: doPlan = true } = options;
  const results = {};
  const errors = {};
  await Promise.allSettled([
    doSummary    && generateSummary(content, language).then((r) => (results.summary = r)).catch((e) => (errors.summary = e.message)),
    doFlashcards && generateFlashcards(content, language).then((r) => (results.flashcards = r)).catch((e) => (errors.flashcards = e.message)),
    doQuiz       && generateQuiz(content, language).then((r) => (results.quiz = r)).catch((e) => (errors.quiz = e.message)),
    doPlan       && generateStudyPlan(content, language).then((r) => (results.plan = r)).catch((e) => (errors.plan = e.message)),
  ]);
  return { results, errors };
}

export async function getHint(question, topic = "") {
  const prompt = `A student is stuck on this quiz question: "${question}"
${topic ? `Topic: ${topic}` : ""}
Give a helpful hint without giving away the answer. Keep it to 1-2 sentences.`;
  return await callGroq(prompt);
}

export async function getCoachMessage(weakTopics = [], streakDays = 0) {
  const prompt = `You are a friendly AI study coach. Generate a short motivating message.
Weak topics: ${weakTopics.join(", ") || "none yet"}
Current streak: ${streakDays} days
Write exactly 1 short encouraging sentence, max 20 words.`;
  return await callGroq(prompt);
}