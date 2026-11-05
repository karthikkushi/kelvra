// src/utils/hash.js
// Short, stable id from text (djb2). The same question always gets the same id,
// so saving it twice updates one record instead of making a duplicate.
export function textId(text, prefix = "") {
  const clean = String(text).trim().toLowerCase().replace(/\s+/g, " ");
  let h = 5381;
  for (let i = 0; i < clean.length; i++) h = ((h << 5) + h + clean.charCodeAt(i)) >>> 0;
  return `${prefix}${h.toString(36)}${clean.length.toString(36)}`;
}

// YYYY-MM-DD in the student's own time zone (not UTC), so "today" flips at their midnight.
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Random id that works everywhere (crypto.randomUUID needs https and a newer browser; this does not).
export function randomId(length = 20) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => chars[b % 36]).join("");
}
