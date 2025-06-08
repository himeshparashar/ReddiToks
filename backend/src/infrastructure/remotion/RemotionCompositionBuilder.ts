import { ScriptEntity } from "../../domain/entities/Script";

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
  constructor() {}

  buildComposition(script: ScriptEntity): RemotionConfig {
    // TODO: Build Remotion composition configuration
    // This will be used to generate the actual Remotion composition

    console.log(`Building Remotion composition for script: ${script.id}`);

    throw new Error(
      "RemotionCompositionBuilder.buildComposition not implemented yet"
    );

    // Mock return structure:
    // return {
    //   composition: {
    //     id: script.id,
    //     fps: 30,
    //     durationInFrames: this.calculateDurationInFrames(script),
    //     width: 1080,
    //     height: 1920 // Vertical video for TikTok/Reels
    //   },
    //   script: script,
    //   assets: {
    //     backgroundVideo: script.background,
    //     characterImages: script.characters,
    //     audioFiles: script.lines.map(line => line.audioFilePath)
    //   }
    // };
  }

  private calculateDurationInFrames(
    script: ScriptEntity,
    fps: number = 30
  ): number {
    const totalDurationSeconds = script.lines.reduce(
      (total, line) => total + line.duration,
      0
    );
    return Math.ceil(totalDurationSeconds * fps);
  }

  generateRemotionComponent(config: RemotionConfig): string {
    // TODO: Generate the actual Remotion React component code
    // This would create a .tsx file that Remotion can render

    throw new Error("Remotion component generation not implemented yet");

    // Example structure:
    // return `
    //   import { Composition } from 'remotion';
    //   import { VideoScene } from './VideoScene';
    //
    //   export const VideoComposition = () => {
    //     return (
    //       <Composition
    //         id="${config.composition.id}"
    //         component={VideoScene}
    //         durationInFrames={${config.composition.durationInFrames}}
    //         fps={${config.composition.fps}}
    //         width={${config.composition.width}}
    //         height={${config.composition.height}}
    //         defaultProps={{
    //           script: ${JSON.stringify(config.script)},
    //           assets: ${JSON.stringify(config.assets)}
    //         }}
    //       />
    //     );
    //   };
    // `;
  }
}
