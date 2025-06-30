import React from 'react';
import { Composition } from 'remotion';
import { VideoScene } from './scenes/VideoScene';
import { ScriptEntity } from '../domain/entities/Script';

export interface VideoProps {
  script: ScriptEntity;
  backgroundVideo: string;
  backgroundVideoDurationSeconds?: number;
}

export const VideoComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="RedditVideo"
        component={VideoScene as any}
        durationInFrames={3000} // Will be calculated dynamically
        fps={30}
        width={1080}
        height={1920} // Vertical video for TikTok/Reels
        defaultProps={{
          script: new ScriptEntity('default', [], 'background-video.mp4', []),
          backgroundVideo: 'background-video.mp4',
          backgroundVideoDurationSeconds: 60
        }}
        calculateMetadata={({ props }) => {
          const videoProps = props as any;
          if (!videoProps.script || !videoProps.script.lines) {
            return {
              durationInFrames: 900, // 30 seconds default
              fps: 30,
              width: 1080,
              height: 1920,
            };
          }
          
          const script = videoProps.script;
          
          // Calculate total duration more accurately
          let totalDuration = 0;
          for (const line of script.lines) {
            const lineEnd = line.startTime + line.duration;
            if (lineEnd > totalDuration) {
              totalDuration = lineEnd;
            }
          }
          
          // Add buffer but cap at reasonable maximum
          const finalDuration = Math.min(totalDuration + 2, 60); // Max 60 seconds
          const frames = Math.ceil(finalDuration * 30); // 30 FPS
          
          console.log(`Video duration: ${finalDuration}s (${frames} frames)`);
          
          return {
            durationInFrames: frames,
            fps: 30,
            width: 1080,
            height: 1920,
          };
        }}
      />
    </>
  );
};
