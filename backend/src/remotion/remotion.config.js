import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(1);

// Ensure FFmpeg is used for audio encoding
Config.setCodec('h264');
Config.setCrf(23);
Config.setPixelFormat('yuv420p');
