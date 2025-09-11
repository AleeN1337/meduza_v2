import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment, Notification } from "@/models";

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

export async function DELETE(request: NextRequest) {
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

    // Get appointment ID from URL
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("id");

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "ID wizyty jest wymagane" },
        { status: 400 }
      );
    }

    // Find and verify appointment ownership
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Wizyta nie została znaleziona" },
        { status: 404 }
      );
    }

    // Check if user owns this appointment
    if (appointment.patientId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Nie masz uprawnień do usunięcia tej wizyty" },
        { status: 403 }
      );
    }

    // Check if appointment can be cancelled (not in the past)
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date.toISOString().split('T')[0]}T${appointment.time}`);

    if (appointmentDateTime < now) {
      return NextResponse.json(
        { success: false, message: "Nie można anulować wizyty z przeszłości" },
        { status: 400 }
      );
    }

    // Update appointment status to cancelled
    appointment.status = "cancelled";
    await appointment.save();

    // Create cancellation notification for patient
    const cancellationNotification = new Notification({
      userId: decoded.userId,
      title: "Wizyta anulowana",
      message: `Twoja wizyta została anulowana`,
      type: "appointment",
      priority: "medium",
      actionUrl: "/dashboard",
      data: {
        appointmentId: appointment._id,
        cancelled: true,
      },
    });

    await cancellationNotification.save();

    return NextResponse.json(
      {
        success: true,
        message: "Wizyta została anulowana pomyślnie",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
