import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SOUNDS = [
  { id: "rain",    icon: "rainy",         label: "Rain" },
  { id: "cafe",    icon: "coffee",        label: "Cafe" },
  { id: "library", icon: "local_library", label: "Library" },
  { id: "lofi",    icon: "radio",         label: "Lo-fi" },
];

const QUOTES = [
  "Small progress is still progress.",
  "The expert was once a beginner.",
  "Focus is the art of knowing what to ignore.",
  "Every master was once a disaster.",
  "Learning is not a destination, it's a journey.",
  "You don't have to be great to start, but you have to start to be great.",
];

const STUDY_MINS = 25;
const BREAK_MINS = 5;

export default function FocusPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("study"); // "study" | "break"
  const [seconds, setSeconds] = useState(STUDY_MINS * 60);
  const [running, setRunning] = useState(false);
  const [volume, setVolume] = useState(65);
  const [activeSound, setActiveSound] = useState("library");
  const [quote] = useState(() => {return QUOTES[Math.floor(Math.random() * QUOTES.length)];});
  const [sessions, setSessions] = useState(0);

  const intervalRef = useRef(null);
  const totalSecs = mode === "study" ? STUDY_MINS * 60 : BREAK_MINS * 60;

  // Timer logic
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "study") {
              setSessions((prev) => prev + 1);
              setMode("break");
              setSeconds(BREAK_MINS * 60);
            } else {
              setMode("study");
              setSeconds(STUDY_MINS * 60);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode]);

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setSeconds(m === "study" ? STUDY_MINS * 60 : BREAK_MINS * 60);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(mode === "study" ? STUDY_MINS * 60 : BREAK_MINS * 60);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = ((totalSecs - seconds) / totalSecs) * 289;
  const circumference = 289;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body flex flex-col items-center justify-between relative overflow-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-container/5 blur-[150px]" />
      </div>

      {/* Top nav */}
      <header className="w-full flex justify-between items-center px-4 sm:px-10 py-5 sm:py-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.5)]" />
          <span className="text-on-surface-variant font-label text-sm uppercase tracking-[0.2em]">
            Studying: Organic Chemistry
          </span>
        </div>
        <div className="flex items-center gap-6">
          {/* Sessions completed */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary-container text-sm">timer</span>
            <span className="text-xs font-bold text-on-surface-variant">{sessions} sessions</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30 transition-all duration-300">
            <span className="font-label text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Exit Focus
            </span>
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </header>

      {/* Main timer */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 relative gap-10">

        {/* Timer ring */}
        <div className="relative flex items-center justify-center w-[290px] h-[290px] sm:w-[340px] sm:h-[340px] md:w-[440px] md:h-[440px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle className="text-surface-variant/20" cx="50" cy="50" fill="transparent"
              r="46" stroke="currentColor" strokeWidth="1.5" />
            {/* Progress ring */}
            <circle
              cx="50" cy="50" fill="transparent" r="46"
              stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference - progress}`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>

          {/* Timer content */}
          <div className="text-center z-10 flex flex-col items-center gap-6">
            <div>
              <div className="text-[10px] font-label uppercase tracking-[0.3em] text-on-surface-variant mb-2">
                {mode === "study" ? "Focus Time" : "Break Time"}
              </div>
              <h1 className="font-headline font-bold text-[5rem] sm:text-[7rem] md:text-[9rem] tracking-tighter leading-none text-on-surface">
                {fmt(seconds)}
              </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="flex items-center justify-center w-14 h-14 rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-variant/40 transition-all">
                <span className="material-symbols-outlined text-2xl">refresh</span>
              </button>
              <button
                onClick={() => setRunning(!running)}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-container text-on-primary-fixed hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(110,231,183,0.3)]">
                <span className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {running ? "pause" : "play_arrow"}
                </span>
              </button>
              <button
                onClick={() => switchMode(mode === "study" ? "break" : "study")}
                className="flex items-center justify-center w-14 h-14 rounded-full border border-outline-variant/30 text-on-surface hover:bg-surface-variant/40 transition-all">
                <span className="material-symbols-outlined text-2xl">skip_next</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-xl">
          {["study", "break"].map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-10 py-3 rounded-xl font-headline font-semibold text-sm transition-all ${
                mode === m
                  ? "bg-surface-container-highest text-primary-container shadow-lg"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}>
              {m === "study" ? "Study" : "Break"}
            </button>
          ))}
        </div>

        {/* Pomodoro dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${
              i < sessions % 4 ? "bg-primary-container" : "bg-surface-container-highest"
            }`} />
          ))}
          <span className="text-xs text-on-surface-variant font-label ml-2">
            {sessions} of 4 sessions
          </span>
        </div>
      </main>

      {/* Bottom panel */}
      <footer className="w-full flex flex-col items-center gap-6 pb-10 sm:pb-12 px-4 sm:px-6 z-50">

        {/* Ambient sound panel */}
        <div className="bg-surface-container-highest/40 backdrop-blur-[20px] px-4 sm:px-8 py-5 rounded-[2rem] flex flex-col sm:flex-row sm:flex-wrap items-center gap-6 sm:gap-8 border border-outline-variant/10 shadow-xl w-full sm:w-auto">
          <div className="flex items-center gap-4">
            {SOUNDS.map((s) => (
              <button key={s.id} onClick={() => setActiveSound(s.id)}
                className="flex flex-col items-center gap-2 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  activeSound === s.id
                    ? "bg-primary-container/20 text-primary-container border border-primary-container/20"
                    : "bg-surface-container-highest/60 text-on-surface-variant group-hover:bg-primary-container/10 group-hover:text-primary-container"
                }`}>
                  <span className="material-symbols-outlined">{s.icon}</span>
                </div>
                <span className={`font-label text-[10px] uppercase tracking-widest transition-colors ${
                  activeSound === s.id ? "text-primary-container" : "text-on-surface-variant group-hover:text-primary-container"
                }`}>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-outline-variant/20 hidden md:block" />

          {/* Volume slider */}
          <div className="flex items-center gap-3 w-full sm:w-44">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">volume_down</span>
            <div className="relative flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 h-full bg-primary-container shadow-[0_0_8px_rgba(110,231,183,0.4)] transition-all"
                style={{ width: `${volume}%` }} />
              <input type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">volume_up</span>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-center max-w-lg">
          <p className="font-body italic text-on-surface-variant text-base sm:text-lg leading-relaxed opacity-70">
            "{quote}"
          </p>
        </div>
      </footer>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}