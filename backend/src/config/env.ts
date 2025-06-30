import dotenv from "dotenv";

dotenv.config();

interface Config {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string;
      credentials: boolean;
    };
  };
  api: {
    openai: {
      apiKey: string;
      model: string;
    };
    gemini: {
      apiKey: string;
      model: string;
    };
    elevenlabs: {
      apiKey: string;
    };
  };
  storage: {
    tempDir: string;
    publicDir: string;
    maxFileSize: number;
  };
  video: {
    defaultQuality: "low" | "medium" | "high";
    defaultResolution: "720p" | "1080p" | "4k";
    maxDuration: number; // in seconds
  };
}

const config: Config = {
  server: {
    port: Number(process.env.PORT) || 3001,
    host: process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost", // Fix for deployment
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  },
  api: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    },
    elevenlabs: {
      apiKey: process.env.ELEVENLABS_API_KEY || "",
    },
  },
  storage: {
    tempDir: process.env.TEMP_DIR || "./temp",
    publicDir: process.env.PUBLIC_DIR || "./public",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "100000000", 10), // 100MB
  },
  video: {
    defaultQuality:
      (process.env.DEFAULT_QUALITY as "low" | "medium" | "high") || "medium",
    defaultResolution:
      (process.env.DEFAULT_RESOLUTION as "720p" | "1080p" | "4k") || "1080p",
    maxDuration: parseInt(process.env.MAX_VIDEO_DURATION || "300", 10), // 5 minutes
  },
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = ["GEMINI_API_KEY", "ELEVENLABS_API_KEY"];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missingVars.join(", ")}`
    );
    console.warn(
      "Some features may not work properly without these variables."
    );
  }
}

export default config;
