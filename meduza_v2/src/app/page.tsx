import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Heart,
  Shield,
  MessageCircle,
  FileText,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">MEDuza</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Funkcje
            </Link>
            <Link
              href="#about"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              O nas
            </Link>
            <Link
              href="#contact"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Kontakt
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Zaloguj się
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Zarejestruj się</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Nowa era w zarządzaniu zdrowiem
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Kompleksowy system zarządzania
            <span className="text-blue-600"> opieką medyczną</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Bezpieczna platforma łącząca pacjentów z lekarzami. Umów wizytę,
            zarządzaj kartami medycznymi i komunikuj się z zespołem medycznym w
            jednym miejscu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="min-w-48">
                Rozpocznij teraz
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="min-w-48">
                Poznaj funkcje
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nasza platforma oferuje kompletny zestaw narzędzi do zarządzania
              zdrowiem i komunikacji między pacjentami a lekarzami.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Umów wizytę</CardTitle>
                <CardDescription>
                  Łatwe umawianie wizyt z dostępnymi terminami w czasie
                  rzeczywistym
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Dostępność w czasie rzeczywistym</li>
                  <li>• Powiadomienia o wizytach</li>
                  <li>• Możliwość zmiany terminu</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Karty medyczne</CardTitle>
                <CardDescription>
                  Bezpieczne przechowywanie i zarządzanie dokumentacją medyczną
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Cyfrowe karty pacjenta</li>
                  <li>• Historia chorób</li>
                  <li>• Recepty elektroniczne</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Komunikacja</CardTitle>
                <CardDescription>
                  Bezpieczny chat z lekarzami i zespołem medycznym
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Chat w czasie rzeczywistym</li>
                  <li>• Bezpieczne przesyłanie plików</li>
                  <li>• Historia konwersacji</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Bezpieczeństwo</CardTitle>
                <CardDescription>
                  Najwyższe standardy ochrony danych medycznych
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Szyfrowanie end-to-end</li>
                  <li>• Zgodność z RODO</li>
                  <li>• Bezpieczne logowanie</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Panel lekarza</CardTitle>
                <CardDescription>
                  Zaawansowane narzędzia dla personelu medycznego
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Zarządzanie pacjentami</li>
                  <li>• Kalendarz wizyt</li>
                  <li>• Tworzenie recept</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Dostępność 24/7</CardTitle>
                <CardDescription>
                  Dostęp do systemu o każdej porze dnia i nocy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Aplikacja mobilna</li>
                  <li>• Panel webowy</li>
                  <li>• Wsparcie techniczne</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Zaufali nam</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Tysiące pacjentów i setek lekarzy korzysta z naszej platformy
              codziennie
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-blue-100">Pacjentów</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Lekarzy</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Wizyt</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-blue-100 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-current" />
                Ocena
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Gotowy na cyfrową przyszłość zdrowia?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Dołącz do tysięcy pacjentów i lekarzy, którzy już korzystają z
              naszej platformy. Zarejestruj się za darmo i zacznij zarządzać
              swoim zdrowiem w inteligentny sposób.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="min-w-48">
                  Zarejestruj się bezpłatnie
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="min-w-48">
                  Mam już konto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">MEDuza</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nowoczesna platforma do zarządzania opieką medyczną. Bezpieczna,
                niezawodna i łatwa w użyciu.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platforma</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Dla pacjentów
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Dla lekarzy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Dla placówek
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Wsparcie</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Centrum pomocy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Firma</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    O nas
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Polityka prywatności
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Regulamin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MEDuza. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
