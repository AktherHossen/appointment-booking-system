
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Send } from "lucide-react";
import { Doctor, Appointment } from "@/types";
import { fetchDoctors, fetchAppointments } from "@/utils/databaseUtils";
import { formatSMSContent, sendSMS } from "@/utils/smsUtils";
import { smsTemplates } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";

const BulkSMSNotification = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [affectedAppointments, setAffectedAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorsData = await fetchDoctors();
        setDoctors(doctorsData);

        const appointmentsData = await fetchAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load necessary data.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    // Filter appointments based on selected criteria
    let filtered = [...appointments];

    if (selectedDoctor) {
      filtered = filtered.filter(
        (appointment) => appointment.doctorId === parseInt(selectedDoctor)
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (appointment) => 
          format(new Date(appointment.date), "yyyy-MM-dd") === 
          format(selectedDate, "yyyy-MM-dd")
      );
    }

    setAffectedAppointments(filtered);
  }, [selectedDoctor, selectedDate, appointments]);

  const handleSendBulkSMS = async () => {
    if (affectedAppointments.length === 0) {
      toast({
        title: "No Appointments Selected",
        description: "There are no appointments matching your criteria.",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const appointment of affectedAppointments) {
        if (appointment.patient.phone) {
          // Replace placeholders in message
          let personalizedMessage = message;
          personalizedMessage = personalizedMessage.replace(/{patientName}/g, appointment.patient.name || "");
          personalizedMessage = personalizedMessage.replace(/{doctorName}/g, appointment.doctor?.name || "");
          personalizedMessage = personalizedMessage.replace(/{date}/g, format(new Date(appointment.date), "dd/MM/yyyy"));
          personalizedMessage = personalizedMessage.replace(/{time}/g, appointment.time);

          const sent = await sendSMS(appointment.patient.phone, personalizedMessage);
          if (sent) {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }
      }

      toast({
        title: "Bulk SMS Sent",
        description: `Successfully sent ${successCount} messages. ${failCount} failed.`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
      toast({
        title: "Error Sending Messages",
        description: "An error occurred while sending bulk SMS.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const loadCancellationTemplate = () => {
    const template = smsTemplates.find((t) => t.type === "cancellation");
    if (template) {
      setMessage(template.content);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Bulk SMS Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Filter by Doctor</Label>
          <Select 
            value={selectedDoctor || "all"} 
            onValueChange={(value) => setSelectedDoctor(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Filter by Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(undefined)}
            >
              Clear Date
            </Button>
          )}
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <Label>Message</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadCancellationTemplate}
            >
              Use Cancellation Template
            </Button>
          </div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here"
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Available variables: {"{patientName}"}, {"{doctorName}"}, {"{date}"}, {"{time}"}
          </p>
        </div>

        <div>
          <p className="font-medium">
            Affected Appointments: {affectedAppointments.length}
          </p>
          <ul className="text-sm mt-2 max-h-32 overflow-auto">
            {affectedAppointments.slice(0, 5).map((appointment) => (
              <li key={appointment.id} className="py-1 border-b text-xs">
                {appointment.patient.name} - {format(new Date(appointment.date), "dd/MM/yyyy")} at {appointment.time}
              </li>
            ))}
            {affectedAppointments.length > 5 && (
              <li className="text-xs text-gray-500 py-1">
                ...and {affectedAppointments.length - 5} more
              </li>
            )}
          </ul>
        </div>

        <Button
          className="w-full bg-medical-800 hover:bg-medical-700"
          disabled={sending || affectedAppointments.length === 0}
          onClick={handleSendBulkSMS}
        >
          {sending
            ? "Sending..."
            : `Send SMS to ${affectedAppointments.length} Patients`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkSMSNotification;
