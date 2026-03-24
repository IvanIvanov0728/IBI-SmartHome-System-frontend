import { API_BASE_URL } from "@/lib/api-config";

// --- Interfaces ---

export interface UserProfile {
  userName: string;
  email: string;
  userRole: string;
}

export interface UserSettings {
  receiveNotifications: boolean;
  darkModeEnabled: boolean;
}

// --- API Calls ---

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/Settings/profile`, {
    method: "GET",
    credentials: "include",
    headers: { "Accept": "application/json" },
  });

  if (response.status === 401) throw new Error("Unauthorized");
  
  if (!response.ok) throw new Error("Failed to fetch profile");
  
  return response.json();
};

export const updateUserProfile = async (profile: UserProfile): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/Settings/profile`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) throw new Error("Failed to update profile");
};

export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await fetch(`${API_BASE_URL}/api/Settings/user-settings`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
};

export const updateUserSettings = async (settings: UserSettings): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/Settings/user-settings`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) throw new Error("Failed to update settings");
};