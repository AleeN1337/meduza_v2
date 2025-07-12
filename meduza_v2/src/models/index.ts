import mongoose, { Document, Schema } from "mongoose";

// User Schema
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Doctor specific fields
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  education?: string[];

  // Patient specific fields
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
      default: "patient",
    },
    avatar: String,
    phone: String,
    isActive: {
      type: Boolean,
      default: true,
    },

    // Doctor specific fields
    specialization: String,
    licenseNumber: String,
    experience: Number,
    education: [String],

    // Patient specific fields
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bloodType: String,
    allergies: [String],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  {
    timestamps: true,
  }
);

// Appointment Schema
export interface IAppointment extends Document {
  _id: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "no-show" | "rescheduled";
  type: "consultation" | "follow-up" | "emergency" | "routine" | "check-up";
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show", "rescheduled"],
      default: "scheduled",
    },
    type: {
      type: String,
      enum: ["consultation", "follow-up", "emergency", "routine", "check-up"],
      required: true,
    },
    notes: String,
    symptoms: String,
    diagnosis: String,
    prescription: [String],
  },
  {
    timestamps: true,
  }
);

// Medical Record Schema
export interface IMedicalRecord extends Document {
  _id: string;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  diagnosis: string[];
  symptoms: string[];
  treatment: string;
  prescription: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  labResults?: {
    testName: string;
    result: string;
    normalRange: string;
    unit: string;
    status: "normal" | "abnormal" | "critical";
  }[];
  files?: {
    filename: string;
    originalName: string;
    url: string;
    type: "image" | "document" | "lab-result" | "x-ray" | "other";
    size: number;
    uploadedBy: string;
  }[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    diagnosis: [String],
    symptoms: [String],
    treatment: {
      type: String,
      required: true,
    },
    prescription: [
      {
        medicationName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],
    labResults: [
      {
        testName: { type: String, required: true },
        result: { type: String, required: true },
        normalRange: String,
        unit: String,
        status: {
          type: String,
          enum: ["normal", "abnormal", "critical"],
          default: "normal",
        },
      },
    ],
    files: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "document", "lab-result", "x-ray", "other"],
          required: true,
        },
        size: Number,
        uploadedBy: String,
      },
    ],
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Chat Message Schema
export interface IChatMessage extends Document {
  _id: string;
  conversationId: string;
  senderId: mongoose.Types.ObjectId;
  message: string;
  type: "text" | "file" | "image" | "system";
  fileUrl?: string;
  fileName?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "file", "image", "system"],
      default: "text",
    },
    fileUrl: String,
    fileName: String,
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Notification Schema
export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "lab-result" | "message" | "system";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["appointment", "prescription", "lab-result", "message", "system"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    data: Schema.Types.Mixed,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Export models
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);
export const MedicalRecord =
  mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);
export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
