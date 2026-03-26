// src/components/ExamCountdown.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

export default function ExamCountdown({ user }) {
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyGoal, setDailyGoal] = useState(60);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("exam_goals")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setGoal(data);
        setLoading(false);
      });
  }, [user]);

  const saveGoal = async () => {
    if (!examName || !examDate) return;
    setSaving(true);
    const { data } = await supabase
      .from("exam_goals")
      .upsert({
        user_id: user.id,
        exam_name: examName,
        exam_date: examDate,
        daily_goal_minutes: dailyGoal,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (data) setGoal(data);
    setEditing(false);
    setSaving(false);
  };

  const getDaysLeft = () => {
    if (!goal?.exam_date) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(goal.exam_date);
    exam.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));
  };

  const getUrgencyColor = (days) => {
    if (days <= 3)  return { text: "text-error",              ring: "#ef4444" };
    if (days <= 7)  return { text: "text-tertiary-fixed-dim", ring: "#86efac" };
    if (days <= 14) return { text: "text-secondary",          ring: "#60a5fa" };
    return { text: "text-primary-container", ring: "#6ee7b7" };
  };

  const getUrgencyLabel = (days) => {
    if (days === 0)  return "Exam today!";
    if (days <= 3)   return "Almost there!";
    if (days <= 7)   return "Final stretch!";
    if (days <= 14)  return "Keep pushing!";
    return "You've got this!";
  };

  if (loading) return null;

  // No goal set — show setup card
  if (!goal && !editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className="bg-surface-container-low border border-dashed border-outline-variant/30 rounded-2xl p-6 cursor-pointer hover:border-primary-container/30 transition-all group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container-highest rounded-xl flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-container">event</span>
          </div>
          <div>
            <p className="font-bold text-sm text-on-surface">Set your exam date</p>
            <p className="text-xs text-on-surface-variant">Get a countdown and daily study goals</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant ml-auto">add</span>
        </div>
      </div>
    );
  }

  // Edit form
  if (editing) {
    return (
      <div className="bg-surface-container-low border border-primary-container/20 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-sm">event</span>
          Set Exam Goal
        </h3>
        <input
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Exam name (e.g. NEET 2025)"
          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary-container/50"
        />
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary-container/50"
        />
        <div>
          <label className="text-xs text-on-surface-variant mb-1 block">Daily study goal: {dailyGoal} minutes</label>
          <input
            type="range" min="15" max="240" step="15"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full accent-green-400"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={saveGoal} disabled={saving || !examName || !examDate}
            className="flex-1 py-2.5 bg-primary-container text-on-primary-container font-bold rounded-xl text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save Goal"}
          </button>
          <button onClick={() => setEditing(false)}
            className="px-4 py-2.5 border border-outline-variant/20 text-on-surface-variant rounded-xl text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Countdown display
  const daysLeft = getDaysLeft();
  const { text: urgencyText, ring: urgencyRing } = getUrgencyColor(daysLeft);
  const progress = Math.max(0, Math.min(100, 100 - (daysLeft / 90) * 100));

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exam Countdown</p>
          <h3 className="font-headline font-bold text-on-surface text-lg mt-0.5">{goal.exam_name}</h3>
        </div>
        <button onClick={() => { setExamName(goal.exam_name); setExamDate(goal.exam_date); setDailyGoal(goal.daily_goal_minutes); setEditing(true); }}
          className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Countdown ring */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1c2030" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none"
              stroke={urgencyRing} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-headline text-2xl font-extrabold ${urgencyText}`}>{daysLeft}</span>
            <span className="text-[9px] text-on-surface-variant uppercase tracking-wider">days</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={`font-bold text-sm ${urgencyText} mb-1`}>{getUrgencyLabel(daysLeft)}</p>
          <p className="text-xs text-on-surface-variant mb-3">
            {new Date(goal.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-sm">schedule</span>
            <span className="text-xs text-on-surface-variant">{goal.daily_goal_minutes} min/day goal</span>
          </div>
          <button
            onClick={() => navigate("/agents")}
            className="mt-3 text-xs text-primary-container font-bold hover:underline flex items-center gap-1">
            View study plan
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
