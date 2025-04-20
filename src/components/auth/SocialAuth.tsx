import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { getAuth, signInWithPopup, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const SocialAuth = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      toast({
        title: "Success!",
        description: "You've successfully signed in with Google.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    try {
      const auth = getAuth();
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      
      toast({
        title: "Success!",
        description: "You've successfully signed in with GitHub.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("GitHub sign-in error:", error);
      
      toast({
        title: "Sign in failed",
        description: error.message || "Could not sign in with GitHub",
        variant: "destructive",
      });
    } finally {
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="h-10"
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          {isGoogleLoading ? "Loading..." : "Google"}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleGithubLogin}
          disabled={isGithubLoading}
          className="h-10"
        >
          <Github className="mr-2 h-4 w-4" />
          {isGithubLoading ? "Loading..." : "GitHub"}
        </Button>
      </div>
    </div>
  );
};

export default SocialAuth; 