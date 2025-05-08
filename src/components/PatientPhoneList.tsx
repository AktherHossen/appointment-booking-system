import { useState } from "react";
import { format } from "date-fns";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Generate month options
const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

// Generate year options (current year and past 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear - i;
  return { value: year.toString(), label: year.toString() };
});

// Type declaration for Navigator with msSaveBlob for TypeScript compatibility
interface NavigatorWithMsSaveBlob extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
}

const PatientPhoneList = () => {
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>(currentYear.toString());
  const [patientName, setPatientName] = useState<string>("");
  const [doctorName, setDoctorName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("appointments")
        .select(`
          phone_number,
          patient_name,
          appointment_time,
          doctors (
            name,
            specialization
          )
        `);

      // Apply filters
      if (patientName) {
        query = query.ilike('patient_name', `%${patientName}%`);
      }

      if (doctorName) {
        query = query.ilike('doctors.name', `%${doctorName}%`);
      }

      // Apply month and year filter if both are selected
      if (month && year) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        let endDate: Date;
        
        // Calculate end date
        if (parseInt(month) === 12) {
          endDate = new Date(parseInt(year) + 1, 0, 1);
        } else {
          endDate = new Date(parseInt(year), parseInt(month), 1);
        }
        
        query = query.gte('appointment_time', startDate.toISOString())
                    .lt('appointment_time', endDate.toISOString());
      } else if (year) {
        // Filter by year only
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year) + 1, 0, 1);
        
        query = query.gte('appointment_time', startDate.toISOString())
                    .lt('appointment_time', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No data",
          description: "No appointments found with the selected filters",
          variant: "destructive"
        });
        return;
      }

      // Format data for download
      const formattedData = data.map(appointment => ({
        'Phone Number': appointment.phone_number,
        'Patient Name': appointment.patient_name,
        'Appointment Date': format(new Date(appointment.appointment_time), 'yyyy-MM-dd'),
        'Appointment Time': format(new Date(appointment.appointment_time), 'HH:mm'),
        'Doctor': appointment.doctors ? appointment.doctors.name : 'N/A',
        'Specialization': appointment.doctors ? appointment.doctors.specialization : 'N/A'
      }));

      // Create CSV content
      const headers = Object.keys(formattedData[0]);
      const csvContent = [
        headers.join(','),
        ...formattedData.map(row => 
          headers.map(header => {
            // Escape values that contain commas
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `patient_appointments_${month ? months.find(m => m.value === month)?.label + '_' : ''}${year}.csv`;
      
      // Cast navigator to our extended interface
      const navigatorWithMsSaveBlob = navigator as NavigatorWithMsSaveBlob;
      
      if (navigatorWithMsSaveBlob.msSaveBlob) {
        // IE 10+
        navigatorWithMsSaveBlob.msSaveBlob(blob, fileName);
      } else {
        // Other browsers
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Download complete",
        description: `Successfully downloaded ${formattedData.length} appointments`
      });
    } catch (error) {
      console.error("Error downloading patient phone list:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating the patient phone list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-lg">Download Patient Phone List</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="month">Month (Optional)</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name Filter</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Filter by patient name"
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="doctorName">Doctor Name Filter</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="doctorName"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Filter by doctor name"
                className="pl-9"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Download Phone List"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientPhoneList;
