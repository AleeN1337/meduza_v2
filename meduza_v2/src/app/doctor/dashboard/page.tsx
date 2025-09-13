"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { useNotificationStore } from "@/store";
import { Appointment } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileCompletion } from "@/components/ui/profile-completion";
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
  Users,
  FileText,
  Activity,
  Bell,
  Plus,
  ChevronRight,
  Stethoscope,
  Clipboard,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  UserCheck,
  CalendarDays,
  BarChart3,
  CheckCircle,
  X,
} from "lucide-react";

export default function DoctorDashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, deleteNotifications } =
    useNotificationStore();
  const router = useRouter();

  // State for appointments
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] =
    useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    if (user && user.role !== "doctor") {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Fetch notifications and appointments on component mount
  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchNotifications();
      fetchTodayAppointments();
      fetchUpcomingAppointments();
      fetchAllAppointments();
    }
  }, [user, fetchNotifications]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/appointments/doctor?date=${today}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch(
        "/api/appointments/doctor?status=scheduled&limit=10",
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUpcomingAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
    }
  };

  const fetchAllAppointments = async () => {
    try {
      const response = await fetch(
        "/api/appointments/doctor?status=all&limit=20",
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAllAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching all appointments:", error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    await markAsRead([notificationId]);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotifications([notificationId]);
  };

  if (!user || user.role !== "doctor") return null;

  // Check if user has real data
  const hasPatients = user.totalPatients && user.totalPatients > 0;
  const profileCompletion = user.profileCompletionPercentage || 0;

  // Empty state for new doctors
  const stats = {
    todayPatients: todayAppointments.length,
    weeklyPatients: hasPatients
      ? Math.floor((user.totalPatients || 0) * 0.2)
      : 0,
    monthlyPatients: hasPatients
      ? Math.floor((user.totalPatients || 0) * 0.6)
      : 0,
    completedToday: todayAppointments.filter(
      (apt) => apt.status === "completed"
    ).length,
    avgWaitTime: 0,
    newMessages: notifications.filter((n) => !n.read).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                MEDuza Pro
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                      >
                        {notifications.filter((n) => !n.read).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Powiadomienia</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Brak powiadomień
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`flex flex-col items-start p-3 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          onClick={() =>
                            handleMarkNotificationAsRead(notification.id)
                          }
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString("pl-PL")}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {notifications.length > 5 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-center">
                            <span className="text-sm text-gray-500">
                              +{notifications.length - 5} więcej powiadomień
                            </span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
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
                  <p className="text-gray-500">
                    {user.specialization || "Lekarz"}
                  </p>
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
            Dzień dobry, Dr {user.lastName}! 👨‍⚕️
          </h1>
          <p className="text-gray-600">
            {hasPatients ? (
              <>Masz dziś {stats.todayPatients} pacjentów</>
            ) : (
              "Twój profil jest gotowy do rozpoczęcia przyjmowania pacjentów."
            )}
          </p>
        </div>

        {/* General Notifications */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <div className="mb-6">
            <Card className="border-l-4 border-l-blue-500 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">
                        Masz {notifications.filter((n) => !n.read).length}{" "}
                        nowych powiadomień
                      </h3>
                      <p className="text-sm text-blue-700">
                        {notifications
                          .filter((n) => !n.read)
                          .slice(0, 2)
                          .map((n) => n.title)
                          .join(", ")}
                        {notifications.filter((n) => !n.read).length > 2 &&
                          ` i ${
                            notifications.filter((n) => !n.read).length - 2
                          } więcej`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Zobacz wszystkie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Completion */}
        {profileCompletion < 80 && (
          <div className="mb-6">
            <ProfileCompletion user={user} />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.todayPatients}
                      </p>
                      <p className="text-sm text-gray-600">Pacjenci dziś</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.completedToday}
                      </p>
                      <p className="text-sm text-gray-600">Ukończone</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.avgWaitTime}</p>
                      <p className="text-sm text-gray-600">Avg. czas (min)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.weeklyPatients}
                      </p>
                      <p className="text-sm text-gray-600">Ten tydzień</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Patient / Today's Appointments */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Activity className="h-5 w-5 mr-2" />
                  Aktywne wizyty
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-gray-500">Ładowanie wizyt...</p>
                  </div>
                ) : todayAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.time} - {appointment.type}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "scheduled"
                              ? "default"
                              : appointment.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {appointment.status === "scheduled"
                            ? "Zaplanowana"
                            : appointment.status === "completed"
                            ? "Ukończona"
                            : appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">Brak wizyt na dziś</p>
                    <Button variant="outline" asChild>
                      <Link href="/doctor/appointments">Sprawdź kalendarz</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Appointments Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    Wszystkie wizyty
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href="/doctor/appointments"
                      className="flex items-center"
                    >
                      Zobacz wszystkie
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500">Ładowanie wizyt...</p>
                  </div>
                ) : allAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {allAppointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.date).toLocaleDateString(
                                "pl-PL"
                              )}{" "}
                              o {appointment.time} - {appointment.type}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            appointment.status === "scheduled"
                              ? "default"
                              : appointment.status === "completed"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {appointment.status === "scheduled"
                            ? "Zaplanowana"
                            : appointment.status === "completed"
                            ? "Ukończona"
                            : appointment.status}
                        </Badge>
                      </div>
                    ))}
                    {allAppointments.length > 5 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        +{allAppointments.length - 5} więcej wizyt
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">
                      Brak zarezerwowanych wizyt
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Gdy pacjenci zaczną rezerwować wizyty, pojawią się tutaj
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" asChild>
                        <Link href="/doctor/appointments">
                          Zarządzaj kalendarzem
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href="/doctor/profile">Uzupełnij profil</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Następne wizyty
                </CardTitle>
                <CardDescription>Najbliższe wizyty</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAppointments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Ładowanie...</p>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg"
                      >
                        <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(appointment.date).toLocaleDateString(
                              "pl-PL"
                            )}{" "}
                            o {appointment.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {upcomingAppointments.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{upcomingAppointments.length - 3} więcej wizyt
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Brak zaplanowanych wizyt
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  Szybkie akcje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/doctor/profile">
                    <FileText className="h-4 w-4 mr-2" />
                    Uzupełnij profil
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/doctor/appointments">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ustaw godziny pracy
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href="/doctor/patients">
                    <Users className="h-4 w-4 mr-2" />
                    Zarządzaj pacjentami
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Pierwsze kroki
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        user.specialization ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        user.specialization ? "text-green-700" : "text-gray-600"
                      }
                    >
                      Dodaj specjalizację
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        user.bio ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={user.bio ? "text-green-700" : "text-gray-600"}
                    >
                      Napisz biografię
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        user.availableHours ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        user.availableHours ? "text-green-700" : "text-gray-600"
                      }
                    >
                      Ustaw godziny pracy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        user.consultationFee ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        user.consultationFee
                          ? "text-green-700"
                          : "text-gray-600"
                      }
                    >
                      Ustaw cennik
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  asChild
                >
                  <Link href="/doctor/profile">Uzupełnij teraz</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
