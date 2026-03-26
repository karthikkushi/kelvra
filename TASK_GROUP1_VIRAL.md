# TASK GROUP 1: Viral Growth Features
# Share Study Kits + Leaderboards + XP & Badges
# Paste this into Claude Code

## CONTEXT
Kelvra is a React 18 + Vite + Tailwind CSS app at D:\Kelvra\kelvra
AI: Groq API — src/utils/claudeAPI.js
Database: Supabase — src/utils/supabase.js
Auth: user prop passed to all pages
All pages import Sidebar from DashboardPage.jsx

## OVERVIEW OF ALL 3 FEATURES

FEATURE A — Share Study Kits
When a user generates a study kit (flashcards + quiz + summary),
they can click "Share" to get a public link.
Anyone who opens the link sees the study kit and can start studying it.
This is the viral loop — every share = potential new user.

FEATURE B — Leaderboards
Weekly leaderboard showing top students by XP earned that week.
Students can see where they rank among all Kelvra users.
Resets every Monday. Creates competitive motivation to study daily.

FEATURE C — XP & Badges
Students earn XP for every action:
- Generate a study kit: +10 XP
- Complete a quiz: +15 XP
- Perfect quiz score: +25 XP
- Study streak day: +5 XP
- Socratic session: +10 XP
- Share a study kit: +5 XP
Badges unlock at milestones.

---

## STEP 1 — SUPABASE TABLES
Run this SQL in Supabase SQL Editor:

```sql
-- Shared study kits (public)
create table if not exists shared_kits (
  id uuid default gen_random_uuid() primary key,
  share_id text unique not null,
  user_id uuid references auth.users on delete cascade,
  topic text not null,
  summary text,
  flashcards text,
  quiz text,
  plan text,
  views int default 0,
  created_at timestamptz default now()
);

-- Make shared kits publicly readable
alter table shared_kits enable row level security;
create policy "Anyone can read shared kits" on shared_kits
  for select using (true);
create policy "Users manage own kits" on shared_kits
  for insert with check (auth.uid() = user_id);
create policy "Users update own kits" on shared_kits
  for update using (auth.uid() = user_id);

-- XP and badges
create table if not exists user_xp (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  total_xp int default 0,
  weekly_xp int default 0,
  week_start date default date_trunc('week', current_date)::date,
  level int default 1,
  badges text[] default '{}',
  updated_at timestamptz default now()
);

alter table user_xp enable row level security;
create policy "Anyone can read xp for leaderboard" on user_xp
  for select using (true);
create policy "Users manage own xp" on user_xp
  for all using (auth.uid() = user_id);

-- Leaderboard view
create or replace view leaderboard as
select
  u.user_id,
  au.raw_user_meta_data->>'full_name' as display_name,
  au.email,
  u.total_xp,
  u.weekly_xp,
  u.level,
  u.badges,
  u.week_start
from user_xp u
join auth.users au on au.id = u.user_id
order by u.weekly_xp desc
limit 50;
```

---

## STEP 2 — CREATE src/utils/gamification.js

