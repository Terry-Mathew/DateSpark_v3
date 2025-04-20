import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerification from "@/components/auth/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const VerifyEmail = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user is logged in, redirect to sign in
    if (!loading && !user) {
      toast.error("You must be logged in to access this page");
      navigate("/sign-in");
    }
    
    // If user is already verified, redirect to home
    if (user?.emailVerified) {
      toast.success("Your email is already verified!");
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {user && !user.emailVerified && <EmailVerification user={user} />}
      </main>
      <Footer />
    </>
  );
};

export default VerifyEmail; 