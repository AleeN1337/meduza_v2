import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Appointment } from "@/models";
import mongoose from "mongoose";

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

// PATCH: doctor can update appointment status, notes, diagnosis, symptoms
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (auth.role !== "doctor") {
      return NextResponse.json(
        { success: false, message: "Only doctors can update appointments" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const allowed: Record<string, boolean> = {
      status: true,
      notes: true,
      symptoms: true,
      diagnosis: true,
      prescription: true,
      cancellationReason: true,
    };
    const updates: any = {};
    for (const [k, v] of Object.entries(body || {})) {
      if (allowed[k]) updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields" },
        { status: 400 },
      );
    }

    await connectDB();

    const updated = await Appointment.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(params.id), doctorId: auth.userId },
      updates,
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Appointment PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
