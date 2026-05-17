import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user ?? null;

      // If we have a session, verify the user still exists in UserAccounts
      if (sessionUser) {
        const { data: accountData, error: accountError } = await supabase
          .from("UserAccounts")
          .select("User_ID")
          .eq("Email", sessionUser.email)
          .single();

        if (accountError || !accountData) {
          // User was deleted! Clear the stale session
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(sessionUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        const { data: accountData, error: accountError } = await supabase
          .from("UserAccounts")
          .select("User_ID")
          .eq("Email", sessionUser.email)
          .single();

        if (accountError || !accountData) {
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        setUser(sessionUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });

    // If auth returned an error,, propagate it directly
    if ((res as any)?.error) return res;

    // Get the email to check
    const sessionUser = (res as any)?.data?.user ?? (res as any)?.data?.session?.user ?? null;
    const userEmail = sessionUser?.email ?? email;

    // Verify that a row still exists in the UserAccounts table
    const { data: accountData, error: accountError } = await supabase
      .from("UserAccounts")
      .select("User_ID")
      .eq("Email", userEmail)
      .single();

    if (accountError || !accountData) {
      console.log(accountError, !accountData);

      // Clear the created/returned session and return a friendly error
      await supabase.auth.signOut();
      return { error: { message: "Account not found or has been deleted." } };
    }

    return res;
  };

  const signUp = (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
