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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Pill,
  Plus,
  Search,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer,
  Send,
  Eye,
} from "lucide-react";

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"new" | "issued">("new");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  // Mock data - pacjenci
  const patients = [
    { id: "1", name: "Jan Kowalski", pesel: "80051512345" },
    { id: "2", name: "Anna Nowak", pesel: "75120398765" },
    { id: "3", name: "Piotr Wiśniewski", pesel: "65082265432" },
    { id: "4", name: "Maria Zielińska", pesel: "90031087654" },
  ];

  // Mock data - popularne leki
  const popularMedications = [
    "Amlodipine 5mg",
    "Metoprolol 50mg",
    "Lisinopril 10mg",
    "Simvastatin 20mg",
    "Aspirin 75mg",
    "Metformin 500mg",
    "Atorvastatin 20mg",
    "Ramipril 5mg",
  ];

  // Mock data - wydane recepty
  const issuedPrescriptions = [
    {
      id: 1,
      patientName: "Jan Kowalski",
      patientPesel: "80051512345",
      date: "2025-07-12",
      status: "active",
      medications: [
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "1x dziennie",
          duration: "3 miesiące",
          instructions: "Przyjmować rano z posiłkiem",
        },
        {
          name: "Metoprolol",
          dosage: "50mg",
          frequency: "2x dziennie",
          duration: "3 miesiące",
          instructions: "Nie przerywać nagłe",
        },
      ],
      diagnosis: "Nadciśnienie tętnicze",
      validUntil: "2025-10-12",
    },
    {
      id: 2,
      patientName: "Anna Nowak",
      patientPesel: "75120398765",
      date: "2025-07-10",
      status: "used",
      medications: [
        {
          name: "Krem z kortykosteroidami",
          dosage: "cienka warstwa",
          frequency: "2x dziennie",
          duration: "2 tygodnie",
          instructions: "Stosować na oczyszczoną skórę",
        },
      ],
      diagnosis: "Łojotokowe zapalenie skóry",
      validUntil: "2025-08-10",
    },
  ];

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: medications.length + 1,
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedication = (id: number) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  const updateMedication = (id: number, field: string, value: string) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const handleIssuePrescription = () => {
    // Tutaj logika wystawienia recepty
    console.log("Issuing prescription", { selectedPatient, medications });
    alert("Recepta została wystawiona pomyślnie!");
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
              <h1 className="text-2xl font-bold text-gray-900">Recepty</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "new" ? "default" : "outline"}
                onClick={() => setActiveTab("new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nowa recepta
              </Button>
              <Button
                variant={activeTab === "issued" ? "default" : "outline"}
                onClick={() => setActiveTab("issued")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Wydane recepty
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {activeTab === "new" && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-green-600" />
                  Wystaw nową receptę
                </CardTitle>
                <CardDescription>
                  Wypełnij wszystkie pola, aby wystawić receptę dla pacjenta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Wybierz pacjenta</Label>
                  <Select onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wyszukaj i wybierz pacjenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - PESEL: {patient.pesel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Rozpoznanie</Label>
                    <Input id="diagnosis" placeholder="Wpisz rozpoznanie..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Ważność recepty</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      defaultValue="2025-10-12"
                    />
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Przepisane leki</h3>
                    <Button onClick={addMedication} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj lek
                    </Button>
                  </div>

                  {medications.map((medication, index) => (
                    <Card key={medication.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Lek #{index + 1}</h4>
                          {medications.length > 1 && (
                            <Button
                              onClick={() => removeMedication(medication.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              Usuń
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nazwa leku</Label>
                            <Select
                              onValueChange={(value) =>
                                updateMedication(medication.id, "name", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz lub wpisz lek" />
                              </SelectTrigger>
                              <SelectContent>
                                {popularMedications.map((med) => (
                                  <SelectItem key={med} value={med}>
                                    {med}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Dawka</Label>
                            <Input
                              placeholder="np. 5mg, 1 tabletka"
                              value={medication.dosage}
                              onChange={(e) =>
                                updateMedication(
                                  medication.id,
                                  "dosage",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Częstotliwość</Label>
                            <Select
                              onValueChange={(value) =>
                                updateMedication(
                                  medication.id,
                                  "frequency",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz częstotliwość" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1x dziennie">
                                  1x dziennie
                                </SelectItem>
                                <SelectItem value="2x dziennie">
                                  2x dziennie
                                </SelectItem>
                                <SelectItem value="3x dziennie">
                                  3x dziennie
                                </SelectItem>
                                <SelectItem value="co 8 godzin">
                                  Co 8 godzin
                                </SelectItem>
                                <SelectItem value="co 12 godzin">
                                  Co 12 godzin
                                </SelectItem>
                                <SelectItem value="według potrzeb">
                                  Według potrzeb
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Czas trwania</Label>
                            <Select
                              onValueChange={(value) =>
                                updateMedication(
                                  medication.id,
                                  "duration",
                                  value
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz czas trwania" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1 tydzień">
                                  1 tydzień
                                </SelectItem>
                                <SelectItem value="2 tygodnie">
                                  2 tygodnie
                                </SelectItem>
                                <SelectItem value="1 miesiąc">
                                  1 miesiąc
                                </SelectItem>
                                <SelectItem value="3 miesiące">
                                  3 miesiące
                                </SelectItem>
                                <SelectItem value="6 miesięcy">
                                  6 miesięcy
                                </SelectItem>
                                <SelectItem value="na stałe">
                                  Na stałe
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Instrukcje specjalne</Label>
                          <textarea
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            placeholder="Dodatkowe instrukcje dla pacjenta..."
                            value={medication.instructions}
                            onChange={(e) =>
                              updateMedication(
                                medication.id,
                                "instructions",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button variant="outline">Zapisz jako szablon</Button>
                  <Button onClick={handleIssuePrescription}>
                    <FileText className="h-4 w-4 mr-2" />
                    Wystaw receptę
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "issued" && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input
                      placeholder="Szukaj po nazwisku pacjenta lub nazwie leku..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status recepty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="active">Aktywne</SelectItem>
                      <SelectItem value="used">Zrealizowane</SelectItem>
                      <SelectItem value="expired">Wygasłe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issued Prescriptions List */}
            <div className="space-y-4">
              {issuedPrescriptions.map((prescription) => (
                <Card
                  key={prescription.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {prescription.patientName}
                        </CardTitle>
                        <CardDescription>
                          PESEL: {prescription.patientPesel} • Wydano:{" "}
                          {prescription.date}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            prescription.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {prescription.status === "active"
                            ? "Aktywna"
                            : "Zrealizowana"}
                        </Badge>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Szczegóły recepty</DialogTitle>
                                <DialogDescription>
                                  Recepta dla {prescription.patientName} z dnia{" "}
                                  {prescription.date}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Rozpoznanie:
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {prescription.diagnosis}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Przepisane leki:
                                  </h4>
                                  <div className="space-y-2">
                                    {prescription.medications.map(
                                      (med, index) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-gray-50 rounded"
                                        >
                                          <div className="font-medium">
                                            {med.name} {med.dosage}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {med.frequency} • {med.duration}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {med.instructions}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                  Ważność recepty: {prescription.validUntil}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">
                          Rozpoznanie:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {prescription.diagnosis}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Leki:</h4>
                        <div className="space-y-1">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="text-sm text-gray-600">
                              {med.name} {med.dosage} - {med.frequency}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                        <span>Ważna do: {prescription.validUntil}</span>
                        <div className="flex items-center space-x-2">
                          {prescription.status === "active" ? (
                            <div className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                              <span>Aktywna</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 text-gray-600 mr-1" />
                              <span>Zrealizowana</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
