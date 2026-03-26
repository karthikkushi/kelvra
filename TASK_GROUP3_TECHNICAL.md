# TASK GROUP 3: Technical Features
# Offline PWA + Handwriting Recognition + Light Mode
# Paste this into Claude Code

## CONTEXT
Kelvra is a React 18 + Vite + Tailwind CSS app at D:\Kelvra\kelvra
AI: Groq API — src/utils/claudeAPI.js
Database: Supabase — src/utils/supabase.js
Auth: user prop passed to all pages
Deployed on Vercel

## OVERVIEW OF ALL 3 FEATURES

FEATURE A — Offline PWA
Make Kelvra installable as an app on phone/desktop.
Works offline for flashcard review.
Service worker caches the app shell.
IndexedDB stores flashcards locally for offline use.

FEATURE B — Handwriting Recognition
Students take a photo of handwritten notes or whiteboard.
Groq Vision extracts the text.
Already have image upload — this is an enhanced version
specifically optimized for handwriting.
Add a dedicated "Handwriting" tab on Study page.

FEATURE C — Light Mode
Toggle between dark and light mode.
Preference saved to localStorage.
Smooth transition between modes.
All pages support both themes.

---

## STEP 1 — FEATURE C: LIGHT MODE (do this first — affects all pages)

### 1a — Create src/utils/theme.js

```js
// src/utils/theme.js
const THEME_KEY = "kelvra_theme";

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch {}
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
  }
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Apply theme on page load
export function initTheme() {
  applyTheme(getTheme());
}
```

### 1b — Update src/main.jsx

Open src/main.jsx and add these lines at the top:
```js
import { initTheme } from "./utils/theme";
initTheme(); // Apply saved theme before React renders
```

### 1c — Add light mode CSS variables to src/index.css

Open src/index.css and add after the existing :root styles:
```css
/* Light mode overrides */
.light {
  --color-background: #f8f9fc;
  --color-surface-container-low: #ffffff;
  --color-surface-container-high: #f0f2f8;
  --color-surface-container-highest: #e8eaf2;
  --color-on-surface: #1a1c25;
  --color-on-surface-variant: #44475a;
  --color-outline-variant: #c8cad8;
}

/* Smooth theme transition */
*, *::before, *::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}
```

### 1d — Create ThemeToggle component src/components/ThemeToggle.jsx

```jsx
// src/components/ThemeToggle.jsx
import { useState } from "react";
import { toggleTheme, getTheme } from "../utils/theme";

export default function ThemeToggle({ compact = false }) {
  const [theme, setThemeState] = useState(getTheme());

  const handleToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <span className="material-symbols-outlined text-on-surface-variant text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          {isDark ? "light_mode" : "dark_mode"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${
        isDark
          ? "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
          : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
      }`}>
      <span className="material-symbols-outlined text-sm"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
```

### 1e — Add ThemeToggle to DashboardPage.jsx header

Open src/pages/DashboardPage.jsx.

Add import:
```js
import ThemeToggle from "../components/ThemeToggle";
```

Find the top header bar (the fixed header with streak pill and avatar).
Add ThemeToggle between the streak pill and avatar:
```jsx
<ThemeToggle compact={true} />
```

### 1f — Add ThemeToggle to Sidebar bottom

In the Sidebar component in DashboardPage.jsx,
find the bottom section with Settings and Help buttons.
Add ThemeToggle above them:
```jsx
<div className="px-4 mb-2">
  <ThemeToggle />
