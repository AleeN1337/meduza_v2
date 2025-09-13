import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/types";

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
  calculateProfileCompletion: (user: User) => number;
}

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user: User): number => {
  if (user.role === "doctor") {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "specialization",
      "licenseNumber",
      "bio",
      "workplace",
      "address",
    ];
    const optionalFields = [
      "avatar",
      "education",
      "certifications",
      "languages",
      "availableHours",
      "consultationFee",
    ];

    let score = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    // Required fields (70% weight)
    const requiredScore = requiredFields.filter((field) => {
      const value = user[field as keyof User];
      if (Array.isArray(value)) return value.length > 0;
      return value && value.toString().trim() !== "";
    }).length;

    // Optional fields (30% weight)
    const optionalScore = optionalFields.filter((field) => {
      const value = user[field as keyof User];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null)
        return Object.keys(value).length > 0;
      return value && value.toString().trim() !== "";
    }).length;

    score = Math.round(
      (requiredScore / requiredFields.length) * 70 +
        (optionalScore / optionalFields.length) * 30
    );
    return Math.min(100, Math.max(0, score));
  } else if (user.role === "patient") {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
    ];
    const optionalFields = [
      "avatar",
      "bloodType",
      "allergies",
      "emergencyContact",
    ];

    let score = 0;
    const totalFields = requiredFields.length + optionalFields.length;

    const requiredScore = requiredFields.filter((field) => {
      const value = user[field as keyof User];
      return value && value.toString().trim() !== "";
    }).length;

    const optionalScore = optionalFields.filter((field) => {
      const value = user[field as keyof User];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null)
        return Object.keys(value).length > 0;
      return value && value.toString().trim() !== "";
    }).length;

    score = Math.round(
      (requiredScore / requiredFields.length) * 80 +
        (optionalScore / optionalFields.length) * 20
    );
    return Math.min(100, Math.max(0, score));
  }

  return 0;
};

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
            const updatedUser = { ...currentUser, ...userData };
            // Auto-update profile completion percentage
            updatedUser.profileCompletionPercentage =
              calculateProfileCompletion(updatedUser);
            updatedUser.lastProfileUpdate = new Date().toISOString();
            set({ user: updatedUser });
          }
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        calculateProfileCompletion: calculateProfileCompletion,
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

// Notification types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "prescription" | "lab-result" | "message" | "system";
  priority: "low" | "medium" | "high" | "urgent";
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
}

// Notifications store
interface NotificationState {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAsUnread: (notificationIds: string[]) => Promise<void>;
  deleteNotifications: (notificationIds: string[]) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
      set({ isLoading: true });
      try {
        const { token } = useAuthStore.getState();
        const response = await fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        set({
          notifications: data.notifications,
          unreadCount: data.unreadCount,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    markAsRead: async (notificationIds: string[]) => {
      try {
        const { token } = useAuthStore.getState();
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationIds,
            action: "markAsRead",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark notifications as read");
        }

        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
        }));
      } catch (error) {
        throw error;
      }
    },

    markAsUnread: async (notificationIds: string[]) => {
      try {
        const { token } = useAuthStore.getState();
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationIds,
            action: "markAsUnread",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark notifications as unread");
        }

        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: false }
              : notification
          ),
          unreadCount: state.unreadCount + notificationIds.length,
        }));
      } catch (error) {
        throw error;
      }
    },

    deleteNotifications: async (notificationIds: string[]) => {
      try {
        const { token } = useAuthStore.getState();
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notificationIds,
            action: "delete",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete notifications");
        }

        // Update local state
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => !notificationIds.includes(notification.id)
          ),
          unreadCount: Math.max(
            0,
            state.unreadCount -
              notificationIds.filter(
                (id) =>
                  state.notifications.find((n) => n.id === id)?.read === false
              ).length
          ),
        }));
      } catch (error) {
        throw error;
      }
    },
  }))
);
