'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const backgroundVideos = [
  {
    id: 'background-video',
    name: 'Background Video',
    thumbnail: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Default',
    duration: '10:00',
  },
];

const categories = ['All', 'Default'];

export default function VideoSelector() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const { backgroundVideo, setBackgroundVideo, script } = useStore();

  const filteredVideos = selectedCategory === 'All' 
    ? backgroundVideos 
    : backgroundVideos.filter(video => video.category === selectedCategory);

  const handleVideoSelect = (videoId: string) => {
    setBackgroundVideo(videoId);
  };

  const handlePreview = (videoId: string) => {
    setPreviewVideo(previewVideo === videoId ? null : videoId);
  };

  if (script.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white">
          <Video className="h-6 w-6 mr-3 text-green-400" />
          Step 3: Choose Background Video
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="presets">Preset Backgrounds</TabsTrigger>
            <TabsTrigger value="upload">Upload Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "transition-all duration-200",
                    selectedCategory === category
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300",
                    backgroundVideo === video.id
                      ? "border-green-500 shadow-lg shadow-green-500/25"
                      : "border-gray-700 hover:border-green-500/50"
                  )}
                  onClick={() => handleVideoSelect(video.id)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[9/16] bg-gray-800 overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
                    
                    {/* Preview Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(video.id);
                        }}
                        className="bg-black/80 hover:bg-black text-white"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>

                    {/* Selected Indicator */}
                    {backgroundVideo === video.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
                      {video.category}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-3 bg-gray-800/50">
                    <h3 className="text-white font-medium text-sm">{video.name}</h3>
                  </div>

                  {/* Preview Indicator */}
                  {previewVideo === video.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center"
                    >
                      <div className="bg-black/80 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                        Previewing...
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-green-500/50 transition-colors duration-300">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Upload Custom Background</h3>
              <p className="text-gray-400 mb-6">
                Upload your own video file (MP4, MOV, AVI) up to 100MB
              </p>
              <Button className="btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Recommended: 9:16 aspect ratio, 1080x1920 resolution
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Selection Summary */}
        {backgroundVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center text-green-400">
              <Check className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Background selected: {backgroundVideos.find(v => v.id === backgroundVideo)?.name}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}