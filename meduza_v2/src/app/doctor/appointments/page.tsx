"use client";

import { useState, useEffect } from "react";
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
  Filter,
} from "lucide-react";
import { useAuthStore } from "@/store";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch appointments on component mount and when filters change
  useEffect(() => {
    if (user && user.role === "doctor") {
      fetchAppointments();
    }
  }, [user, viewMode, selectedDate, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      let url = "/api/appointments/doctor?";

      // Add date filter based on view mode
      if (viewMode === "day") {
        const dateStr = selectedDate.toISOString().split("T")[0];
        url += `date=${dateStr}&`;
      } else if (viewMode === "week") {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        url += `startDate=${startOfWeek.toISOString().split("T")[0]}&endDate=${
          endOfWeek.toISOString().split("T")[0]
        }&`;
      } else if (viewMode === "month") {
        const startOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1,
          0
        );

        url += `startDate=${startOfMonth.toISOString().split("T")[0]}&endDate=${
          endOfMonth.toISOString().split("T")[0]
        }&`;
      }

      // Add status filter
      if (filterStatus !== "all") {
        url += `status=${filterStatus}&`;
      }

      url += "limit=100";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
        setFilteredAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments based on current view
  const getFilteredAppointments = () => {
    if (viewMode === "day") {
      const selectedDateString = selectedDate.toISOString().split("T")[0];
      return appointments.filter((apt) => apt.date === selectedDateString);
    }
    return appointments;
  };

  const todayAppointments = getFilteredAppointments();

  const getViewTitle = () => {
    if (viewMode === "day") {
      return `Wizyty na ${selectedDate.toLocaleDateString("pl-PL")}`;
    } else if (viewMode === "week") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `Wizyty w tygodniu ${startOfWeek.toLocaleDateString(
        "pl-PL"
      )} - ${endOfWeek.toLocaleDateString("pl-PL")}`;
    } else if (viewMode === "month") {
      return `Wizyty w ${selectedDate.toLocaleDateString("pl-PL", {
        month: "long",
        year: "numeric",
      })}`;
    }
    return "Wizyty";
  };

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

              <div className="flex border rounded-lg">
                <Button
                  variant={filterStatus === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="rounded-r-none"
                >
                  Wszystkie
                </Button>
                <Button
                  variant={filterStatus === "scheduled" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus("scheduled")}
                  className="rounded-none border-x-0"
                >
                  Zaplanowane
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus("completed")}
                  className="rounded-l-none"
                >
                  Zakończone
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
                    {getViewTitle()}
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
                                  <Badge
                                    variant={
                                      appointment.type === "consultation"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {appointment.type === "consultation"
                                      ? "Konsultacja"
                                      : appointment.type === "follow-up"
                                      ? "Kontrola"
                                      : appointment.type}
                                  </Badge>
                                </div>

                                <p className="text-sm text-gray-600 mb-2">
                                  {appointment.notes || "Brak notatek"}
                                </p>

                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      Czas trwania: {appointment.duration}min
                                    </span>
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
                                          <p className="font-medium">Status</p>
                                          <p className="text-sm text-gray-600">
                                            {appointment.status === "scheduled"
                                              ? "Zaplanowana"
                                              : appointment.status ===
                                                "in-progress"
                                              ? "W trakcie"
                                              : appointment.status ===
                                                "completed"
                                              ? "Zakończona"
                                              : appointment.status}
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
