import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Pill,
  Brain,
  Phone,
  Bot,
  MapPin,
  MessageSquare,
  Video,
  Users,
  Heart,
  Globe,
} from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useLanguage } from "../context/LanguageContext";
import { Dialog, DialogContent } from "./ui/dialog";
import AIAssistant from "./AIAssistant";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: "/", label: t("nav.home"), icon: <Home className="h-7 w-7" /> },
    {
      path: "/medications",
      label: t("nav.medications"),
      icon: <Pill className="h-7 w-7" />,
    },
    {
      path: "/games",
      label: t("nav.games"),
      icon: <Brain className="h-7 w-7" />,
    },
    {
      path: "/emergency",
      label: t("nav.emergency"),
      icon: <Phone className="h-7 w-7" />,
    },
    {
      path: "/pharmacy",
      label: t("nav.pharmacy"),
      icon: <MapPin className="h-7 w-7" />,
    },
    {
      path: "/chatbot",
      label: t("nav.assistant"),
      icon: <MessageSquare className="h-7 w-7" />,
    },
    {
      path: "/telemedicine",
      label: t("Appointments"),
      icon: <Video className="h-7 w-7" />,
    },
    {
      path: "/social",
      label: t("nav.social"),
      icon: <Users className="h-7 w-7" />,
    },
    {
      path: "/mentalhealth",
      label: t("nav.mentalhealth"),
      icon: <Heart className="h-7 w-7" />,
    },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as any);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <header className="bg-care-primary text-white p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-2xl md:text-3xl font-bold">{t("app.title")}</h1>
        <div className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-care-primary text-white border border-white/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={t("language.select")}
          >
            <option value="english">{t("language.english")}</option>
            <option value="hindi">{t("language.hindi")}</option>
            <option value="marathi">{t("language.marathi")}</option>
          </select>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 mt-2">
        {children}
      </main>

      {/* AI Assistant button */}
      <div className="fixed right-4 bottom-20 md:bottom-24 z-20">
        <Button
          onClick={() => setIsAIModalOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 bg-care-secondary hover:bg-care-tertiary shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* AI Assistant Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <AIAssistant />
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 md:hidden">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 ${
                location.pathname === item.path
                  ? "text-care-primary"
                  : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 pt-20 z-20">
        <div className="flex flex-col p-4 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                location.pathname === item.path
                  ? "bg-care-light text-care-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
