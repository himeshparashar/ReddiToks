import fs from "fs/promises";
import path from "path";

export interface StorageConfig {
  baseDir: string;
  maxFileSize: number;
  allowedExtensions: string[];
}

export interface FileMetadata {
  originalName: string;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}

export class LocalFileStorage {
  constructor(private config: StorageConfig) {}

  async saveFile(
    buffer: Buffer,
    fileName: string,
    metadata?: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    // TODO: Implement local file storage
    console.log(`Saving file: ${fileName} (${buffer.length} bytes)`);

    await this.ensureDirectoryExists(path.dirname(this.getFullPath(fileName)));

    throw new Error("Local file storage not implemented yet");

    // Implementation:
    // const fullPath = this.getFullPath(fileName);
    // await fs.writeFile(fullPath, buffer);
    //
    // const stats = await fs.stat(fullPath);
    //
    // return {
    //   originalName: metadata?.originalName || fileName,
    //   fileName: fileName,
    //   filePath: fullPath,
    //   size: stats.size,
    //   mimeType: metadata?.mimeType || this.getMimeType(fileName),
    //   createdAt: new Date()
    // };
  }

  async readFile(fileName: string): Promise<Buffer> {
    // TODO: Implement file reading
    const fullPath = this.getFullPath(fileName);

    throw new Error("File reading not implemented yet");

    // return await fs.readFile(fullPath);
  }

  async deleteFile(fileName: string): Promise<void> {
    // TODO: Implement file deletion
    const fullPath = this.getFullPath(fileName);

    throw new Error("File deletion not implemented yet");

    // await fs.unlink(fullPath);
  }

  async fileExists(fileName: string): Promise<boolean> {
    // TODO: Implement file existence check
    const fullPath = this.getFullPath(fileName);

    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async createScriptDirectory(scriptId: string): Promise<string> {
    const scriptDir = path.join(this.config.baseDir, scriptId);

    await this.ensureDirectoryExists(scriptDir);
    await this.ensureDirectoryExists(path.join(scriptDir, "audio"));
    await this.ensureDirectoryExists(path.join(scriptDir, "video"));

    return scriptDir;
  }

  async cleanupScriptDirectory(scriptId: string): Promise<void> {
    // TODO: Implement directory cleanup
    const scriptDir = path.join(this.config.baseDir, scriptId);

    throw new Error("Directory cleanup not implemented yet");

    // await fs.rm(scriptDir, { recursive: true, force: true });
  }

  getAudioFilePath(scriptId: string, lineIndex: number): string {
    return path.join(
      this.config.baseDir,
      scriptId,
      "audio",
      `line_${lineIndex}.mp3`
    );
  }

  getVideoFilePath(scriptId: string): string {
    return path.join(this.config.baseDir, scriptId, "video", `${scriptId}.mp4`);
  }

  getScriptJsonPath(scriptId: string): string {
    return path.join(this.config.baseDir, scriptId, "script.json");
  }

  private getFullPath(fileName: string): string {
    return path.join(this.config.baseDir, fileName);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".json": "application/json",
      ".txt": "text/plain",
    };

    return mimeTypes[ext] || "application/octet-stream";
  }

  private validateFileSize(size: number): void {
    if (size > this.config.maxFileSize) {
      throw new Error(
        `File size ${size} exceeds maximum allowed size ${this.config.maxFileSize}`
      );
    }
  }

  private validateFileExtension(fileName: string): void {
    const ext = path.extname(fileName).toLowerCase();
    if (!this.config.allowedExtensions.includes(ext)) {
      throw new Error(`File extension ${ext} is not allowed`);
    }
  }
}
