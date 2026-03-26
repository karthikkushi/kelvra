import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  generateStudyPlan,
  extractTextFromImage,
} from "../utils/claudeAPI";
import { saveStudySession } from "../utils/supabase";
import { speak, stopSpeaking, getVoiceEnabled, setVoiceEnabled, isSpeechSupported } from "../utils/voice";
import { awardXP } from "../utils/gamification";
import { shareStudyKit } from "../utils/sharing";
import { exportStudyKitPDF } from "../utils/exportPDF";
import MnemonicCard from "../components/MnemonicCard";

const TABS = [
  { id: "paste",  icon: "notes",           label: "Paste Notes" },
  { id: "topic",  icon: "edit_note",       label: "Type Topic" },
  { id: "pdf",    icon: "picture_as_pdf",  label: "Upload PDF" },
  { id: "image",  icon: "image",           label: "Upload Image" },
];

const OUTPUTS = [
  { id: "summary",    icon: "summarize",      label: "Summary" },
  { id: "flashcards", icon: "style",          label: "Flashcards" },
  { id: "quiz",       icon: "quiz",           label: "MCQ Quiz" },
  { id: "plan",       icon: "calendar_today", label: "Study Plan" },
];

const LANGS = ["English","Hindi","Tamil","Arabic","Spanish","French","Mandarin","Portuguese","Swahili","Bengali"];
const LOAD_STEPS = ["Reading your content...","Extracting key concepts...","Building flashcards...","Generating quiz...","Creating study plan...","Almost done..."];

