
import { useState } from "react";
import { Appointment } from "@/types";
import { format } from "date-fns";
import { Calendar, Clock, User, Stethoscope, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appointments } from "@/data/mockData";
import { formatSMSContent, sendSMS } from "@/utils/smsUtils";
import { smsTemplates } from "@/data/mockData";
import { toast } from "@/components/ui/use-toast";

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const AppointmentsList = () => {
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [sending, setSending] = useState<{[key: string]: boolean}>({});

  const handleStatusChange = async (id: string, newStatus: "confirmed" | "pending" | "cancelled") => {
    // Update local state
    const updatedAppointments = localAppointments.map(appointment => {
      if (appointment.id === id) {
        const updated = { ...appointment, status: newStatus };
        
        // Find the appropriate template
        const templateType = 
          newStatus === "confirmed" ? "confirmation" : 
          newStatus === "cancelled" ? "cancellation" : "reminder";
        
        const template = smsTemplates.find(t => t.type === templateType);
        
        // If template exists, send SMS
        if (template) {
          sendStatusSMS(updated, template.id);
        }
        
        return updated;
      }
      return appointment;
    });
    
    setLocalAppointments(updatedAppointments);
  };

  const handleSendReminder = async (appointment: Appointment) => {
    const template = smsTemplates.find(t => t.type === "reminder");
    if (template) {
      await sendStatusSMS(appointment, template.id);
    }
  };

  const sendStatusSMS = async (appointment: Appointment, templateId: string) => {
    setSending(prev => ({ ...prev, [appointment.id]: true }));
    
    try {
      const template = smsTemplates.find(t => t.id === templateId);
      
      if (!template || !appointment.patient.phone) {
        throw new Error("Missing template or patient phone number");
      }
      
      const message = formatSMSContent(template, appointment);
      const success = await sendSMS(appointment.patient.phone, message);
      
      if (success) {
        toast({
          title: "SMS Sent Successfully",
          description: `${template.type.charAt(0).toUpperCase() + template.type.slice(1)} SMS sent to ${appointment.patient.name}`,
        });
      } else {
        throw new Error("Failed to send SMS");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Failed to Send SMS",
        description: "There was a problem sending the SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(prev => ({ ...prev, [appointment.id]: false }));
    }
  };

  // Sort appointments by date
  const sortedAppointments = [...localAppointments].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-medical-800">Appointments</h2>
      
      {localAppointments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="appointment-grid">
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="card-shadow overflow-hidden">
              <CardHeader className={`py-3 ${getStatusStyle(appointment.status)}`}>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Appointment #{appointment.id}</span>
                  <Badge variant="outline" className={`capitalize font-medium ${getStatusStyle(appointment.status)}`}>
                    {appointment.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-medical-600" />
                    <span>
                      {format(new Date(appointment.date), "dd MMMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-medical-600" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-medical-600" />
                    <span>{appointment.patient.name} ({appointment.patient.phone})</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Stethoscope className="h-4 w-4 mr-2 text-medical-600" />
                    <span>{appointment.doctor.name} - {appointment.doctor.specialization}</span>
                  </div>
                  {appointment.notes && (
                    <div className="flex items-start text-sm">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 text-medical-600" />
                      <span>{appointment.notes}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  {appointment.status !== "confirmed" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-medical-600 text-medical-600 hover:bg-medical-50"
                      onClick={() => handleStatusChange(appointment.id, "confirmed")}
                      disabled={sending[appointment.id]}
                    >
                      Confirm & Send SMS
                    </Button>
                  )}
                  
                  {appointment.status === "confirmed" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-medical-600 text-medical-600 hover:bg-medical-50"
                      onClick={() => handleSendReminder(appointment)}
                      disabled={sending[appointment.id]}
                    >
                      Send Reminder SMS
                    </Button>
                  )}
                  
                  {appointment.status !== "cancelled" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(appointment.id, "cancelled")}
                      disabled={sending[appointment.id]}
                    >
                      Cancel & Send SMS
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;
