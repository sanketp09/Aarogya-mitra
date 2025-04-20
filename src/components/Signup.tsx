import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, UserPlus, Phone, ArrowRight } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const { signUp, signInWithGoogle, startPhoneAuth, confirmPhoneAuth } =
    useAuth();
  const navigate = useNavigate();

  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setIsLoading(true);
      await signUp(email, password);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      navigate("/");
    } catch (error) {
      console.error("Google signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber) return;

    try {
      setIsLoading(true);
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;
      const result = await startPhoneAuth(formattedPhone);
      setConfirmationResult(result);
      setIsCodeSent(true);
    } catch (error) {
      console.error("Phone auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult || !verificationCode) return;

    try {
      setIsLoading(true);
      await confirmPhoneAuth(confirmationResult, verificationCode);
      navigate("/");
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMethod = () => {
    setIsPhoneAuth(!isPhoneAuth);
    setIsCodeSent(false);
    setConfirmationResult(null);
    setVerificationCode("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-purple-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">
            AROGYA MITRA
          </h1>
          <p className="text-gray-600 mt-2">Create an account to get started</p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
            <CardDescription className="text-center">
              Choose your signup method
            </CardDescription>
          </CardHeader>

          {isPhoneAuth ? (
            // Phone Authentication Form
            <form onSubmit={isCodeSent ? handleVerifyCode : handleSendCode}>
              <CardContent className="space-y-4">
                {!isCodeSent ? (
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="flex">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="flex-1 border-purple-200 focus:border-purple-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Include country code (e.g., +1 for US)
                    </p>

                    {/* reCAPTCHA container - Firebase will render the reCAPTCHA here */}
                    <div id="recaptcha-container" className="mt-4"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                )}
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
                      <span>
                        {isCodeSent ? "Verifying..." : "Sending code..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Phone className="mr-2 h-5 w-5" />
                      <span>{isCodeSent ? "Verify Code" : "Send Code"}</span>
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={toggleAuthMethod}
                >
                  Use Email Instead
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Log In
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            // Email Authentication Form
            <form onSubmit={handleEmailSignUp}>
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

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10 border-purple-200 focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10 border-purple-200 focus:border-purple-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
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
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      <span>Sign Up</span>
                    </div>
                  )}
                </Button>

                <div className="relative flex items-center">
                  <span className="flex-grow border-t border-gray-300"></span>
                  <span className="px-4 text-xs text-gray-500 uppercase">
                    Or
                  </span>
                  <span className="flex-grow border-t border-gray-300"></span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" y1="8" x2="12" y2="8"></line>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50"
                  onClick={toggleAuthMethod}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Sign Up with Phone
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Log In
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
