import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import { signOut, supabase } from "../utils/supabase";

export default function SettingsPage({ user }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name || ""
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate("/");
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (_) {}
    setSaving(false);
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "K";

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="settings" />

      <main className="md:ml-64 min-h-screen pb-24 md:pb-12">

        {/* Top bar */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/15 flex items-center px-6 py-4 gap-4">
          <button onClick={() => navigate(-1)}
            className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-headline font-bold text-on-surface text-xl tracking-tight">Settings</h2>
        </header>

        <div className="px-6 pt-24 max-w-2xl mx-auto space-y-6">

          {/* Profile card */}
          <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">person</span>
              Profile
            </h3>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary-container/30">
                <span className="text-xl font-bold text-on-primary-container">{initials}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">
                  {user?.user_metadata?.full_name || "No name set"}
                </p>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Display Name
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-surface-container-highest border border-outline-variant/20 focus:border-primary-container/50 outline-none rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 transition-colors"
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !displayName.trim()}
                  className="px-5 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                  {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="mt-4 space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label">
                Email
              </label>
              <div className="bg-surface-container-highest/50 border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface-variant">
                {user?.email}
              </div>
            </div>
          </section>

          {/* Learning preferences */}
          <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">school</span>
              Learning Preferences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Study Type",      value: user?.user_metadata?.study_type     || "Not set" },
                { label: "Goal",            value: user?.user_metadata?.goal           || "Not set" },
                { label: "Learning Style",  value: user?.user_metadata?.learning_style || "Not set" },
              ].map((p) => (
                <div key={p.label} className="bg-surface-container-highest/40 rounded-xl p-4 border border-outline-variant/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{p.label}</p>
                  <p className="text-sm font-medium text-on-surface">{p.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              className="mt-4 text-xs font-bold text-primary-container hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">edit</span>
              Update preferences
            </button>
          </section>

          {/* Account actions */}
          <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8">
            <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">manage_accounts</span>
              Account
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-container-highest/40 rounded-xl border border-outline-variant/10">
                <div>
                  <p className="text-sm font-medium text-on-surface">Account ID</p>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{user?.id?.slice(0, 16)}…</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-3 p-4 bg-error-container/10 border border-error/20 text-error font-bold rounded-xl hover:bg-error-container/20 transition-all disabled:opacity-50">
                <span className="material-symbols-outlined">logout</span>
                {loggingOut ? "Signing out…" : "Sign Out"}
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-3 flex justify-between items-center z-50"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {[
          { icon: "dashboard", path: "/dashboard" },
          { icon: "menu_book", path: "/study" },
          { icon: "style",     path: "/flashcards" },
          { icon: "insights",  path: "/progress" },
          { icon: "settings",  path: "/settings", active: true },
        ].map((item) => (
          <div key={item.icon} onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 cursor-pointer ${item.active ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined"
              style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
          </div>
        ))}
      </nav>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
