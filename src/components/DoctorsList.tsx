
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Doctor } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, Plus, Phone } from "lucide-react";
import { fetchDoctors, addDoctor } from "@/utils/databaseUtils";

const DoctorsList = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDoctor, setNewDoctor] = useState<{
    name: string;
    specialization: string;
    phone: string;
  }>({
    name: "",
    specialization: "",
    phone: "",
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctorsData = await fetchDoctors();
        setDoctors(doctorsData);
      } catch (error) {
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

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.specialization) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and specialization.",
        variant: "destructive",
      });
      return;
    }

    try {
      const added = await addDoctor({
        name: newDoctor.name,
        specialization: newDoctor.specialization,
      });
      
      setDoctors([...doctors, added]);
      setNewDoctor({ name: "", specialization: "", phone: "" });
      setShowAddForm(false);
      
      toast({
        title: "Doctor Added",
        description: `${added.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Add Doctor",
        description: "There was an error adding the doctor to the database.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading doctors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-medical-800">Doctors</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-medical-800 hover:bg-medical-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {showAddForm && (
        <Card className="shadow-md mb-6">
          <CardHeader className="bg-medical-800 text-white">
            <CardTitle className="text-lg">Add New Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                placeholder="Dr. Full Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                placeholder="E.g., Cardiologist"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                placeholder="E.g., +8801712345678"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleAddDoctor}
                className="bg-medical-800 hover:bg-medical-700"
              >
                Add Doctor
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {doctors.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">No doctors found. Add your first doctor.</p>
        </div>
      ) : (
        <div className="appointment-grid">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="card-shadow">
              <CardHeader className="bg-medical-50 py-4">
                <CardTitle className="text-lg flex items-center text-medical-800">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  {doctor.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    <strong>Specialization:</strong> {doctor.specialization || "Not specified"}
                  </p>
                  {doctor.phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {doctor.phone}
                    </p>
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

export default DoctorsList;
