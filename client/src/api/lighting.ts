import { API_BASE_URL } from "@/lib/api-config";

export interface Light {
  id: number;
  name: string;
  isOn: boolean;
  brightness: number;
  roomId: number;
}

export interface Room {
  id: number;
  name: string;
  floor: string;
}

export interface LightData {
  lights: Light[];
  rooms: Room[];
}

interface ApiResponse {
  lights: Light[];
  rooms: Room[]; 
}

export const getLightsData = async (): Promise<LightData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lighting`, {
      method: "GET",
      credentials: "include", 
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      throw new Error("Unauthorized: Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }

    const apiResponse: ApiResponse = await response.json();
    
    const transformedData: LightData = {
      lights: apiResponse.lights,
      rooms: apiResponse.rooms
    }

    return transformedData;
  } catch (error) {
    console.error('Error fetching lights:', error);
    throw error;
  }
};

export const setLight = async (
  id: number,
  isOn: boolean
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lighting/state/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isOn),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error updating light ${id} state:`, error);
    throw error;
  }
};

export const setBrightness = async (
  id: number,
  brightness: number
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/lighting/brightness/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Number(brightness)),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error updating brightness for light ${id}:`, error);
    throw error;
  }
};
