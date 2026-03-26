import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveOnboardingPrefs } from "../utils/supabase";

const STEPS = [
  {
    label: "What do you mainly study?",
    options: [
      { icon: "school",           title: "School / College",     desc: "Academic excellence and degree programs." },
      { icon: "work",             title: "Professional Skills",   desc: "Career growth and technical certifications." },
      { icon: "translate",        title: "Language Learning",     desc: "Fluency and linguistic cultural mastery." },
      { icon: "self_improvement", title: "Personal Growth",       desc: "Habits, hobbies, and holistic wisdom." },
    ],
  },
  {
    label: "What is your goal?",
    options: [
      { icon: "emoji_events",     title: "Pass an exam",          desc: "Ace your next test or certification." },
      { icon: "rocket_launch",    title: "Learn a new skill",     desc: "Pick up something valuable and practical." },
      { icon: "calendar_month",   title: "Stay consistent",       desc: "Build a daily learning habit that sticks." },
      { icon: "psychology",       title: "Improve memory",        desc: "Retain more of what you read and study." },
    ],
  },
  {
    label: "How do you learn best?",
    options: [
      { icon: "visibility",       title: "Visual",                desc: "Charts, diagrams, and images." },
      { icon: "menu_book",        title: "Reading",               desc: "Text, notes, and written summaries." },
      { icon: "hearing",          title: "Listening",             desc: "Audio, voice, and spoken explanations." },
      { icon: "shuffle",          title: "Mixed",                 desc: "A bit of everything works for me." },
    ],
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([null, null, null]);
  const [saving, setSaving] = useState(false);

  const pick = (i) => {
    const next = [...selected];
    next[step] = i;
    setSelected(next);
  };

  const next = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Save preferences and navigate to dashboard
      setSaving(true);
      try {
        const studyType     = STEPS[0].options[selected[0] ?? 0].title;
        const goal          = STEPS[1].options[selected[1] ?? 0].title;
        const learningStyle = STEPS[2].options[selected[2] ?? 0].title;
        await saveOnboardingPrefs(studyType, goal, learningStyle);
      } catch (_) {
        // Never block navigation — prefs save is best-effort
      } finally {
        setSaving(false);
        navigate("/dashboard");
      }
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex items-center justify-center p-6 overflow-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Main card */}
      <main className="w-full max-w-4xl bg-surface-container-highest/40 backdrop-blur-[16px] border border-outline-variant/15 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
        style={{ maxHeight: "800px" }}>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full md:w-1/3 bg-surface-container-low p-8 flex flex-col justify-between border-r border-outline-variant/10">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <span className="font-headline font-bold text-xl tracking-tighter text-on-surface">Kelvra</span>
            </div>

            <h1 className="font-headline text-3xl font-extrabold leading-tight mb-4 tracking-tight">
              Design Your{" "}
              <span className="text-primary-container">Learning</span>{" "}
              Path.
            </h1>
            <p className="text-on-surface-variant font-medium leading-relaxed text-sm">
              Personalize your intelligent learning companion to match your unique cognitive profile and goals.
            </p>
          </div>

          {/* Progress bars */}
          <div className="flex gap-4 items-center mt-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                i <= step
                  ? "bg-primary-container shadow-[0_0_12px_2px_rgba(110,231,183,0.4)]"
                  : "bg-surface-container-highest"
              }`} />
            ))}
          </div>
        </aside>

        {/* ── RIGHT CONTENT ── */}
        <section className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-background/20 relative overflow-hidden">

          {/* Step content */}
          <div>
            <header className="mb-10">
              <span className="font-label text-xs uppercase tracking-[0.2em] text-primary-container font-bold mb-2 block">
                Step {step + 1} of 3
              </span>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                {STEPS[step].label}
              </h2>
            </header>

            {/* Option cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STEPS[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className={`group flex flex-col items-start p-6 rounded-xl border transition-all duration-300 text-left ${
                    selected[step] === i
                      ? "bg-surface-container-high border-primary-container/60 shadow-[0_0_20px_rgba(110,231,183,0.12)]"
                      : "bg-surface-container-low border-outline-variant/10 hover:border-primary-container/40 hover:bg-surface-container-high"
                  }`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform ${
                    selected[step] === i ? "bg-primary-container/20 scale-110" : "bg-surface-container-highest group-hover:scale-110"
                  }`}>
                    <span className="material-symbols-outlined text-primary-container">{opt.icon}</span>
                  </div>
                  <h3 className={`font-headline font-bold text-lg mb-1 transition-colors ${
                    selected[step] === i ? "text-primary-container" : "group-hover:text-primary-container text-on-surface"
                  }`}>{opt.title}</h3>
                  <p className="text-on-surface-variant text-sm font-medium">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <footer className="mt-12 flex items-center justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className={`flex items-center gap-2 font-label font-bold text-sm tracking-wider uppercase transition-colors ${
                step === 0
                  ? "text-on-surface-variant/30 cursor-not-allowed"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}>
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>

            <button
              onClick={next}
              disabled={saving}
              className="group flex items-center gap-3 bg-primary-container hover:bg-primary px-8 py-4 rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-primary-container/20 disabled:opacity-70">
              <span className="font-headline font-bold text-on-primary-container uppercase tracking-widest text-sm">
                {saving ? "Saving…" : step === 2 ? "Start Learning" : "Next"}
              </span>
              {!saving && (
                <span className="material-symbols-outlined text-on-primary-container group-hover:translate-x-1 transition-transform">
                  {step === 2 ? "rocket_launch" : "arrow_forward"}
                </span>
              )}
            </button>
          </footer>

          {/* Decorative ring */}
          <div className="absolute top-1/2 -right-4 hidden lg:block opacity-10 pointer-events-none">
            <div className="w-64 h-64 border-[32px] border-primary-container rounded-full rotate-45" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 w-full flex justify-center pointer-events-none">
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.3em] font-label text-on-surface-variant/40">
          <span>© 2025 Kelvra</span>
          <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
          <span>Intelligence v1.0</span>
        </div>
      </footer>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
