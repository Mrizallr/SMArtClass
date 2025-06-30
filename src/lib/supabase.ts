import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔧 Supabase Config:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  key: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: "public",
  },
});

// Test connection on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("🔥 Supabase auth error:", error);
  } else {
    console.log("✅ Supabase initialized successfully");
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          role: "teacher" | "student";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: "teacher" | "student";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      texts: {
        Row: {
          id: string;
          title: string;
          genre:
            | "narrative"
            | "expository"
            | "descriptive"
            | "procedural"
            | "persuasive";
          content: string;
          structure: Record<string, any>;
          lexicogrammatical: string[];
          illustration_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          genre:
            | "narrative"
            | "expository"
            | "descriptive"
            | "procedural"
            | "persuasive";
          content: string;
          structure?: Record<string, any>;
          lexicogrammatical?: string[];
          illustration_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          genre?:
            | "narrative"
            | "expository"
            | "descriptive"
            | "procedural"
            | "persuasive";
          content?: string;
          structure?: Record<string, any>;
          lexicogrammatical?: string[];
          illustration_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          text_id: string;
          question: string;
          type: "multiple_choice" | "essay";
          category: "literal" | "inferential" | "hots";
          options: string[];
          correct_answer: string | null;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text_id: string;
          question: string;
          type?: "multiple_choice" | "essay";
          category?: "literal" | "inferential" | "hots";
          options?: string[];
          correct_answer?: string | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text_id?: string;
          question?: string;
          type?: "multiple_choice" | "essay";
          category?: "literal" | "inferential" | "hots";
          options?: string[];
          correct_answer?: string | null;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          answer: string;
          score: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          answer: string;
          score?: number;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          answer?: string;
          score?: number;
          submitted_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          text_id: string;
          read_status: boolean;
          quiz_status: "not_started" | "in_progress" | "completed";
          hots_status: "not_started" | "in_progress" | "completed";
          reading_score: number;
          hots_score: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          text_id: string;
          read_status?: boolean;
          quiz_status?: "not_started" | "in_progress" | "completed";
          hots_status?: "not_started" | "in_progress" | "completed";
          reading_score?: number;
          hots_score?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text_id?: string;
          read_status?: boolean;
          quiz_status?: "not_started" | "in_progress" | "completed";
          hots_status?: "not_started" | "in_progress" | "completed";
          reading_score?: number;
          hots_score?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      illustrations: {
        Row: {
          id: string;
          text_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          text_id: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          text_id?: string;
          image_url?: string;
          caption?: string | null;
          created_at?: string;
        };
      };
      hots_questions: {
        Row: {
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
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          text_id: string;
          question: string;
          category?: "analysis" | "evaluation" | "creation";
          difficulty?: "easy" | "medium" | "hard";
          type?:
            | "case_study"
            | "creative_writing"
            | "critical_analysis"
            | "problem_solving";
          points?: number;
          estimated_time?: number;
          instructions: string;
          rubric?: Record<string, any>;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          text_id?: string;
          question?: string;
          category?: "analysis" | "evaluation" | "creation";
          difficulty?: "easy" | "medium" | "hard";
          type?:
            | "case_study"
            | "creative_writing"
            | "critical_analysis"
            | "problem_solving";
          points?: number;
          estimated_time?: number;
          instructions?: string;
          rubric?: Record<string, any>;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      hots_answers: {
        Row: {
          id: string;
          user_id: string;
          hots_question_id: string;
          answer: string;
          score: number;
          feedback: string | null;
          submitted_at: string;
          graded_at: string | null;
          graded_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          hots_question_id: string;
          answer: string;
          score?: number;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          graded_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          hots_question_id?: string;
          answer?: string;
          score?: number;
          feedback?: string | null;
          submitted_at?: string;
          graded_at?: string | null;
          graded_by?: string | null;
        };
      };
    };
  };
}
