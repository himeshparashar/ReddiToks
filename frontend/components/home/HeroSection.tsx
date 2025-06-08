'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-8"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Turn Reddit into Viral Content
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="text-white">Create</span>{' '}
          <span className="text-gradient">Viral AI Videos</span>{' '}
          <span className="text-white">from Reddit</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Transform Reddit threads into engaging short-form videos with AI voices, 
          custom characters, and viral-ready captions. No editing skills required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Link href="/create">
            <Button className="btn-primary text-lg px-8 py-4 h-auto">
              <Play className="h-5 w-5 mr-2" />
              Start Creating Free
            </Button>
          </Link>
          <Button variant="outline" className="btn-secondary text-lg px-8 py-4 h-auto">
            <TrendingUp className="h-5 w-5 mr-2" />
            View Examples
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: '50K+', label: 'Videos Created' },
            { number: '2M+', label: 'Views Generated' },
            { number: '15+', label: 'AI Voices' },
          ].map((stat, index) => (
            <div key={index} className="glass rounded-xl p-6">
              <div className="text-3xl font-bold text-gradient mb-2">{stat.number}</div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}