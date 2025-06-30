import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "teacher" | "student"
  ) => Promise<boolean>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          user: session.user,
          profile,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // ✅ Penting: pastikan loading selesai dan auth diset ke false
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }

      // 🔁 Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          set({
            user: session.user,
            profile,
            isAuthenticated: true,
          });
        } else if (event === "SIGNED_OUT") {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
          });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        set({
          user: data.user,
          profile,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  register: async (email, password, name, role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) throw error;

      // ✅ Tambahkan profil ke tabel profiles setelah signUp
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name,
          role,
          avatar_url: null,
        },
      ]);

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  updateProfile: async (updates) => {
    try {
      const { profile } = get();
      if (!profile) return false;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id);

      if (error) throw error;

      set({
        profile: { ...profile, ...updates },
      });
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  },
}));
