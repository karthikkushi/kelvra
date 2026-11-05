// src/pages/HabitsPage.jsx
// Habit & behaviour coach: patterns from real study data + one if-then experiment per week.
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getActivityEvents, getFocusSessions } from "../utils/learning";
import { getMeta, setMeta } from "../utils/firebase";
import { buildBehaviourReport, suggestExperiments, experimentProgress, ifThenSentence, TIME_BUCKETS } from "../utils/habits";
import { summarizeFocus } from "../utils/focus";
import { localDateKey } from "../utils/hash";
import { weekStart } from "../utils/mentor";

const filled = { fontVariationSettings: "'FILL' 1" };
const inputCls = "w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50";

function ExperimentForm({ initial, onSave, onCancel }) {
  const [cue, setCue] = useState(initial?.cue || "");
  const [action, setAction] = useState(initial?.action || "");
  const [obstacle, setObstacle] = useState(initial?.obstacle || "");
  const [planB, setPlanB] = useState(initial?.plan_b || "");
  const ok = cue.trim().length > 2 && action.trim().length > 2;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (ok) onSave({ cue: cue.trim(), action: action.trim(), obstacle: obstacle.trim(), plan_b: planB.trim() }); }} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <label className="text-xs text-on-surface-variant">When…
          <input value={cue} onChange={(e) => setCue(e.target.value)} maxLength={80} placeholder="I finish dinner" className={`${inputCls} mt-1`} />
        </label>
        <label className="text-xs text-on-surface-variant">I will…
          <input value={action} onChange={(e) => setAction(e.target.value)} maxLength={100} placeholder="review 10 flashcards" className={`${inputCls} mt-1`} />
        </label>
      </div>
      <p className="text-xs text-on-surface-variant">Optional, but it doubles your chances: what could get in the way, and what will you do then?</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <input value={obstacle} onChange={(e) => setObstacle(e.target.value)} maxLength={80} placeholder="If… (e.g. a friend calls)" aria-label="Obstacle" className={inputCls} />
        <input value={planB} onChange={(e) => setPlanB(e.target.value)} maxLength={100} placeholder="then I will… (e.g. call back after 10 cards)" aria-label="Plan B" className={inputCls} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={!ok} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm disabled:opacity-40">Start this week's experiment</button>
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm text-on-surface-variant">Cancel</button>}
      </div>
    </form>
  );
}

