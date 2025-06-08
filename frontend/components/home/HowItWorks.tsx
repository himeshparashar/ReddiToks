'use client';

import { motion } from 'framer-motion';
import { Link2, MessageSquare, Mic, Video } from 'lucide-react';

const steps = [
  {
    icon: Link2,
    title: 'Paste Reddit URL',
    description: 'Simply paste any Reddit thread URL or browse trending posts to get started.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Converts to Script',
    description: 'Our AI automatically converts comments into a structured video script.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Mic,
    title: 'Assign AI Voices',
    description: 'Choose from celebrity voices, characters, or create custom voice personas.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Video,
    title: 'Generate & Share',
    description: 'Watch your video render and share it across all social platforms.',
    color: 'from-green-500 to-green-600',
  },
];

export default function HowItWorks() {
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
          <span className="text-white">How It</span>{' '}
          <span className="text-gradient">Works</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Create viral content in 4 simple steps. No video editing experience required.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="relative group"
          >
            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-green-500/50 to-transparent z-0" />
            )}
            
            <div className="glass rounded-2xl p-8 relative z-10 group-hover:card-glow transition-all duration-300">
              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}