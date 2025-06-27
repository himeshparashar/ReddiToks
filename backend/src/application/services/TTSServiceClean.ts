import { ScriptEntity, DialogueLine } from "../../domain/entities/Script";
import {
  ElevenLabsClient,
  ElevenLabsConfig,
} from "../../infrastructure/ai/ElevenLabsClientClean";
import * as fs from "fs-extra";
import * as path from "path";
import config from "../../config/env";

export interface TTSServiceInterface {
  generateAudioForScript(script: ScriptEntity): Promise<ScriptEntity>;
  generateAudioForLine(line: DialogueLine): Promise<string>;
}

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface AudioMetadata {
  duration: number;
  filePath: string;
  format: string;
  sampleRate: number;
}

export class TTSService implements TTSServiceInterface {
  private elevenLabsClient: ElevenLabsClient;
  private audioOutputDir: string;

  constructor(
    apiKey?: string,
    private provider: "elevenlabs" | "playht" | "bark" = "elevenlabs"
  ) {
    const key = apiKey || config.api.elevenlabs.apiKey;

    if (!key) {
      console.warn(
        "⚠️ No ElevenLabs API key provided - will use mock implementation"
      );
    }

    this.elevenLabsClient = new ElevenLabsClient({ apiKey: key || "mock-key" });
    this.audioOutputDir = config.storage.tempDir;
  }

  async generateAudioForScript(script: ScriptEntity): Promise<ScriptEntity> {
    console.log(`🎵 Generating audio for script: ${script.id}`);

    try {
      // Check if we have a valid API key
      if (
        !config.api.elevenlabs.apiKey ||
        config.api.elevenlabs.apiKey === "mock-key"
      ) {
        console.log("⚠️ No ElevenLabs API key - using mock implementation");
        return this.generateMockAudioForScript(script);
      }

      // Create audio directory for this script
      const scriptAudioDir = path.join(this.audioOutputDir, script.id, "audio");
      await fs.ensureDir(scriptAudioDir);

      // Check free tier usage before processing
      try {
        const usage = await this.elevenLabsClient.getUserInfo();
        console.log(
          `📊 ElevenLabs usage: ${usage.character_count}/${usage.character_limit} characters`
        );

        if (usage.character_count >= usage.character_limit) {
          console.warn(
            "⚠️ ElevenLabs character limit reached - using mock implementation"
          );
          return this.generateMockAudioForScript(script);
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not check ElevenLabs usage - proceeding with generation"
        );
      }

      const updatedLines: DialogueLine[] = [];
      let currentTime = 0;

      // Process each dialogue line
      for (let i = 0; i < script.lines.length; i++) {
        const line = script.lines[i];
        console.log(
          `🎤 Processing line ${i + 1}/${script.lines.length}: ${line.speaker}`
        );

        try {
          // Generate audio for this line
          const audioFilePath = await this.generateAudioForLineReal(
            line,
            script.id,
            i
          );

          // Estimate duration (you could implement actual audio duration detection)
          const estimatedDuration = this.estimateAudioDuration(line.text);

          const updatedLine: DialogueLine = {
            ...line,
            audioFilePath,
            startTime: currentTime,
            duration: estimatedDuration,
          };

          updatedLines.push(updatedLine);
          currentTime += estimatedDuration + 0.5; // Add 0.5s pause between lines
        } catch (error) {
          console.error(`❌ Failed to generate audio for line ${i}: ${error}`);

          // Fallback to mock for this line
          const mockPath = `/audio/mock_${script.id}_line_${i}.mp3`;
          const estimatedDuration = this.estimateAudioDuration(line.text);

          updatedLines.push({
            ...line,
            audioFilePath: mockPath,
            startTime: currentTime,
            duration: estimatedDuration,
          });

          currentTime += estimatedDuration + 0.5;
        }
      }

      console.log(`✅ Audio generation completed for script: ${script.id}`);

      return new ScriptEntity(
        script.id,
        updatedLines,
        script.background,
        script.characters
      );
    } catch (error) {
      console.error(`❌ Error generating audio for script: ${error}`);
      console.log("🔄 Falling back to mock implementation");
      return this.generateMockAudioForScript(script);
    }
  }

  async generateAudioForLine(line: DialogueLine): Promise<string> {
    console.log(
      `🎤 Generating audio for line: ${line.speaker} - ${line.text.substring(
        0,
        50
      )}...`
    );

    // Mock implementation - return fake audio file path
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `/audio/mock_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.mp3`;
  }

  private async generateAudioForLineReal(
    line: DialogueLine,
    scriptId: string,
    lineIndex: number
  ): Promise<string> {
    try {
      // Get voice for this speaker
      const voiceId = this.elevenLabsClient.getVoiceForCharacter(line.speaker);

      // Generate audio with ElevenLabs
      const audioBuffer = await this.elevenLabsClient.generateSpeech(
        {
          text: line.text,
          voice_settings: this.elevenLabsClient.getDefaultVoiceSettings(),
        },
        voiceId
      );

      // Save audio file
      const fileName = `${scriptId}_line_${lineIndex}.mp3`;
      const audioDir = path.join(this.audioOutputDir, scriptId, "audio");
      const filePath = path.join(audioDir, fileName);

      await fs.writeFile(filePath, audioBuffer);

      console.log(`✅ Saved audio file: ${fileName}`);
      return filePath;
    } catch (error) {
      console.error(`❌ Failed to generate real audio: ${error}`);
      throw error;
    }
  }

  private generateMockAudioForScript(script: ScriptEntity): ScriptEntity {
    console.log("🎭 Generating mock audio for script");

    const updatedLines = script.lines.map((line, index) => ({
      ...line,
      audioFilePath: `/audio/mock_${script.id}_line_${index}.mp3`,
      duration: this.estimateAudioDuration(line.text),
    }));

    // Calculate start times based on durations
    let currentTime = 0;
    const linesWithTiming = updatedLines.map((line) => {
      const lineWithStartTime = {
        ...line,
        startTime: currentTime,
      };
      currentTime += line.duration + 0.5; // Add 0.5s pause between lines
      return lineWithStartTime;
    });

    return new ScriptEntity(
      script.id,
      linesWithTiming,
      script.background,
      script.characters
    );
  }

  private estimateAudioDuration(text: string): number {
    // Rough estimation: average speaking speed is about 150 words per minute
    // That's about 2.5 words per second
    const words = text.split(" ").length;
    const wordsPerSecond = 2.5;
    const estimatedDuration = words / wordsPerSecond;

    // Minimum duration of 1 second, maximum of 10 seconds per line
    return Math.max(1, Math.min(10, estimatedDuration));
  }

  private getVoiceForSpeaker(speaker: string): string {
    return this.elevenLabsClient.getVoiceForCharacter(speaker);
  }
}
