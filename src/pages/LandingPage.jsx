import { useNavigate } from "react-router-dom";

const filled = { fontVariationSettings: "'FILL' 1" };

const STEPS = [
  { icon: "upload_file",  title: "Add your material",   desc: "Paste notes, type a topic, or upload a PDF, a photo of a textbook page, or handwritten notes." },
  { icon: "auto_awesome", title: "Get your study kit",  desc: "Kelvra makes flashcards, a quiz, a summary and a 5-day plan from your own material." },
  { icon: "diversity_3",  title: "Grow with a mentor",  desc: "Your AI mentor reads your scores and exam date, then tells you what to do next and why it matters." },
];

const FEATURES = [
  { icon: "style",             title: "Flashcards",        desc: "Made from your notes. Flip, review, and save sets to study offline." },
  { icon: "quiz",              title: "Quizzes",           desc: "Multiple-choice questions with an explanation after every answer." },
  { icon: "summarize",         title: "Summaries",         desc: "Long notes turned into short paragraphs and key points." },
  { icon: "psychology",        title: "Socratic tutor",    desc: "Answers your questions with questions, so you work it out yourself." },
  { icon: "smart_toy",         title: "Study agents",      desc: "A planner, a progress tracker, a review coach and an exam-readiness check." },
  { icon: "translate",         title: "10 languages",      desc: "Get material in English, Hindi, Tamil, Arabic, Spanish and more." },
  { icon: "draw",              title: "Handwriting & photos", desc: "Snap a page or your handwritten notes and turn them into text." },
  { icon: "cloud_off",         title: "Works offline",     desc: "Your progress and saved cards open without internet and sync later." },
];

const MENTOR_POINTS = [
  { icon: "insights",       text: "Knows your real quiz scores, streak and exam date" },
  { icon: "public",         text: "Shows where a topic is used in real life and in jobs" },
  { icon: "flag",           text: "Sets 3 small goals each week and checks them off with you" },
  { icon: "favorite",       text: "Honest when you're behind, and helps you get back on track" },
];

const FAQS = [
  { q: "Is Kelvra free?", a: "Yes, you can sign up and use every feature without paying or adding a card." },
  { q: "Which subjects work?", a: "Any subject you have notes for: school, college, competitive exams, languages or professional skills. If you can paste it, photograph it or upload it as a PDF, Kelvra can study it with you." },
  { q: "What does the AI mentor actually do?", a: "It looks at your quiz scores, weak topics, study streak and exam date, then gives practical advice: a plan for the week, how a topic is used in the real world, career ideas, or help when you feel stuck. It is an AI, so check important facts like exam rules with your teacher." },
  { q: "Does it work without internet?", a: "Partly. Your dashboard, progress, saved flashcards and goals open offline, and anything you change is saved and synced when you reconnect. Making new material with AI needs internet." },
  { q: "Who can see my notes and scores?", a: "Only you. Your study data is stored under your account and protected by database security rules. A study kit becomes public only if you choose to share its link." },
];

