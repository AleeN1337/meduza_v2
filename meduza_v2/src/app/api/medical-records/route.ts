import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { MedicalRecord, User, Appointment } from "@/models";
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

// GET - Fetch medical records
// For doctors: all records for their patients
// For patients: only their own records
export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    let records;
    const userId = new mongoose.Types.ObjectId(auth.userId);

    if (auth.role === "doctor") {
      // Doctors see all records for their patients
      records = await MedicalRecord.find({ doctorId: userId })
        .populate("patientId", "firstName lastName email")
        .populate("appointmentId", "date time status")
        .sort({ date: -1 });
    } else if (auth.role === "patient") {
      // Patients see only their own records
      records = await MedicalRecord.find({ patientId: userId })
        .populate("doctorId", "firstName lastName specialization")
        .populate("appointmentId", "date time status")
        .sort({ date: -1 });
    } else {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Medical records GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new medical record (doctor only)
export async function POST(req: NextRequest) {
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
        { success: false, message: "Only doctors can create medical records" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      patientId,
      appointmentId,
      title,
      description,
      diagnosis,
      symptoms,
      treatment,
      prescription,
      labResults,
      files,
    } = body;

    // Validate required fields
    if (!patientId || !title || !description || !treatment) {
      return NextResponse.json(
        {
          success: false,
          message: "patientId, title, description, and treatment are required",
        },
        { status: 400 },
      );
    }

    await connectDB();

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    // Verify appointment exists if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return NextResponse.json(
          { success: false, message: "Appointment not found" },
          { status: 404 },
        );
      }
    }

    // Create medical record
    const newRecord = new MedicalRecord({
      patientId: new mongoose.Types.ObjectId(patientId),
      doctorId: new mongoose.Types.ObjectId(auth.userId),
      appointmentId: appointmentId
        ? new mongoose.Types.ObjectId(appointmentId)
        : undefined,
      title: title.trim(),
      description: description.trim(),
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [],
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      treatment: treatment.trim(),
      prescription: Array.isArray(prescription)
        ? prescription.map((rx: any) => ({
            medicationName: rx.medicationName,
            dosage: rx.dosage,
            frequency: rx.frequency,
            duration: rx.duration,
            instructions: rx.instructions,
            status: rx?.status || "active",
            fulfilledAt: rx?.fulfilledAt,
          }))
        : [],
      labResults: Array.isArray(labResults) ? labResults : [],
      files: Array.isArray(files) ? files : [],
      date: new Date(),
    });

    console.log("Creating medical record with prescription:", JSON.stringify(newRecord.prescription, null, 2));

    await newRecord.save();

    // Populate references before returning
    await newRecord.populate("patientId", "firstName lastName email");
    await newRecord.populate("doctorId", "firstName lastName specialization");
    if (appointmentId) {
      await newRecord.populate("appointmentId", "date time status");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Medical record created successfully",
        record: newRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Medical records POST error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
