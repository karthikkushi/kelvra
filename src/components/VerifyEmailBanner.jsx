// src/components/VerifyEmailBanner.jsx
// Reminds email/password users to verify their email (needed for AI features). Google accounts are already verified.
import { useState } from "react";
import { resendVerification, reloadUser } from "../utils/firebase";

export default function VerifyEmailBanner({ user }) {
  const [state, setState] = useState(""); // "" | sending | sent | checking | not_yet | error
  const [hidden, setHidden] = useState(false);
  if (!user || user.email_verified || hidden) return null;

  const resend = async () => {
    setState("sending");
    const { error } = await resendVerification();
    setState(error ? "error" : "sent");
  };
  const check = async () => {
    setState("checking");
    try {
      const u = await reloadUser();
      if (!u?.email_verified) setState("not_yet");
    } catch {
      setState("error");
    }
  };

  return (
    <div role="status"
      className="fixed z-[55] left-3 right-3 bottom-20 md:left-auto md:right-6 md:bottom-6 md:max-w-sm bg-surface-container-high border border-tertiary-fixed-dim/40 shadow-2xl rounded-2xl px-4 py-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="flex items-center gap-2 text-on-surface">
        <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">mark_email_unread</span>
        Verify your email ({user.email}) to use AI features.
      </span>
      <span className="flex items-center gap-3 text-xs font-bold">
        <button onClick={check} disabled={state === "checking"} className="text-primary-container hover:underline">
          {state === "checking" ? "Checking…" : "I've verified"}
        </button>
        <button onClick={resend} disabled={state === "sending" || state === "sent"} className="text-on-surface-variant hover:underline">
          {state === "sent" ? "Link sent ✓" : state === "sending" ? "Sending…" : "Resend link"}
        </button>
        <button onClick={() => setHidden(true)} aria-label="Hide" className="text-on-surface-variant">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </span>
      {state === "not_yet" && <span className="w-full text-xs text-on-surface-variant">Not verified yet. Open the link in the email (check spam), then tap "I've verified".</span>}
      {state === "error" && <span className="w-full text-xs text-error">Something went wrong. Try again in a minute.</span>}
    </div>
  );
}
