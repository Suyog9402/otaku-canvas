'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Download, Upload, RefreshCw, Share2 } from 'lucide-react'
import { ComicExportService } from '@/lib/comic-export'
import toast from 'react-hot-toast'

interface Panel {
  panel_number: number
  image_url: string
  scene_description: string
  dialogue: string
  prompt_used: string
}

interface ComicGeneration {
  success: boolean
  panels: Panel[]
  character_anchor: string
  story: string
  generation_time: number
  is_sample?: boolean
}

const SAMPLE_STORIES = [
  {
    title: "The Magic Portal Dream",
    category: "fantasy",
    story: "I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.",
    preview: "A whimsical adventure about discovering a magical cat kingdom"
  },
  {
    title: "Grandmother's Recipe",
    category: "emotional", 
    story: "The day my grandmother taught me to make her secret chocolate chip cookies, her wrinkled hands guiding mine as we mixed love into every ingredient, not knowing it would be our last time baking together.",
    preview: "A heartwarming memory about family traditions"
  },
  {
    title: "Superhero Hamster",
    category: "adventure",
    story: "My pet hamster Mr. Nibbles discovered he had superpowers and had to save our neighborhood from an invasion of robot vacuum cleaners that had gained sentience.",
    preview: "An epic tale of tiny heroism"
  },
  {
    title: "Time Travel Mistake",
    category: "sci-fi",
    story: "I accidentally invented a time machine in my garage and went back to the 1980s, but I forgot how to get home and had to blend in with the neon decade until I figured it out.",
    preview: "A sci-fi adventure stuck in the 1980s"
  },
  {
    title: "Robot Friendship",
    category: "sci-fi",
    story: "I found a broken robot in the junkyard and fixed it up, not knowing it would become my best friend and help me discover that I had a talent for robotics all along.",
    preview: "A heartwarming story about friendship and robotics"
  },
  {
    title: "Underwater City",
    category: "fantasy",
    story: "I discovered an ancient underwater city while scuba diving and became friends with the mermaid who lived there, learning that the city was actually a spaceship from another planet.",
    preview: "An underwater adventure with mermaids and aliens"
  },
  {
    title: "Magic Paintbrush",
    category: "fantasy",
    story: "I found a magic paintbrush that could bring my drawings to life, but I had to be careful because whatever I painted would become real, including the monsters I accidentally created.",
    preview: "A creative story about art coming to life"
  },
  {
    title: "Alien Pen Pal",
    category: "sci-fi",
    story: "I started writing letters to what I thought was a pen pal in another country, but it turned out to be an alien from another planet who wanted to learn about Earth culture.",
    preview: "A story about cultural exchange with an alien"
  },
  {
    title: "Ghost Roommate",
    category: "mystery",
    story: "I moved into a new apartment and discovered I had a ghost roommate who was actually very friendly and helped me solve mysteries around the building.",
    preview: "A mystery story with a friendly ghost"
  },
  {
    title: "Dragon Egg",
    category: "fantasy",
    story: "I found a dragon egg in the forest and decided to raise the baby dragon, not knowing it would grow up to be the last dragon and I would become its protector.",
    preview: "A fantasy story about raising a dragon"
  }
]

