import axios, { AxiosResponse } from "axios";

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
  model?: string;
}

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
}

export interface ElevenLabsRequest {
  text: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  model_id?: string;
}

export interface UsageInfo {
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
}

export class ElevenLabsClient {
  private baseUrl = "https://api.elevenlabs.io/v1";
  private maxCharactersPerRequest = 1000; // Free tier safe limit
  private requestDelay = 3000; // 3 seconds between requests for free tier
  private lastRequestTime = 0;

  constructor(private config: ElevenLabsConfig) {
    if (!config.apiKey) {
      throw new Error("ElevenLabs API key is required");
    }
  }

  async generateSpeech(
    request: ElevenLabsRequest,
    voiceId: string
  ): Promise<Buffer> {
    try {
      // Free tier rate limiting
      await this.enforceRateLimit();

      // Free tier character limit check
      if (request.text.length > this.maxCharactersPerRequest) {
        throw new Error(
          `Text too long for free tier: ${request.text.length} chars (max: ${this.maxCharactersPerRequest})`
        );
      }

      console.log(`🎤 Generating speech with ElevenLabs for voice: ${voiceId}`);
      console.log(`📝 Text length: ${request.text.length} characters`);

      const url = `${this.baseUrl}/text-to-speech/${voiceId}`;

      const payload = {
        text: request.text,
        model_id: request.model_id || "eleven_monolingual_v1", // Free tier model
        voice_settings: request.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      };

      const response: AxiosResponse<Buffer> = await axios.post(url, payload, {
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.config.apiKey,
        },
        responseType: "arraybuffer",
      });

      const audioBuffer = Buffer.from(response.data);
      console.log(`✅ Generated audio: ${audioBuffer.length} bytes`);

      return audioBuffer;
    } catch (error: any) {
      console.error(
        "ElevenLabs API Error:",
        error.response?.data || error.message
      );

      // Handle common free tier errors
      if (error.response?.status === 401) {
        throw new Error("Invalid ElevenLabs API key");
      } else if (error.response?.status === 429) {
        throw new Error(
          "Rate limit exceeded. Free tier allows 20 requests/minute"
        );
      } else if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === "string" && errorData.includes("character")) {
          throw new Error("Monthly character limit exceeded");
        }
      }

      throw new Error(`Failed to generate speech: ${error.message}`);
    }
  }

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    try {
      await this.enforceRateLimit();

      const url = `${this.baseUrl}/voices`;

      const response = await axios.get(url, {
        headers: {
          Accept: "application/json",
          "xi-api-key": this.config.apiKey,
        },
      });

      return response.data.voices || [];
    } catch (error: any) {
      console.error(
        "Error fetching voices:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to fetch voices: ${error.message}`);
    }
  }

  async getUserInfo(): Promise<UsageInfo> {
    try {
      await this.enforceRateLimit();

      const url = `${this.baseUrl}/user`;

      const response = await axios.get(url, {
        headers: {
          Accept: "application/json",
          "xi-api-key": this.config.apiKey,
        },
      });

      const data = response.data;
      return {
        character_count: data.subscription?.character_count || 0,
        character_limit: data.subscription?.character_limit || 10000,
        can_extend_character_limit:
          data.subscription?.can_extend_character_limit || false,
      };
    } catch (error: any) {
      console.error(
        "Error fetching user info:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }

  // Free tier optimization: Split long text into chunks
  splitTextForFreeTier(text: string): string[] {
    if (text.length <= this.maxCharactersPerRequest) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk =
        currentChunk + (currentChunk ? ". " : "") + trimmedSentence;

      if (potentialChunk.length <= this.maxCharactersPerRequest) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + ".");
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + ".");
    }

    return chunks;
  }

  // Rate limiting for free tier
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(
        `⏳ Rate limiting: waiting ${waitTime}ms for free tier compliance`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  // Free tier voice mapping (using built-in voices)
  getVoiceForCharacter(character: string): string {
    const voiceMap: Record<string, string> = {
      narrator: "pNInz6obpgDQGcFmaJgB", // Adam - professional narrator
      op: "EXAVITQu4vr4xnSDxMaL", // Sarah - young female
      commenter1: "21m00Tcm4TlvDq8ikWAM", // Rachel - different female
      commenter2: "VR6AewLTigWG4xSOukaG", // Josh - male voice
      male: "VR6AewLTigWG4xSOukaG", // Josh
      female: "21m00Tcm4TlvDq8ikWAM", // Rachel
    };

    const normalizedCharacter = character.toLowerCase().replace(/\s+/g, "");
    return voiceMap[normalizedCharacter] || voiceMap["narrator"];
  }

  getDefaultVoiceSettings() {
    return {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    };
  }
}
