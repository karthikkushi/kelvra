# TASK GROUP 2: Student Utility Features
# Exam Countdown + Export to PDF + Memory Palace (Mnemonics)
# Paste this into Claude Code

## CONTEXT
Kelvra is a React 18 + Vite + Tailwind CSS app at D:\Kelvra\kelvra
AI: Groq API — src/utils/claudeAPI.js
Database: Supabase — src/utils/supabase.js
Auth: user prop passed to all pages
All pages import Sidebar from DashboardPage.jsx

## OVERVIEW OF ALL 3 FEATURES

FEATURE A — Exam Countdown
- Widget on Dashboard showing "X days until [Exam Name]"
- User sets exam name + date from dashboard
- Shows urgency ring, daily study goal, days breakdown
- Connects to Planner Agent (already built)

FEATURE B — Export to PDF
- After generating a study kit on StudyPage
- "Export PDF" button downloads a clean, printable PDF
- Contains: title, summary, all flashcards, quiz questions with answers
- Uses jsPDF library (free, no backend needed)

FEATURE C — Memory Palace (AI Mnemonics)
- New section on Flashcards page and Study results
- For each hard concept, AI generates a custom mnemonic
- Types: acronym, vivid story, rhyme, visual association
- User can request a mnemonic for any flashcard they rated "Hard"

---

## STEP 1 — SUPABASE TABLE FOR EXAM COUNTDOWN

Run in Supabase SQL Editor:
```sql
create table if not exists exam_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  exam_name text not null,
  exam_date date not null,
  daily_goal_minutes int default 60,
  subjects text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table exam_goals enable row level security;
create policy "Users manage own exam goals" on exam_goals
  for all using (auth.uid() = user_id);
```

---

## STEP 2 — ADD generateMnemonic to claudeAPI.js

Open src/utils/claudeAPI.js and add at the bottom:

```js
// ── MEMORY PALACE — AI Mnemonics ──
export async function generateMnemonic(concept, answer, style = "auto") {
  const styles = {
    acronym: "Create a memorable ACRONYM where each letter stands for a key word in the answer.",
    story:   "Create a vivid, memorable SHORT STORY (2-3 sentences) that encodes the key information. Make it weird and visual.",
    rhyme:   "Create a short, catchy RHYME or song that helps remember this concept.",
    visual:  "Describe a VIVID VISUAL IMAGE or scene that represents this concept. Make it bizarre and unforgettable.",
    auto:    "Choose the BEST mnemonic type (acronym, story, rhyme, or visual image) for this specific concept and create it.",
  };

  const prompt = `You are a memory expert creating mnemonics for students.

Concept to remember: "${concept}"
Key information: "${answer}"

Task: ${styles[style] || styles.auto}

Rules:
- Make it SHORT (max 3 sentences)
- Make it MEMORABLE and WEIRD — the stranger the better
- Make it directly connected to the actual content
- Start with the type: "ACRONYM:", "STORY:", "RHYME:", or "VISUAL:"
- Then give the mnemonic

Respond with ONLY the mnemonic, nothing else.`;

  return await callGroq(prompt, 200);
}

// Generate mnemonics for multiple flashcards at once
export async function generateMnemonicsForCards(cards) {
  const mnemonics = [];
  for (const card of cards.slice(0, 5)) { // max 5 to avoid rate limits
    try {
      const mnemonic = await generateMnemonic(card.question, card.answer);
      mnemonics.push({ question: card.question, mnemonic });
      await new Promise(r => setTimeout(r, 500)); // small delay
    } catch {
      mnemonics.push({ question: card.question, mnemonic: null });
    }
  }
  return mnemonics;
}
```

---

## STEP 3 — INSTALL jsPDF

Run in terminal:
```bash
npm install jspdf
```

---

## STEP 4 — CREATE src/utils/exportPDF.js

