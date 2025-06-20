import { Request, Response } from 'express';
import { fetchRedditPostFromUrl } from '../redditFetcher'; // Adjust path as needed

export class RedditController {
  // POST /api/reddit/fetch-post
  public async fetchPost(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ success: false, message: 'Reddit URL is required' });
        return;
      }

      const postData = await fetchRedditPostFromUrl(url); // using your function
      res.status(200).json({ success: true, data: postData });

    } catch (error: any) {
      console.error('Error in RedditController:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch Reddit post', error: error.message });
    }
  }
}
