import { useNavigate } from "react-router-dom";

const STATS = [
  { value: "10,000+", label: "Students" },
  { value: "50+",     label: "Languages" },
  { value: "4",       label: "AI Agents" },
  { value: "Free",    label: "Forever plan" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "upload_file",
    title: "Add your material",
    desc: "Paste notes, type a topic, upload a PDF or photo of your textbook. Any format works.",
  },
  {
    step: "02",
    icon: "auto_awesome",
    title: "AI builds your study kit",
    desc: "In seconds, Kelvra generates flashcards, a quiz, a summary and a personalized 5-day study plan.",
  },
  {
    step: "03",
    icon: "trending_up",
    title: "Study smarter every day",
    desc: "Your AI coach tracks progress, finds weak spots and tells you exactly what to study next.",
  },
];

const FEATURES = [
  {
    icon: "style",
    title: "AI Flashcards",
    desc: "Auto-generated from any content. Flip, rate, repeat. Spaced repetition built in.",
    color: "text-primary-container",
    bg: "bg-primary-container/10",
  },
  {
    icon: "quiz",
    title: "Adaptive Quiz",
    desc: "MCQ quizzes that get harder as you improve. Instant explanations after every answer.",
    color: "text-secondary",
    bg: "bg-secondary-container/20",
  },
  {
    icon: "summarize",
    title: "Smart Summary",
    desc: "Dense notes distilled into clear paragraphs and key bullet points in seconds.",
    color: "text-tertiary-fixed-dim",
    bg: "bg-tertiary-container/20",
  },
  {
    icon: "calendar_today",
    title: "Study Plan",
    desc: "5-day personalized plan built from your material. Day-by-day tasks and time estimates.",
    color: "text-primary-container",
    bg: "bg-primary-container/10",
  },
  {
    icon: "record_voice_over",
    title: "Voice Buddy",
    desc: "AI reads your flashcards and quiz questions aloud. Study hands-free, eyes-free.",
    color: "text-secondary",
    bg: "bg-secondary-container/20",
  },
  {
    icon: "translate",
    title: "10+ Languages",
    desc: "Generate study materials in Hindi, Tamil, Arabic, Spanish and more. Study in your language.",
    color: "text-tertiary-fixed-dim",
    bg: "bg-tertiary-container/20",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    role: "NEET Aspirant, Chennai",
    avatar: "P",
    avatarBg: "bg-primary-container/20 text-primary-container",
    text: "I used to spend 3 hours making flashcards manually. Kelvra does it in 10 seconds. My Biology scores went from 65% to 89% in one month.",
    stars: 5,
  },
  {
    name: "Arjun M.",
    role: "B.Tech CSE, Bangalore",
    avatar: "A",
    avatarBg: "bg-secondary-container/30 text-secondary",
    text: "The AI quiz is scary good. It found my exact weak spots in Data Structures and kept drilling me on them. Cleared my semester with 9.1 CGPA.",
    stars: 5,
  },
  {
    name: "Fatima K.",
    role: "CA Intermediate Student",
    avatar: "F",
    avatarBg: "bg-tertiary-container/20 text-tertiary-fixed-dim",
    text: "I upload my CA study material as PDF and get a full study kit in seconds. The voice buddy reads everything aloud while I cook. Life changing.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "Is Kelvra really free?",
    a: "Yes. The core features — AI flashcards, quiz, summary, study plan — are completely free. No credit card needed.",
  },
  {
    q: "What subjects does Kelvra support?",
    a: "All of them. NEET, JEE, CA, UPSC, engineering, law, languages — if you can paste or upload the content, Kelvra can study it.",
  },
  {
    q: "How is Kelvra different from Anki or Quizlet?",
    a: "Those tools require you to manually create cards. Kelvra generates everything from your own material automatically using AI — flashcards, quiz, summary and study plan all at once.",
  },
  {
    q: "Does it work in Hindi and Tamil?",
    a: "Yes. You can input content in any language and get study materials output in Hindi, Tamil, Arabic, Spanish and 7 more languages.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-background font-body overflow-x-hidden">

      {/* ── Background blobs ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter text-on-surface">Kelvra</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="hidden sm:block text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-primary-container text-on-primary-container font-bold px-5 py-2.5 rounded-full text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary-container/20">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/20 px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <span className="text-primary-container text-xs font-bold uppercase tracking-widest">AI-Powered Study Companion</span>
        </div>

        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-on-surface leading-[1.05] mb-6">
          Study Smarter.<br />
          <span className="text-primary-container">Not Harder.</span>
        </h1>

        <p className="text-on-surface-variant text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your notes or upload a PDF. Kelvra's AI instantly creates flashcards, a quiz, a summary and a personalized study plan — in any language.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate("/auth")}
            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-primary-container text-on-primary-container font-headline font-bold px-8 py-4 rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(110,231,183,0.2)]">
            Start Studying Free
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline-variant/30 text-on-surface-variant px-8 py-4 rounded-2xl text-base hover:bg-surface-container-low transition-all font-medium">
            <span className="material-symbols-outlined text-sm">play_circle</span>
            See how it works
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-4 text-center">
              <div className="font-headline text-2xl font-extrabold text-primary-container">{s.value}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">How it works</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">
            From notes to mastery<br />in 3 steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary-container/30 to-transparent" />

          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 text-center hover:border-primary-container/20 transition-all group">
              <div className="absolute -top-3 left-8 bg-primary-container/10 border border-primary-container/20 px-3 py-1 rounded-full">
                <span className="text-primary-container text-xs font-bold">{step.step}</span>
              </div>
              <div className="w-14 h-14 bg-surface-container-highest rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-container/10 transition-colors">
                <span className="material-symbols-outlined text-primary-container text-2xl">{step.icon}</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-on-surface mb-3">{step.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">Everything you need</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">
            One app. Every study tool.<br />Powered by AI.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-7 hover:border-primary-container/20 hover:translate-y-[-2px] transition-all group">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                <span className={`material-symbols-outlined ${f.color} text-2xl`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
              </div>
              <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{f.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO SECTION ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/5 blur-[100px] rounded-full" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">Live example</span>
              <h2 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mt-3 mb-4">
                Try it on<br />"Photosynthesis"
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                We typed "Photosynthesis" into Kelvra. In 8 seconds it generated 8 flashcards, 6 quiz questions, a 3-paragraph summary, and a 5-day study plan. Here's what it made:
              </p>
              <button onClick={() => navigate("/auth")}
                className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all text-sm">
                Generate your own →
              </button>
            </div>
            {/* Sample output preview */}
            <div className="space-y-3">
              <div className="bg-surface-container-highest/50 rounded-xl p-4 border border-primary-container/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary-container text-sm">style</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Flashcard 1 of 8</span>
                </div>
                <p className="text-sm font-medium text-on-surface">What is the primary site of photosynthesis in a plant cell?</p>
                <div className="mt-2 pt-2 border-t border-outline-variant/10">
                  <p className="text-xs text-on-surface-variant">The chloroplast — specifically the thylakoid membranes for light reactions and the stroma for the Calvin cycle.</p>
                </div>
              </div>
              <div className="bg-surface-container-highest/50 rounded-xl p-4 border border-outline-variant/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-sm">quiz</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Quiz Question</span>
                </div>
                <p className="text-sm font-medium text-on-surface">Which molecule is the direct energy source for the Calvin cycle?</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["A) Glucose", "B) ATP + NADPH", "C) CO₂", "D) H₂O"].map((o, i) => (
                    <div key={i} className={`text-xs px-3 py-2 rounded-lg ${i === 1 ? "bg-primary-container/20 text-primary-container border border-primary-container/30" : "bg-surface-container-low text-on-surface-variant"}`}>
                      {o}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">Student stories</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">
            Students love Kelvra
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-7 hover:border-primary-container/20 transition-all">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-primary-container text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center font-bold text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{t.name}</p>
                  <p className="text-xs text-on-surface-variant">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">FAQ</span>
          <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">
            Common questions
          </h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-primary-container/20 transition-all">
              <h3 className="font-headline font-bold text-on-surface mb-2">{faq.q}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="bg-surface-container-low border border-primary-container/10 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
              Ready to study smarter?
            </h2>
            <p className="text-on-surface-variant text-lg mb-8 max-w-xl mx-auto">
              Join students who are already using AI to study faster, retain more and score higher.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="group inline-flex items-center gap-3 bg-primary-container text-on-primary-container font-headline font-bold px-10 py-5 rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(110,231,183,0.2)]">
              Start for free — no credit card
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <p className="text-on-surface-variant/50 text-xs mt-4 uppercase tracking-widest">Free forever · No credit card · Setup in 30 seconds</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-outline-variant/10 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <span className="font-headline font-bold text-on-surface tracking-tighter">Kelvra</span>
          </div>
          <p className="text-xs text-on-surface-variant">© 2025 Kelvra. Built with ❤️ for students everywhere.</p>
          <div className="flex gap-6 text-xs text-on-surface-variant">
            <a href="#" className="hover:text-primary-container transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-container transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-container transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
