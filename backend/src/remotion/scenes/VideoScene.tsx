import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
  Video,
  AbsoluteFill,
  interpolate,
  spring,
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

            {/* Enhanced Caption/Subtitle with animation */}
            <CaptionComponent 
              text={line.text}
              speaker={line.speaker}
              index={index}
              durationFrames={durationFrames}
            />
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

// Helper function to get speaker color - Enhanced with more vibrant TikTok-style colors
const getSpeakerColor = (speaker: string): string => {
  const colors: Record<string, string> = {
    narrator: '#00ff88',        // Bright green
    op: '#00d4ff',             // Cyan blue  
    commenter1: '#ff6b35',     // Orange red
    commenter2: '#ff3e9d',     // Hot pink
    commenter3: '#9d4edd',     // Purple
    commenter4: '#f72585',     // Magenta
    commenter5: '#4cc9f0',     // Light blue
    default: '#ffffff',        // White for unknown speakers
  };

  const normalizedSpeaker = speaker.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return colors[normalizedSpeaker] || colors.default;
};

// Enhanced Caption Component with animations and modern styling
interface CaptionComponentProps {
  text: string;
  speaker: string;
  index: number;
  durationFrames: number;
}

const CaptionComponent: React.FC<CaptionComponentProps> = ({
  text,
  speaker,
  index,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Animation timing
  const animationDuration = Math.min(15, durationFrames * 0.2); // 20% of duration or 0.5 seconds max
  const exitStart = durationFrames - animationDuration;
  
  // Entry animation
  const entryProgress = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 200,
      mass: 1,
    },
    durationInFrames: animationDuration,
  });
  
  // Exit animation
  const exitProgress = frame >= exitStart 
    ? spring({
        frame: frame - exitStart,
        fps,
        config: {
          damping: 20,
          stiffness: 300,
          mass: 0.8,
        },
        durationInFrames: animationDuration,
      })
    : 0;
  
  // Scale and opacity animations
  const scale = interpolate(entryProgress, [0, 1], [0.8, 1]) * (1 - exitProgress * 0.3);
  const opacity = interpolate(entryProgress, [0, 1], [0, 1]) * (1 - exitProgress);
  const translateY = interpolate(entryProgress, [0, 1], [50, 0]) + (exitProgress * 30);
  
  // Word highlighting effect - more dynamic
  const words = text.split(' ');
  const wordsPerSecond = 2.5; // Slightly slower for better readability
  const totalWordsTime = words.length / wordsPerSecond;
  const currentWordIndex = Math.min(
    Math.floor(((frame / fps) / Math.max(durationFrames / fps, totalWordsTime)) * words.length),
    words.length - 1
  );
  
  // Get speaker-specific styling
  const speakerColor = getSpeakerColor(speaker);
  const isNarrator = speaker.toLowerCase().includes('narrator');
  
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        bottom: isNarrator ? '15%' : '25%', // Different position for narrator
        top: 'auto',
        height: 'auto',
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* Main caption container */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '28px 36px',
          borderRadius: '20px',
          maxWidth: '85%',
          textAlign: 'center',
          position: 'relative',
          border: `2px solid ${speakerColor}`,
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 20px ${speakerColor}30
          `,
          backdropFilter: 'blur(12px)',
          background: `
            linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.8) 100%),
            radial-gradient(circle at top left, ${speakerColor}10 0%, transparent 50%)
          `,
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '5px',
            background: `linear-gradient(90deg, transparent, ${speakerColor}, transparent)`,
            borderRadius: '0 0 10px 10px',
            boxShadow: `0 0 10px ${speakerColor}60`,
          }}
        />
        
        {/* Main text with word highlighting */}
        <div
          style={{
            fontSize: isNarrator ? '34px' : '30px',
            fontWeight: '900',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
            lineHeight: '1.2',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5)',
            letterSpacing: '0.3px',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          {words.map((word, wordIndex) => {
            const isHighlighted = wordIndex === currentWordIndex;
            const hasBeenHighlighted = wordIndex < currentWordIndex;
            const willBeHighlighted = wordIndex > currentWordIndex;
            
            // Staggered animation for each word
            const wordDelay = wordIndex * 2; // 2 frames delay between words
            const wordScale = isHighlighted 
              ? interpolate(frame % 30, [0, 15, 30], [1, 1.1, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp'
                })
              : 1;
            
            return (
              <span
                key={wordIndex}
                style={{
                  color: isHighlighted 
                    ? '#ffffff' 
                    : hasBeenHighlighted 
                      ? '#e0e0e0' 
                      : '#888888',
                  textShadow: isHighlighted 
                    ? `0 0 25px ${speakerColor}, 0 0 40px ${speakerColor}80, 2px 2px 8px rgba(0, 0, 0, 0.9)`
                    : hasBeenHighlighted
                      ? '2px 2px 8px rgba(0, 0, 0, 0.9)'
                      : '2px 2px 4px rgba(0, 0, 0, 0.7)',
                  transform: `scale(${wordScale}) ${isHighlighted ? 'translateY(-2px)' : 'translateY(0px)'}`,
                  display: 'inline-block',
                  margin: '0 6px',
                  fontWeight: isHighlighted ? '900' : '800',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: willBeHighlighted ? 0.6 : 1,
                  filter: isHighlighted ? 'brightness(1.2)' : 'brightness(1)',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
        
        {/* Speaker badge */}
        {!isNarrator && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: speakerColor,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              opacity: 0.9,
              marginTop: '4px',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
            }}
          >
            • {speaker} •
          </div>
        )}
        
        {/* Glowing border effect */}
        <div
          style={{
            position: 'absolute',
            inset: '-1px',
            borderRadius: '21px',
            background: `linear-gradient(45deg, ${speakerColor}40, transparent, ${speakerColor}40)`,
            zIndex: -1,
            opacity: 0.5,
          }}
        />
      </div>
      
      {/* Progress indicator for longer texts */}
      {text.length > 120 && (
        <div
          style={{
            marginTop: '16px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textAlign: 'center',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '1px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (currentWordIndex / words.length) * 100)}%`,
                height: '100%',
                backgroundColor: speakerColor,
                borderRadius: '1px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span>{Math.round((currentWordIndex / words.length) * 100)}%</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
