import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { saveQuizScore } from "../utils/firebase";
import { awardXP } from "../utils/gamification";
import { saveMistake, saveConfidence } from "../utils/learning";
import { LEVELS, calibrationSummary } from "../utils/confidence";
import { getHint } from "../utils/claudeAPI";
import { speak, stopSpeaking, getVoiceEnabled, setVoiceEnabled, isSpeechSupported } from "../utils/voice";

const QUESTIONS = [
  {
    topic: "Neuroplasticity",
    question: "How does the transformer architecture leverage Self-Attention to process sequences in parallel compared to RNNs?",
    options: [
      { id: "A", text: "It computes dependencies between all tokens simultaneously through weight matrices." },
      { id: "B", text: "By processing tokens one by one in a hidden state loop to maintain order." },
      { id: "C", text: "It utilizes convolutional kernels to detect local patterns across the input embedding." },
      { id: "D", text: "By discarding positional information to prioritize global feature extraction." },
    ],
    correct: "A",
    explanation: "Unlike RNNs which process tokens sequentially (O(n) time), Transformers use self-attention to allow every token to interact with every other token simultaneously. This constant-time complexity enables massive parallelization on modern GPUs.",
  },
  {
    topic: "Biological Psychology",
    question: "Which brain structure is primarily responsible for converting short-term memories into long-term memories?",
    options: [
      { id: "A", text: "Amygdala — processes emotional responses and fear conditioning." },
      { id: "B", text: "Cerebellum — coordinates motor control and procedural learning." },
      { id: "C", text: "Hippocampus — critical for memory consolidation and spatial navigation." },
      { id: "D", text: "Prefrontal cortex — handles executive functions and decision making." },
    ],
    correct: "C",
    explanation: "The hippocampus plays a central role in converting short-term memories into long-term memories through a process called memory consolidation. Damage to the hippocampus results in anterograde amnesia.",
  },
  {
    topic: "Cognitive Science",
    question: "What does Long-Term Potentiation (LTP) represent at the synaptic level?",
    options: [
      { id: "A", text: "A temporary weakening of synaptic connections due to repeated stimulation." },
      { id: "B", text: "A persistent strengthening of synaptic connections based on recent activity patterns." },
      { id: "C", text: "The process by which neurons release excess neurotransmitters into the synapse." },
      { id: "D", text: "The reabsorption of neurotransmitters back into the presynaptic neuron." },
    ],
    correct: "B",
    explanation: "LTP is a persistent strengthening of synaptic connections that results from repeated stimulation. It is widely considered one of the major cellular mechanisms underlying learning and memory — essentially 'neurons that fire together, wire together'.",
  },
  {
    topic: "Neuroplasticity",
    question: "Which of the following best describes neuroplasticity?",
    options: [
      { id: "A", text: "The brain's fixed, hardwired structure that cannot change after early childhood." },
      { id: "B", text: "The process of neurons dying and being replaced by new ones every 7 years." },
      { id: "C", text: "The brain's ability to reorganize itself by forming new neural connections throughout life." },
      { id: "D", text: "The chemical balance maintained between different neurotransmitter systems." },
    ],
    correct: "C",
    explanation: "Neuroplasticity refers to the brain's remarkable ability to reorganize itself by forming new neural connections in response to learning, experience, or injury. This can occur throughout a person's entire life.",
  },
  {
    topic: "Cognitive Science",
    question: "In Baddeley's working memory model, what is the role of the 'phonological loop'?",
    options: [
      { id: "A", text: "It coordinates the other subsystems and links working memory to long-term memory." },
      { id: "B", text: "It temporarily stores and rehearses verbal and auditory information." },
      { id: "C", text: "It handles the processing of visual and spatial information." },
      { id: "D", text: "It transfers information from working memory to long-term storage." },
    ],
    correct: "B",
    explanation: "The phonological loop is a subsystem of working memory that temporarily stores and rehearses verbal/auditory information. It has two components: the phonological store (inner ear) and the articulatory rehearsal process (inner voice).",
  },
  {
    topic: "Biological Psychology",
    question: "What is the primary function of dopamine in the brain's reward system?",
    options: [
      { id: "A", text: "It inhibits neural activity to produce calming and relaxing effects." },
      { id: "B", text: "It regulates sleep-wake cycles and circadian rhythms." },
      { id: "C", text: "It signals reward prediction and motivates goal-directed behavior." },
      { id: "D", text: "It controls muscle movement and coordination via the motor cortex." },
    ],
    correct: "C",
    explanation: "Dopamine is central to the brain's reward system. It signals reward prediction errors — firing when outcomes are better than expected — which motivates future goal-directed behavior. This mechanism underlies learning, addiction, and motivation.",
  },
];