```js
// src/utils/gamification.js
import { supabase } from "./supabase";

// XP values for each action
export const XP_REWARDS = {
  GENERATE_KIT:    10,
  COMPLETE_QUIZ:   15,
  PERFECT_QUIZ:    25,
  STREAK_DAY:       5,
  SOCRATIC_SESSION:10,
  SHARE_KIT:        5,
  UPLOAD_PDF:       5,
  FIRST_SESSION:   50,
};

// Badge definitions
export const BADGES = [
  { id: "first_step",    icon: "🎯", name: "First Step",     desc: "Complete your first study session",  xpRequired: 0,   condition: "first_session" },
  { id: "quiz_master",   icon: "🏆", name: "Quiz Master",    desc: "Get a perfect score on any quiz",     xpRequired: 0,   condition: "perfect_quiz" },
  { id: "streak_3",      icon: "🔥", name: "On Fire",        desc: "Study 3 days in a row",               xpRequired: 0,   condition: "streak_3" },
  { id: "streak_7",      icon: "⚡", name: "Lightning",      desc: "Study 7 days in a row",               xpRequired: 0,   condition: "streak_7" },
  { id: "social_star",   icon: "🌟", name: "Social Star",    desc: "Share your first study kit",          xpRequired: 0,   condition: "share_kit" },
  { id: "level_5",       icon: "💎", name: "Diamond",        desc: "Reach Level 5",                       xpRequired: 200, condition: "level" },
  { id: "level_10",      icon: "👑", name: "Champion",       desc: "Reach Level 10",                      xpRequired: 500, condition: "level" },
  { id: "centurion",     icon: "🎖️", name: "Centurion",     desc: "Earn 1000 total XP",                  xpRequired: 1000,condition: "total_xp" },
];

// Calculate level from total XP
export function calculateLevel(totalXp) {
  return Math.floor(totalXp / 100) + 1;
}

// Get XP needed for next level
export function xpToNextLevel(totalXp) {
  const currentLevel = calculateLevel(totalXp);
  return currentLevel * 100 - totalXp;
}

// Award XP to user
export async function awardXP(userId, action, metadata = {}) {
  try {
    const xpGain = XP_REWARDS[action] || 0;
    if (!xpGain) return null;

    // Get current XP record
    const { data: current } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", userId)
      .single();

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const weekStartStr = weekStart.toISOString().split("T")[0];

    if (current) {
      // Reset weekly XP if new week
      const isNewWeek = current.week_start !== weekStartStr;
      const newWeeklyXP = isNewWeek ? xpGain : current.weekly_xp + xpGain;
      const newTotalXP = current.total_xp + xpGain;
      const newLevel = calculateLevel(newTotalXP);

      // Check for new badges
      const newBadges = [...(current.badges || [])];
      if (action === "FIRST_SESSION" && !newBadges.includes("first_step")) newBadges.push("first_step");
      if (action === "PERFECT_QUIZ" && !newBadges.includes("quiz_master")) newBadges.push("quiz_master");
      if (action === "SHARE_KIT" && !newBadges.includes("social_star")) newBadges.push("social_star");
      if (newLevel >= 5 && !newBadges.includes("level_5")) newBadges.push("level_5");
      if (newLevel >= 10 && !newBadges.includes("level_10")) newBadges.push("level_10");
      if (newTotalXP >= 1000 && !newBadges.includes("centurion")) newBadges.push("centurion");

      await supabase.from("user_xp").update({
        total_xp: newTotalXP,
        weekly_xp: newWeeklyXP,
        week_start: weekStartStr,
        level: newLevel,
        badges: newBadges,
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);

      return {
        xpGained: xpGain,
        totalXP: newTotalXP,
        weeklyXP: newWeeklyXP,
        level: newLevel,
        newBadges: newBadges.filter((b) => !current.badges?.includes(b)),
        leveledUp: newLevel > current.level,
      };
    } else {
      // First time — create record
      const newBadges = action === "FIRST_SESSION" ? ["first_step"] : [];
      await supabase.from("user_xp").insert({
        user_id: userId,
        total_xp: xpGain,
        weekly_xp: xpGain,
        week_start: weekStartStr,
        level: 1,
        badges: newBadges,
      });
      return { xpGained: xpGain, totalXP: xpGain, weeklyXP: xpGain, level: 1, newBadges, leveledUp: false };
    }
  } catch (err) {
    console.error("XP award error:", err);
    return null;
  }
}

// Get user's XP data
export async function getUserXP(userId) {
  try {
    const { data } = await supabase
      .from("user_xp")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data || { total_xp: 0, weekly_xp: 0, level: 1, badges: [] };
  } catch {
    return { total_xp: 0, weekly_xp: 0, level: 1, badges: [] };
  }
}

// Get leaderboard
export async function getLeaderboard() {
  try {
    const { data } = await supabase
      .from("user_xp")
      .select("user_id, total_xp, weekly_xp, level, badges, week_start")
      .order("weekly_xp", { ascending: false })
      .limit(20);
    return data || [];
  } catch {
    return [];
  }
}
```

---

## STEP 3 — CREATE src/utils/sharing.js

```js
// src/utils/sharing.js
import { supabase } from "./supabase";

// Generate a random share ID
function generateShareId() {
  return Math.random().toString(36).substring(2, 10) +
         Math.random().toString(36).substring(2, 10);
}

// Share a study kit — returns a share URL
export async function shareStudyKit(userId, topic, results) {
  try {
    const shareId = generateShareId();
    const { error } = await supabase.from("shared_kits").insert({
      share_id: shareId,
      user_id: userId,
      topic,
      summary:    results.summary    ? JSON.stringify(results.summary)    : null,
      flashcards: results.flashcards ? JSON.stringify(results.flashcards) : null,
      quiz:       results.quiz       ? JSON.stringify(results.quiz)       : null,
      plan:       results.plan       ? JSON.stringify(results.plan)       : null,
    });
    if (error) throw error;
    return {
      success: true,
      shareId,
      shareUrl: `${window.location.origin}/shared/${shareId}`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get a shared kit by ID
export async function getSharedKit(shareId) {
  try {
    const { data, error } = await supabase
      .from("shared_kits")
      .select("*")
      .eq("share_id", shareId)
      .single();
    if (error) throw error;

    // Increment view count
    await supabase
      .from("shared_kits")
      .update({ views: (data.views || 0) + 1 })
      .eq("share_id", shareId);

    return {
      success: true,
      kit: {
        ...data,
        summary:    data.summary    ? JSON.parse(data.summary)    : null,
        flashcards: data.flashcards ? JSON.parse(data.flashcards) : null,
        quiz:       data.quiz       ? JSON.parse(data.quiz)       : null,
        plan:       data.plan       ? JSON.parse(data.plan)       : null,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

---

## STEP 4 — CREATE src/pages/SharedKitPage.jsx
This is the PUBLIC page anyone can view — no login required.

```jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedKit } from "../utils/sharing";

