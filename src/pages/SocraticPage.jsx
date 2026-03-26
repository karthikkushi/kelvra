import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./DashboardPage";
import {
  startSocraticSession,
  continueSocraticDialogue,
  getSocraticReveal,
} from "../utils/claudeAPI";

const SUGGESTED_TOPICS = [
  "Photosynthesis",
  "Newton's Laws",
  "DNA Replication",
  "French Revolution",
  "Pythagoras Theorem",
  "Supply and Demand",
  "Cell Division",
  "Quantum Physics",
];

export default function SocraticPage({ user }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [inputTopic, setInputTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [reveal, setReveal] = useState("");
  const [revealLoading, setRevealLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async (t) => {
    const topicToUse = t || inputTopic.trim();
    if (!topicToUse) return;
    setTopic(topicToUse);
    setMessages([]);
    setReveal("");
    setShowReveal(false);
    setTurnCount(0);
    setSessionActive(true);
    setLoading(true);
    try {
      const question = await startSocraticSession(topicToUse);
      setMessages([{ role: "ai", content: question, timestamp: new Date() }]);
    } catch (err) {
      setMessages([{ role: "ai", content: "Let's explore this topic together. What do you already know about it?", timestamp: new Date() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;
    const userMsg = userInput.trim();
    setUserInput("");
    const newMessages = [...messages, { role: "user", content: userMsg, timestamp: new Date() }];
    setMessages(newMessages);
    setLoading(true);
    setTurnCount((prev) => prev + 1);
    try {
      const response = await continueSocraticDialogue(topic, newMessages, userMsg);
      setMessages([...newMessages, { role: "ai", content: response, timestamp: new Date() }]);
    } catch {
      setMessages([...newMessages, { role: "ai", content: "That's a great thought! Can you tell me more about why you think that?", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    setRevealLoading(true);
    setShowReveal(true);
    try {
      const explanation = await getSocraticReveal(topic, messages);
      setReveal(explanation);
    } catch {
      setReveal("Great exploration! The key to " + topic + " lies in understanding the core concepts you've been discovering through our conversation.");
    } finally {
      setRevealLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-on-surface font-body">
      <Sidebar active="socratic" />
      <main className="md:ml-64 min-h-screen flex flex-col">

        {!sessionActive ? (
          /* ── TOPIC SELECTION ── */
          <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-secondary-container/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-secondary text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface mb-3">
                Socratic AI Tutor
              </h1>
              <p className="text-on-surface-variant leading-relaxed">
                I won't give you answers. I'll ask questions that guide you to discover them yourself.
                This is how you <span className="text-primary-container font-semibold">actually learn</span>.
              </p>
            </div>

            {/* Topic input */}
            <div className="w-full space-y-4">
              <div className="relative">
                <input
                  value={inputTopic}
                  onChange={(e) => setInputTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startSession()}
                  placeholder="What topic do you want to explore?"
                  className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-6 py-4 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-base transition-all"
                />
              </div>
              <button
                onClick={() => startSession()}
                disabled={!inputTopic.trim()}
                className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                <span className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                Start Socratic Session
              </button>
            </div>

            {/* Suggested topics */}
            <div className="w-full mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 text-center">
                Or try one of these
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_TOPICS.map((t) => (
                  <button key={t} onClick={() => startSession(t)}
                    className="px-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-full text-sm text-on-surface-variant hover:border-primary-container/30 hover:text-primary-container transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="w-full mt-10 bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
              <h3 className="font-bold text-sm text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-sm">info</span>
                How Socratic learning works
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "help",     text: "AI asks you a question about the topic" },
                  { icon: "chat",     text: "You think and answer — no pressure, any answer is fine" },
                  { icon: "lightbulb",text: "AI guides you deeper with follow-up questions" },
                  { icon: "school",   text: "After 5+ exchanges, request the full explanation" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary-container text-sm">{s.icon}</span>
                    {s.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── CHAT SESSION ── */
          <div className="flex-1 flex flex-col h-screen md:h-auto">

            {/* Chat header */}
            <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSessionActive(false)}
                  className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div>
                  <h2 className="font-headline font-bold text-on-surface">{topic}</h2>
                  <p className="text-xs text-on-surface-variant">{turnCount} exchanges · Socratic session</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {turnCount >= 3 && !showReveal && (
                  <button onClick={handleReveal}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface-variant hover:border-primary-container/30 hover:text-primary-container transition-all uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    Reveal answer
                  </button>
                )}
                <button onClick={() => { setSessionActive(false); setMessages([]); }}
                  className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all">
                  New topic
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-3xl mx-auto w-full pb-36 md:pb-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "ai" && (
                    <div className="w-9 h-9 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-secondary text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                  )}
                  <div className={`max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-container text-on-primary-container rounded-tr-sm"
                      : "bg-surface-container-low border border-outline-variant/10 text-on-surface rounded-tl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary-container">
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex justify-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-secondary text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-end gap-1 h-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reveal section */}
              {showReveal && (
                <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                    <h3 className="font-headline font-bold text-primary-container">Full Explanation</h3>
                  </div>
                  {revealLoading ? (
                    <div className="flex items-center gap-3 text-on-surface-variant">
                      <div className="w-5 h-5 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
                      Building explanation from our conversation...
                    </div>
                  ) : (
                    <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{reveal}</p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => navigate("/study")}
                      className="px-5 py-2 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm hover:scale-[1.02] transition-transform">
                      Generate study kit →
                    </button>
                    <button onClick={() => { setSessionActive(false); setMessages([]); setShowReveal(false); }}
                      className="px-5 py-2 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm hover:bg-surface-container-highest transition-all">
                      New topic
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {!showReveal && (
              <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-background/95 backdrop-blur-xl border-t border-outline-variant/10 p-4 z-40">
                <div className="max-w-3xl mx-auto flex gap-3 items-end">
                  <textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts... (Enter to send)"
                    rows={2}
                    className="flex-1 bg-surface-container-low border border-outline-variant/15 rounded-2xl px-5 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-primary-container/50 text-sm resize-none transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!userInput.trim() || loading}
                    className="w-12 h-12 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                    <span className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
                <p className="text-center text-[10px] text-on-surface-variant/40 mt-2 uppercase tracking-widest">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <style>{`.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}`}</style>
    </div>
  );
}
