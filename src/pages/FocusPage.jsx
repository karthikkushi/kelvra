// src/pages/FocusPage.jsx
// Focus timer + distraction tracker. Notices when you leave the tab, asks what pulled you away
// (one tap), and shows a private weekly focus picture. The timer uses an end time, not a counter,
// so it stays correct when the browser slows down background tabs.
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LEAVE_TAGS, PULLS, PRESETS, summarizeFocus } from "../utils/focus";
import { saveFocusSession, getFocusSessions } from "../utils/learning";
import { listRecent } from "../utils/firebase";
import { awardXP } from "../utils/gamification";

const filled = { fontVariationSettings: "'FILL' 1" };
const RATINGS = [
  { v: 1, e: "😵", l: "Scattered" }, { v: 2, e: "😕", l: "Meh" }, { v: 3, e: "🙂", l: "Okay" },
  { v: 4, e: "😀", l: "Focused" }, { v: 5, e: "🔥", l: "Deep focus" },
];

// Soft brown noise made in the browser (no audio files, works offline).
function useNoise() {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const [on, setOn] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const start = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const size = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(ctx.destination);
    src.start();
    ctxRef.current = ctx;
    gainRef.current = gain;
    setOn(true);
  };
  const stop = () => { ctxRef.current?.close(); ctxRef.current = null; setOn(false); };
  const changeVolume = (v) => { setVolume(v); if (gainRef.current) gainRef.current.gain.value = v; };
  useEffect(() => () => ctxRef.current?.close(), []);
  return { on, toggle: () => (on ? stop() : start()), volume, changeVolume };
}

