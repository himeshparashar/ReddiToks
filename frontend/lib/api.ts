const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GenerateVideoRequest {
  redditUrl: string;
  background: string;
  characters: string[];
  options: {
    quality: string;
    resolution: string;
    voiceSettings: {
      voice_id: string;
      stability: number;
      similarity_boost: number;
    };
  };
}

export interface GenerateVideoResponse {
  success: boolean;
  data?: {
    videoUrl: string;
    scriptId: string;
    processingTime: number;
  };
  error?: string;
  message: string;
}

export interface ProgressResponse {
  success: boolean;
  data?: {
    status: string;
    progress: number;
    message: string;
    videoUrl?: string;
  };
  error?: string;
  message: string;
}

export const videoApi = {
  async generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  },

  async getProgress(scriptId: string): Promise<ProgressResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/${scriptId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  },

  async cancelGeneration(scriptId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cancel/${scriptId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling generation:', error);
      throw error;
    }
  },
};
