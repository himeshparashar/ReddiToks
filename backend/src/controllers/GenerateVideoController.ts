import { Request, Response } from "express";
import {
  GenerateVideoUseCase,
  GenerateVideoRequest,
  createGenerateVideoUseCase,
} from "../application/usecases/GenerateVideoUseCase";

export class GenerateVideoController {
  private generateVideoUseCase: GenerateVideoUseCase;

  constructor() {
    this.generateVideoUseCase = createGenerateVideoUseCase();
  }

  async generateVideo(req: Request, res: Response): Promise<void> {
    try {
      // Extract and validate request body
      const generateRequest: GenerateVideoRequest = {
        redditUrl: req.body.redditUrl,
        background: req.body.background || "default-background.mp4",
        characters: req.body.characters || ["default-character.png"],
        options: {
          quality: req.body.quality || "medium",
          resolution: req.body.resolution || "1080p",
          voiceSettings: req.body.voiceSettings,
        },
      };

      // Execute use case
      const result = await this.generateVideoUseCase.execute(generateRequest);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            videoUrl: result.videoUrl,
            scriptId: result.scriptId,
            processingTime: result.processingTime,
          },
          message: "Video generated successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          message: "Video generation failed",
        });
      }
    } catch (error) {
      console.error("Controller error:", error);

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        message: "An unexpected error occurred",
      });
    }
  }

  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const { scriptId } = req.params;

      if (!scriptId) {
        res.status(400).json({
          success: false,
          error: "Script ID is required",
          message: "Missing script ID parameter",
        });
        return;
      }

      const progress = await this.generateVideoUseCase.getProgress(scriptId);

      res.status(200).json({
        success: true,
        data: progress,
        message: "Progress retrieved successfully",
      });
    } catch (error) {
      console.error("Progress retrieval error:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get progress",
        message: "Could not retrieve generation progress",
      });
    }
  }

  async cancelGeneration(req: Request, res: Response): Promise<void> {
    try {
      const { scriptId } = req.params;

      if (!scriptId) {
        res.status(400).json({
          success: false,
          error: "Script ID is required",
          message: "Missing script ID parameter",
        });
        return;
      }

      await this.generateVideoUseCase.cancelGeneration(scriptId);

      res.status(200).json({
        success: true,
        message: "Video generation cancelled successfully",
      });
    } catch (error) {
      console.error("Cancellation error:", error);

      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel generation",
        message: "Could not cancel video generation",
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: "Video generation service is healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }
}
