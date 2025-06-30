'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { videoApi } from '@/lib/api';
import { getVideoUrl, isVideoAccessible, logVideoStatus } from '@/lib/videoUtils';

export default function GenerateButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const { 
    redditThread, 
    backgroundVideo, 
    renderStatus, 
    setRenderStatus, 
    setVideoUrl,
    updateRenderProgress,
    setRenderScriptId
  } = useStore();

  const canGenerate = redditThread && backgroundVideo === 'background-video';

  const handleGenerate = async () => {
    if (!canGenerate || !redditThread) {
      toast.error('Please complete all steps before generating');
      return;
    }

    setIsGenerating(true);
    setRenderStatus('rendering');

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
        // Check if video is already complete (API returns videoUrl when done)
        if (response.data.videoUrl) {
          // Video is complete - use the provided video URL directly
          console.log('Video generation completed immediately! Video URL:', response.data.videoUrl);
          setRenderScriptId(response.data.scriptId);
          setVideoUrl(response.data.videoUrl);
          updateRenderProgress(100, 'Video generated successfully!');
          setRenderStatus('completed');
          toast.success('Video generated successfully!');
        } else if (response.data.scriptId) {
          // Video is still processing - start polling
          console.log('Starting progress polling for scriptId:', response.data.scriptId);
          setRenderScriptId(response.data.scriptId);
          updateRenderProgress(0, 'Video generation started...');
          await pollProgress(response.data.scriptId);
        } else {
          throw new Error('No scriptId or videoUrl returned from API');
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
        console.log(`Polling progress for scriptId: ${scriptId}, attempt: ${pollCount + 1}`);
        const progressResponse = await videoApi.getProgress(scriptId);
        
        console.log('Progress response:', progressResponse);
        
        if (progressResponse.success && progressResponse.data) {
          const { 
            currentStep, 
            stepProgress, 
            overallProgress, 
            estimatedTimeRemaining, 
            message, 
            status,
            videoUrl 
          } = progressResponse.data;
          
          console.log(`Status: ${status || currentStep}, Progress: ${overallProgress}%, Step: ${currentStep}, Message: ${message}`);
          
          updateRenderProgress(overallProgress || 0, message || `${currentStep}...`);

          // Check if video generation is complete
          // Backend might not include "status" field, so check if currentStep indicates completion
          const isComplete = status === 'completed' || 
                            currentStep === 'completed' || 
                            currentStep === 'done' ||
                            overallProgress >= 100;

          if (isComplete) {
            // Video is complete - construct the video URL if not provided
            let finalVideoUrl = videoUrl;
            if (!finalVideoUrl) {
              // Construct the video URL based on the pattern /videos/scriptId.mp4
              finalVideoUrl = getVideoUrl(scriptId);
            }
            
            console.log('Video generation completed! Video URL:', finalVideoUrl);
            logVideoStatus(scriptId, { currentStep, finalVideoUrl, overallProgress });
            
            // Set the video URL and mark as completed
            setVideoUrl(finalVideoUrl);
            setIsGenerating(false);
            setRenderStatus('completed');
            toast.success('Video generated successfully!');
            return; // Stop polling
            
          } else if (currentStep === 'error' || currentStep === 'failed') {
            throw new Error(message || 'Video generation failed');
            
          } else {
            // Continue polling - video is still being processed
            if (pollCount < maxPolls) {
              pollCount++;
              setTimeout(poll, 5000); // Poll every 5 seconds
            } else {
              throw new Error('Video generation timed out after 10 minutes');
            }
          }
        } else {
          throw new Error(progressResponse.error || 'Failed to get progress');
        }
      } catch (error) {
        console.error('Progress polling error:', error);
        setIsGenerating(false);
        setRenderStatus('error');
        toast.error(`Failed to track video progress: ${error}`);
      }
    };

    setTimeout(poll, 2000); // Start polling after 2 seconds
  };

  if (!canGenerate) {
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

  if (renderStatus === 'rendering' || renderStatus === 'completed') {
    // VideoViewer handles the rendering and completed states
    return null;
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
          disabled={!canGenerate || isGenerating}
          className="btn-primary text-xl px-12 py-6 h-auto"
        >
          <Zap className="h-6 w-6 mr-3" />
          {isGenerating ? 'Generating...' : 'Generate Video'}
        </Button>
        
        <p className="text-gray-400 text-sm mt-4">
          This will take approximately 2-3 minutes to complete
        </p>
      </CardContent>
    </Card>
  );
}