// src/components/PlotTwist.jsx
// Plot Twist mode screens:
// - GuessFirst: 2-3 free guesses before studying a new kit (never scored, no XP).
// - TwistReplay: a second look at the "Sure but wrong" questions at the end of a quiz.
import { useMemo, useState } from "react";
import { LEVELS } from "../utils/confidence";
import { GUESS_INTRO, isPlotTwist, shuffledOptions } from "../utils/plotTwist";

const filled = { fontVariationSettings: "'FILL' 1" };
const INTRO_KEY = "kelvra_seen_guess_intro";

function seenIntro() {
  try { return localStorage.getItem(INTRO_KEY) === "1"; } catch { return false; }
}
function markIntroSeen() {
  try { localStorage.setItem(INTRO_KEY, "1"); } catch { /* storage blocked */ }
}

// One question: pick an option, say how sure you are, then see the answer.
function QuestionCard({ q, options, onAnswered, askConfidence = true }) {
  const [picked, setPicked] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const answered = picked && (confidence || !askConfidence);
  const right = answered && picked === q.correct;
  const twist = answered && isPlotTwist(confidence, right);

  const choose = (id) => {
    if (answered) return;
    setPicked(id);
    // Replay mode skips the confidence question, so the pick is the answer
    if (!askConfidence) onAnswered?.({ picked: id, confidence: null, right: id === q.correct });
  };
  const sure = (level) => {
    setConfidence(level);
    onAnswered?.({ picked, confidence: level, right: picked === q.correct });
  };

  return (
    <div className="space-y-4">
      <p className="font-headline text-lg sm:text-xl font-bold text-on-surface leading-snug">{q.question}</p>
      <div className="grid gap-2">
        {options.map((o) => {
          const state = !answered ? (picked === o.id ? "picked" : "idle") : o.id === q.correct ? "right" : o.id === picked ? "wrong" : "idle";
          return (
            <button key={o.id} onClick={() => choose(o.id)} disabled={!!answered} aria-pressed={picked === o.id}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                state === "right" ? "bg-primary-container/15 border-primary-container/60 text-on-surface"
                : state === "wrong" ? "bg-error-container/15 border-error/40 text-on-surface"
                : state === "picked" ? "bg-secondary-container/20 border-secondary/60 text-on-surface"
                : "bg-surface-container border-outline-variant/15 hover:border-primary-container/40 text-on-surface-variant"
              }`}>
              <span className="font-bold mr-2">{o.id}</span>{o.text}
            </button>
          );
        })}
      </div>

      {picked && !answered && askConfidence && (
        <div role="group" aria-label="How sure are you?">
          <p className="text-sm font-bold text-on-surface mb-2">How sure are you?</p>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => sure(l.id)}
                className="py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-secondary/60 text-sm font-bold text-on-surface flex flex-col items-center gap-0.5">
                <span className="material-symbols-outlined text-secondary text-lg">{l.icon}</span>{l.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {answered && (
        <div role="status" className={`rounded-2xl p-4 border ${twist ? "bg-secondary-container/20 border-secondary/50" : right ? "bg-primary-container/10 border-primary-container/30" : "bg-surface-container border-outline-variant/20"}`}>
          {twist ? (
            <p className="font-headline font-bold text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined" style={filled}>auto_awesome</span> Plot twist! You were sure, but it's {q.correct}.
            </p>
          ) : (
            <p className={`font-headline font-bold ${right ? "text-primary-container" : "text-on-surface"}`}>
              {right ? (confidence === "guess" ? "Right! Was it really a guess?" : "Right!") : `Not this time. It's ${q.correct}.`}
            </p>
          )}
          {q.explanation && <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{q.explanation}</p>}
          {twist && <p className="text-xs text-on-surface-variant mt-2">Surprises like this stick best. It comes back later so the right answer stays.</p>}
        </div>
      )}
    </div>
  );
}

export function GuessFirst({ questions, onDone }) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState([]);
  const [showIntro] = useState(() => !seenIntro());
  const q = questions[i];
  const last = results[i];

  const record = (r) => setResults((list) => { const next = [...list]; next[i] = r; return next; });
  const next = () => {
    markIntroSeen();
    if (i + 1 < questions.length) setI(i + 1);
    else onDone(results);
  };

  return (
    <section className="bg-surface-container-low border border-secondary/30 rounded-3xl p-5 sm:p-7 space-y-5" aria-label="Guess first">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Guess first · {i + 1} of {questions.length}</p>
          <h2 className="font-headline text-xl font-bold mt-1">Before you read: what do you think?</h2>
        </div>
        <button onClick={() => { markIntroSeen(); onDone(results); }} className="text-xs text-on-surface-variant hover:text-on-surface underline flex-shrink-0">Skip guesses</button>
      </div>
      {showIntro && i === 0 && !last && (
        <p className="text-sm text-on-surface-variant bg-surface-container rounded-xl px-4 py-3">{GUESS_INTRO}</p>
      )}
      <QuestionCard key={i} q={q} options={q.options} onAnswered={record} />
      {last && (
        <button onClick={next} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">
          {i + 1 < questions.length ? "Next guess" : "Now read your study kit"}
        </button>
      )}
    </section>
  );
}

export function TwistReplay({ items, onDone }) {
  const [i, setI] = useState(0);
  const [fixed, setFixed] = useState(0);
  const [answered, setAnswered] = useState(null);
  const q = items[i];
  const options = useMemo(() => shuffledOptions(q.options, i + 7), [q, i]);

  const record = (r) => { setAnswered(r); if (r.right) setFixed((f) => f + 1); };
  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setAnswered(null); }
    else onDone(fixed);
  };

  return (
    <section className="max-w-2xl w-full bg-surface-container-low border border-secondary/30 rounded-3xl p-5 sm:p-7 space-y-5" aria-label="Second look">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Second look · {i + 1} of {items.length}</p>
        <h2 className="font-headline text-xl font-bold mt-1">You were sure about these. Try once more.</h2>
        <p className="text-sm text-on-surface-variant mt-1">The options are in a new order.</p>
      </div>
      <QuestionCard key={i} q={q} options={options} onAnswered={record} askConfidence={false} />
      {answered && (
        <>
          <p className="text-sm text-on-surface-variant">
            {answered.right ? "Fixed for now. It comes back tomorrow to make it stick." : "Still tricky. It will be first in your Mistake notebook tomorrow."}
          </p>
          <button onClick={next} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">
            {i + 1 < items.length ? "Next" : "See my results"}
          </button>
        </>
      )}
    </section>
  );
}
