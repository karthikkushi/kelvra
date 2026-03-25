// src/utils/voice.js
// AI Voice Buddy using Web Speech API — free, built into all browsers

const STORAGE_KEY = "kelvra_voice";

export const isSpeechSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

export const getVoiceEnabled = () => {
  try { return localStorage.getItem(STORAGE_KEY) === "true"; }
  catch { return false; }
};

export const setVoiceEnabled = (enabled) => {
  try { localStorage.setItem(STORAGE_KEY, String(enabled)); }
  catch {}
};

function getBestVoice() {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0] || null
  );
}

export function speak(text, options = {}) {
  if (!isSpeechSupported()) return;
  if (!getVoiceEnabled()) return;
  window.speechSynthesis.cancel();
  if (!text) return;
  const clean = text
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/#{1,6}/g, "").replace(/`/g, "")
    .slice(0, 400);
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;
  const voice = getBestVoice();
  if (voice) utterance.voice = voice;
  if (options.onEnd) utterance.onend = options.onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking() {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}
