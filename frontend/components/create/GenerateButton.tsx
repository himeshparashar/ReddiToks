'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Users, Video, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

const renderSteps = [
  { label: 'Processing script', duration: 2000 },
  { label: 'Generating AI voices', duration: 3000 },
  { label: 'Syncing with background', duration: 2500 },
  { label: 'Adding subtitles', duration: 1500 },
  { label: 'Final rendering', duration: 2000 },
];

export default function GenerateButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const { script, backgroundVideo, selectedVoices, renderStatus, setRenderStatus } = useStore();

  const canGenerate = script.length > 0 && backgroundVideo;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Please complete all steps before generating');
      return;
    }

    setIsGenerating(true);
    setRenderStatus('rendering');
    setProgress(0);
    setCurrentStep(0);

    // Simulate the rendering process
    for (let i = 0; i < renderSteps.length; i++) {
      setCurrentStep(i);
      
      // Animate progress for current step
      const stepProgress = (i / renderSteps.length) * 100;
      const nextStepProgress = ((i + 1) / renderSteps.length) * 100;
      
      // Gradually increase progress during this step
      const stepDuration = renderSteps[i].duration;
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (nextStepProgress - stepProgress) / (stepDuration / 100);
          return Math.min(newProgress, nextStepProgress);
        });
      }, 100);

      await new Promise(resolve => setTimeout(resolve, stepDuration));
      clearInterval(progressInterval);
      setProgress(nextStepProgress);
    }

    // Complete the generation
    setIsComplete(true);
    setIsGenerating(false);
    setRenderStatus('completed');
    setGeneratedVideoUrl('https://example.com/generated-video.mp4');
    toast.success('Video generated successfully!');
  };

  const handleDownload = () => {
    toast.success('Download started!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(generatedVideoUrl || '');
    toast.success('Video link copied to clipboard!');
  };

  const resetGeneration = () => {
    setIsComplete(false);
    setIsGenerating(false);
    setProgress(0);
    setCurrentStep(0);
    setGeneratedVideoUrl(null);
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
              <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Video Preview</p>
                  <p className="text-xs text-gray-400">Click to play</p>
                </div>
              </div>
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
            { icon: Clock, label: 'Render Time', value: '47 seconds' },
            { icon: Users, label: 'Voices Used', value: `${Object.keys(selectedVoices).length}` },
            { icon: Video, label: 'Duration', value: '1:23' },
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
              {renderSteps[currentStep]?.label || 'Processing...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-4">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Step {currentStep + 1} of {renderSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Steps List */}
          <div className="mt-8 space-y-3">
            {renderSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 ${
                  index < currentStep
                    ? 'text-green-400'
                    : index === currentStep
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    index < currentStep
                      ? 'bg-green-400'
                      : index === currentStep
                      ? 'bg-white animate-pulse'
                      : 'bg-gray-600'
                  }`}
                />
                <span className="text-sm">{step.label}</span>
              </div>
            ))}
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
          Your script has {script.length} lines with {Object.keys(selectedVoices).length} different voices.
          This will create approximately a {Math.ceil(script.reduce((acc, line) => acc + line.text.length / 150, 0))} minute video.
        </p>

        {/* Generation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Voices', value: Object.keys(selectedVoices).length },
            { icon: Video, label: 'Lines', value: script.length },
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