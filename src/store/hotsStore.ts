import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface HOTSQuestion {
  id: string;
  text_id: string;
  question: string;
  category: "analysis" | "evaluation" | "creation";
  difficulty: "easy" | "medium" | "hard";
  type:
    | "case_study"
    | "creative_writing"
    | "critical_analysis"
    | "problem_solving";
  points: number;
  estimated_time: number;
  instructions: string;
  rubric: Record<string, any>;
  text_title?: string;
}

interface HOTSAnswer {
  id: string;
  user_id: string;
  hots_question_id: string;
  answer: string;
  score: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
}

interface HOTSStats {
  totalQuestions: number;
  completedQuestions: number;
  totalScore: number;
  averageScore: number;
  categoryStats: {
    analysis: { completed: number; total: number; avgScore: number };
    evaluation: { completed: number; total: number; avgScore: number };
    creation: { completed: number; total: number; avgScore: number };
  };
  difficultyStats: {
    easy: { completed: number; total: number; avgScore: number };
    medium: { completed: number; total: number; avgScore: number };
    hard: { completed: number; total: number; avgScore: number };
  };
}

interface HOTSState {
  questions: HOTSQuestion[];
  answers: HOTSAnswer[];
  isLoading: boolean;

  // HOTS operations
  fetchHOTSQuestions: (textId?: string) => Promise<void>;
  fetchHOTSAnswers: (userId?: string) => Promise<void>;
  submitHOTSAnswer: (answer: {
    user_id: string;
    hots_question_id: string;
    answer: string;
  }) => Promise<boolean>;

  // Progress operations
  updateHOTSProgress: (userId: string, questionId: string) => Promise<void>;
  getHOTSStats: (userId: string) => Promise<HOTSStats | null>;

  // Teacher operations
  gradeHOTSAnswer: (
    answerId: string,
    score: number,
    feedback?: string
  ) => Promise<boolean>;
}

