import { API_BASE_URL } from "@/lib/api-config";

export interface UserSearchResult {
    id: string;
    username: string;
    email: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
  email: string;
}

export interface CreateHouseDTO {
  name: string;
  address: string;
  userId: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateRoomDTO {
  name: string;
  floor: string;
  houseId: number;
}

export interface CreateDeviceDTO {
  name: string;
  type: string;
  roomId: number;
  mqttTopic?: string;
}

export interface CreateRuleDTO {
  name: string;
  triggerDeviceId: number;
  triggerType: string;
  actionDeviceId: number;
  actionType: string;
  actionValue: string;
}

export interface AdminAnalytics {
  systemEnergyWeekly: { name: string; usage: number }[];
  systemActivityHourly: { time: string; value: number }[];
}

// --- API Functions ---

/**
 * Creates a new house and assigns it to a user
*/
export const createHouse = async (data: CreateHouseDTO): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/houses`, {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create house");
  return response.json();
};

/**
 * Adds a room to a specific house
*/
export const addRoom = async (data: CreateRoomDTO): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms`, {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to add room");
    return response.json();
};

/**
 * Adds a device to a specific room
 * Note: Explicitly ensures roomId is a number to avoid 400 errors
*/
export const addDevice = async (data: CreateDeviceDTO): Promise<any> => {
    // Look closely at your C# CreateDeviceViewModel property names. 
    // If they are Name, Type, RoomId, MqttTopic (PascalCase), 
    // some configurations require the JSON to match exactly.
    const payload = {
        Name: data.name,
        Type: data.type,
        RoomId: Number(data.roomId),
        MqttTopic: data.mqttTopic || "" // Ensure this isn't undefined
    };

    console.log("Sending Payload:", payload); // DEBUG: Check this in your console!

    const response = await fetch(`${API_BASE_URL}/api/admin/devices`, {
      method: "POST",
      credentials: "include", 
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Log the actual validation errors from ASP.NET
        const errorData = await response.json();
        console.error("Server Validation Error:", errorData);
        
        // If errorData has a 'errors' property, it's a validation failure
        const errorMessage = errorData.errors 
            ? Object.values(errorData.errors).flat().join(", ")
            : errorData.message;

        throw new Error(errorMessage || `Error ${response.status}: Bad Request`);
    }
    return response.json();
};

/**
 * Creates an automation rule
*/
export const createRule = async (data: CreateRuleDTO): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rules`, {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create rule");
    return response.json();
};

/**
 * Searches for users by query string
 */

export const searchUsers = async (query: string): Promise<UserSearchResult[]> => {
    if (!query) return [];
    
    const response = await fetch(`${API_BASE_URL}/api/admin/users/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        credentials: "include",
    });
    
    if (!response.ok) {
        throw new Error("Failed to search users");
    }
    
    return await response.json();
};

/**
 * Updates an existing room
 */
export const updateRoom = async (id: number, data: Partial<CreateRoomDTO>): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: "PUT",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update room");
    return response.json();
};

/**
 * Deletes a room
 */
export const deleteRoom = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete room");
};

/**
 * Updates an existing device
 */
export const updateDevice = async (id: number, data: Partial<CreateDeviceDTO>): Promise<any> => {
    const payload = {
        Name: data.name,
        Type: data.type,
        RoomId: Number(data.roomId),
        MqttTopic: data.mqttTopic || ""
    };

    const response = await fetch(`${API_BASE_URL}/api/admin/devices/${id}`, {
        method: "PUT",
        credentials: "include", 
        headers: { 
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to update device");
    return response.json();
};

/**
 * Deletes a device
 */
export const deleteDevice = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/devices/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete device");
};

/**
 * Deletes an automation rule
 */
export const deleteRule = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/rules/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete rule");
};
