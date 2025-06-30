import {
  RedditService,
  RedditServiceInterface,
} from "../services/RedditService";
import { LLMService, LLMServiceInterface } from "../services/LLMService";
import { TTSService, TTSServiceInterface } from "../services/TTSService";
import {
  RemotionService,
  RemotionServiceInterface,
} from "../services/RemotionService";
import { ScriptEntity } from "../../domain/entities/Script";
import * as fs from "fs-extra";
import * as path from "path";

export interface GenerateVideoRequest {
  redditUrl: string;
  background?: string;
  characters?: string[];
  options?: VideoGenerationOptions;
}

export interface VideoGenerationOptions {
  quality?: "low" | "medium" | "high";
  resolution?: "720p" | "1080p" | "4k";
  voiceSettings?: {
    speed?: number;
    pitch?: number;
  };
}

export interface VideoGenerationProgress {
  scriptId: string;
  currentStep: "reddit" | "llm" | "tts" | "render";
  stepProgress: number; // 0-100
  overallProgress: number; // 0-100
  estimatedTimeRemaining?: number;
  message?: string;
}

export interface GenerateVideoResponse {
  success: boolean;
  videoUrl?: string;
  scriptId?: string;
  error?: string;
  processingTime?: number;
}

export class GenerateVideoUseCase {
  constructor(
    private redditService: RedditServiceInterface,
    private llmService: LLMServiceInterface,
    private ttsService: TTSServiceInterface,
    private remotionService: RemotionServiceInterface
  ) {}

  async execute(request: GenerateVideoRequest): Promise<GenerateVideoResponse> {
    const startTime = Date.now();

    try {
      console.log(`Starting video generation for URL: ${request.redditUrl}`);

      // Step 1: Validate input
      this.validateRequest(request);

      // Step 2: Fetch Reddit data
      console.log("Step 1/4: Fetching Reddit post data...");
      const rawThread = await this.redditService.fetchPostData(
        request.redditUrl
      );

      // Step 3: Generate structured script using LLM
      console.log("Step 2/4: Generating structured script...");
      const script = await this.llmService.generateStructuredScript(rawThread);

      // Step 4: Generate audio for script
      console.log("Step 3/4: Generating audio for script...");
      const scriptWithAudio = await this.ttsService.generateAudioForScript(
        script
      );

      // Step 5: Render video using Remotion
      console.log("Step 4/4: Rendering video...");
      const videoPath = await this.remotionService.renderVideo(scriptWithAudio);

      const processingTime = Date.now() - startTime;

      console.log(
        `Video generation completed successfully in ${processingTime}ms`
      );

      return {
        success: true,
        videoUrl: videoPath,
        scriptId: script.id,
        processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      console.error("Video generation failed:", error);

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        processingTime,
      };
    }
  }

  private validateRequest(request: GenerateVideoRequest): void {
    if (!request.redditUrl) {
      throw new Error("Reddit URL is required");
    }

    if (!this.isValidRedditUrl(request.redditUrl)) {
      throw new Error("Invalid Reddit URL format");
    }

    // Validate optional parameters
    if (
      request.options?.resolution &&
      !["720p", "1080p", "4k"].includes(request.options.resolution)
    ) {
      throw new Error("Invalid resolution. Must be 720p, 1080p, or 4k");
    }

    if (
      request.options?.quality &&
      !["low", "medium", "high"].includes(request.options.quality)
    ) {
      throw new Error("Invalid quality. Must be low, medium, or high");
    }
  }

  private isValidRedditUrl(url: string): boolean {
    const redditUrlPattern =
      /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/;
    return redditUrlPattern.test(url);
  }
  async getProgress(scriptId: string): Promise<VideoGenerationProgress> {
    // Mock implementation - return fake progress data
    console.log(`Getting progress for script: ${scriptId}`);

    return {
      scriptId: scriptId,
      currentStep: "render",
      stepProgress: 85,
      overallProgress: 85,
      estimatedTimeRemaining: 30,
      message: "Rendering video... Almost done!",
    };
  }

  async cancelGeneration(scriptId: string): Promise<void> {
    // Mock implementation - simulate cancellation
    console.log(`Cancelling video generation for script: ${scriptId}`);

    // Cancel ongoing operations in each service
    await this.remotionService.cancelRender(scriptId);

    console.log(`Video generation cancelled for script: ${scriptId}`);
  }

