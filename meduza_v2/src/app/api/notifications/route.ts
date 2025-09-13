import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { Notification } from "@/models";

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Build query
    const query: any = {
      userId: decoded.userId,
    };

    if (unreadOnly) {
      query.read = false;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        read: notification.read,
        actionUrl: notification.actionUrl,
        data: notification.data,
        createdAt: notification.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Brak autoryzacji" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowy token" },
        { status: 401 }
      );
    }

    const { notificationIds, action } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowe dane" },
        { status: 400 }
      );
    }

    let updateQuery: any = {};

    if (action === "markAsRead") {
      updateQuery.read = true;
    } else if (action === "markAsUnread") {
      updateQuery.read = false;
    } else if (action === "delete") {
      // Delete notifications
      await Notification.deleteMany({
        _id: { $in: notificationIds },
        userId: decoded.userId,
      });

      return NextResponse.json({
        success: true,
        message: "Powiadomienia zostały usunięte",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Nieprawidłowa akcja" },
        { status: 400 }
      );
    }

    // Update notifications
    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: decoded.userId,
      },
      updateQuery
    );

    return NextResponse.json({
      success: true,
      message: "Powiadomienia zostały zaktualizowane",
    });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
