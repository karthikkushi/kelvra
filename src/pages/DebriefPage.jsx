// src/pages/DebriefPage.jsx
// "Bad test day" debrief: 3 minutes to turn a disappointing test into causes, one fix,
// and (if the student wants) a calm message for their parents.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CrisisCard from "../components/CrisisCard";
import { REASONS, AMOUNTS, topReason, parentMessage } from "../utils/debrief";
import { saveDebrief, getDebriefs } from "../utils/learning";
import { whatsappLink } from "../utils/family";
import { setMeta } from "../utils/firebase";
import { weekStart, isAdult } from "../utils/mentor";
import { detectCrisis } from "../utils/safety";
import { ifThenSentence } from "../utils/habits";

const filled = { fontVariationSettings: "'FILL' 1" };
const FEELINGS = ["😞 Upset", "😠 Frustrated", "😐 Okay", "🤔 Confused", "😌 Relieved"];
const inputCls = "w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50";

export default function DebriefPage({ user }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [test, setTest] = useState("");
  const [feeling, setFeeling] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [learned, setLearned] = useState("");
  const [fix, setFix] = useState(null); // { cue, action }
  const [lang, setLang] = useState("en");
  const [crisis, setCrisis] = useState(false);
  const [past, setPast] = useState([]);
  const [habitSet, setHabitSet] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    getDebriefs(user.id).then((d) => { if (alive) setPast(d); });
    return () => { alive = false; };
  }, [user?.id]);

  const top = topReason(amounts);
  const safe = (text) => { if (detectCrisis(text)) { setCrisis(true); return false; } return true; };

  const goFix = () => {
    if (!safe(learned) || !safe(test)) return;
    setFix(top ? { ...top.fix } : { cue: "I study this week", action: "practise one past-paper question a day" });
    setStep(2);
  };

  const finish = () => {
    saveDebrief(user.id, { test: test.trim() || "Test", feeling, reasons: amounts, top: top?.id || null, learned: learned.trim(), fix });
    setPast((p) => [{ test: test.trim() || "Test", top: top?.id, fix, created_at: new Date().toISOString() }, ...p]);
    setStep(3);
  };

  const makeHabit = () => {
    setMeta(user.id, "habit", { current: { cue: fix.cue, action: fix.action, week_start: weekStart(), days_done: [], started_at: new Date().toISOString() } });
    setHabitSet(true);
  };

  const message = parentMessage({ test: test.trim() || (lang === "hi" ? "टेस्ट" : "test"), learned, fix: fix ? ifThenSentence(fix) : "", lang });

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="debrief" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Test debrief · 3 minutes</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">A bad test is information, not a verdict</h1>
            <p className="text-sm text-on-surface-variant mt-1">Find where the marks went, pick one fix, and decide what to tell your family.</p>
          </header>

          {crisis && <div className="mb-5"><CrisisCard onClose={() => setCrisis(false)} /></div>}

          <div className="flex gap-1 mb-5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary-container" : "bg-surface-container-highest"}`} />)}
          </div>

          {step === 0 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <label className="block text-sm font-bold text-on-surface">Which test?
                <input value={test} onChange={(e) => setTest(e.target.value)} maxLength={60} placeholder="e.g. Physics unit test, JEE mock 4" className={`${inputCls} mt-2 font-normal`} />
              </label>
              <div>
                <p className="text-sm font-bold text-on-surface mb-2">How do you feel about it right now?</p>
                <div className="flex flex-wrap gap-2">
                  {FEELINGS.map((f) => (
                    <button key={f} onClick={() => setFeeling(f)} aria-pressed={feeling === f}
                      className={`px-3 py-2 rounded-xl border text-sm ${feeling === f ? "border-primary-container bg-primary-container/10" : "border-outline-variant/15 bg-surface-container"}`}>{f}</button>
                  ))}
                </div>
                {feeling && /Upset|Frustrated/.test(feeling) && (
                  <p className="text-sm text-on-surface-variant mt-3">That's a normal reaction, and it shows you care. Let's use it.</p>
                )}
              </div>
              <button onClick={() => setStep(1)} disabled={!feeling} className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold disabled:opacity-40">Next</button>
            </section>
          )}

          {step === 1 && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-4">
              <p className="text-sm font-bold text-on-surface">Where did the marks go?</p>
              <ul className="space-y-2">
                {REASONS.map((r) => (
                  <li key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between bg-surface-container rounded-xl p-3">
                    <span className="text-sm text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-primary-container text-lg">{r.icon}</span>{r.label}</span>
                    <div className="flex gap-1" role="radiogroup" aria-label={r.label}>
                      {AMOUNTS.map((a) => (
                        <button key={a.v} role="radio" aria-checked={(amounts[r.id] || 0) === a.v} onClick={() => setAmounts({ ...amounts, [r.id]: a.v })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${(amounts[r.id] || 0) === a.v ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>{a.label}</button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <label className="block text-sm font-bold text-on-surface">One thing this test taught you (optional)
                <input value={learned} onChange={(e) => setLearned(e.target.value)} maxLength={140} placeholder="e.g. I rush unit conversions under time pressure" className={`${inputCls} mt-2 font-normal`} />
              </label>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="px-4 py-3 rounded-xl text-sm text-on-surface-variant">Back</button>
                <button onClick={goFix} className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold">Find my one fix</button>
              </div>
            </section>
          )}

          {step === 2 && fix && (
            <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-4">
              {top ? (
                <p className="text-sm text-on-surface-variant">Biggest cause: <strong className="text-on-surface">{top.label}</strong>. Fix that first, the rest gets easier.</p>
              ) : (
                <p className="text-sm text-on-surface-variant">No single cause stood out. Here's a good general fix.</p>
              )}
              <p className="text-sm font-bold text-on-surface">Your one fix (edit it to fit you):</p>
              <div className="grid sm:grid-cols-2 gap-2">
                <label className="text-xs text-on-surface-variant">When…<input value={fix.cue} onChange={(e) => setFix({ ...fix, cue: e.target.value })} maxLength={80} className={`${inputCls} mt-1`} /></label>
                <label className="text-xs text-on-surface-variant">I will…<input value={fix.action} onChange={(e) => setFix({ ...fix, action: e.target.value })} maxLength={120} className={`${inputCls} mt-1`} /></label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl text-sm text-on-surface-variant">Back</button>
                <button onClick={finish} disabled={fix.cue.trim().length < 3 || fix.action.trim().length < 3} className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold disabled:opacity-40">Save my debrief</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-5 sm:p-6">
                <span className="material-symbols-outlined text-3xl text-primary-container" style={filled}>task_alt</span>
                <h2 className="font-headline text-xl font-bold mt-2">Done. That took courage.</h2>
                <p className="text-sm text-on-surface-variant mt-1">Most students only feel bad about a test. You turned it into a plan: <strong className="text-on-surface">{ifThenSentence(fix)}</strong></p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={makeHabit} disabled={habitSet} className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm disabled:opacity-60">
                    {habitSet ? "Set as this week's habit ✓" : "Make it this week's habit"}
                  </button>
                  {top?.id === "nerves" && <button onClick={() => navigate("/reset")} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">Try the stress reset</button>}
                  {top?.id === "concept" && <button onClick={() => navigate("/socratic")} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">Re-learn with the AI Tutor</button>}
                  {top?.id === "careless" && <button onClick={() => navigate("/mistakes")} className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">See my mistake patterns</button>}
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Telling your family? (optional{isAdult(user?.user_metadata?.age_group) ? "" : ", your choice"})</p>
                  <div className="flex gap-1 p-1 bg-surface-container rounded-lg">
                    {[["en", "English"], ["hi", "हिन्दी"]].map(([id, label]) => (
                      <button key={id} onClick={() => setLang(id)} className={`px-3 py-1 rounded-md text-xs font-bold ${lang === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant mb-3">This message tells them what you learned and how they can help, without the marks.</p>
                <div className="bg-[#0b141a] rounded-2xl p-3">
                  <div className="ml-auto max-w-[92%] bg-[#005c4b] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">{message}</div>
                </div>
                <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-[#0b141a] font-bold text-sm">
                  <span className="material-symbols-outlined text-lg" style={filled}>send</span> Send on WhatsApp
                </a>
              </div>
            </section>
          )}

          {past.length > 0 && step !== 3 && (
            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Past debriefs</p>
              <ul className="space-y-2">
                {past.slice(0, 5).map((d, i) => (
                  <li key={d.id || i} className="text-sm bg-surface-container-low rounded-xl px-4 py-3">
                    <span className="text-on-surface font-bold">{d.test}</span>
                    <span className="text-on-surface-variant"> · {REASONS.find((r) => r.id === d.top)?.label || "mixed causes"}{d.fix ? ` · fix: ${ifThenSentence(d.fix)}` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
