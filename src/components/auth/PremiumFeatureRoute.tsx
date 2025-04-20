import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasUserPremiumAccess } from '@/services/firestore';

interface PremiumFeatureRouteProps {
  children: ReactNode;
}

export const PremiumFeatureRoute = ({ children }: PremiumFeatureRouteProps) => {
  const { currentUser, userProfile, isDeveloperMode } = useAuth();
  
  console.log("Developer mode:", isDeveloperMode);
  console.log("Current user:", currentUser?.uid);
  console.log("User profile:", userProfile);
  
  // If developer mode is enabled, bypass all restrictions
  if (isDeveloperMode) {
    console.log("Developer mode is active - bypassing premium check");
    return <>{children}</>;
  }
  
  // If user isn't logged in, redirect to sign in
  if (!currentUser) {
    console.log("No user logged in - redirecting to sign-in");
    return <Navigate to="/sign-in" />;
  }
  
  // If user doesn't have premium, redirect to pricing
  const hasPremium = hasUserPremiumAccess(userProfile);
  
  if (!hasPremium) {
    console.log("User does not have premium - redirecting to pricing");
    return <Navigate to="/pricing" />;
  }
  
  // Otherwise, render the component
  console.log("User has premium access - rendering component");
  return <>{children}</>;
}; 