function HeroPreview() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-6 bg-primary-container/10 blur-3xl rounded-full" />
      <div className="relative bg-surface-container-low border border-outline-variant/15 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/10">
          <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary-container/60" />
          <span className="ml-2 text-[10px] uppercase tracking-widest text-on-surface-variant">Your study kit · Photosynthesis</span>
        </div>
        <div className="bg-surface-container rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary-container text-sm">style</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Flashcard 1 of 8</span>
          </div>
          <p className="text-sm font-medium text-on-surface">Where in the plant cell does photosynthesis happen?</p>
          <p className="text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-variant/10">
            In the chloroplasts: light reactions in the thylakoids, the Calvin cycle in the stroma.
          </p>
        </div>
        <div className="bg-surface-container rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary text-sm">quiz</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Quiz</span>
          </div>
          <p className="text-sm font-medium text-on-surface mb-2">What powers the Calvin cycle directly?</p>
          <div className="grid grid-cols-2 gap-2">
            {["Glucose", "ATP + NADPH", "CO₂", "Water"].map((o, i) => (
              <div key={o} className={`text-xs px-3 py-2 rounded-lg ${i === 1 ? "bg-primary-container/20 text-primary-container border border-primary-container/30" : "bg-surface-container-low text-on-surface-variant"}`}>{o}</div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-primary-container/15 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary-container text-xs" style={filled}>diversity_3</span>
          </div>
          <div className="bg-surface-container rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-on-surface-variant">
            You scored 55% on <strong className="text-on-surface">Calvin cycle</strong>. Food scientists use it to grow better crops. Let's do 2 short quizzes today?
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const start = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background text-on-background font-body overflow-x-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-primary-container/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-sm" style={filled}>auto_awesome</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter text-on-surface">Kelvra</span>
          </a>
          <div className="hidden md:flex items-center gap-7 text-sm text-on-surface-variant">
            <a href="#how" className="hover:text-on-surface transition-colors">How it works</a>
            <a href="#mentor" className="hover:text-on-surface transition-colors">Mentor</a>
            <a href="#features" className="hover:text-on-surface transition-colors">Features</a>
            <a href="#faq" className="hover:text-on-surface transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={start} className="hidden sm:block text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">Sign in</button>
            <button onClick={start}
              className="bg-primary-container text-on-primary-container font-bold px-4 sm:px-5 py-2.5 rounded-full text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary-container/20">
              Get started
            </button>
          </div>
        </div>
      </nav>

      <main id="top">
        {/* Hero */}
        <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-container/10 border border-primary-container/20 px-3.5 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="text-primary-container text-[11px] font-bold uppercase tracking-widest">New: your own AI mentor</span>
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-on-surface leading-[1.05] mb-5">
              Your notes in.<br />
              <span className="text-primary-container">A study kit and a mentor out.</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Upload a PDF, a photo or your handwritten notes. Kelvra turns them into flashcards, a quiz, a summary and a plan,
              then a mentor helps you stay on track until exam day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button onClick={start}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-headline font-bold px-7 py-4 rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(110,231,183,0.2)]">
                Start studying free
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <a href="#how"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-outline-variant/30 text-on-surface-variant px-7 py-4 rounded-2xl hover:bg-surface-container-low transition-all font-medium">
                See how it works
              </a>
            </div>
            <p className="text-xs text-on-surface-variant/70 mt-5">No credit card · 10 languages · Installs on your phone</p>
          </div>
          <HeroPreview />
        </section>

        {/* How it works */}
        <section id="how" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">How it works</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">Three steps, every day</h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-7 hover:border-primary-container/20 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 bg-surface-container-highest rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container">{s.icon}</span>
                  </span>
                  <span className="text-xs font-bold text-primary-container">Step {i + 1}</span>
                </div>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{s.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Mentor */}
        <section id="mentor" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-3xl p-6 sm:p-10 md:p-12 grid lg:grid-cols-2 gap-10 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">AI Mentor</span>
              <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3 mb-4">
                Like a senior who has been there
              </h2>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Most study apps stop at flashcards. Kelvra's mentor looks at how you are really doing and connects what you study to the real world.
              </p>
              <ul className="space-y-3 mb-8">
                {MENTOR_POINTS.map((p) => (
                  <li key={p.text} className="flex items-start gap-3 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-primary-container text-lg" style={filled}>{p.icon}</span>
                    {p.text}
                  </li>
                ))}
              </ul>
              <button onClick={start} className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl hover:scale-[1.02] transition-all text-sm">
                Meet your mentor →
              </button>
            </div>
            <div className="relative space-y-3 text-sm" aria-label="Example conversation">
              <div className="flex justify-end">
                <p className="max-w-[85%] bg-primary-container text-on-primary-container px-4 py-3 rounded-2xl rounded-tr-sm">
                  Why do I even need to learn derivatives?
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-full bg-primary-container/15 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary-container text-sm" style={filled}>diversity_3</span>
                </span>
                <div className="max-w-[85%] bg-surface-container border border-outline-variant/10 px-4 py-3 rounded-2xl rounded-tl-sm text-on-surface-variant space-y-2">
                  <p>Fair question. A derivative measures <strong className="text-on-surface">how fast something changes</strong>:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Car speed is the derivative of distance.</li>
                    <li>Engineers use it to find the strongest, lightest beam.</li>
                    <li>Data scientists use it to train every AI model.</li>
                  </ul>
                  <p>Your last quiz on it was 58%, and your exam is in 12 days. Want a 20-minute practice plan for today?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">Everything in one place</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">Built for real exam prep</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-primary-container/20 hover:-translate-y-0.5 transition-all">
                <span className="w-11 h-11 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary-container" style={filled}>{f.icon}</span>
                </span>
                <h3 className="font-headline font-bold text-on-surface mb-1.5">{f.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">FAQ</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-3">Common questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 open:border-primary-container/20">
                <summary className="font-headline font-bold text-on-surface cursor-pointer list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                </summary>
                <p className="text-on-surface-variant text-sm leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="bg-surface-container-low border border-primary-container/10 rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-4">Your next exam starts today</h2>
              <p className="text-on-surface-variant text-lg mb-8 max-w-xl mx-auto">Turn tonight's notes into a study kit, and let your mentor plan the rest.</p>
              <button onClick={start}
                className="group inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-headline font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_50px_rgba(110,231,183,0.2)]">
                Create my free account
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant/10 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-xs" style={filled}>auto_awesome</span>
            </div>
            <span className="font-headline font-bold text-on-surface tracking-tighter">Kelvra</span>
          </div>
          <p className="text-xs text-on-surface-variant">© {new Date().getFullYear()} Kelvra · Made for students everywhere</p>
          <div className="flex gap-5 text-xs text-on-surface-variant">
            <a href="/privacy" className="hover:text-primary-container">Privacy</a>
            <a href="/terms" className="hover:text-primary-container">Terms</a>
          </div>
        </div>
      </footer>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}html{scroll-behavior:smooth}`}</style>
    </div>
  );
}
