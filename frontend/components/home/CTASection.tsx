'use client';

import { motion } from 'framer-motion';
import { Zap, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="relative">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-gradient-to-r from-green-500/10 to-green-400/5 blur-3xl" />
      </div>

      <div className="relative glass rounded-3xl p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Ready to Go</span>{' '}
            <span className="text-gradient">Viral?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of content creators turning Reddit gold into viral videos. 
            Start your first video today – it's completely free!
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Generate videos in under 2 minutes',
            },
            {
              icon: Users,
              title: '15+ AI Voices',
              description: 'Celebrity & character voices included',
            },
            {
              icon: Trophy,
              title: 'Viral Ready',
              description: 'Optimized for TikTok, Instagram & YouTube',
            },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link href="/create">
            <Button className="btn-primary text-xl px-12 py-6 h-auto">
              Start Creating Now
            </Button>
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            No credit card required • Free forever • 1-click sharing
          </p>
        </motion.div>
      </div>
    </div>
  );
}