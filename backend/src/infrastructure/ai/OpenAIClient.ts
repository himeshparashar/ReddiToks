export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  constructor(private config: OpenAIConfig) {}

  async createChatCompletion(
    messages: OpenAIMessage[]
  ): Promise<OpenAIResponse> {
    // TODO: Implement OpenAI API integration
    console.log(`Creating chat completion with ${messages.length} messages`);

    throw new Error("OpenAI API integration not implemented yet");

    // Implementation would use fetch or axios to call OpenAI API:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: this.config.model,
    //     messages: messages,
    //     max_tokens: this.config.maxTokens,
    //     temperature: this.config.temperature
    //   })
    // });
    //
    // return await response.json();
  }

  buildSystemPrompt(): string {
    return `You are an expert content creator specializing in converting Reddit threads into engaging TikTok/Reel-style video scripts.

Your task is to:
1. Analyze the Reddit thread content
2. Create a structured dialogue script with clear speakers
3. Ensure the content is engaging and suitable for short-form video
4. Format the output as a JSON structure with dialogue lines

Output format:
{
  "lines": [
    {
      "speaker": "narrator|op|commenter",
      "text": "dialogue text",
      "startTime": 0,
      "duration": 0
    }
  ],
  "background": "suggested background theme",
  "characters": ["suggested character images"]
}

Keep the script concise, engaging, and under 60 seconds when spoken.`;
  }

  buildUserPrompt(redditData: any): string {
    return `Convert this Reddit thread into a TikTok-style video script:

Title: ${redditData.title}
Author: ${redditData.author}
Subreddit: r/${redditData.subreddit}
Content: ${redditData.content}

Top Comments:
${redditData.comments
  .slice(0, 3)
  .map(
    (comment: any, index: number) =>
      `${index + 1}. ${comment.author}: ${comment.content}`
  )
  .join("\n")}

Create an engaging dialogue script that captures the essence of this thread.`;
  }
}
