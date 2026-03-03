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
import { ProfileCompletion } from "@/components/ui/profile-completion";
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
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user || user.role !== "doctor") return null;

  // Check if user has real data
  const hasPatients = user.totalPatients && user.totalPatients > 0;
  const profileCompletion = user.profileCompletionPercentage || 0;

  // Empty state for new doctors
  const stats = {
    todayPatients: hasPatients ? user.totalPatients || 0 : 0,
    weeklyPatients: hasPatients
      ? Math.floor((user.totalPatients || 0) * 0.2)
      : 0,
    monthlyPatients: hasPatients
      ? Math.floor((user.totalPatients || 0) * 0.6)
      : 0,
    completedToday: 0,
    avgWaitTime: 0,
    newMessages: 0,
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
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
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

            {/* Empty State for Current Patient */}
            <Card className="border-l-4 border-l-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-600">
                  <Activity className="h-5 w-5 mr-2" />
                  Brak aktywnych wizyt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    Obecnie nie masz żadnych aktywnych wizyt
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/doctor/appointments">Sprawdź kalendarz</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule - Empty State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-blue-600" />
                    Harmonogram na dziś
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
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Brak wizyt na dziś</p>
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Appointments - Empty State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-orange-600" />
                  Następne wizyty
                </CardTitle>
                <CardDescription>Najbliższe wizyty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Brak zaplanowanych wizyt
                  </p>
                </div>
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
