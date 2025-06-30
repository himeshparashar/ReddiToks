// Utility functions for video handling

export const getVideoUrl = (scriptId: string, baseUrl?: string): string => {
  const API_BASE_URL = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${API_BASE_URL}/videos/${scriptId}.mp4`;
};

export const isVideoAccessible = async (videoUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(videoUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Video accessibility check failed:', error);
    return false;
  }
};

export const logVideoStatus = (scriptId: string, status: any) => {
  console.log(`[Video Status] ScriptID: ${scriptId}`, {
    timestamp: new Date().toISOString(),
    status: status
  });
};
