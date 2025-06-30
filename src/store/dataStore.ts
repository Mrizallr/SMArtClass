import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/supabase";

type Text = Database["public"]["Tables"]["texts"]["Row"];
type Question = Database["public"]["Tables"]["questions"]["Row"];
type Answer = Database["public"]["Tables"]["answers"]["Row"];
type Progress = Database["public"]["Tables"]["progress"]["Row"];

interface DataState {
  texts: Text[];
  questions: Question[];
  answers: Answer[];
  progress: Progress[];
  isLoading: boolean;

  // Text operations
  fetchTexts: () => Promise<void>;
  addText: (
    text: Database["public"]["Tables"]["texts"]["Insert"]
  ) => Promise<boolean>;
  updateText: (
    id: string,
    updates: Database["public"]["Tables"]["texts"]["Update"]
  ) => Promise<boolean>;
  archiveText: (id: string) => Promise<boolean>; // ← renamed from deleteText
  restoreText: (id: string) => Promise<boolean>;

  // Question operations
  fetchQuestions: (textId?: string) => Promise<void>;
  addQuestion: (
    question: Database["public"]["Tables"]["questions"]["Insert"]
  ) => Promise<boolean>;
  updateQuestion: (
    id: string,
    updates: Database["public"]["Tables"]["questions"]["Update"]
  ) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<boolean>;

  // Answer operations
  submitAnswer: (
    answer: Database["public"]["Tables"]["answers"]["Insert"]
  ) => Promise<boolean>;
  fetchAnswers: (userId?: string) => Promise<void>;

  // Progress operations
  fetchProgress: (userId?: string) => Promise<void>;
  updateProgress: (
    userId: string,
    textId: string,
    updates: Database["public"]["Tables"]["progress"]["Update"]
  ) => Promise<boolean>;

  // Stats
  getStudentStats: (userId: string) => Promise<any>;
  getTeacherStats: () => Promise<any>;
}

export const useDataStore = create<DataState>((set, get) => ({
  texts: [],
  questions: [],
  answers: [],
  progress: [],
  isLoading: false,

  // TEXTS
  fetchTexts: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("texts")
        .select("*")
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ texts: data || [] });
    } catch (error) {
      console.error("Error fetching texts:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addText: async (text) => {
    try {
      const { data, error } = await supabase
        .from("texts")
        .insert([text])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        texts: [data, ...state.texts],
      }));
      return true;
    } catch (error) {
      console.error("Error adding text:", error);
      return false;
    }
  },

  updateText: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("texts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        texts: state.texts.map((text) => (text.id === id ? data : text)),
      }));
      return true;
    } catch (error) {
      console.error("Error updating text:", error);
      return false;
    }
  },

  archiveText: async (id) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("UID login:", user?.id); // ← tampilkan UID yang sedang login

    if (authError) {
      console.error("Auth error:", authError.message);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from("texts")
        .update({ is_archived: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        texts: state.texts.filter((text) => text.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Error archiving text:", error);
      return false;
    }
  },
  restoreText: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("texts")
        .update({ is_archived: false })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        texts: [data, ...state.texts.filter((text) => text.id !== id)],
      }));
      return true;
    } catch (error) {
      console.error("Error restoring text:", error);
      return false;
    }
  },

  // QUESTIONS
  fetchQuestions: async (textId) => {
    try {
      let query = supabase.from("questions").select("*");
      if (textId) query = query.eq("text_id", textId);
      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      set({ questions: data || [] });
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  },

  addQuestion: async (question) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert([question])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        questions: [data, ...state.questions],
      }));
      return true;
    } catch (error) {
      console.error("Error adding question:", error);
      return false;
    }
  },

  updateQuestion: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        questions: state.questions.map((q) => (q.id === id ? data : q)),
      }));
      return true;
    } catch (error) {
      console.error("Error updating question:", error);
      return false;
    }
  },

  deleteQuestion: async (id) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;

      set((state) => ({
        questions: state.questions.filter((q) => q.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      return false;
    }
  },

  // ANSWERS
  submitAnswer: async (answer) => {
    try {
      const { data, error } = await supabase
        .from("answers")
        .upsert([answer])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        answers: [
          data,
          ...state.answers.filter(
            (a) =>
              !(
                a.user_id === answer.user_id &&
                a.question_id === answer.question_id
              )
          ),
        ],
      }));
      return true;
    } catch (error) {
      console.error("Error submitting answer:", error);
      return false;
    }
  },

  fetchAnswers: async (userId) => {
    try {
      let query = supabase.from("answers").select("*");
      if (userId) query = query.eq("user_id", userId);

      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });

      if (error) throw error;
      set({ answers: data || [] });
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  },

  // PROGRESS
  fetchProgress: async (userId) => {
    try {
      let query = supabase.from("progress").select("*");
      if (userId) query = query.eq("user_id", userId);

      const { data, error } = await query.order("last_accessed", {
        ascending: false,
      });

      if (error) throw error;
      set({ progress: data || [] });
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  },

  updateProgress: async (userId, textId, updates) => {
    try {
      const { data, error } = await supabase
        .from("progress")
        .upsert([
          {
            user_id: userId,
            text_id: textId,
            ...updates,
            last_accessed: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        progress: [
          data,
          ...state.progress.filter(
            (p) => !(p.user_id === userId && p.text_id === textId)
          ),
        ],
      }));
      return true;
    } catch (error) {
      console.error("Error updating progress:", error);
      return false;
    }
  },

  // STATS
  getStudentStats: async (userId) => {
    try {
      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId);

      const { data: answersData } = await supabase
        .from("answers")
        .select("*")
        .eq("user_id", userId);

      const totalTextsRead =
        progressData?.filter((p) => p.read_status).length || 0;
      const totalQuestionsAnswered = answersData?.length || 0;
      const totalHOTSCompleted =
        progressData?.filter((p) => p.hots_status === "completed").length || 0;
      const averageScore = answersData?.length
        ? answersData.reduce((sum, a) => sum + a.score, 0) / answersData.length
        : 0;

      return {
        totalTextsRead,
        totalQuestionsAnswered,
        totalHOTSCompleted,
        averageScore: Math.round(averageScore * 10) / 10,
      };
    } catch (error) {
      console.error("Error getting student stats:", error);
      return null;
    }
  },

  getTeacherStats: async () => {
    try {
      const { data: textsData } = await supabase
        .from("texts")
        .select("*")
        .eq("is_archived", false);
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*");
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");
      const { data: answersData } = await supabase.from("answers").select("*");

      const averageScore = answersData?.length
        ? answersData.reduce((sum, a) => sum + a.score, 0) / answersData.length
        : 0;

      return {
        totalTexts: textsData?.length || 0,
        totalQuestions: questionsData?.length || 0,
        totalStudents: studentsData?.length || 0,
        averageScore: Math.round(averageScore * 10) / 10,
      };
    } catch (error) {
      console.error("Error getting teacher stats:", error);
      return null;
    }
  },
}));
