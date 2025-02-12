
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        setUser(session?.user ?? null);
        
        if (session?.user && location.pathname === '/auth') {
          navigate('/dashboard');
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state change:", event, session?.user?.id);
          
          // Handle various auth events
          switch (event) {
            case 'SIGNED_IN':
              setUser(session?.user ?? null);
              if (location.pathname === '/auth') {
                navigate('/dashboard');
              }
              break;
            case 'SIGNED_OUT':
              setUser(null);
              navigate('/');
              break;
            case 'TOKEN_REFRESHED':
              setUser(session?.user ?? null);
              break;
            case 'USER_UPDATED':
              setUser(session?.user ?? null);
              break;
          }

          // Handle protected route access
          if (!session?.user && location.pathname.includes('/dashboard')) {
            toast({
              title: "Authentication required",
              description: "Please sign in to access this feature",
            });
            navigate("/auth");
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem with authentication. Please try signing in again.",
        });
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.message.includes('session_not_found')) {
          console.log('Session not found, clearing local state');
          setUser(null);
          navigate("/");
          toast({
            title: "Signed out successfully",
            description: "You have been signed out of your account",
          });
          return;
        }
        throw error;
      }
      navigate("/");
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
      });
      // Force clear the user state in case of persistent errors
      setUser(null);
      navigate("/");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
