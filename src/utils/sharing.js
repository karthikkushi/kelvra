// src/utils/sharing.js
import { supabase } from "./supabase";

// Generate a random share ID
function generateShareId() {
  return Math.random().toString(36).substring(2, 10) +
         Math.random().toString(36).substring(2, 10);
}

// Share a study kit — returns a share URL
export async function shareStudyKit(userId, topic, results) {
  try {
    const shareId = generateShareId();
    const { error } = await supabase.from("shared_kits").insert({
      share_id: shareId,
      user_id: userId,
      topic,
      summary:    results.summary    ? JSON.stringify(results.summary)    : null,
      flashcards: results.flashcards ? JSON.stringify(results.flashcards) : null,
      quiz:       results.quiz       ? JSON.stringify(results.quiz)       : null,
      plan:       results.plan       ? JSON.stringify(results.plan)       : null,
    });
    if (error) throw error;
    return {
      success: true,
      shareId,
      shareUrl: `${window.location.origin}/shared/${shareId}`,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get a shared kit by ID
export async function getSharedKit(shareId) {
  try {
    const { data, error } = await supabase
      .from("shared_kits")
      .select("*")
      .eq("share_id", shareId)
      .single();
    if (error) throw error;

    // Increment view count
    await supabase
      .from("shared_kits")
      .update({ views: (data.views || 0) + 1 })
      .eq("share_id", shareId);

    return {
      success: true,
      kit: {
        ...data,
        summary:    data.summary    ? JSON.parse(data.summary)    : null,
        flashcards: data.flashcards ? JSON.parse(data.flashcards) : null,
        quiz:       data.quiz       ? JSON.parse(data.quiz)       : null,
        plan:       data.plan       ? JSON.parse(data.plan)       : null,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
