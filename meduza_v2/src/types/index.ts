// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Doctor specific fields
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
    validUntil?: string;
  }>;
  workplace?: string;
  address?: string;
  bio?: string;
  languages?: string[];
  availableHours?: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  consultationFee?: number;

  // Profile completion tracking
  profileCompleted?: boolean;
  profileCompletionPercentage?: number;
  lastProfileUpdate?: string;

  // Doctor statistics
  totalPatients?: number;
  averageRating?: number;
  reviewsCount?: number;

  // Patient specific fields
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  // Patient medical data (initially empty for new patients)
  upcomingAppointments?: Array<{
    id: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    type: string;
  }>;
  recentResults?: Array<{
    id: string;
    testName: string;
    date: string;
    status: "normal" | "abnormal" | "critical";
  }>;
  activePrescriptions?: Array<{
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    status: string;
  }>;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor";
  phone?: string;
  specialization?: string; // for doctors
  dateOfBirth?: string; // for patients
  gender?: "male" | "female" | "other";
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  date: string;
  time: string;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled" | "no-show" | "rescheduled";
  type: "consultation" | "follow-up" | "emergency" | "routine" | "check-up";
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  doctorId: string;
}

// Medical Records Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  title: string;
  description: string;
  diagnosis: string[];
  symptoms: string[];
  treatment: string;
  prescription: Prescription[];
  labResults?: LabResult[];
  files?: MedicalFile[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  status: "active" | "completed" | "cancelled";
}

export interface LabResult {
  id: string;
  testName: string;
  result: string;
  normalRange: string;
  unit: string;
  date: string;
  status: "normal" | "abnormal" | "critical";
}

export interface MedicalFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  type: "image" | "document" | "lab-result" | "x-ray" | "other";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "patient" | "doctor" | "admin";
  message: string;
  type: "text" | "file" | "image" | "system";
  fileUrl?: string;
  fileName?: string;
  timestamp: string;
  readBy: string[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: "patient" | "doctor" | "admin";
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "lab-result" | "message" | "system";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface AppointmentBookingForm {
  doctorId: string;
  date: string;
  time: string;
  type: Appointment["type"];
  symptoms?: string;
  notes?: string;
}

export interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalPatients?: number; // for doctors
  totalDoctors?: number; // for admin
  activePrescriptions: number;
  pendingLabResults: number;
  unreadMessages: number;
}

// Error Types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Utility Types
export type UserRole = User["role"];
export type AppointmentStatus = Appointment["status"];
export type AppointmentType = Appointment["type"];
export type NotificationType = Notification["type"];
export type NotificationPriority = Notification["priority"];
