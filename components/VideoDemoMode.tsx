'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, Square, Play, Pause } from 'lucide-react'

interface DemoStep {
  action: string
  highlight: string
  story?: string
  duration: number
}

interface VideoDemoModeProps {
  onStepExecute: (step: DemoStep) => void
  onHighlight: (selector: string) => void
}

const DEMO_STEPS: DemoStep[] = [
  { 
    action: "Show story input", 
    highlight: "#story-input", 
    duration: 2000 
  },
  { 
    action: "Enter sample story", 
    story: "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.",
    highlight: "#story-textarea", 
    duration: 3000 
  },
  { 
    action: "Click generate button", 
    highlight: "#generate-btn", 
    duration: 2000 
  },
  { 
    action: "Show generation progress", 
    highlight: "#progress-indicator", 
    duration: 4000 
  },
  { 
    action: "Display finished comic", 
    highlight: "#comic-result", 
    duration: 3000 
  },
  { 
    action: "Demonstrate export", 
    highlight: "#export-buttons", 
    duration: 2000 
  }
]

export default function VideoDemoMode({ onStepExecute, onHighlight }: VideoDemoModeProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const runDemoSequence = async () => {
    setIsRecording(true)
    setCurrentStep(0)
    
    for (let i = 0; i < DEMO_STEPS.length; i++) {
      if (isPaused) {
        // Wait until unpaused
        while (isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      setCurrentStep(i)
      const step = DEMO_STEPS[i]
      
      // Execute step action
      onStepExecute(step)
      onHighlight(step.highlight)
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, step.duration))
    }
    
    setIsRecording(false)
    setCurrentStep(0)
  }

  const stopDemo = () => {
    setIsRecording(false)
    setIsPaused(false)
    setCurrentStep(0)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center gap-2 mb-2">
        <Video className="w-5 h-5" />
        <h4 className="font-bold">🎥 Video Demo Mode</h4>
      </div>
      
      <div className="flex gap-2 mb-2">
        {!isRecording ? (
          <button
            onClick={runDemoSequence}
            className="bg-white text-red-600 px-3 py-1 rounded font-semibold text-sm flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            Start Demo
          </button>
        ) : (
          <>
            <button
              onClick={togglePause}
              className="bg-white text-red-600 px-3 py-1 rounded font-semibold text-sm flex items-center gap-1"
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopDemo}
              className="bg-white text-red-600 px-3 py-1 rounded font-semibold text-sm flex items-center gap-1"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          </>
        )}
      </div>
      
      {isRecording && (
        <div className="text-xs">
          <div className="mb-1">
            Step {currentStep + 1}/{DEMO_STEPS.length}: {DEMO_STEPS[currentStep]?.action}
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
            <motion.div
              className="bg-white h-1 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
      
      <div className="text-xs mt-2 opacity-75">
        Perfect for hackathon presentations
      </div>
    </motion.div>
  )
}
