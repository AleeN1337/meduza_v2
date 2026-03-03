import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment, Notification, User } from "@/models";

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

    // Only doctors can cancel appointments
    if (decoded.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Tylko lekarze mogą anulować wizyty" },
        { status: 403 }
      );
    }

    const { appointmentId, cancellationReason } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "ID wizyty jest wymagane" },
        { status: 400 }
      );
    }

    if (!cancellationReason || cancellationReason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Przyczyna anulowania jest wymagana" },
        { status: 400 }
      );
    }

    // Find and verify appointment ownership
    const appointment = await Appointment.findById(appointmentId).populate(
      "patientId",
      "firstName lastName email"
    );

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Wizyta nie została znaleziona" },
        { status: 404 }
      );
    }

    // Check if doctor owns this appointment
    if (appointment.doctorId.toString() !== decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Nie masz uprawnień do anulowania tej wizyty",
        },
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled
    if (appointment.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Nie można anulować zakończonej wizyty" },
        { status: 400 }
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Wizyta jest już anulowana" },
        { status: 400 }
      );
    }

    // Update appointment status and add cancellation details
    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason.trim();
    appointment.cancelledBy = decoded.userId;
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Get doctor information for notification
    const doctor = await User.findById(decoded.userId).select(
      "firstName lastName specialization"
    );

    // Create cancellation notification for patient
    const cancellationNotification = new Notification({
      userId: appointment.patientId._id,
      title: "Wizyta anulowana przez lekarza",
      message: `Dr ${doctor?.firstName} ${doctor?.lastName} (${
        doctor?.specialization
      }) anulował wizytę zaplanowaną na ${appointment.date.toLocaleDateString(
        "pl-PL"
      )} o godzinie ${appointment.time}.\n\nPrzyczyna: ${cancellationReason}`,
      type: "appointment",
      priority: "high",
      actionUrl: "/dashboard/appointments",
      data: {
        appointmentId: appointment._id,
        cancelled: true,
        cancelledBy: "doctor",
        cancellationReason: cancellationReason,
        doctorName: `${doctor?.firstName} ${doctor?.lastName}`,
        appointmentDate: appointment.date.toISOString().split("T")[0],
        appointmentTime: appointment.time,
      },
    });

    await cancellationNotification.save();

    return NextResponse.json(
      {
        success: true,
        message: "Wizyta została anulowana pomyślnie",
        data: {
          appointmentId: appointment._id,
          cancellationReason: cancellationReason,
          cancelledAt: appointment.cancelledAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel appointment by doctor error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
