# Kelvra: AI study app with a mentor

**What:** paste notes or upload a PDF or photo, and get flashcards, a quiz, a summary and a 5-day study plan, in 10 languages.
An AI mentor then reads your real progress (quiz scores, weak topics, exam date) and helps with weekly goals, real-world uses of topics, careers, and getting unstuck.
**For:** students preparing for exams who want study material made from their own notes.
**Run:** `npm install`, copy `.env.example` to `.env` and fill it in, then `npm run dev` and open http://localhost:5173.

Live: https://kelvra.vercel.app/

![Kelvra landing page](docs/screenshot.jpg)

## Commands

```
npm run dev         # app + the /api/groq function, http://localhost:5173
npm test            # server function tests (node --test)
npm run emulators   # local Firebase Auth + Firestore (needs Java)
npm run test:rules  # security-rule tests, run while the emulators are up
npm run lint
npm run build       # production build into dist/
```

## How it works

- React + Vite + Tailwind, installable as an app (PWA). Pages load on demand, so the landing page stays small.
- **Login and data: Firebase** (Auth + Cloud Firestore). Firestore keeps a copy in the browser, so the dashboard, progress,
  goals and mentor chat open offline, and changes sync when the connection returns. Data layout is at the top of
  [`src/utils/firebase.js`](src/utils/firebase.js); who can read and write what is in [`firestore.rules`](firestore.rules).
- **AI:** the browser calls `/api/groq` ([`api/groq.js`](api/groq.js), a Vercel function). It checks the Firebase ID token,
  adds the Groq key from the server-only `GROQ_API_KEY`, and picks the model: `openai/gpt-oss-120b` for text,
  `qwen/qwen3.8-27b` for photos and handwriting. The key is never sent to the browser.
- **Mentor:** [`src/pages/MentorPage.jsx`](src/pages/MentorPage.jsx) and [`src/utils/mentor.js`](src/utils/mentor.js).

## Set up Firebase (once)

1. Go to https://console.firebase.google.com, **Add project** (Google Analytics not needed).
2. **Build > Authentication > Get started.** Turn on **Email/Password** and **Google**.
3. **Authentication > Settings > Authorized domains:** add `kelvra.vercel.app` (and any custom domain).
4. **Build > Firestore Database > Create database**, production mode, a region near your users (for India: `asia-south1`).
5. **Project settings > General > Your apps > Web (`</>`)**, register the app, and copy the config values into
   `.env` as the `VITE_FIREBASE_*` variables (see `.env.example`).
6. Deploy the security rules (without this, Firestore blocks every read and write):
   `npx firebase-tools login`, then `npx firebase-tools deploy --only firestore:rules --project <your-project-id>`.
7. **Vercel > Project > Settings > Environment Variables:** add the same `VITE_FIREBASE_*` values and `GROQ_API_KEY`,
   remove the old `VITE_SUPABASE_*` ones, then redeploy.

The free Spark plan is enough to start and, unlike Supabase's free tier, does not pause the project when it is quiet.

## Not done yet

- Data from the old Supabase project was not copied over (that project is paused). New accounts start empty.
- Photo and handwriting reading uses a Groq preview model, which Groq may retire at short notice.
- Tests cover the AI server function and the database security rules, not the pages.
