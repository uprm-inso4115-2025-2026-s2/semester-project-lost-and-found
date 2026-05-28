import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  enterAsGuest: () => void;
  exitGuest: () => void;
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
  const [isGuest, setIsGuest] = useState(() =>
    sessionStorage.getItem("isGuest") === "true"
  );

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user ?? null;

      if (sessionUser) {
        const { data: accountData, error: accountError } = await supabase
          .from("UserAccounts")
          .select("User_ID")
          .eq("Email", sessionUser.email)
          .single();

        if (accountError || !accountData) {
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
        sessionStorage.removeItem("isGuest");
        setIsGuest(false);
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
    if ((res as any)?.error) return res;

    const sessionUser = (res as any)?.data?.user ?? null;
    const userEmail = sessionUser?.email ?? email;

    const { data: accountData, error: accountError } = await supabase
      .from("UserAccounts")
      .select("User_ID")
      .eq("Email", userEmail)
      .single();

    if (accountError || !accountData) {
      await supabase.auth.signOut();
      return { error: { message: "Account not found or has been deleted." } };
    }

    return res;
  };

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password });

  const signOut = async () => {
    sessionStorage.removeItem("isGuest");
    setIsGuest(false);
    return supabase.auth.signOut();
  };

  const enterAsGuest = () => {
    sessionStorage.setItem("isGuest", "true");
    setIsGuest(true);
  };

  const exitGuest = () => {
    sessionStorage.removeItem("isGuest");
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signIn, signUp, signOut, enterAsGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;