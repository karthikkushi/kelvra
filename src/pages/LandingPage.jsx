import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/15">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold text-primary-container tracking-tighter font-headline">Kelvra</span>
            <div className="hidden md:flex gap-6">
              {["Features", "How it works", "Languages"].map((l) => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
                  className="text-on-surface-variant hover:text-on-surface transition-colors font-headline font-bold tracking-tight text-sm">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")}
              className="px-6 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest transition-all font-semibold text-sm">Try Free</button>
            <button onClick={() => navigate("/auth")}
              className="px-6 py-2 rounded-lg bg-primary-container text-on-primary-container font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg">Sign Up</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-24 min-h-screen">
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 border border-secondary-container/50 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">V1.0 Intelligent Engine</span>
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight text-on-surface mb-6">
              The AI that learns how{" "}
              <span className="text-primary-container">YOU</span>{" "}
              learn
            </h1>
            <p className="font-body text-lg md:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed">
              Paste notes. Upload PDFs. Type a topic. Get flashcards, quizzes, summaries — in any language. Your personal AI learning intelligence.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/10 w-full sm:w-fit">
              {["10,000+ students", "50+ languages", "Free forever"].map((s, i) => (
                <span key={s} className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-outline-variant/40" />}
                  <span className="text-on-surface font-bold">{s.split(" ")[0]}</span>{" "}
                  {s.split(" ").slice(1).join(" ")}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button onClick={() => navigate("/auth")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary-container text-on-primary-container font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.05] transition-transform shadow-2xl shadow-primary-container/20">
                Get Started Free
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-outline-variant/30 text-on-surface font-semibold text-base hover:bg-surface-container-low transition-all text-center">
                View Demo
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {["bg-primary-container","bg-secondary-container","bg-tertiary-container"].map((c,i) => (
                  <div key={i} className={`w-10 h-10 rounded-full ${c} border-2 border-background flex items-center justify-center text-xs font-bold text-on-primary-fixed`}>
                    {["A","B","C"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-on-surface-variant">
                Joined by <span className="text-on-surface font-bold">12,000+</span> life-long learners
              </p>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative z-10 bg-surface-container-highest/40 backdrop-blur-[20px] border border-outline-variant/20 rounded-3xl p-4 shadow-[0_32px_64px_rgba(0,0,0,0.4)] rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden aspect-[4/3] flex flex-col">
                <div className="h-10 border-b border-outline-variant/10 flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                  </div>
                  <div className="mx-auto bg-surface-container-high px-4 py-1 rounded-md text-[10px] text-on-surface-variant font-mono">kelvra.ai/dashboard</div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-4">
                  <div className="h-6 w-3/4 bg-surface-container-highest rounded-md" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-surface-container-low rounded-xl border border-outline-variant/10 p-4">
                      <div className="w-8 h-8 rounded-lg bg-primary-container/10 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-primary-container text-sm">style</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded" />
                    </div>
                    <div className="h-24 bg-surface-container-low rounded-xl border border-outline-variant/10 p-4">
                      <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-tertiary text-sm">quiz</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded" />
                    </div>
                  </div>
                  <div className="h-32 bg-primary-container/5 rounded-xl border border-primary-container/10 p-4 relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-primary-container/20 blur-3xl rounded-full" />
                    <div className="text-[10px] text-primary-container font-bold uppercase mb-2">AI Insights</div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-primary-container/20 rounded" />
                      <div className="h-1.5 w-5/6 bg-primary-container/20 rounded" />
                      <div className="h-1.5 w-4/6 bg-primary-container/20 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-4 sm:px-6 md:px-12 lg:px-24 py-24 bg-surface-container-low/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-4">How Kelvra works</h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto">From raw notes to a complete study kit in seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: "edit_note",     title: "Add your content",          desc: "Paste your lecture notes, type any topic, upload a PDF or image — in any language." },
              { step: "02", icon: "auto_awesome",  title: "AI generates your kit",     desc: "Kelvra instantly creates flashcards, a multiple-choice quiz, a summary, and a 5-day study plan." },
              { step: "03", icon: "school",        title: "Study smarter",             desc: "Use spaced repetition, voice buddy read-aloud, and focus mode to lock in knowledge faster." },
            ].map((s) => (
              <div key={s.step} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-headline text-4xl font-extrabold text-primary-container/20">{s.step}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-container text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">{s.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section id="features" className="px-4 sm:px-6 md:px-12 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mb-16">
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-4">Precision tools for the modern mind</h2>
            <p className="text-on-surface-variant text-lg">Engineered to adapt to your cognitive rhythm.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 flex flex-col justify-between hover:bg-surface-container transition-colors relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary-container text-2xl">settings_voice</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3">AI Voice Buddy</h3>
                <p className="text-on-surface-variant max-w-md leading-relaxed">Reads flashcard answers and quiz questions aloud using your browser's speech engine. Like a real tutor, not just a tool.</p>
              </div>
              <div className="mt-8 flex gap-2">
                <div className="h-1 w-8 bg-primary-container rounded-full" />
                <div className="h-1 w-2 bg-primary-container/30 rounded-full" />
                <div className="h-1 w-2 bg-primary-container/30 rounded-full" />
              </div>
              <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-64 h-64 bg-primary-container/5 blur-3xl" />
            </div>
            <div className="md:col-span-4 bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-2xl">analytics</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3">Weak Spot Detector</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Tracks every wrong answer and shows which topics need more attention.</p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <div className="flex items-end gap-1 h-12">
                  {[40,70,30,90,55,75].map((h,i) => (
                    <div key={i} className={`w-full rounded-t ${i % 2 === 1 ? "bg-primary-container" : "bg-surface-container-highest"}`} style={{height:`${h}%`}} />
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-2xl">translate</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3">Any Language</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Upload in Tamil, Hindi, Arabic, Spanish — get flashcards back in any language.</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-8">
                {["हिन्दी","தமிழ்","العربية","Español","Français","日本語"].map((l) => (
                  <span key={l} className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant">{l}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 bg-surface-container-low border border-outline-variant/15 rounded-3xl p-8 flex items-center gap-10 group overflow-hidden">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-on-background/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-surface text-2xl">center_focus_strong</span>
                </div>
                <h3 className="font-headline text-2xl font-bold mb-3">Focus Mode</h3>
                <p className="text-on-surface-variant leading-relaxed">Pomodoro timer + ambient sounds (rain, cafe, library, lo-fi). Zero distractions, deep work instantly.</p>
              </div>
              <div className="hidden md:flex w-1/3 items-center justify-center">
                <div className="aspect-square w-32 bg-surface-container-highest rounded-full border-4 border-outline-variant/10 flex items-center justify-center relative">
                  <div className="absolute inset-2 border-2 border-primary-container/20 rounded-full border-dashed animate-spin" style={{animationDuration:"10s"}} />
                  <span className="material-symbols-outlined text-primary-container text-4xl">timer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-24 py-24 bg-surface-container-low/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-3">See what Kelvra generates</h2>
            <p className="text-on-surface-variant">A sample output from the topic: "Photosynthesis"</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Sample flashcard */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary-container text-sm" style={{fontVariationSettings:"'FILL' 1"}}>style</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Flashcard example</span>
              </div>
              <p className="font-headline text-lg font-bold text-on-surface mb-3">What is the primary pigment in photosynthesis?</p>
              <div className="bg-surface-container-high border border-primary-container/20 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container block mb-1">Answer</span>
                <p className="text-on-surface text-sm">Chlorophyll — specifically chlorophyll-a absorbs red and blue light and converts it to chemical energy via the light-dependent reactions.</p>
              </div>
            </div>
            {/* Sample quiz question */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>quiz</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Quiz question example</span>
              </div>
              <p className="font-headline text-base font-bold text-on-surface mb-4">Where do the light-dependent reactions of photosynthesis occur?</p>
              <div className="space-y-2">
                {["A) Stroma of the chloroplast","B) Thylakoid membrane ✓","C) Cytoplasm","D) Mitochondria"].map((o, i) => (
                  <div key={i} className={`px-4 py-2 rounded-lg text-sm ${i === 1 ? "bg-primary-container/10 border border-primary-container/40 text-primary-container font-bold" : "bg-surface-container-highest/40 text-on-surface-variant"}`}>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-6 md:px-12 lg:px-24 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-3">Students love Kelvra</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", role: "MBBS Student", quote: "I used to spend 3 hours making flashcards. Now it takes 30 seconds. My exam prep is completely transformed." },
              { name: "James O.", role: "Computer Science",  quote: "The quiz generation is incredible. It asks questions I never thought to ask myself — and that's exactly what exams do." },
              { name: "Sofia M.", role: "Law School",  quote: "I study in Spanish but my notes are in English. The language feature is genuinely magic. Nothing else does this." },
            ].map((t) => (
              <div key={t.name} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className="text-primary-container text-sm">★</span>
                  ))}
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-on-surface text-sm">{t.name}</p>
                  <p className="text-on-surface-variant text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-2xl mx-auto">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-8">Ready to upgrade your intellect?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/auth")}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary-container text-on-primary-container font-extrabold text-xl shadow-xl shadow-primary-container/20 hover:scale-[1.03] transition-transform">
              Create My Free Account
            </button>
            <p className="text-on-surface-variant text-sm font-medium">No credit card required.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-8 border-t border-outline-variant/10 bg-background">
        <div className="flex flex-col items-center gap-4 px-8">
          <div className="flex flex-wrap justify-center gap-8 mb-2">
            {["Privacy Policy","Terms of Service","Contact Support"].map((l) => (
              <a key={l} href="#" className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors">{l}</a>
            ))}
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant text-center">© 2025 Kelvra. Intelligence that grows with you.</p>
        </div>
      </footer>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
