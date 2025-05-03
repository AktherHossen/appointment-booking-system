
import { Doctor, Appointment, SMSTemplate } from "@/types";

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sajeeb Ahmed",
    specialization: "Cardiologist"
  },
  {
    id: 2,
    name: "Dr. Fatima Khan",
    specialization: "Neurologist"
  },
  {
    id: 3,
    name: "Dr. Rahman Shihab",
    specialization: "Orthopedic"
  },
  {
    id: 4,
    name: "Dr. Nusrat Jahan",
    specialization: "Gynecologist"
  },
  {
    id: 5,
    name: "Dr. Mahfuz Alam",
    specialization: "Dermatologist"
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patient: {
      name: "Abdul Karim",
      phone: "+8801712345678"
    },
    doctorId: 1,
    doctor: mockDoctors[0],
    date: new Date("2023-03-20T10:30:00"),
    time: "10:30 AM",
    status: "confirmed",
    createdAt: new Date()
  },
  {
    id: 2,
    patient: {
      name: "Sajeda Begum",
      phone: "+8801712345679"
    },
    doctorId: 2,
    doctor: mockDoctors[1],
    date: new Date("2023-03-20T11:00:00"),
    time: "11:00 AM",
    status: "pending",
    createdAt: new Date()
  },
  {
    id: 3,
    patient: {
      name: "Rabeya Khatun",
      phone: "+8801712345680"
    },
    doctorId: 3,
    doctor: mockDoctors[2],
    date: new Date("2023-03-20T11:30:00"),
    time: "11:30 AM",
    status: "cancelled",
    createdAt: new Date()
  },
  {
    id: 4,
    patient: {
      name: "Kamal Hossain",
      phone: "+8801712345681"
    },
    doctorId: 4,
    doctor: mockDoctors[3],
    date: new Date("2023-03-20T12:00:00"),
    time: "12:00 PM",
    status: "confirmed",
    createdAt: new Date()
  },
  {
    id: 5,
    patient: {
      name: "Sharmin Akter",
      phone: "+8801712345682"
    },
    doctorId: 5,
    doctor: mockDoctors[4],
    date: new Date("2023-03-20T12:30:00"),
    time: "12:30 PM",
    status: "pending",
    createdAt: new Date()
  }
];

// Add the missing SMS templates
export const smsTemplates: SMSTemplate[] = [
  {
    id: "template-confirmation",
    type: "confirmation",
    content: "Dear {patientName}, your appointment with {doctorName} is confirmed for {date} at {time}. If you need to reschedule, please contact Core Diagnostic Ltd at +8801712345678."
  },
  {
    id: "template-reminder",
    type: "reminder",
    content: "Reminder: Dear {patientName}, your appointment with {doctorName} is scheduled for {date} at {time}. We look forward to serving you at Core Diagnostic Ltd."
  },
  {
    id: "template-cancellation",
    type: "cancellation",
    content: "Dear {patientName}, your appointment with {doctorName} on {date} at {time} has been cancelled. Please call +8801712345678 to reschedule."
  }
];
