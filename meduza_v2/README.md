# MedCare - System Zarządzania Służbą Zdrowia

Nowoczesna platforma do zarządzania wizytami lekarskimi, historią medyczną i komunikacją między pacjentami a lekarzami.

## 🏥 Funkcjonalności

### Dla Pacjentów

- ✅ Rejestracja i logowanie
- ✅ Rezerwacja wizyt online
- ✅ Przeglądanie historii medycznej
- ✅ Komunikacja z lekarzami (chat)
- ✅ Zarządzanie receptami elektronicznymi
- ✅ Upload dokumentów medycznych
- ✅ Powiadomienia o wizytach

### Dla Lekarzy

- ✅ Panel zarządzania pacjentami
- ✅ Kalendarz wizyt
- ✅ Tworzenie dokumentacji medycznej
- ✅ Wystawianie recept elektronicznych
- ✅ Komunikacja z pacjentami
- ✅ Analiza statystyk

## 🛠️ Technologie

### Frontend

- **Next.js 14** - React framework z App Router
- **TypeScript** - Statyczne typowanie
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Komponenty UI wysokiej jakości
- **React Hook Form** - Zarządzanie formularzami
- **Zustand** - Zarządzanie stanem aplikacji

### Backend

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework webowy (dla API)
- **MongoDB** - Baza danych NoSQL
- **Mongoose** - ODM dla MongoDB
- **JWT** - Autoryzacja i uwierzytelnianie
- **Bcrypt** - Hashowanie haseł

### Dodatkowe

- **Socket.io** - Komunikacja w czasie rzeczywistym
- **Nodemailer** - Wysyłanie emaili
- **Cloudinary** - Przechowywanie plików

## 🚀 Szybki Start

### Wymagania

- Node.js 18.0 lub nowszy
- MongoDB 5.0 lub nowszy
- npm

### Instalacja

1. **Zainstaluj zależności**

   ```bash
   npm install
   ```

2. **Skonfiguruj zmienne środowiskowe**

   Wypełnij plik `.env.local`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/healthcare_management
   JWT_SECRET=twoj_super_tajny_klucz_jwt
   CLOUDINARY_CLOUD_NAME=twoja_cloudinary_nazwa
   CLOUDINARY_API_KEY=twoj_api_key
   CLOUDINARY_API_SECRET=twoj_api_secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=twoj_email@gmail.com
   EMAIL_PASS=twoje_haslo_aplikacji
   ```

3. **Uruchom aplikację**

   ```bash
   npm run dev
   ```

4. **Otwórz aplikację**

   Aplikacja będzie dostępna pod adresem: http://localhost:3000

## 👥 Demo Konta

- **Pacjent**: `pacjent@demo.com` / `demo123`
- **Lekarz**: `lekarz@demo.com` / `demo123`
- **Admin**: `admin@demo.com` / `demo123`

---

Zbudowane z ❤️ przez zespół MedCare
