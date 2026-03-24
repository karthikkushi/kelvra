import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";

const CARDS = [
  {
    topic: "Biological Psychology",
    question: "What is the primary role of the hippocampus in memory formation?",
    answer: "The hippocampus is critical for converting short-term memories into long-term memories (consolidation) and plays a key role in spatial navigation and episodic memory retrieval.",
  },
  {
    topic: "Biological Psychology",
    question: "What neurotransmitter is most associated with reward and motivation?",
    answer: "Dopamine is the primary neurotransmitter associated with the brain's reward system, motivation, and pleasure. It is released during rewarding experiences and drives goal-directed behavior.",
  },
  {
    topic: "Neuroplasticity",
    question: "Define neuroplasticity and give one real-world example.",
    answer: "Neuroplasticity is the brain's ability to reorganize itself by forming new neural connections. Example: London taxi drivers develop a larger hippocampus due to extensive spatial navigation.",
  },
  {
    topic: "Neuroplasticity",
    question: "What is Long-Term Potentiation (LTP)?",
    answer: "LTP is a persistent strengthening of synaptic connections based on recent patterns of activity. It is widely considered one of the major cellular mechanisms underlying learning and memory.",
  },
  {
    topic: "Cognitive Science",
    question: "Explain the difference between implicit and explicit memory.",
    answer: "Explicit (declarative) memory involves conscious recall of facts and events. Implicit memory operates unconsciously and includes skills, habits, and conditioned responses.",
  },
  {
    topic: "Cognitive Science",
    question: "What is the working memory model proposed by Baddeley and Hitch?",
    answer: "The model consists of a central executive that coordinates two subsystems: the phonological loop (verbal information) and the visuospatial sketchpad (visual/spatial information), plus an episodic buffer.",
  },
];

