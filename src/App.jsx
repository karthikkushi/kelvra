import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import StudyPage from "./pages/StudyPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import ProgressPage from "./pages/ProgressPage";
import FocusPage from "./pages/FocusPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/focus" element={<FocusPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;