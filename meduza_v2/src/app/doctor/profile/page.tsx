"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Star,
  GraduationCap,
  Building2,
  FileText,
  Settings,
  Bell,
  Shield,
  Languages,
  Heart,
} from "lucide-react";

export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
    licenseNumber: user?.licenseNumber || "",
    workplace: user?.workplace || "",
    address: user?.address || "",
    bio: user?.bio || "",
    languages: user?.languages || [],
    education: user?.education || [],
    experience: user?.experience || [],
    certifications: user?.certifications || [],
    availableHours: user?.availableHours || {},
    consultationFee: user?.consultationFee || 0,
  });

  // Use real user data instead of mock data
  const doctorData = {
    ...user,
    licenseNumber: user?.licenseNumber || "",
    workplace: user?.workplace || "",
    address: user?.address || "",
    bio: user?.bio || "",
    languages: user?.languages || [],
    education: user?.education || [],
    experience: user?.experience || [],
    certifications: user?.certifications || [],
    availableHours: user?.availableHours || {
      monday: { start: "", end: "", available: false },
      tuesday: { start: "", end: "", available: false },
      wednesday: { start: "", end: "", available: false },
      thursday: { start: "", end: "", available: false },
      friday: { start: "", end: "", available: false },
      saturday: { start: "", end: "", available: false },
      sunday: { start: "", end: "", available: false },
    },
    consultationFee: user?.consultationFee || 0,
    statistics: {
      totalPatients: user?.totalPatients || 0,
      monthlyPatients: Math.floor((user?.totalPatients || 0) * 0.6),
      averageRating: user?.averageRating || 0,
      reviewsCount: user?.reviewsCount || 0,
      yearsExperience: user?.experience?.length || 0,
      successRate: 0,
    },
  };

  const handleSave = () => {
    updateUser({
      ...user,
      ...editedProfile,
    });
    setIsEditing(false);
  };

  const dayNames = {
    monday: "Poniedziałek",
    tuesday: "Wtorek",
    wednesday: "Środa",
    thursday: "Czwartek",
    friday: "Piątek",
    saturday: "Sobota",
    sunday: "Niedziela",
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
                Profil lekarza
              </h1>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Zapisz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Anuluj
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edytuj profil
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={doctorData.avatar} />
                  <AvatarFallback className="text-2xl">
                    {doctorData.firstName?.[0] || "D"}
                    {doctorData.lastName?.[0] || "R"}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="default" className="bg-green-600">
                  <Stethoscope className="h-3 w-3 mr-1" />
                  Zweryfikowany lekarz
                </Badge>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dr {doctorData.firstName} {doctorData.lastName}
                  </h1>
                  <p className="text-xl text-blue-600 font-medium">
                    {doctorData.specialization}
                  </p>
                  <p className="text-gray-600 mt-2">{doctorData.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doctorData.workplace}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      PWZ: {doctorData.licenseNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doctorData.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Languages className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {doctorData.languages.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {doctorData.statistics.totalPatients}
                    </p>
                    <p className="text-sm text-gray-600">Pacjentów</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {doctorData.statistics.yearsExperience}
                    </p>
                    <p className="text-sm text-gray-600">Lat doświadczenia</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {doctorData.statistics.averageRating}
                      </p>
                      <Star className="h-5 w-5 text-yellow-500 ml-1" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {doctorData.statistics.reviewsCount} opinii
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {doctorData.statistics.successRate}%
                    </p>
                    <p className="text-sm text-gray-600">Skuteczność</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Podstawowe
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Wykształcenie
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Harmonogram
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Cennik
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Ustawienia
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Bezpieczeństwo
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informacje podstawowe</CardTitle>
                <CardDescription>
                  Zarządzaj swoimi danymi osobistymi i kontaktowymi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      value={
                        isEditing
                          ? editedProfile.firstName
                          : doctorData.firstName
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          firstName: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      value={
                        isEditing ? editedProfile.lastName : doctorData.lastName
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          lastName: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editedProfile.email : doctorData.email}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={isEditing ? editedProfile.phone : doctorData.phone}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          phone: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specjalizacja</Label>
                    <Input
                      id="specialization"
                      value={
                        isEditing
                          ? editedProfile.specialization
                          : doctorData.specialization
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          specialization: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Numer PWZ</Label>
                    <Input
                      id="licenseNumber"
                      value={
                        isEditing
                          ? editedProfile.licenseNumber
                          : doctorData.licenseNumber
                      }
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          licenseNumber: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workplace">Miejsce pracy</Label>
                  <Input
                    id="workplace"
                    value={
                      isEditing ? editedProfile.workplace : doctorData.workplace
                    }
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        workplace: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={
                      isEditing ? editedProfile.address : doctorData.address
                    }
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        address: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Opis</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    value={isEditing ? editedProfile.bio : doctorData.bio}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        bio: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Opisz swoje doświadczenie i specjalizację..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education & Experience */}
          <TabsContent value="education">
            <div className="space-y-6">
              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Wykształcenie
                    </div>
                    {isEditing && (
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctorData.education.map((edu) => (
                      <div
                        key={edu.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">
                            {edu.institution}
                          </p>
                          <p className="text-sm text-gray-500">{edu.year}</p>
                          <p className="text-sm mt-1">{edu.description}</p>
                        </div>
                        {isEditing && (
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Doświadczenie zawodowe
                    </div>
                    {isEditing && (
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctorData.experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-sm text-gray-600">
                            {exp.institution}
                          </p>
                          <p className="text-sm text-gray-500">{exp.period}</p>
                          <p className="text-sm mt-1">{exp.description}</p>
                        </div>
                        {isEditing && (
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Certyfikaty i uprawnienia
                    </div>
                    {isEditing && (
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctorData.certifications.map((cert) => (
                      <div key={cert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{cert.name}</h4>
                            <p className="text-sm text-gray-600">
                              {cert.issuer}
                            </p>
                            <p className="text-sm text-gray-500">
                              Wydano: {cert.year} • Ważny do: {cert.validUntil}
                            </p>
                          </div>
                          {isEditing && (
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Harmonogram pracy
                </CardTitle>
                <CardDescription>
                  Ustaw swoje godziny dostępności dla pacjentów
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(doctorData.availableHours).map(
                    ([day, schedule]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-24">
                            <p className="font-medium">
                              {dayNames[day as keyof typeof dayNames]}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={schedule.available}
                              disabled={!isEditing}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">Dostępny</span>
                          </div>
                        </div>
                        {schedule.available && (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="time"
                              value={schedule.start}
                              disabled={!isEditing}
                              className="w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={schedule.end}
                              disabled={!isEditing}
                              className="w-24"
                            />
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Cennik usług
                </CardTitle>
                <CardDescription>
                  Ustaw ceny za swoje usługi medyczne
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">
                        Konsultacja podstawowa
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="consultationFee"
                          type="number"
                          value={doctorData.consultationFee}
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-500">PLN</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="followUpFee">Wizyta kontrolna</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="followUpFee"
                          type="number"
                          value="100"
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-500">PLN</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgentFee">Wizyta pilna</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="urgentFee"
                          type="number"
                          value="250"
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-500">PLN</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="onlineFee">Konsultacja online</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="onlineFee"
                          type="number"
                          value="120"
                          disabled={!isEditing}
                        />
                        <span className="text-sm text-gray-500">PLN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Ustawienia konta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Powiadomienia</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Nowe wizyty</p>
                          <p className="text-sm text-gray-600">
                            Powiadamiaj o nowych rezerwacjach
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Przypomnienia</p>
                          <p className="text-sm text-gray-600">
                            Przypomnienia o nadchodzących wizytach
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Wiadomości od pacjentów</p>
                          <p className="text-sm text-gray-600">
                            Powiadamiaj o nowych wiadomościach
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Bezpieczeństwo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Zmiana hasła</h3>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Obecne hasło</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nowe hasło</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Potwierdź nowe hasło
                        </Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button>Zmień hasło</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Aktywne sesje
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Windows • Chrome</p>
                          <p className="text-sm text-gray-600">
                            Łódź, Polska • Aktywna teraz
                          </p>
                        </div>
                        <Badge variant="default">Obecna sesja</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
