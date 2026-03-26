# KELVRA — AI Study App — Claude Code Master Prompt
# Paste this entire prompt into Claude Code to complete all remaining work

## PROJECT OVERVIEW
Kelvra is an AI-powered study companion built with React 18 + Vite + Tailwind CSS.
- Location: D:\Kelvra\kelvra
- Live URL: https://kelvra-lj0k9zmik-karthikkushis-projects.vercel.app
- AI: Groq API (llama-3.3-70b-versatile) — key in .env as VITE_GROQ_API_KEY
- Auth + DB: Supabase — keys in .env as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Deployed on: Vercel

## CURRENT FILE STRUCTURE
src/
├── pages/
│   ├── LandingPage.jsx       ✅ done
│   ├── OnboardingPage.jsx    ✅ done
│   ├── DashboardPage.jsx     ✅ done (exports Sidebar component)
│   ├── StudyPage.jsx         ✅ done (AI generation working with Groq)
│   ├── FlashcardsPage.jsx    ✅ done
│   ├── QuizPage.jsx          ✅ done
│   ├── ProgressPage.jsx      ✅ done
│   ├── FocusPage.jsx         ✅ done
│   └── AuthPage.jsx          ✅ done (login + signup)
├── utils/
│   ├── claudeAPI.js          ✅ done (Groq API calls)
│   └── supabase.js           ✅ done (auth helpers)
├── App.jsx                   ✅ done (protected routes)
└── main.jsx                  ✅ done

