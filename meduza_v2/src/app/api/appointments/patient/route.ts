import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment, IAppointment } from "@/models";
import { FilterQuery } from "mongoose";

function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Brak autoryzacji" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "scheduled";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const upcoming = searchParams.get("upcoming") === "true";

    const query: FilterQuery<IAppointment> = {
      patientId: decoded.userId,
    };

    if (status !== "all") {
      query.status = status;
    }

    if (upcoming) {
      const now = new Date();
      if (searchParams.get("includePast") === "true") {
        query.date = {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        };
        query.status = { $nin: ["completed"] };
      } else {
        query.date = { $gte: now };
        query.status = { $in: ["scheduled", "rescheduled"] };
      }
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization avatar",
        model: "User",
      })
      .sort({ date: upcoming ? 1 : -1, time: 1 })
      .limit(limit);

    const formattedAppointments = appointments.map((appointment) => {
      const doctor = appointment.doctorId as {
        firstName?: string;
        lastName?: string;
        specialization?: string;
        avatar?: string;
      } | null;

      return {
        id: appointment._id,
        doctorName: doctor
          ? `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim()
          : "Lekarz nieznany",
        specialty: doctor?.specialization || "Specjalizacja nieznana",
        avatar: doctor?.avatar || null,
        date: appointment.date.toISOString().split("T")[0],
        time: appointment.time,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes,
        symptoms: appointment.symptoms,
        duration: appointment.duration,
        createdAt: appointment.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Get patient appointments error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 },
    );
  }
}
