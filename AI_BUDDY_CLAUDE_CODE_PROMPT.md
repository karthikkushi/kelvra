# TASK: Implement AI Voice Buddy Toggle in Kelvra
# Paste this into Claude Code

## CONTEXT
Kelvra is a React 18 + Vite + Tailwind CSS app at D:\Kelvra\kelvra
The AI Buddy toggle button exists in the UI on StudyPage.jsx and FlashcardsPage.jsx
BUT it currently does NOTHING — it only changes visual state, no actual voice functionality

## YOUR FIRST JOB — AUDIT
Before writing any code, read these files and tell me exactly what the toggle does currently:
- src/pages/StudyPage.jsx — find the voiceBuddy state and toggle button
- src/pages/FlashcardsPage.jsx — find the voiceOpen state and voice buddy UI
- src/pages/QuizPage.jsx — find any voice-related code

For each file report:
1. Does the toggle change any state? (yes/no)
2. Does that state actually DO anything beyond show/hide a UI element? (yes/no)
3. Is there any actual speech or audio code? (yes/no)

## YOUR SECOND JOB — CREATE voice.js
Create a new file at src/utils/voice.js with this exact content:

```js
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
```

## YOUR THIRD JOB — UPDATE StudyPage.jsx

Find the AI Buddy toggle section in StudyPage.jsx. It will look something like:
```jsx
const [voiceBuddy, setVoiceBuddy] = useState(true);
```
And a toggle button somewhere in the header.

Make these EXACT changes:

### Change 1 — Update imports at the top
Add this import after the existing imports:
```js
import { speak, stopSpeaking, getVoiceEnabled, setVoiceEnabled, isSpeechSupported } from "../utils/voice";
```

### Change 2 — Fix the voiceBuddy state initialization
Replace:
```js
const [voiceBuddy, setVoiceBuddy] = useState(true);
```
With:
```js
const [voiceBuddy, setVoiceBuddy] = useState(getVoiceEnabled());
```

### Change 3 — Fix the toggle button onClick
Find the toggle button for voiceBuddy. It will have an onClick that just calls setVoiceBuddy(!voiceBuddy).
Replace that onClick with:
```js
onClick={() => {
  const next = !voiceBuddy;
  setVoiceBuddy(next);
  setVoiceEnabled(next);
  if (!next) stopSpeaking();
  else speak("AI Buddy is now on. I will read your study materials.");
}}
```

### Change 4 — Speak summary when results appear
Find where setResults(generated) is called after AI generation completes.
Add this right after setResults(generated):
```js
if (voiceBuddy && generated.summary?.paragraphs?.[0]) {
  setTimeout(() => speak("Here is your summary. " + generated.summary.paragraphs[0]), 500);
}
```

### Change 5 — Update the toggle button display text
Find where the toggle button shows "ON" or "OFF" text.
Make sure it reads from voiceBuddy state (it probably already does, just verify).

## YOUR FOURTH JOB — UPDATE FlashcardsPage.jsx

### Change 1 — Add imports
```js
import { speak, stopSpeaking, getVoiceEnabled, setVoiceEnabled, isSpeechSupported } from "../utils/voice";
```

### Change 2 — Fix voiceOpen state
Find:
```js
const [voiceOpen, setVoiceOpen] = useState(true);
```
Replace with:
```js
const [voiceOn, setVoiceOn] = useState(getVoiceEnabled());
```

### Change 3 — Add useEffect to speak answer on flip
Add this useEffect inside the FlashcardsPage component, after the existing state declarations:
```js
useEffect(() => {
  if (flipped && voiceOn && card?.answer) {
    speak(card.answer);
  } else {
    stopSpeaking();
  }
}, [flipped, index]);
```
NOTE: You will need to add useEffect to the React import at the top: import { useState, useEffect } from "react";

