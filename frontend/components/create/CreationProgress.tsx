'use client';

import { motion } from 'framer-motion';
import { Check, Link2, MessageSquare, Video, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const steps = [
  { icon: Link2, label: 'Reddit Input', key: 'input' },
  { icon: MessageSquare, label: 'Script & Voices', key: 'script' },
  { icon: Video, label: 'Style & Background', key: 'style' },
  { icon: Zap, label: 'Generate', key: 'generate' },
];

export default function CreationProgress() {
  const { redditThread, script, backgroundVideo, renderStatus, currentRender } = useStore();

  const getStepStatus = (stepKey: string) => {
    switch (stepKey) {
      case 'input':
        return redditThread ? 'completed' : 'current';
      case 'script':
        return !redditThread ? 'pending' : script.length > 0 ? 'completed' : 'current';
      case 'style':
        return !redditThread || script.length === 0 ? 'pending' : backgroundVideo ? 'completed' : 'current';
      case 'generate':
        if (!redditThread || script.length === 0 || !backgroundVideo) return 'pending';
        if (renderStatus === 'completed') return 'completed';
        if (renderStatus === 'rendering') return 'current';
        return 'current';
      default:
        return 'pending';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    status === 'completed' && "bg-green-500 border-green-500",
                    status === 'current' && "bg-green-500/20 border-green-500 pulse-glow",
                    status === 'pending' && "bg-gray-800 border-gray-600"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <step.icon 
                      className={cn(
                        "h-6 w-6",
                        status === 'current' && "text-green-400",
                        status === 'pending' && "text-gray-400"
                      )} 
                    />
                  )}
                </motion.div>
                
                {/* Step Label */}
                <span 
                  className={cn(
                    "text-sm mt-2 font-medium transition-colors duration-300",
                    status === 'completed' && "text-green-400",
                    status === 'current' && "text-green-400",
                    status === 'pending' && "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-0.5 w-16 mx-4 transition-all duration-500",
                    getStepStatus(steps[index + 1].key) !== 'pending' 
                      ? "bg-green-500" 
                      : "bg-gray-600"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}