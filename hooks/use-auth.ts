import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

const handleAuthUrl = async (url: string) => {
  const { queryParams } = Linking.parse(url);
  const code = queryParams?.code;
  if (typeof code === "string") {
    await supabase.auth.exchangeCodeForSession(code);
  }
};

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
      },
    );

    Linking.getInitialURL().then((url) => {
      if (url) handleAuthUrl(url);
    });
    const linkingSub = Linking.addEventListener("url", ({ url }) => {
      handleAuthUrl(url);
    });

    return () => {
      subscription.subscription.unsubscribe();
      linkingSub.remove();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
};
