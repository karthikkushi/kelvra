// src/pages/FamilyPage.jsx
// Student-controlled family digest: the student picks what to share, sees exactly what the parent
// will read ("Preview as parent"), and sends it themselves on WhatsApp. No parent account, no tracking.
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CrisisCard from "../components/CrisisCard";
import { SHARE_ITEMS, defaultShare, buildFamilyDigest, whatsappLink, scoreTrend } from "../utils/family";
import { PARENT_TIPS } from "../utils/debrief";
import { getWeekStats, getActivityEvents } from "../utils/learning";
import { getMeta, setMeta } from "../utils/firebase";
import { buildBehaviourReport, ifThenSentence, experimentProgress } from "../utils/habits";
import { weekStart, isAdult } from "../utils/mentor";
import { detectCrisis } from "../utils/safety";
import { EXPLAINERS, explainerById, explainerUrl } from "../data/explainers";

const filled = { fontVariationSettings: "'FILL' 1" };

export default function FamilyPage({ user }) {
  const [stats, setStats] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [note, setNote] = useState("");
  const [explainerId, setExplainerId] = useState("");
  const [copied, setCopied] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const meta = user?.user_metadata || {};
  const adult = isAdult(meta.age_group);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    Promise.all([getWeekStats(user.id), getActivityEvents(user.id), getMeta(user.id, "habit"), getMeta(user.id, "family")]).then(([w, events, habit, fam]) => {
      if (!alive) return;
      const report = buildBehaviourReport(events);
      const h = habit?.current && habit.current.week_start === weekStart() ? habit.current : null;
      const prog = experimentProgress(h);
      setStats({
        name: (meta.full_name || "").split(" ")[0] || "me",
        activeDays: report.activeDays,
        focusMinutes: w.focusMinutes,
        focusSessions: w.focusSessions,
        topics: w.topics,
        mistakesFixed: w.mistakesFixed,
        habit: h ? { sentence: ifThenSentence(h), done: prog.doneThisWeek, of: prog.daysSoFar } : null,
        answers: w.answers,
        scoreTrend: scoreTrend(w.scores),
      });
      setPrefs({ share: { ...defaultShare(), ...(fam?.share || {}) }, lang: fam?.lang || "en", paused: !!fam?.paused, last_sent: fam?.last_sent || null });
    });
    return () => { alive = false; };
  }, [user?.id, meta.full_name]);

  if (!stats || !prefs) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body">
        <Sidebar active="family" />
        <main className="md:ml-64 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const update = (next) => {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    setMeta(user.id, "family", { share: merged.share, lang: merged.lang, paused: merged.paused, ...(merged.last_sent ? { last_sent: merged.last_sent } : {}) });
  };
  const chosen = explainerById(explainerId);
  const digest = buildFamilyDigest(stats, prefs.share, prefs.lang, note, chosen ? { title: chosen.title, url: explainerUrl(chosen.id) } : null);

  const markSent = () => update({ last_sent: new Date().toISOString() });
  const guard = (fn) => () => {
    if (detectCrisis(note)) { setNote(""); setCrisis(true); return; }
    fn();
  };
  const copy = guard(async () => {
    try { await navigator.clipboard.writeText(digest.text); setCopied(true); setTimeout(() => setCopied(false), 2000); markSent(); }
    catch { setCopied(false); }
  });
  const send = guard(() => { window.open(whatsappLink(digest.text), "_blank", "noopener"); markSent(); });

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="family" />
      <main className="md:ml-64 min-h-screen pb-28 md:pb-10 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-1">Family update · you are in control</p>
            <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tighter">Tell your family how your week went, your way</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              You choose what to share and see exactly what they will read. You send it yourself. Kelvra never contacts your family,
              never shares your chats, mood or marks list, and never ranks you.
              {adult ? " You're 18+, so this is completely optional." : ""}
            </p>
          </header>

          {crisis && <div className="mb-5"><CrisisCard onClose={() => setCrisis(false)} /></div>}

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="space-y-4">
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">What to share</p>
                <ul className="space-y-2">
                  {SHARE_ITEMS.map((i) => (
                    <li key={i.id}>
                      <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
                        <span className="text-sm text-on-surface">{i.label}</span>
                        <input type="checkbox" checked={!!prefs.share[i.id]} onChange={(e) => update({ share: { ...prefs.share, [i.id]: e.target.checked } })}
                          className="w-5 h-5 accent-[#6ee7b7]" />
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-on-surface-variant/70 mt-3">Never shared: mentor chats, mood check-ins, focus distractions, mistakes list, rank.</p>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Language</p>
                  <div className="flex gap-1 p-1 bg-surface-container rounded-lg">
                    {[["en", "English"], ["hi", "हिन्दी"]].map(([id, label]) => (
                      <button key={id} onClick={() => update({ lang: id })}
                        className={`px-3 py-1 rounded-md text-xs font-bold ${prefs.lang === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <label className="block text-xs text-on-surface-variant">A note from you (optional)
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200}
                    placeholder="e.g. Tough week. I'd like Sunday morning off." className="mt-1 w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50" />
                </label>
                <label className="block text-xs text-on-surface-variant">Add a 1-minute explainer for your family (optional)
                  <select value={explainerId} onChange={(e) => setExplainerId(e.target.value)}
                    className="mt-1 w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface">
                    <option value="">None</option>
                    {EXPLAINERS.map((x) => <option key={x.id} value={x.id}>{x.title[prefs.lang] || x.title.en}</option>)}
                  </select>
                  <span className="block mt-1">Opens without an account. Your family can read it or have the phone read it aloud. <a href="/explain" target="_blank" rel="noopener noreferrer" className="underline">See them all</a></span>
                </label>
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="text-sm text-on-surface">Pause updates (exam week or a break)</span>
                  <input type="checkbox" checked={prefs.paused} onChange={(e) => update({ paused: e.target.checked })} className="w-5 h-5 accent-[#6ee7b7]" />
                </label>
              </div>

              <details className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
                <summary className="cursor-pointer text-sm font-bold text-on-surface">Guide for parents: how to help (share it if you like)</summary>
                <ul className="mt-3 space-y-2">{PARENT_TIPS.map((t) => <li key={t} className="text-sm text-on-surface-variant">• {t}</li>)}</ul>
                <a href={whatsappLink(`How to help me study (from Kelvra):\n${PARENT_TIPS.map((t) => `• ${t}`).join("\n")}`)} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs font-bold text-primary-container hover:underline">Send this guide on WhatsApp</a>
              </details>
            </section>

            <section>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">visibility</span> Preview as parent
              </p>
              <div className="bg-[#0b141a] rounded-3xl p-4 border border-outline-variant/15">
                <div className="ml-auto max-w-[92%] bg-[#005c4b] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {prefs.paused ? "(Updates are paused. Nothing will be sent.)" : digest.text}
                </div>
              </div>
              {!prefs.paused && (
                <div className="flex gap-2 mt-4">
                  <button onClick={send} className="flex-1 py-3 rounded-xl bg-[#25D366] text-[#0b141a] font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg" style={filled}>send</span> Send on WhatsApp
                  </button>
                  <button onClick={copy} className="px-4 py-3 rounded-xl border border-outline-variant/30 text-sm font-bold">{copied ? "Copied!" : "Copy"}</button>
                </div>
              )}
              {prefs.last_sent && <p className="text-xs text-on-surface-variant mt-2">Last sent {new Date(prefs.last_sent).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}.</p>}
              <p className="text-[11px] text-on-surface-variant/70 mt-3">WhatsApp opens with the message ready; you pick who gets it. Kelvra doesn't see your contacts.</p>
            </section>
          </div>
        </div>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
