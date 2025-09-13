import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment, User, Notification } from "@/models";

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const { doctorId, date, time, type, notes, symptoms } =
      await request.json();

    // Validate required fields
    if (!doctorId || !date || !time || !type) {
      return NextResponse.json(
        { success: false, message: "Wszystkie pola są wymagane" },
        { status: 400 }
      );
    }

    // Verify doctor exists and is active
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor" || !doctor.isActive) {
      return NextResponse.json(
        { success: false, message: "Lekarz nie został znaleziony" },
        { status: 404 }
      );
    }

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patientId: decoded.userId,
      date: new Date(date),
      time,
      status: { $in: ["scheduled", "rescheduled"] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, message: "Masz już umówioną wizytę o tej godzinie" },
        { status: 409 }
      );
    }

    // Check if doctor has an appointment at this time
    const doctorAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      time,
      status: { $in: ["scheduled", "rescheduled"] },
    });

    if (doctorAppointment) {
      return NextResponse.json(
        { success: false, message: "Termin jest już zajęty" },
        { status: 409 }
      );
    }

    // Calculate appointment fee based on type
    let appointmentFee = 150; // Default fee
    if (doctor.consultationFee) {
      switch (type) {
        case "consultation":
          appointmentFee = doctor.consultationFee;
          break;
        case "follow-up":
        case "check-up":
          appointmentFee = doctor.followUpFee || doctor.consultationFee;
          break;
        case "emergency":
          appointmentFee = doctor.urgentFee || 250;
          break;
        default:
          appointmentFee = doctor.consultationFee;
      }
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: decoded.userId,
      doctorId,
      date: new Date(date),
      time,
      type,
      fee: appointmentFee,
      notes,
      symptoms,
      status: "scheduled",
      duration: 30, // Default 30 minutes
    });

    await appointment.save();

    // Create notification for patient
    const patientNotification = new Notification({
      userId: decoded.userId,
      title: "Wizyta umówiona",
      message: `Twoja wizyta u ${doctor.firstName} ${
        doctor.lastName
      } została umówiona na ${new Date(date).toLocaleDateString(
        "pl-PL"
      )} o ${time}`,
      type: "appointment",
      priority: "medium",
      actionUrl: "/dashboard",
      data: {
        appointmentId: appointment._id,
        doctorId,
        date,
        time,
      },
    });

    // Create notification for doctor
    const doctorNotification = new Notification({
      userId: doctorId,
      title: "Nowa wizyta",
      message: `Masz nową wizytę umówioną na ${new Date(
        date
      ).toLocaleDateString("pl-PL")} o ${time}`,
      type: "appointment",
      priority: "medium",
      actionUrl: "/doctor/dashboard",
      data: {
        appointmentId: appointment._id,
        patientId: decoded.userId,
        date,
        time,
      },
    });

    await Promise.all([patientNotification.save(), doctorNotification.save()]);

    return NextResponse.json(
      {
        success: true,
        message: "Wizyta została umówiona pomyślnie",
        appointment: {
          id: appointment._id,
          doctorName: `${doctor.firstName} ${doctor.lastName}`,
          specialty: doctor.specialization,
          date: appointment.date.toISOString().split("T")[0],
          time: appointment.time,
          type: appointment.type,
          fee: appointment.fee,
          status: appointment.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Book appointment error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
