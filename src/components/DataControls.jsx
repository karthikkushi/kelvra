// src/components/DataControls.jsx
// Settings section: download my data, delete my account (DPDP data rights), links to the policies.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadMyData, deleteMyAccount } from "../utils/account";

export default function DataControls({ user }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const google = user?.provider === "google.com";

  const download = async () => {
    setBusy("download"); setError(""); setMsg("");
    try { await downloadMyData(); setMsg("Your data file has been downloaded."); }
    catch (err) { setError(err.message); }
    finally { setBusy(""); }
  };

  const remove = async () => {
    setBusy("delete"); setError("");
    try {
      await deleteMyAccount({ password });
      navigate("/", { replace: true });
      window.location.reload(); // start clean: no cached data from the deleted account
    } catch (err) {
      setError(err.message);
      setBusy("");
    }
  };

  return (
    <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
      <h3 className="font-headline text-lg font-bold mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant">shield_person</span>
        Your data
      </h3>
      <p className="text-sm text-on-surface-variant mb-5">
        Your study data belongs to you. Read the <a href="/privacy" className="text-primary-container underline">Privacy policy</a> and{" "}
        <a href="/terms" className="text-primary-container underline">Terms</a>.
      </p>

      <div className="space-y-3">
        <button onClick={download} disabled={!!busy}
          className="w-full flex items-center justify-between gap-3 p-4 bg-surface-container-highest/40 rounded-xl border border-outline-variant/10 hover:bg-surface-container-highest text-left disabled:opacity-50">
          <span>
            <span className="block text-sm font-medium text-on-surface">Download my data</span>
            <span className="block text-xs text-on-surface-variant">A file with everything Kelvra has saved for your account.</span>
          </span>
          <span className="material-symbols-outlined text-on-surface-variant">{busy === "download" ? "hourglass_top" : "download"}</span>
        </button>

        {!confirming ? (
          <button onClick={() => { setConfirming(true); setError(""); }}
            className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-error/20 hover:bg-error-container/10 text-left">
            <span>
              <span className="block text-sm font-medium text-error">Delete my account</span>
              <span className="block text-xs text-on-surface-variant">Deletes your account and all your study data. This cannot be undone.</span>
            </span>
            <span className="material-symbols-outlined text-error">delete_forever</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl border-2 border-error/40 bg-error-container/10 space-y-3" role="group" aria-label="Confirm account deletion">
            <p className="text-sm text-on-surface">
              This permanently deletes your account, study kits, cards, mistakes, answers, mentor chats, habits, check-ins and shared kits.
              Download your data first if you want a copy.
            </p>
            <label className="block text-xs text-on-surface-variant">Type <strong className="text-error">DELETE</strong> to confirm
              <input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off"
                className="mt-1 w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-error/60" />
            </label>
            {!google && (
              <label className="block text-xs text-on-surface-variant">Your password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  className="mt-1 w-full bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-error/60" />
              </label>
            )}
            {google && <p className="text-xs text-on-surface-variant">You'll be asked to sign in with Google once more to confirm.</p>}
            <div className="flex gap-2">
              <button onClick={remove} disabled={typed !== "DELETE" || (!google && !password) || busy === "delete"}
                className="flex-1 py-3 rounded-xl bg-error text-white font-bold text-sm disabled:opacity-40">
                {busy === "delete" ? "Deleting…" : "Delete everything"}
              </button>
              <button onClick={() => { setConfirming(false); setTyped(""); setPassword(""); setError(""); }} className="px-4 py-3 rounded-xl text-sm text-on-surface-variant">Cancel</button>
            </div>
          </div>
        )}
        {msg && <p role="status" className="text-xs text-primary-container">{msg}</p>}
        {error && <p role="alert" className="text-xs text-error">{error}</p>}
      </div>
    </section>
  );
}
