"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Camera, Shield, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  height?: number;
  weight?: number;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, setUser, token } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [personalData, setPersonalData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });

  const [medicalData, setMedicalData] = useState({
    bloodType: "",
    allergies: [] as string[],
    medications: [] as string[],
    conditions: [] as string[],
    height: 0,
    weight: 0,
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newCondition, setNewCondition] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setProfile(userData);
        setPersonalData({
          name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth || "",
          gender: userData.gender || "",
          address: userData.address || "",
        });
        setMedicalData({
          bloodType: userData.bloodType || "",
          allergies: userData.allergies || [],
          medications: userData.medications || [],
          conditions: userData.conditions || [],
          height: userData.height || 0,
          weight: userData.weight || 0,
        });
        setEmergencyContact({
          name: userData.emergencyContact?.name || "",
          phone: userData.emergencyContact?.phone || "",
          relationship: userData.emergencyContact?.relationship || "",
        });
      } else {
        toast.error("Błąd podczas pobierania profilu");
      }
    } catch (error) {
      toast.error("Błąd podczas pobierania profilu");
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalData = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: personalData.name.split(" ")[0] || "",
          lastName: personalData.name.split(" ").slice(1).join(" ") || "",
          phone: personalData.phone,
          dateOfBirth: personalData.dateOfBirth,
          gender: personalData.gender,
          emergencyContact,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.user || data;
        setUser(updatedUser);
        toast.success("Dane osobowe zostały zaktualizowane");
      } else {
        toast.error("Błąd podczas aktualizacji danych osobowych");
      }
    } catch (error) {
      toast.error("Błąd podczas aktualizacji danych osobowych");
    } finally {
      setSaving(false);
    }
  };

  const updateMedicalData = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bloodType: medicalData.bloodType,
          allergies: medicalData.allergies,
          medications: medicalData.medications,
          conditions: medicalData.conditions,
          height: medicalData.height,
          weight: medicalData.weight,
        }),
      });

      if (response.ok) {
        toast.success("Informacje medyczne zostały zaktualizowane");
        fetchProfile(); // Odśwież dane
      } else {
        toast.error("Błąd podczas aktualizacji informacji medycznych");
      }
    } catch (error) {
      toast.error("Błąd podczas aktualizacji informacji medycznych");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Nowe hasła nie są identyczne");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Hasło zostało zmienione");
        setSecurityData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Błąd podczas zmiany hasła");
      }
    } catch (error) {
      toast.error("Błąd podczas zmiany hasła");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...user!, avatar: data.url });
        toast.success("Zdjęcie profilowe zostało zaktualizowane");
      } else {
        toast.error("Błąd podczas uploadu zdjęcia");
      }
    } catch (error) {
      toast.error("Błąd podczas uploadu zdjęcia");
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setMedicalData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setMedicalData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedicalData((prev) => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()],
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setMedicalData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setMedicalData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()],
      }));
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    setMedicalData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Ładowanie profilu...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Powrót do dashboardu
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-bold mb-2">Mój Profil</h1>
            <p className="text-gray-600">
              Zarządzaj swoimi danymi osobowymi i ustawieniami
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Dane osobowe
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Informacje medyczne
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Bezpieczeństwo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dane osobowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      <Camera className="w-4 h-4" />
                      Zmień zdjęcie
                    </div>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadAvatar(file);
                    }}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Imię i nazwisko</Label>
                  <Input
                    id="name"
                    value={personalData.name}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={personalData.phone}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Data urodzenia</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalData.dateOfBirth}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Płeć</Label>
                  <select
                    id="gender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={personalData.gender}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="">Wybierz płeć</option>
                    <option value="male">Mężczyzna</option>
                    <option value="female">Kobieta</option>
                    <option value="other">Inna</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={personalData.address}
                    onChange={(e) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Kontakt awaryjny</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Imię i nazwisko</Label>
                    <Input
                      id="emergencyName"
                      value={emergencyContact.name}
                      onChange={(e) =>
                        setEmergencyContact((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Telefon</Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyContact.phone}
                      onChange={(e) =>
                        setEmergencyContact((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyRelationship">Pokrewieństwo</Label>
                    <Input
                      id="emergencyRelationship"
                      value={emergencyContact.relationship}
                      onChange={(e) =>
                        setEmergencyContact((prev) => ({
                          ...prev,
                          relationship: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={updatePersonalData} disabled={saving}>
                {saving ? "Zapisywanie..." : "Zapisz dane osobowe"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Informacje medyczne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bloodType">Grupa krwi</Label>
                  <select
                    id="bloodType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={medicalData.bloodType}
                    onChange={(e) =>
                      setMedicalData((prev) => ({
                        ...prev,
                        bloodType: e.target.value,
                      }))
                    }
                  >
                    <option value="">Wybierz grupę krwi</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="height">Wzrost (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={medicalData.height || ""}
                    onChange={(e) =>
                      setMedicalData((prev) => ({
                        ...prev,
                        height: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Waga (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={medicalData.weight || ""}
                    onChange={(e) =>
                      setMedicalData((prev) => ({
                        ...prev,
                        weight: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Allergies */}
              <div>
                <Label>Alergie</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Dodaj alergię"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                  />
                  <Button onClick={addAllergy} variant="outline">
                    Dodaj
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalData.allergies.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {allergy}
                      <button
                        onClick={() => removeAllergy(index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div>
                <Label>Leki</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Dodaj lek"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addMedication()}
                  />
                  <Button onClick={addMedication} variant="outline">
                    Dodaj
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalData.medications.map((medication, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {medication}
                      <button
                        onClick={() => removeMedication(index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div>
                <Label>Choroby przewlekłe</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Dodaj chorobę"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCondition()}
                  />
                  <Button onClick={addCondition} variant="outline">
                    Dodaj
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalData.conditions.map((condition, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {condition}
                      <button
                        onClick={() => removeCondition(index)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button onClick={updateMedicalData} disabled={saving}>
                {saving ? "Zapisywanie..." : "Zapisz informacje medyczne"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Bezpieczeństwo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Obecne hasło</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nowe hasło</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) =>
                    setSecurityData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <Button onClick={changePassword} disabled={saving}>
                {saving ? "Zmienianie hasła..." : "Zmień hasło"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
