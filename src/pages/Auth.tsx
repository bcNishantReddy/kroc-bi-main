
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserCircle2, Lock, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get("mode") === "signup";
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateInputs = () => {
    if (!email.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password",
      });
      return false;
    }
    if (!email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return false;
    }
    return true;
  };

  const handleAuth = async (type: "signin" | "signup") => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      console.log(`Attempting ${type} for email:`, email);

      if (type === "signup") {
        const { data: { user }, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          console.error("Signup error:", error);
          let errorMessage = error.message;
          if (error.message.includes("User already registered")) {
            errorMessage = "This email is already registered. Please sign in instead.";
          }
          toast({
            variant: "destructive",
            title: "Signup Error",
            description: errorMessage,
          });
          return;
        }

        if (user?.identities?.length === 0) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "This email is already registered. Please sign in instead.",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Account created successfully! Please check your email to verify your account.",
        });
        navigate("/auth");
      } else {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          console.error("Sign in error:", error);
          let errorMessage = "Invalid email or password. Please try again.";
          
          if (error.message?.toLowerCase().includes("email not confirmed")) {
            errorMessage = "Please verify your email address before signing in. Check your inbox for the verification link.";
          } else if (error.message?.toLowerCase().includes("invalid login credentials")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          }
          
          toast({
            variant: "destructive",
            title: "Sign In Error",
            description: errorMessage,
          });
          return;
        }

        if (user) {
          console.log("Sign in successful for user:", user.id);
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center">
                <UserCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Sign up to start using Kroc-BI"
                : "Sign in to your account"}
            </p>
          </div>

          <div className="space-y-6">
            <Alert>
              <AlertDescription>
                {isSignUp
                  ? "You'll need to verify your email address after signing up."
                  : "Make sure to use the email address you verified during signup."}
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-11 text-base font-medium"
                onClick={() => handleAuth(isSignUp ? "signup" : "signin")}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-center">
                <Button
                  variant="link"
                  className="text-sm"
                  onClick={() => navigate(isSignUp ? "/auth" : "/auth?mode=signup")}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
