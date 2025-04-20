import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SocialAuth from "./SocialAuth";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Calculate password strength
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    };
    
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name and other profile info
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Create a user profile document in Firestore
      // You might want to store additional information like gender here
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
        variant: "default",
      });
      
      navigate("/verify-email");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "An error occurred during registration";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use";
      }
      
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md border-primary/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Join DateSpark and Start Your Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={`h-10 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`h-10 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className={`h-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                  <span className="text-xs">{getPasswordStrengthText()}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    {password.length >= 8 ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <XCircle className="h-3 w-3 text-red-500" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[A-Z]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <XCircle className="h-3 w-3 text-red-500" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[0-9]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <XCircle className="h-3 w-3 text-red-500" />}
                    <span>Number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/[^A-Za-z0-9]/.test(password) ? 
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> : 
                      <XCircle className="h-3 w-3 text-red-500" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`h-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="gender" className="text-sm font-medium">Gender (Optional)</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By signing up, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </form>
        
        <div className="mt-6">
          <SocialAuth />
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm; 