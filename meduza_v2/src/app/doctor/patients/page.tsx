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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Plus,
  Users,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Eye,
  MessageSquare,
  MoreVertical,
  Clock,
  Activity,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  lastVisit: string | null;
  nextAppointment: string | null;
  nextAppointmentId?: string | null;
  totalVisits: number;
  status: string;
  avatar: string | null;
  notes?: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openPatientId, setOpenPatientId] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({
    title: "Wizyta",
    description: "",
    diagnosis: "",
    treatment: "",
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });
  const [patientUpdateForm, setPatientUpdateForm] = useState({
    allergies: "",
    conditions: "",
    medications: "",
    notes: "",
  });
  const [labForm, setLabForm] = useState({
    testName: "",
    result: "",
    unit: "",
    normalRange: "",
    status: "normal",
  });

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      if (!token || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPatients(data.patients);
          } else {
            setError(data.message || "Nie udało się pobrać listy pacjentów");
          }
        } else {
          setError("Wystąpił błąd podczas ładowania pacjentów");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError("Wystąpił błąd podczas ładowania pacjentów");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token, user]);

  const updatePatientProfile = async (patientId: string) => {
    try {
      setError(null);
      setSaving(true);
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allergies: patientUpdateForm.allergies
            ? patientUpdateForm.allergies.split(",").map((s) => s.trim())
            : [],
          conditions: patientUpdateForm.conditions
            ? patientUpdateForm.conditions.split(",").map((s) => s.trim())
            : [],
          medications: patientUpdateForm.medications
            ? patientUpdateForm.medications.split(",").map((s) => s.trim())
            : [],
          notes: patientUpdateForm.notes,
        }),
      });
      if (!res.ok) {
        throw new Error("Nie udało się zapisać profilu pacjenta");
      }
      const data = await res.json();
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, ...data.patient } : p)),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addMedicalRecord = async (
    patientId: string,
    appointmentId?: string | null,
  ) => {
    try {
      setError(null);
      setSaving(true);
      const res = await fetch(`/api/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          appointmentId: appointmentId || undefined,
          title: recordForm.title || "Wizyta",
          description:
            recordForm.description || "Opis wizyty dodany przez lekarza",
          diagnosis: recordForm.diagnosis
            ? recordForm.diagnosis.split(",").map((s) => s.trim())
            : [],
          symptoms: [],
          treatment: recordForm.treatment || "",
          prescription: [],
          labResults:
            labForm.testName && labForm.result
              ? [
                  {
                    testName: labForm.testName,
                    result: labForm.result,
                    normalRange: labForm.normalRange,
                    unit: labForm.unit,
                    status:
                      labForm.status === "abnormal" ||
                      labForm.status === "critical"
                        ? labForm.status
                        : "normal",
                  },
                ]
              : [],
          files: [],
        }),
      });
      if (!res.ok) {
        throw new Error("Nie udało się zapisać historii medycznej");
      }
      setRecordForm({
        title: "Wizyta",
        description: "",
        diagnosis: "",
        treatment: "",
      });
      setLabForm({
        testName: "",
        result: "",
        unit: "",
        normalRange: "",
        status: "normal",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const addPrescription = async (
    patientId: string,
    appointmentId?: string | null,
  ) => {
    try {
      setError(null);
      setSaving(true);
      const medicationName =
        prescriptionForm.medicationName.trim() || "Lek przepisany";
      const dosage = prescriptionForm.dosage.trim() || "Brak dawki";
      const frequency =
        prescriptionForm.frequency.trim() || "Zgodnie z zaleceniami";
      const duration =
        prescriptionForm.duration.trim() || "Do odwołania / wg zaleceń";
      const instructions =
        prescriptionForm.instructions.trim() ||
        "Przyjmować zgodnie z zaleceniami lekarza";
      const treatmentText = `Recepta: ${medicationName}. ${instructions}`;
      const res = await fetch(`/api/medical-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          appointmentId: appointmentId || undefined,
          title: "Recepta",
          description: "Wystawiona recepta",
          diagnosis: [],
          symptoms: [],
          treatment: treatmentText,
          prescription: [
            {
              medicationName,
              dosage,
              frequency,
              duration,
              instructions,
              status: "active",
            },
          ],
          labResults: [],
          files: [],
        }),
      });
      if (!res.ok) {
        throw new Error("Nie udało się zapisać recepty");
      }
      setPrescriptionForm({
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: string,
    cancellationReason?: string,
  ) => {
    try {
      setError(null);
      setSaving(true);
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, cancellationReason }),
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && patient.status === "active") ||
      (selectedFilter === "attention" && patient.status === "needs-attention") ||
      (selectedFilter === "recent" &&
        patient.lastVisit &&
        patient.lastVisit >= "2025-07-01");

    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPatients: patients.length,
    activePatients: patients.filter((p) => p.status === "active").length,
    needsAttention: patients.filter((p) => p.status === "needs-attention")
      .length,
    recentVisits: patients.filter(
      (p) => p.lastVisit && p.lastVisit >= "2025-07-01",
    ).length,
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return 0;
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
        {error && (
          <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
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
                  variant={selectedFilter === "attention" ? "default" : "outline"}
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
                        <span>
                          {patient.dateOfBirth
                            ? `${calculateAge(patient.dateOfBirth)} lat`
                            : "Brak danych"}
                        </span>
                        <span>•</span>
                        <span>
                          {patient.gender === "male"
                            ? "Mężczyzna"
                            : patient.gender === "female"
                              ? "Kobieta"
                              : "Brak danych"}
                        </span>
                        <span>•</span>
                        <span>{patient.bloodType || "Brak"}</span>
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
                      <span className="truncate">
                        {patient.email || "Brak"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{patient.phone || "Brak"}</span>
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

                    {patient.conditions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-orange-700 mb-1">
                          Choroby przewlekłe:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {patient.conditions.map(
                            (condition: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {condition}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visit Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                    <div>
                      <p className="font-medium">Ostatnia wizyta</p>
                      <p className="text-gray-600">
                        {patient.lastVisit || "Brak"}
                      </p>
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
                    <Dialog
                      open={openPatientId === patient.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenPatientId(patient.id);
                          setPatientUpdateForm({
                            allergies: patient.allergies?.join(", ") || "",
                            conditions: patient.conditions?.join(", ") || "",
                            medications: patient.medications?.join(", ") || "",
                            notes: patient.notes || "",
                          });
                          setRecordForm({
                            title: "Wizyta",
                            description: "",
                            diagnosis: "",
                            treatment: "",
                          });
                          setPrescriptionForm({
                            medicationName: "",
                            dosage: "",
                            frequency: "",
                            duration: "",
                            instructions: "",
                          });
                          setLabForm({
                            testName: "",
                            result: "",
                            unit: "",
                            normalRange: "",
                            status: "normal",
                          });
                        } else {
                          setOpenPatientId(null);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Profil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl">
                        <DialogHeader>
                          <DialogTitle>
                            Profil pacjenta: {patient.firstName} {patient.lastName}
                          </DialogTitle>
                          <DialogDescription>
                            Zarządzaj danymi medycznymi, historią wizyt i receptami
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-5">
                          <div className="rounded-lg border bg-gradient-to-r from-emerald-50 via-white to-blue-50 p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500">
                                  Pacjent
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {patient.firstName} {patient.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {patient.email || "Brak e-mail"} • {" "}
                                  {patient.phone || "Brak telefonu"}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary">
                                  Następna wizyta: {patient.nextAppointment || "brak"}
                                </Badge>
                                <Badge variant="outline">
                                  Ostatnia: {patient.lastVisit || "brak"}
                                </Badge>
                                <Badge variant="outline">Wizyt: {patient.totalVisits}</Badge>
                              </div>
                            </div>
                          </div>

                          <Tabs defaultValue="profile" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="profile">
                                Profil medyczny
                              </TabsTrigger>
                              <TabsTrigger value="visit">
                                Wizyta / badania
                              </TabsTrigger>
                              <TabsTrigger value="rx">Recepta</TabsTrigger>
                            </TabsList>

                            <TabsContent value="profile">
                              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                                <p className="text-xs text-gray-500">
                                  Aktualizuj alergie, choroby przewlekłe i leki,
                                  które widzi cały zespół medyczny.
                                </p>
                                <Input
                                  placeholder="Alergie (oddziel przecinkami)"
                                  value={patientUpdateForm.allergies}
                                  onChange={(e) =>
                                    setPatientUpdateForm((prev) => ({
                                      ...prev,
                                      allergies: e.target.value,
                                    }))
                                  }
                                />
                                <Input
                                  placeholder="Choroby przewlekłe (oddziel przecinkami)"
                                  value={patientUpdateForm.conditions}
                                  onChange={(e) =>
                                    setPatientUpdateForm((prev) => ({
                                      ...prev,
                                      conditions: e.target.value,
                                    }))
                                  }
                                />
                                <Input
                                  placeholder="Leki (oddziel przecinkami)"
                                  value={patientUpdateForm.medications}
                                  onChange={(e) =>
                                    setPatientUpdateForm((prev) => ({
                                      ...prev,
                                      medications: e.target.value,
                                    }))
                                  }
                                />
                                <textarea
                                  className="w-full rounded-md border border-gray-200 p-2 text-sm"
                                  placeholder="Notatki lekarza"
                                  rows={3}
                                  value={patientUpdateForm.notes}
                                  onChange={(e) =>
                                    setPatientUpdateForm((prev) => ({
                                      ...prev,
                                      notes: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex flex-wrap gap-1 text-xs">
                                  {patient.allergies.map((allergy, index) => (
                                    <Badge key={index} variant="destructive">
                                      {allergy}
                                    </Badge>
                                  ))}
                                  {patient.conditions.map((condition, index) => (
                                    <Badge key={`c-${index}`} variant="secondary">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() => updatePatientProfile(patient.id)}
                                    disabled={saving}
                                  >
                                    {saving && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Zapisz profil
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="visit">
                              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    Powiąż z wizytą: {" "}
                                    {patient.nextAppointmentId || "brak"}
                                  </span>
                                  <Badge variant="secondary">Nowy wpis</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Tytuł wizyty"
                                    value={recordForm.title}
                                    onChange={(e) =>
                                      setRecordForm((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Diagnoza (oddziel przecinkami)"
                                    value={recordForm.diagnosis}
                                    onChange={(e) =>
                                      setRecordForm((prev) => ({
                                        ...prev,
                                        diagnosis: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <textarea
                                  className="w-full rounded-md border border-gray-200 p-2 text-sm"
                                  placeholder="Opis wizyty"
                                  rows={3}
                                  value={recordForm.description}
                                  onChange={(e) =>
                                    setRecordForm((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                />
                                <Input
                                  placeholder="Zalecenia / leczenie"
                                  value={recordForm.treatment}
                                  onChange={(e) =>
                                    setRecordForm((prev) => ({
                                      ...prev,
                                      treatment: e.target.value,
                                    }))
                                  }
                                />

                                <div className="rounded-md border bg-gray-50 p-3">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                    <span>Badanie (opcjonalne)</span>
                                    <Badge variant="outline">Lab</Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input
                                      placeholder="Nazwa badania"
                                      value={labForm.testName}
                                      onChange={(e) =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          testName: e.target.value,
                                        }))
                                      }
                                    />
                                    <Input
                                      placeholder="Wynik"
                                      value={labForm.result}
                                      onChange={(e) =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          result: e.target.value,
                                        }))
                                      }
                                    />
                                    <Input
                                      placeholder="Zakres referencyjny"
                                      value={labForm.normalRange}
                                      onChange={(e) =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          normalRange: e.target.value,
                                        }))
                                      }
                                    />
                                    <Input
                                      placeholder="Jednostka"
                                      value={labForm.unit}
                                      onChange={(e) =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          unit: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                                    <span className="text-gray-600">
                                      Status:
                                    </span>
                                    <Button
                                      variant={
                                        labForm.status === "normal"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          status: "normal",
                                        }))
                                      }
                                    >
                                      Prawidłowy
                                    </Button>
                                    <Button
                                      variant={
                                        labForm.status === "abnormal"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          status: "abnormal",
                                        }))
                                      }
                                    >
                                      Nieprawidłowy
                                    </Button>
                                    <Button
                                      variant={
                                        labForm.status === "critical"
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        setLabForm((prev) => ({
                                          ...prev,
                                          status: "critical",
                                        }))
                                      }
                                    >
                                      Pilny
                                    </Button>
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      addMedicalRecord(
                                        patient.id,
                                        patient.nextAppointmentId,
                                      )
                                    }
                                    disabled={saving}
                                  >
                                    {saving && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Zapisz historię
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="rx">
                              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>
                                    Recepta trafi tylko do zakładki Recepty
                                    pacjenta
                                  </span>
                                  <Badge variant="secondary">RX</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Lek"
                                    value={prescriptionForm.medicationName}
                                    onChange={(e) =>
                                      setPrescriptionForm((prev) => ({
                                        ...prev,
                                        medicationName: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Dawkowanie"
                                    value={prescriptionForm.dosage}
                                    onChange={(e) =>
                                      setPrescriptionForm((prev) => ({
                                        ...prev,
                                        dosage: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Częstotliwość"
                                    value={prescriptionForm.frequency}
                                    onChange={(e) =>
                                      setPrescriptionForm((prev) => ({
                                        ...prev,
                                        frequency: e.target.value,
                                      }))
                                    }
                                  />
                                  <Input
                                    placeholder="Czas trwania"
                                    value={prescriptionForm.duration}
                                    onChange={(e) =>
                                      setPrescriptionForm((prev) => ({
                                        ...prev,
                                        duration: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <textarea
                                  className="w-full rounded-md border border-gray-200 p-2 text-sm"
                                  placeholder="Instrukcje dla pacjenta"
                                  rows={2}
                                  value={prescriptionForm.instructions}
                                  onChange={(e) =>
                                    setPrescriptionForm((prev) => ({
                                      ...prev,
                                      instructions: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      addPrescription(
                                        patient.id,
                                        patient.nextAppointmentId,
                                      )
                                    }
                                    disabled={saving}
                                  >
                                    {saving && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Wystaw receptę
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
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