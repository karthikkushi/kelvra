// src/components/CrisisCard.jsx
// Shown instead of an AI reply when a message sounds like self-harm or suicide.
// The message is not sent to the AI and not saved.
import { HELPLINES } from "../utils/safety";

export default function CrisisCard({ onClose }) {
  return (
    <div role="alertdialog" aria-labelledby="crisis-title"
      className="bg-surface-container-low border-2 border-error/40 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        <div>
          <h2 id="crisis-title" className="font-headline text-lg font-bold text-on-surface">You matter more than any exam.</h2>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
            It sounds like you are going through something really heavy. You deserve support from a real person right now.
            Talking helps, and it is free and private.
          </p>
        </div>
      </div>
      <div className="grid gap-2">
        {HELPLINES.map((h) => (
          <a key={h.tel} href={`tel:${h.tel}`}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-error-container/15 border border-error/20 hover:bg-error-container/25">
            <span className="text-sm text-on-surface">{h.name}</span>
            <span className="font-headline font-bold text-error text-lg whitespace-nowrap">{h.number}</span>
          </a>
        ))}
      </div>
      <p className="text-sm text-on-surface-variant">
        Please also tell someone you trust today: a parent, relative, teacher, friend or school counsellor.
        If you are in danger right now, call <strong className="text-on-surface">112</strong>.
      </p>
      <p className="text-xs text-on-surface-variant/80">
        Kelvra is an AI study app. It cannot give the help a person can. What you wrote was not saved or sent to the AI.
      </p>
      {onClose && (
        <button onClick={onClose} className="text-xs font-bold text-on-surface-variant hover:text-on-surface underline">
          I'm safe, go back
        </button>
      )}
    </div>
  );
}
