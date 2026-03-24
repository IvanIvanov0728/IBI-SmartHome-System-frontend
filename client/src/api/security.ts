import { API_BASE_URL } from "@/lib/api-config";
// --- Interfaces ---

export interface EntryPoint {
  deviceId: number;
  name: string;
  isLocked: boolean;
  type: string; // "Door" or "Window"
  roomName: string;
}

export interface SecurityCamera {
  id: number;
  name: string;
  streamUrl: string;
  isLive: boolean;
}

export interface ActivityLogEntry {
  id: number;
  timestamp: string;
  event: string;
  type: string; // "info", "warning", "success"
}

export interface SecurityOverview {
  entryPoints: EntryPoint[];
  cameras: SecurityCamera[];
  activityLog: ActivityLogEntry[];
  isSystemArmed: boolean;
  systemStatusMessage: string;
}

// --- API Calls ---

/**
 * Fetches the complete security overview including locks, cameras, and logs.
 */
export const getSecurityOverview = async (): Promise<SecurityOverview> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Security/overview`, {
      method: "GET",
      credentials: "include", // Send Identity cookie
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      throw new Error("Unauthorized: Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Security API failed: ${response.status}`);
    }

    const data: SecurityOverview = await response.json();

    // Ensure arrays are never null to prevent .map() crashes in UI
    return {
      ...data,
      entryPoints: data.entryPoints || [],
      cameras: data.cameras || [],
      activityLog: data.activityLog || [],
    };
  } catch (error) {
    console.error("Error fetching security overview:", error);
    throw error;
  }
};

/**
 * Fetches the full activity log for the current house.
 */
export const getActivityLog = async (): Promise<ActivityLogEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Security/logs`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch activity log.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching activity log:", error);
    throw error;
  }
};

/**
 * Updates the lock/unlock status of a specific entry point.
 */
export const updateEntryPointLockStatus = async (
  deviceId: number, 
  isLocked: boolean
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Security/entrypoint/${deviceId}/status`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(isLocked), // Sending boolean directly as requested by API
    });

    if (!response.ok) {
      throw new Error("Failed to update lock status.");
    }
  } catch (error) {
    console.error("Error updating lock:", error);
    throw error;
  }
};