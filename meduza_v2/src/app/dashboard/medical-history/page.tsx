"use client";

import { useState, useEffect } from "react";
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
  FileText,
  TestTube,
  Pill,
  Camera,
  Download,
  Eye,
  Calendar,
  User,
  Clock,
  Stethoscope,
  AlertTriangle,
  Heart,
  Activity,
  Loader,
} from "lucide-react";

export default function MedicalHistoryPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile to get allergies and conditions
        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData.user);
        }

        // Fetch medical records (wizyty) and derive prescriptions fallback
        let derivedPrescriptions: any[] = [];
        const recordsRes = await fetch("/api/medical-records", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          const allRecords = recordsData.records || [];
          const visitOnly = allRecords.filter(
            (rec: any) => !rec.prescription || rec.prescription.length === 0,
          );
          setMedicalRecords(visitOnly);

          // Derive prescriptions from records in case the separate endpoint is empty
          derivedPrescriptions = allRecords.flatMap((rec: any, idx: number) => {
            if (!rec.prescription || rec.prescription.length === 0) return [];
            const doctorName = rec.doctorId
              ? `${rec.doctorId.firstName} ${rec.doctorId.lastName}`
              : "Lekarz";
            return rec.prescription.map((rx: any, rxIdx: number) => ({
              ...rx,
              id: rx._id?.toString() || `rx-rec-${rec._id}-${idx}-${rxIdx}`,
              recordId: rec._id,
              doctorName,
              prescribedDate: rec.date,
              description: rec.description || rec.treatment,
              status: rx.status || "active",
              fulfilledAt: rx.fulfilledAt,
            }));
          });
        }

        // Fetch all appointments (upcoming + completed)
        const apptRes = await fetch(
          "/api/appointments/patient?status=all&limit=200",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          const appts =
            apptData.appointments || apptData.data || apptData.records || [];
          setAppointments(appts);
        }

        // Fetch lab results and prescriptions (prefer backend aggregation)
        const resultsRes = await fetch("/api/medical-records/patient/results", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setLabResults(resultsData.labResults || []);
          const apiPrescriptions = resultsData.prescriptions || [];
          const combined = [...apiPrescriptions, ...derivedPrescriptions];
          // Ensure unique by id to avoid doubles when both sources deliver data
          const unique = new Map<string, any>();
          combined.forEach((rx: any, idx: number) => {
            const key = rx.id || `rx-${idx}`;
            if (!unique.has(key)) unique.set(key, rx);
          });
          setPrescriptions(Array.from(unique.values()));
        } else {
          // Fallback when endpoint fails
          setPrescriptions(derivedPrescriptions);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Nie udało się załadować danych");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, router]);

  const allergies = userProfile?.allergies || [];
  const chronicConditions = userProfile?.conditions || [];
  const activePrescriptions = prescriptions.filter(
    (rx) => rx.status !== "fulfilled",
  );
  const archivedPrescriptions = prescriptions.filter(
    (rx) => rx.status === "fulfilled",
  );

  const formatAppointmentStatus = (status: string | undefined) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("cancel")) return "Anulowana";
    if (normalized.includes("complete")) return "Zakończona";
    if (normalized.includes("schedule") || normalized === "scheduled")
      return "Nadchodząca";
    if (normalized.includes("no-show")) return "Nieobecność";
    return status || "Nadchodząca";
  };

  const normalizedAppointments = appointments
    .map((apt) => ({
      ...apt,
      dateTime: new Date(`${apt.date}T${apt.time}`),
    }))
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const upcomingAppointments = normalizedAppointments.filter((apt) => {
    const status = (apt.status || "").toLowerCase();
    return !status.includes("cancel") && !status.includes("completed");
  });

  const completedAppointments = normalizedAppointments.filter((apt) => {
    const status = (apt.status || "").toLowerCase();
    return status.includes("completed");
  });

  const fulfillPrescription = async (rxId: string) => {
    try {
      setFulfillingId(rxId);
      const res = await fetch(`/api/medical-records/prescriptions/${rxId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Nie udało się zrealizować recepty");
      }
      setPrescriptions((prev) =>
        prev.map((rx) =>
          rx.id === rxId || rx._id === rxId
            ? {
                ...rx,
                status: "fulfilled",
                fulfilledAt: new Date().toISOString(),
              }
            : rx,
        ),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFulfillingId(null);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">
              Historia medyczna
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Ładowanie danych...</span>
          </div>
        ) : (
          <>
            {/* Podstawowe informacje medyczne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Alergie i przeciwwskazania
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {allergies.length > 0 ? (
                    <div className="space-y-2">
                      {allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="mr-2"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Brak zarejestrowanych alergii
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-600" />
                    Choroby przewlekłe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chronicConditions.length > 0 ? (
                    <div className="space-y-2">
                      {chronicConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Brak zarejestrowanych chorób przewlekłych
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Główne zakładki */}
            <Tabs defaultValue="records" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="records" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Wizyty ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="labs" className="flex items-center">
                  <TestTube className="h-4 w-4 mr-2" />
                  Badania ({labResults.length})
                </TabsTrigger>
                <TabsTrigger
                  value="prescriptions"
                  className="flex items-center"
                >
                  <Pill className="h-4 w-4 mr-2" />
                  Recepty ({prescriptions.length})
                </TabsTrigger>
              </TabsList>

              {/* Zakładka Wizyty */}
              <TabsContent value="records">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                      Wszystkie wizyty (nadchodzące i zakończone)
                    </h3>

                    {normalizedAppointments.length > 0 ? (
                      normalizedAppointments.map((appointment) => (
                        <Card
                          key={appointment.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Stethoscope className="h-4 w-4 text-blue-600" />
                                  {appointment.doctorName || "Wizyta"}
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(
                                      `${appointment.date}T${appointment.time}`,
                                    ).toLocaleString("pl-PL")}
                                  </span>
                                  {appointment.specialty && (
                                    <span className="flex items-center">
                                      <User className="h-4 w-4 mr-1" />
                                      {appointment.specialty}
                                    </span>
                                  )}
                                  {appointment.type && (
                                    <Badge variant="secondary" className="text-xs">
                                      {appointment.type}
                                    </Badge>
                                  )}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  (appointment.status || "").toLowerCase().includes("completed")
                                    ? "default"
                                    : (appointment.status || "").toLowerCase().includes("cancel")
                                      ? "destructive"
                                      : "secondary"
                                }
                                className="capitalize"
                              >
                                {formatAppointmentStatus(appointment.status)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>
                                {appointment.date} • {appointment.time}
                              </span>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-700">
                                {appointment.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-gray-500">
                            Brak wizyt do wyświetlenia. Umów wizytę, aby pojawiła się tutaj.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Wpisy medyczne z wizyt
                    </h3>

                    {medicalRecords.length > 0 ? (
                      medicalRecords.map((record) => (
                        <Card
                          key={record._id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {record.title}
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-4 mt-1">
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(record.date).toLocaleDateString(
                                      "pl-PL",
                                    )}
                                  </span>
                                  <span className="flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    Dr. {record.doctorId?.firstName}{" "}
                                    {record.doctorId?.lastName} -{" "}
                                    {record.doctorId?.specialization}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm mb-1">
                                  Opis:
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {record.description}
                                </p>
                              </div>

                              {record.symptoms?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-1">
                                    Objawy:
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {record.symptoms.map(
                                      (symptom: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {symptom}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {record.diagnosis?.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-1">
                                    Diagnoza:
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {record.diagnosis.map(
                                      (diag: string, index: number) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {diag}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-medium text-sm mb-1">
                                  Leczenie:
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {record.treatment}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-gray-500">
                            Brak nagranych wizyt. Lekarz będzie mógł dodać wpisy
                            po następnej wizycie.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Zakładka Badania */}
              <TabsContent value="labs">
                <div className="space-y-4">
                  {labResults.length > 0 ? (
                    labResults.map((lab) => (
                      <Card key={lab.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {lab.testName}
                              </CardTitle>
                              <CardDescription>
                                {new Date(lab.recordDate).toLocaleDateString(
                                  "pl-PL",
                                )}{" "}
                                - {lab.doctorName}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                lab.status === "normal"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {lab.status === "normal"
                                ? "Norma"
                                : lab.status === "abnormal"
                                  ? "Nieprawidłowe"
                                  : "Krytyczne"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Wynik: {lab.result}
                            </p>
                            <p className="text-sm text-gray-600">
                              Norma: {lab.normalRange}
                            </p>
                            <p className="text-sm text-gray-600">
                              Jednostka: {lab.unit}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500">
                          Brak wyników badań. Lekarz doda wyniki po
                          przeprowadzeniu badań.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Zakładka Recepty */}
              <TabsContent value="prescriptions">
                <Tabs defaultValue="active" className="space-y-4">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="active">Aktywne</TabsTrigger>
                    <TabsTrigger value="archived">Zarchiwizowane</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active">
                    <div className="space-y-4">
                      {activePrescriptions.length > 0 ? (
                        activePrescriptions.map((prescription) => (
                          <Card key={prescription.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {prescription.medicationName}
                                  </CardTitle>
                                  <CardDescription>
                                    Przepisane przez {prescription.doctorName} -{" "}
                                    {new Date(
                                      prescription.prescribedDate,
                                    ).toLocaleDateString("pl-PL")}
                                  </CardDescription>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={fulfillingId === prescription.id}
                                  onClick={() =>
                                    fulfillPrescription(prescription.id)
                                  }
                                >
                                  {fulfillingId === prescription.id
                                    ? "Realizuję..."
                                    : "Zrealizuj"}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Dawka</p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.dosage}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Częstotliwość
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.frequency}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Czas trwania
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.duration}
                                  </p>
                                </div>
                                {prescription.instructions && (
                                  <div>
                                    <p className="text-sm font-medium">
                                      Instrukcje
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {prescription.instructions}
                                    </p>
                                  </div>
                                )}
                                {prescription.description && (
                                  <div className="md:col-span-4">
                                    <p className="text-sm font-medium">Opis</p>
                                    <p className="text-sm text-gray-600">
                                      {prescription.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <p className="text-gray-500">
                              Brak aktywnych recept. Zrealizowane zobaczysz w
                              archiwum.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="archived">
                    <div className="space-y-4">
                      {archivedPrescriptions.length > 0 ? (
                        archivedPrescriptions.map((prescription) => (
                          <Card key={prescription.id} className="border-dashed">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {prescription.medicationName}
                                  </CardTitle>
                                  <CardDescription>
                                    Przepisane przez {prescription.doctorName} -{" "}
                                    {new Date(
                                      prescription.prescribedDate,
                                    ).toLocaleDateString("pl-PL")}
                                  </CardDescription>
                                </div>
                                <Badge variant="outline">Zrealizowana</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Dawka</p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.dosage}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Częstotliwość
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.frequency}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    Czas trwania
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {prescription.duration}
                                  </p>
                                </div>
                                {prescription.instructions && (
                                  <div>
                                    <p className="text-sm font-medium">
                                      Instrukcje
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {prescription.instructions}
                                    </p>
                                  </div>
                                )}
                                {prescription.description && (
                                  <div className="md:col-span-4">
                                    <p className="text-sm font-medium">Opis</p>
                                    <p className="text-sm text-gray-600">
                                      {prescription.description}
                                    </p>
                                  </div>
                                )}
                                {prescription.fulfilledAt && (
                                  <div>
                                    <p className="text-sm font-medium">
                                      Zrealizowano
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {new Date(
                                        prescription.fulfilledAt,
                                      ).toLocaleDateString("pl-PL")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <p className="text-gray-500">
                              Brak zarchiwizowanych recept.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
