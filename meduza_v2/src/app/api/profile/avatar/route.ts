import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { User } from "@/models";
import cloudinary from "@/lib/cloudinary";

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

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Accept either JSON with base64 dataUrl or multipart/form-data with file
    const contentType = req.headers.get("content-type") || "";

    let imageUrl: string | null = null;

    if (contentType.includes("application/json")) {
      const { image } = await req.json(); // image can be data URL/base64
      if (!image) {
        return NextResponse.json(
          { success: false, message: "No image provided" },
          { status: 400 }
        );
      }
      const upload = await cloudinary.uploader.upload(image, {
        folder: "meduza/avatars",
        overwrite: true,
        transformation: [
          { width: 512, height: 512, crop: "fill", gravity: "face" },
        ],
      });
      imageUrl = upload.secure_url;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as unknown as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, message: "No file provided" },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const upload = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "meduza/avatars",
            overwrite: true,
            transformation: [
              { width: 512, height: 512, crop: "fill", gravity: "face" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      imageUrl = upload.secure_url;
    } else {
      return NextResponse.json(
        { success: false, message: "Unsupported content type" },
        { status: 415 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { avatar: imageUrl, lastProfileUpdate: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
