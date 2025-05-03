
import { Appointment, SMSTemplate } from "@/types";
import { format } from "date-fns";

export const formatSMSContent = (template: SMSTemplate, appointment: Appointment): string => {
  let content = template.content;
  
  content = content.replace(/{patientName}/g, appointment.patient.name);
  content = content.replace(/{doctorName}/g, appointment.doctor.name);
  content = content.replace(/{date}/g, format(appointment.date, "dd/MM/yyyy"));
  content = content.replace(/{time}/g, appointment.time);
  
  return content;
};

export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  // In a real implementation, this would connect to an SMS gateway API
  // For demonstration purposes, we'll just log the message and simulate a successful send
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return true to simulate successful sending
  return true;
};