function Reflection({ onSave, minutes }) {
  const [rating, setRating] = useState(null);
  const [pulled, setPulled] = useState([]);
  const toggle = (id) => setPulled((p) => (id === "none" ? ["none"] : p.includes(id) ? p.filter((x) => x !== id) : [...p.filter((x) => x !== "none"), id]));
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 space-y-5" role="dialog" aria-labelledby="reflect-title">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">{minutes} min done · 10-second check</p>
          <h2 id="reflect-title" className="font-headline text-xl font-bold mt-1">How focused were you?</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {RATINGS.map((r) => (
            <button key={r.v} onClick={() => setRating(r.v)} aria-pressed={rating === r.v}
              className={`py-2 rounded-xl border text-center ${rating === r.v ? "border-primary-container bg-primary-container/10" : "border-outline-variant/15 bg-surface-container"}`}>
              <span className="text-xl block" aria-hidden="true">{r.e}</span>
              <span className="text-[9px] text-on-surface-variant">{r.l}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface mb-2">What pulled you away? (tap all that fit)</p>
          <div className="flex flex-wrap gap-2">
            {PULLS.map((p) => (
              <button key={p.id} onClick={() => toggle(p.id)} aria-pressed={pulled.includes(p.id)}
                className={`text-xs px-3 py-1.5 rounded-full border ${pulled.includes(p.id) ? "border-primary-container text-primary-container bg-primary-container/10" : "border-outline-variant/20 text-on-surface-variant"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => onSave(rating, pulled)} disabled={!rating}
          className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold disabled:opacity-40">Save</button>
        <p className="text-[11px] text-on-surface-variant/70 text-center">Only you can see your focus data.</p>
      </div>
    </div>
  );
}

export default function FocusPage({ user }) {
  const navigate = useNavigate();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [phase, setPhase] = useState("study"); // study | rest
  const [running, setRunning] = useState(false);
  const [endAt, setEndAt] = useState(null);
  const [remaining, setRemaining] = useState(PRESETS[0].study * 60);
  const [task, setTask] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [leaves, setLeaves] = useState([]);       // [{ away_sec, tag }]
  const [askTag, setAskTag] = useState(null);     // index of the leave waiting for a tag
  const [reflect, setReflect] = useState(null);   // { minutes, completed }
  const [history, setHistory] = useState([]);
  const leftAt = useRef(null);
  const startedAt = useRef(null);
  const [inSession, setInSession] = useState(false); // a study block has started (for rendering)
  const noise = useNoise();

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getFocusSessions(user.id), listRecent(user.id, "study_sessions", { max: 10 }).catch(() => [])]).then(([f, s]) => {
      if (!alive) return;
      setHistory(f);
      setSuggestions([...new Set(s.map((x) => x.topic).filter((t) => t && t.length < 50))].slice(0, 4));
    });
    return () => { alive = false; };
  }, [user?.id]);

  const total = (phase === "study" ? preset.study : preset.rest) * 60;

  const finishStudy = useCallback((completed) => {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000));
    setRunning(false);
    setEndAt(null);
    setReflect({ minutes, completed });
  }, []);

  // Tick from the end time, so a slowed background tab never drifts
  useEffect(() => {
    if (!running || !endAt) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        if (phase === "study") finishStudy(true);
        else { setRunning(false); setPhase("study"); setRemaining(preset.study * 60); }
      }
    }, 500);
    return () => clearInterval(id);
  }, [running, endAt, phase, preset, finishStudy]);

  // Notice leaving the tab during a study block
  useEffect(() => {
    const onVis = () => {
      if (!running || phase !== "study") return;
      if (document.hidden) {
        leftAt.current = Date.now();
      } else if (leftAt.current) {
        const away = Math.round((Date.now() - leftAt.current) / 1000);
        leftAt.current = null;
        if (away >= 5) {
          setLeaves((l) => { setAskTag(l.length); return [...l, { away_sec: away, tag: null }]; });
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [running, phase]);

  const start = () => {
    if (phase === "study" && !startedAt.current) { startedAt.current = Date.now(); setInSession(true); setLeaves([]); }
    setEndAt(Date.now() + remaining * 1000);
    setRunning(true);
  };
  const pause = () => { setRunning(false); setEndAt(null); };
  const choosePreset = (p) => {
    if (running) return;
    setPreset(p); setPhase("study"); setRemaining(p.study * 60); startedAt.current = null; setInSession(false);
  };

  const tagLeave = (tag) => {
    setLeaves((l) => l.map((x, i) => (i === askTag ? { ...x, tag } : x)));
    setAskTag(null);
  };

  const saveReflection = (rating, pulled) => {
    const leaveTags = {};
    leaves.forEach((l) => { if (l.tag) leaveTags[l.tag] = (leaveTags[l.tag] || 0) + 1; });
    const session = {
      task: task.trim() || null,
      planned_min: preset.study,
      actual_min: reflect.minutes,
      completed: reflect.completed,
      leaves: leaves.length,
      away_sec: leaves.reduce((a, l) => a + l.away_sec, 0),
      leave_tags: leaveTags,
      rating,
      pulled,
    };
    saveFocusSession(user?.id, session);
    if (reflect.completed && user?.id) awardXP(user.id, "STREAK_DAY", {}, user);
    setHistory((h) => [{ ...session, created_at: new Date().toISOString() }, ...h]);
    setReflect(null);
    startedAt.current = null;
    setInSession(false);
    setLeaves([]);
    if (reflect.completed) { setPhase("rest"); setRemaining(preset.rest * 60); }
    else { setPhase("study"); setRemaining(preset.study * 60); }
  };

  const week = summarizeFocus(history);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const ring = 289;
  const progress = ((total - remaining) / total) * ring;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body">
      <header className="flex justify-between items-center px-4 sm:px-10 py-5">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className={`w-2 h-2 rounded-full ${running ? "bg-primary-container animate-pulse" : "bg-outline-variant"}`} />
          {phase === "rest" ? "Break time" : task.trim() ? `Studying: ${task.trim()}` : "Focus"}
        </div>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface text-sm">
          Exit <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 grid lg:grid-cols-3 gap-8 items-start">
        <section className="lg:col-span-2 flex flex-col items-center gap-6">
          {!running && phase === "study" && !inSession && (
            <div className="w-full max-w-md space-y-3">
              <input value={task} onChange={(e) => setTask(e.target.value)} maxLength={60}
                placeholder="What will you work on? (one small task)" aria-label="What will you work on?"
                className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50" />
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {["Review due flashcards", ...suggestions].map((s) => (
                    <button key={s} onClick={() => setTask(s)} className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-container">{s}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative w-64 h-64 sm:w-72 sm:h-72">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-container-highest" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                className={phase === "study" ? "text-primary-container" : "text-secondary"}
                strokeDasharray={ring} strokeDashoffset={ring - progress} style={{ transition: "stroke-dashoffset 0.5s linear" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline text-6xl font-extrabold tabular-nums" aria-live="off">{mm}:{ss}</span>
              <span className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">{phase === "study" ? "Focus" : "Break"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {running ? (
              <button onClick={pause} className="px-8 py-3.5 rounded-2xl bg-surface-container-high font-bold">Pause</button>
            ) : (
              <button onClick={start} className="px-8 py-3.5 rounded-2xl bg-primary-container text-on-primary-container font-bold flex items-center gap-2">
                <span className="material-symbols-outlined" style={filled}>play_arrow</span>{inSession || phase === "rest" ? "Resume" : "Start"}
              </button>
            )}
            {phase === "study" && inSession && (
              <button onClick={() => finishStudy(false)} className="px-5 py-3.5 rounded-2xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant">End early</button>
            )}
            {phase === "rest" && (
              <button onClick={() => { setRunning(false); setPhase("study"); setRemaining(preset.study * 60); }} className="px-5 py-3.5 rounded-2xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant">Skip break</button>
            )}
          </div>

          <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl" role="group" aria-label="Timer length">
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => choosePreset(p)} disabled={running}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold ${preset.id === p.id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"} disabled:opacity-60`}>{p.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-on-surface-variant">
            <button onClick={noise.toggle} aria-pressed={noise.on}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1 ${noise.on ? "border-primary-container text-primary-container" : "border-outline-variant/20"}`}>
              <span className="material-symbols-outlined text-sm">graphic_eq</span> Soft noise {noise.on ? "on" : "off"}
            </button>
            {noise.on && <input type="range" min="0" max="1" step="0.05" value={noise.volume} onChange={(e) => noise.changeVolume(Number(e.target.value))} aria-label="Noise volume" />}
          </div>

          {askTag != null && (
            <div className="w-full max-w-md bg-surface-container-low border border-secondary/30 rounded-2xl p-4" role="status">
              <p className="text-sm text-on-surface mb-2">
                You left for {Math.round(leaves[askTag].away_sec / 60) || "<1"} min. What was it? <span className="text-on-surface-variant">(no judgement)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {LEAVE_TAGS.map((t) => <button key={t.id} onClick={() => tagLeave(t.id)} className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-secondary">{t.label}</button>)}
              </div>
            </div>
          )}
          {running && phase === "study" && leaves.length > 0 && askTag == null && (
            <p className="text-xs text-on-surface-variant">Left the tab {leaves.length}× this session</p>
          )}
        </section>

        <aside className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Your focus this week</p>
            <span className="text-[10px] text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-xs">lock</span>Private</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["Sessions", week.count], ["Minutes", week.minutes], ["Avg focus", week.avgRating ?? "—"]].map(([l, v]) => (
              <div key={l} className="bg-surface-container rounded-xl p-3">
                <p className="font-headline text-xl font-bold">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{l}</p>
              </div>
            ))}
          </div>
          {week.topDistraction && (
            <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Top distraction:</strong> {week.topDistraction.label}</p>
          )}
          {week.leavesPer25 != null && (
            <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Tab leaves:</strong> about {week.leavesPer25} per 25 min</p>
          )}
          {week.tip && <p className="text-sm text-on-surface bg-primary-container/10 border border-primary-container/20 rounded-xl p-3">{week.tip}</p>}
        </aside>
      </main>

      {reflect && <Reflection minutes={reflect.minutes} onSave={saveReflection} />}
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
