'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Play, Zap } from 'lucide-react'

interface SampleStory {
  title: string
  category: string
  story: string
  preview: string
}

interface DemoModeProps {
  sampleStories: SampleStory[]
  onStorySelect: (story: SampleStory) => void
  onClose: () => void
}

export default function DemoMode({ sampleStories, onStorySelect, onClose }: DemoModeProps) {
  const [selectedDemo, setSelectedDemo] = useState<SampleStory | null>(null)
  const [showingResult, setShowingResult] = useState(false)

  const runInstantDemo = (demoStory: SampleStory) => {
    setSelectedDemo(demoStory)
    setShowingResult(true)
    // Simulate instant generation for demo
    setTimeout(() => {
      onStorySelect(demoStory)
      setShowingResult(false)
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🎯 Judge Demo Mode - Instant Results
          </h3>
          <p className="text-sm text-yellow-700">
            Click any story below for instant comic generation (pre-cached for demo reliability)
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleStories.map((story, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => runInstantDemo(story)}
            disabled={showingResult}
            className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{story.title}</h4>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                ⚡ Instant Demo
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{story.preview}</p>
            <div className="flex items-center gap-2 text-xs text-blue-600">
              <Play className="w-3 h-3" />
              Click to generate instantly
            </div>
          </motion.button>
        ))}
      </div>

      {showingResult && selectedDemo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-700">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Generating "{selectedDemo.title}" comic...</span>
          </div>
          <div className="mt-2 text-sm text-green-600">
            Using pre-cached results for instant demo experience
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
