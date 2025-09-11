import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment, User } from "@/models";

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

export async function GET(request: NextRequest) {
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
    if (!decoded || !decoded.userId || decoded.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Brak dostępu" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "scheduled";
    const limit = parseInt(searchParams.get("limit") || "20");
    const date = searchParams.get("date");

    // Build query
    const query: any = {
      doctorId: decoded.userId,
    };

    if (status !== "all") {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Get appointments with patient details
    const appointments = await Appointment.find(query)
      .populate("patientId", "firstName lastName email phone dateOfBirth")
      .sort({ date: 1, time: 1 })
      .limit(limit);

    // Format appointments for frontend
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment._id,
      patient: {
        id: appointment.patientId._id,
        firstName: appointment.patientId.firstName,
        lastName: appointment.patientId.lastName,
        email: appointment.patientId.email,
        phone: appointment.patientId.phone,
        dateOfBirth: appointment.patientId.dateOfBirth,
      },
      date: appointment.date.toISOString().split("T")[0],
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes,
      symptoms: appointment.symptoms,
      duration: appointment.duration,
      createdAt: appointment.createdAt,
    }));

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
