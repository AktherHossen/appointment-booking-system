
import { useState } from "react";
import { appointments } from "@/data/mockData";
import Navigation from "@/components/Navigation";
import AppointmentsList from "@/components/AppointmentsList";
import AppointmentForm from "@/components/AppointmentForm";
import DoctorsList from "@/components/DoctorsList";
import SMSTemplates from "@/components/SMSTemplates";
import Settings from "@/components/Settings";
import { Appointment } from "@/types";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);

  const handleAppointmentCreated = (appointment: Appointment) => {
    setLocalAppointments([...localAppointments, appointment]);
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
      
      <footer className="bg-medical-800 text-white py-4 mt-8">
        <div className="container text-center text-sm">
          <p>© {new Date().getFullYear()} Diagnostic Center SMS Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
