import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;

  // Common fields
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";

  // Doctor specific fields
  specialization?: string;
  licenseNumber?: string;
  workplace?: string;
  address?: string;
  bio?: string;
  languages?: string[];
  education?: Array<{
    id: number;
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  experience?: Array<{
    id: number;
    position: string;
    institution: string;
    period: string;
    description: string;
  }>;
  certifications?: Array<{
    id: number;
    name: string;
    issuer: string;
    year: string;
    valid: string;
  }>;
  availableHours?: {
    [key: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  consultationFee?: number;

  // Patient specific fields
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Auth store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
              throw new Error("Login failed");
            }

            const data = await response.json();

            set({
              user: data.user,
              token: data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          // Clear the role cookie
          if (typeof document !== "undefined") {
            document.cookie =
              "auth-role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          }
        },

        setUser: (user: User) => {
          set({ user });
        },

        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } });
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes?: string;
  type: "consultation" | "follow-up" | "emergency" | "routine";
}

// Appointments store
interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  fetchAppointments: () => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>()(
  devtools((set, get) => ({
    appointments: [],
    isLoading: false,

    fetchAppointments: async () => {
      set({ isLoading: true });
      try {
        const { token } = useAuthStore.getState();
        const response = await fetch("/api/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const appointments = await response.json();
        set({ appointments, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    addAppointment: async (appointmentData) => {
      const { token } = useAuthStore.getState();
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      const newAppointment = await response.json();
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
      }));
    },

    updateAppointment: async (id, updates) => {
      const { token } = useAuthStore.getState();
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }

      const updatedAppointment = await response.json();
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? updatedAppointment : apt
        ),
      }));
    },

    cancelAppointment: async (id) => {
      await get().updateAppointment(id, { status: "cancelled" });
    },
  }))
);