## DESIGN SYSTEM
- Color tokens (already in tailwind.config.js):
  - Background: bg-background (#0d0f14)
  - Surface low: bg-surface-container-low (#14171f)
  - Surface high: bg-surface-container-highest (#1c2030)
  - Accent green: text-primary-container / bg-primary-container (#6ee7b7)
  - Error: text-error / bg-error-container
  - Fonts: Space Grotesk (font-headline), Manrope (font-body), font-label
- Rule: 60% dark background, 30% surface containers, 10% green accent
- All pages use className="dark" on root div
- Material Symbols Outlined icons loaded via Google Fonts CDN

---

## TASK 1 — FIX COLOR SYSTEM (Priority: High)

The 60-30-10 Marvel color rule is not consistently applied across all screens.
Please audit every page and fix the following:

### LandingPage.jsx
- Hero section background must be bg-background (#0d0f14) — pure dark, no gradients that are too bright
- All CTA buttons must use bg-primary-container text-on-primary-container
- Feature cards must use bg-surface-container-low with border border-outline-variant/10
- Heading text must be text-on-surface, body text text-on-surface-variant
- The green accent (#6ee7b7) should only appear on: CTAs, highlights, icons, active states — NOT as backgrounds

### All pages (Dashboard, Study, Flashcards, Quiz, Progress, Focus)
- Sidebar: bg-surface-container-low, active item: bg-surface-container-highest text-primary-container
- Top header bar: bg-background/80 backdrop-blur-xl
- Cards and panels: bg-surface-container-low border border-outline-variant/10
- Primary buttons: bg-primary-container text-on-primary-container rounded-xl
- Secondary buttons: border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest
- Progress bars: bg-primary-container for fill, bg-surface-container-highest for track
- Tags/badges: bg-surface-container-highest text-on-surface-variant
- Error states: bg-error-container/10 text-error border-error/20

### Specific fixes needed:
- QuizPage: option buttons on hover should show border-primary-container/40, not white
- FlashcardsPage: card back should be bg-surface-container-high not white
- ProgressPage: chart bars should be bg-primary-container, inactive bars bg-primary-container/20
- FocusPage: timer ring stroke should be #6ee7b7, background ring should be surface-variant/20
- AuthPage: form inputs bg-surface-container-highest, focus border-primary-container/50

---

## TASK 2 — SUPABASE DATABASE TABLES (Priority: High)

Run this SQL in the Supabase SQL Editor (supabase.com → your project → SQL Editor):

```sql
-- Study sessions table
create table if not exists study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  topic text,
  summary text,
  flashcards text,
  quiz text,
  plan text,
  created_at timestamptz default now()
);

-- Quiz scores table
create table if not exists quiz_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  topic text,
  score int,
  total int,
  pct int,
  created_at timestamptz default now()
);

-- Row level security
alter table study_sessions enable row level security;
alter table quiz_scores enable row level security;

create policy "Users see own sessions" on study_sessions
  for all using (auth.uid() = user_id);
create policy "Users see own scores" on quiz_scores
  for all using (auth.uid() = user_id);
```

After creating tables, update StudyPage.jsx to save sessions:
- After successful generation, call saveStudySession(user.id, topic, generated) from supabase.js
- Wrap in try/catch — never block the UI if save fails

Update QuizPage.jsx to save scores:
- On quiz completion, call saveQuizScore(user.id, topic, score, total) from supabase.js
- Wrap in try/catch

---

## TASK 3 — CONNECT REAL DATA TO PROGRESS PAGE (Priority: High)

Currently ProgressPage.jsx shows hardcoded fake data.
Update it to load real data from Supabase:

1. Add useEffect to fetch study_sessions and quiz_scores for the logged-in user
2. Calculate real stats:
   - Total sessions this week for the weekly chart
   - Average quiz score for exam readiness gauge
   - Topics with lowest average scores for weak spots
   - Topics with scores above 80% for mastered topics
3. Show a loading skeleton while data loads
4. Fall back to empty state with "Start studying to see your progress" if no data yet
5. Keep the same visual design — just replace fake data with real data

---

## TASK 4 — PDF UPLOAD (Priority: Medium)

The PDF tab on StudyPage.jsx currently shows "coming soon".
Implement real PDF text extraction:

1. Install pdf.js: npm install pdfjs-dist
2. In StudyPage.jsx, when a PDF is uploaded:
   - Use pdfjs-dist to extract all text from the PDF
   - Show a progress indicator while extracting
   - Store extracted text in state
   - Use this text as the content for AI generation (same as paste notes)
3. Set worker: pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
4. Handle errors: show "Could not read PDF. Try a text-based PDF, not a scanned image."
5. Show filename and page count after successful extraction

---

## TASK 5 — IMAGE UPLOAD (Priority: Medium)

The Image tab on StudyPage.jsx currently shows "coming soon".
Implement image-to-text using Groq's vision capability:

1. When an image is uploaded, convert it to base64
2. Send to Groq API with vision model (llama-3.2-11b-vision-preview)
3. Prompt: "Extract and transcribe all text from this image. If it contains diagrams or charts, describe them in text form suitable for studying."
4. Use the returned text as study content
5. Supported formats: JPG, PNG, WEBP — max 5MB
6. Show a preview thumbnail of the uploaded image

In claudeAPI.js add this function:
```js
export async function extractTextFromImage(base64Image, mimeType) {
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
          { type: "text", text: "Extract and transcribe all text from this image. If it contains diagrams, describe them in text suitable for studying." }
        ]
      }],
      max_tokens: 2048,
    }),
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}
```

---

## TASK 6 — AI VOICE BUDDY (Priority: Medium)

The voice buddy component exists in FlashcardsPage.jsx but uses fake waveform animation.
Implement real text-to-speech using Web Speech API (free, built into browsers):

1. In FlashcardsPage.jsx, when a card is flipped to show the answer:
   - Use window.speechSynthesis.speak() to read the answer aloud
   - Create a SpeechSynthesisUtterance with the answer text
   - Set rate: 0.9, pitch: 1, voice: first English voice available
2. Add a speaker button next to each card to trigger TTS manually
3. In QuizPage.jsx, add TTS for question text when clicking the volume_up button (already in UI)
4. Add a global voice settings toggle:
   - Store preference in localStorage key "kelvra_voice"
   - Default: false (off)
   - When off, never auto-read
   - When on, auto-read card answers and quiz questions

---

## TASK 7 — REAL DASHBOARD DATA (Priority: Medium)

Currently DashboardPage.jsx shows hardcoded stats (12 streak, 34 topics, etc).
Connect to real Supabase data:

1. Fetch last 30 days of study_sessions and quiz_scores for the user
2. Calculate:
   - Streak: count consecutive days with at least one session
   - Topics mastered: count unique topics with avg quiz score > 80%
   - Quiz accuracy: average pct across all quiz_scores
   - Study hours: total sessions × 0.5 (estimate 30 min per session)
3. For AI Coach card: find the topic not studied in the longest time and show it
4. For Today's study plan: show last 3 topics studied that scored below 80%
5. For Weak spots: top 3 topics with lowest average quiz scores
6. Show skeleton loaders while data fetches

---

## TASK 8 — MOBILE RESPONSIVENESS FIXES (Priority: Medium)

Test and fix these known mobile issues:

1. StudyPage: output format grid (2x2) should stack to 2x2 on mobile (already good) but language dropdowns should be full width
2. FlashcardsPage: card should be full width on mobile, rating buttons should be larger tap targets (min 48px height)
3. QuizPage: option buttons on mobile should be full width stacked, not 2-column grid
4. ProgressPage: bento grid on mobile should be single column
5. DashboardPage: study plan tasks should have larger tap targets on mobile
6. All pages: bottom mobile nav should have safe-area padding for iPhone notch: pb-safe or padding-bottom: env(safe-area-inset-bottom)
7. FocusPage: timer text should scale down on small screens using text-[5rem] sm:text-[7rem] md:text-[9rem]

---

## TASK 9 — LANDING PAGE IMPROVEMENTS (Priority: Medium)

Make the landing page more compelling for conversion:

1. Add a "How it works" section with 3 steps:
   - Step 1: Paste your notes or type any topic
   - Step 2: AI generates flashcards, quiz, summary and study plan
   - Step 3: Study smarter with spaced repetition and voice buddy
   
2. Add a live demo section showing a sample AI output (hardcoded but looks real)

3. Update the CTA button to go to /auth instead of /onboarding:
   - "Get Started Free" → navigate("/auth")
   - After login/signup → redirect to /onboarding (first time) or /dashboard (returning)

4. Add a stats bar: "10,000+ students • 50+ languages • Free forever"

5. Add testimonials section with 3 fake but realistic student quotes

---

## TASK 10 — ONBOARDING → SAVE PREFERENCES (Priority: Low)

Currently OnboardingPage.jsx collects preferences but throws them away.
Save them to Supabase:

1. After the user clicks "Start Learning" on step 3:
   - Save to user_metadata via supabase.auth.updateUser({ data: { study_type, goal, learning_style } })
   - Then navigate to /dashboard
2. On DashboardPage, read these preferences:
   - If learning_style === "Visual" → show more chart-based content
   - If goal === "Pass an exam" → show exam countdown widget
3. Mark onboarding as complete: user_metadata.onboarding_done = true
4. In App.jsx, after login check if onboarding_done is true:
   - If false → redirect to /onboarding
   - If true → go straight to /dashboard

---

## TASK 11 — PUSH UPDATES TO GITHUB + REDEPLOY (Final step)

After completing all tasks above:

1. In terminal inside D:\Kelvra\kelvra:
```bash
git add .
git commit -m "feat: complete auth, database, PDF upload, voice buddy, real data"
git push origin main
```

2. Vercel will auto-deploy from GitHub push (if auto-deploy is enabled)
   OR go to Vercel dashboard → Deployments → Redeploy

3. Make sure these env vars are in Vercel:
   - VITE_GROQ_API_KEY
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

---

## IMPORTANT RULES FOR CLAUDE CODE

1. Never delete existing working code — only add to or improve it
2. Always keep the dark design system — bg-background, surface containers, primary-container green
3. Every API call must have try/catch — never crash the UI on API error
4. Keep the Sidebar component exported from DashboardPage.jsx — all other pages import it from there
5. Never hardcode API keys — always use import.meta.env.VITE_*
6. After each task, test it works before moving to the next
7. Keep all pages using the same font classes: font-headline, font-body, font-label
8. Material Symbols Outlined icons are loaded via CDN — don't install any icon library
9. Tailwind classes only — no inline styles except for fontVariationSettings on Material icons
10. The app must work on both localhost:5173 and the Vercel production URL

---

## START ORDER (do in this exact sequence)

1. Task 1 — Fix colors (visual polish, high impact)
2. Task 2 — Create Supabase tables (needed for everything else)
3. Task 7 — Real dashboard data (users see real stats)
4. Task 3 — Connect Progress page to real data
5. Task 4 — PDF upload (big feature)
6. Task 5 — Image upload
7. Task 6 — Voice buddy
8. Task 8 — Mobile fixes
9. Task 9 — Landing page improvements
10. Task 10 — Save onboarding preferences
11. Task 11 — Push to GitHub and redeploy

Good luck! Build something great. 🚀
