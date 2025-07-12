"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
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
} from "lucide-react";

export default function DoctorDashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    if (user && user.role !== "doctor") {
      router.push("/dashboard"); // Redirect non-doctors to patient dashboard
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user || user.role !== "doctor") return null;

  // Mock data - dane lekarza
  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Jan Kowalski",
      type: "Konsultacja",
      status: "scheduled",
      duration: 30,
      notes: "Kontrola ciśnienia tętniczego",
    },
    {
      id: 2,
      time: "09:30",
      patient: "Anna Nowak",
      type: "Kontrola",
      status: "completed",
      duration: 15,
      notes: "Wyniki badań",
    },
    {
      id: 3,
      time: "10:00",
      patient: "Piotr Wiśniewski",
      type: "Pilna",
      status: "in-progress",
      duration: 45,
      notes: "Bóle w klatce piersiowej",
    },
    {
      id: 4,
      time: "11:00",
      patient: "Maria Zielińska",
      type: "Konsultacja",
      status: "scheduled",
      duration: 30,
      notes: "Pierwsza wizyta",
    },
  ];

  const stats = {
    todayPatients: 12,
    weeklyPatients: 78,
    monthlyPatients: 324,
    completedToday: 3,
    pendingToday: 9,
    newMessages: 5,
    prescriptionsIssued: 15,
    avgWaitTime: 8, // minutes
  };

  const recentActivity = [
    {
      id: 1,
      type: "appointment",
      description: "Zakończono wizytę z Anna Nowak",
      time: "10 min temu",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "prescription",
      description: "Wystawiono receptę dla Jan Kowalski",
      time: "25 min temu",
      icon: Clipboard,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "message",
      description: "Nowa wiadomość od Maria Zielińska",
      time: "1 godzinę temu",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "urgent",
      description: "Pilna konsultacja - Piotr Wiśniewski",
      time: "2 godziny temu",
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  const upcomingAppointments = todayAppointments.filter(
    (apt) => apt.status === "scheduled"
  );
  const currentPatient = todayAppointments.find(
    (apt) => apt.status === "in-progress"
  );

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
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Powiadomienia
                {stats.newMessages > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {stats.newMessages}
                  </Badge>
                )}
              </Button>

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
                  <p className="text-gray-500">{user.specialization}</p>
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
            Masz dziś {stats.todayPatients} pacjentów. Średni czas oczekiwania:{" "}
            {stats.avgWaitTime} min
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.todayPatients}
                      </p>
                      <p className="text-sm text-gray-600">Dziś pacjentów</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.completedToday}
                      </p>
                      <p className="text-sm text-gray-600">Zakończone</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingToday}</p>
                      <p className="text-sm text-gray-600">Oczekujące</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clipboard className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.prescriptionsIssued}
                      </p>
                      <p className="text-sm text-gray-600">Recepty dziś</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-600" />
                  Szybkie akcje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/doctor/patients/new">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <Users className="h-6 w-6 mb-2 text-blue-600" />
                      <span className="text-sm">Nowy pacjent</span>
                    </Button>
                  </Link>
                  <Link href="/doctor/appointments">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <Calendar className="h-6 w-6 mb-2 text-green-600" />
                      <span className="text-sm">Kalendarz</span>
                    </Button>
                  </Link>
                  <Link href="/doctor/prescriptions">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <Clipboard className="h-6 w-6 mb-2 text-purple-600" />
                      <span className="text-sm">Wystaw receptę</span>
                    </Button>
                  </Link>
                  <Link href="/doctor/reports">
                    <Button
                      variant="outline"
                      className="h-auto flex-col py-4 w-full"
                    >
                      <BarChart3 className="h-6 w-6 mb-2 text-orange-600" />
                      <span className="text-sm">Raporty</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Current Patient */}
            {currentPatient && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <Activity className="h-5 w-5 mr-2" />
                    Aktualny pacjent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {currentPatient.patient}
                      </h3>
                      <p className="text-gray-600">{currentPatient.notes}</p>
                      <p className="text-sm text-gray-500">
                        Rozpoczęto o {currentPatient.time} •{" "}
                        {currentPatient.type}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Dokumentacja
                      </Button>
                      <Button variant="outline">Zakończ wizytę</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    Harmonogram na dziś
                  </div>
                  <Button variant="ghost" size="sm">
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
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        appointment.status === "completed"
                          ? "bg-green-50 border-green-200"
                          : appointment.status === "in-progress"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-semibold text-sm">
                            {appointment.time}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.duration}min
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.patient}</h4>
                          <p className="text-sm text-gray-600">
                            {appointment.notes}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "default"
                              : appointment.status === "in-progress"
                              ? "secondary"
                              : appointment.type === "Pilna"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {appointment.status === "completed"
                            ? "Zakończone"
                            : appointment.status === "in-progress"
                            ? "W trakcie"
                            : appointment.type}
                        </Badge>
                        {appointment.status === "scheduled" && (
                          <Button size="sm" variant="outline">
                            Rozpocznij
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
                <CardDescription>
                  Najbliższe {upcomingAppointments.length} wizyt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                    >
                      <div className="text-center min-w-[50px]">
                        <p className="font-semibold text-sm">
                          {appointment.time}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {appointment.patient}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Link href="/doctor/patients">Zobacz więcej</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-600" />
                  Ostatnia aktywność
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3"
                    >
                      <activity.icon
                        className={`h-4 w-4 mt-0.5 ${activity.color}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  Zobacz wszystkie
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Statystyki tygodnia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pacjenci</span>
                    <span className="font-semibold">
                      {stats.weeklyPatients}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recepty</span>
                    <span className="font-semibold">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Średni czas wizyty</span>
                    <span className="font-semibold">24 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ocena pacjentów</span>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">4.8</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <Link href="/doctor/profile">Szczegółowe raporty</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
