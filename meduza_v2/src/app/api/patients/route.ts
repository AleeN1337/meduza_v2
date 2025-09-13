import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment } from "@/models";

interface PatientData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
}

interface AppointmentWithPatient {
  _id: string;
  patientId: PatientData;
  date: Date;
  status: string;
}

function getAuth(req: NextRequest) {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only doctors can access this endpoint
    if (auth.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    await connectDB();

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId: auth.userId })
      .populate(
        "patientId",
        "firstName lastName email phone dateOfBirth gender bloodType allergies medications conditions emergencyContact"
      )
      .sort({ createdAt: -1 });

    // Extract unique patients from appointments
    const patientMap = new Map();

    appointments.forEach((appointment: AppointmentWithPatient) => {
      const patient = appointment.patientId;
      if (patient && !patientMap.has(patient._id.toString())) {
        // Get patient's last visit and next appointment
        const patientAppointments = appointments.filter(
          (apt: AppointmentWithPatient) =>
            apt.patientId._id.toString() === patient._id.toString()
        );

        const completedAppointments = patientAppointments.filter(
          (apt: AppointmentWithPatient) => apt.status === "completed"
        );

        const upcomingAppointments = patientAppointments.filter(
          (apt: AppointmentWithPatient) =>
            apt.status === "scheduled" && new Date(apt.date) >= new Date()
        );

        const lastVisit =
          completedAppointments.length > 0
            ? completedAppointments[0].date.toISOString().split("T")[0]
            : null;

        const nextAppointment =
          upcomingAppointments.length > 0
            ? upcomingAppointments[0].date.toISOString().split("T")[0]
            : null;

        patientMap.set(patient._id.toString(), {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth?.toISOString().split("T")[0],
          gender: patient.gender,
          bloodType: patient.bloodType,
          allergies: patient.allergies || [],
          medications: patient.medications || [],
          conditions: patient.conditions || [],
          emergencyContact: patient.emergencyContact,
          lastVisit: lastVisit,
          nextAppointment: nextAppointment,
          totalVisits: patientAppointments.length,
          status:
            upcomingAppointments.length > 0
              ? "active"
              : completedAppointments.length > 0
              ? "active"
              : "inactive",
          avatar: null,
          notes: `Pacjent miał ${patientAppointments.length} wizyt${
            patientAppointments.length === 1
              ? "ę"
              : patientAppointments.length < 5
              ? "y"
              : ""
          }`,
        });
      }
    });

    const patients = Array.from(patientMap.values());

    return NextResponse.json({
      success: true,
      patients: patients,
    });
  } catch (error) {
    console.error("Patients GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
