// Vercel serverless function: POST /api/groq
// Keeps the Groq key on the server (env GROQ_API_KEY, no VITE_ prefix) so it never ships in the browser bundle.
// Only logged-in Kelvra users may call it: the browser sends its Firebase ID token,
// which we check with Firebase (Identity Toolkit accounts:lookup) before calling Groq.
// Then: email must be verified (stops throwaway accounts), requests are size-checked,
// and each student has a daily/minute AI limit (api/_limits.js).
import { checkLimit } from "./_limits.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Change models here when Groq retires one: https://console.groq.com/docs/deprecations
const TEXT_MODEL = "openai/gpt-oss-120b";
const VISION_MODEL = "qwen/qwen3.8-27b"; // preview model: the only Groq model that reads images (Oct 2026)
const MAX_TOKENS = 2048;
const REASONING_ROOM = 1024; // gpt-oss thinks before answering and that counts against the length limit

const hasImage = (messages) => messages.some((m) => Array.isArray(m.content) && m.content.some((c) => c.type === "image_url"));

const LOOKUP_URL = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

const MAX_MESSAGES = 40;
const MAX_TEXT_CHARS = 60000;      // all text in one request
const MAX_IMAGE_CHARS = 5_500_000; // one base64 image (~4 MB photo)

// Returns the Firebase user ({ localId, emailVerified, ... }) for a valid, unexpired ID token, else null.
async function lookupUser(token, env, fetch) {
  if (!token || !env.VITE_FIREBASE_API_KEY) return null;
  try {
    // Local dev with `npm run emulators`: ask the Auth emulator instead of Google.
    const base = env.VITE_FIREBASE_EMULATOR === "true" ? `http://127.0.0.1:9099/${LOOKUP_URL.replace("https://", "")}` : LOOKUP_URL;
    const r = await fetch(`${base}?key=${encodeURIComponent(env.VITE_FIREBASE_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return Array.isArray(data?.users) && data.users[0]?.localId ? data.users[0] : null;
  } catch {
    return null;
  }
}

// Email verification is required unless turned off (it is off by default with the local emulators).
const requireVerified = (env) =>
  env.AI_REQUIRE_VERIFIED_EMAIL ? env.AI_REQUIRE_VERIFIED_EMAIL !== "false" : env.VITE_FIREBASE_EMULATOR !== "true";

// Rejects requests that are too big (cost and abuse protection).
export function tooBig(messages) {
  if (messages.length > MAX_MESSAGES) return "Too many messages in one request.";
  let text = 0;
  for (const m of messages) {
    if (typeof m?.content === "string") text += m.content.length;
    else if (Array.isArray(m?.content)) {
      for (const c of m.content) {
        if (c?.type === "text") text += String(c.text || "").length;
        if (c?.type === "image_url" && String(c.image_url?.url || "").length > MAX_IMAGE_CHARS) return "That image is too large. Try a smaller photo.";
      }
    } else return "Each message needs text content.";
  }
  return text > MAX_TEXT_CHARS ? "That's too much text for one request. Try a shorter part of your notes." : null;
}

export async function proxyGroq({ body, token, env, fetch }) {
  if (!env.GROQ_API_KEY) return { status: 500, data: { error: { message: "GROQ_API_KEY is not set on the server." } } };
  if (!Array.isArray(body?.messages)) return { status: 400, data: { error: { message: "messages is required." } } };
  const big = tooBig(body.messages);
  if (big) return { status: 413, data: { error: { message: big } } };
  const user = await lookupUser(token, env, fetch);
  if (!user) return { status: 401, data: { error: { message: "Please sign in again." } } };
  if (requireVerified(env) && !user.emailVerified) {
    return { status: 403, data: { error: { code: "email_not_verified", message: "Please verify your email to use AI features. Check your inbox for the link from Kelvra." } } };
  }
  const limit = await checkLimit(user.localId, env, fetch);
  if (!limit.ok) return { status: 429, data: { error: { code: "ai_limit", message: limit.message } } };

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
