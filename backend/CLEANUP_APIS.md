# Cleanup and Management APIs

This document describes the cleanup and file management APIs available in the ReddiToks backend.

## Base URL
All endpoints are prefixed with `/api`

## Endpoints

### 1. Cleanup Temp Files (Specific Script)
**DELETE** `/api/cleanup/temp/:scriptId`

Cleans up temporary files for a specific script.

**Parameters:**
- `scriptId` (path parameter): The ID of the script whose temp files should be deleted

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedFiles": ["./temp/script_123"],
    "message": "Cleaned up temp files for script: script_123"
  },
  "message": "Temporary files for script script_123 cleaned up successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/cleanup/temp/script_1751267936839_gnoh6avag
```

---

### 2. Cleanup All Temp Files
**DELETE** `/api/cleanup/temp`

Cleans up all temporary files in the temp directory.

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedFiles": ["./temp/script_123", "./temp/script_456"],
    "message": "Cleaned up all temp files (2 items)"
  },
  "message": "All temporary files cleaned up successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/cleanup/temp
```

---

### 3. Delete Video (Specific Script)
**DELETE** `/api/videos/:scriptId`

Deletes a specific video and all its associated files (audio, temp files).

**Parameters:**
- `scriptId` (path parameter): The ID of the script whose video should be deleted

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Successfully deleted video and associated files for script: script_123"
  },
  "message": "Video for script script_123 deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/videos/script_1751267936839_gnoh6avag
```

---

### 4. Delete All Videos
**DELETE** `/api/videos`

Deletes all videos and associated files.

**Response:**
```json
{
  "success": true,
  "data": {
    "deletedCount": 3,
    "message": "Successfully deleted 3 videos and all associated files"
  },
  "message": "All videos deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/videos
```

---

### 5. List Temp Files
**GET** `/api/temp-files`

Lists all temporary files and directories.

**Response:**
```json
{
  "success": true,
  "data": {
    "tempFiles": ["script_123", "script_456"],
    "totalSize": 45.67
  },
  "message": "Temporary files listed successfully"
}
```

**Example:**
```bash
curl http://localhost:3000/api/temp-files
```

---

### 6. List Videos
**GET** `/api/videos`

Lists all generated videos with metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [
      {
        "name": "script_1751267936839_gnoh6avag.mp4",
        "size": 12.34,
        "created": "2025-06-30T15:30:00.000Z"
      }
    ],
    "totalCount": 1
  },
  "message": "Videos listed successfully"
}
```

**Example:**
```bash
curl http://localhost:3000/api/videos
```

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Script ID is required",
  "message": "Missing script ID parameter"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to cleanup temp files: ENOENT: no such file or directory",
  "message": "Could not cleanup temporary files"
}
```

---

## Usage Notes

1. **Safety**: The delete operations are permanent and cannot be undone.
2. **Performance**: Listing operations may be slow with large numbers of files.
3. **Disk Space**: Use cleanup operations regularly to free up disk space.
4. **File Sizes**: All file sizes are returned in MB (megabytes).
5. **Timestamps**: All timestamps are in ISO 8601 format (UTC).

---

## Integration with Video Generation

These cleanup APIs work alongside the main video generation endpoints:

- `/api/generate-video` - Generate a new video
- `/api/progress/:scriptId` - Check generation progress  
- `/api/cancel/:scriptId` - Cancel video generation

The cleanup APIs help manage the files created during the video generation process.
