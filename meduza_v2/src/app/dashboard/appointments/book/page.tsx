"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");

  // Mock data - lekarze
  const doctors = [
    {
      id: "1",
      name: "Dr. Anna Kowalska",
      specialty: "Kardiolog",
      experience: 15,
      rating: 4.9,
      location: "Centrum Medyczne, ul. Główna 123",
      phone: "+48 123 456 789",
      avatar: "",
      availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      consultationFee: 200,
    },
    {
      id: "2",
      name: "Dr. Piotr Nowak",
      specialty: "Dermatolog",
      experience: 12,
      rating: 4.8,
      location: "Poliklinika Zdrowia, ul. Medyczna 45",
      phone: "+48 987 654 321",
      avatar: "",
      availableSlots: ["08:30", "09:30", "13:00", "14:30", "16:00"],
      consultationFee: 180,
    },
    {
      id: "3",
      name: "Dr. Maria Wiśniewska",
      specialty: "Neurolog",
      experience: 20,
      rating: 4.95,
      location: "Szpital Centralny, ul. Szpitalna 12",
      phone: "+48 555 123 456",
      avatar: "",
      availableSlots: ["10:00", "11:30", "13:30", "15:00"],
      consultationFee: 250,
    },
  ];

  const appointmentTypes = [
    { value: "consultation", label: "Konsultacja" },
    { value: "follow-up", label: "Kontrola" },
    { value: "check-up", label: "Badanie kontrolne" },
    { value: "emergency", label: "Pilna wizyta" },
  ];

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !appointmentType) {
      toast.error("Proszę wypełnić wszystkie pola");
      return;
    }

    // Symulacja zapisania wizyty
    toast.success("Wizyta została umówiona pomyślnie!");

    // Przekierowanie do dashboardu po 2 sekundach
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

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
                  {doctors.map((doctor) => (
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
                                {doctor.specialty}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Doświadczenie: {doctor.experience} lat
                              </p>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {doctor.rating}
                                </span>
                              </div>
                              <p className="text-lg font-semibold text-green-600">
                                {doctor.consultationFee} zł
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {doctor.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {doctor.phone}
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
                        {selectedDoctorData?.availableSlots.map((slot) => (
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
                        ))}
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
                            {selectedDoctorData?.specialty}
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
                            Koszt: {selectedDoctorData?.consultationFee} zł
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