export default function ComicGenerator() {
  const [story, setStory] = useState('')
  const [panels, setPanels] = useState<Panel[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [characterRef, setCharacterRef] = useState<File | null>(null)
  const [generationResult, setGenerationResult] = useState<ComicGeneration | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')
  const [currentPanel, setCurrentPanel] = useState(0)
  const [demoMode, setDemoMode] = useState(false)
  const [consistencyScore, setConsistencyScore] = useState(0)
  const [generationTime, setGenerationTime] = useState(0)

  const handleCharacterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCharacterRef(file)
    }
  }

  const generateComic = async () => {
    if (!story.trim()) return

    setIsGenerating(true)
    setGenerationProgress('Starting comic generation...')
    setCurrentPanel(0)
    
    try {
      const formData = new FormData()
      formData.append('story', story)
      if (characterRef) {
        formData.append('character_reference', characterRef)
      }

      // Simulate progress updates
      const progressSteps = [
        'Analyzing your story...',
        'Creating character design...',
        'Generating Panel 1 of 4...',
        'Generating Panel 2 of 4...',
        'Generating Panel 3 of 4...',
        'Generating Panel 4 of 4...',
        'Adding dialogue and final touches...',
        'Comic complete!'
      ]

      let stepIndex = 0
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          setGenerationProgress(progressSteps[stepIndex])
          if (stepIndex >= 2 && stepIndex <= 5) {
            setCurrentPanel(stepIndex - 1)
          }
          stepIndex++
        }
      }, 1000)

      const response = await fetch('/api/comic/generate', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Demo-Mode': demoMode ? 'true' : 'false'
        }
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const result = await response.json()
        setGenerationResult(result)
        setPanels(result.panels || [])
        setConsistencyScore(result.character_consistency_score || 0)
        setGenerationTime(result.generation_time || 0)
        setGenerationProgress('Comic generated successfully!')
        toast.success(`Your comic is ready! Character consistency: ${result.character_consistency_score || 0}%`)
      } else {
        console.error('Failed to generate comic')
        toast.error('Failed to generate comic. Please try again.')
        setGenerationProgress('Generation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error generating comic:', error)
      toast.error('Error generating comic. Please try again.')
      setGenerationProgress('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
      setCurrentPanel(0)
    }
  }

  const handleExportPDF = async () => {
    if (panels.length === 0) {
      toast.error('No comic panels to export')
      return
    }

    setIsExporting(true)
    try {
      const exportService = new ComicExportService()
      
      // Convert panels to the format expected by ComicExportService
      const comicPanels = panels.map(panel => ({
        panel_number: panel.panel_number,
        image_url: panel.image_url || '/images/placeholders/placeholder.png', // Fallback for missing images
        scene_description: panel.scene_description,
        dialogue: panel.dialogue
      }))

      const pdfBlob = await exportService.exportToPDF(comicPanels, story, {
        format: 'pdf',
        quality: 'high',
        includeDialogue: true,
        includeStory: true
      })

      exportService.downloadBlob(pdfBlob, `comic_${Date.now()}.pdf`)
      toast.success('Comic exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export comic. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareComic = async () => {
    if (panels.length === 0) {
      toast.error('No comic to share')
      return
    }

    try {
      // Create shareable link via API
      const response = await fetch('/api/comic/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story,
          panels,
          characterRef: characterRef?.name
        })
      })

      if (response.ok) {
        const result = await response.json()
        const shareUrl = result.shareUrl

        // Copy share URL to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard!')
        
        // If Web Share API is available, use it
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'My AI-Generated Comic',
              text: `Check out my comic: ${story.substring(0, 100)}...`,
              url: shareUrl
            })
          } catch (shareError) {
            console.log('Web Share cancelled or failed')
          }
        }
      } else {
        // Fallback: copy story to clipboard
        await navigator.clipboard.writeText(story)
        toast.success('Story copied to clipboard! Share your comic story with others.')
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Fallback: copy story to clipboard
      try {
        await navigator.clipboard.writeText(story)
        toast.success('Story copied to clipboard! Share your comic story with others.')
      } catch (clipboardError) {
        toast.error('Failed to share comic. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            AI Story-to-Comic Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Transform your personal stories into professional comic strips with perfect character consistency
          </p>
          
          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Demo Mode:</span>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  demoMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    demoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {demoMode ? 'ON (Pre-generated examples)' : 'OFF (Live generation)'}
              </span>
            </div>
            
            {/* Instant Demo Button */}
            <button
              onClick={() => {
                setDemoMode(true)
                setStory("I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.")
                setTimeout(() => {
                  generateComic()
                }, 500)
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              🎯 Try Demo
            </button>
          </div>
        </motion.div>

        {/* Main Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Your Story
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell me your dream, memory, or adventure story... (e.g., 'I dreamed I found a portal in my backyard that led to a magical world where cats rule everything')"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              rows={6}
            />
          </div>
          
          {/* Optional Character Reference Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optional: Upload Character Reference Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleCharacterUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {characterRef && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  {characterRef.name}
                </span>
              )}
            </div>
          </div>

          {/* Quick Sample Stories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Sample Stories:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {SAMPLE_STORIES.map((sample, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setStory(sample.story)
                    // Auto-trigger generation after a short delay
                    setTimeout(() => {
                      generateComic()
                    }, 500)
                  }}
                  disabled={isGenerating}
                  className="p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <h4 className="font-medium text-gray-900">{sample.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{sample.preview}</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">Click to generate comic →</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateComic}
              disabled={!story.trim() || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Creating Your Comic...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate 4-Panel Comic
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center gap-3 text-blue-700 mb-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-medium text-lg">{generationProgress}</span>
            </div>
            
            {/* Panel Progress */}
            {currentPanel > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-blue-600 mb-1">
                  <span>Panel Progress</span>
                  <span>{currentPanel} of 4</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentPanel / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="text-sm text-blue-600">
              ✨ Creating professional comic panels with character consistency
            </div>
            
            {/* Generation Metrics */}
            {consistencyScore > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-700">Character Consistency Score:</span>
                  <span className="font-bold text-green-800">{consistencyScore}%</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-green-700">Generation Time:</span>
                  <span className="font-bold text-green-800">{generationTime.toFixed(1)}s</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Generated Comic Display */}
        {panels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Generated Comic</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {panels.map((panel) => (
                <div key={panel.panel_number} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4 mb-2 min-h-[200px] flex items-center justify-center overflow-hidden">
                    {panel.image_url ? (
                      <img 
                        src={panel.image_url} 
                        alt={`Panel ${panel.panel_number}`}
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'block'
                          }
                        }}
                      />
                    ) : null}
                    <span className="text-gray-500" style={{ display: panel.image_url ? 'none' : 'block' }}>
                      Panel {panel.panel_number}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{panel.scene_description}</p>
                </div>
              ))}
            </div>
            
            {/* Export Options */}
            <div className="mt-6 flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export PDF
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareComic}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Comic
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
