// src/components/WhyCare.jsx
// "Why would I care?": once per topic, the student writes 1-2 lines on why it matters to them.
// Research: relevance written BY the student raised interest and grades (Hulleman & Harackiewicz 2009),
// so the AI does not write it for them.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelevance, saveRelevance } from "../utils/learning";
import { detectCrisis } from "../utils/safety";
import CrisisCard from "./CrisisCard";

export default function WhyCare({ user, topic }) {
  const [saved, setSaved] = useState(undefined); // undefined = loading, null = none yet
  const [text, setText] = useState("");
  const [crisis, setCrisis] = useState(false);
  const career = user?.user_metadata?.career_goal || "";

  useEffect(() => {
    if (!user?.id || !topic) return;
    let alive = true;
    getRelevance(user.id, topic).then((r) => { if (alive) setSaved(r); });
    return () => { alive = false; };
  }, [user?.id, topic]);

  if (!topic || saved === undefined) return null;
  if (crisis) return <CrisisCard onClose={() => setCrisis(false)} />;

  if (saved) {
    return (
      <div className="flex gap-3 items-start px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-sm">
        <span className="material-symbols-outlined text-primary-container">lightbulb</span>
        <p className="text-on-surface-variant"><strong className="text-on-surface">Why {topic} matters to you:</strong> {saved.text}</p>
      </div>
    );
  }

  const save = () => {
    const t = text.trim();
    if (t.length < 10) return;
    if (detectCrisis(t)) { setText(""); setCrisis(true); return; }
    saveRelevance(user.id, topic, t, career || null);
    setSaved({ topic, text: t });
  };

  return (
    <section className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-5 space-y-3" aria-label="Why would I care?">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">Why would I care? · 1 minute</p>
        <p className="font-headline font-bold text-on-surface mt-1">
          In 1–2 lines: how could {topic} matter {career ? `for becoming a ${career}` : "in your life, or in a job you might want"}?
        </p>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={240}
        aria-label={`Why ${topic} matters to you`}
        placeholder="Write it in your own words. There's no wrong answer."
        className="w-full bg-surface-container border border-outline-variant/15 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 resize-none" />
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={save} disabled={text.trim().length < 10}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold disabled:opacity-40">Save my reason</button>
        <Link to={`/explore?topic=${encodeURIComponent(topic)}`} className="text-xs font-bold text-primary-container hover:underline">Need an idea? See where it's used →</Link>
      </div>
      <p className="text-[11px] text-on-surface-variant/70">Students who write why a topic matters to them get more interested in it. Only you see this.</p>
    </section>
  );
}
