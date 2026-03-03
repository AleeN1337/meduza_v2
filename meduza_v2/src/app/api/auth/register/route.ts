import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      specialization,
      licenseNumber,
      dateOfBirth,
      gender,
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Wszystkie wymagane pola muszą być wypełnione",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy format adresu email" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Hasło musi mieć co najmniej 8 znaków" },
        { status: 400 }
      );
    }

    // Validate doctor specific fields
    if (role === "doctor") {
      if (!specialization || !licenseNumber) {
        return NextResponse.json(
          {
            success: false,
            message: "Specjalizacja i numer licencji są wymagane dla lekarzy",
          },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Użytkownik z tym adresem email już istnieje",
        },
        { status: 409 }
      );
    }

    // Check if license number is already taken (for doctors)
    if (role === "doctor" && licenseNumber) {
      const existingDoctor = await User.findOne({ licenseNumber });
      if (existingDoctor) {
        return NextResponse.json(
          {
            success: false,
            message: "Lekarz z tym numerem licencji już istnieje",
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user data object
    const userData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      phone: phone?.trim(),
      isActive: true,
    };

    // Add role-specific fields
    if (role === "doctor") {
      userData.specialization = specialization.trim();
      userData.licenseNumber = licenseNumber.trim();
    } else if (role === "patient") {
      if (dateOfBirth) {
        userData.dateOfBirth = new Date(dateOfBirth);
      }
      if (gender) {
        userData.gender = gender;
      }
    }

    // Create user
    const newUser = new User(userData);
    await newUser.save();

    // Return success response (without password)
    const responseData = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      phone: newUser.phone,
      specialization: newUser.specialization,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Konto zostało pomyślnie utworzone",
        user: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd podczas tworzenia konta" },
      { status: 500 }
    );
  }
}
