// src/components/TodayPlan.jsx
// Dashboard card: today's 3-4 tasks (built from real data, no AI) and the evening check-in.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildTodayPlan, MOODS } from "../utils/todayPlan";
import { getLearningSnapshot, getDay, saveDay } from "../utils/learning";
import { getMeta } from "../utils/firebase";
import { ifThenSentence, experimentProgress } from "../utils/habits";
import { weekStart } from "../utils/mentor";
import { topicAverages, daysUntil } from "../utils/mentor";
import { detectCrisis } from "../utils/safety";
import CrisisCard from "./CrisisCard";

const filled = { fontVariationSettings: "'FILL' 1" };

function CheckIn({ day, onSave }) {
  const saved = day?.checkin;
  const [editing, setEditing] = useState(!saved);
  const [mood, setMood] = useState(saved?.mood || null);
  const [minutes, setMinutes] = useState(saved?.minutes ?? "");
  const [note, setNote] = useState(saved?.note || "");
  const [crisis, setCrisis] = useState(false);

  if (crisis) return <CrisisCard onClose={() => setCrisis(false)} />;

  if (saved && !editing) {
    const m = MOODS.find((x) => x.id === saved.mood);
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-2xl" aria-hidden="true">{m?.emoji}</span>
        <p className="flex-1 text-on-surface-variant">
          Checked in: <strong className="text-on-surface">{m?.label}</strong>{saved.minutes ? `, ${saved.minutes} min studied` : ""}{saved.note ? ` · "${saved.note}"` : ""}
        </p>
        <button onClick={() => setEditing(true)} className="text-xs text-primary-container font-bold hover:underline">Edit</button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!mood) return;
      if (detectCrisis(note)) { setNote(""); setCrisis(true); return; } // never store it
      onSave({ mood, minutes: Number(minutes) || 0, note: note.trim() });
      setEditing(false);
    }}
      className="space-y-3">
      <p className="text-sm font-bold text-on-surface">How did today go?</p>
      <div className="flex gap-2" role="radiogroup" aria-label="Mood">
        {MOODS.map((m) => (
          <button type="button" key={m.id} role="radio" aria-checked={mood === m.id} onClick={() => setMood(m.id)}
            className={`flex-1 py-2 rounded-xl border text-center transition-all ${mood === m.id ? "border-primary-container bg-primary-container/10" : "border-outline-variant/15 bg-surface-container hover:border-primary-container/40"}`}>
            <span className="text-xl block" aria-hidden="true">{m.emoji}</span>
            <span className="text-[10px] text-on-surface-variant">{m.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="number" min="0" max="900" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes" aria-label="Minutes studied today"
          className="w-24 bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container/50" />
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140}
          placeholder="One line: what went well or got in the way?" aria-label="Note"
          className="flex-1 min-w-0 bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50" />
      </div>
      <button type="submit" disabled={!mood}
        className="px-5 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm disabled:opacity-40">
        Save check-in
      </button>
      <p className="text-[11px] text-on-surface-variant/70">Your mentor reads your last few check-ins to give better advice.</p>
    </form>
  );
}

export default function TodayPlan({ user, sessions = [], scores = [] }) {
  const navigate = useNavigate();
  const [input, setInput] = useState(null); // data for the plan; sleep comes from today's tap
  const [day, setDay] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getLearningSnapshot(user.id), getMeta(user.id, "exam_goal"), getDay(user.id), getMeta(user.id, "habit")]).then(([snap, exam, today, habit]) => {
      if (!alive) return;
      const weak = topicAverages(scores)[0];
      const todayStr = new Date().toDateString();
      setInput(({
        dueCards: snap.dueCards,
        openMistakes: snap.openMistakes,
        plotTwistsDue: snap.plotTwistsDue,
        mistakeTopic: snap.mistakeTopics[0]?.topic,
        weakTopic: weak,
        recentTopic: sessions[0]?.topic,
        exam: exam?.exam_name ? { name: exam.exam_name, daysLeft: daysUntil(exam.exam_date), dailyMinutes: exam.daily_goal_minutes } : null,
        studiedToday: sessions.some((s) => new Date(s.created_at).toDateString() === todayStr),
        habit: habit?.current && habit.current.week_start === weekStart()
          ? { sentence: ifThenSentence(habit.current), doneToday: experimentProgress(habit.current).doneToday }
          : null,
      }));
      setDay(today || {});
    });
    return () => { alive = false; };
  }, [user?.id, sessions, scores]);

  if (!input || !day) {
    return <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl h-64 animate-pulse" />;
  }

  const plan = buildTodayPlan({ ...input, sleep: day.sleep });
  const done = new Set(day.done || []);
  const doneCount = plan.tasks.filter((t) => done.has(t.id)).length;

  const toggle = (id) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id); else next.add(id);
    const update = { done: [...next] };
    setDay((d) => ({ ...d, ...update }));
    saveDay(user.id, update);
  };

  const setSleep = (sleep) => {
    setDay((d) => ({ ...d, sleep }));
    saveDay(user.id, { sleep });
  };

  const saveCheckin = (checkin) => {
    setDay((d) => ({ ...d, checkin }));
    saveDay(user.id, { checkin });
  };

  return (
    <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6" aria-labelledby="today-title">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Today's plan · about {plan.focusMinutes} min</p>
          <h2 id="today-title" className="font-headline text-lg font-bold text-on-surface mt-1">{plan.headline}</h2>
        </div>
        <span className="text-sm font-bold text-primary-container flex-shrink-0">{doneCount}/{plan.tasks.length}</span>
      </div>
      <div className="h-1.5 bg-surface-container-highest rounded-full my-4 overflow-hidden">
        <div className="h-full bg-primary-container transition-all" style={{ width: `${(doneCount / plan.tasks.length) * 100}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        <span className="text-on-surface-variant">Last night's sleep:</span>
        {[["good", "😴 Good"], ["ok", "🙂 OK"], ["poor", "🥱 Poor"]].map(([id, label]) => (
          <button key={id} onClick={() => setSleep(id)} aria-pressed={day.sleep === id}
            className={`px-2.5 py-1 rounded-full border ${day.sleep === id ? "border-primary-container text-primary-container bg-primary-container/10" : "border-outline-variant/20 text-on-surface-variant"}`}>{label}</button>
        ))}
      </div>

      <ul className="space-y-2 mb-5">
        {plan.tasks.map((t) => {
          const isDone = done.has(t.id);
          return (
            <li key={t.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone ? "border-outline-variant/10 opacity-60" : "border-outline-variant/15 bg-surface-container"}`}>
              <button onClick={() => toggle(t.id)} aria-label={isDone ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 ${isDone ? "bg-primary-container border-primary-container" : "border-outline-variant/40 hover:border-primary-container"}`}>
                {isDone && <span className="material-symbols-outlined text-on-primary-container text-sm">check</span>}
              </button>
              <span className="material-symbols-outlined text-primary-container hidden sm:block" style={filled}>{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${isDone ? "line-through text-on-surface-variant" : "text-on-surface"}`}>{t.title}</p>
                <p className="text-xs text-on-surface-variant truncate">{t.detail} · {t.minutes} min</p>
              </div>
              {!isDone && (
                <button onClick={() => navigate(t.path)} className="text-xs font-bold text-primary-container px-3 py-1.5 rounded-lg hover:bg-primary-container/10 flex-shrink-0">Go</button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="pt-4 border-t border-outline-variant/10">
        <CheckIn key={day.checkin ? "saved" : "new"} day={day} onSave={saveCheckin} />
      </div>
    </section>
  );
}
