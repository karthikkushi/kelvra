// src/utils/gamification.js
import { doc, setDoc, collection, query, where, limit } from "firebase/firestore";
import { db, saveLater, readDoc, readQuery } from "./firebase";

const xpDoc = (userId) => doc(db, "leaderboard", userId);

// Sunday of this week as YYYY-MM-DD (weekly XP resets when this changes)
function currentWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

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

// Award XP to user — pass user object so we can store display_name on the leaderboard.
// Calls run one after another, so two awards at the same moment cannot overwrite each other.
let xpQueue = Promise.resolve();
export function awardXP(userId, action, metadata = {}, userObj = null) {
  const run = xpQueue.then(() => awardXPNow(userId, action, metadata, userObj));
  xpQueue = run.catch(() => null);
  return run;
}

async function awardXPNow(userId, action, _metadata = {}, userObj = null) {
  try {
    const xpGain = XP_REWARDS[action] || 0;
    if (!xpGain) return null;

    // Get current XP record
    if (!db || !userId) return null;
    let current = null;
    try {
      const snap = await readDoc(xpDoc(userId), 5000);
      current = snap.exists() ? snap.data() : null;
    } catch {
      return null; // could not read the current XP (offline, not cached): skip rather than overwrite it
    }

    const weekStartStr = currentWeekStart();

    if (current) {
      // Reset weekly XP if new week
      const isNewWeek = current.week_start !== weekStartStr;
      const newWeeklyXP = isNewWeek ? xpGain : current.weekly_xp + xpGain;
      const newTotalXP = current.total_xp + xpGain;
      const newLevel = calculateLevel(newTotalXP);

      // Check for new badges
      const newBadges = [...(current.badges || [])];
      if ((action === "FIRST_SESSION" || action === "GENERATE_KIT") && !newBadges.includes("first_step")) newBadges.push("first_step");
      if (action === "PERFECT_QUIZ" && !newBadges.includes("quiz_master")) newBadges.push("quiz_master");
      if (action === "SHARE_KIT" && !newBadges.includes("social_star")) newBadges.push("social_star");
      if (newLevel >= 5 && !newBadges.includes("level_5")) newBadges.push("level_5");
      if (newLevel >= 10 && !newBadges.includes("level_10")) newBadges.push("level_10");
      if (newTotalXP >= 1000 && !newBadges.includes("centurion")) newBadges.push("centurion");

      saveLater(setDoc(xpDoc(userId), {
        total_xp: newTotalXP,
        weekly_xp: newWeeklyXP,
        week_start: weekStartStr,
        level: newLevel,
        badges: newBadges,
        updated_at: new Date().toISOString(),
      }, { merge: true }), "Save XP");

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
      const newBadges = action === "FIRST_SESSION" || action === "GENERATE_KIT" ? ["first_step"] : [];
      const displayName = userObj?.user_metadata?.full_name
        || userObj?.email?.split("@")[0]
        || null;
      saveLater(setDoc(xpDoc(userId), {
        user_id: userId,
        display_name: displayName,
        total_xp: xpGain,
        weekly_xp: xpGain,
        week_start: weekStartStr,
        level: 1,
        badges: newBadges,
        updated_at: new Date().toISOString(),
      }), "Save XP");
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
    const snap = await readDoc(xpDoc(userId), 5000);
    const data = snap.exists() ? snap.data() : null;
    if (!data) return { total_xp: 0, weekly_xp: 0, level: 1, badges: [] };
    return { ...data, weekly_xp: data.week_start === currentWeekStart() ? data.weekly_xp : 0 };
  } catch {
    return { total_xp: 0, weekly_xp: 0, level: 1, badges: [] };
  }
}

// Get this week's leaderboard: ONLY students who chose to appear on it (opt-in; ranking can add
// pressure, so nobody is listed by default). Old weeks' XP counts as 0.
export async function getLeaderboard() {
  try {
    const snap = await readQuery(query(collection(db, "leaderboard"), where("public", "==", true), limit(200)));
    const week = currentWeekStart();
    return snap.docs
      .map((d) => ({ user_id: d.id, ...d.data() }))
      .map((e) => ({ ...e, weekly_xp: e.week_start === week ? e.weekly_xp : 0 }))
      .sort((a, b) => b.weekly_xp - a.weekly_xp || b.total_xp - a.total_xp)
      .slice(0, 20);
  } catch {
    return [];
  }
}

// Show or hide yourself on the leaderboard (off by default).
export async function setLeaderboardVisibility(userId, visible, displayName) {
  if (!db || !userId) return;
  const current = await getUserXP(userId);
  saveLater(setDoc(xpDoc(userId), {
    public: !!visible,
    display_name: displayName || current.display_name || null,
    total_xp: current.total_xp || 0,
    weekly_xp: Math.min(current.weekly_xp || 0, current.total_xp || 0),
    updated_at: new Date().toISOString(),
  }, { merge: true }), "Save leaderboard choice");
}
