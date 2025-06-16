import { ScriptEntity, Script } from "../../domain/entities/Script";
import { RawThreadData } from "./RedditService";
import {
  GeminiClient,
  GeminiRequest,
  GeminiResponse,
} from "../../infrastructure/ai/GeminiClient";
import config from "../../config/env";

export interface LLMServiceInterface {
  generateStructuredScript(rawThread: RawThreadData): Promise<ScriptEntity>;
}

export interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService implements LLMServiceInterface {
  private geminiClient: GeminiClient;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey || config.api.gemini.apiKey;
    const modelName = model || config.api.gemini.model;

    if (!key) {
      throw new Error("Gemini API key is required");
    }

    this.geminiClient = new GeminiClient(key, modelName);
  }
  async generateStructuredScript(
    rawThread: RawThreadData
  ): Promise<ScriptEntity> {
    console.log(`Generating structured script for thread: ${rawThread.title}`);

    try {
      // Build the prompt for Gemini
      const prompt = this.buildPrompt(rawThread);

      // Call Gemini API
      const llmResponse = await this.callLLM({
        prompt,
        maxTokens: 4000,
        temperature: 0.7,
      });

      // Parse the response into a script
      const scriptData = this.parseScriptResponse(llmResponse);

      // Create and return the script entity
      return ScriptEntity.create(scriptData);
    } catch (error) {
      console.error("Error generating script:", error);

      // Fallback to mock data if LLM fails
      console.log("Falling back to mock script data");
      return this.generateMockScript(rawThread);
    }
  }
  private buildPrompt(rawThread: RawThreadData): string {
    return `You are an expert content creator who specializes in turning Reddit posts into engaging TikTok/Reel video scripts.

Convert the following Reddit thread into a conversational video script format. The script should be engaging, natural, and perfect for a short-form video.

**Reddit Thread:**
- Subreddit: r/${rawThread.subreddit}
- Title: ${rawThread.title}
- Author: ${rawThread.author}
- Upvotes: ${rawThread.upvotes}

**Post Content:**
${rawThread.content}

**Top Comments:**
${rawThread.comments
  .slice(0, 3)
  .map(
    (comment, index) =>
      `${index + 1}. ${comment.author} (${comment.upvotes} upvotes): ${
        comment.content
      }`
  )
  .join("\n")}

**Instructions:**
1. Create a script with clear speaker roles: "Narrator", "OP", "Commenter1", "Commenter2", etc.
2. Start with an engaging hook that introduces the situation
3. Present the original post content in a conversational way
4. Include 2-3 of the most interesting/relevant comments
5. End with a call-to-action asking viewers what they think
6. Keep each dialogue line under 50 words for better pacing
7. Make it sound natural and engaging, not robotic

**Output Format (JSON):**
{
  "lines": [
    {
      "speaker": "Narrator",
      "text": "dialogue text here",
      "audioFilePath": "",
      "startTime": 0,
      "duration": 0
    }
  ],
  "background": "minecraft-parkour",
  "characters": ["narrator", "op", "commenter1", "commenter2"]
}

Respond ONLY with valid JSON, no additional text or formatting.`;
  }

  private async callLLM(request: LLMRequest): Promise<LLMResponse> {
    return await this.geminiClient.generateContent({
      prompt: request.prompt,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
    });
  }
  private parseScriptResponse(response: LLMResponse): Omit<Script, "id"> {
    try {
      // Clean the response content to ensure it's valid JSON
      let cleanedContent = response.content.trim();

      // Remove any markdown code blocks if present
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent
          .replace(/```json\s*/, "")
          .replace(/```\s*$/, "");
      }
      if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent
          .replace(/```\s*/, "")
          .replace(/```\s*$/, "");
      }

      const parsed = JSON.parse(cleanedContent);

      // Validate the parsed response
      if (!this.validateResponse(parsed)) {
        throw new Error("Invalid script format from LLM");
      }

      return {
        lines: parsed.lines,
        background: parsed.background || "minecraft-parkour",
        characters: parsed.characters || [
          "narrator",
          "op",
          "commenter1",
          "commenter2",
        ],
      };
    } catch (error) {
      console.error("Failed to parse LLM response:", error);
      console.error("Raw response:", response.content);
      throw new Error("Failed to parse script from LLM response");
    }
  }

  private validateResponse(response: any): boolean {
    // Check if response has required structure
    if (!response || typeof response !== "object") {
      return false;
    }

    if (!Array.isArray(response.lines)) {
      return false;
    }

    // Validate each line has required properties
    for (const line of response.lines) {
      if (!line.speaker || !line.text) {
        return false;
      }
    }

    return true;
  }

  private generateMockScript(rawThread: RawThreadData): ScriptEntity {
    // Fallback mock script if LLM fails
    return ScriptEntity.create({
      lines: [
        {
          speaker: "Narrator",
          text: `Welcome to another episode of Reddit Stories. Today we're diving into a ${rawThread.subreddit} post that's got everyone talking.`,
          audioFilePath: "",
          startTime: 0,
          duration: 0,
        },
        {
          speaker: "OP",
          text: rawThread.content.substring(0, 150) + "...",
          audioFilePath: "",
          startTime: 0,
          duration: 0,
        },
        {
          speaker: "Narrator",
          text: "Let's see what the Reddit community had to say about this situation.",
          audioFilePath: "",
          startTime: 0,
          duration: 0,
        },
        {
          speaker: "Commenter1",
          text:
            rawThread.comments[0]?.content ||
            "This is a complex situation that requires careful consideration.",
          audioFilePath: "",
          startTime: 0,
          duration: 0,
        },
        {
          speaker: "Narrator",
          text: "What do you think? Let us know in the comments below!",
          audioFilePath: "",
          startTime: 0,
          duration: 0,
        },
      ],
      background: "minecraft-parkour",
      characters: ["narrator", "op", "commenter1"],
    });
  }
}
