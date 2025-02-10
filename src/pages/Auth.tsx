
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
      const {
        data: { user },
        error,
      } = type === "signup"
        ? await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              emailRedirectTo: window.location.origin,
            },
          })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else if (user) {
        toast({
          title: "Success",
          description: type === "signup" ? "Account created successfully" : "Logged in successfully",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Kroc-BI</h1>
          <p className="mt-2 text-gray-600">Sign in or create an account</p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            <Button
              className="w-full"
              onClick={() => handleAuth("signin")}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleAuth("signup")}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