  async cleanupTempFiles(scriptId?: string): Promise<{ deletedFiles: string[], message: string }> {
    console.log(`Cleaning up temp files${scriptId ? ` for script: ${scriptId}` : ''}`);
    
    const tempDir = './temp';
    const deletedFiles: string[] = [];

    try {
      if (scriptId) {
        // Clean up specific script's temp files
        const scriptTempDir = path.join(tempDir, scriptId);
        if (await fs.pathExists(scriptTempDir)) {
          await fs.remove(scriptTempDir);
          deletedFiles.push(scriptTempDir);
          console.log(`✅ Deleted temp directory: ${scriptTempDir}`);
        }
      } else {
        // Clean up all temp files
        if (await fs.pathExists(tempDir)) {
          const files = await fs.readdir(tempDir);
          for (const file of files) {
            const filePath = path.join(tempDir, file);
            await fs.remove(filePath);
            deletedFiles.push(filePath);
            console.log(`✅ Deleted: ${filePath}`);
          }
        }
      }

      return {
        deletedFiles,
        message: scriptId 
          ? `Cleaned up temp files for script: ${scriptId}`
          : `Cleaned up all temp files (${deletedFiles.length} items)`
      };
    } catch (error) {
      console.error(`❌ Error cleaning up temp files:`, error);
      throw new Error(`Failed to cleanup temp files: ${error}`);
    }
  }

  async deleteVideo(scriptId: string): Promise<{ success: boolean, message: string }> {
    console.log(`Deleting video for script: ${scriptId}`);
    
    const publicDir = './public';
    
    try {
      // Delete video file
      const videoPath = path.join(publicDir, 'videos', `${scriptId}.mp4`);
      if (await fs.pathExists(videoPath)) {
        await fs.remove(videoPath);
        console.log(`✅ Deleted video: ${videoPath}`);
      }

      // Delete associated audio files
      const audioDir = path.join(publicDir, 'audio', scriptId);
      if (await fs.pathExists(audioDir)) {
        await fs.remove(audioDir);
        console.log(`✅ Deleted audio directory: ${audioDir}`);
      }

      // Cleanup temp files for this script
      await this.cleanupTempFiles(scriptId);

      return {
        success: true,
        message: `Successfully deleted video and associated files for script: ${scriptId}`
      };
    } catch (error) {
      console.error(`❌ Error deleting video:`, error);
      throw new Error(`Failed to delete video: ${error}`);
    }
  }

  async deleteAllVideos(): Promise<{ deletedCount: number, message: string }> {
    console.log(`Deleting all videos and associated files`);
    
    const publicDir = './public';
    let deletedCount = 0;
    
    try {
      // Delete all videos
      const videosDir = path.join(publicDir, 'videos');
      if (await fs.pathExists(videosDir)) {
        const videoFiles = await fs.readdir(videosDir);
        for (const file of videoFiles) {
          if (file.endsWith('.mp4')) {
            await fs.remove(path.join(videosDir, file));
            deletedCount++;
            console.log(`✅ Deleted video: ${file}`);
          }
        }
      }

      // Delete all audio files
      const audioDir = path.join(publicDir, 'audio');
      if (await fs.pathExists(audioDir)) {
        await fs.remove(audioDir);
        console.log(`✅ Deleted all audio files`);
      }

      // Cleanup all temp files
      await this.cleanupTempFiles();

      return {
        deletedCount,
        message: `Successfully deleted ${deletedCount} videos and all associated files`
      };
    } catch (error) {
      console.error(`❌ Error deleting all videos:`, error);
      throw new Error(`Failed to delete all videos: ${error}`);
    }
  }

  async listTempFiles(): Promise<{ tempFiles: string[], totalSize: number }> {
    const tempDir = './temp';
    const tempFiles: string[] = [];
    let totalSize = 0;

    try {
      if (await fs.pathExists(tempDir)) {
        const items = await fs.readdir(tempDir);
        for (const item of items) {
          const itemPath = path.join(tempDir, item);
          const stats = await fs.stat(itemPath);
          tempFiles.push(item);
          totalSize += stats.size;
        }
      }

      return {
        tempFiles,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100 // MB
      };
    } catch (error) {
      console.error(`❌ Error listing temp files:`, error);
      throw new Error(`Failed to list temp files: ${error}`);
    }
  }

  async listVideos(): Promise<{ videos: Array<{ name: string, size: number, created: Date }>, totalCount: number }> {
    const publicDir = './public';
    const videos: Array<{ name: string, size: number, created: Date }> = [];

    try {
      const videosDir = path.join(publicDir, 'videos');
      if (await fs.pathExists(videosDir)) {
        const files = await fs.readdir(videosDir);
        for (const file of files) {
          if (file.endsWith('.mp4')) {
            const filePath = path.join(videosDir, file);
            const stats = await fs.stat(filePath);
            videos.push({
              name: file,
              size: Math.round(stats.size / 1024 / 1024 * 100) / 100, // MB
              created: stats.birthtime
            });
          }
        }
      }

      return {
        videos: videos.sort((a, b) => b.created.getTime() - a.created.getTime()),
        totalCount: videos.length
      };
    } catch (error) {
      console.error(`❌ Error listing videos:`, error);
      throw new Error(`Failed to list videos: ${error}`);
    }
  }
}

// Factory function to create use case with all dependencies
export function createGenerateVideoUseCase(): GenerateVideoUseCase {
  const redditService = new RedditService();
  const llmService = new LLMService(); // Uses config internally
  const ttsService = new TTSService(); // Will need to be updated to use config
  const remotionService = new RemotionService();

  return new GenerateVideoUseCase(
    redditService,
    llmService,
    ttsService,
    remotionService
  );
}
