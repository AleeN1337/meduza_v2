import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get("specialization");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query for active doctors
    const query: any = {
      role: "doctor",
      isActive: true,
    };

    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    // Get doctors with basic info
    const doctors = await User.find(query)
      .select(
        "firstName lastName specialization licenseNumber experience workplace address bio languages availableHours consultationFee followUpFee urgentFee onlineFee avatar"
      )
      .sort({ experience: -1, firstName: 1 })
      .limit(limit);

    // Format doctors for frontend
    const formattedDoctors = doctors.map((doctor) => {
      // Default available hours if not set
      const defaultAvailableHours = {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
        saturday: { start: "09:00", end: "13:00", available: false },
        sunday: { start: "09:00", end: "13:00", available: false },
      };

      return {
        id: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialization: doctor.specialization,
        licenseNumber: doctor.licenseNumber,
        experience: doctor.experience,
        workplace: doctor.workplace,
        address: doctor.address,
        bio: doctor.bio,
        languages: doctor.languages,
        availableHours: doctor.availableHours || defaultAvailableHours,
        consultationFee: doctor.consultationFee || 150, // Default fee if not set
        followUpFee: doctor.followUpFee || doctor.consultationFee || 150,
        urgentFee: doctor.urgentFee || 250,
        onlineFee: doctor.onlineFee || doctor.consultationFee || 150,
        avatar: doctor.avatar,
        // Mock data for now - in future calculate from real reviews
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
        reviewCount: Math.floor(Math.random() * 50) + 10, // Random review count
      };
    });

    return NextResponse.json({
      success: true,
      doctors: formattedDoctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
