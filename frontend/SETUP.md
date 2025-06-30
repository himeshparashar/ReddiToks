# ReddiToks Frontend Setup

This is the frontend application for ReddiToks, a tool that converts Reddit threads into viral videos.

## Features Implemented

1. **Reddit URL Input**: Users can paste any Reddit URL
2. **Auto Script Generation**: Automatically generates a script with title + 2 comments
3. **Background Video Selection**: Uses `background-video.mp4` from the backend
4. **Video Generation**: Integrates with the backend API to generate videos
5. **Progress Tracking**: Real-time progress updates during video generation
6. **Video Preview**: Shows the generated video with controls

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   - Copy `.env.local` and update the backend URL if needed
   - Default backend URL: `http://localhost:3001`

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/generate-video` - Generate video from Reddit URL
- `GET /api/progress/:scriptId` - Get generation progress
- `DELETE /api/cancel/:scriptId` - Cancel video generation
- `GET /background-video.mp4` - Background video file

## Current Configuration

- **Background Video**: Uses `background-video.mp4` from backend
- **Characters**: Hardcoded to `["Peter_Griffin.png"]`
- **Script Generation**: Title + 2 comments (reduced from 5)
- **Quality**: Medium quality, 1080p resolution
- **Voice Settings**: Default voice with stability 0.5

## User Flow

1. User pastes Reddit URL
2. System auto-generates script (title + 2 comments)
3. Background video auto-selected
4. User clicks "Generate Video"
5. System calls backend API
6. Progress tracking shows real-time updates
7. Generated video is displayed with controls

## Files Modified

- `components/create/RedditInputCard.tsx` - Reddit URL input
- `components/create/ScriptEditor.tsx` - Script generation (reduced to 2 comments)
- `components/create/VideoSelector.tsx` - Background video selection with preview
- `components/create/GenerateButton.tsx` - API integration and progress tracking
- `store/useStore.ts` - State management
- `lib/api.ts` - API service functions
- `.env.local` - Environment configuration
