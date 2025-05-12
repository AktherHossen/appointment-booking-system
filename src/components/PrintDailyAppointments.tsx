
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Printer, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Doctor {
  id: number;
  name: string;
}

const PrintDailyAppointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch doctors on component mount
  useState(() => {
    fetchDoctors();
  }, []);

  // Fetch doctors from database
  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("id, name");

      if (error) {
        throw error;
      }

      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors list",
        variant: "destructive",
      });
    }
  };

  // Fetch appointments for the selected date and doctor
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Format date to YYYY-MM-DD for database query
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      // Build the query
      let query = supabase
        .from("appointments")
        .select(`
          *,
          doctors (*)
        `)
        .gte('appointment_time', `${formattedDate}T00:00:00`)
        .lt('appointment_time', `${formattedDate}T23:59:59`);
      
      // Add doctor filter if a specific doctor is selected
      if (selectedDoctorId !== "all") {
        query = query.eq('doctor_id', selectedDoctorId);
      }
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Map the data to our Appointment type
      const mappedAppointments = (data || []).map(appointment => {
        return {
          id: appointment.id,
          date: new Date(appointment.appointment_time),
          time: format(new Date(appointment.appointment_time), 'HH:mm'),
          status: appointment.status,
          patient: {
            name: appointment.patient_name,
            phone: appointment.phone_number
          },
          doctor: appointment.doctors ? {
            id: appointment.doctors.id,
            name: appointment.doctors.name,
            specialization: appointment.doctors.specialization
          } : undefined,
          notes: ''
        };
      });

      setAppointments(mappedAppointments);
      
      if (mappedAppointments.length === 0) {
        toast({
          title: "No appointments found",
          description: "No appointments found for the selected criteria",
        });
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    // Create a printable view
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please check your popup settings.",
        variant: "destructive",
      });
      return;
    }
    
    // Get doctor name for the header
    const doctorName = selectedDoctorId === "all" 
      ? "All Doctors" 
      : doctors.find(d => d.id.toString() === selectedDoctorId)?.name || "Unknown Doctor";
    
    // Create the print HTML content
    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Appointments - ${format(selectedDate, 'dd MMM yyyy')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 10px; }
            h2 { text-align: center; font-size: 16px; margin-bottom: 20px; color: #555; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
            .no-appointments { text-align: center; padding: 20px; color: #777; }
            @media print {
              body { margin: 0.5cm; }
              button { display: none; }
              h1 { margin-top: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Daily Appointment List - Core Diagnostic Ltd</h1>
          <h2>Date: ${format(selectedDate, 'dd MMMM yyyy')} | Doctor: ${doctorName}</h2>
          ${appointments.length === 0 ? 
            '<p class="no-appointments">No appointments found for the selected criteria</p>' : 
            `<table>
              <thead>
                <tr>
                  <th>App. No</th>
                  <th>Patient Name</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${appointments.map((appointment, index) => `
                  <tr>
                    <td>${appointment.id}</td>
                    <td>${appointment.patient.name}</td>
                    <td>${appointment.time}</td>
                    <td>${appointment.doctor?.name || 'Not assigned'}</td>
                    <td>${appointment.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          }
          <div class="footer">
            <p>Generated on ${format(new Date(), 'dd MMM yyyy HH:mm')}</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-lg">Print Daily Appointment List</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="date-picker">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  id="date-picker"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor</Label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Select doctor" />
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
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={fetchAppointments}
            disabled={loading}
          >
            <Filter className="mr-2 h-4 w-4" />
            {loading ? "Loading..." : "Apply Filters"}
          </Button>
          
          <Button
            onClick={handlePrint}
            disabled={appointments.length === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print List
          </Button>
        </div>
        
        {appointments.length > 0 && (
          <div className="mt-5 border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App. No</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>{appointment.patient.name}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>{appointment.doctor?.name || 'Not assigned'}</TableCell>
                    <TableCell>{appointment.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintDailyAppointments;
