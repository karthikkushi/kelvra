// src/components/MnemonicCard.jsx
import { useState } from "react";
import { generateMnemonic } from "../utils/claudeAPI";

export default function MnemonicCard({ question, answer, compact = false }) {
  const [mnemonic, setMnemonic] = useState("");
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState("auto");
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const result = await generateMnemonic(question, answer, style);
      setMnemonic(result);
      setOpen(true);
    } catch {
      setMnemonic("Try associating this concept with something you already know well.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const STYLE_OPTIONS = [
    { id: "auto",    label: "Auto",    icon: "auto_awesome" },
    { id: "story",   label: "Story",   icon: "menu_book" },
    { id: "acronym", label: "Acronym", icon: "sort_by_alpha" },
    { id: "rhyme",   label: "Rhyme",   icon: "music_note" },
    { id: "visual",  label: "Visual",  icon: "image" },
  ];

  if (compact) {
    return (
      <div className="mt-2">
        {!open ? (
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-sm">psychology</span>
            {loading ? "Generating..." : "Memory trick"}
          </button>
        ) : (
          <div className="mt-2 bg-surface-container-highest/50 rounded-xl p-3 border border-primary-container/10">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-primary-container text-xs">psychology</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-container">Memory Trick</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">{mnemonic}</p>
            <button onClick={() => { setOpen(false); setMnemonic(""); }}
              className="text-[10px] text-on-surface-variant/50 mt-1 hover:text-on-surface-variant transition-colors">
              Hide
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-secondary-container/20 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
        </div>
        <div>
          <h3 className="font-bold text-sm text-on-surface">Memory Palace</h3>
          <p className="text-xs text-on-surface-variant">AI-generated mnemonic</p>
        </div>
      </div>

      {/* Style picker */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STYLE_OPTIONS.map((s) => (
          <button key={s.id} onClick={() => setStyle(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              style === s.id
                ? "bg-primary-container/10 border border-primary-container/30 text-primary-container"
                : "bg-surface-container-highest text-on-surface-variant hover:border-outline-variant/30 border border-transparent"
            }`}>
            <span className="material-symbols-outlined text-xs">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading}
        className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Creating mnemonic...</>
        ) : (
          <><span className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Generate Memory Trick</>
        )}
      </button>

      {open && mnemonic && (
        <div className="mt-4 bg-surface-container-highest/40 border border-primary-container/10 rounded-xl p-4">
          <p className="text-sm text-on-surface leading-relaxed">{mnemonic}</p>
          <button onClick={() => { setOpen(false); setMnemonic(""); }}
            className="text-xs text-on-surface-variant/50 mt-2 hover:text-on-surface-variant transition-colors">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
