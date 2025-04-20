import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RocketIcon, Menu, X, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserDisplayName(user.displayName || user.email?.split("@")[0] || "User");
      } else {
        setIsLoggedIn(false);
        setUserDisplayName("");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const NavLink = ({ to, children, icon: Icon }) => {
    const isActive = location.pathname === to;
    return (
      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
        <Link
          to={to}
          className={cn(
            "flex items-center gap-1.5 text-foreground transition-all duration-200 relative group px-2 py-1 rounded-md",
            isActive 
              ? "text-primary font-medium bg-primary/5" 
              : "hover:text-primary hover:bg-primary/5"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span>{children}</span>
          <span 
            className={cn(
              "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300",
              isActive ? "w-full" : "group-hover:w-full"
            )}
          />
        </Link>
      </motion.div>
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-background/50 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="flex items-center space-x-2 group">
              <RocketIcon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-bold text-xl">DateSpark</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" icon={null}>Home</NavLink>
            <NavLink to="/pricing" icon={Crown}>Pricing</NavLink>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 ml-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="transition-all duration-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signin">
                    <Button variant="outline" className="transition-all duration-300">Sign In</Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup">
                    <Button className="transition-all duration-300">Sign Up</Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <motion.button
            className="md:hidden text-foreground"
            onClick={() => setIsNavOpen(!isNavOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div 
              className="md:hidden py-4 space-y-4 bg-background/95 rounded-lg shadow-lg border border-primary/10"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/"
                className="block text-foreground hover:text-primary transition-colors py-2 px-4 hover:bg-primary/5 rounded-md"
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className="block text-foreground hover:text-primary transition-colors py-2 px-4 hover:bg-primary/5 rounded-md flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Pricing
              </Link>
              
              {isLoggedIn ? (
                <div className="space-y-4 px-4 pt-2 border-t border-primary/10">
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 px-4 pt-2 border-t border-primary/10">
                  <Link to="/signin" className="block">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="block">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
