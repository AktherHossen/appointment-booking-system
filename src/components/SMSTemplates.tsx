
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { smsTemplates } from "@/data/mockData";
import { SMSTemplate } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const SMSTemplates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<SMSTemplate[]>(smsTemplates);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  const handleEdit = (template: SMSTemplate) => {
    setEditing(template.id);
    setEditContent(template.content);
  };

  const handleSave = (id: string) => {
    const updatedTemplates = templates.map((template) => {
      if (template.id === id) {
        return { ...template, content: editContent };
      }
      return template;
    });
    
    setTemplates(updatedTemplates);
    setEditing(null);
    
    toast({
      title: "Template Updated",
      description: "The SMS template has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setEditContent("");
  };

  const templateTypeLabels = {
    confirmation: "Appointment Confirmation",
    reminder: "Appointment Reminder",
    cancellation: "Appointment Cancellation"
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-medical-800">SMS Templates</h2>
      
      <div className="space-y-6">
        {templates.map((template) => (
          <Card key={template.id} className="card-shadow">
            <CardHeader className="bg-medical-50 py-4">
              <CardTitle className="text-lg flex items-center text-medical-800">
                <MessageSquare className="h-5 w-5 mr-2" />
                {templateTypeLabels[template.type as keyof typeof templateTypeLabels]}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {editing === template.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`template-${template.id}`}>Template Content</Label>
                    <Textarea
                      id={`template-${template.id}`}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={5}
                    />
                    <p className="text-xs text-gray-500">
                      Available variables: {"{patientName}"}, {"{doctorName}"}, {"{date}"}, {"{time}"}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleSave(template.id)}
                      className="bg-medical-800 hover:bg-medical-700"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm border p-3 rounded-md bg-gray-50">
                    {template.content}
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => handleEdit(template)}
                    className="text-medical-800 border-medical-800 hover:bg-medical-50"
                  >
                    Edit Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SMSTemplates;
