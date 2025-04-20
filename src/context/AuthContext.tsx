import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  User,
  ConfirmationResult,
} from "firebase/auth";

import { auth } from "../firebase.ts";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  startPhoneAuth: (phoneNumber: string) => Promise<ConfirmationResult>;
  confirmPhoneAuth: (
    confirmationResult: ConfirmationResult,
    code: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: "Account created successfully!",
        description: "You can now log in with your credentials.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message,
      });
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Add provider settings to help debugging
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Ensure only one popup runs at a time
      if (auth.currentUser) return;

      await signInWithPopup(auth, provider);

      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
    } catch (error: any) {
      if (error.code !== "auth/cancelled-popup-request") {
        console.error("Google login detailed error:", {
          code: error.code,
          message: error.message,
          details: error
        });
        
        let errorMessage = error.message;
        if (error.code === "auth/unauthorized-domain") {
          errorMessage = "This domain is not authorized for authentication. Please contact the administrator.";
        }
        
        toast({
          variant: "destructive",
          title: "Google login failed",
          description: errorMessage,
        });
      }
      console.error("Google login error:", error);
      throw error;
    }
  };

  const startPhoneAuth = async (phoneNumber: string) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container", // ✅ HTML element ID string
        {
          size: "normal",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            toast({
              variant: "destructive",
              title: "CAPTCHA expired",
              description: "Please refresh the page and try again.",
            });
          },
        },
        auth // ✅ The third parameter is the Auth object
      );

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );

      toast({
        title: "Verification code sent!",
        description: "Please check your phone.",
      });

      return confirmationResult;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send code",
        description: error.message,
      });
      throw error;
    }
  };

  const confirmPhoneAuth = async (
    confirmationResult: ConfirmationResult,
    code: string
  ) => {
    try {
      await confirmationResult.confirm(code);
      toast({
        title: "Login successful!",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: error.message,
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password reset email sent!",
        description: "Check your inbox.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending reset email",
        description: error.message,
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    login,
    signInWithGoogle,
    startPhoneAuth,
    confirmPhoneAuth,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
