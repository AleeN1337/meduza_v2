import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { MedicalRecord, User } from "@/models";
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

    const record = await MedicalRecord.findById(params.id)
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName specialization")
      .populate("appointmentId", "date time status");

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Medical record not found" },
        { status: 404 },
      );
    }

    // Check authorization - doctor or patient
    const patientIdStr = record.patientId._id.toString();
    const doctorIdStr = record.doctorId._id.toString();

    if (auth.role === "patient" && auth.userId !== patientIdStr) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    if (auth.role === "doctor" && auth.userId !== doctorIdStr) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Medical record GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

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
        { success: false, message: "Only doctors can update medical records" },
        { status: 403 },
      );
    }

    await connectDB();

    const record = await MedicalRecord.findById(params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Medical record not found" },
        { status: 404 },
      );
    }

    // Check doctor authorization
    if (record.doctorId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const allowedFields = [
      "title",
      "description",
      "diagnosis",
      "symptoms",
      "treatment",
      "prescription",
      "labResults",
      "files",
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      params.id,
      updates,
      { new: true },
    )
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName specialization")
      .populate("appointmentId", "date time status");

    return NextResponse.json({
      success: true,
      message: "Medical record updated successfully",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Medical record PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
        { success: false, message: "Only doctors can delete medical records" },
        { status: 403 },
      );
    }

    await connectDB();

    const record = await MedicalRecord.findById(params.id);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Medical record not found" },
        { status: 404 },
      );
    }

    // Check doctor authorization
    if (record.doctorId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    await MedicalRecord.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Medical record deleted successfully",
    });
  } catch (error) {
    console.error("Medical record DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
