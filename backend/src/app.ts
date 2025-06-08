import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { GenerateVideoController } from "./controllers/GenerateVideoController";
import config, { validateConfig } from "./config/env";

class App {
  public app: express.Application;
  private generateVideoController: GenerateVideoController;

  constructor() {
    this.app = express();
    this.generateVideoController = new GenerateVideoController();

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: config.server.cors.origin,
        credentials: config.server.cors.credentials,
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get(
      "/health",
      this.generateVideoController.healthCheck.bind(
        this.generateVideoController
      )
    );

    // API routes
    const apiRouter = express.Router();

    // Video generation endpoints
    apiRouter.post(
      "/generate-video",
      this.generateVideoController.generateVideo.bind(
        this.generateVideoController
      )
    );
    apiRouter.get(
      "/progress/:scriptId",
      this.generateVideoController.getProgress.bind(
        this.generateVideoController
      )
    );
    apiRouter.delete(
      "/cancel/:scriptId",
      this.generateVideoController.cancelGeneration.bind(
        this.generateVideoController
      )
    );

    // Mount API router
    this.app.use("/api", apiRouter);

    // Static files (for serving generated videos)
    this.app.use(
      "/videos",
      express.static(config.storage.publicDir + "/videos")
    );

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Unhandled error:", error);

        res.status(500).json({
          success: false,
          error:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error.message,
          message: "An unexpected error occurred",
        });
      }
    );
  }

  public listen(): void {
    validateConfig();

    this.app.listen(config.server.port, config.server.host, () => {
      console.log(
        `🚀 Video Generation Service running on http://${config.server.host}:${config.server.port}`
      );
      console.log(`📁 Temp directory: ${config.storage.tempDir}`);
      console.log(`📁 Public directory: ${config.storage.publicDir}`);
      console.log(`🎬 Default video quality: ${config.video.defaultQuality}`);
      console.log(
        `📺 Default video resolution: ${config.video.defaultResolution}`
      );
    });
  }
}

export default App;