export default function SharedKitPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    getSharedKit(shareId).then((result) => {
      if (result.success) setKit(result.kit);
      else setError("This study kit doesn't exist or has been removed.");
      setLoading(false);
    });
  }, [shareId]);

  if (loading) return (
    <div className="dark min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading study kit...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-error text-5xl mb-4 block">error</span>
        <h2 className="font-headline text-2xl font-bold mb-3 text-on-surface">Kit not found</h2>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <button onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl">
          Go to Kelvra
        </button>
      </div>
    </div>
  );

  const TABS = [
    kit?.summary    && { id: "summary",    label: "Summary",    icon: "summarize" },
    kit?.flashcards && { id: "flashcards", label: "Flashcards", icon: "style" },
    kit?.quiz       && { id: "quiz",       label: "Quiz",       icon: "quiz" },
    kit?.plan       && { id: "plan",       label: "Study Plan", icon: "calendar_today" },
  ].filter(Boolean);

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      {/* Fixed blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <span className="font-headline font-bold text-lg tracking-tighter">Kelvra</span>
        </div>
        <button onClick={() => navigate("/auth")}
          className="px-5 py-2 bg-primary-container text-on-primary-container font-bold rounded-full text-sm hover:scale-[1.02] transition-all">
          Study with AI →
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Kit info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Shared Study Kit</span>
            <span className="text-on-surface-variant text-xs">· {kit.views} views</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">{kit.topic}</h1>
          <p className="text-on-surface-variant text-sm">
            Created by a Kelvra student · Use this kit to study smarter
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 flex-wrap mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                  : "bg-surface-container-low border border-outline-variant/10 text-on-surface-variant"
              }`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {activeTab === "summary" && kit.summary && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 space-y-4">
            {kit.summary.paragraphs?.map((p, i) => (
              <p key={i} className="text-on-surface-variant text-sm leading-relaxed">{p}</p>
            ))}
            {kit.summary.points?.length > 0 && (
              <div className="pt-4 border-t border-outline-variant/10 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Key Points</h4>
                {kit.summary.points.map((p, i) => (
                  <div key={i} className="flex gap-3 text-sm text-on-surface-variant">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-2 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flashcards */}
        {activeTab === "flashcards" && kit.flashcards && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kit.flashcards.map((card, i) => (
              <div key={i} onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })}
                className={`p-6 rounded-2xl border cursor-pointer transition-all min-h-[120px] ${
                  flipped[i]
                    ? "bg-surface-container-high border-primary-container/30"
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary-container/20"
                }`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${flipped[i] ? "text-primary-container" : "text-on-surface-variant"}`}>
                  {flipped[i] ? "Answer" : `Card ${i + 1}`}
                </span>
                <p className="mt-2 text-sm font-medium text-on-surface leading-relaxed">
                  {flipped[i] ? card.answer : card.question}
                </p>
                <p className="text-[10px] text-on-surface-variant/40 mt-3">
                  {flipped[i] ? "Tap to see question" : "Tap to reveal answer"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quiz preview */}
        {activeTab === "quiz" && kit.quiz && (
          <div className="space-y-4">
            {kit.quiz.slice(0, 3).map((q, i) => (
              <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Q{i + 1}</span>
                <p className="text-sm font-medium text-on-surface mt-2 mb-4">{q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(q.options || {}).map(([id, text]) => (
                    <div key={id} className="flex items-center gap-3 p-3 bg-surface-container-highest/40 rounded-xl text-sm">
                      <span className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">{id}</span>
                      <span className="text-on-surface-variant">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-on-surface-variant">
              Sign up to take the full quiz with instant feedback →
            </p>
          </div>
        )}

        {/* Study Plan */}
        {activeTab === "plan" && kit.plan && (
          <div className="space-y-3">
            {kit.plan.map((day) => (
              <div key={day.day} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 flex gap-5">
                <div className="text-center min-w-[48px]">
                  <div className="font-headline text-2xl font-extrabold text-secondary">{day.day}</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">Day</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-on-surface mb-2">{day.theme}</div>
                  {day.tasks?.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs text-on-surface-variant mt-1">
                      <span className="text-secondary">→</span> {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-surface-container-low border border-primary-container/10 rounded-2xl p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Want to generate your own study kits?</h3>
          <p className="text-on-surface-variant text-sm mb-5">
            Paste your notes or type any topic → get flashcards, quiz, summary and study plan in seconds.
          </p>
          <button onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] transition-all">
            Try Kelvra for free →
          </button>
        </div>
      </main>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
```

---

## STEP 5 — CREATE src/pages/LeaderboardPage.jsx

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import { getLeaderboard, getUserXP, calculateLevel, xpToNextLevel, BADGES } from "../utils/gamification";

export default function LeaderboardPage({ user }) {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myXP, setMyXP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("weekly");

  useEffect(() => {
    Promise.all([
      getLeaderboard(),
      user?.id ? getUserXP(user.id) : Promise.resolve(null),
    ]).then(([lb, xp]) => {
      setLeaderboard(lb);
      setMyXP(xp);
      setLoading(false);
    });
  }, [user]);

  const myRank = leaderboard.findIndex((e) => e.user_id === user?.id) + 1;
  const displayName = (entry) =>
    entry.display_name || entry.email?.split("@")[0] || "Student";

  const getRankStyle = (rank) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-600";
    return "text-on-surface-variant";
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="leaderboard" />
      <main className="md:ml-64 min-h-screen p-6 md:p-10">

        {/* Header */}
        <header className="mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">Competition</span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter mt-2">Leaderboard</h1>
          <p className="text-on-surface-variant mt-2">Top students this week · Resets every Monday</p>
        </header>

        {/* My stats card */}
        {myXP && (
          <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-headline text-3xl font-extrabold text-primary-container">{myXP.weekly_xp}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Weekly XP</div>
            </div>
            <div className="text-center">
              <div className="font-headline text-3xl font-extrabold text-secondary">{myXP.total_xp}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Total XP</div>
            </div>
            <div className="text-center">
              <div className="font-headline text-3xl font-extrabold text-tertiary-fixed-dim">Lv.{myXP.level}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Level</div>
            </div>
            <div className="text-center">
              <div className="font-headline text-3xl font-extrabold text-on-surface">
                {myRank > 0 ? `#${myRank}` : "—"}
              </div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">My Rank</div>
            </div>
          </div>
        )}

        {/* Level progress */}
        {myXP && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold">Level {myXP.level}</span>
              <span className="text-on-surface-variant">{xpToNextLevel(myXP.total_xp)} XP to Level {myXP.level + 1}</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary-container transition-all duration-700"
                style={{ width: `${((myXP.total_xp % 100) / 100) * 100}%` }} />
            </div>
            {/* Badges */}
            {myXP.badges?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {myXP.badges.map((badgeId) => {
                  const badge = BADGES.find((b) => b.id === badgeId);
                  return badge ? (
                    <div key={badgeId}
                      title={badge.desc}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-highest rounded-full text-xs font-medium">
                      <span>{badge.icon}</span>
                      <span className="text-on-surface-variant">{badge.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Leaderboard table */}
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg">Weekly Top Students</h2>
            <span className="text-xs text-on-surface-variant">Resets Monday</span>
          </div>
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">
              <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">leaderboard</span>
              <p className="text-on-surface-variant">No one has earned XP yet this week.</p>
              <p className="text-sm text-on-surface-variant/60 mt-1">Start studying to claim the #1 spot!</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/5">
              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                const isMe = entry.user_id === user?.id;
                return (
                  <div key={entry.user_id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isMe ? "bg-primary-container/5" : "hover:bg-surface-container-highest/30"}`}>
                    <div className={`w-8 text-center font-bold text-lg ${getRankStyle(rank)}`}>
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant flex-shrink-0">
                      {displayName(entry)[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {displayName(entry)}
                        {isMe && <span className="text-[10px] text-primary-container font-bold uppercase tracking-wider">(You)</span>}
                      </div>
                      <div className="text-xs text-on-surface-variant">Level {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary-container">{entry.weekly_xp} XP</div>
                      <div className="text-xs text-on-surface-variant">{entry.total_xp} total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* XP guide */}
        <div className="mt-8 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
          <h3 className="font-bold text-sm mb-4">How to earn XP</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { action: "Generate study kit", xp: "+10 XP" },
              { action: "Complete a quiz", xp: "+15 XP" },
              { action: "Perfect quiz score", xp: "+25 XP" },
              { action: "Daily study streak", xp: "+5 XP" },
              { action: "Socratic session", xp: "+10 XP" },
              { action: "Share a study kit", xp: "+5 XP" },
            ].map((item) => (
              <div key={item.action} className="flex items-center justify-between p-3 bg-surface-container-highest/40 rounded-xl">
                <span className="text-xs text-on-surface-variant">{item.action}</span>
                <span className="text-xs font-bold text-primary-container">{item.xp}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
```

---

## STEP 6 — UPDATE StudyPage.jsx to award XP and enable sharing

### Add imports at top:
```js
import { awardXP } from "../utils/gamification";
import { shareStudyKit } from "../utils/sharing";
```

### Add share state:
```js
const [shareUrl, setShareUrl] = useState("");
const [sharing, setSharing] = useState(false);
const [copied, setCopied] = useState(false);
```

### In handleGenerate, after setResults(generated), add:
```js
// Award XP for generating a kit
if (user?.id) {
  awardXP(user.id, "GENERATE_KIT");
}
```

### Add share button in the results action row alongside existing buttons:
```jsx
<button
  onClick={async () => {
    setSharing(true);
    const result = await shareStudyKit(user?.id, getContent(), results);
    if (result.success) {
      setShareUrl(result.shareUrl);
      await navigator.clipboard.writeText(result.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      if (user?.id) awardXP(user.id, "SHARE_KIT");
    }
    setSharing(false);
  }}
  disabled={sharing}
  className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2 disabled:opacity-50">
  <span className="material-symbols-outlined text-sm">
    {copied ? "check" : "share"}
  </span>
  {sharing ? "Sharing..." : copied ? "Link copied!" : "Share kit"}
</button>
```

---

## STEP 7 — UPDATE QuizPage.jsx to award XP on completion

In QuizPage.jsx, find where setDone(true) is called (quiz completion).
Add before it:
```js
import { awardXP } from "../utils/gamification";

// In the results screen useEffect or where done is set:
if (user?.id) {
  const pct = Math.round((score / total) * 100);
  awardXP(user.id, "COMPLETE_QUIZ");
  if (pct === 100) awardXP(user.id, "PERFECT_QUIZ");
}
```

---

## STEP 8 — ADD routes in App.jsx

### Add imports:
```js
import SharedKitPage from "./pages/SharedKitPage";
import LeaderboardPage from "./pages/LeaderboardPage";
```

### Add routes — SharedKitPage is PUBLIC (no Protected wrapper):
```jsx
<Route path="/shared/:shareId" element={<SharedKitPage />} />
<Route path="/leaderboard" element={<Protected user={user}><LeaderboardPage user={user} /></Protected>} />
```

---

## STEP 9 — ADD to Sidebar in DashboardPage.jsx

Find the links array and add:
```js
{ id: "leaderboard", icon: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
```
Add after agents link.

---

## STEP 10 — ADD XP display to Dashboard top bar

In DashboardPage.jsx, find the top header bar.
After the streak pill, add:
```jsx
{/* XP pill — load from Supabase */}
<div className="flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full border border-outline-variant/10">
  <span className="material-symbols-outlined text-secondary text-lg"
    style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
  <span className="text-sm font-bold text-secondary" id="xp-display">XP</span>
</div>
```

Also add this useEffect inside DashboardPage component:
```js
import { getUserXP } from "../utils/gamification";

useEffect(() => {
  if (user?.id) {
    getUserXP(user.id).then((xp) => {
      const el = document.getElementById("xp-display");
      if (el) el.textContent = `${xp.total_xp} XP`;
    });
  }
}, [user]);
```

---

## STEP 11 — VERIFY AND TEST

1. npm run dev — no errors
2. Go to /study → generate a kit → check console for XP award
3. Click Share → should copy a URL like localhost:5173/shared/abc123
4. Open that URL in incognito → should see the public SharedKitPage
5. Go to /leaderboard → should show your entry with XP
6. Complete a quiz → check leaderboard updates
7. Go to /leaderboard → check badges and level display

## COMMIT
```bash
git add .
git commit -m "feat: add share study kits, leaderboard, XP and badges system"
git push origin main
```
