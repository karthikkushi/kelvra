import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import {
  runPlannerAgent,
  runObserverAgent,
  runCoachAgent,
  runPredictorAgent,
} from "../utils/agents";

export default function AgentsPage({ user }) {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState("observer");
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [topics, setTopics] = useState("");

  const userId = user?.id;

  // Auto-run Observer and Coach on load
  useEffect(() => {
    if (!userId) return;
    runAgent("observer");
    runAgent("coach");
    runAgent("predictor");
  }, [userId]);

  const runAgent = async (agentId) => {
    if (!userId) return;
    setLoading((prev) => ({ ...prev, [agentId]: true }));
    try {
      let result;
      if (agentId === "observer") result = await runObserverAgent(userId);
      else if (agentId === "coach") result = await runCoachAgent(userId);
      else if (agentId === "predictor") result = await runPredictorAgent(userId, examName || "your exam");
      else if (agentId === "planner") {
        if (!examName || !examDate || !topics) {
          setResults((prev) => ({ ...prev, planner: { error: "Please fill in exam name, date and topics first." } }));
          setLoading((prev) => ({ ...prev, planner: false }));
          return;
        }
        result = await runPlannerAgent(userId, examName, examDate, topics.split(",").map((t) => t.trim()));
      }
      setResults((prev) => ({ ...prev, [agentId]: result }));
    } catch (err) {
      setResults((prev) => ({ ...prev, [agentId]: { success: false, error: err.message } }));
    } finally {
      setLoading((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  const AGENTS = [
    { id: "observer",  icon: "visibility",    label: "Observer",  color: "text-secondary",         bg: "bg-secondary-container/20",  desc: "Knowledge map" },
    { id: "coach",     icon: "psychology",     label: "Coach",     color: "text-primary-container", bg: "bg-primary-container/10",    desc: "What to study" },
    { id: "predictor", icon: "trending_up",    label: "Predictor", color: "text-tertiary-fixed-dim",bg: "bg-tertiary-container/20",   desc: "Exam readiness" },
    { id: "planner",   icon: "calendar_month", label: "Planner",   color: "text-error",             bg: "bg-error-container/20",      desc: "Study schedule" },
  ];

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="agents" />
      <main className="md:ml-64 min-h-screen p-4 sm:p-6 md:p-10 pb-24 md:pb-10 overflow-x-hidden">

        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-container">AI Intelligence</span>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-on-surface mt-2">
            Your AI Agents
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm sm:text-base">4 agents working silently to personalize your learning</p>
        </header>

        {/* Agent tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {AGENTS.map((a) => (
            <button key={a.id} onClick={() => setActiveAgent(a.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all text-left ${
                activeAgent === a.id
                  ? "border-primary-container/40 bg-surface-container-low"
                  : "border-outline-variant/10 bg-surface-container-low/50 hover:border-outline-variant/30"
              }`}>
              <div className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${a.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
              </div>
              <div className="font-headline font-bold text-on-surface text-sm sm:text-base">{a.label}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{a.desc}</div>
              {loading[a.id] && (
                <div className="mt-2 w-4 h-4 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        {/* ── OBSERVER ── */}
        {activeAgent === "observer" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Observer Agent</h2>
              <button onClick={() => runAgent("observer")} disabled={loading.observer}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.observer && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Analyzing your knowledge...
              </div>
            )}

            {results.observer?.insights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-primary-container">{results.observer.insights.studyStreak}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Day Streak</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-secondary">{results.observer.insights.averageScore}%</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Avg Score</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-tertiary-fixed-dim">{results.observer.insights.masteredTopics.length}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Mastered</div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <div className="font-headline text-3xl font-extrabold text-error">{results.observer.insights.weakTopics.length}</div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Weak Topics</div>
                </div>
              </div>
            )}

            {results.observer?.insights?.knowledgeMap?.length > 0 && (
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                <h3 className="font-headline font-bold text-lg mb-4">Knowledge Map</h3>
                <div className="space-y-4">
                  {results.observer.insights.knowledgeMap.map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{t.topic}</span>
                        <span className={t.avgScore >= 80 ? "text-primary-container" : t.avgScore >= 60 ? "text-tertiary-fixed-dim" : "text-error"}>
                          {t.avgScore}% · {t.status}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${t.avgScore >= 80 ? "bg-primary-container" : t.avgScore >= 60 ? "bg-tertiary-fixed-dim" : "bg-error"}`}
                          style={{ width: `${t.avgScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.observer?.insights?.recommendation && (
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-primary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="font-bold text-primary-container">AI Recommendation</span>
                </div>
                <p className="text-on-surface">{results.observer.insights.recommendation}</p>
              </div>
            )}

            {!results.observer && !loading.observer && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">visibility</span>
                Complete some quizzes to see your knowledge map
              </div>
            )}
          </div>
        )}

        {/* ── COACH ── */}
        {activeAgent === "coach" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Coach Agent</h2>
              <button onClick={() => runAgent("coach")} disabled={loading.coach}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.coach && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Calculating your review schedule...
              </div>
            )}

            {results.coach?.coaching && (
              <>
                {/* Today's focus */}
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary-container text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}>today</span>
                    <h3 className="font-headline font-bold text-lg">Today's Focus</h3>
                  </div>
                  <p className="text-on-surface text-lg leading-relaxed">{results.coach.coaching.todayFocus}</p>
                </div>

                {/* Urgent reviews */}
                {results.coach.coaching.urgentReview.length > 0 && (
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-xl">notification_important</span>
                      Urgent Reviews
                    </h3>
                    <div className="space-y-3">
                      {results.coach.coaching.urgentReview.map((t) => (
                        <div key={t.topic}
                          onClick={() => navigate("/study")}
                          className="flex items-center justify-between p-4 bg-surface-container-highest/40 rounded-xl cursor-pointer hover:bg-surface-container-highest transition-colors">
                          <span className="font-medium">{t.topic}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-error font-bold">
                              {t.hoursOverdue > 24
                                ? `${Math.floor(t.hoursOverdue / 24)} days overdue`
                                : `${t.hoursOverdue}h overdue`}
                            </span>
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">arrow_forward</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivational quote */}
                <div className="bg-surface-container-highest/30 border border-outline-variant/10 rounded-2xl p-6 text-center">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                  <p className="text-on-surface-variant text-lg italic">{results.coach.coaching.motivationalMessage}</p>
                </div>
              </>
            )}

            {!results.coach && !loading.coach && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">psychology</span>
                Study some topics to get coaching recommendations
              </div>
            )}
          </div>
        )}

        {/* ── PREDICTOR ── */}
        {activeAgent === "predictor" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold">Predictor Agent</h2>
              <button onClick={() => runAgent("predictor")} disabled={loading.predictor}
                className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-all flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">refresh</span>
                Refresh
              </button>
            </div>

            {loading.predictor && (
              <div className="text-center py-12 text-on-surface-variant">
                <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin mx-auto mb-3" />
                Predicting your exam readiness...
              </div>
            )}

            {results.predictor?.prediction && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Readiness gauge */}
                  <div className="md:col-span-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 rounded-full flex items-center justify-center"
                      style={{ background: `conic-gradient(#6ee7b7 ${results.predictor.prediction.readinessScore}%, #1c2030 0)` }}>
                      <div className="absolute inset-2 bg-surface-container-low rounded-full flex flex-col items-center justify-center">
                        <span className="font-headline text-3xl font-extrabold text-primary-container">
                          {results.predictor.prediction.readinessScore}%
                        </span>
                        <span className="text-xs text-on-surface-variant">Ready</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="font-headline text-2xl font-bold text-on-surface">
                        {results.predictor.prediction.predictedGrade}
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">
                        Predicted grade · {results.predictor.prediction.confidence}% confidence
                      </div>
                    </div>
                  </div>

                  {/* Top 3 focus */}
                  <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error">priority_high</span>
                      Focus on these 3 topics
                    </h3>
                    {results.predictor.prediction.top3Focus.length > 0 ? (
                      <div className="space-y-4">
                        {results.predictor.prediction.top3Focus.map((t, i) => (
                          <div key={t.topic}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-error-container/30 text-error text-xs flex items-center justify-center font-bold">{i + 1}</span>
                                {t.topic}
                              </span>
                              <span className="text-error font-bold">{t.avg}%</span>
                            </div>
                            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="h-full bg-error transition-all duration-700" style={{ width: `${t.avg}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-on-surface-variant text-sm">Complete more quizzes to see your focus areas.</p>
                    )}
                  </div>
                </div>

                {/* AI message */}
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="font-bold text-primary-container">AI Prediction</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      results.predictor.prediction.trend === "improving"
                        ? "bg-primary-container/10 text-primary-container"
                        : results.predictor.prediction.trend === "declining"
                        ? "bg-error-container/10 text-error"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}>
                      {results.predictor.prediction.trend === "improving" ? "↑ Improving" :
                       results.predictor.prediction.trend === "declining" ? "↓ Declining" : "→ Stable"}
                    </span>
                  </div>
                  <p className="text-on-surface leading-relaxed">{results.predictor.prediction.message}</p>
                </div>
              </>
            )}

            {!results.predictor && !loading.predictor && (
              <div className="text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 block">trending_up</span>
                Complete at least 3 quizzes to get your exam prediction
              </div>
            )}
          </div>
        )}

        {/* ── PLANNER ── */}
        {activeAgent === "planner" && (
          <div className="space-y-6">
            <h2 className="font-headline text-2xl font-bold">Planner Agent</h2>

            {/* Input form */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-headline font-bold text-lg">Set up your exam</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Exam Name</label>
                  <input value={examName} onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. NEET 2025, Semester Finals"
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Exam Date</label>
                  <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary-container/50 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Topics to cover (comma separated)</label>
                <input value={topics} onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. Photosynthesis, Cell Division, Genetics, Ecology"
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-sm" />
              </div>
              <button onClick={() => runAgent("planner")} disabled={loading.planner}
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading.planner ? (
                  <><div className="w-5 h-5 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Building your plan...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>Generate Study Plan</>
                )}
              </button>
              {results.planner?.error && (
                <p className="text-error text-sm">{results.planner.error}</p>
              )}
            </div>

            {/* Plan output */}
            {results.planner?.plan && (
              <div className="space-y-4">
                {results.planner.plan.strategy && (
                  <div className="bg-primary-container/10 border border-primary-container/20 rounded-2xl p-5">
                    <p className="text-primary-container font-medium">
                      <span className="font-bold">Strategy:</span> {results.planner.plan.strategy}
                    </p>
                  </div>
                )}
                {results.planner.plan.days?.map((day) => (
                  <div key={day.day} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center">
                          <span className="font-headline font-bold text-primary-container">{day.day}</span>
                        </div>
                        <div>
                          <div className="font-bold text-on-surface">{day.theme}</div>
                          <div className="text-xs text-on-surface-variant">{day.date}</div>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full">
                        ⏱ {day.totalMinutes} min
                      </span>
                    </div>
                    <div className="space-y-2">
                      {day.tasks?.map((task, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 bg-surface-container-highest/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-sm ${task.type === "quiz" ? "text-secondary" : "text-primary-container"}`}>
                              {task.type === "quiz" ? "quiz" : "menu_book"}
                            </span>
                            <span className="text-sm font-medium">{task.topic}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              task.priority === "high"
                                ? "bg-error-container/20 text-error"
                                : "bg-surface-container text-on-surface-variant"
                            }`}>{task.priority}</span>
                            <span className="text-xs text-on-surface-variant">{task.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon: "dashboard", label: "Home",   path: "/dashboard" },
          { icon: "menu_book", label: "Study",  path: "/study" },
          { icon: "smart_toy", label: "Agents", path: "/agents", active: true },
          { icon: "insights",  label: "Stats",  path: "/progress" },
        ].map((item) => (
          <div key={item.label} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer min-h-[44px] justify-center ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </div>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
