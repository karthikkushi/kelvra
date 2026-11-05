// src/pages/GridPage.jsx
// Daily Grid: "Wordle for your syllabus". One shared 5-question puzzle per track per day, playable
// from a WhatsApp link without an account. Answer first, then see how other players answered.
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { GRID_BANK } from "../data/gridBank";
import {
  TRACKS, trackById, puzzleNumber, puzzleKey, puzzleFor, shareText, emojiRow,
  optionShares, commonTrap, daysPlayedLast7, msUntilNextPuzzle,
} from "../utils/grid";
import { LEVELS } from "../utils/confidence";
import { whatsappLink } from "../utils/family";

const filled = { fontVariationSettings: "'FILL' 1" };
const STORE = "kelvra_grid_v1";

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORE)) || { results: {}, played: {}, track: null }; }
  catch { return { results: {}, played: {}, track: null }; }
}
function writeStore(next) {
  try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* storage blocked: results just won't be remembered */ }
}

function fmtCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function CrowdBars({ q, stat, picked }) {
  const shares = optionShares(stat);
  const total = Number(stat?.total) || 0;
  const trap = commonTrap(stat, q.answer);
  if (!total) return <p className="text-xs text-on-surface-variant">You're one of the first players today. Come back tomorrow to see how others answered.</p>;
  return (
    <div className="space-y-1.5" aria-label="How other players answered">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">How {total} other player{total === 1 ? "" : "s"} answered</p>
      {["A", "B", "C", "D"].map((id) => (
        <div key={id} className="flex items-center gap-2 text-xs">
          <span className={`w-5 font-bold ${id === q.answer ? "text-primary-container" : "text-on-surface-variant"}`}>{id}</span>
          <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div className={`h-full ${id === q.answer ? "bg-primary-container" : id === picked ? "bg-error/70" : "bg-outline-variant/60"}`} style={{ width: `${shares[id]}%` }} />
          </div>
          <span className="w-9 text-right tabular-nums text-on-surface-variant">{shares[id]}%</span>
        </div>
      ))}
      {trap && <p className="text-xs text-on-surface-variant pt-1"><strong className="text-on-surface">Most common wrong answer: {trap}.</strong></p>}
    </div>
  );
}

