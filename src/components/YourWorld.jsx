// src/components/YourWorld.jsx
// Interest picker (student chooses; never inferred) and the "Your-world mode" bar for quizzes.
import { useState } from "react";
import { INTERESTS, MAX_INTERESTS, interestById } from "../utils/yourWorld";
import { updateUserProfile } from "../utils/firebase";

export function InterestPicker({ value = [], onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else if (value.length < MAX_INTERESTS) onChange([...value, id]);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Your interests">
        {INTERESTS.map((i) => {
          const on = value.includes(i.id);
          return (
            <button key={i.id} type="button" onClick={() => toggle(i.id)} aria-pressed={on}
              disabled={!on && value.length >= MAX_INTERESTS}
              className={`px-3 py-2 rounded-full border text-sm transition-all disabled:opacity-40 ${on ? "border-primary-container bg-primary-container/10 text-primary-container font-bold" : "border-outline-variant/20 text-on-surface-variant hover:border-primary-container/40"}`}>
              <span aria-hidden="true">{i.emoji}</span> {i.label}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-on-surface-variant mt-2">Pick up to {MAX_INTERESTS}. Kelvra only uses what you pick here; it never guesses your interests.</p>
    </div>
  );
}

// Bar above a quiz: retell the questions in one of the student's interests.
export function WorldModeBar({ user, active, busy, onPick }) {
  const saved = user?.user_metadata?.interests || [];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);

  if (editing || saved.length === 0) {
    return (
      <div className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 space-y-3">
        <p className="text-sm font-bold text-on-surface">Your-world mode: retell these questions in something you love</p>
        <InterestPicker value={draft} onChange={setDraft} />
        <div className="flex gap-2">
          <button disabled={!draft.length}
            onClick={() => { updateUserProfile({ interests: draft }); setEditing(false); onPick(draft[0]); }}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-bold disabled:opacity-40">
            Save and retell
          </button>
          {saved.length > 0 && <button onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-on-surface-variant">Cancel</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-wrap items-center gap-2 text-sm">
      <span className="text-on-surface-variant">Your-world mode:</span>
      {saved.map((id) => {
        const i = interestById(id);
        if (!i) return null;
        return (
          <button key={id} onClick={() => onPick(id)} disabled={busy} aria-pressed={active === id}
            className={`px-3 py-1.5 rounded-full border disabled:opacity-50 ${active === id ? "border-primary-container bg-primary-container/10 text-primary-container font-bold" : "border-outline-variant/20 text-on-surface-variant hover:text-primary-container"}`}>
            <span aria-hidden="true">{i.emoji}</span> {i.label}
          </button>
        );
      })}
      {active && <button onClick={() => onPick(null)} disabled={busy} className="px-3 py-1.5 rounded-full text-on-surface-variant underline">Original</button>}
      <button onClick={() => { setDraft(saved); setEditing(true); }} className="text-xs text-on-surface-variant underline ml-1">Change interests</button>
      {busy && <span className="text-xs text-on-surface-variant">Retelling…</span>}
    </div>
  );
}
