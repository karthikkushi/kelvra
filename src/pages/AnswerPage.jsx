// src/pages/AnswerPage.jsx
// Answer-writing coach: write (or speak) a full exam answer -> rubric feedback with ONE biggest fix
// -> rewrite -> see the improvement -> only then the model answer.
import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import CrisisCard from "../components/CrisisCard";
import {
  CRITERIA, BANDS, BOARDS, MARKS, targetWords, weakestCriterion, speechStats,
  evaluateAnswer, getModelAnswer, suggestQuestion,
} from "../utils/answerCoach";
import { saveAnswer, getAnswers, newAnswerId } from "../utils/learning";
import { listRecent } from "../utils/firebase";
import { awardXP } from "../utils/gamification";
import { detectCrisis } from "../utils/safety";

const filled = { fontVariationSettings: "'FILL' 1" };
const BAND_COLORS = ["bg-error", "bg-tertiary-fixed-dim", "bg-secondary", "bg-primary-container"];
const BAND_TEXT = ["text-error", "text-tertiary-fixed-dim", "text-secondary", "text-primary-container"];

// Browser speech-to-text (Chrome, Edge, Android). Not available in Firefox.
function useSpeech(lang) {
  const recRef = useRef(null);
  const startedAt = useRef(0);
  const [listening, setListening] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const Recognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = (onText) => {
    if (!Recognition) return;
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim());
      }
    };
    rec.onend = () => {
      setListening(false);
      setSeconds((s) => s + (Date.now() - startedAt.current) / 1000);
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    startedAt.current = Date.now();
    rec.start();
    setListening(true);
  };
  const stop = () => recRef.current?.stop();
  useEffect(() => () => recRef.current?.abort(), []);
  return { supported: !!Recognition, listening, seconds, start, stop, reset: () => setSeconds(0) };
}

