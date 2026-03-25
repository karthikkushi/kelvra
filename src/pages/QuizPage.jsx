import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import { saveQuizScore } from "../utils/supabase";

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

// TTS helper
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find((v) => v.lang.startsWith("en"));
  if (englishVoice) utter.voice = englishVoice;
  window.speechSynthesis.speak(utter);
}

function getVoiceEnabled() {
  try { return localStorage.getItem("kelvra_voice") === "true"; } catch { return false; }
}

// Normalize generated quiz options {A: text} → [{id: "A", text}]
function normalizeQuestions(qs) {
  return qs.map((q) => ({
    ...q,
    options: Array.isArray(q.options)
      ? q.options
      : Object.entries(q.options).map(([id, text]) => ({ id, text })),
  }));
}

export default function QuizPage({ user }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(QUESTIONS);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [buddyMsg, setBuddyMsg] = useState("");
  const [diffIndex, setDiffIndex] = useState(1);
  const [done, setDone] = useState(false);

  // Load from sessionStorage if available
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("kelvra_quiz");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(normalizeQuestions(parsed));
        }
      }
    } catch (_) {}
  }, []);

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

  const answer = (id) => {
    if (answered) return;
    setAnswers({ ...answers, [qIndex]: id });
    setShowExplanation(true);
    if (id === q.correct) {
      setBuddyMsg("Great job! You're on fire 🔥");
      setDiffIndex(Math.min(diffIndex + 1, 2));
    } else {
      setBuddyMsg("Not quite — read the explanation 📖");
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
      // Save quiz score to Supabase (non-blocking)
      if (user?.id) {
        try {
          const finalScore = Object.entries(answers).filter(([i, a]) => questions[Number(i)].correct === a).length;
          const topicName = questions[0]?.topic || "Quiz";
          await saveQuizScore(user.id, topicName, finalScore, total);
        } catch (_) { /* never block UI */ }
      }
    }
  };

  const getOptionStyle = (id) => {
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
      <div className="dark min-h-screen bg-background text-on-surface font-body">
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
            <div className="flex flex-col gap-3">
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
    <div className="dark min-h-screen bg-background text-on-surface font-body">
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
          <div className="w-full bg-surface-container-low rounded-[2rem] p-8 lg:p-12 relative overflow-hidden border border-outline-variant/5">
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
              <h2 className="text-2xl lg:text-3xl font-headline font-bold text-on-surface leading-tight pr-12">
                {q.question}
              </h2>
            </div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-fixed/5 blur-[80px] rounded-full pointer-events-none" />
          </div>

          {/* Options — single column on mobile, 2-col on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            {q.options.map((opt) => (
              <button key={opt.id} onClick={() => answer(opt.id)}
                className={`group p-6 rounded-2xl flex items-center gap-4 text-left transition-all ${getOptionStyle(opt.id)}`}>
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

          {/* Bottom actions */}
          <div className="flex w-full items-center justify-between pt-2">
            <button
              onClick={() => setBuddyMsg("Here's a hint: think about what makes this concept unique compared to similar ones.")}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-outline-variant/20 text-on-surface-variant hover:text-primary-fixed hover:border-primary-fixed/40 transition-all font-bold text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">lightbulb</span>
              Ask AI for a hint
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
            <div className="max-w-4xl mx-auto bg-surface-container-high/95 backdrop-blur-2xl rounded-t-[2rem] rounded-b-xl border border-outline-variant/20 p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
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
          <div className="fixed bottom-32 right-8 z-50 flex items-end gap-3">
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

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-lg border-t border-outline-variant/10 z-50 px-6 py-3 flex justify-between items-center"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon:"dashboard", path:"/dashboard" },
          { icon:"menu_book", path:"/study" },
          { icon:"style",     path:"/flashcards" },
          { icon:"quiz",      path:"/quiz", active:true },
          { icon:"insights",  path:"/progress" },
        ].map((item) => (
          <span key={item.icon} onClick={() => navigate(item.path)}
            className={`material-symbols-outlined cursor-pointer ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}
            style={item.active ? { fontVariationSettings:"'FILL' 1" } : {}}>
            {item.icon}
          </span>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}