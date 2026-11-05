// src/pages/LegalPage.jsx
// Privacy policy and Terms of use. DRAFT written from what the app actually does (Nov 2026).
// It must be reviewed by a lawyer before launch (India DPDP Act 2023 + Rules 2025, IT Act).
// Fill in VITE_LEGAL_NAME, VITE_CONTACT_EMAIL and VITE_GRIEVANCE_OFFICER, then set LEGAL_REVIEWED to true.
import { Link } from "react-router-dom";

export const LEGAL_REVIEWED = false;
const LAST_UPDATED = "5 November 2026";
const OPERATOR = import.meta.env.VITE_LEGAL_NAME || "[operator's legal name — to be added]";
const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || "[contact email — to be added]";
const GRIEVANCE = import.meta.env.VITE_GRIEVANCE_OFFICER || "[grievance officer name and email — to be added]";

const PRIVACY = [
  ["Who we are", [
    `Kelvra is an AI study app run by ${OPERATOR} ("we"). This policy explains what we collect, why, and your choices. Contact: ${CONTACT}.`,
  ]],
  ["What we collect", [
    "Account: your name, email address, login method (email or Google) and the age group you choose (13–15, 16–17, 18–21, 22+). We do not ask for your exact birth date.",
    "Study content you add: notes, topics, PDFs and photos you upload to make study kits, and the kits made from them.",
    "Study activity: quiz answers and scores, how sure you said you were, mistakes, flashcard reviews, written or spoken practice answers and their feedback, focus sessions (length, times you left the page and the reasons you picked), habits, test debriefs, exam goal, daily check-ins (mood, minutes, sleep, an optional note) and mentor chats.",
    "Technical data needed to run the service, such as sign-in tokens. We do not use advertising trackers.",
  ]],
  ["Why we use it", [
    "To run the app for you: make study material, schedule reviews, build your daily plan and give coaching that fits your progress.",
    "To keep the service safe and working, for example limiting AI use per account and preventing abuse.",
    "We do not sell your data, do not show ads, and do not use your data for advertising.",
  ]],
  ["AI processing", [
    "When you use an AI feature, the text (and any photo) needed for that request is sent from our server to our AI provider, Groq, Inc., to produce the answer. Please do not put personal details about yourself or others into notes or chats unless needed.",
    "AI answers can be wrong. Check important facts, such as exam rules, marks and dates, with your teacher or the official source.",
    "If something you type sounds like you may be in danger, Kelvra does not send it to the AI and does not save it. It shows helpline numbers instead (Tele-MANAS 14416 or 1-800-891-4416, emergency 112).",
  ]],
  ["Where it is stored", [
    "Your account and study data are stored with Google Firebase (Authentication and Cloud Firestore). A copy is also kept on your device so the app works offline. Our server is hosted on Vercel.",
  ]],
  ["Sharing", [
    "We do not share your data with your parents, school or anyone else. Features like the family update and test debrief only create a message on your device; you choose whether to send it and to whom.",
    "A study kit becomes visible to others only if you create a share link. The leaderboard shows your first name and XP only if you choose to join it.",
    "We may disclose data if the law requires it.",
  ]],
  ["Children (under 18)", [
    "Under India's data protection law, users under 18 are children. Kelvra uses extra safety settings for them and treats users whose age is unknown as under 18.",
    "Where the law requires it, we will ask for verifiable consent from a parent or guardian before processing a child's data. [Process to be confirmed with legal review.]",
    "We do not show targeted ads to children or use their data to track or profile them for any purpose other than providing the study features they use.",
  ]],
  ["How long we keep it", [
    "We keep your data while your account is active. When you delete your account, your account and study data are deleted from our database. Copies on your devices are removed when you delete the account on that device or clear the app's data.",
  ]],
  ["Your rights", [
    "Access and copy: Settings → Your data → Download my data.",
    "Correction: change your name and preferences in Settings, or contact us.",
    "Deletion: Settings → Your data → Delete my account.",
    "Withdraw consent: you can stop using any feature, leave the leaderboard, or delete your account at any time.",
    `Grievances: ${GRIEVANCE}. You may also approach the Data Protection Board of India.`,
  ]],
  ["Security", [
    "Data is sent over encrypted connections. Database rules make sure each account can only read and change its own data. No system is perfectly secure; if a breach affects you, we will tell you and the authorities as the law requires.",
  ]],
  ["Changes", [
    "We will update this page when the app changes and show the date at the top. For important changes we will tell you in the app.",
  ]],
];

const TERMS = [
  ["Using Kelvra", [
    `These terms are an agreement between you and ${OPERATOR}. By creating an account you agree to them and to the Privacy policy.`,
    "You must be at least 13 years old. If you are under 18, please use Kelvra with the knowledge of a parent or guardian.",
    "Keep your login private. You are responsible for activity on your account.",
  ]],
  ["What Kelvra is, and is not", [
    "Kelvra is a study aid. It does not guarantee marks, ranks, admission or exam results.",
    "AI-generated summaries, quizzes, feedback, marks estimates and mentor advice can be wrong or incomplete. Check important information with your teacher, textbook or the official source.",
    "Kelvra is not a medical, mental-health or emergency service. If you are in crisis, call Tele-MANAS 14416 or emergency 112.",
  ]],
  ["Fair use", [
    "Don't use Kelvra to cheat in exams or assessments, to harass anyone, to upload content you don't have the right to use, or to upload illegal or harmful content.",
    "Don't try to break, overload or misuse the service, including automated access. AI features have daily usage limits per account.",
  ]],
  ["Your content", [
    "You keep ownership of the notes and files you upload. You give us permission to process them only to provide the service to you (for example, to make your study kit).",
    "If you share a study kit link, anyone with the link can view that kit until you delete your account.",
  ]],
  ["Ending your account", [
    "You can delete your account at any time in Settings. We may suspend accounts that break these terms.",
  ]],
  ["Liability", [
    "We work hard to keep Kelvra running and correct, but it is provided \"as is\". To the extent the law allows, we are not liable for indirect losses or for decisions made based on AI output. [Exact wording to be confirmed with legal review.]",
  ]],
  ["Law", [
    "These terms are governed by the laws of India. [Jurisdiction to be confirmed with legal review.]",
    `Questions: ${CONTACT}.`,
  ]],
];

export default function LegalPage({ doc = "privacy" }) {
  const privacy = doc === "privacy";
  const sections = privacy ? PRIVACY : TERMS;
  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-on-surface-variant hover:text-on-surface">← Kelvra</Link>
        <h1 className="font-headline text-3xl font-extrabold tracking-tighter mt-4">{privacy ? "Privacy policy" : "Terms of use"}</h1>
        <p className="text-sm text-on-surface-variant mt-1">Last updated: {LAST_UPDATED}</p>
        {!LEGAL_REVIEWED && (
          <p className="mt-4 text-xs px-3 py-2 rounded-lg bg-tertiary-container/20 border border-tertiary-fixed-dim/30 text-on-surface">
            Draft: this page is pending legal review and may change.
          </p>
        )}
        <div className="mt-8 space-y-8">
          {sections.map(([title, paras]) => (
            <section key={title}>
              <h2 className="font-headline text-lg font-bold mb-2">{title}</h2>
              <ul className="space-y-2">
                {paras.map((p) => <li key={p} className="text-sm text-on-surface-variant leading-relaxed">{p}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-on-surface-variant">
          See also: {privacy ? <Link to="/terms" className="text-primary-container underline">Terms of use</Link> : <Link to="/privacy" className="text-primary-container underline">Privacy policy</Link>}
        </p>
      </main>
    </div>
  );
}