</div>
```

### 1g — Remove hardcoded "dark" className from all page root divs

Search all files in src/pages/ for:
```
className="dark min-h-screen
```
Replace ALL occurrences with:
```
className="min-h-screen
```

IMPORTANT: Do this for EVERY page file:
- LandingPage.jsx
- AuthPage.jsx
- OnboardingPage.jsx
- DashboardPage.jsx
- StudyPage.jsx
- FlashcardsPage.jsx
- QuizPage.jsx
- ProgressPage.jsx
- FocusPage.jsx
- AgentsPage.jsx
- LeaderboardPage.jsx
- SocraticPage.jsx
- PricingPage.jsx (if exists)

The "dark" class is now controlled by the html element via initTheme(),
so it should NOT be hardcoded in each page div anymore.

---

## STEP 2 — FEATURE B: HANDWRITING RECOGNITION

### 2a — Add handwritingToText function to claudeAPI.js

Open src/utils/claudeAPI.js and add at the bottom:

```js
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
```

### 2b — UPDATE StudyPage.jsx to add Handwriting tab

Open src/pages/StudyPage.jsx.

Add import:
```js
import { handwritingToText } from "../utils/claudeAPI";
```

Find the TABS array at the top of the file:
```js
const TABS = [
  { id: "paste",  icon: "notes",           label: "Paste Notes" },
  { id: "topic",  icon: "edit_note",       label: "Type Topic" },
  { id: "pdf",    icon: "picture_as_pdf",  label: "Upload PDF" },
  { id: "image",  icon: "image",           label: "Upload Image" },
];
```

Replace with:
```js
const TABS = [
  { id: "paste",       icon: "notes",           label: "Paste Notes" },
  { id: "topic",       icon: "edit_note",       label: "Type Topic" },
  { id: "pdf",         icon: "picture_as_pdf",  label: "Upload PDF" },
  { id: "image",       icon: "image",           label: "Upload Image" },
  { id: "handwriting", icon: "draw",            label: "Handwriting" },
];
```

Add new state variables for handwriting:
```js
const [hwFile, setHwFile] = useState(null);
const [hwPreview, setHwPreview] = useState("");
const [hwText, setHwText] = useState("");
const [hwLoading, setHwLoading] = useState(false);
const [hwError, setHwError] = useState("");
const hwInputRef = useRef();
```

Add hwText to getContent():
Find getContent() and add:
```js
if (tab === "handwriting") return hwText.trim();
```

Add handler function:
```js
const handleHandwritingUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!["image/jpeg","image/jpg","image/png","image/webp"].includes(file.type)) {
    setHwError("Please upload a JPG or PNG photo of your handwritten notes.");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    setHwError("Image too large. Please use a photo under 10MB.");
    return;
  }
  setHwFile(file);
  setHwPreview(URL.createObjectURL(file));
  setHwError("");
  setHwText("");
  setHwLoading(true);
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const extracted = await handwritingToText(base64, file.type);
    setHwText(extracted);
  } catch (err) {
    setHwError(err.message || "Could not read handwriting. Try a clearer photo with good lighting.");
  } finally {
    setHwLoading(false);
  }
};
```

Add handwriting tab JSX — find the existing tabs content area and add:
```jsx
{tab === "handwriting" && (
  <div className="relative" style={{ minHeight: 280 }}>
    <input
      ref={hwInputRef}
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      onChange={handleHandwritingUpload}
      className="hidden"
    />

    {!hwFile && !hwLoading && (
      <div
        onClick={() => hwInputRef.current?.click()}
        className="h-72 bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary-container/40 hover:bg-surface-container transition-all">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-container text-3xl">draw</span>
        </div>
        <div className="text-center px-8">
          <p className="text-on-surface font-bold">Photo your handwritten notes</p>
          <p className="text-on-surface-variant text-sm mt-1">
            Take a clear photo of your notebook, whiteboard, or any handwritten content
          </p>
          <p className="text-on-surface-variant/60 text-xs mt-2">JPG, PNG · Max 10MB · Good lighting recommended</p>
        </div>
      </div>
    )}

    {hwLoading && (
      <div className="h-72 bg-surface-container-low border border-outline-variant/15 rounded-2xl flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-on-surface font-medium">Reading your handwriting...</p>
          <p className="text-on-surface-variant text-sm mt-1">AI is transcribing your notes</p>
        </div>
      </div>
    )}

    {hwFile && !hwLoading && hwText && (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {hwPreview && (
            <img src={hwPreview} alt="Uploaded" className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-on-surface">{hwFile.name}</p>
            <p className="text-xs text-primary-container mt-0.5">✓ {hwText.split(" ").length} words extracted</p>
          </div>
          <button onClick={() => { setHwFile(null); setHwPreview(""); setHwText(""); }}
            className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-5 max-h-48 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Extracted text</p>
          <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{hwText}</p>
        </div>
        <button onClick={() => hwInputRef.current?.click()}
          className="text-xs text-primary-container hover:underline">
          Upload different photo
        </button>
      </div>
    )}

    {hwError && (
      <div className="mt-3 bg-error-container/10 border border-error/20 rounded-xl px-4 py-3 text-error text-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">error</span>
        {hwError}
      </div>
    )}
  </div>
)}
```

---

## STEP 3 — FEATURE A: OFFLINE PWA

### 3a — Create public/manifest.json

Create the file public/manifest.json:
```json
{
  "name": "Kelvra — AI Study App",
  "short_name": "Kelvra",
  "description": "AI-powered study companion — flashcards, quiz, summary and study plan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0d0f14",
  "theme_color": "#6ee7b7",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "productivity"],
  "screenshots": [],
  "shortcuts": [
    {
      "name": "Study Now",
      "url": "/study",
      "description": "Start a new study session"
    },
    {
      "name": "Flashcards",
      "url": "/flashcards",
      "description": "Review your flashcards"
    }
  ]
}
```

### 3b — Create placeholder icons

Since we can't generate real PNG icons here, create simple SVG icons and save as PNG.
Tell Claude Code to create these files:

Create public/icon-192.png and public/icon-512.png.
For now, use this approach — create a script that generates them:

Create scripts/generate-icons.mjs:
```js
// Run: node scripts/generate-icons.mjs
// This creates simple placeholder icons

import { writeFileSync, mkdirSync } from "fs";

// Simple green circle SVG as base64 encoded PNG placeholder
// In production, replace with real app icons
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#0d0f14"/>
  <circle cx="96" cy="96" r="50" fill="#6ee7b7" opacity="0.15"/>
  <text x="96" y="110" font-family="Arial" font-size="64" font-weight="bold" fill="#6ee7b7" text-anchor="middle">K</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0d0f14"/>
  <circle cx="256" cy="256" r="140" fill="#6ee7b7" opacity="0.15"/>
  <text x="256" y="310" font-family="Arial" font-size="200" font-weight="bold" fill="#6ee7b7" text-anchor="middle">K</text>
</svg>`;

writeFileSync("public/icon-192.svg", svg192);
writeFileSync("public/icon-512.svg", svg512);
console.log("Icons created as SVG. For production, convert to PNG.");
```

Run: node scripts/generate-icons.mjs

Then update manifest.json to use SVG icons:
```json
"icons": [
  {
    "src": "/icon-192.svg",
    "sizes": "192x192",
    "type": "image/svg+xml"
  },
  {
    "src": "/icon-512.svg",
    "sizes": "512x512",
    "type": "image/svg+xml"
  }
]
```

### 3c — Update index.html for PWA

Open index.html and add inside the <head> tag:
```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#6ee7b7" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Kelvra" />
<link rel="apple-touch-icon" href="/icon-192.svg" />
<meta name="mobile-web-app-capable" content="yes" />
```

### 3d — Install vite-plugin-pwa

Run in terminal:
```bash
npm install -D vite-plugin-pwa
```

### 3e — Update vite.config.js for PWA

Open vite.config.js and replace its content with:
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "Kelvra — AI Study App",
        short_name: "Kelvra",
        description: "AI-powered study companion",
        theme_color: "#6ee7b7",
        background_color: "#0d0f14",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        // Cache app shell
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // Cache strategies
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Cache Material Symbols
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Network first for API calls
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // Network first for Supabase
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
      },
    }),
  ],
});
```

### 3f — Create src/utils/offlineStorage.js for offline flashcards

```js
// src/utils/offlineStorage.js
// Store flashcards in IndexedDB for offline review