export default function HabitsPage({ user }) {
  const [report, setReport] = useState(null);
  const [focus, setFocus] = useState(null);
  const [habit, setHabit] = useState(null); // { current, history }
  const [editing, setEditing] = useState(null); // null | {} | suggestion

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getActivityEvents(user.id), getFocusSessions(user.id), getMeta(user.id, "habit")]).then(([events, f, h]) => {
      if (!alive) return;
      setReport(buildBehaviourReport(events));
      setFocus(summarizeFocus(f));
      // A new week starts a new experiment; last week's moves to history
      const thisWeek = weekStart();
      if (h?.current && h.current.week_start !== thisWeek) {
        const done = (h.current.days_done || []).length;
        h = { current: null, history: [{ ...h.current, done_count: done }, ...(h.history || [])].slice(0, 12) };
        setMeta(user.id, "habit", h);
      }
      setHabit(h || { current: null, history: [] });
    });
    return () => { alive = false; };
  }, [user?.id]);

  const save = (next) => { setHabit(next); setMeta(user.id, "habit", next); };

  const startExperiment = (fields) => {
    save({ ...habit, current: { ...fields, week_start: weekStart(), days_done: [], started_at: new Date().toISOString() } });
    setEditing(null);
  };

  const toggleToday = () => {
    const today = localDateKey();
    const done = new Set(habit.current.days_done || []);
    if (done.has(today)) done.delete(today); else done.add(today);
    save({ ...habit, current: { ...habit.current, days_done: [...done] } });
  };

  if (!report || !habit) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <Sidebar active="habits" />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const ideas = suggestExperiments(report, { topDistraction: focus?.topDistraction?.id });
  const progress = experimentProgress(habit.current);
  const maxBucket = Math.max(1, ...Object.values(report.buckets));

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="habits" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Habit coach</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Small habits, big exam results</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              What your study pattern really looks like, and one small if-then experiment each week. Missing a day is fine: habits are built over weeks, not days.
            </p>
          </header>

          <div className="grid lg:grid-cols-5 gap-6">
            <section className="lg:col-span-3 space-y-4">
              {/* This week's experiment */}
              <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-3">This week's experiment</p>
                {habit.current && !editing ? (
                  <>
                    <p className="font-headline text-lg font-bold text-on-surface">{ifThenSentence(habit.current)}</p>
                    {habit.current.obstacle && habit.current.plan_b && (
                      <p className="text-sm text-on-surface-variant mt-1">If {habit.current.obstacle}, then I will {habit.current.plan_b}.</p>
                    )}
                    <div className="flex items-center gap-4 mt-5">
                      <button onClick={toggleToday}
                        className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 ${progress.doneToday ? "bg-primary-container text-on-primary-container" : "border border-primary-container/40 text-primary-container"}`}>
                        <span className="material-symbols-outlined text-lg" style={progress.doneToday ? filled : {}}>{progress.doneToday ? "check_circle" : "radio_button_unchecked"}</span>
                        {progress.doneToday ? "Done today" : "I did it today"}
                      </button>
                      <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">{progress.doneThisWeek}</strong> of {progress.daysSoFar} days this week</p>
                    </div>
                    <button onClick={() => setEditing(habit.current)} className="mt-4 text-xs text-on-surface-variant hover:text-on-surface underline">Change the plan</button>
                  </>
                ) : editing ? (
                  <ExperimentForm initial={editing} onSave={startExperiment} onCancel={() => setEditing(null)} />
                ) : (
                  <>
                    <p className="text-sm text-on-surface-variant mb-3">Pick one plan that fits your week, or write your own. One is enough.</p>
                    <div className="space-y-2">
                      {ideas.map((i) => (
                        <button key={i.id} onClick={() => setEditing(i)}
                          className="w-full text-left p-4 rounded-xl bg-surface-container border border-outline-variant/15 hover:border-primary-container/40">
                          <p className="text-sm font-bold text-on-surface">{ifThenSentence(i)}</p>
                          <p className="text-xs text-on-surface-variant mt-1">{i.why}</p>
                        </button>
                      ))}
                      <button onClick={() => setEditing({})} className="text-sm font-bold text-primary-container hover:underline">Write my own</button>
                    </div>
                  </>
                )}
              </div>

              {/* Patterns */}
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">What your data shows</p>
                {report.patterns.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Study for a few days and your patterns will show here.</p>
                ) : (
                  <ul className="space-y-3">
                    {report.patterns.map((p) => (
                      <li key={p.id} className="flex gap-3">
                        <span className={`material-symbols-outlined ${p.tone === "good" ? "text-primary-container" : "text-tertiary-fixed-dim"}`} style={filled}>
                          {p.tone === "good" ? "thumb_up" : "lightbulb"}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{p.title}</p>
                          <p className="text-sm text-on-surface-variant">{p.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <aside className="lg:col-span-2 space-y-4">
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Last 7 days · {report.activeDays} of 7</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {report.week.map((d) => (
                    <div key={d.date} className="text-center">
                      <div className={`aspect-square rounded-lg ${d.active ? "bg-primary-container" : "bg-surface-container-highest"}`} title={d.date} />
                      <p className="text-[9px] text-on-surface-variant mt-1">{d.day}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">When you study (4 weeks)</p>
                <ul className="space-y-2">
                  {TIME_BUCKETS.map((b) => (
                    <li key={b.id}>
                      <div className="flex justify-between text-xs text-on-surface-variant mb-1"><span>{b.label}</span><span>{report.buckets[b.id]}</span></div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full ${b.id === "night" ? "bg-tertiary-fixed-dim" : "bg-primary-container"}`} style={{ width: `${(report.buckets[b.id] / maxBucket) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {focus && focus.count > 0 && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 text-sm text-on-surface-variant space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Focus this week</p>
                  <p>{focus.count} session{focus.count === 1 ? "" : "s"} · {focus.minutes} min · average focus {focus.avgRating ?? "—"}/5</p>
                  {focus.topDistraction && <p>Most common pull: <strong className="text-on-surface">{focus.topDistraction.label}</strong></p>}
                </div>
              )}

              {habit.history?.length > 0 && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Past experiments</p>
                  <ul className="space-y-2">
                    {habit.history.slice(0, 6).map((h) => (
                      <li key={h.week_start} className="text-xs text-on-surface-variant">
                        <p className="text-on-surface">{ifThenSentence(h)}</p>
                        <p>Week of {h.week_start} · done {h.done_count} of 7 days</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[11px] text-on-surface-variant/70 px-1">Your habit data is private to you. Kelvra uses it only to coach you.</p>
            </aside>
          </div>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
