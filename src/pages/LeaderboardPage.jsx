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
  const displayName = (entry) => entry.display_name || "Student";

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
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="leaderboard" />
      <main className="md:ml-64 min-h-screen p-4 sm:p-6 md:p-10 pb-24 md:pb-10">

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
