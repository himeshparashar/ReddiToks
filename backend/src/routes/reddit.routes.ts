import express from 'express';
import { RedditController } from '../controllers/RedditController'; // adjust path if needed

const router = express.Router();
const redditController = new RedditController();

// POST /api/reddit/fetch-post
router.post('/fetch-post', redditController.fetchPost.bind(redditController));

export default router;
