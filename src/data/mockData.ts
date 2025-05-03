
import { Doctor, Appointment } from "@/types";

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
    patient_name: "Abdul Karim",
    phone_number: "+8801712345678",
    appointment_time: "2023-03-20T10:30:00",
    status: "confirmed",
    doctor_id: 1,
    doctor: mockDoctors[0]
  },
  {
    id: 2,
    patient_name: "Sajeda Begum",
    phone_number: "+8801712345679",
    appointment_time: "2023-03-20T11:00:00",
    status: "pending",
    doctor_id: 2,
    doctor: mockDoctors[1]
  },
  {
    id: 3,
    patient_name: "Rabeya Khatun",
    phone_number: "+8801712345680",
    appointment_time: "2023-03-20T11:30:00",
    status: "cancelled",
    doctor_id: 3,
    doctor: mockDoctors[2]
  },
  {
    id: 4,
    patient_name: "Kamal Hossain",
    phone_number: "+8801712345681",
    appointment_time: "2023-03-20T12:00:00",
    status: "confirmed",
    doctor_id: 4,
    doctor: mockDoctors[3]
  },
  {
    id: 5,
    patient_name: "Sharmin Akter",
    phone_number: "+8801712345682",
    appointment_time: "2023-03-20T12:30:00",
    status: "pending",
    doctor_id: 5,
    doctor: mockDoctors[4]
  }
];
