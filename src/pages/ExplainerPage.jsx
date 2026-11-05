// src/pages/ExplainerPage.jsx
// Public Parent Explainer notes (no login): /explain lists them, /explain/:id shows one.
// "Listen" reads it aloud with the phone's own voice (free; voice quality depends on the device).
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EXPLAINERS, EXPLAINERS_CHECKED, explainerById, explainerText, explainerUrl } from "../data/explainers";
import { whatsappLink } from "../utils/family";

const filled = { fontVariationSettings: "'FILL' 1" };

function useReadAloud() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  const speak = (text, lang) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    const voice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith(lang === "hi" ? "hi" : "en-in"));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };
  const stop = () => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false); };
  return { supported, speaking, speak, stop };
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="flex gap-1 p-1 bg-surface-container rounded-lg" role="group" aria-label="Language">
      {[["en", "English"], ["hi", "हिन्दी"]].map(([id, label]) => (
        <button key={id} onClick={() => setLang(id)} aria-pressed={lang === id}
          className={`px-3 py-1 rounded-md text-xs font-bold ${lang === id ? "bg-surface-container-highest text-primary-container" : "text-on-surface-variant"}`}>{label}</button>
      ))}
    </div>
  );
}

export default function ExplainerPage() {
  const { id } = useParams();
  const e = id ? explainerById(id) : null;
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("kelvra_explain_lang") || "en"; } catch { return "en"; }
  });
  const voice = useReadAloud();
  const choose = (l) => { setLang(l); voice.stop(); try { localStorage.setItem("kelvra_explain_lang", l); } catch { /* blocked */ } };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link to="/" className="flex items-center gap-2 font-headline font-bold">
            <span className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-sm" style={filled}>auto_awesome</span>
            </span>
            Kelvra
          </Link>
          <LangToggle lang={lang} setLang={choose} />
        </div>

        {id && !e && (
          <p className="text-on-surface-variant">This explainer was not found. <Link to="/explain" className="text-primary-container underline">See all explainers</Link></p>
        )}

        {e ? (
          <article className="space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container">{lang === "hi" ? "माता-पिता के लिए 1 मिनट" : "1 minute for parents"}</p>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{e.title[lang]}</h1>
            {voice.supported && (
              <button onClick={() => (voice.speaking ? voice.stop() : voice.speak(explainerText(e, lang), lang))}
                className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" style={filled}>{voice.speaking ? "stop_circle" : "volume_up"}</span>
                {voice.speaking ? (lang === "hi" ? "रोकें" : "Stop") : (lang === "hi" ? "सुनें" : "Listen")}
              </button>
            )}
            <div className="space-y-3">
              {e.body[lang].map((p) => <p key={p} className="text-base leading-relaxed text-on-surface">{p}</p>)}
            </div>
            <section className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-2">{lang === "hi" ? "आज रात क्या कहें" : "What to say tonight"}</p>
              <ul className="space-y-2">{e.say[lang].map((s) => <li key={s} className="text-sm text-on-surface">{s}</li>)}</ul>
            </section>
            <div className="text-xs text-on-surface-variant space-y-1">
              <p>{lang === "hi" ? "स्रोत" : "Sources"}: {e.sources.map((s, i) => (
                <span key={s.url}>{i > 0 && " · "}<a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a></span>
              ))}</p>
              <p>{lang === "hi" ? "आखिरी जाँच" : "Last checked"}: {EXPLAINERS_CHECKED}. {lang === "hi" ? "नियम हर साल बदल सकते हैं; आधिकारिक सूचना ही अंतिम है।" : "Rules can change every year; the official notice is always final."}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <a href={whatsappLink(`${e.title[lang]}\n${explainerUrl(e.id)}`)} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#25D366] text-[#0b141a] font-bold text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" style={filled}>send</span>{lang === "hi" ? "WhatsApp पर भेजें" : "Send on WhatsApp"}
              </a>
              <Link to="/explain" className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-bold">{lang === "hi" ? "और जानकारी" : "More explainers"}</Link>
            </div>
          </article>
        ) : !id && (
          <section className="space-y-4">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{lang === "hi" ? "माता-पिता के लिए आसान जानकारी" : "Exam terms, explained for parents"}</h1>
            <p className="text-on-surface-variant">{lang === "hi" ? "हर एक 1 मिनट में। मुफ़्त, बिना साइन-अप, कोई सेल्स कॉल नहीं।" : "One minute each. Free, no sign-up, no sales calls."}</p>
            <ul className="grid gap-2">
              {EXPLAINERS.map((x) => (
                <li key={x.id}>
                  <Link to={`/explain/${x.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-surface-container-low border border-outline-variant/10 hover:border-primary-container/40">
                    <span className="font-bold text-on-surface">{x.title[lang]}</span>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-[11px] text-on-surface-variant/70 mt-10">
          {lang === "hi" ? "Kelvra एक AI अध्ययन ऐप है। यह जानकारी शिक्षा के लिए है; आधिकारिक सूचना ही अंतिम है।" : "Kelvra is an AI study app. This is general information; the official notice is always final."}
        </p>
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
