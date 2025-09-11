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
    if (!decoded || !decoded.userId) {
      console.error("Invalid token or missing userId");
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    console.log("Decoded token:", decoded);
    console.log("User ID from token:", decoded.userId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "scheduled";
    const limit = parseInt(searchParams.get("limit") || "10");
    const upcoming = searchParams.get("upcoming") === "true";

    // Build query
    const query: any = {
      patientId: decoded.userId,
    };

    if (status !== "all") {
      query.status = status;
    }

    if (upcoming) {
      const now = new Date();
      console.log("Current date for upcoming filter:", now);
      // For debugging, let's also get past appointments
      if (searchParams.get("includePast") === "true") {
        query.date = {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };
        query.status = { $nin: ["completed"] }; // Show all except completed
      } else {
        query.date = { $gte: now };
        query.status = { $in: ["scheduled", "rescheduled"] };
      }
      console.log("Upcoming query:", query);
    }

    // Get appointments with doctor details
    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization avatar",
        model: "User",
      })
      .sort({ date: upcoming ? 1 : -1, time: 1 })
      .limit(limit);

    console.log("Query:", query);
    console.log("Found appointments count:", appointments.length);
    console.log("Raw appointments:", appointments);

    // Format appointments for frontend
    const formattedAppointments = appointments
      .map((appointment) => {
        console.log("Processing appointment:", appointment._id);
        console.log("Doctor data:", appointment.doctorId);

        const doctorName = appointment.doctorId
          ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`
          : "Lekarz nieznany";
        const specialty =
          appointment.doctorId?.specialization || "Specjalizacja nieznana";
        const avatar = appointment.doctorId?.avatar || null;

        return {
          id: appointment._id,
          doctorName,
          specialty,
          avatar,
          date: appointment.date.toISOString().split("T")[0],
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
          symptoms: appointment.symptoms,
          duration: appointment.duration,
          createdAt: appointment.createdAt,
          rawDate: appointment.date, // For debugging
        };
      })
      .filter(Boolean); // Remove null entries

    console.log("Formatted appointments:", formattedAppointments);

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Get patient appointments error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
