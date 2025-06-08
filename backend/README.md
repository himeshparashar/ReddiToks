# ReddiToks Backend Service

A Node.js TypeScript microservice for generating TikTok/Reel-style videos from Reddit content using AI (LLM, TTS) and Remotion.

## 🚀 Features

- **Reddit Content Scraping**: Fetch posts and comments from Reddit
- **AI Script Generation**: Convert Reddit threads into structured dialogue scripts using LLM
- **Text-to-Speech**: Generate voiceovers using ElevenLabs/PlayHT
- **Video Rendering**: Create polished videos using Remotion
- **Clean Architecture**: Decoupled, maintainable code structure
- **RESTful API**: Easy integration with frontend applications

## 🏗️ Architecture

The service follows Clean Architecture principles with clear separation of concerns:

```
src/
├── application/          # Use cases and application services
│   ├── services/        # Domain services (Reddit, LLM, TTS, Remotion)
│   └── usecases/        # Business logic orchestration
├── domain/              # Business entities and value objects
│   ├── entities/        # Core business entities
│   └── valueObjects/    # Domain value objects
├── infrastructure/      # External integrations and utilities
│   ├── ai/             # AI service clients (OpenAI, ElevenLabs)
│   ├── audio/          # Audio processing utilities
│   ├── remotion/       # Remotion composition builders
│   ├── storage/        # File storage implementations
│   └── utils/          # Shared utilities
├── controllers/         # HTTP request handlers
├── config/             # Configuration management
└── index.ts           # Application entry point
```

## 📋 Prerequisites

- Node.js 18+
- TypeScript
- FFmpeg (for audio processing)
- API keys for:
  - OpenAI (for LLM)
  - ElevenLabs (for TTS)
  - Reddit API (optional, for better rate limits)

## 🛠️ Installation

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys and configuration.

3. **Build the project:**
   ```bash
   npm run build
   ```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### With Watch Mode

```bash
npm run dev:watch
```

## 📡 API Endpoints

### Generate Video

```http
POST /api/generate-video
Content-Type: application/json

{
  "redditUrl": "https://reddit.com/r/funny/comments/...",
  "background": "space-loop.mp4",
  "characters": ["trump.png", "biden.png"],
  "options": {
    "quality": "medium",
    "resolution": "1080p"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "videoUrl": "https://cdn.domain.com/videos/xyz.mp4",
    "scriptId": "script_123",
    "processingTime": 45000
  }
}
```

### Get Progress

```http
GET /api/progress/:scriptId
```

### Cancel Generation

```http
DELETE /api/cancel/:scriptId
```

### Health Check

```http
GET /health
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔧 Configuration

### Environment Variables

| Variable             | Description                          | Default       |
| -------------------- | ------------------------------------ | ------------- |
| `NODE_ENV`           | Environment (development/production) | `development` |
| `PORT`               | Server port                          | `3001`        |
| `OPENAI_API_KEY`     | OpenAI API key                       | Required      |
| `ELEVENLABS_API_KEY` | ElevenLabs API key                   | Required      |
| `TEMP_DIR`           | Temporary files directory            | `./temp`      |
| `PUBLIC_DIR`         | Public files directory               | `./public`    |

### Video Settings

- **Quality**: `low`, `medium`, `high`
- **Resolution**: `720p`, `1080p`, `4k`
- **Max Duration**: 300 seconds (5 minutes)

## 🏃‍♂️ Development Workflow

1. **Make changes** to the source code
2. **Run tests** to ensure everything works
3. **Run linting** to maintain code quality
4. **Test the API** using your preferred HTTP client

## 📁 File Structure

```
temp/
├── {scriptId}/
│   ├── audio/
│   │   └── line_0.mp3
│   ├── video/
│   │   └── {scriptId}.mp4
│   └── script.json

public/
└── videos/
    └── {scriptId}.mp4
```

## 🚧 Current Status

This is a **boilerplate implementation**. The following components need to be implemented:

- [ ] Reddit API integration
- [ ] OpenAI API integration
- [ ] ElevenLabs TTS integration
- [ ] Remotion video rendering
- [ ] File storage operations
- [ ] Audio processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📝 License

ISC License
