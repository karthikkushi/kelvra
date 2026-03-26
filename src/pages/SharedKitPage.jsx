import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedKit } from "../utils/sharing";

export default function SharedKitPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    getSharedKit(shareId).then((result) => {
      if (result.success) setKit(result.kit);
      else setError("This study kit doesn't exist or has been removed.");
      setLoading(false);
    });
  }, [shareId]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading study kit...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-error text-5xl mb-4 block">error</span>
        <h2 className="font-headline text-2xl font-bold mb-3 text-on-surface">Kit not found</h2>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <button onClick={() => navigate("/")}
          className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl">
          Go to Kelvra
        </button>
      </div>
    </div>
  );

  const TABS = [
    kit?.summary    && { id: "summary",    label: "Summary",    icon: "summarize" },
    kit?.flashcards && { id: "flashcards", label: "Flashcards", icon: "style" },
    kit?.quiz       && { id: "quiz",       label: "Quiz",       icon: "quiz" },
    kit?.plan       && { id: "plan",       label: "Study Plan", icon: "calendar_today" },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      {/* Fixed blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <span className="font-headline font-bold text-lg tracking-tighter">Kelvra</span>
        </div>
        <button onClick={() => navigate("/auth")}
          className="px-5 py-2 bg-primary-container text-on-primary-container font-bold rounded-full text-sm hover:scale-[1.02] transition-all">
          Study with AI →
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Kit info */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Shared Study Kit</span>
            <span className="text-on-surface-variant text-xs">· {kit.views} views</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-2">{kit.topic}</h1>
          <p className="text-on-surface-variant text-sm">
            Created by a Kelvra student · Use this kit to study smarter
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 flex-wrap mb-8">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.id
                  ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                  : "bg-surface-container-low border border-outline-variant/10 text-on-surface-variant"
              }`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Summary */}
        {activeTab === "summary" && kit.summary && (
          <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 space-y-4">
            {kit.summary.paragraphs?.map((p, i) => (
              <p key={i} className="text-on-surface-variant text-sm leading-relaxed">{p}</p>
            ))}
            {kit.summary.points?.length > 0 && (
              <div className="pt-4 border-t border-outline-variant/10 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Key Points</h4>
                {kit.summary.points.map((p, i) => (
                  <div key={i} className="flex gap-3 text-sm text-on-surface-variant">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-2 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flashcards */}
        {activeTab === "flashcards" && kit.flashcards && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kit.flashcards.map((card, i) => (
              <div key={i} onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })}
                className={`p-6 rounded-2xl border cursor-pointer transition-all min-h-[120px] ${
                  flipped[i]
                    ? "bg-surface-container-high border-primary-container/30"
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary-container/20"
                }`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${flipped[i] ? "text-primary-container" : "text-on-surface-variant"}`}>
                  {flipped[i] ? "Answer" : `Card ${i + 1}`}
                </span>
                <p className="mt-2 text-sm font-medium text-on-surface leading-relaxed">
                  {flipped[i] ? card.answer : card.question}
                </p>
                <p className="text-[10px] text-on-surface-variant/40 mt-3">
                  {flipped[i] ? "Tap to see question" : "Tap to reveal answer"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quiz preview */}
        {activeTab === "quiz" && kit.quiz && (
          <div className="space-y-4">
            {kit.quiz.slice(0, 3).map((q, i) => (
              <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Q{i + 1}</span>
                <p className="text-sm font-medium text-on-surface mt-2 mb-4">{q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(q.options || {}).map(([id, text]) => (
                    <div key={id} className="flex items-center gap-3 p-3 bg-surface-container-highest/40 rounded-xl text-sm">
                      <span className="w-6 h-6 rounded-lg bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">{id}</span>
                      <span className="text-on-surface-variant">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-center text-sm text-on-surface-variant">
              Sign up to take the full quiz with instant feedback →
            </p>
          </div>
        )}

        {/* Study Plan */}
        {activeTab === "plan" && kit.plan && (
          <div className="space-y-3">
            {kit.plan.map((day) => (
              <div key={day.day} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 flex gap-5">
                <div className="text-center min-w-[48px]">
                  <div className="font-headline text-2xl font-extrabold text-secondary">{day.day}</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">Day</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-on-surface mb-2">{day.theme}</div>
                  {day.tasks?.map((t, i) => (
                    <div key={i} className="flex gap-2 text-xs text-on-surface-variant mt-1">
                      <span className="text-secondary">→</span> {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-surface-container-low border border-primary-container/10 rounded-2xl p-8 text-center">
          <h3 className="font-headline text-xl font-bold mb-2">Want to generate your own study kits?</h3>
          <p className="text-on-surface-variant text-sm mb-5">
            Paste your notes or type any topic → get flashcards, quiz, summary and study plan in seconds.
          </p>
          <button onClick={() => navigate("/auth")}
            className="px-8 py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] transition-all">
            Try Kelvra for free →
          </button>
        </div>
      </main>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
