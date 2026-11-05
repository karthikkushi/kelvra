// AI usage limits per student (files starting with "_" are not routes on Vercel).
// Stops one account or a script from using up the whole Groq quota/bill.
//
// Storage: Upstash Redis REST (set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, free tier,
// available from Vercel > Storage). Without it we fall back to memory, which only counts per
// server instance: better than nothing, but not a real limit. Limits are set with env vars:
//   AI_DAILY_LIMIT  (default 120 AI calls per student per day, resets at midnight India time)
//   AI_MINUTE_LIMIT (default 15 per minute, stops bursts)

const memory = new Map(); // key -> { count, expires }

// YYYY-MM-DD in India (UTC+5:30), so the daily limit resets at Indian midnight.
export function indiaDate(now = Date.now()) {
  return new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

async function incrUpstash(key, ttlSec, env, fetch) {
  const r = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(ttlSec)]]),
  });
  if (!r.ok) throw new Error(`Upstash ${r.status}`);
  const out = await r.json();
  return Number(out?.[0]?.result);
}

function incrMemory(key, ttlSec, now) {
  const hit = memory.get(key);
  if (!hit || hit.expires < now) {
    memory.set(key, { count: 1, expires: now + ttlSec * 1000 });
    return 1;
  }
  hit.count++;
  return hit.count;
}

/**
 * Counts one AI call for this user and says whether it is allowed.
 * Fails open (allows) if the counter store is down, so a Redis outage never breaks studying.
 */
export async function checkLimit(uid, env, fetch, now = Date.now()) {
  const daily = Number(env.AI_DAILY_LIMIT) || 120;
  const perMinute = Number(env.AI_MINUTE_LIMIT) || 15;
  const dayKey = `ai:${uid}:${indiaDate(now)}`;
  const minKey = `ai:${uid}:m:${Math.floor(now / 60000)}`;
  const useRedis = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
  let dayCount, minCount;
  try {
    [dayCount, minCount] = useRedis
      ? await Promise.all([incrUpstash(dayKey, 26 * 3600, env, fetch), incrUpstash(minKey, 90, env, fetch)])
      : [incrMemory(dayKey, 26 * 3600, now), incrMemory(minKey, 90, now)];
  } catch (err) {
    console.error("AI limit check failed, allowing the call:", err.message);
    return { ok: true };
  }
  if (minCount > perMinute) {
    return { ok: false, message: "Slow down a little: too many AI requests in one minute. Try again in a minute." };
  }
  if (dayCount > daily) {
    return { ok: false, message: `You've used today's ${daily} AI requests. They reset at midnight. Your flashcards, reviews and mistakes still work.` };
  }
  return { ok: true, remaining: daily - dayCount };
}

export const _resetMemoryForTests = () => memory.clear();
