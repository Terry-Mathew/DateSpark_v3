import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Mail, ArrowLeft, Check } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError("");
    
    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      
      setEmailSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send reset instructions";
      
      if (error.code === "auth/user-not-found") {
        // For security reasons, don't tell the user that the email doesn't exist
        // Instead, pretend it worked
        setEmailSent(true);
        toast({
          title: "Reset email sent",
          description: "If an account exists with this email, you will receive reset instructions",
        });
        return;
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail("");
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {emailSent ? "Check Your Email" : "Reset Password"}
        </CardTitle>
        <CardDescription className="text-center">
          {emailSent 
            ? "We've sent you password reset instructions" 
            : "Enter your email and we'll send you instructions to reset your password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <div className="flex flex-col items-center text-center py-4">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              We've sent an email to <strong>{email}</strong> with a link to reset your password.
              The link will expire in 1 hour.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or make sure you entered the correct email address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`h-10 ${error ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Instructions
                </div>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        {emailSent ? (
          <Button 
            variant="outline" 
            onClick={handleTryAgain}
            className="mt-2"
          >
            Try another email
          </Button>
        ) : (
          <Link to="/signin" className="flex items-center text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to sign in
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword; 