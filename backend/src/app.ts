import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { GenerateVideoController } from "./controllers/GenerateVideoController";
import config, { validateConfig } from "./config/env";
import redditRoutes from './routes/reddit.routes'; // ✅ import route here

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
    // Configure helmet with custom settings for video serving
    this.app.use(helmet({
      crossOriginResourcePolicy: { 
        policy: "cross-origin" // Allow cross-origin requests for static files
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          mediaSrc: ["'self'", "http://localhost:3000", "https:"], // Allow video from frontend
          connectSrc: ["'self'", "http://localhost:3000", "https:"],
        },
      },
    }));
    
    this.app.use(
      cors({
        origin: config.server.cors.origin,
        credentials: config.server.cors.credentials,
      })
    );
    this.app.use(compression());
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Serve static files from public directory with additional headers for video files
    this.app.use('/public', express.static('public'));
    this.app.use(express.static('public', {
      setHeaders: (res, path) => {
        // Set additional headers for video files
        if (path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mov')) {
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
          res.setHeader('Access-Control-Allow-Origin', config.server.cors.origin);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache videos for 1 year
        }
      }
    }));

    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get("/health",
      this.generateVideoController.healthCheck.bind(this.generateVideoController)
    );

    // Specific route for video files with proper headers
    this.app.get('/*.mp4', (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.server.cors.origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Length');
      next();
    });

    const apiRouter = express.Router();

    // ✅ Register reddit routes
    apiRouter.use('/reddit', redditRoutes);

    // Other video generation endpoints
    apiRouter.post("/generate-video",
      this.generateVideoController.generateVideo.bind(this.generateVideoController)
    );
    apiRouter.get("/progress/:scriptId",
      this.generateVideoController.getProgress.bind(this.generateVideoController)
    );
    apiRouter.delete("/cancel/:scriptId",
      this.generateVideoController.cancelGeneration.bind(this.generateVideoController)
    );

    // Cleanup and management endpoints
    apiRouter.delete("/cleanup/temp",
      this.generateVideoController.cleanupTempFiles.bind(this.generateVideoController)
    );
    apiRouter.delete("/cleanup/temp/:scriptId",
      this.generateVideoController.cleanupTempFiles.bind(this.generateVideoController)
    );
    apiRouter.delete("/videos/:scriptId",
      this.generateVideoController.deleteVideo.bind(this.generateVideoController)
    );
    apiRouter.delete("/videos",
      this.generateVideoController.deleteAllVideos.bind(this.generateVideoController)
    );
    apiRouter.get("/temp-files",
      this.generateVideoController.listTempFiles.bind(this.generateVideoController)
    );
    apiRouter.get("/videos",
      this.generateVideoController.listVideos.bind(this.generateVideoController)
    );

    this.app.use("/api", apiRouter);

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
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("Unhandled error:", error);

      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        message: "An unexpected error occurred",
      });
    });
  }

  public listen(): void {
    validateConfig();
    
    // For deployment platforms like Render, Heroku, etc.
    // Ensure port is always a number
    const port = Number(process.env.PORT) || config.server.port;
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : config.server.host;
    
    this.app.listen(port, host, () => {
      console.log(`🚀 Video Generation Service running on http://${host}:${port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS Origin: ${config.server.cors.origin}`);
    });
  }
}

export default App;
