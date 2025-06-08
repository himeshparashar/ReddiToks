'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Search, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const trendingPosts = [
  {
    id: 1,
    title: "What's the weirdest thing you've seen in someone else's house?",
    subreddit: "r/AskReddit",
    upvotes: "12.5k",
    comments: 3247,
  },
  {
    id: 2,
    title: "TIFU by accidentally sending my resignation letter to the wrong person",
    subreddit: "r/tifu",
    upvotes: "8.9k",
    comments: 892,
  },
  {
    id: 3,
    title: "My neighbor keeps leaving passive-aggressive notes. How should I respond?",
    subreddit: "r/relationships",
    upvotes: "6.7k",
    comments: 1543,
  },
];

export default function RedditInputCard() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setRedditThread } = useStore();

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast.error('Please enter a Reddit URL');
      return;
    }

    if (!url.includes('reddit.com')) {
      toast.error('Please enter a valid Reddit URL');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setRedditThread({
        title: "What's the weirdest thing you've seen in someone else's house?",
        url: url,
        comments: [
          { author: "user1", text: "I once saw a life-size cardboard cutout of Danny DeVito in someone's living room" },
          { author: "user2", text: "My friend's mom had a shrine dedicated to Nicolas Cage movies" },
          { author: "user3", text: "Walked into a bathroom that was completely covered in rubber ducks" }
        ],
        author: "AskRedditBot",
        upvotes: 12500
      });
      setIsLoading(false);
      toast.success('Reddit thread loaded successfully!');
    }, 2000);
  };

  const handleTrendingSelect = (post: any) => {
    setIsLoading(true);
    
    // Simulate loading trending post
    setTimeout(() => {
      setRedditThread({
        title: post.title,
        url: `https://reddit.com${post.subreddit}/comments/example`,
        comments: [
          { author: "user1", text: "This is so relatable!" },
          { author: "user2", text: "I can't believe this actually happened" },
          { author: "user3", text: "Plot twist incoming..." }
        ],
        author: "RedditUser",
        upvotes: parseInt(post.upvotes.replace('k', '000'))
      });
      setIsLoading(false);
      toast.success('Trending post loaded!');
    }, 1500);
  };

  return (
    <Card className="glass border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white">
          <Link2 className="h-6 w-6 mr-3 text-green-400" />
          Step 1: Choose Your Reddit Thread
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url">Paste URL</TabsTrigger>
            <TabsTrigger value="trending">Browse Trending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="https://reddit.com/r/AskReddit/comments/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <Button 
                onClick={handleUrlSubmit}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              Paste any Reddit thread URL to convert it into a viral video
            </p>
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-400 font-medium">Trending Now</span>
              </div>
              
              {trendingPosts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-green-500/50 cursor-pointer transition-all duration-200"
                  onClick={() => handleTrendingSelect(post)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium text-sm leading-tight flex-1 mr-3">
                      {post.title}
                    </h3>
                    <span className="text-green-400 text-xs font-medium">
                      {post.subreddit}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs space-x-4">
                    <span>↑ {post.upvotes}</span>
                    <span>💬 {post.comments.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}