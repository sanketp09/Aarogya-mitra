import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pill, Brain, Phone, Bell, Calendar, Users, Bot } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

// Medication interface
interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
}

// Feature card reusable component
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}> = ({ title, description, icon, to }) => (
  <Link to={to} className="block">
    <Card className="feature-card h-full transition-all duration-200 hover:shadow-md">
      <div className="icon-container flex justify-center py-4 text-care-primary">
        {icon}
      </div>
      <CardContent className="text-center">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.name || "Sanket";

  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/medications");
        if (!res.ok) throw new Error("Failed to fetch medications");
        const data = await res.json();
        const sorted = data.sort((a: Medication, b: Medication) =>
          a.time.localeCompare(b.time)
        );
        setMedications(sorted);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load medication reminders.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, []);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6 animate-fade-in mt-4 md:ml-64 px-4">
      <div>
        <h2 className="text-3xl font-bold mb-6">
          {t("welcome.message")}, {displayName}
        </h2>

        <div className="bg-care-light p-4 rounded-lg mb-8">
          <div className="flex items-center mb-2">
            <div className="mr-4 bg-care-primary p-3 rounded-full">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{t("reminders.title")}</h3>
            </div>
          </div>

          {loading ? (
            <p className="ml-14 text-gray-500">Loading your medications...</p>
          ) : error ? (
            <p className="ml-14 text-red-500">{error}</p>
          ) : medications.length === 0 ? (
            <p className="ml-14 text-gray-500">
              No medications scheduled. Add them in the Medications section.
            </p>
          ) : (
            <div className="ml-14 space-y-2">
              {medications.slice(0, 3).map((med) => (
                <div
                  key={med._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 text-care-primary mr-2" />
                    <span>
                      {med.name} {med.dosage && `(${med.dosage})`}
                    </span>
                  </div>
                  <span className="text-gray-600">{formatTime(med.time)}</span>
                </div>
              ))}
              {medications.length > 3 && (
                <Link
                  to="/medications"
                  className="text-care-primary hover:underline block text-right text-sm pt-1"
                >
                  View all medications ({medications.length})
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {t("feature.quickaccess")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            title={t("feature.medications")}
            description={t("feature.medications.desc")}
            icon={<Pill className="h-8 w-8" />}
            to="/medications"
          />
          <FeatureCard
            title={t("feature.games")}
            description={t("feature.games.desc")}
            icon={<Brain className="h-8 w-8" />}
            to="/games"
          />
          <FeatureCard
            title={t("feature.emergency")}
            description={t("feature.emergency.desc")}
            icon={<Phone className="h-8 w-8" />}
            to="/emergency"
          />
          <FeatureCard
            title={t("feature.appointments")}
            description={t("feature.appointments.desc")}
            icon={<Calendar className="h-8 w-8" />}
            to="/appointments"
          />
          <FeatureCard
            title={t("feature.social")}
            description={t("feature.social.desc")}
            icon={<Users className="h-8 w-8" />}
            to="/social"
          />
          <FeatureCard
            title={t("feature.pharmacy")}
            description={t("feature.pharmacy.desc")}
            icon={<Pill className="h-8 w-8" />}
            to="/pharmacy"
          />
          <FeatureCard
            title={t("feature.assistant")}
            description={t("feature.assistant.desc")}
            icon={<Bot className="h-8 w-8" />}
            to="/aihealth"
          />
          <FeatureCard
            title={t("feature.videocall")}
            description={t("feature.videocall.desc")}
            icon={<Phone className="h-8 w-8" />}
            to="/telemedicine"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;