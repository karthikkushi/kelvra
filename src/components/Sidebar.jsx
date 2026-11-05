// src/components/Sidebar.jsx
// App navigation: a sidebar on desktop, a bottom bar (with a "More" sheet) on phones.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onUserChange, signOut } from "../utils/firebase";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { id: "dashboard",   icon: "dashboard",   label: "Dashboard",   path: "/dashboard" },
  { id: "study",       icon: "menu_book",   label: "Study",       path: "/study" },
  { id: "review",      icon: "repeat",      label: "Review",      path: "/review" },
  { id: "flashcards",  icon: "style",       label: "Flashcards",  path: "/flashcards" },
  { id: "quiz",        icon: "quiz",        label: "Quiz",        path: "/quiz" },
  { id: "mistakes",    icon: "assignment_late", label: "Mistakes", path: "/mistakes" },
  { id: "mentor",      icon: "diversity_3", label: "Mentor",      path: "/mentor" },
  { id: "explore",     icon: "explore",     label: "Explore",     path: "/explore" },
  { id: "agents",      icon: "smart_toy",   label: "AI Agents",   path: "/agents" },
  { id: "socratic",    icon: "psychology",  label: "AI Tutor",    path: "/socratic" },
  { id: "focus",       icon: "timer",       label: "Focus",       path: "/focus" },
  { id: "leaderboard", icon: "leaderboard", label: "Leaderboard", path: "/leaderboard" },
  { id: "insights",    icon: "insights",    label: "Insights",    path: "/progress" },
];

// The four most used pages sit on the phone bar; everything else is under "More".
const MOBILE_MAIN = ["dashboard", "study", "review", "mentor"];
const SHORT = { dashboard: "Home", flashcards: "Cards", leaderboard: "Ranks", insights: "Stats" };

const filled = { fontVariationSettings: "'FILL' 1" };

function initialsOf(user) {
  const name = user?.user_metadata?.full_name;
  if (name) return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return user?.email?.[0]?.toUpperCase() ?? "K";
}

function MobileNav({ active, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const go = (path) => { setOpen(false); navigate(path); };
  const moreActive = !MOBILE_MAIN.includes(active);

  return (
    <>
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-surface-container-low rounded-t-3xl p-5 pb-8 border-t border-outline-variant/15">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-5" />
            <div className="grid grid-cols-3 gap-3">
              {LINKS.filter((l) => !MOBILE_MAIN.includes(l.id)).concat([{ id: "settings", icon: "settings", label: "Settings", path: "/settings" }]).map((l) => (
                <button key={l.id} onClick={() => go(l.path)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl text-xs font-bold ${
                    active === l.id ? "bg-surface-container-highest text-primary-container" : "bg-surface-container text-on-surface-variant"
                  }`}>
                  <span className="material-symbols-outlined" style={active === l.id ? filled : {}}>{l.icon}</span>
                  {l.label}
                </button>
              ))}
            </div>
            <button onClick={onLogout}
              className="mt-4 w-full py-3 rounded-2xl text-sm font-bold text-error bg-error-container/10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">logout</span> Sign out
            </button>
          </div>
        </div>
      )}
      <nav aria-label="Main"
        className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-4 py-2.5 flex justify-between items-center z-50"
        style={{ paddingBottom: "calc(0.625rem + env(safe-area-inset-bottom))" }}>
        {LINKS.filter((l) => MOBILE_MAIN.includes(l.id)).map((l) => (
          <button key={l.id} onClick={() => go(l.path)}
            className={`flex-1 flex flex-col items-center gap-1 ${active === l.id ? "text-primary-container" : "text-on-surface-variant"}`}>
            <span className="material-symbols-outlined" style={active === l.id ? filled : {}}>{l.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{SHORT[l.id] || l.label}</span>
          </button>
        ))}
        <button onClick={() => setOpen(true)} aria-expanded={open}
          className={`flex-1 flex flex-col items-center gap-1 ${moreActive ? "text-primary-container" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined" style={moreActive ? filled : {}}>apps</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
        </button>
      </nav>
    </>
  );
}

export default function Sidebar({ active = "dashboard", mobileNav = true }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => onUserChange(setUser), []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low flex-col py-6 gap-2 hidden md:flex">
        <div className="px-6 mb-6">
          <h1 className="font-headline text-lg font-extrabold text-on-surface tracking-tighter">Kelvra</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-label">Study smarter</p>
        </div>
        <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto">
          {LINKS.map((l) => (
            <button key={l.id}
              onClick={() => navigate(l.path)}
              aria-current={active === l.id ? "page" : undefined}
              className={`w-[calc(100%-1rem)] flex items-center px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 gap-3 font-label text-sm font-medium text-left ${
                active === l.id
                  ? "bg-surface-container-highest text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-highest/50 hover:translate-x-1"
              }`}>
              <span className="material-symbols-outlined" style={active === l.id ? filled : {}}>{l.icon}</span>
              {l.label}
              {["review", "mistakes", "explore"].includes(l.id) && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-container/15 text-primary-container">New</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 mt-auto space-y-1">
          <button onClick={() => navigate("/settings")}
            className="w-[calc(100%-1rem)] mx-2 mb-3 flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10 hover:bg-surface-container-highest transition-all text-left">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-on-primary-container">{initialsOf(user)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">
                {user?.user_metadata?.full_name || user?.email || "My Account"}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email || ""}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
          </button>

          <div className="px-4 mb-1">
            <ThemeToggle />
          </div>
          <button onClick={() => navigate("/settings")}
            className={`w-[calc(100%-1rem)] text-on-surface-variant hover:bg-surface-container-highest/50 mx-2 rounded-lg flex items-center px-4 py-2 gap-3 transition-all ${active === "settings" ? "bg-surface-container-highest text-primary-container" : ""}`}>
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button onClick={handleLogout}
            className="w-[calc(100%-1rem)] text-on-surface-variant hover:bg-error-container/10 hover:text-error mx-2 rounded-lg flex items-center px-4 py-2 gap-3 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
      {mobileNav && <MobileNav active={active} onLogout={handleLogout} />}
    </>
  );
}
