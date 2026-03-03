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
    const status = searchParams.get("status") || "all";
    const limit = parseInt(searchParams.get("limit") || "20");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get appointments with patient details
    const appointments = await Appointment.find(query)
      .populate("patientId", "firstName lastName email phone dateOfBirth")
      .sort({ date: 1, time: 1 })
      .limit(limit);

    // Format appointments for frontend
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      doctorName: "", // Will be filled by frontend if needed
      date: appointment.date.toISOString().split("T")[0],
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
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
