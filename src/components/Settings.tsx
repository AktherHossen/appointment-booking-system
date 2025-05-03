
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [smsGatewayKey, setSmsGatewayKey] = useState<string>("");
  const [clinicName, setClinicName] = useState<string>("Dhaka Diagnostic Center");
  const [clinicPhone, setClinicPhone] = useState<string>("+8801712345678");
  const [autoSendReminders, setAutoSendReminders] = useState<boolean>(true);
  const [reminderHours, setReminderHours] = useState<number>(3);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully saved.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-medical-800">Settings</h2>
      
      <Card className="card-shadow">
        <CardHeader className="bg-medical-50 py-4">
          <CardTitle className="text-lg flex items-center text-medical-800">
            <SettingsIcon className="h-5 w-5 mr-2" />
            SMS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smsGatewayKey">SMS Gateway API Key</Label>
            <Input
              id="smsGatewayKey"
              type="password"
              value={smsGatewayKey}
              onChange={(e) => setSmsGatewayKey(e.target.value)}
              placeholder="Enter your SMS gateway API key"
            />
            <p className="text-xs text-gray-500">
              This key will be used to authenticate with your SMS gateway provider.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSendReminders">Automatic SMS Reminders</Label>
              <p className="text-xs text-gray-500">
                Automatically send reminder SMS before appointments
              </p>
            </div>
            <Switch
              id="autoSendReminders"
              checked={autoSendReminders}
              onCheckedChange={setAutoSendReminders}
            />
          </div>
          
          {autoSendReminders && (
            <div className="space-y-2">
              <Label htmlFor="reminderHours">Send Reminder Hours Before Appointment</Label>
              <Input
                id="reminderHours"
                type="number"
                min={1}
                max={24}
                value={reminderHours}
                onChange={(e) => setReminderHours(parseInt(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="card-shadow">
        <CardHeader className="bg-medical-50 py-4">
          <CardTitle className="text-lg flex items-center text-medical-800">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Clinic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Clinic Name</Label>
            <Input
              id="clinicName"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clinicPhone">Clinic Phone</Label>
            <Input
              id="clinicPhone"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          className="bg-medical-800 hover:bg-medical-700"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
