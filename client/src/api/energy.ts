// Smart-Home-OS/client/src/api/energy.ts

import { API_BASE_URL } from "@/lib/api-config";

export interface WeeklyDataPoint {
  name: string;
  usage: number;
  solar: number;
}

export interface HourlyDataPoint {
  time: string;
  value: number;
}

export interface RoomUsage {
  room: string;
  usage: string;
  color: string;
  percent: number;
}

export interface EnvironmentalImpact {
  co2Offset: number;
  treesSaved: number;
}

export interface BatteryStorage {
  percentage: number;
  estimatedTimeRemaining: string;
}

export interface EnergyData {
  weeklyData: WeeklyDataPoint[];
  hourlyData: HourlyDataPoint[];
  roomData: RoomUsage[];
  environmentalImpact: EnvironmentalImpact;
  batteryStorage: BatteryStorage;
}

export const getEnergyData = async (): Promise<EnergyData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/energy`, {
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

    const apiResponse: EnergyData = await response.json();
    return apiResponse;
  } catch (error) {
    console.error('Error fetching energy data:', error);
    throw error;
  }
};
