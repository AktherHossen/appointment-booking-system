
export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  phone?: string;
};

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";

export type Appointment = {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Doctor;
  date: Date;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
};

export type SMSTemplate = {
  id: string;
  type: "confirmation" | "reminder" | "cancellation";
  content: string;
};