const RATINGS = [
  { id: "hard", icon: "sentiment_very_dissatisfied", label: "Hard",   hover: "hover:bg-error-container/10 hover:border-error-container/40", active: "text-error" },
  { id: "ok",   icon: "sentiment_neutral",           label: "Got it", hover: "hover:bg-tertiary-container/10 hover:border-tertiary-container/40", active: "text-tertiary-fixed-dim" },
  { id: "easy", icon: "sentiment_very_satisfied",    label: "Easy",   hover: "hover:bg-primary-container/10 hover:border-primary-container/40", active: "text-primary-container" },
];

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState({});
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [done, setDone] = useState(false);

  const card = CARDS[index];
  const mastery = Math.round((index / CARDS.length) * 100);

  const rate = (r) => {
    setRatings({ ...ratings, [index]: r });
    if (index < CARDS.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndex(index + 1), 200);
    } else {
      setDone(true);
    }
  };

  const flip = () => setFlipped(!flipped);

  const isWeak = ratings[index] === "hard";

  if (done) {
    const hardCount = Object.values(ratings).filter((r) => r === "hard").length;
    const easyCount = Object.values(ratings).filter((r) => r === "easy").length;
    return (
      <div className="dark min-h-screen bg-background text-on-surface font-body flex items-center justify-center">
        <Sidebar active="flashcards" />
        <div className="md:ml-64 flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/10 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary-container text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold mb-3">Session Complete!</h2>
            <p className="text-on-surface-variant mb-8">You reviewed all {CARDS.length} cards.</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-highest/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-headline font-extrabold text-primary-container">{easyCount}</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Easy</div>
              </div>
              <div className="bg-surface-container-highest/40 rounded-xl p-4 text-center">
                <div className="text-2xl font-headline font-extrabold text-error">{hardCount}</div>
                <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Hard</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/quiz")}
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                Continue to Quiz
              </button>
              <button onClick={() => { setIndex(0); setFlipped(false); setRatings({}); setDone(false); }}
                className="w-full py-4 border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-highest transition-all font-medium">
                Review Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="flashcards" />

      <main className="md:ml-64 min-h-screen bg-surface-container-lowest flex flex-col relative overflow-hidden">

        {/* Progress header */}
        <header className="w-full px-8 pt-8 pb-4 flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant">
                Session: Neuroplasticity 101
              </span>
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Card {index + 1}{" "}
                <span className="text-on-surface-variant font-normal text-lg">of {CARDS.length}</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="font-label text-sm text-primary-container font-bold tracking-tight">
                {mastery}% Mastery
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container shadow-[0_0_12px_rgba(110,231,183,0.3)] transition-all duration-500"
              style={{ width: `${((index + 1) / CARDS.length) * 100}%` }}
            />
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 gap-10 max-w-5xl mx-auto w-full">

          {/* Weak spot alert */}
          {isWeak && (
            <div className="self-start ml-4 md:ml-12 mb-[-1rem]">
              <div className="bg-error-container/20 border border-error-container/30 px-4 py-2 rounded-lg flex items-center gap-3 backdrop-blur-md">
                <span className="material-symbols-outlined text-error text-sm"
                  style={{ fontVariationSettings:"'FILL' 1" }}>warning</span>
                <span className="text-xs font-label uppercase tracking-wider text-error font-semibold">
                  Weak Spot identified
                </span>
              </div>
            </div>
          )}

          {/* Flip card */}
          <div
            className="relative w-full max-w-2xl cursor-pointer"
            style={{ perspective: "1000px", minHeight: 280 }}
            onClick={flip}>
            <div
              className="relative w-full h-full transition-transform duration-700"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: 280,
              }}>

              {/* FRONT */}
              <div
                className="absolute inset-0 w-full bg-surface-container-low border border-outline-variant/15 rounded-3xl p-10 md:p-12 flex flex-col items-center justify-center shadow-2xl"
                style={{ backfaceVisibility: "hidden", minHeight: 280 }}>
                <div className="absolute top-8 left-8">
                  <span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full border border-secondary-container/50">
                    {card.topic}
                  </span>
                </div>
                <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface leading-tight tracking-tighter text-center mt-8">
                  {card.question}
                </h3>
                <div className="absolute bottom-8 right-8 flex items-center gap-2 text-on-surface-variant opacity-40">
                  <span className="text-[10px] font-label uppercase tracking-widest">Tap to reveal</span>
                  <span className="material-symbols-outlined text-sm">touch_app</span>
                </div>
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 w-full bg-surface-container-high border border-primary/10 rounded-3xl p-10 md:p-12 flex flex-col items-center justify-center shadow-2xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", minHeight: 280 }}>
                <div className="absolute top-8 left-8">
                  <span className="px-3 py-1 bg-primary-container/20 text-primary-container text-[10px] font-bold uppercase tracking-widest rounded-full border border-primary-container/30">
                    Answer
                  </span>
                </div>
                <p className="font-body text-lg text-on-surface leading-relaxed text-center mt-8">
                  {card.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          <div className="w-full max-w-md flex flex-col gap-6">
            <p className="text-center text-[10px] font-label uppercase tracking-[0.3em] text-on-surface-variant">
              {flipped ? "Rate your recall" : "Tap card to see answer first"}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {RATINGS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => flipped && rate(r.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 transition-all group ${
                    flipped ? `${r.hover} cursor-pointer` : "opacity-40 cursor-not-allowed"
                  } ${ratings[index] === r.id ? "border-2" : ""}`}>
                  <span className={`material-symbols-outlined ${r.active} group-hover:scale-110 transition-transform`}>
                    {r.icon}
                  </span>
                  <span className={`text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => { if (index > 0) { setIndex(index - 1); setFlipped(false); } }}
              disabled={index === 0}
              className="px-6 py-2.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Prev
            </button>
            <span className="text-on-surface-variant text-sm">{index + 1} / {CARDS.length}</span>
            <button
              onClick={() => { if (index < CARDS.length - 1) { setFlipped(false); setTimeout(() => setIndex(index + 1), 200); } else setDone(true); }}
              className="px-6 py-2.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-all text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              Skip
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* AI Voice Buddy */}
        {voiceOpen && (
          <div className="fixed bottom-8 right-8 z-50">
            <div className="bg-surface-container-highest/40 backdrop-blur-2xl border border-outline-variant/20 rounded-2xl p-4 pr-6 flex items-center gap-4 shadow-2xl max-w-xs group cursor-pointer hover:bg-surface-container-highest/60 transition-all">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container text-2xl"
                    style={{ fontVariationSettings:"'FILL' 1" }}>smart_toy</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-container rounded-full border-2 border-surface-container-lowest flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-on-primary-container rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-on-surface leading-tight">
                  Say the answer out loud, I'm listening…
                </p>
                {/* Waveform */}
                <div className="flex items-end gap-0.5 h-4">
                  {[40, 80, 100, 50, 70, 30, 60, 90, 45, 75].map((h, i) => (
                    <div key={i}
                      className="w-1 bg-primary-container rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setVoiceOpen(false); }}
                className="ml-2 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Decorative gradient */}
        <div className="fixed top-0 right-0 w-1/3 h-screen bg-gradient-to-l from-primary/5 to-transparent pointer-events-none -z-10" />
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-low flex justify-around items-center py-4 border-t border-outline-variant/10 z-40">
        {[
          { icon:"dashboard", path:"/dashboard" },
          { icon:"menu_book", path:"/study" },
          { icon:"style",     path:"/flashcards", active:true },
          { icon:"quiz",      path:"/quiz" },
          { icon:"insights",  path:"/progress" },
        ].map((item) => (
          <span key={item.icon}
            onClick={() => navigate(item.path)}
            className={`material-symbols-outlined cursor-pointer ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}
            style={item.active ? { fontVariationSettings:"'FILL' 1" } : {}}>
            {item.icon}
          </span>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}