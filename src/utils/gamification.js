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

// Award XP to user — pass user object so we can store display_name without joining auth.users
export async function awardXP(userId, action, metadata = {}, userObj = null) {
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
      const displayName = userObj?.user_metadata?.full_name
        || userObj?.email?.split("@")[0]
        || null;
      await supabase.from("user_xp").insert({
        user_id: userId,
        display_name: displayName,
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

// Get leaderboard — reads only from user_xp, no auth.users join
export async function getLeaderboard() {
  try {
    const { data } = await supabase
      .from("user_xp")
      .select("user_id, display_name, total_xp, weekly_xp, level, badges, week_start")
      .order("weekly_xp", { ascending: false })
      .limit(20);
    return data || [];
  } catch {
    return [];
  }
}
