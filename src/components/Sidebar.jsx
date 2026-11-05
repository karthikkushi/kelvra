// src/components/Sidebar.jsx
// App navigation with 5 sections (Home, Learn, Practice, Coach, Me) instead of 18 links.
// Desktop: the current section opens to show its pages. Phone: a 5-item bottom bar; tapping the
// section you are in opens a small menu of its pages. Each section remembers your last page.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onUserChange, signOut } from "../utils/firebase";
import { SECTIONS, sectionOf, sectionTarget } from "../utils/nav";
import ThemeToggle from "./ThemeToggle";

const filled = { fontVariationSettings: "'FILL' 1" };
const LAST_KEY = "kelvra_nav_last";

function readLast() {
  try { return JSON.parse(localStorage.getItem(LAST_KEY)) || {}; } catch { return {}; }
}
function rememberPage(sectionId, pageId) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify({ ...readLast(), [sectionId]: pageId })); } catch { /* storage blocked */ }
}

function initialsOf(user) {
  const name = user?.user_metadata?.full_name;
  if (name) return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return user?.email?.[0]?.toUpperCase() ?? "K";
}

function MobileNav({ active, onLogout }) {
  const navigate = useNavigate();
  const current = sectionOf(active);
  const [sheet, setSheet] = useState(null); // section whose pages are shown

  const tap = (s) => {
    if (s.id === current.id && s.pages.length > 1) setSheet(s);   // already here: show its pages
    else navigate(sectionTarget(s, readLast()));                   // else: go to the last page used there
  };
  const go = (path) => { setSheet(null); navigate(path); };

  return (
    <>
      {sheet && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50" onClick={() => setSheet(null)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label={sheet.label}
            className="absolute bottom-0 left-0 right-0 bg-surface-container-low rounded-t-3xl p-5 pb-8 border-t border-outline-variant/15">
            <div className="w-10 h-1 bg-outline-variant/40 rounded-full mx-auto mb-4" />
            <p className="font-headline font-bold text-on-surface">{sheet.label}</p>
            <p className="text-xs text-on-surface-variant mb-4">{sheet.hint}</p>
            <div className="grid grid-cols-2 gap-2">
              {sheet.pages.map((p) => (
                <button key={p.id} onClick={() => go(p.path)}
                  className={`flex items-center gap-2 px-3 py-3.5 rounded-2xl text-sm font-bold text-left ${
                    active === p.id ? "bg-surface-container-highest text-primary-container" : "bg-surface-container text-on-surface-variant"
                  }`}>
                  <span className="material-symbols-outlined" style={active === p.id ? filled : {}}>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>
            {sheet.id === "me" && (
              <button onClick={onLogout} className="mt-3 w-full py-3 rounded-2xl text-sm font-bold text-error bg-error-container/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">logout</span> Sign out
              </button>
            )}
          </div>
        </div>
      )}
      <nav aria-label="Main"
        className="md:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-outline-variant/15 px-2 py-2 flex justify-between items-center z-50"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
        {SECTIONS.map((s) => {
          const on = s.id === current.id;
          return (
            <button key={s.id} onClick={() => tap(s)} aria-current={on ? "page" : undefined}
              aria-haspopup={on && s.pages.length > 1 ? "dialog" : undefined}
              className={`flex-1 flex flex-col items-center gap-0.5 ${on ? "text-primary-container" : "text-on-surface-variant"}`}>
              <span className="material-symbols-outlined" style={on ? filled : {}}>{s.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter flex items-center">
                {s.label}{on && s.pages.length > 1 && <span className="material-symbols-outlined text-[12px] -mr-1">expand_less</span>}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar({ active = "dashboard", mobileNav = true }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const current = sectionOf(active);

  useEffect(() => onUserChange(setUser), []);
  useEffect(() => { rememberPage(current.id, active); }, [current.id, active]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low flex-col py-6 gap-2 hidden md:flex">
        <div className="px-6 mb-5">
          <h1 className="font-headline text-lg font-extrabold text-on-surface tracking-tighter">Kelvra</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-label">Study smarter</p>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto space-y-1">
          {SECTIONS.map((s) => {
            const open = s.id === current.id;
            return (
              <div key={s.id}>
                <button onClick={() => navigate(open ? s.pages[0].path : sectionTarget(s, readLast()))}
                  aria-expanded={s.pages.length > 1 ? open : undefined}
                  className={`w-[calc(100%-1rem)] mx-2 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-left transition-all ${
                    open ? "text-primary-container" : "text-on-surface-variant hover:bg-surface-container-highest/50"
                  }`}>
                  <span className="material-symbols-outlined" style={open ? filled : {}}>{s.icon}</span>
                  <span className="flex-1">{s.label}</span>
                  {s.pages.length > 1 && <span className="material-symbols-outlined text-base opacity-60">{open ? "expand_less" : "expand_more"}</span>}
                </button>
                {open && s.pages.length > 1 && (
                  <div className="ml-9 mr-2 mt-0.5 mb-2 border-l border-outline-variant/20 pl-2 space-y-0.5">
                    {s.pages.map((p) => (
                      <button key={p.id} onClick={() => navigate(p.path)} aria-current={active === p.id ? "page" : undefined}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-all ${
                          active === p.id ? "bg-surface-container-highest text-primary-container font-bold" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/40"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="px-4 mt-auto space-y-1">
          <button onClick={() => navigate("/settings")}
            className="w-[calc(100%-1rem)] mx-2 mb-2 flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-container-highest/40 border border-outline-variant/10 hover:bg-surface-container-highest transition-all text-left">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-on-primary-container">{initialsOf(user)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user?.user_metadata?.full_name || user?.email || "My Account"}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.email || ""}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
          </button>
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-on-surface-variant hover:text-error flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-lg">logout</span> Sign out
            </button>
          </div>
        </div>
      </aside>
      {mobileNav && <MobileNav active={active} onLogout={handleLogout} />}
    </>
  );
}
