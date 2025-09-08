'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Users, Settings, Play, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import ScenePanel from '@/components/ScenePanel'

interface Character {
  id: string
  name: string
  description: string
  archetype: string
  image_url?: string
}

interface Panel {
  id: string
  index: number
  prompt: string
  image_url: string
  description: string
  character_ids: string[]
}

interface Scene {
  id: string
  prompt: string
  character_ids: string[]
  style: string
  layout: string
  panels: Panel[]
  created_at: string
}

export default function GeneratePage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [scenePrompt, setScenePrompt] = useState('')
  const [style, setStyle] = useState('manga')
  const [layout, setLayout] = useState('double')
  const [generatedScene, setGeneratedScene] = useState<Scene | null>(null)
  const [loading, setLoading] = useState(false)
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([])
  const [detectedContentType, setDetectedContentType] = useState<string>('mixed_content')

  useEffect(() => {
    fetchCharacters()
  }, [])

  useEffect(() => {
    detectConflicts()
  }, [scenePrompt, selectedCharacters, style, layout])

  const detectContentType = (prompt: string): string => {
    const environmentKeywords = [
      'landscape', 'temple', 'building', 'mountains', 'cityscape', 'architecture',
      'forest', 'garden', 'street', 'interior', 'exterior', 'view', 'scene',
      'photograph', 'photography', 'photorealistic', 'realistic', 'environment'
    ]
    
    const characterKeywords = [
      'person', 'character', 'hero', 'warrior', 'woman', 'man', 'girl', 'boy',
      'figure', 'people', 'human', 'character', 'protagonist', 'villain'
    ]
    
    const promptLower = prompt.toLowerCase()
    
    const hasEnvironment = environmentKeywords.some(keyword => promptLower.includes(keyword))
    const hasCharacter = characterKeywords.some(keyword => promptLower.includes(keyword))
    
    if (hasEnvironment && !hasCharacter) {
      return 'pure_environment'
    } else if (hasCharacter && !hasEnvironment) {
      return 'character_focused'
    } else {
      return 'mixed_content'
    }
  }

  const detectStyleFromPrompt = (prompt: string): string => {
    const promptLower = prompt.toLowerCase()
    
    if (['photorealistic', 'photograph', 'photography', 'realistic', 'professional camera'].some(keyword => promptLower.includes(keyword))) {
      return 'photorealistic'
    } else if (['manga', 'anime', 'comic', 'illustration'].some(keyword => promptLower.includes(keyword))) {
      return 'manga'
    } else if (['manhwa', 'webtoon', 'korean'].some(keyword => promptLower.includes(keyword))) {
      return 'manhwa'
    } else {
      return 'manga'
    }
  }

  const detectConflicts = () => {
    const warnings: string[] = []
    const contentType = detectContentType(scenePrompt)
    const detectedStyle = detectStyleFromPrompt(scenePrompt)
    
    setDetectedContentType(contentType)
    
    // Check for character selection conflicts
    if (contentType === 'pure_environment' && selectedCharacters.length > 0) {
      warnings.push('⚠️ Environment prompt detected but characters are selected. Characters will be ignored for pure environment generation.')
    }
    
    // Check for style conflicts
    if (detectedStyle !== 'manga' && style !== detectedStyle) {
      warnings.push(`🎨 Prompt suggests "${detectedStyle}" style but interface is set to "${style}". Prompt style will take precedence.`)
    }
    
    // Check for layout conflicts
    if (contentType === 'pure_environment' && layout !== 'single') {
      warnings.push('📐 Environment prompts work best with "Single Panel" layout. Consider changing layout for better results.')
    }
    
    setConflictWarnings(warnings)
  }

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters')
      const data = await response.json()
      setCharacters(data)
    } catch (error) {
      console.error('Error fetching characters:', error)
    }
  }

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    )
  }

  const generateScene = async () => {
    if (!scenePrompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/scenes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scenePrompt,
          character_ids: selectedCharacters,
          style,
          layout,
          user_id: 'default_user'
        })
      })

      if (response.ok) {
        const scene = await response.json()
        setGeneratedScene(scene)
      }
    } catch (error) {
      console.error('Error generating scene:', error)
    } finally {
      setLoading(false)
    }
  }

  const regeneratePanel = async (panelIndex: number, newPrompt: string) => {
    if (!generatedScene) return

    setLoading(true)
    try {
      const response = await fetch(`/api/scenes/${generatedScene.id}/regenerate-panel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panel_index: panelIndex,
          new_prompt: newPrompt
        })
      })

      if (response.ok) {
        const updatedScene = await response.json()
        setGeneratedScene(updatedScene)
      }
    } catch (error) {
      console.error('Error regenerating panel:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'pure_environment': return 'text-green-600 bg-green-100'
      case 'character_focused': return 'text-blue-600 bg-blue-100'
      case 'mixed_content': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'pure_environment': return '🏞️'
      case 'character_focused': return '👤'
      case 'mixed_content': return '🎭'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-manga-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-manga-black mb-4">
            Scene Generator
          </h1>
          <p className="text-xl text-manga-gray-700 mb-8">
            Create manga scenes with AI-powered generation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="manga-card space-y-6"
            >
              {/* Content Type Detection */}
              {scenePrompt && (
                <div className={`p-3 rounded-lg ${getContentTypeColor(detectedContentType)}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getContentTypeIcon(detectedContentType)}</span>
                    <span className="font-medium">
                      {detectedContentType === 'pure_environment' && 'Environment Mode'}
                      {detectedContentType === 'character_focused' && 'Character Mode'}
                      {detectedContentType === 'mixed_content' && 'Mixed Content Mode'}
                    </span>
                  </div>
                </div>
              )}

              {/* Conflict Warnings */}
              {conflictWarnings.length > 0 && (
                <div className="space-y-2">
                  {conflictWarnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Character Selection */}
              <div>
                <h3 className="text-lg font-bold text-manga-black mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Characters
                  {detectedContentType === 'pure_environment' && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Optional
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto manga-scroll">
                  {characters.map((character) => (
                    <label
                      key={character.id}
                      className={`flex items-center gap-3 p-3 border transition-colors duration-200 ${
                        detectedContentType === 'pure_environment' 
                          ? 'border-gray-200 hover:border-gray-300 opacity-60' 
                          : 'border-manga-gray-300 hover:border-manga-black'
                      } cursor-pointer`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCharacters.includes(character.id)}
                        onChange={() => handleCharacterToggle(character.id)}
                        disabled={detectedContentType === 'pure_environment'}
                        className="w-4 h-4 text-manga-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-manga-black">{character.name}</div>
                        <div className="text-sm text-manga-gray-600">{character.archetype}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Scene Prompt */}
              <div>
                <h3 className="text-lg font-bold text-manga-black mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Scene Description
                </h3>
                <textarea
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  className="manga-input h-32 resize-none"
                  placeholder="Describe the scene you want to create... (e.g., 'A breathtaking wide-angle view of an ancient Japanese temple complex nestled in misty mountains during cherry blossom season. Traditional wooden architecture with curved roofs and red pillars stands among thousands of pink sakura trees in full bloom. Early morning mist drifts between the buildings while soft golden sunlight filters through the petals. Shot with 14mm wide-angle lens to capture the grandeur. Photorealistic with enhanced color saturation for the pink blossoms. Cinematic 21:9 format.')"
                />
              </div>

              {/* Style & Layout */}
              <div>
                <h3 className="text-lg font-bold text-manga-black mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Style & Layout
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-manga-black mb-2">
                      Art Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="manga-input"
                    >
                      <option value="photorealistic">Photorealistic</option>
                      <option value="manga">Manga</option>
                      <option value="manhwa">Manhwa</option>
                      <option value="western_comic">Western Comic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-manga-black mb-2">
                      Panel Layout
                    </label>
                    <select
                      value={layout}
                      onChange={(e) => setLayout(e.target.value)}
                      className="manga-input"
                    >
                      <option value="single">Single Panel</option>
                      <option value="double">Double Panel</option>
                      <option value="triple">Triple Panel</option>
                      <option value="vertical_scroll">Vertical Scroll</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateScene}
                disabled={loading || !scenePrompt.trim()}
                className="w-full manga-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-manga-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Generate Scene
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* Generated Scene */}
          <div className="lg:col-span-2">
            {generatedScene ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-manga-black">Generated Scene</h2>
                  <button
                    onClick={() => setGeneratedScene(null)}
                    className="manga-button-secondary"
                  >
                    Generate New
                  </button>
                </div>

                <div className="grid gap-6">
                  {generatedScene.panels.map((panel, index) => (
                    <ScenePanel
                      key={panel.id}
                      panel={panel}
                      onRegenerate={(newPrompt) => regeneratePanel(index, newPrompt)}
                      loading={loading}
                    />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Wand2 className="w-24 h-24 text-manga-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-manga-gray-500 mb-4">
                  Ready to Generate
                </h3>
                <p className="text-manga-gray-400">
                  Describe your scene to get started. The system will automatically detect if it's an environment, character, or mixed content scene.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}