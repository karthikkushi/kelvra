// src/utils/claudeAPI.js
// ── Using Groq API (free — 14,400 requests/day, no rate limit issues) ──

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt) {
  if (!API_KEY) {
    throw new Error("Groq API key not found. Add Vite_GROQ_API_KEY to your .env file and restart the server.");
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

export async function extractTextFromImage(base64Image, mimeType) {
  if (!API_KEY) throw new Error("Groq API key not found.");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          { type: "text", text: "Extract and transcribe all text from this image. If it contains diagrams, describe them in text suitable for studying." },
        ],
      }],
      max_tokens: 2048,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Vision API error");
  return data?.choices?.[0]?.message?.content || "";
}

export async function getCoachMessage(weakTopics = [], streakDays = 0) {
  const prompt = `You are a friendly AI study coach. Generate a short motivating message.
Weak topics: ${weakTopics.join(", ") || "none yet"}
Current streak: ${streakDays} days
Write exactly 1 short encouraging sentence, max 20 words.`;
  return await callGroq(prompt);
}

// ── SOCRATIC TUTOR ──
export async function startSocraticSession(topic, userLevel = "student") {
  const prompt = `You are a Socratic AI tutor. Your ONLY method is asking questions.
Topic to explore: ${topic}
Student level: ${userLevel}

Start a Socratic dialogue about this topic.
- Ask ONE opening question that makes the student think
- The question should be intriguing and accessible
- Never explain — only ask
- Keep the question under 2 sentences

Respond with ONLY the question, nothing else.`;

  return await callGroq(prompt);
}

export async function continueSocraticDialogue(topic, conversationHistory, studentAnswer) {
  const historyText = conversationHistory
    .map((m) => `${m.role === "ai" ? "Tutor" : "Student"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a Socratic AI tutor exploring: ${topic}

Conversation so far:
${historyText}

Student just said: "${studentAnswer}"

Your response rules:
1. If student is on the right track — affirm briefly, then ask a DEEPER question
2. If student is confused — give a small hint, then ask a simpler guiding question
3. If student gives a correct insight — celebrate it, connect it to the bigger concept, ask what it implies
4. NEVER give the full answer directly
5. Keep responses SHORT — max 3 sentences
6. Always end with a question
7. Be warm, encouraging, like a great teacher

Respond naturally as the Socratic tutor.`;

  return await callGroq(prompt);
}

export async function getSocraticReveal(topic, conversationHistory) {
  const historyText = conversationHistory
    .map((m) => `${m.role === "ai" ? "Tutor" : "Student"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a Socratic AI tutor. The student has been exploring: ${topic}

Conversation:
${historyText}

The student has asked to see the full explanation now.
Write a clear, comprehensive explanation of ${topic} that:
1. Connects to what the student already discovered in the conversation
2. Fills in the gaps
3. Uses simple language
4. Ends with "Key insight: [one sentence summary]"

Max 200 words.`;

  return await callGroq(prompt);
}

// ── HANDWRITING RECOGNITION ──
export async function handwritingToText(base64Image, mimeType = "image/jpeg") {
  if (!API_KEY) throw new Error("Groq API key not found.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64Image}` },
          },
          {
            type: "text",
            text: `You are an expert at reading handwritten notes and converting them to clean digital text.

Please carefully read ALL handwritten content in this image and transcribe it accurately.

Instructions:
- Transcribe every word exactly as written, even if there are spelling mistakes
- Preserve the structure (headings, bullet points, numbered lists)
- For diagrams or drawings, describe them in [brackets]
- For unclear words, write your best guess with a ? mark
- Format as clean, organized study notes
- If the image contains printed text (not handwritten), transcribe that too

Begin transcription:`,
          },
        ],
      }],
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Handwriting recognition failed");
  const text = data?.choices?.[0]?.message?.content;
  if (!text || text.length < 5) throw new Error("Could not read the handwriting. Please try a clearer photo.");
  return text;
}

// ── MEMORY PALACE — AI Mnemonics ──
export async function generateMnemonic(concept, answer, style = "auto") {
  const styles = {
    acronym: "Create a memorable ACRONYM where each letter stands for a key word in the answer.",
    story:   "Create a vivid, memorable SHORT STORY (2-3 sentences) that encodes the key information. Make it weird and visual.",
    rhyme:   "Create a short, catchy RHYME or song that helps remember this concept.",
    visual:  "Describe a VIVID VISUAL IMAGE or scene that represents this concept. Make it bizarre and unforgettable.",
    auto:    "Choose the BEST mnemonic type (acronym, story, rhyme, or visual image) for this specific concept and create it.",
  };

  const prompt = `You are a memory expert creating mnemonics for students.

Concept to remember: "${concept}"
Key information: "${answer}"

Task: ${styles[style] || styles.auto}

Rules:
- Make it SHORT (max 3 sentences)
- Make it MEMORABLE and WEIRD — the stranger the better
- Make it directly connected to the actual content
- Start with the type: "ACRONYM:", "STORY:", "RHYME:", or "VISUAL:"
- Then give the mnemonic

Respond with ONLY the mnemonic, nothing else.`;

  return await callGroq(prompt);
}

// Generate mnemonics for multiple flashcards at once
export async function generateMnemonicsForCards(cards) {
  const mnemonics = [];
  for (const card of cards.slice(0, 5)) { // max 5 to avoid rate limits
    try {
      const mnemonic = await generateMnemonic(card.question, card.answer);
      mnemonics.push({ question: card.question, mnemonic });
      await new Promise(r => setTimeout(r, 500)); // small delay
    } catch {
      mnemonics.push({ question: card.question, mnemonic: null });
    }
  }
  return mnemonics;
}