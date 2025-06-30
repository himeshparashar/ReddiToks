import { ScriptEntity } from "../../domain/entities/Script";
import { RemotionCompositionBuilder, RemotionConfig } from "../../infrastructure/remotion/RemotionCompositionBuilder";
import { VideoAnalyzer } from "../../infrastructure/video/VideoAnalyzer";
import { renderMedia, selectComposition, getCompositions } from "@remotion/renderer";
import * as fs from "fs-extra";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface RemotionServiceInterface {
  renderVideo(script: ScriptEntity): Promise<string>;
  getRenderStatus(
    scriptId: string
  ): Promise<"pending" | "rendering" | "completed" | "failed">;
  cancelRender(scriptId: string): Promise<void>;
}

export interface RenderOptions {
  outputPath?: string;
  quality?: "low" | "medium" | "high";
  resolution?: "720p" | "1080p" | "4k";
  fps?: number;
}

export interface RenderProgress {
  frame: number;
  totalFrames: number;
  percentage: number;
  timeRemaining?: number;
}

export class RemotionService implements RemotionServiceInterface {
  private compositionBuilder: RemotionCompositionBuilder;
  private videoAnalyzer: VideoAnalyzer;
  private renderingJobs: Map<string, "pending" | "rendering" | "completed" | "failed"> = new Map();

  constructor(
    private tempDir: string = "./temp",
    private publicDir: string = "./public"
  ) {
    this.compositionBuilder = new RemotionCompositionBuilder(tempDir, publicDir);
    this.videoAnalyzer = new VideoAnalyzer();
  }

  async renderVideo(script: ScriptEntity): Promise<string> {
    console.log(`🎬 Starting video rendering for script: ${script.id}`);
    
    try {
      this.renderingJobs.set(script.id, "pending");

      // Step 1: Build Remotion composition
      const config = this.compositionBuilder.buildComposition(script);
      
      // Step 2: Prepare directories and files
      await this.prepareRenderingEnvironment(script);
      
      // Step 3: Write script data to file
      await this.compositionBuilder.writeScriptDataToFile(script);
      
      // Step 4: Ensure all audio files exist
      await this.validateAudioFiles(script);
      
      // Step 5: Render video using Remotion
      this.renderingJobs.set(script.id, "rendering");
      const videoPath = await this.executeRemotionRender(script, config);
      
      // Step 6: Move to public directory
      const publicVideoPath = await this.moveToPublicDir(videoPath, script.id);
      
      // Step 7: Cleanup temporary files
      await this.cleanup(script.id);
      
      this.renderingJobs.set(script.id, "completed");
      console.log(`✅ Video rendering completed: ${publicVideoPath}`);
      
      return publicVideoPath;
      
    } catch (error) {
      console.error(`❌ Video rendering failed for script ${script.id}:`, error);
      this.renderingJobs.set(script.id, "failed");
      throw error;
    }
  }

  private async prepareRenderingEnvironment(script: ScriptEntity): Promise<void> {
    const scriptDir = path.join(this.tempDir, script.id);
    const audioDir = path.join(scriptDir, "audio");
    const outputDir = path.join(this.publicDir, "videos");
    
    await fs.ensureDir(scriptDir);
    await fs.ensureDir(audioDir);
    await fs.ensureDir(outputDir);
    
    console.log(`📁 Prepared directories for script: ${script.id}`);
  }

  private async validateAudioFiles(script: ScriptEntity): Promise<void> {
    console.log(`🔍 Validating and preparing audio files for script: ${script.id}`);
    
    // Create public audio directory for this script
    const publicAudioDir = path.join(this.publicDir, "audio", script.id);
    await fs.ensureDir(publicAudioDir);
    
    for (const line of script.lines) {
      if (!line.audioFilePath) {
        console.warn(`⚠️ No audio file for line: ${line.speaker} - ${line.text.substring(0, 50)}...`);
        continue;
      }
      
      // Handle different audio path formats to find the source file
      let audioPath: string;
      
      if (line.audioFilePath.startsWith('/')) {
        // Absolute path from root
        audioPath = path.join(process.cwd(), line.audioFilePath.substring(1));
      } else if (line.audioFilePath.startsWith('temp/')) {
        // Relative path from project root
        audioPath = path.join(process.cwd(), line.audioFilePath);
      } else {
        // Assume it's relative to temp directory
        audioPath = path.join(this.tempDir, line.audioFilePath);
      }
      
      if (!await fs.pathExists(audioPath)) {
        console.warn(`⚠️ Audio file not found: ${audioPath}`);
        continue;
      }
      
      // Copy audio file to public directory so Remotion can access it
      const audioFilename = path.basename(audioPath);
      const publicAudioPath = path.join(publicAudioDir, audioFilename);
      
      await fs.copy(audioPath, publicAudioPath);
      console.log(`✅ Audio file copied to public: ${audioFilename}`);
    }
  }