function Feedback({ ev, prev, selfRating }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-surface-container rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Overall</p>
          <p className={`font-headline text-xl font-bold ${BAND_TEXT[ev.overall]}`}>{BANDS[ev.overall]}</p>
          {prev && <p className="text-xs text-on-surface-variant">Before: {BANDS[prev.overall]}</p>}
        </div>
        <div className="bg-surface-container rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Marks (estimate)</p>
          <p className="font-headline text-xl font-bold text-on-surface">
            about {ev.marks_range[0] === ev.marks_range[1] ? ev.marks_range[0] : `${ev.marks_range[0]}–${ev.marks_range[1]}`}
          </p>
          <p className="text-xs text-on-surface-variant">{ev.certainty === "low" ? "AI is unsure here" : "AI estimate, may be off"}</p>
        </div>
        {selfRating != null && (
          <div className="bg-surface-container rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">You expected</p>
            <p className="font-headline text-xl font-bold text-on-surface">{BANDS[selfRating]}</p>
            <p className="text-xs text-on-surface-variant">
              {selfRating === ev.overall ? "Spot on. You judge your answers well." : selfRating > ev.overall ? "A bit higher than the feedback." : "Better than you thought!"}
            </p>
          </div>
        )}
      </div>

      <div className="bg-primary-container/10 border border-primary-container/25 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Biggest fix (do this in your rewrite)</p>
        <p className="text-sm text-on-surface">{ev.biggest_fix}</p>
      </div>
      {ev.strength && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Done well: </strong>{ev.strength}</p>}

      <ul className="space-y-2">
        {CRITERIA.map((c) => {
          const r = ev.criteria[c.id];
          const before = prev?.criteria?.[c.id]?.band;
          return (
            <li key={c.id} className="bg-surface-container rounded-xl p-3">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-sm font-bold text-on-surface">{c.label}</span>
                <span className={`text-xs font-bold ${BAND_TEXT[r.band]}`}>
                  {before != null && before !== r.band ? `${BANDS[before]} → ` : ""}{BANDS[r.band]}
                </span>
              </div>
              <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-1.5">
                <div className={`h-full ${BAND_COLORS[r.band]}`} style={{ width: `${((r.band + 1) / 4) * 100}%` }} />
              </div>
              {r.comment && <p className="text-xs text-on-surface-variant">{r.comment}</p>}
            </li>
          );
        })}
      </ul>

      {ev.missing_points.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Hints for your rewrite</p>
          <ul className="space-y-1">{ev.missing_points.map((m) => <li key={m} className="text-sm text-on-surface-variant">• {m}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

export default function AnswerPage({ user }) {
  const [stage, setStage] = useState("setup"); // setup | write | feedback | done
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("");
  const [marks, setMarks] = useState(5);
  const [board, setBoard] = useState("CBSE");
  const [text, setText] = useState("");
  const [mode, setMode] = useState("write");
  const [lang, setLang] = useState("en-IN");
  const [selfRating, setSelfRating] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [modelAnswer, setModelAnswer] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [history, setHistory] = useState([]);
  const [topics, setTopics] = useState([]);
  const idRef = useRef(null);
  const speech = useSpeech(lang);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getAnswers(user.id), listRecent(user.id, "study_sessions", { max: 15 }).catch(() => [])]).then(([h, s]) => {
      if (!alive) return;
      setHistory(h);
      setTopics([...new Set(s.map((x) => x.topic).filter((t) => t && t.length < 60))].slice(0, 5));
    });
    return () => { alive = false; };
  }, [user?.id]);

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const target = targetWords(marks);
  const last = attempts[attempts.length - 1];
  const weakest = weakestCriterion(history);

  const suggest = async () => {
    if (!topic.trim()) { setError("Type a topic first, e.g. Photosynthesis."); return; }
    setBusy("question"); setError("");
    try { setQuestion(await suggestQuestion({ topic: topic.trim(), marks, board })); }
    catch (err) { setError(err.message); }
    finally { setBusy(""); }
  };

  const begin = () => {
    if (question.trim().length < 8) { setError("Type the exam question first."); return; }
    if (detectCrisis(question)) { setQuestion(""); setCrisis(true); return; }
    setError("");
    idRef.current = newAnswerId();
    setAttempts([]); setText(""); setModelAnswer(""); setSelfRating(null); speech.reset();
    setStage("write");
  };

  const submit = async () => {
    if (words < 15) { setError("Write at least a few sentences (15+ words) so the feedback is useful."); return; }
    if (detectCrisis(text)) { setText(""); setCrisis(true); return; }
    if (selfRating == null) { setError("First pick how good you think this answer is."); return; }
    setBusy("feedback"); setError("");
    try {
      const ev = await evaluateAnswer({ question, marks, board, answer: text, previous: last });
      const stats = mode === "speak" ? speechStats(text, speech.seconds) : null;
      const attempt = { text, mode, self_rating: selfRating, ...ev, ...(stats ? { speech: stats } : {}), at: new Date().toISOString() };
      const next = [...attempts, attempt];
      setAttempts(next);
      saveAnswer(user.id, idRef.current, {
        question, marks, board, topic: topic.trim() || null, attempts: next,
        ...(attempts.length === 0 ? { created_at: new Date().toISOString() } : {}),
      });
      if (next.length === 2) awardXP(user.id, "COMPLETE_QUIZ", {}, user);
      setStage("feedback");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const rewrite = () => {
    setSelfRating(null); speech.reset();
    setStage("write"); // keeps their own text so they can improve it
  };

  const showModel = async () => {
    setBusy("model"); setError("");
    try {
      const m = await getModelAnswer({ question, marks, board });
      setModelAnswer(m);
      saveAnswer(user.id, idRef.current, { model_answer: m });
      setStage("done");
      setHistory((h) => [{ id: idRef.current, question, marks, board, attempts, created_at: new Date().toISOString() }, ...h.filter((x) => x.id !== idRef.current)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const toggleMic = () => {
    if (speech.listening) speech.stop();
    else speech.start((t) => setText((cur) => (cur ? `${cur} ${t}` : t)));
  };

  const inputCls = "w-full bg-surface-container border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50";

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="answer" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Answer-writing coach</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Write it like the topper. Then make it better.</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Write or speak a full exam answer. You get feedback on 5 things examiners check, one biggest fix, and a rewrite.
              The model answer comes only after you try, because that is where the learning happens.
            </p>
          </header>

          {crisis && <div className="mb-5"><CrisisCard onClose={() => setCrisis(false)} /></div>}
          {error && <p role="alert" className="mb-4 text-sm text-error bg-error-container/10 border border-error/20 rounded-xl px-4 py-3">{error}</p>}

          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 space-y-4">
              {stage === "setup" && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-xs text-on-surface-variant">Board / exam
                      <select value={board} onChange={(e) => setBoard(e.target.value)} className={`${inputCls} mt-1`}>
                        {BOARDS.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </label>
                    <div className="text-xs text-on-surface-variant">Marks
                      <div className="grid grid-cols-4 gap-1 mt-1">
                        {MARKS.map((m) => (
                          <button key={m} onClick={() => setMarks(m)}
                            className={`py-3 rounded-xl text-sm font-bold border ${marks === m ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-outline-variant/15 bg-surface-container text-on-surface-variant"}`}>{m}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <label className="block text-xs text-on-surface-variant">Exam question
                    <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} maxLength={400}
                      placeholder="e.g. Explain the process of photosynthesis with a labelled equation."
                      className={`${inputCls} mt-1 resize-none`} />
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={60} placeholder="No question? Type a topic…" aria-label="Topic"
                      className={`${inputCls} flex-1`} />
                    <button onClick={suggest} disabled={busy === "question"}
                      className="px-4 py-3 rounded-xl border border-primary-container/30 text-primary-container text-sm font-bold disabled:opacity-50">
                      {busy === "question" ? "Thinking…" : "Give me a question"}
                    </button>
                  </div>
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topics.map((t) => <button key={t} onClick={() => setTopic(t)} className="text-xs px-3 py-1.5 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-container">{t}</button>)}
                    </div>
                  )}
                  <button onClick={begin} className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold">Start answering</button>
                </div>
              )}

              {(stage === "write" || stage === "feedback" || stage === "done") && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{board} · {marks} marks{attempts.length ? ` · attempt ${attempts.length + (stage === "write" ? 1 : 0)}` : ""}</p>
                  <p className="font-headline font-bold text-on-surface mt-1">{question}</p>
                </div>
              )}

              {stage === "write" && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-4">
                  {attempts.length > 0 && (
                    <div className="bg-primary-container/10 border border-primary-container/25 rounded-xl p-3 text-sm">
                      <strong className="text-primary-container">Rewrite goal: </strong>{last.biggest_fix}
                    </div>
                  )}
                  <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
                    {[["write", "edit", "Write"], ["speak", "mic", "Speak"]].map(([id, icon, label]) => (
                      <button key={id} onClick={() => setMode(id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${mode === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined text-sm">{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                  {mode === "speak" && (
                    speech.supported ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button onClick={toggleMic}
                          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${speech.listening ? "bg-error text-white" : "bg-primary-container text-on-primary-container"}`}>
                          <span className="material-symbols-outlined text-lg" style={filled}>{speech.listening ? "stop" : "mic"}</span>
                          {speech.listening ? "Stop" : "Start speaking"}
                        </button>
                        <select value={lang} onChange={(e) => setLang(e.target.value)} disabled={speech.listening} aria-label="Language"
                          className="bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2 text-sm text-on-surface">
                          <option value="en-IN">English (India)</option>
                          <option value="hi-IN">Hindi / Hinglish</option>
                        </select>
                        <p className="text-xs text-on-surface-variant w-full">Explain it like you would in a viva. Your words appear below; you can fix mistakes before submitting.</p>
                      </div>
                    ) : (
                      <p className="text-xs text-on-surface-variant">Speaking needs Chrome or Edge (or Android). You can still type your answer.</p>
                    )
                  )}
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} maxLength={6000}
                    placeholder="Write your full answer here, like in the exam…" aria-label="Your answer"
                    className={`${inputCls} resize-y leading-relaxed`} />
                  <p className={`text-xs ${words < target.min ? "text-on-surface-variant" : words > target.max ? "text-tertiary-fixed-dim" : "text-primary-container"}`}>
                    {words} words · aim for about {target.min}–{target.max} for {marks} marks
                  </p>
                  <div>
                    <p className="text-sm font-bold text-on-surface mb-2">Before you submit: how good do you think it is?</p>
                    <div className="grid grid-cols-4 gap-2">
                      {BANDS.map((b, i) => (
                        <button key={b} onClick={() => setSelfRating(i)}
                          className={`py-2 rounded-xl text-xs font-bold border ${selfRating === i ? "border-secondary bg-secondary-container/20 text-secondary" : "border-outline-variant/15 bg-surface-container text-on-surface-variant"}`}>{b}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={submit} disabled={busy === "feedback" || speech.listening}
                    className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold disabled:opacity-50">
                    {busy === "feedback" ? "Checking your answer…" : attempts.length ? "Check my rewrite" : "Get feedback"}
                  </button>
                </div>
              )}

              {(stage === "feedback" || stage === "done") && last && (
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-4">
                  <Feedback ev={last} prev={attempts.length > 1 ? attempts[attempts.length - 2] : null} selfRating={last.self_rating} />
                  {last.speech && (
                    <p className="text-xs text-on-surface-variant">
                      Speaking: {last.speech.words} words{last.speech.wpm ? `, about ${last.speech.wpm} words/min` : ""}
                      {last.speech.fillerTotal ? `, filler words: ${Object.entries(last.speech.fillers).map(([f, n]) => `${f} ×${n}`).join(", ")}` : ""}. (Info only, not part of the score.)
                    </p>
                  )}
                  {stage === "feedback" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      {attempts.length < 3 && (
                        <button onClick={rewrite} className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">
                          {attempts.length === 1 ? "Rewrite now (recommended)" : "Rewrite again"}
                        </button>
                      )}
                      <button onClick={showModel} disabled={busy === "model"}
                        className={`py-3 px-4 rounded-xl text-sm font-bold disabled:opacity-50 ${attempts.length > 1 ? "flex-1 border border-primary-container/40 text-primary-container" : "text-on-surface-variant underline"}`}>
                        {busy === "model" ? "Loading…" : attempts.length > 1 ? "See the model answer" : "Skip rewrite, see model answer"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {stage === "done" && modelAnswer && (
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-2">Model answer (AI) · compare, don't copy</p>
                  <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{modelAnswer}</p>
                  <button onClick={() => { setStage("setup"); setQuestion(""); }} className="mt-4 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm">Practise another question</button>
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Your progress</p>
                {history.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Your answers and how they improve will show here.</p>
                ) : (
                  <>
                    {weakest && (
                      <p className="text-sm text-on-surface mb-3">Focus next on <strong className="text-primary-container">{weakest.label}</strong>. {weakest.hint}</p>
                    )}
                    <ul className="space-y-2">
                      {history.slice(0, 8).map((h) => {
                        const a = h.attempts || [];
                        if (!a.length) return null;
                        return (
                          <li key={h.id} className="text-xs">
                            <p className="text-on-surface truncate">{h.question}</p>
                            <p className="text-on-surface-variant">
                              <span className={BAND_TEXT[a[0].overall]}>{BANDS[a[0].overall]}</span>
                              {a.length > 1 && <> → <span className={BAND_TEXT[a[a.length - 1].overall]}>{BANDS[a[a.length - 1].overall]}</span></>}
                              {" · "}{h.marks} marks
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
              <div className="text-[11px] text-on-surface-variant/70 px-1 space-y-1">
                <p>Marks are AI estimates and can be off by a mark or two. Your teacher's marking scheme is the final word.</p>
                <p>Kelvra never writes your answer for you.</p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