```js
// src/utils/exportPDF.js
import { jsPDF } from "jspdf";

export function exportStudyKitPDF(topic, results) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin     = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helpers ──
  const checkNewPage = (neededHeight = 20) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    doc.setFillColor(13, 15, 20);
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setTextColor(110, 231, 183);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("KELVRA AI STUDY APP", margin, 8);
    doc.setTextColor(150, 150, 150);
    doc.text(topic.toUpperCase(), pageWidth - margin, 8, { align: "right" });
  };

  const addSectionTitle = (title, icon = "") => {
    checkNewPage(20);
    doc.setFillColor(20, 23, 31);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
    doc.setTextColor(110, 231, 183);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${icon} ${title}`.trim(), margin + 4, y + 7);
    y += 16;
  };

  const addText = (text, size = 10, color = [220, 220, 220], bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth - 4);
    const height = lines.length * (size * 0.4 + 1);
    checkNewPage(height + 4);
    doc.text(lines, margin + 2, y);
    y += height + 3;
  };

  const addBullet = (text) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    const lines = doc.splitTextToSize(`• ${text}`, contentWidth - 8);
    const height = lines.length * 4.5;
    checkNewPage(height + 2);
    doc.text(lines, margin + 4, y);
    y += height + 2;
  };

  // ── COVER PAGE ──
  doc.setFillColor(13, 15, 20);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Green accent line
  doc.setFillColor(110, 231, 183);
  doc.rect(margin, 60, 4, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(topic, contentWidth - 20);
  doc.text(titleLines, margin + 12, 75);

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(110, 231, 183);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Generated Study Kit", margin + 12, 108);

  // Date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin + 12, 116);

  // Contents list
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Contents:", margin + 12, 135);
  let contentY = 143;
  const contents = [];
  if (results.summary)    contents.push("Summary & Key Points");
  if (results.flashcards) contents.push(`${results.flashcards.length} Flashcards`);
  if (results.quiz)       contents.push(`${results.quiz.length} Quiz Questions`);
  if (results.plan)       contents.push("5-Day Study Plan");
  contents.forEach((item) => {
    doc.setTextColor(110, 231, 183);
    doc.text("→", margin + 12, contentY);
    doc.setTextColor(200, 200, 200);
    doc.text(item, margin + 20, contentY);
    contentY += 8;
  });

  // Kelvra branding at bottom
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("kelvra.app — Study Smarter with AI", pageWidth / 2, pageHeight - 15, { align: "center" });

  // ── CONTENT PAGES ──
  doc.addPage();
  doc.setFillColor(13, 15, 20);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  addHeader();
  y = 20;

  // ── SUMMARY ──
  if (results.summary) {
    addSectionTitle("SUMMARY");
    results.summary.paragraphs?.forEach((p) => {
      addText(p, 10, [200, 200, 200]);
      y += 2;
    });
    if (results.summary.points?.length > 0) {
      y += 4;
      addText("KEY POINTS", 9, [110, 231, 183], true);
      results.summary.points.forEach((p) => addBullet(p));
    }
    y += 8;
  }

  // ── FLASHCARDS ──
  if (results.flashcards?.length > 0) {
    checkNewPage(30);
    addSectionTitle("FLASHCARDS");
    results.flashcards.forEach((card, i) => {
      checkNewPage(30);
      // Card number
      doc.setFillColor(28, 32, 48);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(110, 231, 183);
      doc.setFont("helvetica", "bold");
      doc.text(`CARD ${i + 1}`, margin + 3, y + 5);
      // Question
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.setFont("helvetica", "bold");
      const qLines = doc.splitTextToSize(`Q: ${card.question}`, contentWidth - 8);
      doc.text(qLines.slice(0, 2), margin + 3, y + 11);
      // Answer
      doc.setFontSize(8);
      doc.setTextColor(150, 200, 170);
      doc.setFont("helvetica", "normal");
      const aLines = doc.splitTextToSize(`A: ${card.answer}`, contentWidth - 8);
      doc.text(aLines.slice(0, 2), margin + 3, y + 20);
      y += 30;
    });
    y += 5;
  }

  // ── QUIZ ──
  if (results.quiz?.length > 0) {
    checkNewPage(40);
    addSectionTitle("QUIZ QUESTIONS");
    results.quiz.forEach((q, i) => {
      checkNewPage(50);
      doc.setFillColor(20, 23, 31);
      doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${i + 1}: ${q.question}`, margin + 3, y + 4.5, { maxWidth: contentWidth - 6 });
      y += 10;
      // Options
      const opts = q.options || {};
      Object.entries(opts).forEach(([key, val]) => {
        const isCorrect = key === q.correct;
        doc.setFontSize(8);
        doc.setFont("helvetica", isCorrect ? "bold" : "normal");
        doc.setTextColor(isCorrect ? 110 : 150, isCorrect ? 231 : 150, isCorrect ? 183 : 150);
        const optLines = doc.splitTextToSize(`${key}) ${val}${isCorrect ? " ✓" : ""}`, contentWidth - 10);
        doc.text(optLines, margin + 6, y);
        y += optLines.length * 4.5 + 1;
      });
      y += 4;
    });
  }

  // ── STUDY PLAN ──
  if (results.plan?.length > 0) {
    checkNewPage(30);
    addSectionTitle("5-DAY STUDY PLAN");
    results.plan.forEach((day) => {
      checkNewPage(25);
      doc.setFillColor(28, 32, 48);
      doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
      doc.setFontSize(9);
      doc.setTextColor(110, 231, 183);
      doc.setFont("helvetica", "bold");
      doc.text(`DAY ${day.day}: ${day.theme}`, margin + 3, y + 5.5);
      if (day.duration) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`${day.duration} min`, pageWidth - margin - 3, y + 5.5, { align: "right" });
      }
      y += 12;
      day.tasks?.forEach((task) => addBullet(task));
      y += 3;
    });
  }

  // Last page footer
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Generated by Kelvra AI — kelvra.app", pageWidth / 2, pageHeight - 10, { align: "center" });

  // Save
  const fileName = `${topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_kelvra_study_kit.pdf`;
  doc.save(fileName);
  return fileName;
}
```

---

## STEP 5 — CREATE src/components/ExamCountdown.jsx

```jsx
// src/components/ExamCountdown.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function ExamCountdown({ user }) {
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyGoal, setDailyGoal] = useState(60);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("exam_goals")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setGoal(data);
        setLoading(false);
      });
  }, [user]);

  const saveGoal = async () => {
    if (!examName || !examDate) return;
    setSaving(true);
    const { data } = await supabase
      .from("exam_goals")
      .upsert({
        user_id: user.id,
        exam_name: examName,
        exam_date: examDate,
        daily_goal_minutes: dailyGoal,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (data) setGoal(data);
    setEditing(false);
    setSaving(false);
  };

  const getDaysLeft = () => {
    if (!goal?.exam_date) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(goal.exam_date);
    exam.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));
  };

  const getUrgencyColor = (days) => {
    if (days <= 3)  return { text: "text-error",            ring: "#ef4444" };
    if (days <= 7)  return { text: "text-tertiary-fixed-dim", ring: "#86efac" };
    if (days <= 14) return { text: "text-secondary",         ring: "#60a5fa" };
    return { text: "text-primary-container", ring: "#6ee7b7" };
  };

  const getUrgencyLabel = (days) => {
    if (days === 0)  return "Exam today!";
    if (days <= 3)   return "Almost there!";
    if (days <= 7)   return "Final stretch!";
    if (days <= 14)  return "Keep pushing!";
    return "You've got this!";
  };

  if (loading) return null;

  // No goal set — show setup card
  if (!goal && !editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl p-6 cursor-pointer hover:border-primary-container/30 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container">event</span>
          </div>
          <div>
            <p className="font-bold text-sm text-on-surface">Set your exam date</p>
            <p className="text-xs text-on-surface-variant">Get a countdown and daily study goals</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant ml-auto">add</span>
        </div>
      </div>
    );
  }

  // Edit form
  if (editing) {
    return (
      <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-sm">event</span>
          Set Exam Goal
        </h3>
        <input
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Exam name (e.g. NEET 2025)"
          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary-container/50"
        />
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary-container/50"
        />
        <div>
          <label className="text-xs text-on-surface-variant mb-1 block">Daily study goal: {dailyGoal} minutes</label>
          <input
            type="range" min="15" max="240" step="15"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full accent-green-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={saveGoal} disabled={saving || !examName || !examDate}
            className="flex-1 py-2.5 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save Goal"}
          </button>
          <button onClick={() => setEditing(false)}
            className="px-4 py-2.5 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Countdown display
  const daysLeft = getDaysLeft();
  const { text: urgencyText, ring: urgencyRing } = getUrgencyColor(daysLeft);
  const progress = Math.max(0, Math.min(100, 100 - (daysLeft / 90) * 100));

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exam Countdown</p>
          <h3 className="font-headline font-bold text-on-surface text-lg mt-0.5">{goal.exam_name}</h3>
        </div>
        <button onClick={() => { setExamName(goal.exam_name); setExamDate(goal.exam_date); setDailyGoal(goal.daily_goal_minutes); setEditing(true); }}
          className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Countdown ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1c2030" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={urgencyRing} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-headline text-2xl font-extrabold ${urgencyText}`}>{daysLeft}</span>
            <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">days</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={`font-bold text-sm ${urgencyText} mb-1`}>{getUrgencyLabel(daysLeft)}</p>
          <p className="text-xs text-on-surface-variant mb-3">
            {new Date(goal.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-sm">schedule</span>
            <span className="text-xs text-on-surface-variant">{goal.daily_goal_minutes} min/day goal</span>
          </div>
          <button
            onClick={() => navigate("/agents")}
            className="mt-3 text-xs text-primary-container font-bold hover:underline flex items-center gap-1">
            View study plan
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## STEP 6 — CREATE src/components/MnemonicCard.jsx

```jsx
// src/components/MnemonicCard.jsx
import { useState } from "react";
import { generateMnemonic } from "../utils/claudeAPI";

export default function MnemonicCard({ question, answer, compact = false }) {
  const [mnemonic, setMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("auto");
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await generateMnemonic(question, answer, style);
      setMnemonic(result);
      setOpen(true);
    } catch {
      setMnemonic("Try associating this concept with something you already know well.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const STYLE_OPTIONS = [
    { id: "auto",    label: "Auto",    icon: "auto_awesome" },
    { id: "story",   label: "Story",   icon: "menu_book" },
    { id: "acronym", label: "Acronym", icon: "sort_by_alpha" },
    { id: "rhyme",   label: "Rhyme",   icon: "music_note" },
    { id: "visual",  label: "Visual",  icon: "image" },
  ];

  if (compact) {
    return (
      <div className="mt-2">
        {!open ? (
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-sm">psychology</span>
            {loading ? "Generating..." : "Memory trick"}
          </button>
        ) : (
          <div className="mt-2 bg-surface-container-highest/50 rounded-xl p-3 border border-primary-container/10">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-primary-container text-xs">psychology</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-container">Memory Trick</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{mnemonic}</p>
            <button onClick={() => { setOpen(false); setMnemonic(""); }}
              className="text-[10px] text-on-surface-variant/50 mt-1 hover:text-on-surface-variant transition-colors">
              Hide
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary-container/20 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h3 className="font-bold text-sm text-on-surface">Memory Palace</h3>
          <p className="text-xs text-on-surface-variant">AI-generated mnemonic</p>
        </div>
      </div>

      {/* Style picker */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STYLE_OPTIONS.map((s) => (
          <button key={s.id} onClick={() => setStyle(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              style === s.id
                ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                : "bg-surface-container-highest text-on-surface-variant hover:border-outline-variant/30 border border-transparent"
            }`}>
            <span className="material-symbols-outlined text-xs">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading}
        className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Creating mnemonic...</>
        ) : (
          <><span className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Generate Memory Trick</>
        )}
      </button>

      {open && mnemonic && (
        <div className="mt-4 bg-surface-container-highest/40 border border-primary-container/10 rounded-xl p-4">
          <p className="text-sm text-on-surface leading-relaxed">{mnemonic}</p>
          <button onClick={() => { setOpen(false); setMnemonic(""); }}
            className="text-xs text-on-surface-variant/50 mt-2 hover:text-on-surface-variant transition-colors">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## STEP 7 — UPDATE DashboardPage.jsx to show ExamCountdown

Open src/pages/DashboardPage.jsx and:

### Add import at top:
```js
import ExamCountdown from "../components/ExamCountdown";
```

### Find the grid section with study plan and weak spots.
Add the ExamCountdown ABOVE the study plan grid:
```jsx
{/* Exam Countdown */}
<ExamCountdown user={user} />
```
Place it between the greeting section and the "Today's Study Plan" heading.

---

## STEP 8 — UPDATE StudyPage.jsx for PDF export and Memory Palace

### Add imports at top:
```js
import { exportStudyKitPDF } from "../utils/exportPDF";
import MnemonicCard from "../components/MnemonicCard";
```

### Add state:
```js
const [exporting, setExporting] = useState(false);
```

### Add Export PDF button in the results action row:
```jsx
<button
  onClick={async () => {
    setExporting(true);
    try {
      exportStudyKitPDF(getContent() || "Study Kit", results);
    } catch (err) {
      console.error("PDF export error:", err);
    }
    setExporting(false);
  }}
  disabled={exporting}
  className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2 disabled:opacity-50">
  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
  {exporting ? "Exporting..." : "Export PDF"}
</button>
```

### Add MnemonicCard below the flashcards result in the results section:
Find where FlashcardsResult is rendered and add below it:
```jsx
{activeResult === "flashcards" && results.flashcards && results.flashcards.length > 0 && (
  <div className="mt-6">
    <MnemonicCard
      question={results.flashcards[0].question}
      answer={results.flashcards[0].answer}
    />
  </div>
)}
```

---

## STEP 9 — UPDATE FlashcardsPage.jsx to add compact mnemonic on hard cards

Open src/pages/FlashcardsPage.jsx:

### Add import:
```js
import MnemonicCard from "../components/MnemonicCard";
```

### Find where ratings are shown (after the card is flipped).
After the card BACK div content, add:
```jsx
{flipped && ratings[index] === "hard" && (
  <div className="mt-4 max-w-2xl mx-auto w-full px-2">
    <MnemonicCard
      question={card.question}
      answer={card.answer}
      compact={true}
    />
  </div>
)}
```
This shows the compact mnemonic button only when the student rated a card "Hard".

---

## STEP 10 — VERIFY AND TEST

### Exam Countdown
1. Go to /dashboard
2. Should see "Set your exam date" card
3. Click it → fill in exam name, date, daily goal → Save
4. Countdown ring appears with days remaining
5. Color changes based on urgency (red < 3 days, orange < 7 days, etc.)

### Export PDF
1. Go to /study → generate a kit for "Photosynthesis"
2. Click "Export PDF" button
3. PDF should download automatically
4. Check: cover page, summary, flashcards, quiz, study plan all present
5. File name: photosynthesis_kelvra_study_kit.pdf

### Memory Palace
1. On /study results → flashcards tab → scroll down → MnemonicCard shows
2. Select "Story" style → click Generate → mnemonic appears
3. On /flashcards → flip a card → rate it "Hard" → compact mnemonic button appears
4. Click "Memory trick" → mnemonic appears inline

## COMMIT
```bash
git add .
git commit -m "feat: add exam countdown, PDF export, and Memory Palace mnemonics"
git push origin main
```
