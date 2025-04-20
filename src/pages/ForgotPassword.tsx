import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsEmailSent(true);
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-purple-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">
            AROGYA MITRA
          </h1>
          <p className="text-gray-600 mt-2">Reset your password</p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>

          {!isEmailSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Sending reset link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center text-sm text-purple-600 hover:text-purple-800"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Login
                </Link>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6 pt-4 pb-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-md text-center">
                <p className="font-medium">Password reset email sent!</p>
                <p className="text-sm mt-2">
                  Check your inbox for instructions to reset your password.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                >
                  Return to Login
                </Link>

                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail("");
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  Try with a different email
                </button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
