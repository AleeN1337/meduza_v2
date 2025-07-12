"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Video,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Mock data - wizyty lekarza
  const appointments = [
    {
      id: 1,
      patientName: "Jan Kowalski",
      patientId: "patient_1",
      date: "2025-07-12",
      time: "09:00",
      duration: 30,
      type: "consultation",
      status: "scheduled",
      notes: "Kontrola ciśnienia tętniczego",
      location: "Gabinet 101",
      isOnline: false,
      patientPhone: "+48 123 456 789",
      urgency: "normal",
    },
    {
      id: 2,
      patientName: "Anna Nowak",
      patientId: "patient_2",
      date: "2025-07-12",
      time: "09:30",
      duration: 15,
      type: "follow-up",
      status: "completed",
      notes: "Omówienie wyników badań",
      location: "Gabinet 101",
      isOnline: false,
      patientPhone: "+48 987 654 321",
      urgency: "normal",
    },
    {
      id: 3,
      patientName: "Piotr Wiśniewski",
      patientId: "patient_3",
      date: "2025-07-12",
      time: "10:00",
      duration: 45,
      type: "consultation",
      status: "in-progress",
      notes: "Bóle w klatce piersiowej - pilna konsultacja",
      location: "Gabinet 101",
      isOnline: false,
      patientPhone: "+48 555 666 777",
      urgency: "high",
    },
    {
      id: 4,
      patientName: "Maria Zielińska",
      patientId: "patient_4",
      date: "2025-07-12",
      time: "11:00",
      duration: 30,
      type: "consultation",
      status: "scheduled",
      notes: "Pierwsza wizyta - konsultacja kardiologiczna",
      location: "Online",
      isOnline: true,
      patientPhone: "+48 111 222 333",
      urgency: "normal",
    },
    {
      id: 5,
      patientName: "Tomasz Kowalczyk",
      patientId: "patient_5",
      date: "2025-07-12",
      time: "14:00",
      duration: 30,
      type: "follow-up",
      status: "scheduled",
      notes: "Kontrola po zabiegu",
      location: "Gabinet 101",
      isOnline: false,
      patientPhone: "+48 444 555 666",
      urgency: "normal",
    },
    {
      id: 6,
      patientName: "Katarzyna Nowak",
      patientId: "patient_6",
      date: "2025-07-12",
      time: "15:30",
      duration: 30,
      type: "consultation",
      status: "cancelled",
      notes: "Konsultacja odwołana przez pacjenta",
      location: "Gabinet 101",
      isOnline: false,
      patientPhone: "+48 777 888 999",
      urgency: "normal",
    },
  ];

  // Filter appointments for selected date
  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const todayAppointments = appointments.filter(
    (apt) => apt.date === selectedDateString
  );

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200";
      case "in-progress":
        return "bg-blue-50 border-blue-200";
      case "cancelled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            Pilne
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="text-xs">
            Średnie
          </Badge>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: todayAppointments.length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
    scheduled: todayAppointments.filter((a) => a.status === "scheduled").length,
    inProgress: todayAppointments.filter((a) => a.status === "in-progress")
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Powrót
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Kalendarz wizyt
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "day" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                  className="rounded-r-none"
                >
                  Dzień
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="rounded-none border-x-0"
                >
                  Tydzień
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="rounded-l-none"
                >
                  Miesiąc
                </Button>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nowa wizyta
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar - Calendar & Stats */}
          <div className="xl:col-span-1 space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Kalendarz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Daily Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statystyki dnia</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString("pl-PL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wszystkie</span>
                    <Badge variant="outline">{stats.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zaplanowane</span>
                    <Badge variant="secondary">{stats.scheduled}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">W trakcie</span>
                    <Badge variant="default">{stats.inProgress}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Zakończone</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats.completed}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Appointments */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Wizyty na {selectedDate.toLocaleDateString("pl-PL")}
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Zarządzaj harmonogramem
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <Card
                        key={appointment.id}
                        className={`${getStatusColor(
                          appointment.status
                        )} hover:shadow-md transition-shadow`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="text-center min-w-[60px]">
                                <p className="font-semibold text-lg">
                                  {appointment.time}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {appointment.duration}min
                                </p>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {appointment.patientName}
                                  </h3>
                                  {getUrgencyBadge(appointment.urgency)}
                                  <Badge
                                    variant={
                                      appointment.type === "consultation"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {appointment.type === "consultation"
                                      ? "Konsultacja"
                                      : "Kontrola"}
                                  </Badge>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                  {appointment.notes}
                                </p>

                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    {appointment.isOnline ? (
                                      <Video className="h-3 w-3" />
                                    ) : (
                                      <MapPin className="h-3 w-3" />
                                    )}
                                    <span>{appointment.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{appointment.patientPhone}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {getStatusIcon(appointment.status)}
                              <div className="flex space-x-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Szczegóły wizyty
                                      </DialogTitle>
                                      <DialogDescription>
                                        {appointment.patientName} -{" "}
                                        {appointment.date} {appointment.time}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="font-medium">Pacjent</p>
                                          <p className="text-sm text-gray-600">
                                            {appointment.patientName}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            Typ wizyty
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {appointment.type === "consultation"
                                              ? "Konsultacja"
                                              : "Kontrola"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            Czas trwania
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {appointment.duration} minut
                                          </p>
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            Lokalizacja
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {appointment.location}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="font-medium">Notatki</p>
                                        <p className="text-sm text-gray-600">
                                          {appointment.notes}
                                        </p>
                                      </div>
                                      <div className="flex space-x-2 pt-4">
                                        {appointment.status === "scheduled" && (
                                          <Button size="sm">
                                            Rozpocznij wizytę
                                          </Button>
                                        )}
                                        {appointment.status ===
                                          "in-progress" && (
                                          <Button size="sm">
                                            Zakończ wizytę
                                          </Button>
                                        )}
                                        <Button variant="outline" size="sm">
                                          Edytuj
                                        </Button>
                                        <Button variant="outline" size="sm">
                                          <Phone className="h-4 w-4 mr-2" />
                                          Zadzwoń
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-4 w-4" />
                                </Button>

                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions for current appointment */}
                          {appointment.status === "in-progress" && (
                            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <AlertCircle className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-800">
                                    Wizyta w trakcie
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    Dodaj notatkę
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    Wystaw receptę
                                  </Button>
                                  <Button size="sm">Zakończ wizytę</Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Brak wizyt na ten dzień
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Wybierz inny dzień lub dodaj nową wizytę.
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj wizytę
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
