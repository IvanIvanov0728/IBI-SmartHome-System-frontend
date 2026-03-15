const API_BASE_URL = 'https://localhost:7244';

export interface Scene {
  id: number;
  name: string;
  isActive: boolean;
}

export const getScenes = async (): Promise<Scene[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scenes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching scenes:', error);
    throw error;
  }
};

export const executeScene = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scenes/execute/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API call failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error executing scene ${id}:`, error);
    throw error;
  }
};
