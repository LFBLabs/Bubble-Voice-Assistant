import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        // Clear any invalid session state
        setSession(null);
        supabase.auth.signOut().catch(console.error);
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      if (_event === 'SIGNED_OUT') {
        // Clear session on sign out
        setSession(null);
        // Clear any stored auth data
        localStorage.removeItem('supabase.auth.token');
      }

      setSession(session);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { session, loading };
};