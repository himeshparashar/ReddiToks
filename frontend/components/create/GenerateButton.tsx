'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Users, Video, Download, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { videoApi } from '@/lib/api';

export default function GenerateButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  const { 
    redditThread, 
    backgroundVideo, 
    renderStatus, 
    setRenderStatus, 
    currentRender,
    setVideoUrl,
    updateRenderProgress 
  } = useStore();

  const canGenerate = redditThread && backgroundVideo === 'background-video';

  const handleGenerate = async () => {
    if (!canGenerate || !redditThread) {
      toast.error('Please complete all steps before generating');
      return;
    }

    setIsGenerating(true);
    setRenderStatus('rendering');
    setProgress(0);
    setCurrentMessage('Preparing video generation...');

    try {
      // Make API call to generate video
      const response = await videoApi.generateVideo({
        redditUrl: redditThread.url,
        background: 'background-video.mp4',
        characters: ['Peter_Griffin.png'],
        options: {
          quality: 'medium',
          resolution: '1080p',
          voiceSettings: {
            voice_id: 'default',
            stability: 0.5,
            similarity_boost: 0.5
          }
        }
      });

      if (response.success && response.data) {
        // Start polling for progress if we get a scriptId
        if (response.data.scriptId) {
          await pollProgress(response.data.scriptId);
        } else if (response.data.videoUrl) {
          // Video is already complete
          setVideoUrl(response.data.videoUrl);
          setIsComplete(true);
          setRenderStatus('completed');
          toast.success('Video generated successfully!');
        }
      } else {
        throw new Error(response.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setRenderStatus('error');
      toast.error('Failed to generate video. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const pollProgress = async (scriptId: string) => {
    const maxPolls = 120; // 10 minutes max (5 second intervals)
    let pollCount = 0;

    const poll = async () => {
      try {
        const progressResponse = await videoApi.getProgress(scriptId);
        
        if (progressResponse.success && progressResponse.data) {
          const { status, progress: apiProgress, message, videoUrl } = progressResponse.data;
          
          setProgress(apiProgress);
          setCurrentMessage(message);
          updateRenderProgress(apiProgress, message);

          if (status === 'completed' && videoUrl) {
            setVideoUrl(videoUrl);
            setIsComplete(true);
            setRenderStatus('completed');
            toast.success('Video generated successfully!');
            return;
          } else if (status === 'error') {
            throw new Error('Video generation failed');
          } else if (pollCount < maxPolls) {
            // Continue polling
            pollCount++;
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            throw new Error('Video generation timed out');
          }
        } else {
          throw new Error('Failed to get progress');
        }
      } catch (error) {
        console.error('Progress polling error:', error);
        setRenderStatus('error');
        toast.error('Failed to track video progress');
      }
    };

    setTimeout(poll, 2000); // Start polling after 2 seconds
  };

  const handleDownload = () => {
    if (currentRender.videoUrl) {
      window.open(currentRender.videoUrl, '_blank');
      toast.success('Download started!');
    } else {
      toast.error('No video available for download');
    }
  };

  const handleShare = () => {
    if (currentRender.videoUrl) {
      navigator.clipboard.writeText(currentRender.videoUrl);
      toast.success('Video link copied to clipboard!');
    } else {
      toast.error('No video URL to share');
    }
  };

  const resetGeneration = () => {
    setIsComplete(false);
    setIsGenerating(false);
    setProgress(0);
    setCurrentMessage('');
    setRenderStatus('idle');
  };

  if (!canGenerate && !isGenerating && !isComplete) {
    return (
      <Card className="glass border-gray-700/50 opacity-50">
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Complete All Steps</h3>
          <p className="text-gray-500">
            Add a Reddit thread, edit your script, and choose a background video to continue.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
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
            <div className="aspect-[9/16] max-w-xs mx-auto bg-gray-800 rounded-lg overflow-hidden mb-6">
              {currentRender.videoUrl ? (
                <div className="w-full h-full relative">
                  <video 
                    src={currentRender.videoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    poster="/api/placeholder/300/533"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(currentRender.videoUrl!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">Video Preview</p>
                    <p className="text-xs text-gray-400">Processing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleDownload} className="btn-primary">
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
              <Button onClick={handleShare} variant="outline" className="btn-secondary">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>

            {/* Create Another */}
            <Button
              onClick={resetGeneration}
              variant="ghost"
              className="mt-4 text-gray-400 hover:text-green-400"
            >
              Create Another Video
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Clock, label: 'Status', value: 'Complete' },
            { icon: Users, label: 'Quality', value: 'HD' },
            { icon: Video, label: 'Format', value: 'MP4' },
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
    );
  }

  if (isGenerating) {
    return (
      <Card className="glass border-green-500/30">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Zap className="h-8 w-8 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Generating Your Video</h3>
            <p className="text-gray-300">
              {currentMessage || 'Processing your request...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm">{currentMessage || 'Initializing...'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-green-500/20">
      <CardContent className="p-8 text-center">
        <Zap className="h-12 w-12 text-green-400 mx-auto mb-6" />
        
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Generate!</h3>
        <p className="text-gray-300 mb-8">
          Transform your Reddit thread into an engaging video with AI-powered voices and smooth background visuals.
        </p>

        {/* Generation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Quality', value: 'HD' },
            { icon: Video, label: 'Format', value: 'MP4' },
            { icon: Clock, label: 'Est. Time', value: '~2 min' },
          ].map((stat, index) => (
            <div key={index} className="glass rounded-lg p-4">
              <stat.icon className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-semibold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="btn-primary text-xl px-12 py-6 h-auto"
        >
          <Zap className="h-6 w-6 mr-3" />
          Generate Video
        </Button>
        
        <p className="text-gray-400 text-sm mt-4">
          This will take approximately 2-3 minutes to complete
        </p>
      </CardContent>
    </Card>
  );
}