export const useHOTSStore = create<HOTSState>((set, get) => ({
  questions: [],
  answers: [],
  isLoading: false,

  fetchHOTSQuestions: async (textId) => {
    try {
      set({ isLoading: true });
      let query = supabase.from("hots_questions").select(`
          *,
          texts(title)
        `);

      if (textId) {
        query = query.eq("text_id", textId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      const questionsWithTextTitle =
        data?.map((q) => ({
          ...q,
          text_title: q.texts?.title || "Teks tidak ditemukan",
        })) || [];

      set({ questions: questionsWithTextTitle });
    } catch (error) {
      console.error("Error fetching HOTS questions:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHOTSAnswers: async (userId) => {
    try {
      let query = supabase.from("hots_answers").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });

      if (error) throw error;
      set({ answers: data || [] });
    } catch (error) {
      console.error("Error fetching HOTS answers:", error);
    }
  },

  submitHOTSAnswer: async (answerData) => {
    try {
      const { data, error } = await supabase
        .from("hots_answers")
        .upsert([
          {
            ...answerData,
            submitted_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set((state) => ({
        answers: [
          data,
          ...state.answers.filter(
            (a) =>
              !(
                a.user_id === answerData.user_id &&
                a.hots_question_id === answerData.hots_question_id
              )
          ),
        ],
      }));

      // Update progress
      await get().updateHOTSProgress(
        answerData.user_id,
        answerData.hots_question_id
      );

      return true;
    } catch (error) {
      console.error("Error submitting HOTS answer:", error);
      return false;
    }
  },

  updateHOTSProgress: async (userId, questionId) => {
    try {
      // Get the question to find text_id
      const { data: question } = await supabase
        .from("hots_questions")
        .select("text_id, points")
        .eq("id", questionId)
        .single();

      if (!question) return;

      // Get all HOTS answers for this user and text
      const { data: textQuestions } = await supabase
        .from("hots_questions")
        .select("id, points")
        .eq("text_id", question.text_id);

      const { data: userAnswers } = await supabase
        .from("hots_answers")
        .select("hots_question_id, score")
        .eq("user_id", userId)
        .in("hots_question_id", textQuestions?.map((q) => q.id) || []);

      // Calculate HOTS progress for this text
      const totalQuestions = textQuestions?.length || 0;
      const completedQuestions = userAnswers?.length || 0;
      const totalScore = userAnswers?.reduce((sum, a) => sum + a.score, 0) || 0;
      const maxScore =
        textQuestions?.reduce((sum, q) => sum + q.points, 0) || 0;

      // Determine HOTS status
      let hotsStatus: "not_started" | "in_progress" | "completed" =
        "not_started";
      if (completedQuestions > 0) {
        hotsStatus =
          completedQuestions === totalQuestions ? "completed" : "in_progress";
      }

      // Update progress table
      await supabase.from("progress").upsert([
        {
          user_id: userId,
          text_id: question.text_id,
          hots_status: hotsStatus,
          hots_score:
            maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
          last_accessed: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error updating HOTS progress:", error);
    }
  },

  getHOTSStats: async (userId) => {
    try {
      // Get all HOTS questions
      const { data: allQuestions } = await supabase
        .from("hots_questions")
        .select("id, category, difficulty, points");

      // Get user's HOTS answers
      const { data: userAnswers } = await supabase
        .from("hots_answers")
        .select("hots_question_id, score")
        .eq("user_id", userId);

      if (!allQuestions || !userAnswers) return null;

      const totalQuestions = allQuestions.length;
      const completedQuestions = userAnswers.length;
      const totalScore = userAnswers.reduce((sum, a) => sum + a.score, 0);
      const averageScore =
        completedQuestions > 0
          ? Math.round((totalScore / completedQuestions) * 10) / 10
          : 0;

      // Calculate category stats
      const categoryStats = {
        analysis: { completed: 0, total: 0, avgScore: 0 },
        evaluation: { completed: 0, total: 0, avgScore: 0 },
        creation: { completed: 0, total: 0, avgScore: 0 },
      };

      const difficultyStats = {
        easy: { completed: 0, total: 0, avgScore: 0 },
        medium: { completed: 0, total: 0, avgScore: 0 },
        hard: { completed: 0, total: 0, avgScore: 0 },
      };

      allQuestions.forEach(
        (q: {
          id: string;
          category: "analysis" | "evaluation" | "creation";
          difficulty: "easy" | "medium" | "hard";
          points: number;
        }) => {
          categoryStats[q.category].total++;
          difficultyStats[q.difficulty].total++;

          const userAnswer = userAnswers.find(
            (a) => a.hots_question_id === q.id
          );
          if (userAnswer) {
            categoryStats[q.category].completed++;
            difficultyStats[q.difficulty].completed++;
          }
        }
      );

      // Calculate average scores for each category and difficulty
      Object.keys(categoryStats).forEach((category) => {
        const categoryAnswers = userAnswers.filter((a) => {
          const question = allQuestions.find(
            (q) => q.id === a.hots_question_id
          );
          return question?.category === category;
        });

        if (categoryAnswers.length > 0) {
          categoryStats[category as keyof typeof categoryStats].avgScore =
            Math.round(
              (categoryAnswers.reduce((sum, a) => sum + a.score, 0) /
                categoryAnswers.length) *
                10
            ) / 10;
        }
      });

      Object.keys(difficultyStats).forEach((difficulty) => {
        const difficultyAnswers = userAnswers.filter((a) => {
          const question = allQuestions.find(
            (q) => q.id === a.hots_question_id
          );
          return question?.difficulty === difficulty;
        });

        if (difficultyAnswers.length > 0) {
          difficultyStats[difficulty as keyof typeof difficultyStats].avgScore =
            Math.round(
              (difficultyAnswers.reduce((sum, a) => sum + a.score, 0) /
                difficultyAnswers.length) *
                10
            ) / 10;
        }
      });

      return {
        totalQuestions,
        completedQuestions,
        totalScore,
        averageScore,
        categoryStats,
        difficultyStats,
      };
    } catch (error) {
      console.error("Error getting HOTS stats:", error);
      return null;
    }
  },

  gradeHOTSAnswer: async (answerId, score, feedback) => {
    try {
      const { error } = await supabase
        .from("hots_answers")
        .update({
          score,
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", answerId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        answers: state.answers.map((a) =>
          a.id === answerId
            ? { ...a, score, feedback, graded_at: new Date().toISOString() }
            : a
        ),
      }));

      // Update progress for the user
      const answer = get().answers.find((a) => a.id === answerId);
      if (answer) {
        await get().updateHOTSProgress(answer.user_id, answer.hots_question_id);
      }

      return true;
    } catch (error) {
      console.error("Error grading HOTS answer:", error);
      return false;
    }
  },
}));
