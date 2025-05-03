import type { Database } from "@/integrations/supabase/types";

export type Doctor = {
  id: number;
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
  id: number;
  patientId?: string;
  patient: {
    name: string | null;
    phone: string;
  };
  doctorId: number | null;
  doctor?: Doctor;
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

// Helper function to convert from Supabase appointment to our app's Appointment type
export const mapSupabaseAppointment = (
  appointment: Database["public"]["Tables"]["appointments"]["Row"],
  doctor?: Database["public"]["Tables"]["doctors"]["Row"]
): Appointment => {
  // Parse the appointment_time to get date and time
  const appointmentDateTime = new Date(appointment.appointment_time);
  
  return {
    id: appointment.id,
    doctorId: appointment.doctor_id,
    doctor: doctor ? {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization
    } : undefined,
    patient: {
      name: appointment.patient_name,
      phone: appointment.phone_number
    },
    date: appointmentDateTime,
    time: appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: (appointment.status || "pending") as AppointmentStatus,
    createdAt: new Date()
  };
};

// Helper function to convert from our app's Appointment type to Supabase format
export const mapToSupabaseAppointment = (
  appointment: Partial<Appointment>
): Partial<Database["public"]["Tables"]["appointments"]["Insert"]> => {
  // Combine date and time into a single timestamp
  let appointmentTime: string | null = null;
  
  if (appointment.date) {
    const date = appointment.date;
    const timeParts = appointment.time ? appointment.time.match(/(\d+):(\d+)\s*([APap][Mm])?/) : null;
    
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const period = timeParts[3]?.toUpperCase();
      
      // Convert to 24-hour format if AM/PM is specified
      if (period === "PM" && hours < 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
      
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);
      appointmentTime = newDate.toISOString();
    } else {
      appointmentTime = date.toISOString();
    }
  }
  
  return {
    patient_name: appointment.patient?.name || null,
    phone_number: appointment.patient?.phone || "",
    doctor_id: appointment.doctorId || null,
    appointment_time: appointmentTime || new Date().toISOString(),
    status: appointment.status
  };
};
