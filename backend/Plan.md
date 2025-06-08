📄 Document: Video Generation Service Architecture (Node.js)

Purpose: Decoupled backend service dedicated to automating video generation from Reddit content using AI (LLM, TTS) and Remotion.

## 🚀 What is This?

This is a Node.js microservice responsible for generating TikTok/Reel-style videos from Reddit threads.

🔹 It scrapes Reddit content  
🔹 Structures it using an LLM (e.g., OpenAI)  
🔹 Generates voiceover with AI Text-to-Speech (e.g., ElevenLabs, Bark)  
🔹 Creates timed captions  
🔹 Renders everything into a polished video using Remotion

This service is backend-only and is intended to be consumed by a frontend (e.g. a Next.js app).

---

────────────────────────────

🧱 High-Level Structure

Services:

Controller Layer (API)

Application Layer (Use Cases)

Domain Layer (Entities + Logic)

Infrastructure Layer (AI APIs, file storage, Remotion)

Directory Structure (Clean Architecture style):

video-generator/
├── src/
│ ├── application/
│ │ ├── usecases/
│ │ │ └── GenerateVideoUseCase.ts
│ │ └── services/
│ │ ├── RedditService.ts
│ │ ├── LLMService.ts
│ │ ├── TTSService.ts
│ │ └── RemotionService.ts
│ ├── domain/
│ │ ├── entities/
│ │ │ └── Script.ts
│ │ └── valueObjects/
│ │ └── Dialogue.ts
│ ├── infrastructure/
│ │ ├── remotion/
│ │ ├── ai/
│ │ ├── storage/
│ │ └── audio/
│ ├── controllers/
│ │ └── GenerateVideoController.ts
│ ├── config/
│ │ └── env.ts
│ └── index.ts
├── public/
├── scripts/
└── package.json

────────────────────────────

🧠 Domain Entities

Script.ts

export interface DialogueLine {
speaker: string;
text: string;
audioFilePath: string;
startTime: number;
duration: number;
}

export interface Script {
id: string;
lines: DialogueLine[];
background: string;
characters: string[];
}

────────────────────────────

⚙️ Services Overview

RedditService

fetchPostData(url): Promise<RawThreadData>

Uses snoowrap, Reddit API, or Cheerio for scraping

LLMService

generateStructuredScript(rawThread): Promise<Script>

Interacts with OpenAI API or local LLM

Maps thread into DialogueLine[]

TTSService

generateAudioForScript(script): Promise<DialogueLine[]>

Calls ElevenLabs/PlayHT

Stores audio files locally or S3

RemotionService

renderVideo(script: Script): Promise<string>

Writes a script.json

Invokes Remotion CLI or Node renderMedia API

Returns final video file path

────────────────────────────

🚀 Application Flow

GenerateVideoUseCase.ts

export async function execute(req): Promise<string> {
const rawThread = await RedditService.fetchPostData(req.url);
const script = await LLMService.generateStructuredScript(rawThread);
const scriptWithAudio = await TTSService.generateAudioForScript(script);
const videoPath = await RemotionService.renderVideo(scriptWithAudio);
return videoPath;
}

────────────────────────────

🌐 REST API (Controller Layer)

POST /api/generate-video

Body:
{
"redditUrl": "https://reddit.com/r/funny/...",
"background": "space-loop.mp4",
"characters": ["trump.png", "biden.png"]
}

Response:
{
"videoUrl": "https://cdn.domain.com/videos/xyz.mp4"
}

────────────────────────────

💽 File System

/temp/{scriptId}/audio/

/temp/{scriptId}/script.json

/temp/{scriptId}/video.mp4

Use local tmp folder in dev, and S3/GCS bucket in prod.

────────────────────────────

🛠️ Tech Stack

Layer Tech
Runtime Node.js (ESM)
API Express or Fastify
LLM OpenAI / Claude
TTS ElevenLabs / Bark
Renderer Remotion (renderMedia)
Storage Local FS / S3
Video Host S3 / Cloudflare R2
