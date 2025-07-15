# 🩺 MEDuza - System Zarządzania Zdrowiem

![MEDuza Logo](https://img.shields.io/badge/MEDuza-Healthcare%20Management-blue?style=for-the-badge&logo=heart)

> Nowoczesny system zarządzania zdrowiem łączący pacjentów z lekarzami w jednej platformie

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4+-cyan?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Spis treści

- [🎯 O projekcie](#-o-projekcie)
- [✨ Funkcjonalności](#-funkcjonalności)
- [🏗️ Technologie](#️-technologie)
- [🚀 Instalacja](#-instalacja)
- [⚙️ Konfiguracja](#️-konfiguracja)
- [🖥️ Uruchomienie](#️-uruchomienie)
- [👥 Role użytkowników](#-role-użytkowników)
- [🏛️ Architektura](#️-architektura)
- [🔒 Bezpieczeństwo](#-bezpieczeństwo)
- [🤝 Współpraca](#-współpraca)

---

## 🎯 O projekcie

**MEDuza** to kompleksowy system zarządzania zdrowiem, który usprawnia komunikację między pacjentami a lekarzami. Aplikacja oferuje intuicyjny interfejs dla dwóch głównych grup użytkowników: pacjentów i lekarzy, zapewniając bezpieczną i efektywną wymianę informacji medycznych.

### 🎪 Demo

� **[Wersja demonstracyjna](http://localhost:3001)** (uruchom lokalnie)

### 🎯 Cel projektu

- Digitalizacja procesów medycznych
- Poprawa komunikacji pacjent-lekarz
- Centralizacja dokumentacji medycznej
- Usprawnienie zarządzania wizytami
- Bezpieczne przechowywanie danych zdrowotnych

---

## ✨ Funkcjonalności

### 👤 **Panel Pacjenta**

- 📅 **Rezerwacja wizyt** - Intuicyjny kalendarz z dostępnymi terminami
- 📋 **Historia medyczna** - Pełna dokumentacja wizyt, diagnoz i badań
- 💊 **Zarządzanie receptami** - Przegląd aktywnych i zrealizowanych recept
- 📁 **Pliki medyczne** - Upload i zarządzanie dokumentami (RTG, EKG, USG)
- 👤 **Profil użytkownika** - Edycja danych osobowych i preferencji
- 🚨 **Informacje o alergiach** - Zarządzanie przeciwwskazaniami
- 💬 **Komunikacja z lekarzem** - Bezpieczna wymiana wiadomości

### 🩺 **Panel Lekarza**

- 📊 **Dashboard** - Przegląd dzisiejszych wizyt i statystyk
- 👥 **Zarządzanie pacjentami** - Lista, wyszukiwanie i szczegóły pacjentów
- 📅 **Kalendarz wizyt** - Harmonogram z możliwością edycji
- 💊 **Wystawianie recept** - Elektroniczny system receptur
- 📋 **Dokumentacja wizyt** - Tworzenie i edycja zapisów medycznych
- 🏥 **Profil zawodowy** - Specjalizacje, certyfikaty, doświadczenie
- ⏰ **Harmonogram pracy** - Ustalanie dostępności
- 💰 **Cennik usług** - Zarządzanie kosztami konsultacji
- 📈 **Statystyki praktyki** - Raporty i analizy

### 🔒 **Bezpieczeństwo**

- 🛡️ **Uwierzytelnianie JWT** - Bezpieczne sesje użytkowników
- 🔐 **Hashowanie haseł** - bcryptjs z salt rounds
- 🛣️ **Role-based routing** - Automatyczne przekierowania
- 🍪 **Zarządzanie cookies** - Persistent authentication
- ⚡ **Middleware protection** - Ochrona tras przed nieautoryzowanym dostępem

---

## 🏗️ Technologie

### **Frontend**

- **[Next.js 15.3.5](https://nextjs.org/)** - React framework z App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Shadcn/ui](https://ui.shadcn.com/)** - Komponenty UI
- **[Radix UI](https://www.radix-ui.com/)** - Headless components
- **[React Hook Form](https://react-hook-form.com/)** - Formularze
- **[Zod](https://zod.dev/)** - Walidacja schematów
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Lucide React](https://lucide.dev/)** - Ikony

### **Backend**

- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - ODM dla MongoDB
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js/)** - Hashowanie haseł
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT tokens

### **DevOps & Tools**

- **[ESLint](https://eslint.org/)** - Linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Turbopack](https://turbo.build/pack)** - Fast bundling

---

## 🚀 Instalacja

### Wymagania systemowe

- **Node.js** 18.17+
- **MongoDB** 7.0+
- **npm** lub **yarn**

### 1. Klonowanie repozytorium

```bash
git clone https://github.com/AleeN1337/meduza_v2.git
cd meduza_v2
```

### 2. Instalacja zależności

```bash
npm install
# lub
yarn install
```

---

## ⚙️ Konfiguracja

### 1. Zmienne środowiskowe

Utwórz plik `.env.local` w głównym katalogu:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/MEDuza_v2

# JWT Secret (wygeneruj bezpieczny klucz)
JWT_SECRET=your_super_secret_jwt_key_here

# App URL
NEXTAUTH_URL=http://localhost:3001

# Email (opcjonalne - dla powiadomień)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# File upload (opcjonalne)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. MongoDB

Upewnij się, że MongoDB jest uruchomione:

```bash
# Windows (jeśli zainstalowane jako serwis)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Lub uruchom ręcznie
mongod --dbpath /path/to/your/data/directory
```

---

## 🖥️ Uruchomienie

### Development mode

```bash
npm run dev
# lub
yarn dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3001**

### Production build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 👥 Role użytkowników

### 🏥 **Rejestracja Lekarza**

1. Przejdź na `/register`
2. Wybierz zakładkę **"Lekarz"**
3. Wypełnij formularz:
   - Dane osobowe
   - **Specjalizacja**
   - **Numer licencji**
4. Po rejestracji zostaniesz przekierowany do `/doctor/dashboard`

### 👤 **Rejestracja Pacjenta**

1. Przejdź na `/register`
2. Wybierz zakładkę **"Pacjent"**
3. Wypełnij podstawowe dane
4. Po rejestracji zostaniesz przekierowany do `/dashboard`

### 🔐 **Logowanie**

Po utworzeniu konta, zaloguj się na `/login`. System automatycznie przekieruje Cię do odpowiedniego panelu na podstawie roli.

---

## 🏛️ Architektura

## 🔒 Bezpieczeństwo

### 🛡️ Implementowane zabezpieczenia

- **JWT Authentication** - Bezpieczne tokeny sesji
- **Password Hashing** - bcryptjs z salt rounds 12
- **Route Protection** - Middleware sprawdzające autoryzację
- **Role-based Access** - Różne uprawnienia dla pacjentów i lekarzy
- **Input Validation** - Zod schemas dla wszystkich formularzy
- **CORS Protection** - Konfiguracja Next.js
- **SQL Injection Prevention** - Mongoose ODM
- **XSS Protection** - React auto-escaping

### 💡 Propozycje funkcji

1. Otwórz [Discussion](https://github.com/AleeN1337/meduza_v2/discussions)
2. Opisz proponowaną funkcję
3. Uzasadnij potrzebę

### 🚀 Planowane funkcje

#### v2.0

- [ ] 📧 System powiadomień email/SMS
- [ ] 💬 Chat w czasie rzeczywistym (Socket.io)
- [ ] 📁 Upload plików medycznych (Cloudinary)
- [ ] 📊 Zaawansowane raporty i statystyki

#### v2.1

- [ ] 📱 Progressive Web App (PWA)
- [ ] 🌙 Dark mode
- [ ] 🌍 Internationalization (i18n)
- [ ] 🔍 Zaawansowane wyszukiwanie

#### v3.0

- [ ] 🤖 AI-powered recommendations
- [ ] 📱 Mobile app (React Native)
- [ ] 🔗 Integracja z systemami szpitalnymi
- [ ] 📈 Analytics dashboard

---

### 🎯 Postęp funkcji

- ✅ **Uwierzytelnianie i autoryzacja** - 100%
- ✅ **Panel pacjenta** - 100%
- ✅ **Panel lekarza** - 100%
- ✅ **System wizyt** - 90%
- ✅ **System recept** - 90%
- 🔄 **Upload plików** - 60%
- 🔄 **Powiadomienia** - 30%
- ⏳ **Chat real-time** - 0%
- ***

## 🏆 Autorzy

### 👨‍💻 **[AleeN1337](https://github.com/AleeN1337)**

_Lead Developer & Project Owner_

- 📧 **Email**: [aleen1337@gmail.com]

## 📄 Licencja

Ten projekt jest licencjonowany na podstawie licencji **MIT** - zobacz plik [LICENSE](LICENSE) po szczegóły.

```
MIT License

Copyright (c) 2025 AleeN1337

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🌟 Wsparcie

Jeśli projekt Ci się podoba, zostaw ⭐ na GitHubie!

## 📞 Kontakt

Masz pytania? Skontaktuj się ze mną!

- 📧 **Email**: aleen1337@gmail.com

Made with ❤️ in Poland | © 2025 MEDuza Team

</div>
