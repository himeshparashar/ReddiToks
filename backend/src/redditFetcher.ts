import snoowrap from 'snoowrap';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.REDDIT_USER_AGENT)
console.log(process.env.REDDIT_CLIENT_ID)
console.log(process.env.REDDIT_CLIENT_SECRET)
console.log(process.env.REDDIT_USERNAME)
console.log(process.env.REDDIT_PASSWORD)
const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT || '',
  clientId: process.env.REDDIT_CLIENT_ID || '',
  clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  username: process.env.REDDIT_USERNAME || '',
  password: process.env.REDDIT_PASSWORD || '',
});


const extractPostId = (url: string): string | null => {
  const match = url.match(/comments\/(\w+)\//);
  return match ? match[1] : null;
};

export const fetchRedditPostFromUrl = async (url: string): Promise<any> => {
  const postId = extractPostId(url);

  if (!postId) {
    throw new Error("Invalid Reddit URL");
  }

  try {
    const post: any = reddit.getSubmission(postId);
    const postData = await post.fetch();  

    const comments: any[] = await post.comments;

    // Return useful data here:
    return {
      title: post.title,
      body: post.selftext,
      comments: comments.map((comment: any) => comment.body),
    };

  } catch (error) {
    console.error("Error fetching Reddit post:", error);
    throw error;
  }
};
