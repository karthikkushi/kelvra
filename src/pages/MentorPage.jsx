// src/pages/MentorPage.jsx
// AI Mentor: chat with a mentor that knows your real progress, plus weekly goals.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { loadMentorContext, askMentor, suggestWeeklyGoals, saveMentorState } from "../utils/mentor";
import { detectCrisis } from "../utils/safety";
import CrisisCard from "../components/CrisisCard";

const filled = { fontVariationSettings: "'FILL' 1" };

// Renders the mentor's short markdown (paragraphs, "- " bullets, **bold**) as React elements.
function RichText({ text }) {
  const bold = (line) => line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="font-bold text-on-surface">{part.slice(2, -2)}</strong> : part);
  const blocks = [];
  let list = null;
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    const item = line.match(/^(?:[-•*]|\d+[.)])\s+(.*)$/);
    if (item) {
      if (!list) { list = []; blocks.push({ list }); }
      list.push(<li key={i}>{bold(item[1])}</li>);
      return;
    }
    list = null;
    if (line) blocks.push(<p key={i}>{bold(line.replace(/^#+\s*/, ""))}</p>);
  });
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => (b.list ? <ul key={`l${i}`} className="list-disc pl-5 space-y-1">{b.list}</ul> : b))}
    </div>
  );
}

function starterPrompts(ctx) {
  const weak = ctx?.weakTopics?.[0]?.topic;
  const recent = ctx?.recentTopics?.[0];
  return [
    { icon: "calendar_month", label: "Plan my week", text: ctx?.exam
      ? `My ${ctx.exam.name} is in ${ctx.exam.daysLeft} days. Make me a realistic plan for this week.`
      : "Make me a realistic study plan for this week based on my progress." },
    { icon: "public", label: weak ? `Where is ${weak} used?` : "Why does this matter?", text: weak
      ? `Where is ${weak} used in real life and in real jobs? Give me concrete examples so it clicks.`
      : `How is ${recent || "what I'm studying"} used in the real world and in jobs?` },
    { icon: "work", label: "Careers for me", text: "What careers fit what I'm studying, and which skills should I start building now?" },
    { icon: "fact_check", label: "Honest progress review", text: "Review my progress honestly. What am I doing well, and what should I change?" },
    { icon: "self_improvement", label: "I feel stuck", text: "I feel unmotivated and stuck. Help me get back on track today." },
    { icon: "bolt", label: "Study smarter", text: "How can I study smarter instead of longer, given how I learn best?" },
  ];
}

