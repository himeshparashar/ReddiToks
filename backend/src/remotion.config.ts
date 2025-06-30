import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(23);

// Set concurrency to 1 for better stability
Config.setConcurrency(1);

// Enable logging
Config.setLevel('info');
