// Get API URL with fallback
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

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
    scriptId: string;
    currentStep: string;
    stepProgress: number;
    overallProgress: number;
    estimatedTimeRemaining: number;
    message: string;
    status?: string; // Optional since backend might not always include it
    videoUrl?: string;
  };
  error?: string;
  message: string;
}

export const videoApi = {
  async generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
    try {
      console.log('Sending video generation request:', request);
      const response = await fetch(`${API_BASE_URL}/api/generate-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Generate video response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generate video error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Generate video result:', result);
      return result;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  },

  async getProgress(scriptId: string): Promise<ProgressResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/progress/${scriptId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Progress error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      // Don't log every progress call as it's frequent
      return result;
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
