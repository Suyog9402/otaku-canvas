"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Users, Image as ImageIcon, Sparkles, Trophy } from 'lucide-react';

interface CharacterDNA {
  character_id: string;
  name: string;
  dna_markers: Record<string, string>;
  dna_string: string;
  conversation_history: any[];
  total_conversations: number;
}

interface DemoScenario {
  id: string;
  name: string;
  description: string;
  duration: string;
  characters: string[];
  sequence: Array<{
    action: string;
    scene: string;
    style: string;
  }>;
}

interface PerformanceStats {
  total_generations: number;
  success_rate: string;
  average_generation_time: string;
  registered_characters: number;
  character_consistency_score: string;
  model: string;
  hackathon_optimized: boolean;
}

export default function Gemini25Demo() {
  const [activeTab, setActiveTab] = useState<'demo' | 'stats' | 'scenarios'>('demo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [characterDNA, setCharacterDNA] = useState<CharacterDNA | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<DemoScenario | null>(null);

  useEffect(() => {
    fetchPerformanceStats();
    fetchDemoScenarios();
  }, []);

  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch('/api/v2/gemini-25/performance/stats');
      const data = await response.json();
      if (data.success) {
        setPerformanceStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    }
  };

  const fetchDemoScenarios = async () => {
    try {
      const response = await fetch('/api/v2/gemini-25/hackathon/demo-scenarios');
      const data = await response.json();
      if (data.success) {
        setDemoScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Error fetching demo scenarios:', error);
    }
  };

  const registerCharacter = async () => {
    try {
      const characterData = {
        name: "Akira",
        archetype: "hero",
        appearance: "tall, athletic, spiky black hair, red jacket",
        personality: "brave, determined, confident",
        style: "manga"
      };

      const response = await fetch('/api/v2/gemini-25/characters/akira/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      });

      const data = await response.json();
      if (data.success) {
        setCharacterDNA(data);
      }
    } catch (error) {
      console.error('Error registering character:', error);
    }
  };

  const generateCharacterImage = async (action: string, scene: string) => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('action', action);
      formData.append('scene', scene);
      formData.append('style', 'manga');
      formData.append('sequence_num', '1');

      const response = await fetch('/api/v2/gemini-25/characters/akira/generate', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setGeneratedImages(prev => [...prev, imageUrl]);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const runDemoScenario = async (scenario: DemoScenario) => {
    setCurrentScenario(scenario);
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/v2/gemini-25/hackathon/demo/${scenario.id}/run`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        // Simulate image generation for demo
        setTimeout(() => {
          setGeneratedImages(prev => [...prev, '/images/placeholders/akira.svg']);
          setIsGenerating(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error running demo scenario:', error);
      setIsGenerating(false);
    }
  };

  const conversationalEdit = async (instruction: string) => {
    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('edit_instruction', instruction);

      const response = await fetch('/api/v2/gemini-25/characters/akira/edit', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setGeneratedImages(prev => [...prev, imageUrl]);
      }
    } catch (error) {
      console.error('Error in conversational edit:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Gemini 2.5 Flash Image Preview
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Nano Banana Hackathon - Advanced AI Image Generation
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Character Consistency
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Conversational Editing
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              Multi-turn Generation
            </span>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-lg p-1 flex gap-1">
            {[
              { id: 'demo', label: 'Live Demo', icon: Play },
              { id: 'stats', label: 'Performance', icon: Zap },
              { id: 'scenarios', label: 'Scenarios', icon: Trophy }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Character DNA Panel */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-400" />
                    Character DNA System
                  </h3>
                  
                  {!characterDNA ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">
                        Register a character to enable DNA-based consistency
                      </p>
                      <button
                        onClick={registerCharacter}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Register Akira (Hero)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-400 mb-2">DNA Markers</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(characterDNA.dna_markers).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{key}:</span>
                              <span className="text-white">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-400 mb-2">Conversation History</h4>
                        <p className="text-sm text-gray-300">
                          {characterDNA.total_conversations} conversations recorded
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generation Controls */}
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Image Generation
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => generateCharacterImage("drawing sword", "crumbling tower")}
                        disabled={isGenerating || !characterDNA}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Battle Scene
                      </button>
                      <button
                        onClick={() => generateCharacterImage("standing heroically", "mystical forest")}
                        disabled={isGenerating || !characterDNA}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Hero Pose
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-400">Conversational Editing</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => conversationalEdit("add lightning effects around the character")}
                          disabled={isGenerating || !characterDNA}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Add Lightning
                        </button>
                        <button
                          onClick={() => conversationalEdit("change the background to a sunset")}
                          disabled={isGenerating || !characterDNA}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Sunset BG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Images */}
              {generatedImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-green-400" />
                    Generated Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {generatedImages.map((imageUrl, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800/50 rounded-lg overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="text-sm text-gray-400">Image {index + 1}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generation Status */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-xl font-semibold">Generating with Gemini 2.5...</p>
                    <p className="text-gray-400 mt-2">Creating consistent character images</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceStats && Object.entries(performanceStats).map(([key, value]) => (
                  <div key={key} className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-2 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-3xl font-bold text-blue-400">
                      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scenarios' && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {demoScenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-gray-800/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-2">{scenario.name}</h3>
                    <p className="text-gray-400 mb-4">{scenario.description}</p>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-blue-400">Duration: {scenario.duration}</p>
                      <p className="text-sm text-green-400">
                        Characters: {scenario.characters.join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => runDemoScenario(scenario)}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-semibold transition-all"
                    >
                      {isGenerating && currentScenario?.id === scenario.id ? 'Running...' : 'Run Demo'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