const DIFFICULTY_CYCLE = ["Easy", "Medium", "Hard"];

// Normalize generated quiz options {A: text} → [{id: "A", text}]
function normalizeQuestions(qs) {
  return qs.map((q) => ({
    ...q,
    options: Array.isArray(q.options)
      ? q.options
      : Object.entries(q.options).map(([id, text]) => ({ id, text })),
  }));
}

// Questions from the last generated study kit, else the sample quiz
function storedQuestions() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem("kelvra_quiz"));
    if (Array.isArray(parsed) && parsed.length > 0) return normalizeQuestions(parsed);
  } catch { /* missing or broken data: use the sample quiz */ }
  return QUESTIONS;
}

// Topic name of the study kit the quiz came from (set by the Study page).
function storedTopic() {
  try { return sessionStorage.getItem("kelvra_topic") || ""; } catch { return ""; }
}

// Generated questions are tagged "Generated"; use the kit's real topic instead,
// so scores and mistakes are grouped by subject.
function topicOf(question) {
  if (question?.topic && question.topic !== "Generated") return question.topic;
  return storedTopic() || "General";
}

export default function QuizPage({ user }) {
  const navigate = useNavigate();
  const [questions] = useState(storedQuestions);
  const isSample = questions === QUESTIONS; // the built-in demo quiz is not saved to the notebook
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [buddyMsg, setBuddyMsg] = useState("");
  const [diffIndex, setDiffIndex] = useState(1);
  const [done, setDone] = useState(false);
  const [voiceOn, setVoiceOn] = useState(getVoiceEnabled());

  useEffect(() => {
    if (voiceOn && questions[qIndex]?.question) {
      setTimeout(() => speak(questions[qIndex].question), 300);
    }
    return () => stopSpeaking();
  }, [qIndex]);

  const q = questions[qIndex];
  const answered = answers[qIndex] !== undefined;
  const correct = answers[qIndex] === q.correct;
  const score = Object.entries(answers).filter(([i, a]) => questions[Number(i)].correct === a).length;
  const total = questions.length;

  const DIFF_COLORS = {
    Easy:   "bg-primary-container/10 text-primary border-primary/20",
    Medium: "bg-tertiary-container/20 text-tertiary-fixed-dim border-tertiary/20",
    Hard:   "bg-error-container/30 text-error border-error/20",
  };

  // Confidence check: pick an option, then say how sure you are, then see if it is right.
  const [pending, setPending] = useState(null);
  const [confidences, setConfidences] = useState({});
  const [hintLoading, setHintLoading] = useState(false);

  const pick = (id) => {
    if (answered) return;
    setPending(id);
  };

  const askHint = async () => {
    if (hintLoading) return;
    setHintLoading(true);
    try {
      setBuddyMsg(await getHint(q.question, topicOf(q)));
    } catch (err) {
      setBuddyMsg(err.message || "Could not get a hint right now.");
    } finally {
      setHintLoading(false);
    }
  };

  const answer = (id, confidence) => {
    if (answered) return;
    setPending(null);
    setAnswers({ ...answers, [qIndex]: id });
    setConfidences({ ...confidences, [qIndex]: confidence });
    if (user?.id && !isSample) saveConfidence(user.id, { topic: topicOf(q), confidence, correct: id === q.correct });
    setShowExplanation(true);
    if (voiceOn) {
      const prefix = id === q.correct ? "Correct!" : "Not quite.";
      setTimeout(() => speak(prefix + " " + q.explanation), 500);
    }
    if (id === q.correct) {
      setBuddyMsg(confidence === "guess" ? "Right! Was it really a guess? Revise it once and it becomes a sure mark." : "Great job! You're on fire 🔥");
      setDiffIndex(Math.min(diffIndex + 1, 2));
    } else {
      setBuddyMsg(confidence === "sure"
        ? "You were sure, but this one is wrong. These are the best mistakes to fix: read the explanation slowly. Added to the top of your notebook."
        : "Not quite — saved to your Mistake notebook 📖");
      if (user?.id && !isSample) {
        saveMistake(user.id, { question: q.question, options: q.options, correct: q.correct, chosen: id, explanation: q.explanation, topic: topicOf(q), confidence });
      }
      setDiffIndex(Math.max(diffIndex - 1, 0));
    }
    setTimeout(() => setBuddyMsg(""), 3000);
  };

  const next = async () => {
    setShowExplanation(false);
    if (qIndex < total - 1) {
      setQIndex(qIndex + 1);
    } else {
      setDone(true);
      // Save quiz score (non-blocking, works offline). The demo quiz is not saved.
      if (user?.id && !isSample) {
        try {
          const finalScore = Object.entries(answers).filter(([i, a]) => questions[Number(i)].correct === a).length;
          const topicName = topicOf(questions[0]);
          await saveQuizScore(user.id, topicName, finalScore, total);
          const pct = Math.round((finalScore / total) * 100);
          await awardXP(user.id, "COMPLETE_QUIZ", {}, user);
          if (pct === 100) await awardXP(user.id, "PERFECT_QUIZ", {}, user);
        } catch { /* never block UI */ }
      }
    }
  };

  const getOptionStyle = (id) => {
    if (!answered && pending === id) return "bg-secondary-container/20 border-2 border-secondary/60 cursor-pointer";
    if (!answered) return "bg-surface-container-low border border-outline-variant/10 hover:bg-surface-container-highest hover:border-primary-container/40 hover:translate-y-[-2px] cursor-pointer";
    if (id === q.correct) return "bg-primary-container/10 border-2 border-primary-container/60";
    if (id === answers[qIndex] && id !== q.correct) return "bg-error-container/10 border-2 border-error/40";
    return "bg-surface-container-low border border-outline-variant/10 opacity-50";
  };

  const getLetterStyle = (id) => {
    if (!answered) return "bg-surface-container-highest text-on-surface-variant group-hover:bg-primary-fixed/20 group-hover:text-primary-fixed";
    if (id === q.correct) return "bg-primary-container text-on-primary-container";
    if (id === answers[qIndex] && id !== q.correct) return "bg-error text-on-error";
    return "bg-surface-container-highest text-on-surface-variant";
  };

  // ── Results screen ──
  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <Sidebar active="quiz" />
        <main className="md:ml-64 min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-surface-container-low border border-outline-variant/10 rounded-3xl p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-primary-container/10 border-4 border-primary-container/20 flex items-center justify-center mx-auto mb-6">
              <span className="font-headline text-3xl font-extrabold text-primary-container">{pct}%</span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold mb-2">Quiz Complete!</h2>
            <p className="text-on-surface-variant mb-2">You got <span className="text-on-surface font-bold">{score} out of {total}</span> correct.</p>
            <p className="text-sm text-on-surface-variant mb-8">
              {pct >= 80 ? "Excellent work! Your knowledge is solid. 🌟" : pct >= 60 ? "Good effort! A bit more review will help. 📚" : "Keep going — practice makes perfect. 💪"}
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: "Correct",   val: score,         color: "text-primary-container" },
                { label: "Wrong",     val: total - score, color: "text-error" },
                { label: "Accuracy",  val: `${pct}%`,     color: "text-secondary" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-highest/40 rounded-xl p-4">
                  <div className={`text-2xl font-headline font-extrabold ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {(() => {
              const cal = calibrationSummary(Object.entries(confidences).map(([i, c]) => ({ confidence: c, correct: answers[i] === questions[Number(i)].correct })));
              const rows = LEVELS.filter((l) => cal.levels[l.id].count > 0);
              if (!rows.length) return null;
              return (
                <div className="mb-6 text-left bg-surface-container-highest/30 rounded-xl p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">How sure vs how right</p>
                  {rows.map((l) => (
                    <p key={l.id} className="text-sm text-on-surface-variant">
                      <strong className="text-on-surface">{l.label}:</strong> {cal.levels[l.id].correct} of {cal.levels[l.id].count} right
                    </p>
                  ))}
                  {cal.levels.sure.count > cal.levels.sure.correct && (
                    <p className="text-xs text-secondary mt-2">Your "sure but wrong" answers are at the top of your Mistake notebook. Fix those first.</p>
                  )}
                </div>
              );
            })()}
            {isSample && (
              <p className="text-xs text-on-surface-variant mb-4">
                This was the sample quiz, so it was not saved. Make a quiz from your own notes on the Study page.
              </p>
            )}
            <div className="flex flex-col gap-3">
              {!isSample && total - score > 0 && (
                <button onClick={() => navigate("/mistakes")}
                  className="w-full py-4 bg-error-container/15 border border-error/20 text-error font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">assignment_late</span>
                  Retest your {total - score} mistake{total - score === 1 ? "" : "s"}
                </button>
              )}
              <button onClick={() => navigate("/progress")}
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                View Full Insights
              </button>
              <button onClick={() => navigate("/focus")}
                className="w-full py-4 border border-outline-variant/30 text-on-surface-variant rounded-xl hover:bg-surface-container-highest transition-all font-medium">
                Start Focus Mode
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="quiz" />

      <main className="md:ml-64 min-h-screen bg-surface flex flex-col relative overflow-hidden">

        {/* Top stats bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-outline-variant/15 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex flex-col gap-1 w-full max-w-xs">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Live Score</span>
                  <span className="text-xs font-bold font-headline text-primary-fixed">{score}/{total} Correct</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-fixed to-primary-container transition-all duration-500"
                    style={{ width: `${(score / total) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full flex items-center gap-2 border text-[10px] font-bold uppercase tracking-tighter ${DIFF_COLORS[DIFFICULTY_CYCLE[diffIndex]]}`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                Difficulty: {DIFFICULTY_CYCLE[diffIndex]}
              </div>
              {isSpeechSupported() && (
                <button
                  onClick={() => {
                    const next = !voiceOn;
                    setVoiceOn(next);
                    setVoiceEnabled(next);
                    if (!next) stopSpeaking();
                    else speak("Voice buddy is on.");
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${
                    voiceOn
                      ? "bg-primary-container/10 border-primary-container/30 text-primary-container"
                      : "bg-surface-container-low border-outline-variant/20 text-on-surface-variant"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: voiceOn ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {voiceOn ? "volume_up" : "volume_off"}
                  </span>
                  {voiceOn ? "ON" : "OFF"}
                </button>
              )}
              <button onClick={() => navigate("/dashboard")}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-highest hover:bg-surface-bright transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
          </div>
        </header>

        {/* Quiz content */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 gap-8 max-w-5xl mx-auto w-full">

          {/* Question card */}
          <div className="w-full bg-surface-container-low rounded-[2rem] p-6 sm:p-8 lg:p-12 relative overflow-hidden border border-outline-variant/5">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => speak(q.question)}
                className="p-3 bg-surface-container-highest rounded-full text-primary-container hover:scale-110 transition-transform border border-outline-variant/10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings:"'FILL' 1" }}>volume_up</span>
              </button>
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-md bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase tracking-widest">
                Question {qIndex + 1} of {total}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-headline font-bold text-on-surface leading-tight pr-12">
                {q.question}
              </h2>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-fixed/5 blur-[80px] rounded-full pointer-events-none" />
          </div>

          {/* Options — single column on mobile, 2-col on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {q.options.map((opt) => (
              <button key={opt.id} onClick={() => pick(opt.id)} aria-pressed={pending === opt.id}
                className={`group p-5 sm:p-6 rounded-2xl flex items-center gap-4 text-left transition-all min-h-[64px] ${getOptionStyle(opt.id)}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-headline flex-shrink-0 transition-all ${getLetterStyle(opt.id)}`}>
                  {opt.id}
                </div>
                <p className="flex-1 text-on-surface font-medium text-sm leading-relaxed">{opt.text}</p>
                {answered && opt.id === q.correct && (
                  <span className="material-symbols-outlined text-primary-container flex-shrink-0">check_circle</span>
                )}
                {answered && opt.id === answers[qIndex] && opt.id !== q.correct && (
                  <span className="material-symbols-outlined text-error flex-shrink-0">cancel</span>
                )}
              </button>
            ))}
          </div>

          {/* Confidence check */}
          {pending && !answered && (
            <div className="w-full bg-surface-container-low border border-secondary/30 rounded-2xl p-4 sm:p-5" role="group" aria-label="How sure are you?">
              <p className="text-sm font-bold text-on-surface mb-3">How sure are you about <span className="text-secondary">{pending}</span>?</p>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => answer(pending, l.id)}
                    className="py-3 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-secondary/60 text-sm font-bold text-on-surface flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-secondary">{l.icon}</span>{l.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2">Be honest. Knowing what you really know is a skill top students train.</p>
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex flex-wrap w-full items-center justify-between gap-3 pt-2">
            <button
              onClick={askHint} disabled={answered || hintLoading}
              className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-fixed hover:border-primary-fixed/40 transition-all font-bold text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              {hintLoading ? "Thinking…" : "Ask AI for a hint"}
            </button>
            {answered && (
              <button onClick={next}
                className="px-8 py-3 bg-primary-fixed text-on-primary-fixed rounded-xl font-bold font-headline text-sm shadow-[0_4px_20px_rgba(128,249,200,0.2)] hover:scale-[1.05] active:scale-95 transition-transform">
                {qIndex < total - 1 ? "Next Question" : "See Results"}
              </button>
            )}
          </div>
        </section>

        {/* Explanation panel */}
        {showExplanation && (
          <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 px-6 pb-6">
            <div className="max-w-4xl mx-auto bg-surface-container-high/95 backdrop-blur-2xl rounded-t-[2rem] rounded-b-xl border border-outline-variant/20 p-5 sm:p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.4)] max-h-[50vh] overflow-y-auto">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-primary-fixed/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary-fixed text-2xl"
                    style={{ fontVariationSettings:"'FILL' 1" }}>psychology</span>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-headline font-bold text-lg ${correct ? "text-primary-fixed" : "text-error"}`}>
                      {correct ? "Correct! ✓" : "Not quite ✗"}
                    </h4>
                    <button onClick={() => setShowExplanation(false)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Buddy popup */}
        {buddyMsg && (
          <div className="fixed bottom-24 right-4 sm:bottom-32 sm:right-8 z-50 flex items-end gap-3">
            <div className="bg-primary-container text-on-primary-container px-6 py-4 rounded-3xl rounded-br-none shadow-2xl animate-bounce">
              <p className="text-sm font-bold">{buddyMsg}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center border-4 border-surface shadow-xl">
              <span className="material-symbols-outlined text-primary-container text-2xl"
                style={{ fontVariationSettings:"'FILL' 1" }}>smart_toy</span>
            </div>
          </div>
        )}
      </main>


      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}