const DB_NAME = "kelvra_offline";
const DB_VERSION = 1;
const STORE_NAME = "flashcards";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("topic", "topic", { unique: false });
        store.createIndex("savedAt", "savedAt", { unique: false });
      }
    };
  });
}

// Save a flashcard set offline
export async function saveFlashcardsOffline(topic, cards) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const id = `${topic}_${Date.now()}`;
    store.put({ id, topic, cards, savedAt: new Date().toISOString() });
    return new Promise((resolve) => { tx.oncomplete = () => resolve(true); });
  } catch (err) {
    console.error("Offline save error:", err);
    return false;
  }
}

// Get all saved offline flashcard sets
export async function getOfflineFlashcards() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// Delete an offline set
export async function deleteOfflineSet(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    return true;
  } catch {
    return false;
  }
}

// Check if app is offline
export function isOffline() {
  return !navigator.onLine;
}
```

### 3g — Add "Save for offline" button to StudyPage.jsx results

Open src/pages/StudyPage.jsx.

Add import:
```js
import { saveFlashcardsOffline } from "../utils/offlineStorage";
```

Add state:
```js
const [savedOffline, setSavedOffline] = useState(false);
```

Add button in the results action row:
```jsx
{results.flashcards && (
  <button
    onClick={async () => {
      const content = getContent();
      await saveFlashcardsOffline(content || "Study Kit", results.flashcards);
      setSavedOffline(true);
      setTimeout(() => setSavedOffline(false), 3000);
    }}
    className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2">
    <span className="material-symbols-outlined text-sm">
      {savedOffline ? "check" : "download"}
    </span>
    {savedOffline ? "Saved!" : "Save offline"}
  </button>
)}
```

### 3h — Add offline indicator to App.jsx

Open src/App.jsx and add this at the top of the returned JSX:
```jsx
{/* Offline banner */}
{typeof window !== "undefined" && !navigator.onLine && (
  <div className="fixed top-0 left-0 right-0 z-[100] bg-error-container/90 text-error text-center py-2 text-xs font-bold uppercase tracking-widest">
    You are offline — saved content still available
  </div>
)}
```

---

## STEP 4 — ADD install prompt for PWA

Create src/components/InstallPrompt.jsx:

```jsx
// src/components/InstallPrompt.jsx
import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show banner after 30 seconds
      setTimeout(() => setShowBanner(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") setInstalled(true);
    setShowBanner(false);
  };

  if (!showBanner || installed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50">
      <div className="bg-surface-container-high border border-primary-container/20 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-on-primary-container text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-on-surface">Install Kelvra</p>
          <p className="text-xs text-on-surface-variant">Study offline, any time</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBanner(false)}
            className="text-on-surface-variant hover:text-on-surface text-xs p-1">
            Not now
          </button>
          <button onClick={handleInstall}
            className="px-3 py-1.5 bg-primary-container text-on-primary-container font-bold rounded-lg text-xs">
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Add InstallPrompt to App.jsx

In App.jsx add:
```js
import InstallPrompt from "./components/InstallPrompt";
```

Add inside the return, after the Routes:
```jsx
<InstallPrompt />
```

---

## STEP 5 — VERIFY AND TEST

### Light Mode
1. npm run dev
2. Go to any page — should look dark (default)
3. Click the sun/moon icon in dashboard header
4. Page smoothly transitions to light mode
5. Refresh page — light mode should persist
6. Check all 8+ pages in both modes — no broken colors

### Handwriting
1. Go to /study
2. Click the 5th tab "Handwriting" (draw icon)
3. Upload a photo of handwritten text
4. AI should extract and show the text
5. Click Generate → creates study kit from handwritten notes

### PWA
1. npm run build && npm run preview
2. Open in Chrome → DevTools → Application → Manifest
3. Should show Kelvra manifest loaded
4. Application → Service Workers → should show registered
5. Click "Add to homescreen" option in Chrome
6. App installs on desktop
7. Open installed app — works like a native app
8. Turn off wifi → open installed app → app shell still loads

---

## STEP 6 — COMMIT

```bash
git add .
git commit -m "feat: add light mode, handwriting recognition, and PWA offline support"
git push origin main
```

## IMPORTANT NOTES

1. PWA only works fully in production (after Vercel deploy) — in dev mode it's partially supported
2. Light mode needs careful testing — some hardcoded colors (bg-[#xxx]) need updating to use CSS variables
3. If any pages still look wrong in light mode, search for bg-background and text-on-surface —
   these should automatically adapt if Tailwind config maps them to CSS variables correctly
4. The service worker caches the app shell — first load requires internet, subsequent loads work offline
5. IndexedDB offline storage works in all modern browsers
6. For production icons, replace the SVG placeholders with proper 192x192 and 512x512 PNG icons
