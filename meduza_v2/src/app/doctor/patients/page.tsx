"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Search,
  Plus,
  Users,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Heart,
  Eye,
  MessageSquare,
  Filter,
  MoreVertical,
  Clock,
  Activity,
} from "lucide-react";

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data - lista pacjentów
  const patients = [
    {
      id: 1,
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@email.com",
      phone: "+48 123 456 789",
      dateOfBirth: "1980-05-15",
      gender: "male",
      bloodType: "A+",
      lastVisit: "2025-07-10",
      nextAppointment: "2025-07-20",
      status: "active",
      allergies: ["Penicylina"],
      chronicConditions: ["Nadciśnienie tętnicze"],
      totalVisits: 12,
      avatar: null,
      notes: "Pacjent regularnie kontroluje ciśnienie",
    },
    {
      id: 2,
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@email.com",
      phone: "+48 987 654 321",
      dateOfBirth: "1975-12-03",
      gender: "female",
      bloodType: "B-",
      lastVisit: "2025-07-08",
      nextAppointment: null,
      status: "active",
      allergies: ["Pyłki traw", "Orzechy"],
      chronicConditions: [],
      totalVisits: 5,
      avatar: null,
      notes: "Nowy pacjent, wymaga szczegółowej analizy",
    },
    {
      id: 3,
      firstName: "Piotr",
      lastName: "Wiśniewski",
      email: "piotr.wisniewski@email.com",
      phone: "+48 555 666 777",
      dateOfBirth: "1965-08-22",
      gender: "male",
      bloodType: "O+",
      lastVisit: "2025-06-25",
      nextAppointment: "2025-07-15",
      status: "needs-attention",
      allergies: [],
      chronicConditions: ["Cukrzyca", "Nadciśnienie tętnicze"],
      totalVisits: 28,
      avatar: null,
      notes: "Wymaga ścisłej kontroli poziomu cukru",
    },
    {
      id: 4,
      firstName: "Maria",
      lastName: "Zielińska",
      email: "maria.zielinska@email.com",
      phone: "+48 111 222 333",
      dateOfBirth: "1990-03-10",
      gender: "female",
      bloodType: "AB+",
      lastVisit: "2025-07-12",
      nextAppointment: "2025-08-01",
      status: "active",
      allergies: ["Latex"],
      chronicConditions: [],
      totalVisits: 3,
      avatar: null,
      notes: "Młoda pacjentka, pierwsza ciąża",
    },
  ];

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && patient.status === "active") ||
      (selectedFilter === "attention" &&
        patient.status === "needs-attention") ||
      (selectedFilter === "recent" && patient.lastVisit >= "2025-07-01");

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.status === "active").length,
    needsAttention: patients.filter((p) => p.status === "needs-attention")
      .length,
    recentVisits: patients.filter((p) => p.lastVisit >= "2025-07-01").length,
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
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
                Zarządzanie pacjentami
              </h1>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj pacjenta
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPatients}</p>
                  <p className="text-sm text-gray-600">Wszyscy pacjenci</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.activePatients}</p>
                  <p className="text-sm text-gray-600">Aktywni</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.needsAttention}</p>
                  <p className="text-sm text-gray-600">Wymaga uwagi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Clock className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.recentVisits}</p>
                  <p className="text-sm text-gray-600">Ostatnie wizyty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Szukaj pacjentów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("all")}
                >
                  Wszyscy
                </Button>
                <Button
                  variant={selectedFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("active")}
                >
                  Aktywni
                </Button>
                <Button
                  variant={
                    selectedFilter === "attention" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedFilter("attention")}
                >
                  Wymaga uwagi
                </Button>
                <Button
                  variant={selectedFilter === "recent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter("recent")}
                >
                  Ostatnie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.avatar || undefined} />
                      <AvatarFallback>
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <span>{calculateAge(patient.dateOfBirth)} lat</span>
                        <span>•</span>
                        <span>
                          {patient.gender === "male" ? "Mężczyzna" : "Kobieta"}
                        </span>
                        <span>•</span>
                        <span>{patient.bloodType}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        patient.status === "active" ? "default" : "destructive"
                      }
                    >
                      {patient.status === "active" ? "Aktywny" : "Wymaga uwagi"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>

                  {/* Medical Info */}
                  <div className="space-y-2">
                    {patient.allergies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">
                          Alergie:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((allergy, index) => (
                            <Badge
                              key={index}
                              variant="destructive"
                              className="text-xs"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {patient.chronicConditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-orange-700 mb-1">
                          Choroby przewlekłe:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {patient.chronicConditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visit Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                    <div>
                      <p className="font-medium">Ostatnia wizyta</p>
                      <p className="text-gray-600">{patient.lastVisit}</p>
                    </div>
                    <div>
                      <p className="font-medium">Następna wizyta</p>
                      <p className="text-gray-600">
                        {patient.nextAppointment || "Brak"}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {patient.notes && (
                    <div className="text-sm">
                      <p className="font-medium mb-1">Notatki:</p>
                      <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
                        {patient.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Profil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>
                            Profil pacjenta: {patient.firstName}{" "}
                            {patient.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Szczegółowe informacje o pacjencie
                          </DialogDescription>
                        </DialogHeader>
                        {/* Detailed patient profile would go here */}
                        <div className="p-4 bg-gray-50 rounded">
                          <p>
                            Tutaj będzie szczegółowy profil pacjenta z historią
                            wizyt, wynikami badań, etc.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Wizyta
                    </Button>

                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Wiadomość
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nie znaleziono pacjentów
              </h3>
              <p className="text-gray-600 mb-4">
                Spróbuj zmienić kryteria wyszukiwania lub dodaj nowego pacjenta.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Dodaj pacjenta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
