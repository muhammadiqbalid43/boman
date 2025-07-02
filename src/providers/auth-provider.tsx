import type { AuthError, User } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";
import type { SignInPayload, SignUpPayload } from "../types/forms";
import supabase from "../lib/supabase-client";
import { AuthContext } from "./auth-context";
import type { AuthResult } from "../features/auth/types/auth";
import { toast } from "sonner";

const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Clear error helper
  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError.message);
          if (mounted) {
            setError(sessionError);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user || null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error during initialization:", err);
        if (mounted) {
          setError(err as AuthError);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        switch (event) {
          case "SIGNED_IN":
            if (session?.user) {
              setUser(session.user);
              setError(null); // Clear any previous errors on successful sign in
            }
            break;
          case "SIGNED_OUT":
            setUser(null);
            setError(null); // Clear errors on sign out
            break;
          case "TOKEN_REFRESHED":
            if (session?.user) {
              setUser(session.user);
            }
            break;
          default:
            // Handle other events if needed
            break;
        }
      } catch (err) {
        console.error("Error in auth state change handler:", err);
        setError(err as AuthError);
      }
    });

    initialize();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async ({
    email,
    password,
  }: SignInPayload): Promise<AuthResult> => {
    clearError();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) {
        setError(authError);
        toast.error(authError.message);
        return { user: null, error: authError };
      }
      toast.success("Signed in successfully!");

      // Let onAuthStateChange handle user state update
      return { user: data.user, error: null };
    } catch (err) {
      const error = err as AuthError;
      setError(error);
      console.error("Unexpected sign-in error:", error);
      return { user: null, error };
    }
  };

  const signUp = async ({
    email,
    password,
  }: SignUpPayload): Promise<AuthResult> => {
    clearError();

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError);
        toast.error(authError.message);
        return { user: null, error: authError };
      }
      toast.success("Signed up successfully!");

      // Let onAuthStateChange handle user state update
      return { user: data.user, error: null };
    } catch (err) {
      const error = err as AuthError;
      setError(error);
      console.error("Unexpected sign-up error:", error);
      return { user: null, error };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    clearError();

    try {
      const { error: authError } = await supabase.auth.signOut();

      if (authError) {
        setError(authError);
        console.error("Sign-out error:", authError.message);
        return { error: authError };
      }

      // Let onAuthStateChange handle user state update
      return { error: null };
    } catch (err) {
      const error = err as AuthError;
      setError(error);
      console.error("Unexpected sign-out error:", error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError, // Expose clearError for manual error clearing
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
