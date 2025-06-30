'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Video, Download, Share2, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export default function VideoViewer() {
  const { renderStatus, currentRender, resetCreation } = useStore();

  // Helper function to get the full backend video URL
  const getFullVideoUrl = (videoUrl: string | null) => {
    if (!videoUrl) return null;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // If videoUrl already starts with http, return as is, otherwise prepend base URL
    return videoUrl.startsWith('http') ? videoUrl : `${baseUrl}${videoUrl}`;
  };

  const fullVideoUrl = getFullVideoUrl(currentRender.videoUrl);

  const handleDownload = () => {
    if (fullVideoUrl) {
      window.open(fullVideoUrl, '_blank');
      toast.success('Download started!');
    }
  };

  const handleShare = () => {
    if (fullVideoUrl) {
      navigator.clipboard.writeText(fullVideoUrl);
      toast.success('Video link copied to clipboard!');
    }
  };

  const handleOpenInNewTab = () => {
    if (fullVideoUrl) {
      window.open(fullVideoUrl, '_blank');
    }
  };

  const handleCreateAnother = () => {
    resetCreation();
    toast.success('Ready to create another video!');
  };

  // Don't show anything if no video generation has started
  if (renderStatus === 'idle') {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {renderStatus === 'rendering' && (
        <motion.div
          key="rendering"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-8"
        >
          <Card className="glass border-green-500/30">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Video className="h-8 w-8 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Generating Your Video</h3>
                <p className="text-gray-300">
                  {currentRender.message || 'Processing your request...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-4">
                <Progress value={currentRender.progress} className="h-3" />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Processing...</span>
                  <span>{Math.round(currentRender.progress || 0)}%</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3 text-white">
                  <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                  <span className="text-sm">{currentRender.message || 'Initializing...'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {renderStatus === 'completed' && fullVideoUrl && (
        <motion.div
          key="completed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          {/* Success Card */}
          <Card className="glass border-green-500/30 bg-green-500/5">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Video className="h-8 w-8 text-white" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Video Generated!</h3>
              <p className="text-gray-300 mb-6">
                Your Reddit thread has been transformed into a viral-ready video.
              </p>

              {/* Video Preview */}
              <div className="aspect-[9/16] max-w-xs mx-auto bg-gray-800 rounded-lg overflow-hidden mb-6 border border-gray-700">
                <video 
                  src={fullVideoUrl || undefined} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    toast.error('Error playing video. Please try downloading it.');
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button onClick={handleDownload} className="btn-primary">
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
                <Button onClick={handleShare} variant="outline" className="btn-secondary">
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={handleOpenInNewTab} variant="outline" className="btn-secondary">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              {/* Create Another Button */}
              <div className="border-t border-gray-700 pt-6">
                <Button onClick={handleCreateAnother} variant="outline" className="w-full sm:w-auto">
                  <Video className="h-4 w-4 mr-2" />
                  Create Another Video
                </Button>
              </div>

              {/* Video Info */}
              <div className="text-sm text-gray-400">
                <p>Video ID: {currentRender.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Clock, label: 'Status', value: 'Complete' },
              { icon: Video, label: 'Quality', value: 'HD' },
              { icon: Download, label: 'Format', value: 'MP4' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass rounded-lg p-4 text-center"
              >
                <stat.icon className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {renderStatus === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="glass border-red-500/30 bg-red-500/5">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Generation Failed</h3>
              <p className="text-gray-300 mb-6">
                There was an error generating your video. Please try again.
              </p>
              
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
