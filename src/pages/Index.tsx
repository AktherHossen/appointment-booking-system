
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AppointmentsList from "@/components/AppointmentsList";
import AppointmentForm from "@/components/AppointmentForm";
import DoctorsList from "@/components/DoctorsList";
import SMSTemplates from "@/components/SMSTemplates";
import Settings from "@/components/Settings";
import { Appointment } from "@/types";
import { fetchAppointments } from "@/utils/databaseUtils";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (activeTab === "appointments") {
        try {
          const data = await fetchAppointments();
          setAppointments(data);
        } catch (error) {
          console.error("Error loading appointments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAppointments();
  }, [activeTab]);

  const handleAppointmentCreated = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appointments":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AppointmentsList />
            </div>
            <div>
              <AppointmentForm onAppointmentCreated={handleAppointmentCreated} />
            </div>
          </div>
        );
      case "doctors":
        return <DoctorsList />;
      case "templates":
        return <SMSTemplates />;
      case "settings":
        return <Settings />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="container py-6">
        {renderActiveTab()}
      </main>
      
      <footer className="bg-core-dark text-white py-4 mt-8">
        <div className="container text-center">
          <p className="text-sm">© {new Date().getFullYear()} Core Diagnostic Ltd. - Touching Lives</p>
          <div className="mt-2 flex justify-center">
            <img 
              src="/public/lovable-uploads/f9df85d2-dc5f-44ef-852d-aef6eb82fe78.png" 
              alt="Core Diagnostic Ltd Logo" 
              className="h-10 invert brightness-0" 
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
