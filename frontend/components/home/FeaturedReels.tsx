'use client';

import { motion } from 'framer-motion';
import { Play, Eye, ThumbsUp, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featuredVideos = [
  {
    id: 1,
    title: "r/AskReddit: What's the weirdest thing you've seen?",
    thumbnail: "https://images.pexels.com/photos/5662857/pexels-photo-5662857.jpeg?auto=compress&cs=tinysrgb&w=400",
    views: "2.1M",
    likes: "45K",
    duration: "0:47",
    voices: ["Trump", "Obama"],
  },
  {
    id: 2,
    title: "r/tifu: TIFU by accidentally ordering 100 pizzas",
    thumbnail: "https://images.pexels.com/photos/4126743/pexels-photo-4126743.jpeg?auto=compress&cs=tinysrgb&w=400",
    views: "1.8M",
    likes: "38K",
    duration: "1:12",
    voices: ["Morgan Freeman", "Stewie"],
  },
  {
    id: 3,
    title: "r/relationships: My cat is judging my life choices",
    thumbnail: "https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=400",
    views: "956K",
    likes: "23K",
    duration: "0:33",
    voices: ["British", "Robot"],
  },
];

export default function FeaturedReels() {
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-white">Viral</span>{' '}
          <span className="text-gradient">Examples</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          See what others have created. These Reddit threads became viral sensations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredVideos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group cursor-pointer"
          >
            <div className="glass rounded-2xl overflow-hidden group-hover:card-glow transition-all duration-300">
              {/* Video Thumbnail */}
              <div className="relative aspect-[9/16] bg-gray-800 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 p-0">
                    <Play className="h-6 w-6 text-white ml-1" />
                  </Button>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>

                {/* Voices Used */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {video.voices.map((voice, idx) => (
                    <span
                      key={idx}
                      className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full"
                    >
                      {voice}
                    </span>
                  ))}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3 text-left line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {video.views}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {video.likes}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        <Button variant="outline" className="btn-secondary">
          View All Examples
        </Button>
      </motion.div>
    </div>
  );
}