import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Context
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// Layout and Route Protection
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./components/Login";
import SignUp from "./components/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Main Pages
import Dashboard from "./components/Dashboard";
import MedicationTracker from "./components/MedicationTracker";
import MemoryGame from "./components/MemoryGame";
import EmergencyContacts from "./components/EmergencyContacts";
import PharmacyFinder from "./components/PharmacyFinder";
import AIAssistant from "./components/AIAssistant";
import MentalHealth from "./components/MentalHealth";
import TelemedicineConsult from "./components/TelemedicineConsult";
import SocialClub from "./components/SocialClub";
import AIHealth from "./components/AIHealth";
import Profile from "./pages/Profile";
import MentalHealthPage from './pages/MentalHealthPage';
import MentalSupportPage from './pages/MentalSupportPage';

// Fallback Page
import NotFound from "./pages/NotFound";

// React Query Client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Protected Routes with Layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Navigate to="/dashboard" replace />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/medications"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MedicationTracker />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/games"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MemoryGame />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/emergency"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EmergencyContacts />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pharmacy"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PharmacyFinder />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIAssistant />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/mentalhealth"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MentalHealth />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/telemedicine"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TelemedicineConsult />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/social"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SocialClub />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/aihealth"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIHealth />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route path="/mental-health" element={<MentalHealthPage />} />

                <Route
                  path="/mental-support"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MentalSupportPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
