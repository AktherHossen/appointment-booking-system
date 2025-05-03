
import { supabase } from "@/integrations/supabase/client";
import { Doctor, Appointment, mapSupabaseAppointment, mapToSupabaseAppointment } from "@/types";

// Doctor functions
export const fetchDoctors = async (): Promise<Doctor[]> => {
  const { data, error } = await supabase
    .from("doctors")
    .select("*");
    
  if (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
  
  return data || [];
};

export const addDoctor = async (doctor: Omit<Doctor, "id">): Promise<Doctor> => {
  const { data, error } = await supabase
    .from("doctors")
    .insert({
      name: doctor.name,
      specialization: doctor.specialization
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error adding doctor:", error);
    throw error;
  }
  
  return data;
};

// Appointment functions
export const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      doctors (*)
    `);
    
  if (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
  
  return (data || []).map(appointment => {
    return mapSupabaseAppointment(appointment, appointment.doctors);
  });
};

export const createAppointment = async (appointment: Partial<Appointment>): Promise<Appointment> => {
  // Make sure required fields are present
  if (!appointment.date || !appointment.time || !appointment.patient?.phone) {
    throw new Error("Required appointment fields missing");
  }
  
  const supabaseAppointment = mapToSupabaseAppointment(appointment);
  
  // Make sure appointment_time is set (required by Supabase)
  const dateObj = appointment.date;
  supabaseAppointment.appointment_time = dateObj?.toISOString() || new Date().toISOString();
  
  // Make sure phone_number is set (required by Supabase)
  supabaseAppointment.phone_number = appointment.patient.phone;
  
  // Insert the appointment with all required fields
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      appointment_time: supabaseAppointment.appointment_time,
      phone_number: supabaseAppointment.phone_number,
      doctor_id: supabaseAppointment.doctor_id,
      patient_name: supabaseAppointment.patient_name,
      status: supabaseAppointment.status || 'pending'
    })
    .select(`
      *,
      doctors (*)
    `)
    .single();
    
  if (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
  
  return mapSupabaseAppointment(data, data.doctors);
};

export const updateAppointmentStatus = async (id: number, status: string): Promise<void> => {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);
    
  if (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};
