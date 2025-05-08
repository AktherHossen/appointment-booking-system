import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AppointmentsList from "@/components/AppointmentsList";
import AppointmentForm from "@/components/AppointmentForm";
import DoctorsList from "@/components/DoctorsList";
import SMSTemplates from "@/components/SMSTemplates";
import Settings from "@/components/Settings";
import BulkSMSNotification from "@/components/BulkSMSNotification";
import { Appointment } from "@/types";
import { fetchAppointments } from "@/utils/databaseUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("receptionist");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndAppointments = async () => {
      try {
        // Get user from localStorage
        const userData = localStorage.getItem('user');
        const userRoleData = localStorage.getItem('userRole');
        
        if (userData) {
          const user = JSON.parse(userData);
          
          if (userRoleData) {
            setUserRole(userRoleData);
          }
          
          // Fetch appointments
          if (activeTab === "appointments") {
            const data = await fetchAppointments();
            setAppointments(data);
          }
        } else {
          // Not logged in, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndAppointments();
  }, [activeTab, toast, navigate]);

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
            <div className="space-y-6">
              <AppointmentForm onAppointmentCreated={handleAppointmentCreated} />
              {userRole === "receptionist" && (
                <BulkSMSNotification />
              )}
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
        {loading ? <div className="text-center py-8">Loading...</div> : renderActiveTab()}
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
