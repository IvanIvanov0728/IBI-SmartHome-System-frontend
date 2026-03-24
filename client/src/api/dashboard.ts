import { API_BASE_URL } from "@/lib/api-config";

// For a single light within the dashboard response
export interface DashboardLight {
  id: number;
  name: string;
  isOn: boolean;
  brightness: number;
  roomId: number;
}

// For weather data within the dashboard response
export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    description: string;
  };
}

export interface Device {
    id: number;
    name: string;
    type: string;
}

export interface Room {
    id: number;
    name: string;
    floor: string;
    devices: Device[];
}

// The main dashboard data structure expected from the API
export interface DashboardApiResponse {
    lights: DashboardLight[];
    targetTemperature: number;
    currentTemperature: number;
    weatherOutside: WeatherData;
    rooms: Room[];
}

// The data structure that our React component will directly use
// This flattens the API response slightly for easier consumption in the component
export interface DashboardData {
  lights: DashboardLight[];
  targetTemperature: number;
  currentTemperature: number;
  weatherOutDescription: string;
  weatherOutTemperature: number;
  weatherOutHumidity: number;
  rooms: Room[];
  // Add other properties as needed from the API response
}


export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
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

    const apiResponse: DashboardApiResponse = await response.json();

    // Transform the API response into a more component-friendly format
    const transformedData: DashboardData = {
      lights: apiResponse.lights || [],
      targetTemperature: apiResponse.targetTemperature || 0,
      currentTemperature: apiResponse.currentTemperature || 0,
      weatherOutDescription: apiResponse.weatherOutside?.current?.description || "N/A",
      weatherOutTemperature: apiResponse.weatherOutside?.current?.temperature_2m || 0,
      weatherOutHumidity: apiResponse.weatherOutside?.current?.relative_humidity_2m || 0,
      rooms: apiResponse.rooms || []
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

