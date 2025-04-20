import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "@/components/auth/ForgotPassword";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword; 