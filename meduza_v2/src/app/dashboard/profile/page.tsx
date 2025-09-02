"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  User,
  Shield,
  Camera,
  Save,
  Edit,
  Phone,
  Mail,
  Calendar,
  Heart,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

const profileSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodType: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [allergies, setAllergies] = useState(user?.allergies || []);
  const [newAllergy, setNewAllergy] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: user?.gender || undefined,
      bloodType: user?.bloodType || "",
    },
  });

  // Use real emergency contact data or show empty state
  const emergencyContact = user?.emergencyContact || null;

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Persist to API
      const token = useAuthStore.getState().token;
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, allergies }),
      });
      if (!response.ok) throw new Error("Update failed");
      const res = await response.json();
      if (res?.user) {
        useAuthStore.getState().updateUser(res.user);
      }
      toast.success("Profil został zaktualizowany!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Błąd podczas aktualizacji profilu");
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
      toast.success("Dodano nową alergię");
    }
  };

  const removeAllergy = (allergyToRemove: string) => {
    setAllergies(allergies.filter((allergy) => allergy !== allergyToRemove));
    toast.success("Usunięto alergię");
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const token = useAuthStore.getState().token;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const json = await res.json();
      if (json?.url) {
        useAuthStore.getState().updateUser({ avatar: json.url });
        toast.success("Zaktualizowano zdjęcie profilowe");
      }
    } catch (err) {
      toast.error("Nie udało się przesłać zdjęcia");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Mój profil</h1>
            </div>

            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Anuluj" : "Edytuj"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Dane osobowe
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Informacje medyczne
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Bezpieczeństwo
            </TabsTrigger>
          </TabsList>

          {/* Dane osobowe */}
          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Zdjęcie profilowe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Zdjęcie profilowe
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="h-32 w-32 mx-auto mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarClick}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Zmień zdjęcie
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Formularz danych osobowych */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Informacje podstawowe</CardTitle>
                    <CardDescription>
                      Twoje podstawowe dane osobowe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Imię</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nazwisko</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefon</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!isEditing} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data urodzenia</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    {...field}
                                    disabled={!isEditing}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Płeć</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  disabled={!isEditing}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Wybierz płeć" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">
                                      Mężczyzna
                                    </SelectItem>
                                    <SelectItem value="female">
                                      Kobieta
                                    </SelectItem>
                                    <SelectItem value="other">Inna</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="bloodType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grupa krwi</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="np. A+"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isEditing && (
                          <div className="flex space-x-2">
                            <Button type="submit">
                              <Save className="h-4 w-4 mr-2" />
                              Zapisz zmiany
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                            >
                              Anuluj
                            </Button>
                          </div>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Informacje medyczne */}
          <TabsContent value="medical">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Podstawowe info medyczne */}
              <Card>
                <CardHeader>
                  <CardTitle>Informacje medyczne</CardTitle>
                  <CardDescription>
                    Podstawowe dane dotyczące Twojego zdrowia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Grupa krwi</Label>
                    <Badge variant="outline">A+</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label>Wzrost</Label>
                    <span className="text-sm">175 cm</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <Label>Waga</Label>
                    <span className="text-sm">70 kg</span>
                  </div>
                </CardContent>
              </Card>

              {/* Alergie */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Alergie
                  </CardTitle>
                  <CardDescription>
                    Lista Twoich alergii i nietolerancji
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allergies.map((allergy, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <Badge variant="destructive">{allergy}</Badge>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAllergy(allergy)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Dodaj nową alergię"
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                        />
                        <Button size="sm" onClick={addAllergy}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Kontakt awaryjny */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Kontakt awaryjny</CardTitle>
                  <CardDescription>
                    Osoba do kontaktu w sytuacji awaryjnej
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {emergencyContact ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Imię i nazwisko</Label>
                        <p className="font-medium">{emergencyContact.name}</p>
                      </div>
                      <div>
                        <Label>Telefon</Label>
                        <p className="font-medium">{emergencyContact.phone}</p>
                      </div>
                      <div>
                        <Label>Relacja</Label>
                        <p className="font-medium">
                          {emergencyContact.relationship}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Phone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">
                        Brak kontaktu awaryjnego
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Dodaj osobę kontaktową na wypadek sytuacji awaryjnej
                      </p>
                    </div>
                  )}
                  {isEditing && (
                    <Button variant="outline" className="mt-4">
                      {emergencyContact
                        ? "Edytuj kontakt awaryjny"
                        : "Dodaj kontakt awaryjny"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bezpieczeństwo */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zmiana hasła</CardTitle>
                  <CardDescription>
                    Zaktualizuj swoje hasło dostępu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Obecne hasło</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Nowe hasło</Label>
                    <Input type="password" />
                  </div>
                  <div>
                    <Label>Potwierdź nowe hasło</Label>
                    <Input type="password" />
                  </div>
                  <Button>Zmień hasło</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ustawienia prywatności</CardTitle>
                  <CardDescription>
                    Kontroluj dostęp do swoich danych
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Profil publiczny</Label>
                    <Button variant="outline" size="sm">
                      Włącz
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Powiadomienia email</Label>
                    <Button variant="outline" size="sm">
                      Włącz
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Powiadomienia SMS</Label>
                    <Button variant="outline" size="sm">
                      Wyłącz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
