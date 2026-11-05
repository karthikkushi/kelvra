// src/pages/MistakesPage.jsx
// Mistake notebook: every wrong quiz answer, grouped by topic, with a retest mode.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getMistakes, markMistake, deleteMistake } from "../utils/learning";
import { awardXP } from "../utils/gamification";

const filled = { fontVariationSettings: "'FILL' 1" };

const optionText = (m, id) => m.options?.find((o) => o.id === id)?.text || id;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Opens the mentor with a question about this mistake (MentorPage sends it on load).
function askMentorAbout(navigate, m) {
  sessionStorage.setItem("kelvra_mentor_prompt",
    `I keep getting this wrong (${m.topic}): "${m.question}". I chose "${optionText(m, m.chosen)}" but the answer is "${optionText(m, m.correct)}". ` +
    "Explain why in a simple way, with a real-life example, and tell me how to remember it.");
  navigate("/mentor");
}

function Retest({ items, user, onDone }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [fixed, setFixed] = useState(0);
  const m = items[i];
  const options = useMemo(() => shuffle(m?.options || []), [m]);

  const pick = (id) => {
    if (picked) return;
    setPicked(id);
    const right = id === m.correct;
    if (right) setFixed((f) => f + 1);
    markMistake(user.id, m.id, right);
  };

  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setPicked(null); }
    else onDone(fixed);
  };

  return (
    <section className="max-w-2xl" aria-live="polite">
      <div className="flex justify-between text-xs text-on-surface-variant mb-3">
        <span>Question {i + 1} of {items.length} · {m.topic}</span>
        <button onClick={() => onDone(fixed)} className="hover:text-on-surface">Stop</button>
      </div>
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 sm:p-8">
        <p className="font-headline text-lg sm:text-xl font-bold mb-5">{m.question}</p>
        <div className="space-y-2">
          {options.map((o) => {
            const state = !picked ? "idle" : o.id === m.correct ? "right" : o.id === picked ? "wrong" : "idle";
            return (
              <button key={o.id} onClick={() => pick(o.id)} disabled={!!picked}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  state === "right" ? "bg-primary-container/15 border-primary-container/50 text-on-surface"
                  : state === "wrong" ? "bg-error-container/15 border-error/40 text-on-surface"
                  : "bg-surface-container border-outline-variant/15 hover:border-primary-container/40 text-on-surface-variant"
                }`}>
                {o.text}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="mt-5 pt-5 border-t border-outline-variant/15">
            <p className={`font-bold text-sm mb-1 ${picked === m.correct ? "text-primary-container" : "text-error"}`}>
              {picked === m.correct ? "Fixed! Moved to mastered." : "Still tricky. It stays in your notebook."}
            </p>
            {m.explanation && <p className="text-sm text-on-surface-variant leading-relaxed">{m.explanation}</p>}
            <button onClick={next} className="mt-4 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">
              {i + 1 < items.length ? "Next" : "Finish"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function MistakesPage({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("open");
  const [topic, setTopic] = useState("all");
  const [retest, setRetest] = useState(null);
  const [result, setResult] = useState(null);

  const load = () => getMistakes(user.id).then(setItems);
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    getMistakes(user.id).then((list) => { if (alive) setItems(list); });
    return () => { alive = false; };
  }, [user?.id]);

  const open = (items || []).filter((m) => !m.mastered);
  const topics = Object.entries(open.reduce((acc, m) => { acc[m.topic] = (acc[m.topic] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);
  const shown = (items || [])
    .filter((m) => (filter === "open" ? !m.mastered : filter === "mastered" ? m.mastered : true))
    .filter((m) => topic === "all" || m.topic === topic);

  const startRetest = () => {
    const pool = open.filter((m) => topic === "all" || m.topic === topic);
    setResult(null);
    setRetest(shuffle(pool).slice(0, 10));
  };

  const finishRetest = (fixed) => {
    setResult({ fixed, total: retest.length });
    setRetest(null);
    if (fixed > 0 && user?.id) awardXP(user.id, "COMPLETE_QUIZ", {}, user);
    // Reload so mastered/open counts include the server's wrong_count updates
    setTimeout(load, 600);
  };

  const remove = (m) => {
    if (!window.confirm("Remove this mistake from your notebook?")) return;
    deleteMistake(user.id, m.id);
    setItems((list) => list.filter((x) => x.id !== m.id));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="mistakes" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-1">Mistake notebook</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Your mistakes are your best study notes</h1>
            <p className="text-sm text-on-surface-variant mt-1">Every wrong quiz answer lands here. Retest them until they move to mastered.</p>
          </header>

          {retest ? (
            <Retest items={retest} user={user} onDone={finishRetest} />
          ) : !items ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-primary-container" style={filled}>verified</span>
              <h2 className="font-headline text-xl font-bold mt-3">No mistakes saved yet</h2>
              <p className="text-sm text-on-surface-variant mt-1 mb-5">Take a quiz made from your notes. Anything you get wrong shows up here to retest.</p>
              <button onClick={() => navigate("/study")} className="px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Make a quiz</button>
            </div>
          ) : (
            <>
              {result && (
                <div role="status" className="mb-5 px-4 py-3 rounded-xl bg-primary-container/10 border border-primary-container/20 text-sm">
                  You fixed <strong>{result.fixed}</strong> of {result.total}. {result.fixed === result.total ? "Clean sweep! 🎉" : "The rest stay here for next time."}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
                  {[["open", `Open (${open.length})`], ["mastered", `Mastered (${items.length - open.length})`], ["all", "All"]].map(([id, label]) => (
                    <button key={id} onClick={() => setFilter(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filter === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {open.length > 0 && (
                  <button onClick={startRetest}
                    className="sm:ml-auto px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg" style={filled}>replay</span>
                    Retest {Math.min(10, open.filter((m) => topic === "all" || m.topic === topic).length)} {topic === "all" ? "mistakes" : `in ${topic}`}
                  </button>
                )}
              </div>

              {topics.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  <button onClick={() => setTopic("all")}
                    className={`text-xs px-3 py-1.5 rounded-full border ${topic === "all" ? "border-primary-container/50 text-primary-container" : "border-outline-variant/20 text-on-surface-variant"}`}>All topics</button>
                  {topics.map(([t, n]) => (
                    <button key={t} onClick={() => setTopic(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${topic === t ? "border-primary-container/50 text-primary-container" : "border-outline-variant/20 text-on-surface-variant"}`}>
                      {t} · {n}
                    </button>
                  ))}
                </div>
              )}

              <ul className="space-y-3">
                {shown.map((m) => (
                  <li key={m.id} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                          {m.topic} · missed {m.wrong_count || 1}×{m.mastered ? " · mastered" : ""}
                        </p>
                        <p className="font-bold text-on-surface">{m.question}</p>
                      </div>
                      <button onClick={() => remove(m)} aria-label="Remove" className="text-on-surface-variant hover:text-error flex-shrink-0">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
                      <p className="px-3 py-2 rounded-lg bg-error-container/10 border border-error/15"><span className="text-error font-bold">You: </span>{optionText(m, m.chosen)}</p>
                      <p className="px-3 py-2 rounded-lg bg-primary-container/10 border border-primary-container/20"><span className="text-primary-container font-bold">Answer: </span>{optionText(m, m.correct)}</p>
                    </div>
                    {m.explanation && <p className="text-sm text-on-surface-variant leading-relaxed">{m.explanation}</p>}
                    <button onClick={() => askMentorAbout(navigate, m)} className="mt-3 text-xs font-bold text-primary-container hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={filled}>diversity_3</span> Ask my mentor to explain
                    </button>
                  </li>
                ))}
                {shown.length === 0 && <li className="text-sm text-on-surface-variant text-center py-8">Nothing here for this filter.</li>}
              </ul>
            </>
          )}
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
