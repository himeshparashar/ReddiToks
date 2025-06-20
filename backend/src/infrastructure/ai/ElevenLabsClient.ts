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

export class ElevenLabsClient {
  constructor(private config: ElevenLabsConfig) {}

  async generateSpeech(request: ElevenLabsRequest): Promise<Buffer> {
    // TODO: Implement ElevenLabs TTS API integration
    console.log(
      `Generating speech for text: ${request.text.substring(0, 50)}...`
    );

    throw new Error("ElevenLabs API integration not implemented yet");

    // Implementation would use fetch to call ElevenLabs API:
    // const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'audio/mpeg',
    //     'Content-Type': 'application/json',
    //     'xi-api-key': this.config.apiKey
    //   },
    //   body: JSON.stringify({
    //     text: request.text,
    //     voice_settings: request.voice_settings || {
    //       stability: 0.5,
    //       similarity_boost: 0.75
    //     },
    //     model_id: request.model_id || 'eleven_monolingual_v1'
    //   })
    // });
    //
    // if (!response.ok) {
    //   throw new Error(`ElevenLabs API error: ${response.statusText}`);
    // }
    //
    // return Buffer.from(await response.arrayBuffer());
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    // TODO: Implement voice listing
    console.log("Fetching available voices from ElevenLabs");

    throw new Error("ElevenLabs voice listing not implemented yet");

    // const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    //   headers: {
    //     'xi-api-key': this.config.apiKey
    //   }
    // });
    //
    // const data = await response.json();
    // return data.voices;
  }

  getDefaultVoiceSettings() {
    return {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    };
  }

  getVoiceForCharacter(character: string): string {
    // TODO: Implement character to voice mapping
    const voiceMap: Record<string, string> = {
      narrator: "pNInz6obpgDQGcFmaJgB", // Adam (default narrator voice)
      op: "EXAVITQu4vr4xnSDxMaL", // Sarah (female voice)
      commenter: "21m00Tcm4TlvDq8ikWAM", // Rachel (another female voice)
      male: "VR6AewLTigWG4xSOukaG", // Josh (male voice)
      female: "jsCqWAovK2LkecY7zXl4", // Jessica (female voice)
    };

    return voiceMap[character.toLowerCase()] || voiceMap["narrator"];
  }
}
