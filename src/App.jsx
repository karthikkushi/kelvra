// src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./utils/supabase";

import LandingPage    from "./pages/LandingPage";
import AuthPage       from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage  from "./pages/DashboardPage";
import StudyPage      from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage       from "./pages/QuizPage";
import ProgressPage   from "./pages/ProgressPage";
import FocusPage      from "./pages/FocusPage";
import SettingsPage   from "./pages/SettingsPage";
import AgentsPage    from "./pages/AgentsPage";

function Protected({ user, children }) {
  if (user === undefined) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm font-label">Loading Kelvra...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Redirect logged-in users: if onboarding not done → /onboarding, else → /dashboard
  const homeRedirect = user
    ? (user.user_metadata?.onboarding_done ? <Navigate to="/dashboard" replace /> : <Navigate to="/onboarding" replace />)
    : null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth"  element={user ? (homeRedirect ?? <Navigate to="/dashboard" replace />) : <AuthPage />} />
        <Route path="/onboarding" element={<Protected user={user}><OnboardingPage /></Protected>} />
        <Route path="/dashboard"  element={<Protected user={user}><DashboardPage  user={user} /></Protected>} />
        <Route path="/study"      element={<Protected user={user}><StudyPage       user={user} /></Protected>} />
        <Route path="/flashcards" element={<Protected user={user}><FlashcardsPage  user={user} /></Protected>} />
        <Route path="/quiz"       element={<Protected user={user}><QuizPage        user={user} /></Protected>} />
        <Route path="/progress"   element={<Protected user={user}><ProgressPage    user={user} /></Protected>} />
        <Route path="/focus"      element={<Protected user={user}><FocusPage /></Protected>} />
        <Route path="/settings"   element={<Protected user={user}><SettingsPage   user={user} /></Protected>} />
        <Route path="/agents"     element={<Protected user={user}><AgentsPage     user={user} /></Protected>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