### Change 4 — Find the AI Buddy close button or toggle in FlashcardsPage
The current UI has a floating AI Buddy panel with a close button.
Replace the entire floating voice buddy panel JSX with this cleaner toggle button in the header area:
```jsx
{isSpeechSupported() && (
  <button
    onClick={() => {
      const next = !voiceOn;
      setVoiceOn(next);
      setVoiceEnabled(next);
      if (!next) stopSpeaking();
      else speak("Voice buddy is on. I will read the answers for you.");
    }}
    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${
      voiceOn
        ? "bg-primary-container/10 border-primary-container/30 text-primary-container"
        : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
    }`}
  >
    <span
      className="material-symbols-outlined text-sm"
      style={{ fontVariationSettings: voiceOn ? "'FILL' 1" : "'FILL' 0" }}
    >
      {voiceOn ? "volume_up" : "volume_off"}
    </span>
    AI Buddy {voiceOn ? "ON" : "OFF"}
  </button>
)}
```
Place this button in the header section next to the mastery percentage text.

### Change 5 — Add speaker icon on card back
Inside the card BACK div, add a speak button:
```jsx
<button
  onClick={(e) => { e.stopPropagation(); speak(card.answer); }}
  className="absolute top-6 right-8 p-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright transition-colors"
>
  <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_up</span>
</button>
```

## YOUR FIFTH JOB — UPDATE QuizPage.jsx

### Change 1 — Add imports
```js
import { speak, stopSpeaking, getVoiceEnabled, setVoiceEnabled, isSpeechSupported } from "../utils/voice";
```

### Change 2 — Add voice state
Add after existing useState declarations:
```js
const [voiceOn, setVoiceOn] = useState(getVoiceEnabled());
```

### Change 3 — Read question aloud when it changes
Add this useEffect:
```js
useEffect(() => {
  if (voiceOn && q?.question) {
    setTimeout(() => speak(q.question), 300);
  }
  return () => stopSpeaking();
}, [qIndex]);
```

### Change 4 — Read explanation after answering
Find where the answer function sets showExplanation(true).
After that line add:
```js
if (voiceOn) {
  const prefix = id === q.correct ? "Correct!" : "Not quite.";
  setTimeout(() => speak(prefix + " " + q.explanation), 500);
}
```

### Change 5 — Wire up the existing volume_up button on the question card
Find this button (it already exists in the JSX):
```jsx
<button className="p-3 bg-surface-container-highest rounded-full text-primary-fixed hover:scale-110 transition-transform">
  <span className="material-symbols-outlined" style={{ fontVariationSettings:"'FILL' 1" }}>volume_up</span>
</button>
```
Add onClick to it:
```jsx
onClick={() => speak(q.question)}
```

### Change 6 — Add voice toggle to quiz header
In the header area near the close button, add:
```jsx
{isSpeechSupported() && (
  <button
    onClick={() => {
      const next = !voiceOn;
      setVoiceOn(next);
      setVoiceEnabled(next);
      if (!next) stopSpeaking();
      else speak("Voice buddy is on.");
    }}
    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${
      voiceOn
        ? "bg-primary-container/10 border-primary-container/30 text-primary-container"
        : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
    }`}
  >
    <span
      className="material-symbols-outlined text-sm"
      style={{ fontVariationSettings: voiceOn ? "'FILL' 1" : "'FILL' 0" }}
    >
      {voiceOn ? "volume_up" : "volume_off"}
    </span>
    {voiceOn ? "ON" : "OFF"}
  </button>
)}
```

## YOUR SIXTH JOB — VERIFY AND TEST

After making all changes, run the dev server and check:
1. Does npm run dev start without errors?
2. Open localhost:5173/flashcards — does the AI Buddy toggle appear in the header?
3. Click toggle ON — does it say "Voice buddy is on" in the browser?
4. Flip a card — does it read the answer aloud?
5. Open localhost:5173/quiz — does it read the first question?
6. Answer a question — does it read the explanation?
7. Turn voice OFF — does it stop speaking?
8. Refresh the page — does the toggle remember its state?

## IMPORTANT RULES
- NEVER remove existing JSX or components — only ADD to them
- If a file import already has useState, add useEffect to the same line: import { useState, useEffect } from "react"
- The voice only works in Chrome, Edge, and Safari — NOT in Firefox (Web Speech API limitation)
- Always wrap speak() calls in: if (voiceOn) { ... }
- Always call stopSpeaking() when navigating away from a page
- The STORAGE_KEY "kelvra_voice" must be consistent across all files — use the voice.js utility, never call localStorage directly
- After all changes, do: git add . && git commit -m "feat: implement AI voice buddy with Web Speech API"
