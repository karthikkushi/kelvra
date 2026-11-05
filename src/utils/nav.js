// src/utils/nav.js
// The app's 5 sections. Every page still exists at its own URL; the menu just groups them,
// so students see 5 choices instead of 18. Pure data + helpers: tested in logic.test.js.

export const SECTIONS = [
  {
    id: "home", label: "Home", icon: "home", hint: "Today's plan",
    pages: [{ id: "dashboard", label: "Today", icon: "today", path: "/dashboard" }],
  },
  {
    id: "learn", label: "Learn", icon: "menu_book", hint: "Make notes into study kits",
    pages: [
      { id: "study",      label: "Study kit",  icon: "auto_awesome", path: "/study" },
      { id: "flashcards", label: "Flashcards", icon: "style",        path: "/flashcards" },
      { id: "socratic",   label: "AI Tutor",   icon: "psychology",   path: "/socratic" },
      { id: "explore",    label: "Explore",    icon: "explore",      path: "/explore" },
    ],
  },
  {
    id: "practice", label: "Practice", icon: "edit_note", hint: "Test yourself and fix mistakes",
    pages: [
      { id: "review",   label: "Review",       icon: "repeat",          path: "/review" },
      { id: "quiz",     label: "Quiz",         icon: "quiz",            path: "/quiz" },
      { id: "mistakes", label: "Mistakes",     icon: "assignment_late", path: "/mistakes" },
      { id: "answer",   label: "Answer coach", icon: "draw",            path: "/answer" },
    ],
  },
  {
    id: "coach", label: "Coach", icon: "diversity_3", hint: "Mentor, habits, focus, stress",
    pages: [
      { id: "mentor",  label: "Mentor",       icon: "diversity_3",      path: "/mentor" },
      { id: "habits",  label: "Habits",       icon: "self_improvement", path: "/habits" },
      { id: "focus",   label: "Focus timer",  icon: "timer",            path: "/focus" },
      { id: "debrief", label: "Test debrief", icon: "rate_review",      path: "/debrief" },
      { id: "reset",   label: "Stress reset", icon: "self_care",        path: "/reset" },
    ],
  },
  {
    id: "me", label: "Me", icon: "person", hint: "Progress, family, settings",
    pages: [
      { id: "insights",    label: "Progress",      icon: "insights",        path: "/progress" },
      { id: "agents",      label: "Exam forecast", icon: "smart_toy",       path: "/agents" },
      { id: "family",      label: "Family update", icon: "family_restroom", path: "/family" },
      { id: "leaderboard", label: "Leaderboard",   icon: "leaderboard",     path: "/leaderboard" },
      { id: "settings",    label: "Settings",      icon: "settings",        path: "/settings" },
    ],
  },
];

export const ALL_PAGES = SECTIONS.flatMap((s) => s.pages.map((p) => ({ ...p, section: s.id })));

export function sectionOf(pageId) {
  return SECTIONS.find((s) => s.pages.some((p) => p.id === pageId)) || SECTIONS[0];
}

// Where a section button should go: the page the student last used in it, else its first page.
export function sectionTarget(section, lastUsed = {}) {
  const last = section.pages.find((p) => p.id === lastUsed[section.id]);
  return (last || section.pages[0]).path;
}
