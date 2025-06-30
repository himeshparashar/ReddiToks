import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
  Video,
  AbsoluteFill,
} from 'remotion';
import { ScriptEntity } from '../../domain/entities/Script';
import { BackgroundVideoComponent } from '../components/BackgroundVideo';

export interface VideoSceneProps {
  script: ScriptEntity;
  backgroundVideo?: string;
  backgroundVideoDurationSeconds?: number;
}

export const VideoScene: React.FC<VideoSceneProps> = ({
  script,
  backgroundVideo = 'background-video.mp4',
  backgroundVideoDurationSeconds = 60,
}) => {
  // Handle case where script might be undefined
  if (!script || !script.lines || script.lines.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: 24 }}>No script provided</div>
      </AbsoluteFill>
    );
  }
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Calculate total script duration in frames
  const scriptDurationInFrames = durationInFrames;
  const scriptDurationInSeconds = scriptDurationInFrames / fps;

  // Calculate when each dialogue line should appear
  const getFrameFromTime = (timeInSeconds: number): number => {
    return Math.floor(timeInSeconds * fps);
  };

  const getDurationInFrames = (durationInSeconds: number): number => {
    return Math.floor(durationInSeconds * fps);
  };

  return (
    <AbsoluteFill>
      {/* Background Video with intelligent duration handling */}
      <BackgroundVideoComponent
        src={backgroundVideo}
        scriptDurationInSeconds={scriptDurationInSeconds}
        backgroundVideoDurationSeconds={backgroundVideoDurationSeconds}
      />

      {/* Audio sequences for each dialogue line */}
      {script.lines.map((line, index) => {
        const startFrame = getFrameFromTime(line.startTime);
        const durationFrames = getDurationInFrames(line.duration);

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationFrames}>
            {/* Audio */}
            {line.audioFilePath && (
              <Audio 
                src={staticFile(line.audioFilePath)}
              />
            )}

            {/* Caption/Subtitle */}
            <AbsoluteFill
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                bottom: '20%',
                top: 'auto',
                height: 'auto',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: '20px 30px',
                  borderRadius: '12px',
                  maxWidth: '90%',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.4',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {line.text}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#ffcc00',
                    marginTop: '8px',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '600',
                  }}
                >
                  - {line.speaker}
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Visual indicator for current speaker */}
      {script.lines.map((line, index) => {
        const startFrame = getFrameFromTime(line.startTime);
        const durationFrames = getDurationInFrames(line.duration);
        const isActive = frame >= startFrame && frame < startFrame + durationFrames;

        if (!isActive) return null;

        return (
          <AbsoluteFill
            key={`speaker-${index}`}
            style={{
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              padding: '20px',
            }}
          >
            <div
              style={{
                backgroundColor: getSpeakerColor(line.speaker),
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {line.speaker}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// Helper function to get speaker color
const getSpeakerColor = (speaker: string): string => {
  const colors: Record<string, string> = {
    narrator: '#4CAF50',
    op: '#2196F3',
    commenter1: '#FF9800',
    commenter2: '#9C27B0',
    commenter3: '#F44336',
    default: '#607D8B',
  };

  const normalizedSpeaker = speaker.toLowerCase().replace(/\s+/g, '');
  return colors[normalizedSpeaker] || colors.default;
};
