# TASK 3: 4 AI Agents — Planner, Observer, Coach, Predictor
# Paste this into Claude Code

## CONTEXT
Kelvra is a React 18 + Vite + Tailwind CSS app at D:\Kelvra\kelvra
AI API: Groq (llama-3.3-70b-versatile) — src/utils/claudeAPI.js
Database: Supabase — src/utils/supabase.js
Auth: user object passed as prop to all pages

The 4 AI Agents are Kelvra's biggest differentiator.
No other Indian EdTech app does this properly.
Each agent runs silently in the background and surfaces insights to the user.

## AGENT OVERVIEW
1. PLANNER — builds a personalized daily study schedule based on exam date + weak spots
2. OBSERVER — tracks every session, quiz answer, flashcard rating to build a knowledge map
3. COACH — surfaces the right topic at the right time using spaced repetition logic
4. PREDICTOR — predicts exam readiness score and tells user what to focus on

---

## STEP 1 — CREATE src/utils/agents.js

Create a new file at src/utils/agents.js with all 4 agent functions:

```js
// src/utils/agents.js
// ── Kelvra AI Agents ──
// 4 intelligent agents that power personalized learning

import { supabase } from "./supabase";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function callGroq(prompt, maxTokens = 1000) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

// ══════════════════════════════
// AGENT 1: PLANNER
// Builds personalized daily study schedule
// ══════════════════════════════

export async function runPlannerAgent(userId, examName, examDate, topics) {
  try {
    const today = new Date();
    const exam = new Date(examDate);
    const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));

    // Get user's weak spots from Supabase
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("topic, pct")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const weakTopics = scores
      ? scores
          .filter((s) => s.pct < 70)
          .map((s) => s.topic)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 5)
      : [];

    const prompt = `You are an expert study planner AI.

Student has ${daysLeft} days until their ${examName} exam.
Topics to cover: ${topics.join(", ")}
Weak topics that need extra attention: ${weakTopics.length > 0 ? weakTopics.join(", ") : "none identified yet"}

Create a smart ${Math.min(daysLeft, 7)}-day study schedule.

Rules:
- Weak topics get 2x more time
- Each day has max 3-4 tasks
- Include revision days every 3 days
- Last 2 days before exam = revision only
- Be very specific with task names

Respond ONLY with valid JSON in this exact format, no other text:
{
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "theme": "Foundation Building",
      "tasks": [
        { "topic": "topic name", "duration": 45, "type": "study", "priority": "high" },
        { "topic": "topic name", "duration": 30, "type": "quiz", "priority": "medium" }
      ],
      "totalMinutes": 75
    }
  ],
  "strategy": "one sentence study strategy",
  "focusArea": "most important topic to master"
}`;

    const raw = await callGroq(prompt, 1500);

    // Parse JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse planner response");
    const plan = JSON.parse(jsonMatch[0]);

    // Save to Supabase
    await supabase.from("agent_plans").upsert({
      user_id: userId,
      exam_name: examName,
      exam_date: examDate,
      plan: JSON.stringify(plan),
      updated_at: new Date().toISOString(),
    });

    return { success: true, plan };
  } catch (err) {
    console.error("Planner agent error:", err);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════
// AGENT 2: OBSERVER
// Tracks knowledge and builds mastery map
// ══════════════════════════════

export async function runObserverAgent(userId) {
  try {
    // Get all quiz scores
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("topic, score, total, pct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Get all study sessions
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("topic, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!scores || scores.length === 0) {
      return {
        success: true,
        insights: {
          masteredTopics: [],
          weakTopics: [],
          studyStreak: 0,
          totalSessions: 0,
          averageScore: 0,
          knowledgeMap: [],
          recommendation: "Start your first study session to get personalized insights!",
        },
      };
    }

    // Build knowledge map — group by topic, average scores
    const topicMap = {};
    scores.forEach((s) => {
      if (!topicMap[s.topic]) topicMap[s.topic] = { scores: [], lastStudied: s.created_at };
      topicMap[s.topic].scores.push(s.pct);
      if (s.created_at > topicMap[s.topic].lastStudied) {
        topicMap[s.topic].lastStudied = s.created_at;
      }
    });

    const knowledgeMap = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      attempts: data.scores.length,
      lastStudied: data.lastStudied,
      status: data.scores[data.scores.length - 1] >= 80 ? "mastered" : data.scores[data.scores.length - 1] >= 60 ? "learning" : "weak",
    }));

    // Calculate streak
    const sessionDates = sessions
      ? [...new Set(sessions.map((s) => s.created_at.split("T")[0]))].sort().reverse()
      : [];
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < sessionDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (sessionDates[i] === expectedStr) streak++;
      else break;
    }

    const avgScore = Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length);
    const masteredTopics = knowledgeMap.filter((t) => t.status === "mastered").map((t) => t.topic);
    const weakTopics = knowledgeMap.filter((t) => t.status === "weak").map((t) => t.topic);

    // Get AI recommendation
    const prompt = `Student knowledge summary:
