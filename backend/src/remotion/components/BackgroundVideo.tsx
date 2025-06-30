import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  Video,
  staticFile,
  Sequence,
} from 'remotion';

export interface BackgroundVideoProps {
  src: string;
  scriptDurationInSeconds: number;
  backgroundVideoDurationSeconds?: number; // Optional: if known, can be passed in
}

export const BackgroundVideoComponent: React.FC<BackgroundVideoProps> = ({
  src,
  scriptDurationInSeconds,
  backgroundVideoDurationSeconds = 30, // Default assumption: 30 seconds
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const scriptDurationInFrames = Math.floor(scriptDurationInSeconds * fps);
  const backgroundDurationInFrames = Math.floor(backgroundVideoDurationSeconds * fps);
  
  console.log(`🎥 BackgroundVideo: ${backgroundVideoDurationSeconds}s background, ${scriptDurationInSeconds}s script`);

  if (backgroundVideoDurationSeconds >= scriptDurationInSeconds) {
    // Background video is longer or equal - clip it to script duration
    console.log(`✂️ BackgroundVideo: Clipping background video to ${scriptDurationInSeconds}s`);
    return (
      <Video
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        startFrom={0}
        endAt={scriptDurationInFrames}
        muted
      />
    );
  } else {
    // Background video is shorter - create multiple sequences to loop it
    const loops = Math.ceil(scriptDurationInSeconds / backgroundVideoDurationSeconds);
    console.log(`🔄 BackgroundVideo: Looping background video ${loops} times`);
    const sequences = [];

    for (let i = 0; i < loops; i++) {
      const sequenceStart = i * backgroundDurationInFrames;
      const remainingFrames = scriptDurationInFrames - sequenceStart;
      const sequenceDuration = Math.min(backgroundDurationInFrames, remainingFrames);

      if (sequenceDuration > 0) {
        sequences.push(
          <Sequence
            key={i}
            from={sequenceStart}
            durationInFrames={sequenceDuration}
          >
            <Video
              src={staticFile(src)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              startFrom={0}
              endAt={sequenceDuration}
              muted
            />
          </Sequence>
        );
      }
    }

    return <>{sequences}</>;
  }
};
