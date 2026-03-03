import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { MedicalRecord } from "@/models";
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

export async function GET(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (auth.role !== "patient") {
      return NextResponse.json(
        { success: false, message: "Patients only" },
        { status: 403 },
      );
    }

    await connectDB();

    // Get all medical records for this patient
    const userId = new mongoose.Types.ObjectId(auth.userId);
    const records = await MedicalRecord.find({
      patientId: userId,
    })
      .populate("doctorId", "firstName lastName specialization")
      .sort({ date: -1 });

    // Extract lab results from all records
    const labResults: any[] = [];
    let labIndex = 0;
    records.forEach((record) => {
      if (record.labResults && Array.isArray(record.labResults)) {
        record.labResults.forEach((result: any) => {
          labResults.push({
            ...result,
            id: `lab-${record._id}-${labIndex}`,
            recordId: record._id,
            doctorName: `${record.doctorId.firstName} ${record.doctorId.lastName}`,
            recordDate: record.date,
          });
          labIndex++;
        });
      }
    });

    // Extract prescriptions from all records (as plain objects to keep all fields)
    const prescriptions: any[] = [];
    let rxIndex = 0;
    records.forEach((record) => {
      if (record.prescription && Array.isArray(record.prescription)) {
        record.prescription.forEach((rx: any) => {
          const plainRx = typeof rx.toObject === "function" ? rx.toObject() : rx;
          prescriptions.push({
            id: plainRx._id?.toString() || `rx-${record._id}-${rxIndex}`,
            recordId: record._id,
            doctorName: `${record.doctorId.firstName} ${record.doctorId.lastName}`,
            prescribedDate: record.date,
            description: record.description || record.treatment,
            status: plainRx.status || "active",
            fulfilledAt: plainRx.fulfilledAt,
            medicationName: plainRx.medicationName,
            dosage: plainRx.dosage,
            frequency: plainRx.frequency,
            duration: plainRx.duration,
            instructions: plainRx.instructions,
          });
          rxIndex++;
        });
      }
    });

    return NextResponse.json({
      success: true,
      labResults: labResults.sort(
        (a, b) =>
          new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
      ),
      prescriptions: prescriptions.sort(
        (a, b) =>
          new Date(b.prescribedDate).getTime() -
          new Date(a.prescribedDate).getTime(),
      ),
      totalRecords: records.length,
    });
  } catch (error) {
    console.error("Patient medical data GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