- Mastered: ${masteredTopics.join(", ") || "none yet"}
- Weak: ${weakTopics.join(", ") || "none yet"}
- Average score: ${avgScore}%
- Study streak: ${streak} days

Write ONE short, specific, encouraging recommendation (max 20 words) for what they should do today.`;

    const recommendation = await callGroq(prompt, 100);

    return {
      success: true,
      insights: {
        masteredTopics,
        weakTopics,
        studyStreak: streak,
        totalSessions: sessions?.length || 0,
        averageScore: avgScore,
        knowledgeMap,
        recommendation: recommendation.trim(),
      },
    };
  } catch (err) {
    console.error("Observer agent error:", err);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════
// AGENT 3: COACH
// Spaced repetition — surfaces right topic at right time
// ══════════════════════════════

export async function runCoachAgent(userId) {
  try {
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("topic, pct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("topic, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!sessions || sessions.length === 0) {
      return {
        success: true,
        coaching: {
          urgentReview: [],
          todayFocus: "Start your first session to get coaching!",
          motivationalMessage: "Every expert was once a beginner. Let's go! 🚀",
          nextReviewTimes: [],
        },
      };
    }

    const now = new Date();

    // SM-2 spaced repetition intervals in days: [1, 3, 7, 14, 30]
    const intervals = [1, 3, 7, 14, 30];

    // For each topic, calculate when it needs review
    const topicLastStudied = {};
    sessions.forEach((s) => {
      if (!topicLastStudied[s.topic] || s.created_at > topicLastStudied[s.topic].date) {
        topicLastStudied[s.topic] = { date: s.created_at, topic: s.topic };
      }
    });

    // Get score for each topic to determine interval
    const topicScores = {};
    if (scores) {
      scores.forEach((s) => {
        if (!topicScores[s.topic]) topicScores[s.topic] = [];
        topicScores[s.topic].push(s.pct);
      });
    }

    const nextReviewTimes = Object.entries(topicLastStudied).map(([topic, data]) => {
      const avgScore = topicScores[topic]
        ? topicScores[topic].reduce((a, b) => a + b, 0) / topicScores[topic].length
        : 50;
      // Higher score = longer interval before next review
      const intervalIndex = avgScore >= 90 ? 4 : avgScore >= 80 ? 3 : avgScore >= 70 ? 2 : avgScore >= 60 ? 1 : 0;
      const daysUntilReview = intervals[intervalIndex];
      const lastStudied = new Date(data.date);
      const reviewDate = new Date(lastStudied);
      reviewDate.setDate(reviewDate.getDate() + daysUntilReview);
      const hoursOverdue = Math.max(0, (now - reviewDate) / (1000 * 60 * 60));
      return {
        topic,
        reviewDate: reviewDate.toISOString(),
        hoursOverdue: Math.round(hoursOverdue),
        isOverdue: now > reviewDate,
        avgScore: Math.round(avgScore),
      };
    });

    const urgentReview = nextReviewTimes
      .filter((t) => t.isOverdue)
      .sort((a, b) => b.hoursOverdue - a.hoursOverdue)
      .slice(0, 3);

    // AI coaching message
    const prompt = `You are a friendly study coach AI.
Urgent review topics: ${urgentReview.map((t) => t.topic).join(", ") || "none"}
Recent topics studied: ${Object.keys(topicLastStudied).slice(0, 3).join(", ")}

