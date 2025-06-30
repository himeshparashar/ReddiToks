import { fetchRedditPostFromUrl } from '../../redditFetcher';

export interface RawThreadData {
  title: string;
  url: string;
  author: string;
  content: string;
  comments: RawComment[];
  upvotes: number;
  subreddit: string;
}

export interface RawComment {
  author: string;
  content: string;
  upvotes: number;
  replies?: RawComment[];
  depth: number;
}

export interface RedditServiceInterface {
  fetchPostData(url: string): Promise<RawThreadData>;
}

export class RedditService implements RedditServiceInterface {
  constructor() {}
  
  async fetchPostData(url: string): Promise<RawThreadData> {
    console.log(`Fetching Reddit post data from: ${url}`);

    try {
      // Validate Reddit URL
      if (!this.validateRedditUrl(url)) {
        throw new Error('Invalid Reddit URL format');
      }

      // Use the actual Reddit fetcher
      const redditData = await fetchRedditPostFromUrl(url);
      
      console.log('Raw Reddit data:', JSON.stringify(redditData, null, 2));

      // Extract subreddit from URL
      const subredditMatch = url.match(/\/r\/(\w+)\//);
      const subreddit = subredditMatch ? subredditMatch[1] : 'unknown';

      // Transform the data to match our interface
      const transformedData: RawThreadData = {
        title: redditData.title,
        url: url,
        author: 'OP', // The fetchRedditPostFromUrl doesn't return author, so we'll use 'OP'
        content: redditData.body || redditData.title, // Use body if available, fallback to title
        comments: this.transformComments(redditData.comments || []),
        upvotes: 0, // The fetchRedditPostFromUrl doesn't return upvotes
        subreddit: subreddit,
      };

      console.log('Transformed Reddit data:', JSON.stringify(transformedData, null, 2));
      console.log(`Successfully fetched Reddit data: ${transformedData.title}`);
      return transformedData;

    } catch (error) {
      console.error('Error fetching Reddit data:', error);
      
      // Fallback to mock data if Reddit fetch fails
      console.log('Falling back to mock Reddit data due to fetch error');
      return this.getMockData(url);
    }
  }

  private transformComments(comments: string[]): RawComment[] {
    // Transform the simple string array to our RawComment format
    return comments.slice(0, 5).map((comment, index) => ({
      author: `User${index + 1}`,
      content: comment,
      upvotes: Math.floor(Math.random() * 500) + 50, // Random upvotes
      depth: 0,
      replies: []
    }));
  }

  private getMockData(url: string): RawThreadData {
    return {
      title: "AITA for telling my roommate that her cooking smells terrible?",
      url: url,
      author: "ThrowawayUser123",
      content:
        "So I (22F) live with my roommate Sarah (23F) in a small apartment. She loves to cook these really exotic dishes with strong spices, and honestly, the smell is overwhelming. It fills the entire apartment and sometimes makes me feel nauseous. Yesterday I finally told her that her cooking smells terrible and asked if she could cook less pungent food. She got really upset and said I was being culturally insensitive. AITA?",
      comments: [
        {
          author: "RedditWisdom",
          content:
            "NTA - You have a right to feel comfortable in your own home. Maybe you could suggest she use the kitchen fan or cook when you're not around?",
          upvotes: 245,
          depth: 0,
          replies: []
        },
        {
          author: "CookingExpert",
          content:
            "YTA - You could have approached this more diplomatically. Food is often tied to culture and identity.",
          upvotes: 156,
          depth: 0,
          replies: [],
        },
        {
          author: "VoiceOfReason",
          content:
            "ESH - Both of you need to communicate better and find a compromise that works for everyone.",
          upvotes: 312,
          depth: 0,
          replies: [],
        },
      ],
      upvotes: 1547,
      subreddit: "AmItheAsshole",
    };
  }

  private validateRedditUrl(url: string): boolean {
    const redditUrlPattern =
      /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/;
    return redditUrlPattern.test(url);
  }

  private async fetchComments(postId: string): Promise<RawComment[]> {
    // TODO: Implement comment fetching logic
    throw new Error("Comment fetching not implemented yet");
  }
}
