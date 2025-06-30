import { ScriptEntity } from "../../domain/entities/Script";
import * as fs from "fs-extra";
import * as path from "path";

export interface VideoComposition {
  id: string;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
}

export interface RemotionConfig {
  composition: VideoComposition;
  script: ScriptEntity;
  assets: {
    backgroundVideo: string;
    characterImages: string[];
    audioFiles: string[];
  };
}

export class RemotionCompositionBuilder {
  constructor(
    private tempDir: string = "./temp",
    private publicDir: string = "./public"
  ) {}

  buildComposition(script: ScriptEntity): RemotionConfig {
    console.log(`Building Remotion composition for script: ${script.id}`);

    const fps = 30;
    const totalDurationSeconds = this.calculateTotalDuration(script);
    const durationInFrames = this.calculateDurationInFrames(script, fps);

    const config: RemotionConfig = {
      composition: {
        id: script.id,
        fps,
        durationInFrames,
        width: 1080,
        height: 1920, // Vertical video for TikTok/Reels
      },
      script: script,
      assets: {
        backgroundVideo: script.background || "background-video.mp4",
        characterImages: script.characters,
        audioFiles: script.lines
          .map((line) => line.audioFilePath)
          .filter((path) => path && path.length > 0),
      },
    };

    console.log(`✅ Composition built: ${durationInFrames} frames (${totalDurationSeconds.toFixed(1)}s)`);
    return config;
  }

  private calculateDurationInFrames(
    script: ScriptEntity,
    fps: number = 30
  ): number {
    const totalDurationSeconds = this.calculateTotalDuration(script);
    return Math.ceil(totalDurationSeconds * fps);
  }

  private calculateTotalDuration(script: ScriptEntity): number {
    if (script.lines.length === 0) return 30; // Default 30 seconds for empty script
    
    const lastLine = script.lines[script.lines.length - 1];
    return lastLine.startTime + lastLine.duration + 1; // Add 1 second buffer
  }

  async generateRemotionComponent(config: RemotionConfig): Promise<string> {
    // Generate the Remotion React component code dynamically
    const componentCode = `
import React from 'react';
import { Composition } from 'remotion';
import { VideoScene } from './scenes/VideoScene';

export const VideoComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="${config.composition.id}"
        component={VideoScene}
        durationInFrames={${config.composition.durationInFrames}}
        fps={${config.composition.fps}}
        width={${config.composition.width}}
        height={${config.composition.height}}
        defaultProps={{
          script: ${JSON.stringify(config.script, null, 2)},
          backgroundVideo: "${config.assets.backgroundVideo}"
        }}
      />
    </>
  );
};

export default VideoComposition;
`;

    // Write the component to a temporary file
    const componentPath = path.join(this.tempDir, config.script.id, "VideoComposition.tsx");
    await fs.ensureDir(path.dirname(componentPath));
    await fs.writeFile(componentPath, componentCode);

    console.log(`✅ Generated Remotion component: ${componentPath}`);
    return componentPath;
  }

  async writeScriptDataToFile(script: ScriptEntity): Promise<string> {
    const scriptData = {
      id: script.id,
      lines: script.lines,
      background: script.background,
      characters: script.characters,
      metadata: {
        createdAt: new Date().toISOString(),
        totalDuration: this.calculateTotalDuration(script),
        totalFrames: this.calculateDurationInFrames(script),
      },
    };

    const scriptPath = path.join(this.tempDir, script.id, "script.json");
    await fs.ensureDir(path.dirname(scriptPath));
    await fs.writeFile(scriptPath, JSON.stringify(scriptData, null, 2));

    console.log(`✅ Script data written to: ${scriptPath}`);
    return scriptPath;
  }
}
