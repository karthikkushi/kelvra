import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import { getStudySessions, getQuizScores } from "../utils/supabase";

function calcWeekly(sessions) {
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const count = sessions.filter((s) => new Date(s.created_at).toDateString() === dayStr).length;
    return { day: days[d.getDay()], pct: Math.min(count * 33, 100) };
  });
}

function calcWeakTopics(scores) {
  const byTopic = {};
  scores.forEach((s) => {
    if (!byTopic[s.topic]) byTopic[s.topic] = [];
    byTopic[s.topic].push(s.pct);
  });
  return Object.entries(byTopic)
    .map(([name, pcts]) => ({ name, pct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) }))
    .filter((t) => t.pct < 75)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);
}

function calcMastered(scores) {
  const byTopic = {};
  scores.forEach((s) => {
    if (!byTopic[s.topic]) byTopic[s.topic] = [];
    byTopic[s.topic].push(s.pct);
  });
  return Object.entries(byTopic)
    .filter(([, pcts]) => (pcts.reduce((a, b) => a + b, 0) / pcts.length) >= 80)
    .map(([name]) => name);
}

function calcExamReadiness(scores) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length);
}

function calcStreak(sessions) {
  const days = new Set(sessions.map((s) => new Date(s.created_at).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function Skeleton({ className }) {
  return <div className={`bg-surface-container-highest/60 animate-pulse rounded-lg ${className}`} />;
}

export default function ProgressPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    Promise.all([
      getStudySessions(user.id, 30),
      getQuizScores(user.id, 30),
    ]).then(([{ data: s }, { data: q }]) => {
      setSessions(s || []);
      setScores(q || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const weekly      = loading ? [] : calcWeekly(sessions);
  const weakTopics  = loading ? [] : calcWeakTopics(scores);
  const mastered    = loading ? [] : calcMastered(scores);
  const readiness   = loading ? 0  : calcExamReadiness(scores);
  const streak      = loading ? 0  : calcStreak(sessions);
  const noData      = !loading && sessions.length === 0 && scores.length === 0;

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="insights" />

      <main className="md:ml-64 p-6 lg:p-10 min-h-screen">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-widest uppercase mb-4">
              Performance Metrics
            </span>
            <h2 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
              Cognitive Progress
            </h2>
            <p className="text-on-surface-variant font-body text-lg">
              {noData
                ? "Start studying to see your progress here."
                : `You have ${sessions.length} session${sessions.length !== 1 ? "s" : ""} and ${scores.length} quiz score${scores.length !== 1 ? "s" : ""} this month.`}
            </p>
          </div>

          {/* Streak card */}
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center border-2 border-primary-container/20">
              <span className="font-headline font-bold text-primary-container">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "K"}
              </span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Current Streak</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xl"
                  style={{ fontVariationSettings:"'FILL' 1" }}>local_fire_department</span>
                {loading ? <Skeleton className="w-16 h-5" /> : (
                  <span className="font-headline font-bold text-xl">{streak} {streak === 1 ? "Day" : "Days"}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {noData ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <div className="w-20 h-20 rounded-full bg-surface-container-low border border-outline-variant/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-4xl">insights</span>
            </div>
            <div className="text-center">
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">No data yet</h3>
              <p className="text-on-surface-variant text-sm max-w-xs">Start studying to see your progress, quiz scores, and weak spot analysis.</p>
            </div>
            <button onClick={() => navigate("/study")}
              className="px-8 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] transition-transform">
              Start Studying
            </button>
          </div>
        ) : (
          /* Bento grid */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Weekly activity chart */}
            <section className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline text-xl font-bold">Weekly Study Activity</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-container" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Sessions</span>
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="flex items-end justify-between h-48 gap-2">
                  {weekly.map((d) => (
                    <div key={d.day} className="flex flex-col items-center flex-1 gap-3">
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${d.pct >= 33 ? "bg-primary-container" : "bg-primary-container/20"}`}
                        style={{ height: `${Math.max(d.pct, 4)}%` }}
                      />
                      <span className="text-[10px] font-bold text-on-surface-variant">{d.day}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Exam readiness gauge */}
            <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-6 text-center">Exam Readiness</h3>
              {loading ? (
                <Skeleton className="w-40 h-40 rounded-full" />
              ) : (
                <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
                  style={{ background: `conic-gradient(#6ee7b7 ${readiness}%, #1a1b21 0)` }}>
                  <div className="absolute inset-2 bg-surface-container-low rounded-full flex flex-col items-center justify-center">
                    <span className="font-headline text-4xl font-extrabold text-primary-container">{readiness}%</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {readiness >= 80 ? "Excellent" : readiness >= 60 ? "On Track" : "Keep Going"}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-6 text-center">
                <p className="text-xs text-on-surface-variant italic leading-relaxed">
                  {scores.length === 0 ? "Take a quiz to see your readiness score." : `Based on ${scores.length} quiz score${scores.length !== 1 ? "s" : ""}.`}
                </p>
              </div>
            </section>

            {/* AI predictive analysis */}
            <section className="md:col-span-5 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 blur-[60px] rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="font-headline text-lg font-bold">AI Analysis</h3>
              </div>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-6 w-3/5" />
                </div>
              ) : (
                <p className="font-headline text-2xl font-bold leading-tight text-on-surface">
                  {sessions.length === 0
                    ? "Start your first session to unlock AI insights."
                    : weakTopics.length > 0
                      ? <>Focus on <span className="text-primary-container underline decoration-primary-container/30">{weakTopics[0].name}</span> to boost your overall score.</>
                      : "Great work! Keep your streak going to stay sharp."}
                </p>
              )}
              <div className="mt-6 flex items-center gap-4">
                <button onClick={() => navigate("/study")}
                  className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform">
                  {sessions.length === 0 ? "Start Now" : "Study More"}
                </button>
              </div>
            </section>

            {/* Sessions this month */}
            <section className="md:col-span-3 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary-fixed-dim">calendar_month</span>
                <h3 className="font-headline text-lg font-bold">This Month</h3>
              </div>
              {loading ? (
                <div className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-lg">
                    <span className="text-sm font-medium">Study Sessions</span>
                    <span className="font-headline font-bold text-primary-container">{sessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-lg">
                    <span className="text-sm font-medium">Quizzes Taken</span>
                    <span className="font-headline font-bold text-secondary">{scores.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-lg">
                    <span className="text-sm font-medium">Topics Studied</span>
                    <span className="font-headline font-bold text-on-surface">
                      {new Set(sessions.map((s) => s.topic).filter(Boolean)).size}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Weak topics */}
            <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">trending_down</span>
                Weak Topics
              </h3>
              {loading ? (
                <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
              ) : weakTopics.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  {scores.length === 0 ? "Take a quiz to identify weak spots." : "No weak spots — great work!"}
                </p>
              ) : (
                <div className="space-y-6">
                  {weakTopics.map((w) => (
                    <div key={w.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{w.name}</span>
                        <span className="text-xs text-error font-bold">{w.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full mb-3 overflow-hidden">
                        <div className="h-full bg-error transition-all duration-700" style={{ width: `${w.pct}%` }} />
                      </div>
                      <button onClick={() => navigate("/study")}
                        className="text-[10px] font-bold uppercase tracking-wider text-primary-container hover:underline">
                        Practice now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Mastered topics */}
            <section className="md:col-span-12 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">emoji_events</span>
                Topics Mastered
              </h3>
              {loading ? (
                <div className="flex gap-3 flex-wrap"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-28" /></div>
              ) : mastered.length === 0 ? (
                <p className="text-on-surface-variant text-sm">
                  Score above 80% on a quiz topic to unlock mastery badges.
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {mastered.map((topic) => (
                    <div key={topic}
                      className="flex items-center gap-3 px-4 py-3 bg-surface-container-highest/30 rounded-xl border border-primary-container/10 hover:border-primary-container/30 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary-container text-sm"
                          style={{ fontVariationSettings:"'wght' 700" }}>check</span>
                      </div>
                      <span className="text-sm font-medium">{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-outline-variant/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            © 2025 Kelvra. Intelligence that grows with you.
          </p>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Contact Support"].map((l) => (
              <a key={l} href="#"
                className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors">
                {l}
              </a>
            ))}
          </div>
        </footer>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon: "dashboard", path: "/dashboard" },
          { icon: "menu_book", path: "/study" },
          { icon: "style",     path: "/flashcards" },
          { icon: "insights",  path: "/progress", active: true },
        ].map((item) => (
          <div key={item.icon} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
          </div>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
