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
