// src/pages/ResetPage.jsx
// Stress reset, based on the "stress can fuel you + abilities can grow" approach that lowered
// stress responses in 6 randomised trials with 4,000+ teens (Yeager et al., 2022). Short and optional.
// Quick mode (/reset?quick=1) is a 2-minute version before a test.
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CrisisCard from "../components/CrisisCard";
import { detectCrisis } from "../utils/safety";
import { setMeta } from "../utils/firebase";

const filled = { fontVariationSettings: "'FILL' 1" };

const PHASES = [
  { label: "Breathe in", secs: 4 },
  { label: "Hold", secs: 4 },
  { label: "Breathe out", secs: 4 },
  { label: "Hold", secs: 4 },
];

function Breathing({ rounds = 4, onDone }) {
  // One counter of elapsed seconds; every phase is 4 seconds.
  const [t, setT] = useState(0);
  const doneRef = useRef(false);
  const total = rounds * PHASES.length;
  const i = Math.floor(t / 4);
  const left = 4 - (t % 4);
  useEffect(() => {
    if (i >= total) return;
    const id = setInterval(() => setT((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [i, total]);
  useEffect(() => { if (i >= total && !doneRef.current) { doneRef.current = true; onDone(); } }, [i, total, onDone]);
  const phase = PHASES[i % PHASES.length];
  const grow = phase.label === "Breathe in" ? "scale-125" : phase.label === "Breathe out" ? "scale-75" : "";
  return (
    <div className="flex flex-col items-center gap-6 py-6" aria-live="polite">
      <div className={`w-40 h-40 rounded-full bg-primary-container/20 border-2 border-primary-container/50 flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${grow}`}>
        <span className="font-headline text-4xl font-bold text-primary-container">{i < total ? left : "✓"}</span>
      </div>
      <p className="font-headline text-xl font-bold">{i < total ? phase.label : "Well done"}</p>
      <p className="text-xs text-on-surface-variant">Round {Math.min(rounds, Math.floor(i / PHASES.length) + 1)} of {rounds}</p>
    </div>
  );
}

const CARDS = [
  {
    icon: "favorite",
    title: "That racing heart is your body getting ready",
    body: [
      "Before a test your heart beats faster and your breathing speeds up. That is not a sign you will fail.",
      "It is your body sending more oxygen and energy to your brain, the same response athletes and performers feel before they do their best.",
      "So when you feel it, try saying: \"My body is getting ready to help me.\"",
    ],
  },
  {
    icon: "trending_up",
    title: "Your brain grows when things are hard",
    body: [
      "Struggling with a question means your brain is building new connections. Easy work does not do that.",
      "Mistakes are not proof you are \"not a maths person\". They show you exactly what to practise next.",
      "Ability is not fixed. It grows with the right practice, and you can see that in your own Kelvra progress.",
    ],
  },
];

export default function ResetPage({ user }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const quick = params.get("quick") === "1";
  const [step, setStep] = useState(0); // full: 0,1 cards · 2 breathing · 3 note · 4 done | quick: 0 reminder · 2 breathing · 4 done
  const [note, setNote] = useState("");
  const [worry, setWorry] = useState("");
  const [showWorry, setShowWorry] = useState(false);
  const [crisis, setCrisis] = useState(false);

  const finish = () => {
    if (user?.id) setMeta(user.id, "reset", { last_done: new Date().toISOString(), ...(note.trim() ? { note: note.trim() } : {}) });
    setStep(4);
  };

  const saveNote = () => {
    if (detectCrisis(note)) { setNote(""); setCrisis(true); return; }
    finish();
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="reset" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 pt-6 lg:pt-10">
        <div className="max-w-xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Stress reset · {quick ? "2 minutes" : "5 minutes"}</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Turn exam nerves into fuel</h1>
          </header>

          {crisis && <div className="mb-5"><CrisisCard onClose={() => setCrisis(false)} /></div>}

          {quick && step === 0 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-3">
              <p className="text-on-surface"><strong>Quick reminder:</strong> nerves before a test mean your body is getting ready to help you. Your racing heart is sending energy to your brain.</p>
              <p className="text-on-surface-variant text-sm">You have practised for this. One question at a time.</p>
              <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">1 minute of calm breathing</button>
            </section>
          )}

          {!quick && step <= 1 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-4">
              <span className="material-symbols-outlined text-3xl text-primary-container" style={filled}>{CARDS[step].icon}</span>
              <h2 className="font-headline text-xl font-bold">{CARDS[step].title}</h2>
              {CARDS[step].body.map((p) => <p key={p} className="text-sm text-on-surface-variant leading-relaxed">{p}</p>)}
              <button onClick={() => setStep(step + 1)} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">{step === 0 ? "Next" : "Try 1 minute of breathing"}</button>
            </section>
          )}

          {step === 2 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
              <Breathing rounds={4} onDone={() => setStep(quick ? 4 : 3)} />
              <button onClick={() => (quick ? finish() : setStep(3))} className="block mx-auto text-xs text-on-surface-variant underline">Skip</button>
            </section>
          )}

          {!quick && step === 3 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-4">
              <h2 className="font-headline text-xl font-bold">Last step: help a junior</h2>
              <p className="text-sm text-on-surface-variant">A younger student is nervous about their first big exam. In 2-3 lines, what would you tell them about stress and mistakes? (Explaining it to someone else helps you believe it too.)</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={400} aria-label="Your note to a junior"
                placeholder="e.g. Feeling nervous is normal, it means you care..."
                className="w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 resize-none" />
              <div className="flex gap-2">
                <button onClick={saveNote} className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">Finish</button>
                <button onClick={() => { setNote(""); finish(); }} className="px-4 py-3 rounded-xl text-sm text-on-surface-variant">Skip</button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6 space-y-3 text-center">
              <span className="material-symbols-outlined text-4xl text-primary-container" style={filled}>self_care</span>
              <h2 className="font-headline text-xl font-bold">You're ready to start</h2>
              <p className="text-sm text-on-surface-variant">Next time you feel nervous, remember: "My body is getting ready to help me."</p>
              <div className="flex gap-2 justify-center pt-2">
                <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Back to today's plan</button>
                <button onClick={() => navigate("/focus")} className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">Start focusing</button>
              </div>
            </section>
          )}

          {/* Optional worry dump: mixed evidence, so it's opt-in and never saved */}
          <div className="mt-8 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
            <button onClick={() => setShowWorry(!showWorry)} className="text-sm font-bold text-on-surface flex items-center gap-2" aria-expanded={showWorry}>
              <span className="material-symbols-outlined text-lg">edit_note</span> Very anxious before a big exam? Try a 10-minute worry dump
            </button>
            {showWorry && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-on-surface-variant">Write every worry about the exam, honestly. Getting them on paper can free up your mind. This helps some students more than others. <strong className="text-on-surface">It is never saved or sent anywhere.</strong></p>
                <textarea value={worry} onChange={(e) => { setWorry(e.target.value); if (detectCrisis(e.target.value)) setCrisis(true); }} rows={6} aria-label="Worry dump (not saved)"
                  className="w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary-container/50 resize-y" />
                <button onClick={() => setWorry("")} className="text-xs font-bold text-primary-container">Done, clear it</button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-on-surface-variant/70 mt-4">If stress feels too heavy or doesn't go away, talk to someone you trust or call Tele-MANAS 14416 (free, 24x7).</p>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