export default function GridPage({ user }) {
  const [params, setParams] = useSearchParams();
  const store = useMemo(readStore, []);
  const [track, setTrack] = useState(() => (trackById(params.get("track")) ? params.get("track") : store.track || "neet"));
  const n = puzzleNumber();
  const key = puzzleKey(track, n);
  const puzzle = puzzleFor(GRID_BANK, track, n);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [results, setResults] = useState(() => store.results[key] || null); // finished results for today
  const [answers, setAnswers] = useState([]);   // in-progress
  const [stats, setStats] = useState([]);
  const [copied, setCopied] = useState(false);
  const [played, setPlayed] = useState(store.played || {});
  const [, tick] = useState(0);

  // Track change: load today's state for that track
  useEffect(() => {
    const s = readStore();
    setResults(s.results[key] || null);
    setAnswers([]); setI(0); setPicked(null);
    writeStore({ ...s, track });
    if (params.get("track") !== track) setParams({ track }, { replace: true });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Crowd counts for today's puzzle (and, for signed-in players, a result saved on another device)
  useEffect(() => {
    let alive = true;
    import("../utils/gridData").then(async ({ loadStats, myVote }) => {
      const [st, vote] = await Promise.all([loadStats(key), results ? null : myVote(key)]);
      if (!alive) return;
      setStats(st);
      if (vote && !results && puzzle) {
        setResults(vote.answers.map((p, idx) => ({ picked: p, confidence: vote.confidence?.[idx] || null, right: p === puzzle.questions[idx].answer })));
      }
    }).catch(() => {});
    return () => { alive = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const id = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(id); }, []);

  if (!puzzle) return null;
  const q = puzzle.questions[i];
  const current = answers[i];
  const done = Boolean(results);
  const daysPlayed = daysPlayedLast7(played[track] || [], n);
  const url = `${window.location.origin}/grid?track=${track}`;

  const confirm = (confidence) => {
    // Start the (anonymous) session early, so the vote can be queued instantly at the end
    // and survives the player closing the page right after the last question.
    if (i === 0) import("../utils/firebase").then((m) => m.ensurePlayer()).catch(() => {});
    const r = { picked, confidence, right: picked === q.answer };
    const next = [...answers]; next[i] = r;
    setAnswers(next);
  };

  const finish = async (final) => {
    setResults(final);
    const s = readStore();
    const playedForTrack = [...new Set([...(s.played?.[track] || []), n])].slice(-30);
    const nextStore = { ...s, results: { ...s.results, [key]: final }, played: { ...s.played, [track]: playedForTrack }, track };
    writeStore(nextStore);
    setPlayed(nextStore.played);
    const { submitGrid } = await import("../utils/gridData");
    submitGrid(key, final); // in the background
    // Signed-in students: wrong answers go to their Mistake notebook
    if (user?.id) {
      const { saveMistake } = await import("../utils/learning");
      final.forEach((r, idx) => {
        const qq = puzzle.questions[idx];
        if (!r.right) saveMistake(user.id, {
          question: qq.q, options: Object.entries(qq.options).map(([id, text]) => ({ id, text })),
          correct: qq.answer, chosen: r.picked, explanation: qq.why, topic: qq.subject, confidence: r.confidence,
        });
      });
    }
  };

  const nextQuestion = () => {
    if (i + 1 < puzzle.questions.length) { setI(i + 1); setPicked(null); }
    else finish(answers);
  };

  const share = shareText(track, n, results || [], url);
  const copy = async () => {
    try { await navigator.clipboard.writeText(share); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  };

  const body = (
    <div className="max-w-xl mx-auto w-full space-y-5">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Daily Grid · #{n}</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">5 questions. Same for everyone today.</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Exam">
          {TRACKS.map((t) => (
            <button key={t.id} onClick={() => setTrack(t.id)} aria-pressed={track === t.id}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold ${track === t.id ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-outline-variant/20 text-on-surface-variant"}`}>
              {t.short}{(readStore().results[puzzleKey(t.id, n)]) ? " ✓" : ""}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-on-surface-variant">
          Kelvra practice, not an official paper.{!puzzle.reviewed && " Questions written with AI help; teacher check pending."}
        </p>
      </header>

      {!done && (
        <section className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Question {i + 1} of 5 · {q.subject}</span>
            <span aria-label="Progress">{emojiRow(answers.filter(Boolean)) || "·"}</span>
          </div>
          <p className="font-headline text-lg sm:text-xl font-bold leading-snug">{q.q}</p>
          <div className="grid gap-2">
            {Object.entries(q.options).map(([id, text]) => {
              const state = !current ? (picked === id ? "picked" : "idle") : id === q.answer ? "right" : id === current.picked ? "wrong" : "idle";
              return (
                <button key={id} onClick={() => !current && setPicked(id)} disabled={!!current} aria-pressed={picked === id}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                    state === "right" ? "bg-primary-container/15 border-primary-container/60"
                    : state === "wrong" ? "bg-error-container/15 border-error/40"
                    : state === "picked" ? "bg-secondary-container/20 border-secondary/60"
                    : "bg-surface-container border-outline-variant/15 hover:border-primary-container/40 text-on-surface-variant"}`}>
                  <span className="font-bold mr-2">{id}</span>{text}
                </button>
              );
            })}
          </div>
          {picked && !current && (
            <div role="group" aria-label="How sure are you?">
              <p className="text-sm font-bold mb-2">How sure are you?</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => confirm(l.id)}
                    className="py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-secondary/60 text-sm font-bold flex flex-col items-center">
                    <span className="material-symbols-outlined text-secondary text-lg">{l.icon}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {current && (
            <div className="space-y-3" role="status">
              <p className={`font-headline font-bold ${current.right ? "text-primary-container" : current.confidence === "sure" ? "text-secondary" : "text-on-surface"}`}>
                {current.right ? "Right!" : current.confidence === "sure" ? `Plot twist! It's ${q.answer}.` : `It's ${q.answer}.`}
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">{q.why}</p>
              {q.trap && <p className="text-xs text-on-surface-variant"><strong className="text-on-surface">Watch out:</strong> {q.trap}</p>}
              <CrowdBars q={q} stat={stats[i]} picked={current.picked} />
              <button onClick={nextQuestion} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">
                {i + 1 < 5 ? "Next question" : "See my grid"}
              </button>
            </div>
          )}
        </section>
      )}

      {done && (
        <section className="bg-surface-container-low border border-primary-container/20 rounded-3xl p-5 sm:p-6 space-y-4 text-center" aria-label="Today's result">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{trackById(track).label} · #{n}</p>
          <p className="font-headline text-4xl font-extrabold">{results.filter((r) => r.right).length}/5</p>
          <p className="text-3xl tracking-widest" aria-label="Your grid">{emojiRow(results)}</p>
          <p className="text-xs text-on-surface-variant">🟩 right and sure · 🟨 right but not sure · ⬛ not yet</p>
          <div className="flex gap-2 justify-center">
            <a href={whatsappLink(share)} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] text-[#0b141a] font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={filled}>send</span> Share on WhatsApp
            </a>
            <button onClick={copy} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">{copied ? "Copied!" : "Copy"}</button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-surface-container rounded-xl p-3"><p className="font-headline text-xl font-bold">{daysPlayed} of 7</p><p className="text-[10px] uppercase tracking-wider text-on-surface-variant">days played</p></div>
            <div className="bg-surface-container rounded-xl p-3"><p className="font-headline text-xl font-bold">{fmtCountdown(msUntilNextPuzzle())}</p><p className="text-[10px] uppercase tracking-wider text-on-surface-variant">until the next grid</p></div>
          </div>
          {user?.id ? (
            results.some((r) => !r.right)
              ? <p className="text-sm text-on-surface-variant">Wrong answers were added to your <Link to="/mistakes" className="text-primary-container underline">Mistake notebook</Link>.</p>
              : <p className="text-sm text-on-surface-variant">Clean sweep. See you tomorrow.</p>
          ) : (
            <div className="bg-surface-container rounded-2xl p-4 text-left space-y-2">
              <p className="text-sm font-bold">Want your mistakes saved and a study plan from your own notes?</p>
              <Link to="/auth" className="inline-block px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Sign up free</Link>
            </div>
          )}
          <p className="text-xs text-on-surface-variant">That's today's grid. Try another exam's grid above, or come back tomorrow.</p>
        </section>
      )}
    </div>
  );

  return user?.id ? (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="grid" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 pt-6 lg:pt-10">{body}</main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  ) : (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <nav className="max-w-xl mx-auto px-4 pt-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-headline font-bold">
          <span className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-sm" style={filled}>auto_awesome</span>
          </span>
          Kelvra
        </Link>
        <Link to="/auth" className="text-sm font-bold text-primary-container">Sign in</Link>
      </nav>
      <main className="px-4 pt-6 pb-16">{body}</main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
