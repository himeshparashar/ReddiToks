import { ScriptEntity, DialogueLine } from "../../domain/entities/Script";
import {
  ElevenLabsClient,
  ElevenLabsConfig,
} from "../../infrastructure/ai/ElevenLabsClient";
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
          const audioFilePath = await this.generateAudioForLine(
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

  async generateAudioForLine(
    line: DialogueLine,
    scriptId?: string,
    lineIndex?: number
  ): Promise<string> {
    console.log(
      `🎤 Generating audio for line: ${line.speaker} - ${line.text.substring(
        0,
        50
      )}...`
    );

    try {
      const voiceId = this.elevenLabsClient.getVoiceForCharacter(line.speaker);

      // Check text length for free tier
      if (line.text.length > 1000) {
        console.warn(
          `⚠️ Text too long for free tier (${line.text.length} chars), truncating...`
        );
        line.text = line.text.substring(0, 1000);
      }

      const audioBuffer = await this.elevenLabsClient.generateSpeech(
        {
          text: line.text,
          voice_settings: this.elevenLabsClient.getDefaultVoiceSettings(),
        },
        voiceId
      );

      // Save audio file
      const fileName = `${scriptId || "line"}_${lineIndex || Date.now()}.mp3`;
      const audioDir = path.join(
        this.audioOutputDir,
        scriptId || "temp",
        "audio"
      );
      await fs.ensureDir(audioDir);

      const filePath = path.join(audioDir, fileName);
      await fs.writeFile(filePath, audioBuffer);

      console.log(`✅ Saved audio file: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`❌ Failed to generate audio for line: ${error}`);
      // Return mock path as fallback
      return `/audio/mock_${scriptId || "line"}_${lineIndex || Date.now()}.mp3`;
    }
  }

  // Mock implementation for fallback
  private async generateMockAudioForScript(
    script: ScriptEntity
  ): Promise<ScriptEntity> {
    console.log("🎭 Using mock audio generation");

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing

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

  // Estimate audio duration based on text length and speaking rate
  private estimateAudioDuration(text: string): number {
    const wordsPerMinute = 150; // Average speaking rate
    const words = text.split(" ").length;
    const minutes = words / wordsPerMinute;
    const seconds = minutes * 60;
    return Math.max(1, Math.round(seconds * 10) / 10); // Minimum 1 second, rounded to 1 decimal
  }
}
