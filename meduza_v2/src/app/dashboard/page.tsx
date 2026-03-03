"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, useNotificationStore } from "@/store";
import { Appointment, LabResult, Prescription, Notification } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Pill,
  Activity,
  Bell,
  Plus,
  ChevronRight,
  Heart,
  Stethoscope,
  TestTube,
  Loader2,
  X,
  Check,
  Eye,
  Info,
} from "lucide-react";

interface DashboardAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  avatar?: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
  symptoms?: string;
  duration: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, token, logout } = useAuthStore();
  const {
    notifications: storeNotifications,
    unreadCount,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    deleteNotifications,
  } = useNotificationStore();
  const router = useRouter();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    DashboardAppointment[]
  >([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [cancellingAppointment, setCancellingAppointment] = useState<
    string | null
  >(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [cancelledAppointments, setCancelledAppointments] = useState<
    Set<string>
  >(new Set());
  const [previewAppointment, setPreviewAppointment] =
    useState<DashboardAppointment | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    // Redirect doctors to their dashboard
    if (user && user.role === "doctor") {
      router.push("/doctor/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Fetch notifications on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchNotifications]);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      console.log("useEffect triggered");
      console.log("Token available:", !!token);
      console.log("User available:", !!user);

      if (!token || !user) {
        console.log("Missing token or user, skipping fetch");
        return;
      }

      try {
        console.log("Making API request...");
        const response = await fetch(
          "/api/appointments/patient?status=all&limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data);
          if (data.success) {
            console.log("Setting appointments:", data.appointments);
            setUpcomingAppointments(data.appointments);
            console.log("Appointments loaded:", data.appointments);
          } else {
            console.error("API returned error:", data.message);
          }
        } else {
          const errorText = await response.text();
          console.error(
            "API request failed:",
            response.status,
            response.statusText
          );
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        console.error("Token:", token);
        console.error("User:", user);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchUpcomingAppointments();
  }, [token, user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead([notificationId]);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotifications([notificationId]);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotificationIds = storeNotifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (unreadNotificationIds.length > 0) {
      try {
        await markAsRead(unreadNotificationIds);
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  };

  const handleDeleteAllNotifications = async () => {
    const notificationIds = storeNotifications.map(
      (notification) => notification.id
    );

    if (notificationIds.length > 0) {
      try {
        await deleteNotifications(notificationIds);
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    }
  };

  const handleCancelFromPreview = async () => {
    if (!previewAppointment) return;

    await handleCancelAppointment(previewAppointment.id);
    handleClosePreview();
  };

  const handleOpenPreview = (appointment: DashboardAppointment) => {
    setPreviewAppointment(appointment);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewAppointment(null);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!token) return;

    setCancellingAppointment(appointmentId);

    try {
      const response = await fetch(
        `/api/appointments/cancel?id=${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Add to cancelled appointments set
        setCancelledAppointments((prev) => new Set(prev).add(appointmentId));
        console.log("Added to cancelled set:", appointmentId);

        // Refresh notifications
        fetchNotifications();

        // Set timer to hide cancelled appointment after 5 seconds
        setTimeout(() => {
          console.log("Timer fired for appointment:", appointmentId);
          setCancelledAppointments((prev) => {
            const newSet = new Set(prev);
            newSet.delete(appointmentId);
            console.log("Removed from cancelled set:", appointmentId);
            return newSet;
          });
        }, 5000);

        // Refresh appointments list
        const fetchResponse = await fetch(
          "/api/appointments/patient?status=all&limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          if (data.success) {
            setUpcomingAppointments(data.appointments);
          }
        }
      } else {
        const errorText = await response.text();
        console.error(
          "Cancel appointment failed with status:",
          response.status
        );
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setCancellingAppointment(null);
    }
  };

  const handleToggleShowAll = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  if (!user) return null;

  // Empty states for new patients - no mock data
  const recentResults = user.recentResults || [];
  const activePrescriptions = user.activePrescriptions || [];
  const inProgressPrescriptions = activePrescriptions.filter((prescription) => {
    const normalized = (prescription.status || "").toLowerCase();

    const isCompletedOrCancelled = [
      "cancel",
      "anul",
      "completed",
      "complete",
      "zrealiz",
      "fulfilled",
      "done",
    ].some((keyword) => normalized.includes(keyword));

    return !isCompletedOrCancelled;
  });
  const displayPrescriptions =
    inProgressPrescriptions.length > 0
      ? inProgressPrescriptions
      : activePrescriptions;
  const userNotifications = user.notifications || [];

  // Filter appointments based on show all state and cancelled status
  const visibleAppointments = upcomingAppointments
    .filter((appointment) => {
      // Hide appointments that are in cancelledAppointments set OR have cancelled status from API
      // For debugging, let's show all appointments first
      console.log(
        "Appointment:",
        appointment.id,
        "Status:",
        appointment.status,
        "In cancelled set:",
        cancelledAppointments.has(appointment.id)
      );
      return (
        !cancelledAppointments.has(appointment.id) &&
        appointment.status !== "cancelled"
      );
    })
    .sort((a, b) => {
      // Sort by date and time
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  // Show only first 3 appointments unless "show all" is clicked
  const displayedAppointments = showAllAppointments
    ? visibleAppointments
    : visibleAppointments.slice(0, 3);

  // Check if patient has any real medical data
  const hasAppointments = visibleAppointments.length > 0;
  const hasResults = recentResults.length > 0;
  const hasPrescriptions = displayPrescriptions.length > 0;

  const formatAppointmentStatus = (status: string | undefined) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("cancel")) return "Anulowana";
    if (normalized.includes("complete")) return "Zakończona";
    if (normalized.includes("schedule") || normalized === "scheduled")
      return "Nadchodząca";
    if (normalized.includes("no-show")) return "Nieobecność";
    return status || "Nadchodząca";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MEDuza</span>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4 mr-2" />
                    Powiadomienia
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Powiadomienia</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshNotifications}
                      className="h-6 w-6 p-0"
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {storeNotifications.length > 0 ? (
                    <>
                      <div className="max-h-64 overflow-y-auto">
                        {storeNotifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className="p-3 border-b last:border-b-0"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h5
                                  className={`font-medium text-sm truncate ${
                                    !notification.read
                                      ? "text-gray-900"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {notification.title}
                                </h5>
                                <p
                                  className={`text-xs mt-1 line-clamp-2 ${
                                    !notification.read
                                      ? "text-gray-700"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString("pl-PL")}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteNotification(notification.id)
                                  }
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <DropdownMenuSeparator />

                      <div className="p-2 space-y-1">
                        {unreadCount > 0 && (
                          <DropdownMenuItem onClick={handleMarkAllAsRead}>
                            <Check className="h-4 w-4 mr-2" />
                            Oznacz wszystkie jako przeczytane
                          </DropdownMenuItem>
                        )}
                        {storeNotifications.length > 0 && (
                          <DropdownMenuItem
                            onClick={handleDeleteAllNotifications}
                            className="text-red-600 focus:text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Usuń wszystkie
                          </DropdownMenuItem>
                        )}
                      </div>

                      {storeNotifications.length > 5 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="justify-center text-blue-600">
                            Zobacz wszystkie powiadomienia
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Brak powiadomień</p>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-gray-500">Pacjent</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Wyloguj
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Witaj, {user.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Oto przegląd Twojego zdrowia i nadchodzących wizyt
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-blue-600" />
                  Szybkie akcje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/dashboard/appointments/book">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm">Umów wizytę</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <MessageSquare className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-sm">Chat z lekarzem</span>
                  </Button>
                  <Link href="/dashboard/medical-history">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <FileText className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="text-sm">Moja dokumentacja</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-auto flex-col py-4">
                    <TestTube className="h-6 w-6 mb-2 text-red-600" />
                    <span className="text-sm">Wyniki badań</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Nadchodzące wizyty
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleShowAll}
                  >
                    {showAllAppointments
                      ? "Pokaż mniej"
                      : `Zobacz wszystkie ${
                          visibleAppointments.length > 3
                            ? `(${visibleAppointments.length - 3} więcej)`
                            : ""
                        }`}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Ładowanie wizyt...</span>
                  </div>
                ) : hasAppointments ? (
                  <div className="space-y-4">
                    {displayedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          appointment.status === "cancelled"
                            ? "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {appointment.status === "cancelled" ? (
                              <X className="h-8 w-8 text-red-600" />
                            ) : (
                              <Stethoscope className="h-8 w-8 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {appointment.doctorName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.specialty}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {appointment.date} o {appointment.time}
                              </span>
                              <Badge
                                variant={
                                  appointment.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {formatAppointmentStatus(appointment.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPreview(appointment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Podgląd
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">
                      Brak zaplanowanych wizyt
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Umów swoją pierwszą wizytę z lekarzem
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/appointments/book">
                        Umów wizytę
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-green-600" />
                    Ostatnie wyniki badań
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/medical-history">
                      Zobacz wszystkie
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasResults ? (
                  <div className="space-y-3">
                    {recentResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <TestTube className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{result.testName}</p>
                            <p className="text-sm text-gray-500">
                              {result.date}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            result.status === "normal"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {result.status === "normal"
                            ? "Norma"
                            : "Nieprawidłowy"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <TestTube className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Brak wyników badań</p>
                    <p className="text-sm text-gray-400">
                      Wyniki badań pojawią się tutaj po pierwszych wizytach
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-orange-600" />
                  Aktywne recepty
                </CardTitle>
                <CardDescription>Twoje obecne leki i ich ilość</CardDescription>
              </CardHeader>
              <CardContent>
                {hasPrescriptions ? (
                  <>
                    <div className="space-y-4">
                      {displayPrescriptions.slice(0, 3).map((prescription) => {
                        const normalizedStatus =
                          prescription.status?.toLowerCase() || "";
                        const statusLabel =
                          prescription.status || "W realizacji";

                        return (
                          <div
                            key={prescription.id}
                            className="border rounded-lg p-3 flex items-start justify-between gap-3"
                          >
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {prescription.medicationName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {prescription.dosage} • {prescription.frequency}
                              </p>
                            </div>
                            <Badge
                              variant={
                                normalizedStatus === "pending" ||
                                normalizedStatus === "in-progress" ||
                                normalizedStatus === "active" ||
                                !normalizedStatus
                                  ? "secondary"
                                  : "outline"
                              }
                              className="whitespace-nowrap"
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                        );
                      })}
                      {displayPrescriptions.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{displayPrescriptions.length - 3} kolejnych recept w realizacji
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      Zobacz wszystkie recepty
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Pill className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Brak aktywnych recept</p>
                    <p className="text-sm text-gray-400">
                      Recepty w realizacji pojawią się tutaj automatycznie
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Powiadomienia
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshNotifications}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Odśwież
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {storeNotifications.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {storeNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            !notification.read
                              ? "bg-blue-50 border-blue-500"
                              : "bg-gray-50 border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h5
                                className={`font-medium text-sm ${
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {notification.title}
                              </h5>
                              <p
                                className={`text-xs mt-1 ${
                                  !notification.read
                                    ? "text-gray-700"
                                    : "text-gray-500"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString("pl-PL")}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                                  title="Oznacz jako przeczytane"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteNotification(notification.id)
                                }
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                title="Usuń powiadomienie"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      {unreadCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Oznacz wszystkie jako przeczytane
                        </Button>
                      )}
                      {storeNotifications.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeleteAllNotifications}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Usuń wszystkie
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Zobacz wszystkie
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Brak powiadomień</p>
                    <p className="text-sm text-gray-400">
                      Ważne informacje pojawią się tutaj
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Podsumowanie zdrowia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.bloodType ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grupa krwi</span>
                      <Badge variant="outline">{user.bloodType}</Badge>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Grupa krwi</span>
                      <span className="text-sm text-gray-400">Nie podano</span>
                    </div>
                  )}

                  {user.allergies && user.allergies.length > 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alergie</span>
                      <div className="flex gap-1 flex-wrap">
                        {user.allergies.slice(0, 2).map((allergy, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {allergy}
                          </Badge>
                        ))}
                        {user.allergies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.allergies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Alergie</span>
                      <span className="text-sm text-gray-400">Brak</span>
                    </div>
                  )}

                  {user.emergencyContact ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kontakt awaryjny</span>
                      <span className="text-sm text-gray-600">
                        {user.emergencyContact.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        Kontakt awaryjny
                      </span>
                      <span className="text-sm text-gray-400">Nie podano</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  asChild
                >
                  <Link href="/dashboard/profile">Edytuj profil medyczny</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            setPreviewAppointment(null);
          }
        }}
      >
        <DialogContent>
          {previewAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  Szczegóły wizyty
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={previewAppointment.avatar} />
                    <AvatarFallback>
                      {previewAppointment.doctorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-500">Lekarz</p>
                    <p className="font-semibold text-gray-900">
                      {previewAppointment.doctorName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {previewAppointment.specialty}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-medium text-gray-900">
                        {previewAppointment.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Godzina</p>
                      <p className="font-medium text-gray-900">
                        {previewAppointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Typ wizyty</p>
                      <p className="font-medium text-gray-900">
                        {previewAppointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Badge
                      variant={
                        previewAppointment.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {formatAppointmentStatus(previewAppointment.status)}
                    </Badge>
                  </div>
                </div>

                {previewAppointment.notes && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500 mb-1">Notatki</p>
                    <p className="text-sm text-gray-700">
                      {previewAppointment.notes}
                    </p>
                  </div>
                )}

                {previewAppointment.symptoms && (
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500 mb-1">Objawy</p>
                    <p className="text-sm text-gray-700">
                      {previewAppointment.symptoms}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Utworzono</span>
                  <span>
                    {previewAppointment.createdAt
                      ? new Date(previewAppointment.createdAt).toLocaleString(
                          "pl-PL"
                        )
                      : "Brak danych"}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClosePreview}>
                  Zamknij
                </Button>
                {previewAppointment.status === "scheduled" && (
                  <Button
                    variant="destructive"
                    onClick={handleCancelFromPreview}
                    disabled={
                      cancellingAppointment === previewAppointment.id
                    }
                  >
                    {cancellingAppointment === previewAppointment.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Anulowanie...
                      </>
                    ) : (
                      "Anuluj wizytę"
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
