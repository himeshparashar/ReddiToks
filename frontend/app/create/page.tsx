'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import RedditInputCard from '@/components/create/RedditInputCard';
import ScriptEditor from '@/components/create/ScriptEditor';
import VideoSelector from '@/components/create/VideoSelector';
import GenerateButton from '@/components/create/GenerateButton';
import CreationProgress from '@/components/create/CreationProgress';

export default function CreatePage() {
  const { setIsCreating, isCreating, redditThread } = useStore();

  useEffect(() => {
    setIsCreating(true);
    return () => setIsCreating(false);
  }, [setIsCreating]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Create Your</span>{' '}
            <span className="text-gradient">Viral Video</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform any Reddit thread into an engaging AI-powered video in minutes
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <CreationProgress />

        {/* Creation Steps */}
        <div className="space-y-8">
          {/* Step 1: Reddit Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RedditInputCard />
          </motion.div>

          {/* Step 2: Script Editor (only show if we have a thread) */}
          {redditThread && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ScriptEditor />
            </motion.div>
          )}

          {/* Step 3: Video Selector (only show if we have a thread) */}
          {redditThread && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <VideoSelector />
            </motion.div>
          )}

          {/* Step 4: Generate Button */}
          {redditThread && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <GenerateButton />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}