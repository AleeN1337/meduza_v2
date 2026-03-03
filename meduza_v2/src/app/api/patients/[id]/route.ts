import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { User } from "@/models";
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

// GET: doctor can fetch patient profile, patient can fetch self
export async function GET(
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

    await connectDB();

    if (auth.role !== "doctor" && auth.userId !== params.id) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    const patient = await User.findById(params.id);
    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
        medications: patient.medications || [],
        conditions: patient.conditions || [],
        emergencyContact: patient.emergencyContact,
        notes: patient.notes,
        height: patient.height,
        weight: patient.weight,
      },
    });
  } catch (error) {
    console.error("Patient profile GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// PATCH: doctor can update medical info (allergies, conditions, medications, notes)
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
        { success: false, message: "Only doctors can update patient" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const allowed: Record<string, boolean> = {
      allergies: true,
      medications: true,
      conditions: true,
      emergencyContact: true,
      notes: true,
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

    const updated = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(params.id),
      updates,
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        dateOfBirth: updated.dateOfBirth,
        gender: updated.gender,
        bloodType: updated.bloodType,
        allergies: updated.allergies || [],
        medications: updated.medications || [],
        conditions: updated.conditions || [],
        emergencyContact: updated.emergencyContact,
        notes: updated.notes,
      },
    });
  } catch (error) {
    console.error("Patient profile PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
