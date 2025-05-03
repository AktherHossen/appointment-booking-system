
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Doctor, Appointment } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatSMSContent, sendSMS } from "@/utils/smsUtils";
import { smsTemplates } from "@/data/mockData";
import { fetchDoctors, createAppointment } from "@/utils/databaseUtils";

type Props = {
  onAppointmentCreated: (appointment: Appointment) => void;
};

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM"
];

const AppointmentForm = ({ onAppointmentCreated }: Props) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await fetchDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error loading doctors:", error);
        toast({
          title: "Error Loading Doctors",
          description: "Failed to load doctors from database.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !selectedDoctor || !patientName || !patientPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const doctorId = parseInt(selectedDoctor);
      const doctor = doctors.find(d => d.id === doctorId);
      
      if (!doctor) {
        throw new Error("Selected doctor not found");
      }

      const newAppointment: Partial<Appointment> = {
        patient: {
          name: patientName,
          phone: patientPhone
        },
        doctorId,
        doctor,
        date: date as Date,
        time,
        status: "pending",
        notes,
      };

      const createdAppointment = await createAppointment(newAppointment);
      
      // Send confirmation SMS
      const template = smsTemplates.find(t => t.type === "confirmation");
      
      if (template && patientPhone) {
        const message = formatSMSContent(template, createdAppointment);
        await sendSMS(patientPhone, message);
      }
      
      // Notify parent component
      onAppointmentCreated(createdAppointment);
      
      // Reset form
      setTime("");
      setSelectedDoctor("");
      setPatientName("");
      setPatientPhone("");
      setNotes("");
      
      toast({
        title: "Appointment Created",
        description: "The appointment has been successfully created and a confirmation SMS has been sent.",
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="bg-medical-800 text-white">
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          Loading doctors data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-medical-800 text-white">
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          New Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select 
              value={selectedDoctor ? selectedDoctor.toString() : ""} 
              onValueChange={setSelectedDoctor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.name} - {doctor.specialization || "Not specified"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientPhone">Patient Phone</Label>
            <Input
              id="patientPhone"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="e.g. +8801712345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-medical-800 hover:bg-medical-700"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Appointment & Send SMS"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;
