"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProfileCompletionProps {
  user: {
    role: "patient" | "doctor" | "admin";
    profileCompletionPercentage?: number;
    firstName?: string;
    lastName?: string;
    specialization?: string;
    licenseNumber?: string;
    bio?: string;
    phone?: string;
    education?: any[];
    certifications?: any[];
    workplace?: string;
    availableHours?: any;
  };
  className?: string;
}

export function ProfileCompletion({ user, className }: ProfileCompletionProps) {
  const completion = user.profileCompletionPercentage || 0;
  const isCompleted = completion >= 80;

  const getMissingFields = () => {
    const missing: string[] = [];

    if (user.role === "doctor") {
      if (!user.specialization) missing.push("Specjalizacja");
      if (!user.licenseNumber) missing.push("Numer licencji");
      if (!user.bio) missing.push("Opis biograficzny");
      if (!user.phone) missing.push("Telefon");
      if (!user.workplace) missing.push("Miejsce pracy");
      if (!user.education?.length) missing.push("Wykształcenie");
      if (!user.certifications?.length) missing.push("Certyfikaty");
      if (!user.availableHours) missing.push("Godziny dostępności");
    } else if (user.role === "patient") {
      if (!user.phone) missing.push("Telefon");
    }

    return missing;
  };

  const missingFields = getMissingFields();
  const profileLink =
    user.role === "doctor" ? "/doctor/profile" : "/dashboard/profile";

  if (isCompleted) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Profil uzupełniony
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Progress value={completion} className="h-2 w-24" />
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {completion}%
              </Badge>
            </div>
            <Link href={profileLink}>
              <Button
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300"
              >
                Edytuj profil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-amber-200 bg-amber-50 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertCircle className="h-5 w-5" />
          Uzupełnij swój profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Progress value={completion} className="h-2 w-24" />
            <Badge
              variant="outline"
              className="border-amber-300 text-amber-800"
            >
              {completion}%
            </Badge>
          </div>
          <Link href={profileLink}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Uzupełnij
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-amber-700 font-medium">
              Brakujące informacje:
            </p>
            <div className="flex flex-wrap gap-1">
              {missingFields.slice(0, 4).map((field) => (
                <Badge
                  key={field}
                  variant="outline"
                  className="text-xs border-amber-300 text-amber-700"
                >
                  {field}
                </Badge>
              ))}
              {missingFields.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-300 text-amber-700"
                >
                  +{missingFields.length - 4} więcej
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
