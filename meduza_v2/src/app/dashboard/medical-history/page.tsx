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
  AlertTriangle,
  Heart,
  Activity,
} from "lucide-react";

export default function MedicalHistoryPage() {
  const router = useRouter();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Mock data - historia medyczna
  const medicalRecords = [
    {
      id: 1,
      date: "2025-07-10",
      doctorName: "Dr. Anna Kowalska",
      specialty: "Kardiolog",
      diagnosis: "Nadciśnienie tętnicze",
      symptoms: ["Bóle głowy", "Zawroty głowy", "Uczucie zmęczenia"],
      treatment: "Terapia farmakologiczna, modyfikacja stylu życia",
      prescription: [
        { name: "Amlodipine", dosage: "5mg", frequency: "1x dziennie" },
        { name: "Metoprolol", dosage: "50mg", frequency: "2x dziennie" }
      ],
      notes: "Kontrola za 3 miesiące, monitorowanie ciśnienia w domu",
      type: "consultation"
    },
    {
      id: 2,
      date: "2025-07-05",
      doctorName: "Dr. Piotr Nowak",
      specialty: "Dermatolog",
      diagnosis: "Łojotokowe zapalenie skóry",
      symptoms: ["Swędzenie skóry", "Zaczerwienienia", "Łuszczenie"],
      treatment: "Leczenie miejscowe, unikanie alergenów",
      prescription: [
        { name: "Krem z kortykosteroidami", dosage: "2x dziennie", frequency: "przez 2 tygodnie" }
      ],
      notes: "Unikać mydła z SLS, używać kosmetyków hipoalergicznych",
      type: "follow-up"
    }
  ];

  const labResults = [
    {
      id: 1,
      date: "2025-07-10",
      testName: "Morfologia krwi",
      results: [
        { parameter: "Hemoglobina", value: "14.2 g/dL", range: "12.0-15.5 g/dL", status: "normal" },
        { parameter: "Leukocyty", value: "6.8 tys/μL", range: "4.0-10.0 tys/μL", status: "normal" },
        { parameter: "Płytki krwi", value: "280 tys/μL", range: "150-450 tys/μL", status: "normal" }
      ],
      doctorName: "Dr. Anna Kowalska",
      status: "completed"
    },
    {
      id: 2,
      date: "2025-07-08",
      testName: "Profil lipidowy",
      results: [
        { parameter: "Cholesterol całkowity", value: "240 mg/dL", range: "<200 mg/dL", status: "high" },
        { parameter: "LDL", value: "160 mg/dL", range: "<100 mg/dL", status: "high" },
        { parameter: "HDL", value: "45 mg/dL", range: ">40 mg/dL", status: "normal" },
        { parameter: "Triglicerydy", value: "180 mg/dL", range: "<150 mg/dL", status: "high" }
      ],
      doctorName: "Dr. Anna Kowalska",
      status: "completed"
    }
  ];

  const prescriptions = [
    {
      id: 1,
      medicationName: "Amlodipine",
      dosage: "5mg",
      frequency: "1x dziennie rano",
      duration: "3 miesiące",
      prescribedBy: "Dr. Anna Kowalska",
      prescribedDate: "2025-07-10",
      status: "active",
      remaining: 15,
      instructions: "Przyjmować z posiłkiem, monitorować ciśnienie"
    },
    {
      id: 2,
      medicationName: "Metoprolol",
      dosage: "50mg",
      frequency: "2x dziennie",
      duration: "3 miesiące",
      prescribedBy: "Dr. Anna Kowalska",
      prescribedDate: "2025-07-10",
      status: "active",
      remaining: 28,
      instructions: "Nie przerywać nagłe, kontrola tętna"
    },
    {
      id: 3,
      medicationName: "Krem z kortykosteroidami",
      dosage: "cienka warstwa",
      frequency: "2x dziennie",
      duration: "2 tygodnie",
      prescribedBy: "Dr. Piotr Nowak",
      prescribedDate: "2025-07-05",
      status: "completed",
      remaining: 0,
      instructions: "Stosować na oczyszczoną skórę, unikać okolic oczu"
    }
  ];

  const medicalFiles = [
    {
      id: 1,
      filename: "RTG_klatka_piersiowa_2025-06-15.pdf",
      type: "x-ray",
      uploadDate: "2025-06-15",
      description: "RTG klatki piersiowej - kontrolne",
      size: "2.3 MB"
    },
    {
      id: 2,
      filename: "EKG_2025-07-10.pdf",
      type: "document",
      uploadDate: "2025-07-10",
      description: "Elektrokardiogram spoczynkowy",
      size: "1.1 MB"
    },
    {
      id: 3,
      filename: "USG_brzucha_2025-06-20.pdf",
      type: "image",
      uploadDate: "2025-06-20",
      description: "USG jamy brzusznej",
      size: "3.7 MB"
    }
  ];

  const allergies = ["Penicylina", "Pyłki traw", "Orzechy laskowe"];
  const chronicConditions = ["Nadciśnienie tętnicze", "Hipercholesterolemia"];

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
            <h1 className="text-2xl font-bold text-gray-900">Historia medyczna</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
              <div className="space-y-2">
                {allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="mr-2">
                    {allergy}
                  </Badge>
                ))}
              </div>
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
              <div className="space-y-2">
                {chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {condition}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Główne zakładki */}
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="records" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Wizyty
            </TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Badania
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center">
              <Pill className="h-4 w-4 mr-2" />
              Recepty
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Pliki
            </TabsTrigger>
          </TabsList>

          {/* Zakładka Wizyty */}
          <TabsContent value="records">
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <Card key={record.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {record.date}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {record.doctorName} - {record.specialty}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant={record.type === "consultation" ? "default" : "secondary"}>
                        {record.type === "consultation" ? "Konsultacja" : "Kontrola"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Objawy:</h4>
                        <div className="flex flex-wrap gap-1">
                          {record.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-1">Leczenie:</h4>
                        <p className="text-sm text-gray-600">{record.treatment}</p>
                      </div>

                      {record.prescription.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Przepisane leki:</h4>
                          <div className="space-y-1">
                            {record.prescription.map((med, index) => (
                              <p key={index} className="text-sm text-gray-600">
                                {med.name} {med.dosage} - {med.frequency}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          Uwagi: {record.notes}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Szczegóły
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{record.diagnosis}</DialogTitle>
                              <DialogDescription>
                                Szczegóły wizyty z dnia {record.date}
                              </DialogDescription>
                            </DialogHeader>
                            {/* Tutaj szczegółowy widok */}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Zakładka Badania */}
          <TabsContent value="labs">
            <div className="space-y-4">
              {labResults.map((lab) => (
                <Card key={lab.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{lab.testName}</CardTitle>
                        <CardDescription>
                          {lab.date} - {lab.doctorName}
                        </CardDescription>
                      </div>
                      <Badge variant="default">
                        Zakończone
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lab.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{result.parameter}</p>
                            <p className="text-xs text-gray-500">Norma: {result.range}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{result.value}</p>
                            <Badge 
                              variant={result.status === "normal" ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {result.status === "normal" ? "Norma" : "Podwyższony"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Zakładka Recepty */}
          <TabsContent value="prescriptions">
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{prescription.medicationName}</CardTitle>
                        <CardDescription>
                          Przepisane przez {prescription.prescribedBy} - {prescription.prescribedDate}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={prescription.status === "active" ? "default" : "secondary"}
                      >
                        {prescription.status === "active" ? "Aktywne" : "Zakończone"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Dawka</p>
                        <p className="text-sm text-gray-600">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Częstotliwość</p>
                        <p className="text-sm text-gray-600">{prescription.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Czas trwania</p>
                        <p className="text-sm text-gray-600">{prescription.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pozostało</p>
                        <p className="text-sm text-gray-600">
                          {prescription.remaining} {prescription.remaining === 0 ? "" : "tabletek"}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm font-medium mb-1">Instrukcje:</p>
                      <p className="text-sm text-gray-700">{prescription.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Zakładka Pliki */}
          <TabsContent value="files">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicalFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-blue-600" />
                      {file.type === "x-ray" ? "RTG" : file.type === "document" ? "Dokument" : "Obraz"}
                    </CardTitle>
                    <CardDescription>{file.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{file.filename}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{file.uploadDate}</span>
                        <span>{file.size}</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Podgląd
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-1" />
                          Pobierz
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
