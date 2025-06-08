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
    // TODO: Implement progress tracking across all services
    throw new Error("Progress tracking not implemented yet");
  }

  async cancelGeneration(scriptId: string): Promise<void> {
    // TODO: Implement cancellation across all services
    console.log(`Cancelling video generation for script: ${scriptId}`);

    // Cancel ongoing operations in each service
    await this.remotionService.cancelRender(scriptId);

    throw new Error("Generation cancellation not implemented yet");
  }
}

export interface VideoGenerationProgress {
  scriptId: string;
  currentStep: "reddit" | "llm" | "tts" | "render";
  stepProgress: number; // 0-100
  overallProgress: number; // 0-100
  estimatedTimeRemaining?: number;
  message?: string;
}

// Factory function to create use case with all dependencies
export function createGenerateVideoUseCase(): GenerateVideoUseCase {
  // TODO: Get these from environment configuration
  const redditService = new RedditService();
  const llmService = new LLMService("your-openai-api-key");
  const ttsService = new TTSService("your-elevenlabs-api-key");
  const remotionService = new RemotionService();

  return new GenerateVideoUseCase(
    redditService,
    llmService,
    ttsService,
    remotionService
  );
}
