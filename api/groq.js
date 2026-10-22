// Vercel serverless function: POST /api/groq
// Keeps the Groq key on the server (env GROQ_API_KEY, no VITE_ prefix) so it never ships in the browser bundle.
// Only logged-in Kelvra users may call it: the browser sends its Supabase access token.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Change models here when Groq retires one: https://console.groq.com/docs/deprecations
const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.8-27b"; // preview model: the only Groq model that reads images (Oct 2026)
const MAX_TOKENS = 2048;
const REASONING_ROOM = 1024; // gpt-oss thinks before answering and that counts against the length limit

const hasImage = (messages) => messages.some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === "image_url"));

async function isLoggedIn(token, env, fetch) {
  if (!token) return false;
  const r = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok;
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
  const r = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: JSON.stringify(request),
  });
  return { status: r.status, data: await r.json() };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: { message: "Use POST." } });
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const { status, data } = await proxyGroq({ body: req.body, token, env: process.env, fetch });
  res.status(status).json(data);
}