  private async executeRemotionRender(
    script: ScriptEntity,
    config: RemotionConfig
  ): Promise<string> {
    console.log(`🎥 Executing Remotion render for script: ${script.id}`);
    
    const outputPath = path.join(this.tempDir, script.id, "video.mp4");
    
    try {
      // Get background video duration
      const backgroundVideoPath = path.join(this.publicDir, "background-video.mp4");
      let backgroundVideoDuration = 60; // Default fallback
      
      try {
        backgroundVideoDuration = await this.videoAnalyzer.getVideoDuration(backgroundVideoPath);
        console.log(`📹 Background video duration: ${backgroundVideoDuration} seconds`);
        
        // Calculate script duration for comparison
        let scriptDuration = 0;
        for (const line of script.lines) {
          const lineEnd = line.startTime + line.duration;
          if (lineEnd > scriptDuration) {
            scriptDuration = lineEnd;
          }
        }
        
        console.log(`🎬 Script duration: ${scriptDuration} seconds`);
        
        if (backgroundVideoDuration >= scriptDuration) {
          console.log(`✂️ Background video will be CLIPPED (${backgroundVideoDuration}s -> ${scriptDuration}s)`);
        } else {
          const loops = Math.ceil(scriptDuration / backgroundVideoDuration);
          console.log(`🔄 Background video will be LOOPED ${loops} times (${backgroundVideoDuration}s -> ${scriptDuration}s)`);
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not analyze background video, using default duration: ${error}`);
      }
      
      // Fix: Use the correct entry point that calls registerRoot
      // Use the source file directly, not the compiled version
      const remotionEntryPoint = path.resolve(process.cwd(), "src/remotion/Root.tsx");
      const compositionId = "RedditVideo";
      
      // Create a temporary input props file
      const inputPropsPath = path.join(this.tempDir, script.id, "input-props.json");
      
      // Update script to use public audio paths
      const updatedScript = {
        ...script,
        // Override background to ensure we use the correct video file
        background: "background-video.mp4",
        lines: script.lines.map(line => ({
          ...line,
          // Convert audio path to public accessible path
          audioFilePath: line.audioFilePath ? `audio/${script.id}/${path.basename(line.audioFilePath)}` : ""
        }))
      };
      
      const inputProps = {
        script: updatedScript,
        backgroundVideo: "background-video.mp4",
        backgroundVideoDurationSeconds: backgroundVideoDuration, // Pass the actual duration
      };
      
      await fs.writeFile(inputPropsPath, JSON.stringify(inputProps, null, 2));
      
      // Build the Remotion CLI command with optimizations
      const remotionCommand = [
        "npx remotion render",
        `"${remotionEntryPoint}"`,
        compositionId,
        `"${outputPath}"`,
        "--props", `"${inputPropsPath}"`,
        "--codec", "h264",
        "--crf", "28", // Higher compression for faster render
        "--concurrency", "2", // Increase concurrency slightly
        "--image-format", "jpeg",
        "--jpeg-quality", "80", // Lower quality for faster render
        "--overwrite"
      ].join(" ");
      
      console.log(`🔧 Executing command: ${remotionCommand}`);
      console.log(`⏱️ Timeout set to 15 minutes for rendering...`);
      
      // Execute the command with longer timeout
      const { stdout, stderr } = await execAsync(remotionCommand, {
        cwd: path.join(__dirname, "../../.."), // Backend root directory
        timeout: 900000, // 15 minutes timeout
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer for large output
      });
      
      if (stderr && !stderr.includes("warning") && !stderr.includes("Failed to load resource")) {
        console.warn(`⚠️ Remotion stderr: ${stderr}`);
      }
      
      // Log progress from stdout
      const progressLines = stdout.split('\n').filter(line => line.includes('Rendered'));
      if (progressLines.length > 0) {
        console.log(`📊 Final progress: ${progressLines[progressLines.length - 1]}`);
      }
      
      console.log(`📺 Remotion output: ${stdout}`);
      
      // Verify the output file was created
      if (!await fs.pathExists(outputPath)) {
        throw new Error(`Output video file was not created: ${outputPath}`);
      }
      
      const stats = await fs.stat(outputPath);
      console.log(`✅ Video created successfully: ${outputPath} (${Math.round(stats.size / 1024 / 1024)}MB)`);
      
      return outputPath;
      
    } catch (error) {
      console.error(`❌ Remotion render failed:`, error);
      throw new Error(`Failed to render video with Remotion: ${error}`);
    }
  }

  private async cleanup(scriptId: string): Promise<void> {
    try {
      const scriptTempDir = path.join(this.tempDir, scriptId);
      // Keep the audio files but clean up other temporary files
      const filesToKeep = ['audio', 'script.json'];
      
      const files = await fs.readdir(scriptTempDir);
      for (const file of files) {
        if (!filesToKeep.includes(file) && !file.endsWith('.mp4')) {
          const filePath = path.join(scriptTempDir, file);
          await fs.remove(filePath);
          console.log(`🧹 Cleaned up: ${file}`);
        }
      }
      
      console.log(`✅ Cleanup completed for script: ${scriptId}`);
    } catch (error) {
      console.warn(`⚠️ Cleanup warning for script ${scriptId}:`, error);
    }
  }

  private async moveToPublicDir(
    tempVideoPath: string,
    scriptId: string
  ): Promise<string> {
    const publicVideoPath = path.join(this.publicDir, "videos", `${scriptId}.mp4`);
    
    await fs.ensureDir(path.dirname(publicVideoPath));
    await fs.move(tempVideoPath, publicVideoPath, { overwrite: true });
    
    console.log(`📁 Moved video to public directory: ${publicVideoPath}`);
    
    // Return relative path for web access
    return `/videos/${scriptId}.mp4`;
  }

  async getRenderStatus(
    scriptId: string
  ): Promise<"pending" | "rendering" | "completed" | "failed"> {
    return this.renderingJobs.get(scriptId) || "pending";
  }

  async cancelRender(scriptId: string): Promise<void> {
    console.log(`🛑 Cancelling render for script: ${scriptId}`);
    
    // Mark as failed to prevent further processing
    this.renderingJobs.set(scriptId, "failed");
    
    // Clean up any temporary files
    try {
      await this.cleanup(scriptId);
    } catch (error) {
      console.warn(`⚠️ Error during cancellation cleanup:`, error);
    }
    
    console.log(`✅ Render cancelled for script: ${scriptId}`);
  }
}