function Snapshot({ ctx }) {
  const navigate = useNavigate();
  const stats = [
    { label: "Exam in", value: ctx.exam ? (ctx.exam.daysLeft >= 0 ? `${ctx.exam.daysLeft}d` : "Done") : "—" },
    { label: "Streak", value: `${ctx.streak}d` },
    { label: "Quiz avg", value: ctx.avgScore != null ? `${ctx.avgScore}%` : "—" },
  ];
  return (
    <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">What your mentor sees</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container rounded-xl p-3 text-center">
            <p className="font-headline text-xl font-bold text-on-surface">{s.value}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
      {(ctx.openMistakes > 0 || ctx.dueCards > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {ctx.openMistakes > 0 && (
            <button onClick={() => navigate("/mistakes")} className="text-xs px-3 py-1.5 rounded-full bg-error-container/10 text-error border border-error/15 hover:bg-error-container/20">
              {ctx.openMistakes} mistake{ctx.openMistakes === 1 ? "" : "s"} to retest →
            </button>
          )}
          {ctx.dueCards > 0 && (
            <button onClick={() => navigate("/review")} className="text-xs px-3 py-1.5 rounded-full bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container/20">
              {ctx.dueCards} card{ctx.dueCards === 1 ? "" : "s"} due →
            </button>
          )}
        </div>
      )}
      {ctx.weakTopics.length > 0 ? (
        <div>
          <p className="text-xs text-on-surface-variant mb-2">Needs work</p>
          <div className="flex flex-wrap gap-1.5">
            {ctx.weakTopics.map((t) => (
              <span key={t.topic} className="text-xs px-2.5 py-1 rounded-full bg-error-container/10 text-error border border-error/15">
                {t.topic} · {t.avg}%
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant">
          {ctx.quizCount ? "No weak topics right now. Nice work." : "Take a few quizzes so your mentor can spot weak topics."}
        </p>
      )}
      {!ctx.exam && (
        <button onClick={() => navigate("/dashboard")} className="mt-4 text-xs font-bold text-primary-container hover:underline">
          Set your exam date on the dashboard →
        </button>
      )}
    </section>
  );
}

function WeeklyGoals({ ctx, goals, setGoals }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = goals.filter((g) => g.done).length;

  const add = (text) => {
    const t = text.trim();
    if (!t || goals.length >= 6) return;
    setGoals([...goals, { id: crypto.randomUUID(), text: t, done: false }]);
  };

  const suggest = async () => {
    setBusy(true); setError("");
    try {
      const list = await suggestWeeklyGoals({ ...ctx, goals });
      setGoals([...goals, ...list.map((text) => ({ id: crypto.randomUUID(), text, done: false }))].slice(0, 6));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">This week's goals</h2>
        {goals.length > 0 && <span className="text-xs font-bold text-primary-container">{done}/{goals.length} done</span>}
      </div>
      {goals.length > 0 && (
        <div className="h-1.5 bg-surface-container-highest rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-primary-container transition-all" style={{ width: `${(done / goals.length) * 100}%` }} />
        </div>
      )}
      {ctx.lastWeekGoals.length > 0 && goals.length === 0 && (
        <p className="text-xs text-on-surface-variant mb-3">
          Last week you finished {ctx.lastWeekGoals.filter((g) => g.done).length} of {ctx.lastWeekGoals.length} goals. New week, fresh start.
        </p>
      )}
      <ul className="space-y-2 mb-3">
        {goals.map((g) => (
          <li key={g.id} className="flex items-start gap-2 group">
            <button onClick={() => setGoals(goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)))}
              aria-label={g.done ? "Mark as not done" : "Mark as done"}
              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                g.done ? "bg-primary-container border-primary-container" : "border-outline-variant/40 hover:border-primary-container"
              }`}>
              {g.done && <span className="material-symbols-outlined text-on-primary-container text-sm">check</span>}
            </button>
            <span className={`flex-1 text-sm ${g.done ? "line-through text-on-surface-variant" : "text-on-surface"}`}>{g.text}</span>
            <button onClick={() => setGoals(goals.filter((x) => x.id !== g.id))} aria-label="Remove goal"
              className="opacity-60 md:opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-opacity">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </li>
        ))}
      </ul>
      {goals.length < 6 && (
        <form onSubmit={(e) => { e.preventDefault(); add(input); setInput(""); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={120}
            placeholder="Add a goal…"
            className="flex-1 min-w-0 bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50" />
          <button type="submit" disabled={!input.trim()}
            className="px-3 rounded-xl bg-surface-container-highest text-on-surface disabled:opacity-40">
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </form>
      )}
      {goals.length < 4 && (
        <button onClick={suggest} disabled={busy}
          className="mt-3 w-full py-2.5 rounded-xl border border-primary-container/30 text-primary-container text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-container/10 disabled:opacity-50">
          <span className="material-symbols-outlined text-sm" style={filled}>auto_awesome</span>
          {busy ? "Thinking…" : "Suggest goals from my progress"}
        </button>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-error">{error}</p>}
    </section>
  );
}

export default function MentorPage({ user }) {
  const [ctx, setCtx] = useState(null);
  const [messages, setMessages] = useState([]);
  const [goals, setGoals] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("chat"); // phones only: "chat" | "goals"
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [crisis, setCrisis] = useState(false);
  const endRef = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    loadMentorContext(user).then((c) => {
      if (!alive) return;
      setCtx(c);
      setMessages(c.messages);
      setGoals(c.goals);
      loaded.current = true;
      // A question sent from another page (Mistakes, Explore): ask it straight away
      const pending = sessionStorage.getItem("kelvra_mentor_prompt");
      if (pending) {
        sessionStorage.removeItem("kelvra_mentor_prompt");
        setPendingPrompt(pending);
      }
    });
    return () => { alive = false; };
  }, [user]);

  // Save after every change (skipped until the saved state has loaded, so we never overwrite it with blanks).
  useEffect(() => {
    if (loaded.current && user?.id) saveMentorState(user.id, { messages, goals });
  }, [messages, goals, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || thinking || !ctx) return;
    setError("");
    setInput("");
    // Sounds like self-harm: do not send to the AI, do not save, show real help instead
    if (detectCrisis(content)) {
      setCrisis(true);
      setTab("chat");
      return;
    }
    setTab("chat");
    const next = [...messages, { role: "user", content, at: new Date().toISOString() }];
    setMessages(next);
    setThinking(true);
    try {
      const reply = await askMentor({ ...ctx, goals }, next);
      setMessages([...next, { role: "assistant", content: reply, at: new Date().toISOString() }]);
    } catch (err) {
      setError(err.message || "Could not reach your mentor. Please try again.");
      setMessages(messages); // undo, and give the text back so the student can resend
      setInput(content);
    } finally {
      setThinking(false);
    }
  };

  // Send a question that another page handed over (once the mentor's context has loaded)
  useEffect(() => {
    if (!pendingPrompt || !ctx) return;
    const text = pendingPrompt;
    setPendingPrompt(null);
    send(text);
  }, [pendingPrompt, ctx]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearChat = () => {
    if (window.confirm("Clear this conversation? Your goals stay.")) setMessages([]);
  };

  if (!ctx) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <Sidebar active="mentor" />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const prompts = starterPrompts(ctx);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="mentor" />
      <main className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-10">
          <header className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Your AI mentor · not a person</p>
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Hi {ctx.name}, what's on your mind?</h1>
              <p className="text-sm text-on-surface-variant mt-1 max-w-xl">
                A mentor that knows your scores, your exam date and your goals. Ask about study plans, real-world uses of a topic, careers, or when you feel stuck.
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="hidden sm:flex items-center gap-1 text-xs text-on-surface-variant hover:text-error flex-shrink-0">
                <span className="material-symbols-outlined text-sm">delete</span> Clear chat
              </button>
            )}
          </header>

          {/* Phone tabs */}
          <div className="lg:hidden grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-xl mb-4">
            {[["chat", "Chat"], ["goals", `Goals & progress${goals.length ? ` (${goals.filter((g) => g.done).length}/${goals.length})` : ""}`]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`py-2 rounded-lg text-xs font-bold ${tab === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Chat */}
            <section className={`lg:col-span-2 flex flex-col bg-surface-container-low/50 border border-outline-variant/10 rounded-2xl min-h-[60vh] lg:h-[calc(100vh-12rem)] ${tab === "chat" ? "flex" : "hidden lg:flex"}`}>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" aria-live="polite">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col justify-center">
                    <p className="text-sm text-on-surface-variant mb-4 text-center">Pick a starting point or type your own question.</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {prompts.map((p) => (
                        <button key={p.label} onClick={() => send(p.text)}
                          className="text-left p-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-primary-container/40 transition-all group">
                          <span className="material-symbols-outlined text-primary-container mb-2 block" style={filled}>{p.icon}</span>
                          <span className="text-sm font-bold text-on-surface block">{p.label}</span>
                          <span className="text-xs text-on-surface-variant line-clamp-2">{p.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary-container/15 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="material-symbols-outlined text-primary-container text-sm" style={filled}>diversity_3</span>
                      </div>
                    )}
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary-container text-on-primary-container rounded-tr-sm whitespace-pre-wrap"
                        : "bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-tl-sm"
                    }`}>
                      {m.role === "user" ? m.content : <RichText text={m.content} />}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container/15 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary-container text-sm" style={filled}>diversity_3</span>
                    </div>
                    <div className="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-end gap-1 h-10">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {messages.length > 0 && !thinking && (
                <div className="px-4 sm:px-6 pb-2 flex gap-2 overflow-x-auto">
                  {prompts.slice(0, 4).map((p) => (
                    <button key={p.label} onClick={() => send(p.text)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-container hover:border-primary-container/40">
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {crisis && (
                <div className="mx-4 sm:mx-6 mb-3"><CrisisCard onClose={() => setCrisis(false)} /></div>
              )}

              {error && (
                <p role="alert" className="mx-4 sm:mx-6 mb-2 text-xs text-error bg-error-container/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <form onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="p-3 sm:p-4 border-t border-outline-variant/10 flex gap-2 items-end">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} maxLength={1500}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  placeholder="Ask your mentor anything…"
                  aria-label="Message your mentor"
                  className="flex-1 bg-surface-container border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 resize-none max-h-32" />
                <button type="submit" disabled={!input.trim() || thinking} aria-label="Send"
                  className="w-11 h-11 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:scale-105 active:scale-95 transition-all">
                  <span className="material-symbols-outlined" style={filled}>send</span>
                </button>
              </form>
            </section>

            {/* Side panel */}
            <aside className={`space-y-4 lg:overflow-y-auto lg:h-[calc(100vh-12rem)] ${tab === "goals" ? "block" : "hidden lg:block"}`}>
              <WeeklyGoals ctx={ctx} goals={goals} setGoals={setGoals} />
              <Snapshot ctx={ctx} />
              <p className="text-[11px] text-on-surface-variant/70 px-1 leading-relaxed">
                Your mentor is an AI. It can be wrong, so double-check important facts like exam rules and dates with your teacher or the official source.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
