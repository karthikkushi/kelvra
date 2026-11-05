// Vercel serverless function: POST /api/groq
// Keeps the Groq key on the server (env GROQ_API_KEY, no VITE_ prefix) so it never ships in the browser bundle.
// Only logged-in Kelvra users may call it: the browser sends its Firebase ID token,
// which we check with Firebase (Identity Toolkit accounts:lookup) before calling Groq.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Change models here when Groq retires one: https://console.groq.com/docs/deprecations
const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.8-27b"; // preview model: the only Groq model that reads images (Oct 2026)
const MAX_TOKENS = 2048;
const REASONING_ROOM = 1024; // gpt-oss thinks before answering and that counts against the length limit

const hasImage = (messages) => messages.some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === "image_url"));

const LOOKUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

// True when Firebase says the token is a valid, unexpired ID token for this project.
async function isLoggedIn(token, env, fetch) {
  if (!token || !env.VITE_FIREBASE_API_KEY) return false;
  try {
    // Local dev with `npm run emulators`: ask the Auth emulator instead of Google.
    const base = env.VITE_FIREBASE_EMULATOR === "true" ? `http://127.0.0.1:9099/${LOOKUP_URL.replace("https://", "")}` : LOOKUP_URL;
    const r = await fetch(`${base}?key=${encodeURIComponent(env.VITE_FIREBASE_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!r.ok) return false;
    const data = await r.json();
    return Array.isArray(data?.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export async function proxyGroq({ body, token, env, fetch }) {
  if (!env.GROQ_API_KEY) return { status: 500, data: { error: { message: "GROQ_API_KEY is not set on the server." } } };
  if (!Array.isArray(body?.messages)) return { status: 400, data: { error: { message: "messages is required." } } };
  if (!(await isLoggedIn(token, env, fetch))) return { status: 401, data: { error: { message: "Please sign in again." } } };

  const vision = hasImage(body.messages);
  const tokens = Math.min(Math.max(Number(body.max_tokens) || MAX_TOKENS, 1), MAX_TOKENS);
  const request = {
    messages: body.messages,
    temperature: body.temperature,
    ...(vision
      ? { model: VISION_MODEL, reasoning_effort: "none", max_completion_tokens: tokens }
      : { model: TEXT_MODEL, reasoning_effort: "low", include_reasoning: false, max_completion_tokens: tokens + REASONING_ROOM }),
  };
  let r;
  try {
    r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
      body: JSON.stringify(request),
    });
  } catch {
    return { status: 502, data: { error: { message: "Could not reach the AI service. Try again in a moment." } } };
  }
  const data = await r.json().catch(() => ({ error: { message: "The AI service sent an unreadable answer." } }));
  return { status: r.status, data };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST." } });
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const { status, data } = await proxyGroq({ body: req.body, token, env: process.env, fetch });
  res.status(status).json(data);
}
