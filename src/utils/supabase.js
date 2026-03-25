// src/utils/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error("Supabase keys missing. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth helpers ──
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  return { data, error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/dashboard" },
  });
  return { data, error };
}

// ── Save study session ──
export async function saveStudySession(userId, topic, results) {
  const { data, error } = await supabase
    .from("study_sessions")
    .insert([{
      user_id:    userId,
      topic,
      summary:    results.summary    ? JSON.stringify(results.summary)    : null,
      flashcards: results.flashcards ? JSON.stringify(results.flashcards) : null,
      quiz:       results.quiz       ? JSON.stringify(results.quiz)       : null,
      plan:       results.plan       ? JSON.stringify(results.plan)       : null,
      created_at: new Date().toISOString(),
    }]);
  return { data, error };
}

// ── Save quiz score ──
export async function saveQuizScore(userId, topic, score, total) {
  const { data, error } = await supabase
    .from("quiz_scores")
    .insert([{
      user_id:    userId,
      topic,
      score,
      total,
      pct:        Math.round((score / total) * 100),
      created_at: new Date().toISOString(),
    }]);
  return { data, error };
}

// ── Get study sessions (last N days) ──
export async function getStudySessions(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

// ── Get quiz scores (last N days) ──
export async function getQuizScores(userId, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("quiz_scores")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

// ── Get user sessions (legacy, last 10) ──
export async function getUserSessions(userId) {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return { data, error };
}

// ── Save onboarding preferences ──
export async function saveOnboardingPrefs(studyType, goal, learningStyle) {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      study_type:     studyType,
      goal,
      learning_style: learningStyle,
      onboarding_done: true,
    },
  });
  return { data, error };
}
