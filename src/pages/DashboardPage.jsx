import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudySessions, getQuizScores } from "../utils/supabase";

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

function calcTopicsMastered(scores) {
  const byTopic = {};
  scores.forEach((s) => {
    if (!byTopic[s.topic]) byTopic[s.topic] = [];
    byTopic[s.topic].push(s.pct);
  });
  return Object.entries(byTopic)
    .filter(([, pcts]) => (pcts.reduce((a, b) => a + b, 0) / pcts.length) >= 80)
    .length;
}

function calcWeakSpots(scores) {
  const byTopic = {};
  scores.forEach((s) => {
    if (!byTopic[s.topic]) byTopic[s.topic] = [];
    byTopic[s.topic].push(s.pct);
  });
  return Object.entries(byTopic)
    .map(([topic, pcts]) => ({ topic, pct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) }))
    .filter((t) => t.pct < 75)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);
}

function getRecentTopics(sessions, scores) {
  // Topics scored below 80% recently
  const topicsWithScores = new Set(scores.filter((s) => s.pct < 80).map((s) => s.topic));
  const recentSessions = sessions.filter((s) => s.topic && topicsWithScores.has(s.topic)).slice(0, 3);
  return recentSessions;
}

function getLongestNotStudied(sessions) {
  if (!sessions.length) return null;
  const byTopic = {};
  sessions.forEach((s) => {
    if (!s.topic) return;
    if (!byTopic[s.topic] || new Date(s.created_at) > new Date(byTopic[s.topic])) {
      byTopic[s.topic] = s.created_at;
    }
  });
  const entries = Object.entries(byTopic);
  if (!entries.length) return null;
  entries.sort((a, b) => new Date(a[1]) - new Date(b[1]));
  const [topic, lastDate] = entries[0];
  const daysAgo = Math.floor((Date.now() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
  return { topic, daysAgo };
}

function Skeleton({ className }) {
  return <div className={`bg-surface-container-highest/60 animate-pulse rounded-lg ${className}`} />;
}

function Sidebar({ active = "dashboard" }) {
  const navigate = useNavigate();
  const links = [
    { id: "dashboard",  icon: "dashboard",  label: "Dashboard",  path: "/dashboard" },
    { id: "study",      icon: "menu_book",  label: "Study",      path: "/study" },
    { id: "flashcards", icon: "style",      label: "Flashcards", path: "/flashcards" },
    { id: "quiz",       icon: "quiz",       label: "Quiz",       path: "/quiz" },
    { id: "insights",   icon: "insights",   label: "Insights",   path: "/progress" },
  ];
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low flex-col py-6 gap-2 hidden md:flex">
      <div className="px-6 mb-8">
        <h1 className="font-headline text-lg font-extrabold text-on-surface tracking-tighter">Kelvra</h1>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-label">Intelligent Atelier</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <div key={l.id}
            onClick={() => navigate(l.path)}
            className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-all duration-200 gap-3 font-label text-sm font-medium ${
              active === l.id
                ? "bg-surface-container-highest text-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:translate-x-1"
            }`}>
            <span className="material-symbols-outlined"
              style={active === l.id ? { fontVariationSettings:"'FILL' 1" } : {}}>
              {l.icon}
            </span>
            {l.label}
          </div>
        ))}
      </nav>
      <div className="px-4 mt-auto space-y-1">
        <button className="w-full bg-primary-container text-on-primary-container font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:scale-[1.02] active:scale-95 transition-all text-sm">
          <span className="material-symbols-outlined text-sm">bolt</span>
          Upgrade to Pro
        </button>
        {["settings", "help_outline"].map((icon) => (
          <div key={icon} className="text-on-surface-variant hover:bg-surface-container-highest/50 mx-2 rounded-lg flex items-center px-4 py-2 gap-3 cursor-pointer transition-all">
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="font-medium text-sm capitalize">{icon === "help_outline" ? "Help" : "Settings"}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
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

  const streak        = loading ? 0  : calcStreak(sessions);
  const topicsMastered = loading ? 0 : calcTopicsMastered(scores);
  const quizAccuracy  = loading ? 0  : (scores.length ? Math.round(scores.reduce((a, b) => a + b.pct, 0) / scores.length) : 0);
  const studyHours    = loading ? 0  : (sessions.length * 0.5).toFixed(1);
  const weakSpots     = loading ? [] : calcWeakSpots(scores);
  const reviewTopics  = loading ? [] : getRecentTopics(sessions, scores);
  const coachTopic    = loading ? null : getLongestNotStudied(sessions);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const STATS = [
    { label: "Streak days",     value: loading ? "…" : String(streak),          color: "text-primary-container" },
    { label: "Topics mastered", value: loading ? "…" : String(topicsMastered),  color: "text-on-surface" },
    { label: "Quiz accuracy",   value: loading ? "…" : `${quizAccuracy}%`,      color: "text-secondary" },
    { label: "Study hours",     value: loading ? "…" : String(studyHours),      color: "text-on-surface" },
  ];

  // Build today's study plan from review topics or fallback
  const TASKS = reviewTopics.length > 0
    ? reviewTopics.map((s, i) => ({
        num: String(i + 1).padStart(2, "0"),
        title: s.topic || "Study Session",
        time: "25 min",
        diff: "Review",
        diffColor: "bg-tertiary-container/20 text-tertiary-fixed border-tertiary/20",
      }))
    : [
        { num: "01", title: "Start a study session", time: "25 min", diff: "Easy", diffColor: "bg-primary-container/10 text-primary-container border-primary-container/20" },
      ];

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="dashboard" />

      {/* ── MAIN ── */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-12">

        {/* Top bar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/15 flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="md:hidden font-headline font-bold text-primary-container text-xl tracking-tighter">Kelvra</span>
            <h2 className="hidden md:block font-headline font-bold text-on-surface text-xl tracking-tight">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full border border-outline-variant/10">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg"
                style={{ fontVariationSettings:"'FILL' 1" }}>local_fire_department</span>
              <span className="text-sm font-bold text-tertiary-fixed-dim">{loading ? "…" : streak}</span>
            </div>
            {/* Language */}
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">language</span>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-primary-container/20">
              <span className="text-xs font-bold text-on-primary-container">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "K"}
              </span>
            </div>
          </div>
        </header>

        <div className="px-6 pt-24 max-w-7xl mx-auto space-y-8">

          {/* ── Greeting + AI Coach ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col justify-end py-4">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
                Good morning, <span className="text-primary-container">{firstName}</span>.
              </h1>
              <p className="text-on-surface-variant mt-2 text-lg">Ready to study?</p>
            </div>

            {/* AI Coach card */}
            {!dismissed && (
              <div className="lg:col-span-2 relative overflow-hidden bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 blur-[80px] rounded-full -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary-container/20 shrink-0">
                    <span className="material-symbols-outlined text-primary-container text-3xl"
                      style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-container">AI Smart Coach</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant">
                        {coachTopic ? "Urgent Review" : "Start Learning"}
                      </span>
                    </div>
                    {loading ? (
                      <div className="space-y-2"><Skeleton className="h-6 w-full" /><Skeleton className="h-4 w-3/4" /></div>
                    ) : coachTopic ? (
                      <>
                        <h3 className="font-headline text-xl font-bold text-on-surface">
                          You haven't reviewed <span className="text-tertiary-fixed-dim">{coachTopic.topic}</span> in {coachTopic.daysAgo} day{coachTopic.daysAgo !== 1 ? "s" : ""} — you might forget it soon.
                        </h3>
                        <p className="text-on-surface-variant mt-2 text-sm max-w-xl">
                          Spaced repetition data suggests review now to lock in the neural pathway.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-headline text-xl font-bold text-on-surface">
                          Welcome to Kelvra! Start your first study session.
                        </h3>
                        <p className="text-on-surface-variant mt-2 text-sm max-w-xl">
                          Paste notes, type a topic, or upload a PDF to generate flashcards, quizzes, and a study plan.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => navigate("/study")}
                      className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(110,231,183,0.15)] text-sm">
                      {coachTopic ? "Start now" : "Study Now"}
                    </button>
                    <button onClick={() => setDismissed(true)}
                      className="text-on-surface-variant hover:text-on-surface text-xs text-center transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Study Plan + Weak Spots ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Today's plan */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline text-2xl font-bold tracking-tight">Today's Study Plan</h2>
                <span onClick={() => navigate("/study")} className="text-sm text-primary-container font-medium cursor-pointer hover:underline">New Session</span>
              </div>
              <div className="space-y-4">
                {loading ? (
                  [1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
                ) : (
                  TASKS.map((t) => (
                    <div key={t.num}
                      onClick={() => navigate("/study")}
                      className="bg-surface-container-highest/40 hover:bg-surface-container-highest transition-all duration-300 rounded-xl p-5 flex items-center gap-6 border border-outline-variant/5 cursor-pointer group min-h-[48px]">
                      <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant font-headline text-sm">
                        {t.num}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg group-hover:text-primary-container transition-colors">{t.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            <span className="text-xs font-medium">{t.time}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${t.diffColor}`}>
                            {t.diff}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary-container transition-colors">play_circle</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weak spots */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline text-2xl font-bold tracking-tight">Weak Spots</h2>
                <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer">help_outline</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6 space-y-6 border border-outline-variant/10">
                {loading ? (
                  <div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                ) : weakSpots.length === 0 ? (
                  <p className="text-on-surface-variant text-sm">
                    {scores.length === 0 ? "Take a quiz to identify weak spots." : "No weak spots — keep it up!"}
                  </p>
                ) : (
                  <div className="space-y-5">
                    {weakSpots.map((w) => (
                      <div key={w.topic} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                          <span>{w.topic}</span>
                          <span className={w.pct < 50 ? "text-error" : "text-tertiary-fixed-dim"}>{w.pct}% Mastery</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${w.pct < 50 ? "bg-error" : "bg-tertiary-fixed-dim"} transition-all duration-700`} style={{ width: `${w.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate("/progress")}
                  className="w-full py-2.5 border border-outline-variant/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors text-on-surface-variant">
                  View Full Insights
                </button>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 text-center">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant mb-2">{s.label}</p>
                {loading ? <Skeleton className="h-9 w-16 mx-auto" /> : (
                  <p className={`font-headline text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon: "dashboard",  label: "Home",    path: "/dashboard",  active: true },
          { icon: "menu_book",  label: "Study",   path: "/study" },
          { icon: "style",      label: "Cards",   path: "/flashcards" },
          { icon: "insights",   label: "Stats",   path: "/progress" },
        ].map((item) => (
          <div key={item.label} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings:"'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </div>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}

export { Sidebar };