Write a short, warm coaching message (max 25 words) about what to focus on today. Be specific and encouraging.`;

    const todayFocus = await callGroq(prompt, 80);

    const motivationalPrompt = `Write one short motivational quote for a student (max 15 words). Make it unique and not cliché.`;
    const motivationalMessage = await callGroq(motivationalPrompt, 50);

    return {
      success: true,
      coaching: {
        urgentReview,
        todayFocus: todayFocus.trim(),
        motivationalMessage: motivationalMessage.trim(),
        nextReviewTimes: nextReviewTimes.slice(0, 5),
      },
    };
  } catch (err) {
    console.error("Coach agent error:", err);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════
// AGENT 4: PREDICTOR
// Predicts exam readiness and score
// ══════════════════════════════

export async function runPredictorAgent(userId, examName = "your exam") {
  try {
    const { data: scores } = await supabase
      .from("quiz_scores")
      .select("topic, pct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("topic, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!scores || scores.length < 3) {
      return {
        success: true,
        prediction: {
          readinessScore: 0,
          predictedGrade: "Not enough data",
          confidence: 0,
          top3Focus: [],
          trend: "neutral",
          message: "Complete at least 3 quizzes to get your exam readiness prediction.",
          weeklyTrend: [],
        },
      };
    }

    // Calculate readiness score (weighted: recent scores count more)
    let weightedSum = 0;
    let weightTotal = 0;
    scores.forEach((s, i) => {
      const weight = 1 / (i + 1); // More recent = higher weight
      weightedSum += s.pct * weight;
      weightTotal += weight;
    });
    const readinessScore = Math.round(weightedSum / weightTotal);

    // Predict grade
    const predictedGrade =
      readinessScore >= 90 ? "A+" :
      readinessScore >= 80 ? "A" :
      readinessScore >= 70 ? "B+" :
      readinessScore >= 60 ? "B" :
      readinessScore >= 50 ? "C" : "Needs Work";

    // Confidence based on number of attempts
    const confidence = Math.min(95, 50 + scores.length * 3);

    // Find top 3 topics to focus on (lowest scores)
    const topicAvg = {};
    scores.forEach((s) => {
      if (!topicAvg[s.topic]) topicAvg[s.topic] = [];
      topicAvg[s.topic].push(s.pct);
    });
    const top3Focus = Object.entries(topicAvg)
      .map(([topic, pctsArr]) => ({
        topic,
        avg: Math.round(pctsArr.reduce((a, b) => a + b, 0) / pctsArr.length),
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3);

    // Trend — compare last 5 vs previous 5
    const recent5 = scores.slice(0, 5).reduce((a, b) => a + b.pct, 0) / Math.min(5, scores.length);
    const prev5 = scores.slice(5, 10).reduce((a, b) => a + b.pct, 0) / Math.min(5, scores.slice(5, 10).length) || recent5;
    const trend = recent5 > prev5 + 5 ? "improving" : recent5 < prev5 - 5 ? "declining" : "stable";

    // Weekly trend data for chart
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayScores = scores.filter((s) => s.created_at.startsWith(dateStr));
      weeklyTrend.push({
        day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()],
        score: dayScores.length > 0
          ? Math.round(dayScores.reduce((a, b) => a + b.pct, 0) / dayScores.length)
          : null,
      });
    }

    // AI prediction message
    const prompt = `Student exam prediction:
- Readiness: ${readinessScore}%
- Predicted grade: ${predictedGrade}
- Trend: ${trend}
- Weakest topics: ${top3Focus.map((t) => t.topic).join(", ")}
- Exam: ${examName}

Write a specific, actionable 2-sentence prediction message. 
Sentence 1: Their current readiness and predicted outcome.
Sentence 2: The single most important thing to do in the next 48 hours.
Be direct and specific.`;

    const message = await callGroq(prompt, 150);

    return {
      success: true,
      prediction: {
        readinessScore,
        predictedGrade,
        confidence,
        top3Focus,
        trend,
        message: message.trim(),
        weeklyTrend,
      },
    };
  } catch (err) {
    console.error("Predictor agent error:", err);
    return { success: false, error: err.message };
  }
}
```

---

## STEP 2 — CREATE Supabase table for agent plans

Run this SQL in Supabase SQL Editor:

```sql
create table if not exists agent_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  exam_name text,
  exam_date text,
  plan text,
  updated_at timestamptz default now()
);

alter table agent_plans enable row level security;

create policy "Users manage own plans" on agent_plans
  for all using (auth.uid() = user_id);
```

