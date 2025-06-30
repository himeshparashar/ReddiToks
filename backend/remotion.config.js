"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@remotion/cli/config");
config_1.Config.setVideoImageFormat('jpeg');
config_1.Config.setOverwriteOutput(true);
config_1.Config.setPixelFormat('yuv420p');
config_1.Config.setCodec('h264');
config_1.Config.setCrf(23);
// Set concurrency to 1 for better stability
config_1.Config.setConcurrency(1);
// Enable logging
config_1.Config.setLevel('info');
