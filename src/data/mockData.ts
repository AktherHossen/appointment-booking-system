
import { Appointment, Doctor, Patient, SMSTemplate } from "@/types";

export const doctors: Doctor[] = [
  { id: "1", name: "Dr. Abdul Rahman", specialization: "Cardiologist" },
  { id: "2", name: "Dr. Fatima Khan", specialization: "Neurologist" },
  { id: "3", name: "Dr. Mohammad Ali", specialization: "Orthopedic" },
  { id: "4", name: "Dr. Ayesha Begum", specialization: "Gynecologist" },
  { id: "5", name: "Dr. Kamal Hasan", specialization: "Dermatologist" },
  { id: "6", name: "Dr. Nasreen Ahmed", specialization: "Ophthalmologist" },
];

export const patients: Patient[] = [
  { id: "1", name: "Rafiq Islam", phone: "+8801712345678", address: "Dhaka" },
  { id: "2", name: "Sadia Rahman", phone: "+8801898765432", address: "Chittagong" },
  { id: "3", name: "Karim Khan", phone: "+8801634567890", address: "Sylhet" },
  { id: "4", name: "Nadia Akter", phone: "+8801923456789", address: "Khulna" },
];

// Sample appointments for today and the next few days
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

export const appointments: Appointment[] = [
  {
    id: "1",
    patientId: "1",
    patient: patients[0],
    doctorId: "1",
    doctor: doctors[0],
    date: today,
    time: "09:00 AM",
    status: "confirmed",
    notes: "Regular checkup",
    createdAt: new Date(today.setHours(today.getHours() - 2)),
  },
  {
    id: "2",
    patientId: "2",
    patient: patients[1],
    doctorId: "2",
    doctor: doctors[1],
    date: today,
    time: "11:30 AM",
    status: "pending",
    notes: "First consultation",
    createdAt: new Date(today.setHours(today.getHours() - 1)),
  },
  {
    id: "3",
    patientId: "3",
    patient: patients[2],
    doctorId: "3",
    doctor: doctors[2],
    date: tomorrow,
    time: "10:00 AM",
    status: "confirmed",
    notes: "Follow-up",
    createdAt: new Date(today.setHours(today.getHours() - 5)),
  },
  {
    id: "4",
    patientId: "4",
    patient: patients[3],
    doctorId: "4",
    doctor: doctors[3],
    date: dayAfterTomorrow,
    time: "02:00 PM",
    status: "cancelled",
    notes: "Patient requested cancellation",
    createdAt: new Date(today.setHours(today.getHours() - 12)),
  },
];

export const smsTemplates: SMSTemplate[] = [
  {
    id: "1",
    type: "confirmation",
    content: "Dear {patientName}, your appointment with {doctorName} is confirmed for {date} at {time}. Thank you for choosing our diagnostic center. If you need to reschedule, please call us at 01234567890.",
  },
  {
    id: "2",
    type: "reminder",
    content: "Reminder: Dear {patientName}, you have an appointment with {doctorName} today at {time}. Please arrive 15 minutes early. For any queries, call 01234567890.",
  },
  {
    id: "3",
    type: "cancellation",
    content: "Dear {patientName}, your appointment with {doctorName} scheduled for {date} at {time} has been cancelled. Please call 01234567890 to reschedule.",
  },
];