---

## STEP 3 — CREATE src/pages/AgentsPage.jsx

Create a new page that shows all 4 agents in one beautiful dashboard:

```jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import {
  runPlannerAgent,
  runObserverAgent,
  runCoachAgent,
  runPredictorAgent,
} from "../utils/agents";

export default function AgentsPage({ user }) {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState("observer");
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [topics, setTopics] = useState("");

  const userId = user?.id;

  // Auto-run Observer and Coach on load
  useEffect(() => {
    if (!userId) return;
    runAgent("observer");
    runAgent("coach");
    runAgent("predictor");
  }, [userId]);

  const runAgent = async (agentId) => {
    if (!userId) return;
    setLoading((prev) => ({ ...prev, [agentId]: true }));
    try {
      let result;
      if (agentId === "observer") result = await runObserverAgent(userId);
      else if (agentId === "coach") result = await runCoachAgent(userId);
      else if (agentId === "predictor") result = await runPredictorAgent(userId, examName || "your exam");
      else if (agentId === "planner") {
        if (!examName || !examDate || !topics) {
          setResults((prev) => ({ ...prev, planner: { error: "Please fill in exam name, date and topics first." } }));
          setLoading((prev) => ({ ...prev, planner: false }));
          return;
        }
        result = await runPlannerAgent(userId, examName, examDate, topics.split(",").map((t) => t.trim()));
      }
      setResults((prev) => ({ ...prev, [agentId]: result }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [agentId]: { success: false, error: err.message } }));
    } finally {
      setLoading((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  const AGENTS = [
    { id: "observer", icon: "visibility",     label: "Observer",  color: "text-secondary",        bg: "bg-secondary-container/20",       desc: "Knowledge map" },
    { id: "coach",    icon: "psychology",      label: "Coach",     color: "text-primary-container", bg: "bg-primary-container/10",         desc: "What to study" },
    { id: "predictor",icon: "trending_up",     label: "Predictor", color: "text-tertiary-fixed-dim",bg: "bg-tertiary-container/20",        desc: "Exam readiness" },
    { id: "planner",  icon: "calendar_month",  label: "Planner",   color: "text-error",             bg: "bg-error-container/20",           desc: "Study schedule" },
  ];

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="agents" />
      <main className="md:ml-64 min-h-screen p-6 md:p-10">

        {/* Header */}
        <header className="mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">AI Intelligence</span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mt-2">
            Your AI Agents
          </h1>
          <p className="text-on-surface-variant mt-2">4 agents working silently to personalize your learning</p>
        </header>

        {/* Agent tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {AGENTS.map((a) => (
            <button key={a.id} onClick={() => setActiveAgent(a.id)}
              className={`p-5 rounded-2xl border transition-all text-left ${
                activeAgent === a.id
                  ? "border-primary-container/40 bg-surface-container-low"
                  : "border-outline-variant/10 bg-surface-container-low/50 hover:border-outline-variant/30"
              }`}>
              <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${a.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
              </div>
              <div className="font-headline font-bold text-on-surface">{a.label}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{a.desc}</div>
              {loading[a.id] && (
                <div className="mt-2 w-4 h-4 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        {/* ── OBSERVER ── */}
        {activeAgent === "observer" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Observer Agent</h2>
              <button onClick={() => runAgent("observer")} disabled={loading.observer}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.observer && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Analyzing your knowledge...
              </div>
            )}

            {results.observer?.insights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-primary-container">{results.observer.insights.studyStreak}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Day Streak</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-secondary">{results.observer.insights.averageScore}%</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Avg Score</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-tertiary-fixed-dim">{results.observer.insights.masteredTopics.length}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Mastered</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-error">{results.observer.insights.weakTopics.length}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Weak Topics</div>
                </div>
              </div>
            )}

            {results.observer?.insights?.knowledgeMap?.length > 0 && (
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                <h3 className="font-headline font-bold text-lg mb-4">Knowledge Map</h3>
                <div className="space-y-4">
                  {results.observer.insights.knowledgeMap.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{t.topic}</span>
                        <span className={t.avgScore >= 80 ? "text-primary-container" : t.avgScore >= 60 ? "text-tertiary-fixed-dim" : "text-error"}>
                          {t.avgScore}% · {t.status}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${t.avgScore >= 80 ? "bg-primary-container" : t.avgScore >= 60 ? "bg-tertiary-fixed-dim" : "bg-error"}`}
                          style={{ width: `${t.avgScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.observer?.insights?.recommendation && (
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="font-bold text-primary-container">AI Recommendation</span>
                </div>
                <p className="text-on-surface">{results.observer.insights.recommendation}</p>
              </div>
            )}

            {!results.observer && !loading.observer && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">visibility</span>
                Complete some quizzes to see your knowledge map
              </div>
            )}
          </div>
        )}

        {/* ── COACH ── */}
        {activeAgent === "coach" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Coach Agent</h2>
              <button onClick={() => runAgent("coach")} disabled={loading.coach}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.coach && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Calculating your review schedule...
              </div>
            )}

            {results.coach?.coaching && (
              <>
                {/* Today's focus */}
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary-container text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
                    <h3 className="font-headline font-bold text-lg">Today's Focus</h3>
                  </div>
                  <p className="text-on-surface text-lg leading-relaxed">{results.coach.coaching.todayFocus}</p>
                </div>

                {/* Urgent reviews */}
                {results.coach.coaching.urgentReview.length > 0 && (
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-xl">notification_important</span>
                      Urgent Reviews
                    </h3>
                    <div className="space-y-3">
                      {results.coach.coaching.urgentReview.map((t) => (
                        <div key={t.topic}
                          onClick={() => navigate("/study")}
                          className="flex items-center justify-between p-4 bg-surface-container-highest/40 rounded-xl cursor-pointer hover:bg-surface-container-highest transition-colors">
                          <span className="font-medium">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-error font-bold">
                              {t.hoursOverdue > 24
                                ? `${Math.floor(t.hoursOverdue / 24)} days overdue`
                                : `${t.hoursOverdue}h overdue`}
                            </span>
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivational quote */}
                <div className="bg-surface-container-highest/30 border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                  <p className="text-on-surface-variant text-lg italic">{results.coach.coaching.motivationalMessage}</p>
                </div>
              </>
            )}

            {!results.coach && !loading.coach && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">psychology</span>
                Study some topics to get coaching recommendations
              </div>
            )}
          </div>
        )}

        {/* ── PREDICTOR ── */}
        {activeAgent === "predictor" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Predictor Agent</h2>
              <button onClick={() => runAgent("predictor")} disabled={loading.predictor}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.predictor && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Predicting your exam readiness...
              </div>
            )}

            {results.predictor?.prediction && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Readiness gauge */}
                  <div className="md:col-span-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 rounded-full flex items-center justify-center"
                      style={{ background: `conic-gradient(#6ee7b7 ${results.predictor.prediction.readinessScore}%, #1c2030 0)` }}>
                      <div className="absolute inset-2 bg-surface-container-low rounded-full flex flex-col items-center justify-center">
                        <span className="font-headline text-3xl font-extrabold text-primary-container">
                          {results.predictor.prediction.readinessScore}%
                        </span>
                        <span className="text-xs text-on-surface-variant">Ready</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="font-headline text-2xl font-bold text-on-surface">
                        {results.predictor.prediction.predictedGrade}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">
                        Predicted grade · {results.predictor.prediction.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  {/* Top 3 focus */}
                  <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error">priority_high</span>
                      Focus on these 3 topics
                    </h3>
                    {results.predictor.prediction.top3Focus.length > 0 ? (
                      <div className="space-y-4">
                        {results.predictor.prediction.top3Focus.map((t, i) => (
                          <div key={t.topic}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-error-container/30 text-error text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                {t.topic}
                              </span>
                              <span className="text-error font-bold">{t.avg}%</span>
                            </div>
                            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-error transition-all duration-700" style={{ width: `${t.avg}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant text-sm">Complete more quizzes to see your focus areas.</p>
                    )}
                  </div>
                </div>

                {/* AI message */}
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="font-bold text-primary-container">AI Prediction</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      results.predictor.prediction.trend === "improving"
                        ? "bg-primary-container/10 text-primary-container"
                        : results.predictor.prediction.trend === "declining"
                        ? "bg-error-container/10 text-error"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                      {results.predictor.prediction.trend === "improving" ? "↑ Improving" :
                       results.predictor.prediction.trend === "declining" ? "↓ Declining" : "→ Stable"}
                    </span>
                  </div>
                  <p className="text-on-surface leading-relaxed">{results.predictor.prediction.message}</p>
                </div>
              </>
            )}

            {!results.predictor && !loading.predictor && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">trending_up</span>
                Complete at least 3 quizzes to get your exam prediction
              </div>
            )}
          </div>
        )}

        {/* ── PLANNER ── */}
        {activeAgent === "planner" && (
          <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold">Planner Agent</h2>

            {/* Input form */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-headline font-bold text-lg">Set up your exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Exam Name</label>
                  <input value={examName} onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. NEET 2025, Semester Finals"
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Exam Date</label>
                  <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Topics to cover (comma separated)</label>
                <input value={topics} onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. Photosynthesis, Cell Division, Genetics, Ecology"
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-sm" />
              </div>
              <button onClick={() => runAgent("planner")} disabled={loading.planner}
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading.planner ? (
                  <><div className="w-5 h-5 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Building your plan...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>Generate Study Plan</>
                )}
              </button>
              {results.planner?.error && (
                <p className="text-error text-sm">{results.planner.error}</p>
              )}
            </div>

            {/* Plan output */}
            {results.planner?.plan && (
              <div className="space-y-4">
                {results.planner.plan.strategy && (
                  <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-5">
                    <p className="text-primary-container font-medium">
                      <span className="font-bold">Strategy:</span> {results.planner.plan.strategy}
                    </p>
                  </div>
                )}
                {results.planner.plan.days?.map((day) => (
                  <div key={day.day} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                          <span className="font-headline font-bold text-primary-container">{day.day}</span>
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{day.theme}</div>
                          <div className="text-xs text-on-surface-variant">{day.date}</div>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full">
                        ⏱ {day.totalMinutes} min
                      </span>
                    </div>
                    <div className="space-y-2">
                      {day.tasks?.map((task, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-surface-container-highest/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-sm ${task.type === "quiz" ? "text-secondary" : "text-primary-container"}`}>
                              {task.type === "quiz" ? "quiz" : "menu_book"}
                            </span>
                            <span className="text-sm font-medium">{task.topic}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              task.priority === "high"
                                ? "bg-error-container/20 text-error"
                                : "bg-surface-container text-on-surface-variant"
                            }`}>{task.priority}</span>
                            <span className="text-xs text-on-surface-variant">{task.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
```

---

## STEP 4 — ADD route in App.jsx

Open src/App.jsx and add:
1. Import: `import AgentsPage from "./pages/AgentsPage";`
2. Add route inside Routes:
```jsx
<Route path="/agents" element={<Protected user={user}><AgentsPage user={user} /></Protected>} />
```

---

## STEP 5 — ADD Agents link to Sidebar in DashboardPage.jsx

Open src/pages/DashboardPage.jsx and find the links array inside the Sidebar component:
```js
const links = [
  { id: "dashboard",  icon: "dashboard",  label: "Dashboard",  path: "/dashboard" },
  { id: "study",      icon: "menu_book",  label: "Study",      path: "/study" },
  { id: "flashcards", icon: "style",      label: "Flashcards", path: "/flashcards" },
  { id: "quiz",       icon: "quiz",       label: "Quiz",       path: "/quiz" },
  { id: "insights",   icon: "insights",   label: "Insights",   path: "/progress" },
];
```

Add this entry after quiz and before insights:
```js
{ id: "agents", icon: "smart_toy", label: "AI Agents", path: "/agents" },
```

---

## STEP 6 — VERIFY AND TEST

1. npm run dev — no errors
2. Go to localhost:5173/agents
3. Observer and Coach should auto-run on page load
4. If no quiz data yet, they should show empty state messages gracefully
5. Click Planner tab — fill in exam name, date, topics → generate plan
6. Plan should show day-by-day schedule with tasks
7. Click Predictor — should show readiness score or "not enough data" message
8. All 4 agent tabs should switch without errors

## COMMIT
```bash
git add .
git commit -m "feat: implement 4 AI agents — Planner, Observer, Coach, Predictor"
git push origin main
```