function SummaryResult({ data }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 space-y-4">
      <h3 className="font-headline text-xl font-bold text-primary-container flex items-center gap-2">
        <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>summarize</span>
        Summary
      </h3>
      {data.paragraphs.map((p, i) => (
        <p key={i} className="text-on-surface-variant text-sm leading-relaxed">{p}</p>
      ))}
      {data.points.length > 0 && (
        <div className="mt-4 space-y-2 pt-4 border-t border-outline-variant/10">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Key Points</h4>
          {data.points.map((p, i) => (
            <div key={i} className="flex gap-3 text-sm text-on-surface-variant">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-container mt-2 flex-shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlashcardsResult({ data, onStudy }) {
  const [flipped, setFlipped] = useState({});
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">style</span>
          Flashcards <span className="text-on-surface-variant font-normal text-base">({data.length})</span>
        </h3>
        <button onClick={onStudy} className="px-5 py-2 bg-primary-container text-on-primary-container font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform">
          Study These →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((card, i) => (
          <div key={i} onClick={() => setFlipped({...flipped, [i]: !flipped[i]})}
            className={`p-6 rounded-2xl border cursor-pointer transition-all min-h-[120px] flex flex-col justify-between ${
              flipped[i] ? "bg-surface-container-high border-primary-container/30" : "bg-surface-container-low border-outline-variant/10 hover:border-primary-container/20"
            }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${flipped[i] ? "text-primary-container" : "text-on-surface-variant"}`}>
                {flipped[i] ? "Answer" : `Card ${i+1}`}
              </span>
              <p className="mt-2 text-sm font-medium text-on-surface leading-relaxed">
                {flipped[i] ? card.answer : card.question}
              </p>
            </div>
            <span className="text-[10px] text-on-surface-variant/50 mt-3">{flipped[i] ? "Tap to see question" : "Tap to reveal answer"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizResult({ data, onStudy }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">quiz</span>
          Quiz <span className="text-on-surface-variant font-normal text-base">({data.length} questions)</span>
        </h3>
        <button onClick={onStudy} className="px-5 py-2 bg-primary-container text-on-primary-container font-bold text-sm rounded-xl hover:scale-[1.02] transition-transform">
          Take Quiz →
        </button>
      </div>
      <div className="space-y-3">
        {data.slice(0, 3).map((q, i) => (
          <div key={i} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Q{i+1}</span>
            <p className="text-sm font-medium text-on-surface mt-1">{q.question}</p>
          </div>
        ))}
        {data.length > 3 && <p className="text-center text-sm text-on-surface-variant">+ {data.length - 3} more questions</p>}
      </div>
    </div>
  );
}

function PlanResult({ data }) {
  return (
    <div className="space-y-4">
      <h3 className="font-headline text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-tertiary-fixed-dim">calendar_today</span>
        5-Day Study Plan
      </h3>
      <div className="space-y-3">
        {data.map((day) => (
          <div key={day.day} className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-5 flex gap-5">
            <div className="text-center min-w-[48px]">
              <div className="font-headline text-2xl font-extrabold text-secondary">{day.day}</div>
              <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">Day</div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-on-surface mb-2">{day.theme}</div>
              {day.tasks.map((t, i) => (
                <div key={i} className="flex gap-2 text-xs text-on-surface-variant mt-1">
                  <span className="text-secondary">→</span> {t}
                </div>
              ))}
            </div>
            {day.duration && (
              <div className="text-xs text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full self-start whitespace-nowrap">⏱ {day.duration}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudyPage({ user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("paste");
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [outputs, setOutputs] = useState(new Set(["summary","flashcards","quiz","plan"]));
  const [inputLang, setInputLang] = useState("English");
  const [outputLang, setOutputLang] = useState("English");
  const [voiceBuddy, setVoiceBuddy] = useState(getVoiceEnabled());
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [activeResult, setActiveResult] = useState("summary");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageText, setImageText] = useState("");
  const [imageExtracting, setImageExtracting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const toggleOutput = (id) => {
    const next = new Set(outputs);
    next.has(id) ? next.delete(id) : next.add(id);
    setOutputs(next);
  };

  const getContent = () => {
    if (tab === "paste") return text.trim();
    if (tab === "topic") return topic.trim() ? `Topic: ${topic.trim()}` : "";
    if (tab === "pdf")   return pdfText.trim();
    if (tab === "image") return imageText.trim();
    return "";
  };

  const getTopicName = () => {
    if (tab === "topic" && topic.trim()) return topic.trim();
    if (tab === "pdf" && pdfInfo?.name) return pdfInfo.name;
    if (tab === "image" && imageFile?.name) return imageFile.name;
    if (tab === "paste" && text.trim()) return text.trim().slice(0, 60);
    return "Study Session";
  };

  const handlePdfUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setPdfFile(file);
    setPdfText("");
    setPdfInfo(null);
    setPdfExtracting(true);
    setError("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => item.str).join(" ") + "\n";
      }
      if (!fullText.trim()) throw new Error("No text found. Try a text-based PDF, not a scanned image.");
      setPdfText(fullText);
      setPdfInfo({ name: file.name.replace(/\.pdf$/i, ""), pages: pdf.numPages });
    } catch (err) {
      setError("Could not read PDF. Try a text-based PDF, not a scanned image.");
      setPdfFile(null);
    } finally {
      setPdfExtracting(false);
    }
  };

  const handleImageUpload = async (file) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!file || !allowed.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setImageFile(file);
    setImageText("");
    setImageExtracting(true);
    setError("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      try {
        const extracted = await extractTextFromImage(base64, file.type);
        if (!extracted.trim()) throw new Error("No text extracted from image.");
        setImageText(extracted);
      } catch (err) {
        setError("Could not extract text from image. Make sure it contains readable text.");
        setImageFile(null);
        setImagePreview("");
      } finally {
        setImageExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    const content = getContent();
    if (!content) { setError("Please add some content first."); return; }
    if (outputs.size === 0) { setError("Please select at least one output type."); return; }
    setError(""); setResults(null); setLoading(true);

    const stepInterval = setInterval(() => {
      setLoadStep(LOAD_STEPS[Math.floor(Math.random() * LOAD_STEPS.length)]);
    }, 1400);

    try {
      const generated = {};

      // Groq handles parallel requests fine — all 4 at once
      await Promise.allSettled([
        outputs.has("summary")    && generateSummary(content, outputLang).then((r) => (generated.summary = r)).catch(() => {}),
        outputs.has("flashcards") && generateFlashcards(content, outputLang).then((r) => (generated.flashcards = r)).catch(() => {}),
        outputs.has("quiz")       && generateQuiz(content, outputLang).then((r) => (generated.quiz = r)).catch(() => {}),
        outputs.has("plan")       && generateStudyPlan(content, outputLang).then((r) => (generated.plan = r)).catch(() => {}),
      ]);

      if (Object.keys(generated).length === 0) throw new Error("Nothing generated. Check your GROQ_API_KEY in the .env file.");
      setResults(generated);
      if (user?.id) awardXP(user.id, "GENERATE_KIT");
      if (voiceBuddy && generated.summary?.paragraphs?.[0]) {
        setTimeout(() => speak("Here is your summary. " + generated.summary.paragraphs[0]), 500);
      }
      const first = ["summary","flashcards","quiz","plan"].find((k) => generated[k]);
      if (first) setActiveResult(first);

      // Save session to Supabase (non-blocking)
      if (user?.id) {
        try {
          await saveStudySession(user.id, getTopicName(), generated);
        } catch (_) { /* never block UI */ }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Check your API key.");
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadStep("");
    }
  };

  const navigateWithData = (path, dataKey) => {
    if (results?.[dataKey]) sessionStorage.setItem(`kelvra_${dataKey}`, JSON.stringify(results[dataKey]));
    navigate(path);
  };

  const RESULT_TABS = [
    { id: "summary",    label: "Summary",    icon: "summarize" },
    { id: "flashcards", label: "Flashcards", icon: "style" },
    { id: "quiz",       label: "Quiz",       icon: "quiz" },
    { id: "plan",       label: "Study Plan", icon: "calendar_today" },
  ].filter((t) => results?.[t.id]);

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="study" />
      <main className="md:ml-64 min-h-screen p-4 sm:p-8 pb-24 md:pb-8 flex flex-col overflow-x-hidden">

        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight">New Study Session</h2>
            <p className="text-on-surface-variant font-label text-sm mt-1">Transform your source material into architectural knowledge.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10 self-start sm:self-auto">
            <span className="material-symbols-outlined text-primary-container text-xl" style={{fontVariationSettings:"'FILL' 1"}}>bolt</span>
            <span className="text-xs font-bold font-label uppercase tracking-tighter">AI Buddy:</span>
            <span className={`text-xs font-bold uppercase tracking-widest ${voiceBuddy ? "text-primary-container" : "text-on-surface-variant"}`}>{voiceBuddy ? "ON" : "OFF"}</span>
            <button onClick={() => {
              const next = !voiceBuddy;
              setVoiceBuddy(next);
              setVoiceEnabled(next);
              if (!next) stopSpeaking();
              else speak("AI Buddy is now on. I will read your study materials.");
            }}
              className={`w-10 h-5 rounded-full relative transition-all duration-300 ${voiceBuddy ? "bg-primary-container/30" : "bg-surface-container-highest"}`}>
              <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all duration-300 ${voiceBuddy ? "translate-x-5 bg-primary-container" : "translate-x-0.5 bg-on-surface-variant"}`} />
            </button>
          </div>
        </header>

        {!results && (
          <div className="grid grid-cols-12 gap-8 flex-1">
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-surface-container-low p-1.5 rounded-xl flex gap-1 border border-outline-variant/5">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-3 px-3 rounded-lg font-label text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      tab === t.id ? "bg-surface-container-highest text-primary-container border border-primary-container/20" : "text-on-surface-variant hover:bg-surface-container-highest/30"
                    }`}>
                    <span className="material-symbols-outlined text-lg">{t.icon}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative" style={{minHeight: 280}}>
                {tab === "paste" && (
                  <textarea value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full h-72 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-8 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary-container/50 transition-all resize-none outline-none leading-relaxed text-sm"
                    placeholder="Paste your lecture notes, textbook content, or any study material here..." />
                )}
                {tab === "topic" && (
                  <div className="h-72 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-8 flex flex-col gap-4">
                    <input value={topic} onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-base"
                      placeholder="e.g. Photosynthesis, World War II, Python basics..." />
                    <p className="text-on-surface-variant text-sm">AI will generate a complete study kit for this topic from scratch.</p>
                  </div>
                )}
                {tab === "pdf" && (
                  <div className="h-72 bg-surface-container-low border border-outline-variant/15 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    {pdfExtracting ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
                        <p className="text-on-surface-variant text-sm">Extracting text from PDF...</p>
                      </div>
                    ) : pdfInfo ? (
                      <div className="flex flex-col items-center gap-3 px-8 text-center">
                        <span className="material-symbols-outlined text-primary-container text-4xl" style={{fontVariationSettings:"'FILL' 1"}}>picture_as_pdf</span>
                        <p className="text-on-surface font-bold">{pdfInfo.name}</p>
                        <p className="text-on-surface-variant text-sm">{pdfInfo.pages} pages extracted · {pdfText.length.toLocaleString()} characters</p>
                        <button onClick={() => { setPdfFile(null); setPdfText(""); setPdfInfo(null); }}
                          className="text-xs text-on-surface-variant hover:text-error transition-colors">Remove</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-4 cursor-pointer w-full h-full justify-center border-2 border-dashed border-outline-variant/30 rounded-2xl hover:border-primary-container/40 transition-colors">
                        <span className="material-symbols-outlined text-primary-container text-4xl">picture_as_pdf</span>
                        <div className="text-center">
                          <p className="text-on-surface font-bold">Upload PDF</p>
                          <p className="text-on-surface-variant text-sm mt-1">Click to browse — text-based PDFs only</p>
                        </div>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                )}
                {tab === "image" && (
                  <div className="h-72 bg-surface-container-low border border-outline-variant/15 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                    {imageExtracting ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
                        <p className="text-on-surface-variant text-sm">Extracting text from image...</p>
                      </div>
                    ) : imagePreview && imageText ? (
                      <div className="flex items-center gap-6 px-8 w-full">
                        <img src={imagePreview} alt="Uploaded" className="w-24 h-24 object-cover rounded-xl border border-outline-variant/20 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface font-bold text-sm">{imageFile?.name}</p>
                          <p className="text-on-surface-variant text-xs mt-1">{imageText.length.toLocaleString()} characters extracted</p>
                          <p className="text-on-surface-variant text-xs mt-2 line-clamp-3">{imageText.slice(0, 120)}...</p>
                          <button onClick={() => { setImageFile(null); setImagePreview(""); setImageText(""); }}
                            className="text-xs text-on-surface-variant hover:text-error transition-colors mt-2">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-4 cursor-pointer w-full h-full justify-center border-2 border-dashed border-outline-variant/30 rounded-2xl hover:border-primary-container/40 transition-colors">
                        <span className="material-symbols-outlined text-primary-container text-4xl">image</span>
                        <div className="text-center">
                          <p className="text-on-surface font-bold">Upload Image</p>
                          <p className="text-on-surface-variant text-sm mt-1">JPG, PNG, WEBP — max 5MB</p>
                        </div>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-error-container/10 border border-error/20 rounded-xl px-5 py-4 text-error text-sm flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              <div className="flex justify-center pt-2">
                <button onClick={handleGenerate} disabled={loading}
                  className="group w-full sm:w-auto px-8 sm:px-12 py-5 bg-primary-container text-on-primary-fixed font-headline font-bold text-base sm:text-lg rounded-2xl shadow-[0_0_50px_rgba(110,231,183,0.15)] hover:shadow-[0_0_60px_rgba(110,231,183,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {loading ? (
                    <><div className="w-5 h-5 border-2 border-on-primary-fixed/30 border-t-on-primary-fixed rounded-full animate-spin" /><span>{loadStep || "Generating..."}</span></>
                  ) : (
                    <>Generate Study Material<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{fontVariationSettings:"'FILL' 1"}}>auto_awesome</span></>
                  )}
                </button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <section>
                <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Choose Output Format</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OUTPUTS.map((o) => (
                    <button key={o.id} onClick={() => toggleOutput(o.id)}
                      className={`p-4 rounded-xl flex flex-col gap-2 items-start text-left transition-all min-h-[60px] ${
                        outputs.has(o.id) ? "bg-surface-container-low border-2 border-primary-container" : "bg-surface-container-low border border-outline-variant/15 opacity-60 hover:opacity-90 hover:border-primary-container/40"
                      }`}>
                      <span className={`material-symbols-outlined ${outputs.has(o.id) ? "text-primary-container" : "text-on-surface-variant"}`}
                        style={outputs.has(o.id) ? {fontVariationSettings:"'FILL' 1"} : {}}>{o.icon}</span>
                      <span className={`font-label font-bold text-sm ${outputs.has(o.id) ? "text-on-surface" : "text-on-surface-variant"}`}>{o.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Language Settings</h3>
                <div className="space-y-3">
                  {[{label:"Input Language",val:inputLang,set:setInputLang},{label:"Output Language",val:outputLang,set:setOutputLang}].map((l) => (
                    <div key={l.label}>
                      <label className="block font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">{l.label}</label>
                      <div className="relative">
                        <select value={l.val} onChange={(e) => l.set(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl py-3 px-4 appearance-none text-sm outline-none text-on-surface">
                          {LANGS.map((lang) => <option key={lang}>{lang}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="bg-surface-container-highest/40 p-6 rounded-2xl border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim">lightbulb</span>
                  <h4 className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">AI Tip</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Structured notes increase study plan accuracy by <span className="text-primary-container font-bold">42%</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => setResults(null)}
                className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-label text-sm font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                New Session
              </button>
              <div className="flex items-center gap-2 text-primary-container text-sm font-bold">
                <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                Study kit ready!
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {RESULT_TABS.map((t) => (
                <button key={t.id} onClick={() => setActiveResult(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-sm font-medium transition-all ${
                    activeResult === t.id
                      ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                      : "bg-surface-container-low border border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30"
                  }`}>
                  <span className="material-symbols-outlined text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div>
              {activeResult === "summary"    && results.summary    && <SummaryResult data={results.summary} />}
              {activeResult === "flashcards" && results.flashcards && <FlashcardsResult data={results.flashcards} onStudy={() => navigateWithData("/flashcards","flashcards")} />}
              {activeResult === "flashcards" && results.flashcards && results.flashcards.length > 0 && (
                <div className="mt-6">
                  <MnemonicCard
                    question={results.flashcards[0].question}
                    answer={results.flashcards[0].answer}
                  />
                </div>
              )}
              {activeResult === "quiz"       && results.quiz       && <QuizResult data={results.quiz} onStudy={() => navigateWithData("/quiz","quiz")} />}
              {activeResult === "plan"       && results.plan       && <PlanResult data={results.plan} />}
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-outline-variant/5">
              {results.flashcards && (
                <button onClick={() => navigateWithData("/flashcards","flashcards")}
                  className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] transition-transform text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">style</span>Study Flashcards
                </button>
              )}
              {results.quiz && (
                <button onClick={() => navigateWithData("/quiz","quiz")}
                  className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">quiz</span>Take Quiz
                </button>
              )}
              <button onClick={() => navigate("/focus")}
                className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">timer</span>Focus Mode
              </button>
              <button onClick={() => navigate("/socratic")}
                className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Socratic Tutor
              </button>
              <button
                onClick={async () => {
                  setSharing(true);
                  const result = await shareStudyKit(user?.id, getContent(), results);
                  if (result.success) {
                    setShareUrl(result.shareUrl);
                    await navigator.clipboard.writeText(result.shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 3000);
                    if (user?.id) awardXP(user.id, "SHARE_KIT");
                  }
                  setSharing(false);
                }}
                disabled={sharing}
                className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">
                  {copied ? "check" : "share"}
                </span>
                {sharing ? "Sharing..." : copied ? "Link copied!" : "Share kit"}
              </button>
              <button
                onClick={async () => {
                  setExporting(true);
                  try {
                    exportStudyKitPDF(getContent() || "Study Kit", results);
                  } catch (err) {
                    console.error("PDF export error:", err);
                  }
                  setExporting(false);
                }}
                disabled={exporting}
                className="px-6 py-3 bg-surface-container-low border border-outline-variant/20 text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                {exporting ? "Exporting..." : "Export PDF"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon: "dashboard", label: "Home",  path: "/dashboard" },
          { icon: "menu_book", label: "Study", path: "/study", active: true },
          { icon: "style",     label: "Cards", path: "/flashcards" },
          { icon: "insights",  label: "Stats", path: "/progress" },
        ].map((item) => (
          <div key={item.label} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer min-h-[44px] justify-center ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings:"'FILL' 1" } : {}}>{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </div>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}