import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
}

export class VideoAnalyzer {
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    try {
      const absolutePath = path.resolve(videoPath);
      
      // Use ffprobe to get video metadata
      const command = `ffprobe -v quiet -show_streams -select_streams v:0 -of json "${absolutePath}"`;
      
      const { stdout } = await execAsync(command);
      const data = JSON.parse(stdout);
      
      const videoStream = data.streams[0];
      
      if (!videoStream) {
        throw new Error('No video stream found');
      }
      
      // Extract metadata
      const duration = parseFloat(videoStream.duration) || 0;
      const width = parseInt(videoStream.width) || 1920;
      const height = parseInt(videoStream.height) || 1080;
      
      // Calculate FPS
      const rFrameRate = videoStream.r_frame_rate;
      let fps = 30; // default
      if (rFrameRate) {
        const [num, den] = rFrameRate.split('/').map(Number);
        fps = den ? num / den : num;
      }
      
      return {
        duration,
        width,
        height,
        fps: Math.round(fps),
      };
      
    } catch (error) {
      console.warn(`Failed to analyze video ${videoPath}:`, error);
      // Return default values if analysis fails
      return {
        duration: 60, // assume 60 seconds
        width: 1920,
        height: 1080,
        fps: 30,
      };
    }
  }
  
  async getVideoDuration(videoPath: string): Promise<number> {
    const metadata = await this.getVideoMetadata(videoPath);
    return metadata.duration;
  }
}
