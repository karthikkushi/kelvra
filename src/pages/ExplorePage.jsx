// src/pages/ExplorePage.jsx
// Career & project explorer: for any topic, real-world uses, jobs, a hands-on project and interview questions.
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { exploreTopic } from "../utils/mentor";
import { getExplorations, saveExploration, deleteExploration } from "../utils/learning";
import { listRecent } from "../utils/firebase";

const filled = { fontVariationSettings: "'FILL' 1" };

function Section({ icon, title, children }) {
  return (
    <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-headline font-bold text-on-surface mb-4">
        <span className="material-symbols-outlined text-primary-container" style={filled}>{icon}</span>{title}
      </h2>
      {children}
    </section>
  );
}

function Result({ data, onMentor }) {
  const [openHint, setOpenHint] = useState(null);
  return (
    <div className="space-y-4">
      {data.summary && <p className="text-on-surface-variant leading-relaxed">{data.summary}</p>}

      <Section icon="public" title="Where it is used">
        <ul className="space-y-2">
          {data.realWorld.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-on-surface-variant"><span className="text-primary-container">•</span>{r}</li>
          ))}
        </ul>
      </Section>

      <Section icon="work" title="Jobs that use it">
        <div className="grid sm:grid-cols-3 gap-3">
          {data.careers.map((c) => (
            <div key={c.title} className="bg-surface-container rounded-xl p-4">
              <p className="font-bold text-on-surface text-sm">{c.title}</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{c.how}</p>
              {c.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {c.skills.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/10 text-primary-container">{s}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section icon="construction" title={`Try it: ${data.project.title}`}>
        {data.project.goal && <p className="text-sm text-on-surface-variant mb-3">{data.project.goal}</p>}
        <ol className="space-y-2 mb-4">
          {data.project.steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-surface-container-highest text-primary-container text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <span className="text-on-surface-variant pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-on-surface-variant">
          {data.project.time && <span><strong className="text-on-surface">Time:</strong> {data.project.time}</span>}
          {data.project.tools.length > 0 && <span><strong className="text-on-surface">Tools:</strong> {data.project.tools.join(", ")}</span>}
        </div>
        <button onClick={() => onMentor(`I want to do this project: "${data.project.title}". Help me plan the first step for this week, based on my exam timeline.`)}
          className="mt-4 text-xs font-bold text-primary-container hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={filled}>diversity_3</span> Plan it with my mentor
        </button>
      </Section>

      <Section icon="record_voice_over" title="Interview & viva practice">
        <ul className="space-y-2">
          {data.interview.map((x, i) => (
            <li key={x.q} className="bg-surface-container rounded-xl">
              <button onClick={() => setOpenHint(openHint === i ? null : i)} aria-expanded={openHint === i}
                className="w-full text-left px-4 py-3 text-sm text-on-surface flex justify-between gap-3">
                <span>{x.q}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">{openHint === i ? "expand_less" : "expand_more"}</span>
              </button>
              {openHint === i && <p className="px-4 pb-3 text-xs text-on-surface-variant leading-relaxed"><strong className="text-primary-container">A good answer covers: </strong>{x.hint}</p>}
            </li>
          ))}
        </ul>
      </Section>
      <p className="text-[11px] text-on-surface-variant/70">Made by AI. Use it to get ideas, and check details like course or job requirements with official sources.</p>
    </div>
  );
}

export default function ExplorePage({ user }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [topic, setTopic] = useState(() => params.get("topic") || "");
  const [saved, setSaved] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [current, setCurrent] = useState(null); // { id, topic, ...result }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getExplorations(user.id), listRecent(user.id, "study_sessions", { max: 20 }).catch(() => [])]).then(([list, sessions]) => {
      if (!alive) return;
      setSaved(list);
      const done = new Set(list.map((x) => x.topic.toLowerCase()));
      setSuggestions([...new Set(sessions.map((s) => s.topic).filter((t) => t && t.length < 60))].filter((t) => !done.has(t.toLowerCase())).slice(0, 6));
    });
    return () => { alive = false; };
  }, [user?.id]);

  const run = async (t) => {
    const name = (t ?? topic).trim();
    if (!name || loading) return;
    setTopic(name);
    setError("");
    setLoading(true);
    try {
      const meta = user?.user_metadata || {};
      const result = await exploreTopic(name, { studyType: meta.study_type, goal: meta.goal });
      const id = saveExploration(user.id, name, result);
      const entry = { id, topic: name, ...result, created_at: new Date().toISOString() };
      setCurrent(entry);
      setSaved((list) => [entry, ...list.filter((x) => x.id !== id)]);
      setSuggestions((list) => list.filter((x) => x !== name));
    } catch (err) {
      setError(err.message || "Could not explore this topic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toMentor = (prompt) => {
    sessionStorage.setItem("kelvra_mentor_prompt", prompt);
    navigate("/mentor");
  };

  const remove = (x) => {
    deleteExploration(user.id, x.id);
    setSaved((list) => list.filter((y) => y.id !== x.id));
    if (current?.id === x.id) setCurrent(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="explore" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Career & project explorer</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">"Why do I need to learn this?"</h1>
            <p className="text-sm text-on-surface-variant mt-1">Type any topic. See where it is used, which jobs need it, a small project to try, and interview questions.</p>
          </header>

          <form onSubmit={(e) => { e.preventDefault(); run(); }} className="flex gap-2 mb-3">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80}
              placeholder="e.g. Derivatives, Photosynthesis, Supply and demand"
              aria-label="Topic to explore"
              className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50" />
            <button type="submit" disabled={!topic.trim() || loading}
              className="px-5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm disabled:opacity-40 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg" style={filled}>explore</span>
              <span className="hidden sm:inline">{loading ? "Exploring…" : "Explore"}</span>
            </button>
          </form>

          {suggestions.length > 0 && !current && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs text-on-surface-variant">From your studies:</span>
              {suggestions.map((s) => (
                <button key={s} onClick={() => run(s)} className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-container hover:border-primary-container/40">{s}</button>
              ))}
            </div>
          )}

          {error && <p role="alert" className="mb-4 text-sm text-error bg-error-container/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>}

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {loading ? (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-10 text-center text-on-surface-variant text-sm">
                  <div className="w-8 h-8 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                  Finding real-world uses of {topic}…
                </div>
              ) : current ? (
                <>
                  <h2 className="font-headline text-xl font-bold mb-3">{current.topic}</h2>
                  <Result data={current} onMentor={toMentor} />
                </>
              ) : (
                <div className="bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl p-10 text-center text-sm text-on-surface-variant">
                  Pick a topic to see how it connects to real jobs and projects.
                </div>
              )}
            </div>
            {saved.length > 0 && (
              <aside>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Saved</p>
                <ul className="space-y-1">
                  {saved.map((x) => (
                    <li key={x.id} className="flex items-center group">
                      <button onClick={() => { setCurrent(x); setTopic(x.topic); }}
                        className={`flex-1 text-left text-sm px-3 py-2 rounded-lg truncate ${current?.id === x.id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant hover:bg-surface-container-low"}`}>
                        {x.topic}
                      </button>
                      <button onClick={() => remove(x)} aria-label={`Delete ${x.topic}`} className="opacity-60 md:opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error px-1">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
