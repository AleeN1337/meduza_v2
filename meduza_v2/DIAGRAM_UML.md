# Diagram UML - System Meduza v2

## Diagram 1: Przypadki użycia dla Gościa

```mermaid
graph LR
    Guest((Gość))
    
    subgraph System["System Meduza v2 - Funkcje Gościa"]
        UC1[Rejestracja]
        UC2[Logowanie]
    end
    
    Guest --> UC1
    Guest --> UC2
    
    style Guest fill:#ff9999,stroke:#333,stroke-width:3px
```

## Diagram 2: Przypadki użycia dla Pacjenta

```mermaid
graph LR
    Patient((Pacjent))
    
    subgraph System["System Meduza v2 - Panel Pacjenta"]
        
        subgraph Profile["Zarządzanie Profilem"]
            UC1[Edycja profilu]
            UC2[Zmiana hasła]
        end
        
        subgraph Appointments["Wizyty"]
            UC3[Umówienie wizyty]
            UC4[Przeglądanie wizyt]
            UC5[Anulowanie wizyty]
        end
        
        subgraph Medical["Dokumentacja"]
            UC6[Historia medyczna]
            UC7[Recepty]
            UC8[Wyniki badań]
        end
        
        UC9[Powiadomienia]
        UC10[Wylogowanie]
        
    end
    
    Patient --> Profile
    Patient --> Appointments
    Patient --> Medical
    Patient --> UC9
    Patient --> UC10
    
    style Patient fill:#99ccff,stroke:#333,stroke-width:3px
```

## Diagram 3: Przypadki użycia dla Lekarza

```mermaid
graph LR
    Doctor((Lekarz))
    
    subgraph System["System Meduza v2 - Panel Lekarza"]
        
        subgraph Profile["Profil"]
            UC1[Edycja profilu]
            UC2[Zmiana hasła]
        end
        
        subgraph Schedule["Harmonogram"]
            UC3[Dostępność]
            UC4[Wizyty]
        end
        
        subgraph Patients["Pacjenci"]
            UC5[Lista pacjentów]
            UC6[Historia pacjenta]
        end
        
        subgraph Documentation["Dokumentacja"]
            UC7[Dokumentacja medyczna]
            UC8[Recepty]
            UC9[Wyniki badań]
        end
        
        UC10[Powiadomienia]
        UC11[Wylogowanie]
        
    end
    
    Doctor --> Profile
    Doctor --> Schedule
    Doctor --> Patients
    Doctor --> Documentation
    Doctor --> UC10
    Doctor --> UC11
    
    style Doctor fill:#99ff99,stroke:#333,stroke-width:3px
```

## Legenda

### Aktorzy:
- **Gość** - Niezalogowany użytkownik (może się rejestrować i logować)
- **Pacjent** - Zalogowany użytkownik z rolą "patient"
- **Lekarz** - Zalogowany użytkownik z rolą "doctor"

### Moduły systemu:

#### 1. Moduł Autoryzacji
- Rejestracja nowych użytkowników
- Logowanie do systemu
- Wylogowanie z systemu

#### 2. Zarządzanie Profilem
- Przeglądanie i edycja danych osobowych
- Zmiana hasła
- Upload avatara
- Uzupełnianie danych medycznych (dla pacjentów)

#### 3. Funkcje Pacjenta
- Przeglądanie dostępnych lekarzy i specjalizacji
- Rezerwacja wizyt lekarskich
- Przeglądanie nadchodzących i historycznych wizyt
- Anulowanie zarezerwowanych wizyt
- Dostęp do dokumentacji medycznej, recept i wyników badań

#### 4. Funkcje Lekarza
- Ustawianie dostępności (godziny pracy)
- Zarządzanie listą pacjentów
- Przeglądanie i zarządzanie wizytami
- Tworzenie dokumentacji medycznej po wizycie
- Wystawianie recept i dodawanie wyników badań
- Dostęp do pełnej historii medycznej pacjenta

#### 5. System Powiadomień
- Powiadomienia o nowych wizytach, anulacjach, receptach itp.
- Zarządzanie ustawieniami powiadomień

### Relacje między przypadkami użycia:
- **include** - przypadek użycia zawsze wymaga innego (np. umówienie wizyty wymaga wyboru lekarza)
- **extend** - przypadek użycia opcjonalnie rozszerza inny (np. historia medyczna może zawierać recepty)

---

**Źródło**: Opracowanie własne na podstawie struktury systemu Meduza v2
