// src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, signInWithGoogle } from "../utils/supabase";

export default function AuthPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && !fullName) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await signIn(email, password);
        if (error) throw error;

        if (data?.user) {
          const onboardingDone = data.user.user_metadata?.onboarding_done;
          navigate(onboardingDone ? "/dashboard" : "/onboarding");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;

        setSuccess("Account created! Check your email to confirm, then log in.");
        setMode("login");
        setFullName("");
        setPassword("");
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Supabase will redirect automatically
    } catch (err) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl bg-surface-container-highest border border-outline-variant/20 focus:border-primary-container/50 outline-none text-on-surface placeholder:text-on-surface-variant/40 transition-colors font-body text-sm";

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex items-center justify-center p-6 overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <span className="font-headline font-bold text-2xl tracking-tighter text-on-surface">
              Kelvra
            </span>
          </div>

          <h1 className="font-headline text-3xl font-extrabold mb-2 text-on-surface">
            {mode === "login" ? "Welcome back" : "Start learning smarter"}
          </h1>

          <p className="text-on-surface-variant text-sm">
            {mode === "login"
              ? "Sign in to continue your learning journey"
              : "Create your free account — no credit card needed"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-6 sm:p-8 shadow-2xl">

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-highest border border-outline-variant/20 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-container transition-all mb-6 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">language</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label">or</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />

            {error && (
              <div className="bg-error-container/10 border border-error/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">error</span>
                <p className="text-error text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-sm">check_circle</span>
                <p className="text-primary-container text-xs">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Loading..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm text-on-surface-variant">
            {mode === "login" ? "No account?" : "Already have one?"}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              className="ml-2 text-primary-container font-bold hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Back */}
        <p className="text-center mt-6">
          <button onClick={() => navigate("/")}
            className="text-on-surface-variant hover:text-on-surface transition-colors text-sm flex items-center gap-2 mx-auto">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to home
          </button>
        </p>
      </div>

      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
