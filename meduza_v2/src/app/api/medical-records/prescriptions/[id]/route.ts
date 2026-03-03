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

    const prescriptionId = params.id;
    if (!prescriptionId || !mongoose.Types.ObjectId.isValid(prescriptionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid prescription id" },
        { status: 400 },
      );
    }

    await connectDB();

    // Find record containing this prescription
    const record = await MedicalRecord.findOne({
      "prescription._id": new mongoose.Types.ObjectId(prescriptionId),
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Prescription not found" },
        { status: 404 },
      );
    }

    // Authorization: patients can fulfill only their own prescription; doctors allowed too
    const isOwnerPatient = record.patientId.toString() === auth.userId;
    const isDoctor = auth.role === "doctor";
    if (!isOwnerPatient && !isDoctor) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 },
      );
    }

    // Update the matching prescription to fulfilled
    const result = await MedicalRecord.updateOne(
      { _id: record._id },
      {
        $set: {
          "prescription.$[rx].status": "fulfilled",
          "prescription.$[rx].fulfilledAt": new Date(),
        },
      },
      {
        arrayFilters: [
          { "rx._id": new mongoose.Types.ObjectId(prescriptionId) },
        ],
      },
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Nothing updated" },
        { status: 400 },
      );
    }

    // Return updated prescription data
    const updated = await MedicalRecord.findById(record._id).select(
      "prescription doctorId patientId",
    );
    const updatedRx = updated?.prescription?.find(
      (rx: any) => rx._id.toString() === prescriptionId,
    );

    return NextResponse.json({
      success: true,
      prescription: updatedRx,
    });
  } catch (error) {
    console.error("Prescription fulfill PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
