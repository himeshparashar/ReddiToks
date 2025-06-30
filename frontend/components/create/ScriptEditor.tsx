'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Play, Pause, Edit3, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const availableVoices = [
  { id: 'trump', name: 'Donald Trump', category: 'Political' },
  { id: 'obama', name: 'Barack Obama', category: 'Political' },
  { id: 'morgan-freeman', name: 'Morgan Freeman', category: 'Celebrity' },
  { id: 'stewie', name: 'Stewie Griffin', category: 'Character' },
  { id: 'british', name: 'British Accent', category: 'Accent' },
  { id: 'robot', name: 'Robot Voice', category: 'Synthetic' },
  { id: 'narrator', name: 'Documentary Narrator', category: 'Professional' },
  { id: 'spongebob', name: 'SpongeBob', category: 'Character' },
];

export default function ScriptEditor() {
  const { redditThread, script, updateScript, addScriptLine, updateScriptLine, removeScriptLine, selectedVoices, setVoice } = useStore();
  const [editingLine, setEditingLine] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // Auto-generate script from Reddit thread if empty
  useEffect(() => {
    if (redditThread && script.length === 0) {
      const generatedScript = [
        {
          id: '1',
          speaker: 'Narrator',
          text: redditThread.title,
          voiceId: 'narrator',
        },
        ...redditThread.comments.slice(0, 5).map((comment, index) => ({
          id: (index + 2).toString(),
          speaker: comment.author || `User ${index + 1}`,
          text: comment.text,
          voiceId: availableVoices[index % availableVoices.length].id,
        })),
      ];
      updateScript(generatedScript);
    }
  }, [redditThread, script.length, updateScript]);

  const handleVoicePreview = (voiceId: string, lineId: string) => {
    setPlayingVoice(lineId);
    // Simulate voice playback
    setTimeout(() => setPlayingVoice(null), 2000);
  };

  const handleAddLine = () => {
    addScriptLine({
      speaker: 'New Speaker',
      text: 'Enter your text here...',
      voiceId: 'narrator',
    });
  };

  if (!redditThread) {
    return null;
  }

  return (
    <Card className="glass border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-white">
          <MessageSquare className="h-6 w-6 mr-3 text-green-400" />
          Step 2: Edit Script & Assign Voices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Script Lines */}
        <div className="space-y-4">
          {script.map((line, index) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Line Number */}
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-medium text-sm flex-shrink-0 mt-1">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-3">
                  {/* Speaker & Voice Selection */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Speaker</label>
                      {editingLine === line.id ? (
                        <Input
                          value={line.speaker}
                          onChange={(e) => updateScriptLine(line.id, { speaker: e.target.value })}
                          className="bg-gray-800/50 border-gray-600 text-white"
                          onBlur={() => setEditingLine(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingLine(null)}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingLine(line.id)}
                          className="text-white font-medium cursor-pointer hover:text-green-400 transition-colors"
                        >
                          {line.speaker}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Voice</label>
                      <Select
                        value={line.voiceId}
                        onValueChange={(value) => {
                          updateScriptLine(line.id, { voiceId: value });
                          setVoice(line.speaker, value);
                        }}
                      >
                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-gray-700">
                              <div className="flex items-center justify-between w-full">
                                <span>{voice.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{voice.category}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Voice Preview Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVoicePreview(line.voiceId, line.id)}
                      disabled={playingVoice === line.id}
                      className="bg-gray-800/50 border-gray-600 hover:bg-gray-700 text-white mt-auto"
                    >
                      {playingVoice === line.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Text Content */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Text</label>
                    <Textarea
                      value={line.text}
                      onChange={(e) => updateScriptLine(line.id, { text: e.target.value })}
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
                      placeholder="Enter the dialogue text..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLine(line.id)}
                        className="text-gray-400 hover:text-green-400"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScriptLine(line.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Voice Preview Indicator */}
              {playingVoice === line.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center text-green-400 text-sm"
                >
                  <div className="flex space-x-1 mr-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-4 bg-green-400 rounded-full"
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  Playing {availableVoices.find(v => v.id === line.voiceId)?.name} voice...
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Add New Line Button */}
        <Button
          onClick={handleAddLine}
          variant="outline"
          className="w-full bg-gray-800/30 border-gray-600 hover:bg-gray-700 text-white border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Line
        </Button>

        {/* Script Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
          <span>{script.length} lines total</span>
          <span>~{Math.ceil(script.reduce((acc, line) => acc + line.text.length / 150, 0))} min estimated</span>
        </div>
      </CardContent>
    </Card>
  );
}