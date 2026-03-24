import { API_BASE_URL } from "@/lib/api-config";

// For the Thermostat widget/page
export interface ClimateData {
  currentTemperature: number;
  targetTemperature: number;
  humidity?: number;
  airQuality?: string;
}

// For the Weekly Schedule
export interface ClimateSchedule {
  id: number;
  day: string;
  time: string;
  temp: string;
  mode: string;
}

interface ThermostatApiResponse {
  id: number;
  name: string;
  temperature: number;
  targetTemperature: number;
  humidity: number;
}

interface ApiResponse {
  thermostats: ThermostatApiResponse[];
}

export const getClimateData = async (): Promise<ClimateData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/climate`, {
      method: "GET",
      // CRITICAL: This allows the browser to send the .AspNetCore.Identity cookie
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
    const thermostat = apiResponse.thermostats[0]; // Assuming the first thermostat

    const transformedData: ClimateData = {
      currentTemperature: thermostat.temperature,
      targetTemperature: thermostat.targetTemperature,
      humidity: thermostat.humidity,
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching climate data:', error);
    throw error;
  }
};

export const setTargetTemperature = async (temperature: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/climate/temperature`, {
      method: "PUT", 
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetTemperature: temperature }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error setting temperature:', error);
    throw error;
  }
};

// --- Schedule API calls ---

export const getClimateSchedule = async (): Promise<ClimateSchedule[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/climate/schedule`, {
      method: "GET",
      // CRITICAL: This allows the browser to send the .AspNetCore.Identity cookie
      credentials: "include", 
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching climate schedule:', error);
    throw error;
  }
};

export const deleteClimateScheduleEntry = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/climate/schedule/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting climate schedule entry:', error);
    throw error;
  }
};

export const saveClimateScheduleEntry = async (entry: ClimateSchedule): Promise<void> => {
  try {
    const method = entry.id === 0 ? "POST" : "PUT";
    const url = entry.id === 0 
      ? `${API_BASE_URL}/api/climate/schedule`
      : `${API_BASE_URL}/api/climate/schedule/${entry.id}`;

    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving climate schedule entry:', error);
    throw error;
  }
};
