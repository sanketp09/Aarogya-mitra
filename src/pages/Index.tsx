import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">AROGYA MITRA</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button
                variant="ghost"
                className="text-white hover:bg-purple-500"
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-purple-500"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            Welcome to AROGYA MITRA
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Your companion for better care and peace of mind.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-purple-700 mb-4">
              Logged in as:
            </h3>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Email:</span> {currentUser?.email}
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/profile">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
