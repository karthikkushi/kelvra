// src/pages/ReviewPage.jsx
// Spaced-repetition review: only the cards that are due, rated Again / Hard / Good / Easy.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getDeck, rateCard } from "../utils/learning";
import { isDue, nextIntervalLabel } from "../utils/srs";
import { awardXP } from "../utils/gamification";

const filled = { fontVariationSettings: "'FILL' 1" };

const BUTTONS = [
  { id: "again", label: "Again", key: "1", cls: "border-error/30 text-error hover:bg-error-container/15" },
  { id: "hard",  label: "Hard",  key: "2", cls: "border-tertiary-fixed-dim/30 text-tertiary-fixed-dim hover:bg-tertiary-container/15" },
  { id: "good",  label: "Good",  key: "3", cls: "border-secondary/30 text-secondary hover:bg-secondary-container/15" },
  { id: "easy",  label: "Easy",  key: "4", cls: "border-primary-container/30 text-primary-container hover:bg-primary-container/15" },
];

function whenLabel(iso) {
  const ms = new Date(iso) - Date.now();
  if (ms <= 0) return "now";
  const h = Math.round(ms / 3600000);
  if (h < 1) return `in ${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 24) return `in ${h} hour${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `in ${d} day${d === 1 ? "" : "s"}`;
}

export default function ReviewPage({ user }) {
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);       // all cards
  const [queue, setQueue] = useState([]);       // cards in this session
  const [shown, setShown] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [started, setStarted] = useState(false);
  const xpGiven = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    getDeck(user.id).then((cards) => { if (alive) setDeck(cards); });
    return () => { alive = false; };
  }, [user?.id]);

  const due = deck ? deck.filter((c) => isDue(c)) : [];
  const card = queue[0];
  const reviewed = Object.values(stats).reduce((a, b) => a + b, 0);

  const start = (cards) => {
    setQueue(cards);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
    setShown(false);
    setStarted(true);
  };

  const rate = useCallback((rating) => {
    if (!card || !shown) return;
    const next = { ...card, ...rateCard(user?.id, card, rating) };
    setDeck((d) => d.map((c) => (c.id === card.id ? next : c)));
    setStats((s) => ({ ...s, [rating]: s[rating] + 1 }));
    // A forgotten card comes back at the end of this session
    setQueue((q) => (rating === "again" ? [...q.slice(1), next] : q.slice(1)));
    setShown(false);
  }, [card, shown, user]);

  // Session finished: give XP once for a real review session
  useEffect(() => {
    if (started && queue.length === 0 && reviewed >= 5 && user?.id && !xpGiven.current) {
      xpGiven.current = true;
      awardXP(user.id, "STREAK_DAY", {}, user);
    }
  }, [started, queue.length, reviewed, user]);

  // Keyboard: Space shows the answer, 1-4 rate
  useEffect(() => {
    const onKey = (e) => {
      if (!card || e.target.closest("input,textarea")) return;
      if (e.code === "Space") { e.preventDefault(); setShown(true); }
      const b = BUTTONS.find((x) => x.key === e.key);
      if (b) rate(b.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, rate]);

  const topics = deck ? Object.entries(deck.reduce((acc, c) => { acc[c.topic] = (acc[c.topic] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]) : [];
  const learned = deck ? deck.filter((c) => c.reps >= 2).length : 0;
  const nextDue = deck && deck.length ? deck.filter((c) => !isDue(c)).sort((a, b) => new Date(a.due) - new Date(b.due))[0] : null;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="review" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Review deck</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Remember it for the exam, not just tonight</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Cards come back right before you would forget them. Rate honestly: <strong className="text-on-surface">Again</strong> if you forgot, <strong className="text-on-surface">Easy</strong> if it was instant.
            </p>
          </header>

          {!deck ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" /></div>
          ) : deck.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-primary-container" style={filled}>style</span>
              <h2 className="font-headline text-xl font-bold mt-3">Your deck is empty</h2>
              <p className="text-sm text-on-surface-variant mt-1 mb-5">Make a study kit with flashcards and they join this deck automatically.</p>
              <button onClick={() => navigate("/study")} className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Make a study kit</button>
            </div>
          ) : started && card ? (
            <section aria-live="polite">
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-3">
                <span>{queue.length} left · {card.topic}</span>
                <button onClick={() => setStarted(false)} className="hover:text-on-surface">End session</button>
              </div>
              <button type="button" onClick={() => setShown(true)}
                className="w-full text-left bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 sm:p-10 min-h-[260px] flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Question</p>
                <p className="font-headline text-xl sm:text-2xl font-bold text-on-surface leading-snug">{card.question}</p>
                {shown ? (
                  <div className="mt-6 pt-6 border-t border-outline-variant/15">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-2">Answer</p>
                    <p className="text-on-surface-variant leading-relaxed">{card.answer}</p>
                  </div>
                ) : (
                  <p className="mt-8 text-sm text-primary-container font-bold">Think of the answer, then tap to check <span className="hidden sm:inline text-on-surface-variant font-normal">(Space)</span></p>
                )}
              </button>
              {shown && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {BUTTONS.map((b) => (
                    <button key={b.id} onClick={() => rate(b.id)}
                      className={`py-3 rounded-xl border bg-surface-container-low font-bold text-sm transition-all ${b.cls}`}>
                      {b.label}
                      <span className="block text-[10px] font-normal text-on-surface-variant mt-0.5">{nextIntervalLabel(card, b.id)}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : started ? (
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-primary-container" style={filled}>task_alt</span>
              <h2 className="font-headline text-xl font-bold mt-3">Session done: {reviewed} review{reviewed === 1 ? "" : "s"}</h2>
              <div className="grid grid-cols-4 gap-2 my-5">
                {BUTTONS.map((b) => (
                  <div key={b.id} className="bg-surface-container rounded-xl py-3">
                    <p className="font-headline text-xl font-bold">{stats[b.id]}</p>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{b.label}</p>
                  </div>
                ))}
              </div>
              {nextDue && <p className="text-sm text-on-surface-variant mb-5">Next card is due {whenLabel(nextDue.due)}.</p>}
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate("/dashboard")} className="px-5 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Back to today's plan</button>
                {stats.again > 0 && <button onClick={() => navigate("/mentor")} className="px-5 py-3 rounded-xl border border-outline-variant/30 text-sm">Ask mentor for help</button>}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[["Due now", due.length, "text-primary-container"], ["In deck", deck.length, "text-on-surface"], ["Learned", learned, "text-secondary"]].map(([label, val, color]) => (
                  <div key={label} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 text-center">
                    <p className={`font-headline text-2xl font-extrabold ${color}`}>{val}</p>
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{label}</p>
                  </div>
                ))}
              </div>
              {due.length > 0 ? (
                <button onClick={() => start(due.slice(0, 50))}
                  className="w-full py-4 rounded-2xl bg-primary-container text-on-primary-container font-headline font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all">
                  <span className="material-symbols-outlined" style={filled}>play_arrow</span>
                  Review {Math.min(due.length, 50)} due card{due.length === 1 ? "" : "s"}
                </button>
              ) : (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <p className="font-bold">All caught up 🎉</p>
                  {nextDue && <p className="text-sm text-on-surface-variant mt-1">Next card is due {whenLabel(nextDue.due)}.</p>}
                  <button onClick={() => start([...deck].sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 10))}
                    className="mt-4 text-sm font-bold text-primary-container hover:underline">Practise 10 cards early anyway</button>
                </div>
              )}
              {topics.length > 0 && (
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cards by topic</p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map(([t, n]) => (
                      <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/15 text-on-surface-variant">{t} · {n}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
