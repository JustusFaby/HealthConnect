export interface Doctor {
  id: string;
  name: string;
  email: string;
  subject: string;
  role: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  isBooked: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  message: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient';
  receiverId: string;
  receiverName: string;
  content: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'doctor' | 'patient' | null;

export interface CurrentUser {
  id: string;
  name?: string;
  email: string;
  subject?: string;
  role: UserRole;
}
