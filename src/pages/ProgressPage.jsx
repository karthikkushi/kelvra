import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";

const WEAK_TOPICS = [
  { name: "Quantum Mechanics",  pct: 32 },
  { name: "Thermodynamics",     pct: 45 },
  { name: "Protein Synthesis",  pct: 42 },
];

const MASTERED = [
  "Organic Synthesis",
  "Microbiology Basics",
  "Classical Mechanics",
  "Linear Algebra",
  "Cell Biology",
  "Organic Chemistry I",
];

const REVIEW_DUE = [
  { topic: "Neural Pathways",  time: "2h left",  urgent: true },
  { topic: "Enzyme Kinetics",  time: "5h left",  urgent: false },
  { topic: "Cellular ATP",     time: "Overdue",  urgent: true },
];

const WEEKLY = [
  { day: "MON", pct: 40 },
  { day: "TUE", pct: 85 },
  { day: "WED", pct: 60 },
  { day: "THU", pct: 95 },
  { day: "FRI", pct: 75 },
  { day: "SAT", pct: 20 },
  { day: "SUN", pct: 30 },
];

export default function ProgressPage() {
  const navigate = useNavigate();

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <Sidebar active="insights" />

      <main className="md:ml-64 p-6 lg:p-10 min-h-screen">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary-container text-secondary text-[10px] font-bold tracking-widest uppercase mb-4">
              Performance Metrics
            </span>
            <h2 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
              Cognitive Progress
            </h2>
            <p className="text-on-surface-variant font-body text-lg">
              Your learning velocity has increased by <span className="text-primary-container font-bold">14%</span> this week. Strategic focus required on molecular dynamics.
            </p>
          </div>

          {/* Streak card */}
          <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center border-2 border-primary/20">
              <span className="font-headline font-bold text-primary-container">K</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Current Streak</p>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-xl"
                  style={{ fontVariationSettings:"'FILL' 1" }}>local_fire_department</span>
                <span className="font-headline font-bold text-xl">12 Days</span>
              </div>
            </div>
          </div>
        </header>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Weekly activity chart */}
          <section className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border border-outline-variant/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-xl font-bold">Weekly Study Activity</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-container" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Focus Hours</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
              {WEEKLY.map((d) => (
                <div key={d.day} className="flex flex-col items-center flex-1 gap-3">
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ${d.pct >= 70 ? "bg-primary-container" : "bg-primary-container/20"}`}
                    style={{ height: `${d.pct}%` }}
                  />
                  <span className="text-[10px] font-bold text-on-surface-variant">{d.day}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Exam readiness gauge */}
          <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center border border-outline-variant/5">
            <h3 className="font-headline text-lg font-bold mb-6 text-center">Exam Readiness</h3>
            {/* Circular gauge using conic-gradient */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center"
              style={{ background: "conic-gradient(#6ee7b7 73%, #1a1b21 0)" }}>
              <div className="absolute inset-2 bg-surface-container-low rounded-full flex flex-col items-center justify-center">
                <span className="font-headline text-4xl font-extrabold text-primary-container">73%</span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Optimized</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-on-surface-variant italic leading-relaxed">
                "You are trending above 85% of your peers in Medical Sciences."
              </p>
            </div>
          </section>

          {/* AI predictive analysis */}
          <section className="md:col-span-5 bg-gradient-to-br from-surface-container-highest to-surface-container-low rounded-xl p-8 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary-container/20 border border-secondary-container/30 rounded-full">
                <span className="material-symbols-outlined text-secondary text-sm">visibility</span>
                <span className="text-secondary text-[10px] font-bold uppercase tracking-wider">Visual Learner</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container"
                  style={{ fontVariationSettings:"'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="font-headline text-lg font-bold">AI Predictive Analysis</h3>
            </div>
            <p className="font-headline text-2xl font-bold leading-tight text-on-surface">
              Based on your pace, you'll master{" "}
              <span className="text-primary-container underline decoration-primary/30">Organic Chemistry</span>{" "}
              in 8 days.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => navigate("/study")}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-md text-sm font-bold hover:scale-[1.02] transition-transform">
                View Roadmap
              </button>
              <span className="text-xs text-on-surface-variant">92% Confidence score</span>
            </div>
          </section>

          {/* Spaced repetition reminders */}
          <section className="md:col-span-3 bg-surface-container-low rounded-xl p-8 border border-outline-variant/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-tertiary-fixed-dim">notification_important</span>
              <h3 className="font-headline text-lg font-bold">Due for review</h3>
            </div>
            <div className="space-y-3">
              {REVIEW_DUE.map((r) => (
                <div key={r.topic}
                  className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-lg cursor-pointer hover:bg-surface-container-highest transition-colors"
                  onClick={() => navigate("/study")}>
                  <span className="text-sm font-medium">{r.topic}</span>
                  <span className={`text-[10px] font-bold ${r.time === "Overdue" ? "text-error" : "text-tertiary"}`}>
                    {r.time}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/study")}
              className="w-full mt-6 py-2 border border-outline-variant/30 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant transition-colors text-on-surface-variant">
              Complete All (3)
            </button>
          </section>

          {/* Weak topics */}
          <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-outline-variant/5">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">trending_down</span>
              Weak Topics
            </h3>
            <div className="space-y-6">
              {WEAK_TOPICS.map((w) => (
                <div key={w.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{w.name}</span>
                    <span className="text-xs text-error font-bold">{w.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full mb-3 overflow-hidden">
                    <div className="h-full bg-error transition-all duration-700" style={{ width: `${w.pct}%` }} />
                  </div>
                  <button
                    onClick={() => navigate("/study")}
                    className="text-[10px] font-bold uppercase tracking-wider text-primary-container hover:underline">
                    Practice now
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Mastered topics */}
          <section className="md:col-span-12 bg-surface-container-low rounded-xl p-8 border border-outline-variant/5">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">emoji_events</span>
              Topics Mastered
            </h3>
            <div className="flex flex-wrap gap-4">
              {MASTERED.map((topic) => (
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
          </section>

        </div>

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
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50">
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