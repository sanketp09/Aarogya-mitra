import React from "react";
import { useNavigate } from "react-router-dom";
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
import { LogOut, User } from "lucide-react";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-purple-200 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">
            AROGYA MITRA
          </h1>
          <p className="text-gray-600 mt-2">Your Profile</p>
        </div>

        <Card className="shadow-lg border-purple-100">
          <CardHeader>
            <div className="mx-auto bg-purple-100 p-3 rounded-full w-20 h-20 flex items-center justify-center">
              <User className="h-10 w-10 text-purple-600" />
            </div>
            <CardTitle className="text-2xl text-center mt-4">Profile</CardTitle>
            <CardDescription className="text-center">
              Your account information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{currentUser?.email}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Account ID</p>
              <p className="font-medium text-xs break-all">
                {currentUser?.uid}
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
