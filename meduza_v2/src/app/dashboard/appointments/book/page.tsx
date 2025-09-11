"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Clock,
  Stethoscope,
  Star,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store";

interface Doctor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  workplace: string;
  address: string;
  bio: string;
  languages: string[];
  availableHours: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  consultationFee: number;
  avatar: string;
  rating: number;
  reviewCount: number;
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        const data = await response.json();

        if (data.success) {
          setDoctors(data.doctors);
        } else {
          toast.error("Nie udało się pobrać listy lekarzy");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Wystąpił błąd podczas ładowania lekarzy");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Mock data - lekarze (fallback if API fails)
  const fallbackDoctors: Doctor[] = [
    {
      id: "fallback-1",
      name: "Dr. Anna Kowalska",
      firstName: "Anna",
      lastName: "Kowalska",
      specialization: "Kardiolog",
      licenseNumber: "12345",
      experience: 15,
      workplace: "Centrum Medyczne",
      address: "ul. Główna 123, Warszawa",
      bio: "Doświadczony kardiolog z 15-letnim stażem",
      languages: ["Polski", "Angielski"],
      availableHours: {
        monday: { start: "09:00", end: "17:00", available: true },
        tuesday: { start: "09:00", end: "17:00", available: true },
        wednesday: { start: "09:00", end: "17:00", available: true },
        thursday: { start: "09:00", end: "17:00", available: true },
        friday: { start: "09:00", end: "17:00", available: true },
      },
      consultationFee: 200,
      avatar: "",
      rating: 4.9,
      reviewCount: 45,
    },
  ];

  const appointmentTypes = [
    { value: "consultation", label: "Konsultacja" },
    { value: "follow-up", label: "Kontrola" },
    { value: "check-up", label: "Badanie kontrolne" },
    { value: "emergency", label: "Pilna wizyta" },
  ];

  const displayDoctors = doctors.length > 0 ? doctors : fallbackDoctors;

  const selectedDoctorData = displayDoctors.find(
    (d) => d.id === selectedDoctor
  );

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentType) {
      toast.error("Proszę wypełnić wszystkie pola");
      return;
    }

    if (!user) {
      toast.error("Musisz być zalogowany");
      return;
    }

    if (!token) {
      toast.error("Brak tokenu autoryzacji. Zaloguj się ponownie.");
      return;
    }

    setBooking(true);

    try {
      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          type: appointmentType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Wizyta została umówiona pomyślnie!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        toast.error(data.message || "Nie udało się umówić wizyty");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Wystąpił błąd podczas umawiania wizyty");
    } finally {
      setBooking(false);
    }
  };

  // Generate available time slots based on doctor's schedule
  const getAvailableSlots = (doctor: Doctor, date: Date) => {
    if (!doctor.availableHours) return [];

    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const daySchedule = doctor.availableHours[dayOfWeek];

    if (!daySchedule || !daySchedule.available) return [];

    const slots = [];
    const startHour = parseInt(daySchedule.start.split(":")[0]);
    const endHour = parseInt(daySchedule.end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour - 1) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }

    return slots;
  };

  const availableSlots =
    selectedDoctorData && selectedDate
      ? getAvailableSlots(selectedDoctorData, selectedDate)
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
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
            <h1 className="text-2xl font-bold text-gray-900">Umów wizytę</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wybór lekarza */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                  Wybierz lekarza
                </CardTitle>
                <CardDescription>
                  Wybierz specjalistę odpowiedniego dla Twojego problemu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedDoctor === doctor.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.avatar} />
                          <AvatarFallback className="text-lg">
                            {doctor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {doctor.name}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {doctor.specialization}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Doświadczenie: {doctor.experience} lat
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {doctor.rating?.toFixed(1) || "Brak oceny"}
                                </span>
                              </div>
                              <p className="text-lg font-semibold text-green-600">
                                {doctor.consultationFee
                                  ? `${doctor.consultationFee} zł`
                                  : "Cena do ustalenia"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {doctor.workplace ||
                                doctor.address ||
                                "Adres nie podany"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wybór typu wizyty */}
            {selectedDoctor && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Typ wizyty</CardTitle>
                  <CardDescription>Wybierz rodzaj konsultacji</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={appointmentType}
                    onValueChange={setAppointmentType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ wizyty" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Kalendarz i godziny */}
          <div className="space-y-6">
            {selectedDoctor && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                      Wybierz datę
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) =>
                        date < new Date() ||
                        date.getDay() === 0 ||
                        date.getDay() === 6
                      }
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-green-600" />
                        Dostępne godziny
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlots.length > 0 ? (
                          availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={
                                selectedTime === slot ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedTime(slot)}
                              className="justify-center"
                            >
                              {slot}
                            </Button>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 col-span-2 text-center py-4">
                            Brak dostępnych godzin dla wybranej daty
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedDate && selectedTime && appointmentType && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Podsumowanie</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">
                            {selectedDoctorData?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedDoctorData?.specialization}
                          </p>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-sm">
                            <span className="font-medium">Data:</span>{" "}
                            {selectedDate.toLocaleDateString("pl-PL")}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Godzina:</span>{" "}
                            {selectedTime}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Typ:</span>{" "}
                            {
                              appointmentTypes.find(
                                (t) => t.value === appointmentType
                              )?.label
                            }
                          </p>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-lg font-semibold text-green-600">
                            Koszt:{" "}
                            {selectedDoctorData?.consultationFee
                              ? `${selectedDoctorData.consultationFee} zł`
                              : "Cena do ustalenia"}
                          </p>
                        </div>

                        <Button
                          onClick={handleBookAppointment}
                          className="w-full mt-4"
                          size="lg"
                        >
                          Potwierdź wizytę
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
