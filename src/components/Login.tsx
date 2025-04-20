import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Auto-redirect to dashboard when auth is complete
  useEffect(() => {
    if (currentUser) {
      // Short delay to ensure smooth transition
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-purple-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">
            AROGYA MITRA
          </h1>
          <p className="text-gray-600 mt-2">
            Your personal healthcare companion
          </p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Automatically logging you in...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
