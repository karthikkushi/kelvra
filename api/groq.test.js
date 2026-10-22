// Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { proxyGroq } from "./groq.js";

const env = { GROQ_API_KEY: "server-key", VITE_SUPABASE_URL: "https://x.supabase.co", VITE_SUPABASE_ANON_KEY: "anon" };

function fakeFetch({ loggedIn = true } = {}) {
  const calls = [];
  const fetch = async (url, opts) => {
    calls.push({ url, opts });
    if (url.endsWith("/auth/v1/user")) return { ok: loggedIn, status: loggedIn ? 200 : 401 };
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "hi" } }] }) };
  };
  return { fetch, calls };
}

test("refuses callers who are not logged in, without calling Groq", async () => {
  for (const [token, loggedIn] of [["", true], ["bad", false]]) {
    const { fetch, calls } = fakeFetch({ loggedIn });
    const r = await proxyGroq({ body: { messages: [{ role: "user", content: "x" }] }, token, env, fetch });
    assert.equal(r.status, 401);
    assert.ok(!calls.some((c) => c.url.includes("groq.com")));
  }
});

test("text goes to the text model with the server key; extra fields are dropped", async () => {
  const { fetch, calls } = fakeFetch();
  const body = { model: "anything", stream: true, messages: [{ role: "user", content: "x" }], temperature: 0.3, max_tokens: 50 };
  const r = await proxyGroq({ body, token: "user-token", env, fetch });
  assert.equal(r.status, 200);
  assert.equal(r.data.choices[0].message.content, "hi");
  const groq = calls.find((c) => c.url.includes("groq.com"));
  assert.equal(groq.opts.headers.Authorization, "Bearer server-key");
  const sent = JSON.parse(groq.opts.body);
  assert.equal(sent.model, "openai/gpt-oss-120b");
  assert.equal(sent.stream, undefined);
  assert.equal(sent.temperature, 0.3);
  assert.equal(sent.max_completion_tokens, 50 + 1024);
});

test("images go to the vision model with thinking off; length is capped", async () => {
  const { fetch, calls } = fakeFetch();
  const content = [{ type: "image_url", image_url: { url: "data:image/png;base64,AA" } }, { type: "text", text: "read" }];
  await proxyGroq({ body: { messages: [{ role: "user", content }], max_tokens: 99999 }, token: "t", env, fetch });
  const sent = JSON.parse(calls.find((c) => c.url.includes("groq.com")).opts.body);
  assert.equal(sent.model, "qwen/qwen3.8-27b");
  assert.equal(sent.reasoning_effort, "none");
  assert.equal(sent.max_completion_tokens, 2048);
});

test("bad requests and a missing server key fail clearly", async () => {
  const { fetch } = fakeFetch();
  assert.equal((await proxyGroq({ body: {}, token: "t", env, fetch })).status, 400);
  const noKey = { ...env, GROQ_API_KEY: "" };
  const r = await proxyGroq({ body: { messages: [{ role: "user", content: "x" }] }, token: "t", env: noKey, fetch });
  assert.equal(r.status, 500);
});
