// src/App.jsx
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import InstallPrompt from "./components/InstallPrompt";
import OfflineBanner from "./components/OfflineBanner";
import ErrorBoundary from "./components/ErrorBoundary";

// Each page is its own file in the build, so the landing page loads without
// the code for charts, PDF reading and the rest of the app.
const AuthPage        = lazy(() => import("./pages/AuthPage"));
const OnboardingPage  = lazy(() => import("./pages/OnboardingPage"));
const DashboardPage   = lazy(() => import("./pages/DashboardPage"));
const StudyPage       = lazy(() => import("./pages/StudyPage"));
const FlashcardsPage  = lazy(() => import("./pages/FlashcardsPage"));
const QuizPage        = lazy(() => import("./pages/QuizPage"));
const ProgressPage    = lazy(() => import("./pages/ProgressPage"));
const FocusPage       = lazy(() => import("./pages/FocusPage"));
const SettingsPage    = lazy(() => import("./pages/SettingsPage"));
const AgentsPage      = lazy(() => import("./pages/AgentsPage"));
const SocraticPage    = lazy(() => import("./pages/SocraticPage"));
const MentorPage      = lazy(() => import("./pages/MentorPage"));
const SharedKitPage   = lazy(() => import("./pages/SharedKitPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));

// Same check as utils/firebase.js, done here so the landing page does not wait for Firebase to download.
const firebaseReady = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_APP_ID
);

function Loading({ label = "Loading Kelvra..." }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-surface-container-highest border-t-primary-container rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm font-label">{label}</p>
      </div>
    </div>
  );
}

function SetupNeeded() {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="font-headline text-2xl font-bold">Kelvra is not connected to its database</h1>
        <p className="text-on-surface-variant text-sm">
          The <code>VITE_FIREBASE_*</code> settings are missing. Copy <code>.env.example</code> to <code>.env</code>,
          fill in the values from your Firebase project, and restart the app.
        </p>
      </div>
    </div>
  );
}

// A crash on one page should not stick after the student moves to another page.
function PageErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

function Protected({ user, children }) {
  if (user === undefined) return <Loading />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  // Firebase is loaded after the first paint, in its own file.
  useEffect(() => {
    if (!firebaseReady) return;
    let stop = () => {};
    let alive = true;
    import("./utils/firebase")
      .then(({ onUserChange }) => { if (alive) stop = onUserChange(setUser); })
      .catch(() => alive && setUser(null));
    return () => { alive = false; stop(); };
  }, []);

  const home = user?.user_metadata?.onboarding_done ? "/dashboard" : "/onboarding";
  const guard = (el) => (firebaseReady ? <Protected user={user}>{el}</Protected> : <SetupNeeded />);

  return (
    <BrowserRouter>
      <OfflineBanner />
      <PageErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/"     element={<LandingPage />} />
            <Route path="/auth" element={!firebaseReady ? <SetupNeeded /> : user === undefined ? <Loading /> : user ? <Navigate to={home} replace /> : <AuthPage />} />
            <Route path="/onboarding"  element={guard(<OnboardingPage />)} />
            <Route path="/dashboard"   element={guard(<DashboardPage   user={user} />)} />
            <Route path="/study"       element={guard(<StudyPage       user={user} />)} />
            <Route path="/flashcards"  element={guard(<FlashcardsPage  user={user} />)} />
            <Route path="/quiz"        element={guard(<QuizPage        user={user} />)} />
            <Route path="/progress"    element={guard(<ProgressPage    user={user} />)} />
            <Route path="/focus"       element={guard(<FocusPage />)} />
            <Route path="/settings"    element={guard(<SettingsPage    user={user} />)} />
            <Route path="/agents"      element={guard(<AgentsPage      user={user} />)} />
            <Route path="/socratic"    element={guard(<SocraticPage    user={user} />)} />
            <Route path="/mentor"      element={guard(<MentorPage      user={user} />)} />
            <Route path="/leaderboard" element={guard(<LeaderboardPage user={user} />)} />
            <Route path="/shared/:shareId" element={firebaseReady ? <SharedKitPage /> : <SetupNeeded />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PageErrorBoundary>
      <InstallPrompt />
    </BrowserRouter>
  );
}
