"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store";
import { Appointment, LabResult, Prescription, Notification } from "@/types";
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
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    // Redirect doctors to their dashboard
    if (user && user.role === "doctor") {
      router.push("/doctor/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  // Empty states for new patients - no mock data
  const upcomingAppointments = user.upcomingAppointments || [];
  const recentResults = user.recentResults || [];
  const activePrescriptions = user.activePrescriptions || [];
  const notifications = user.notifications || [];

  // Check if patient has any real medical data
  const hasAppointments = upcomingAppointments.length > 0;
  const hasResults = recentResults.length > 0;
  const hasPrescriptions = activePrescriptions.length > 0;

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
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Powiadomienia
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications.length}
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/appointments">
                      Zobacz wszystkie
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasAppointments ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Stethoscope className="h-8 w-8 text-blue-600" />
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
                              <Badge variant="secondary" className="text-xs">
                                {appointment.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Szczegóły
                        </Button>
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
                      {activePrescriptions.map((prescription) => (
                        <div
                          key={prescription.id}
                          className="border-l-4 border-orange-500 pl-4"
                        >
                          <h4 className="font-semibold">
                            {prescription.medicationName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {prescription.dosage} - {prescription.frequency}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Status: {prescription.status}
                          </p>
                        </div>
                      ))}
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
                      Recepty pojawią się po wizytach u lekarza
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Powiadomienia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
                        >
                          <h5 className="font-medium text-sm">
                            {notification.title}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.createdAt}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4">
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
    </div>
  );
}
