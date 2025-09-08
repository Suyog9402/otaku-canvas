'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Sparkles, User, Palette, Brain } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface CharacterCreatorProps {
  onClose: () => void
  onCharacterCreated: (character: any) => void
}

const ARCHETYPES = [
  { value: 'hero', label: 'Hero', description: 'Brave protagonist' },
  { value: 'villain', label: 'Villain', description: 'Menacing antagonist' },
  { value: 'supporting', label: 'Supporting', description: 'Helper character' },
  { value: 'comedic', label: 'Comedic', description: 'Funny relief character' },
  { value: 'mysterious', label: 'Mysterious', description: 'Enigmatic character' },
  { value: 'romantic', label: 'Romantic', description: 'Love interest' }
]

const STYLES = [
  { value: 'manga', label: 'Manga', description: 'Japanese comic style' },
  { value: 'manhwa', label: 'Manhwa', description: 'Korean webtoon style' },
  { value: 'western_comic', label: 'Western Comic', description: 'American comic style' }
]

export default function CharacterCreator({ onClose, onCharacterCreated }: CharacterCreatorProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    archetype: 'hero',
    style: 'manga',
    traits: [] as string[],
    appearance: {} as Record<string, string>,
    personality: {} as Record<string, string>,
    backstory: '',
    image_url: ''
  })
  const [newTrait, setNewTrait] = useState('')
  const [loading, setLoading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        // Handle file upload - in real app, upload to storage
        setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(acceptedFiles[0]) }))
      }
    }
  })

  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }))
      setNewTrait('')
    }
  }

  const removeTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter(t => t !== trait)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: 'default_user' // In real app, get from auth
        })
      })
      
      if (response.ok) {
        const newCharacter = await response.json()
        onCharacterCreated(newCharacter)
      }
    } catch (error) {
      console.error('Error creating character:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-manga-white border-2 border-manga-black w-full max-w-2xl max-h-[90vh] overflow-y-auto manga-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b-2 border-manga-black flex items-center justify-between">
            <h2 className="text-2xl font-bold text-manga-black">Create Character</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-manga-gray-100 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="p-6 border-b border-manga-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    step >= stepNum 
                      ? 'bg-manga-black text-manga-white border-manga-black' 
                      : 'bg-manga-white text-manga-gray-400 border-manga-gray-300'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step > stepNum ? 'bg-manga-black' : 'bg-manga-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-manga-black flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="manga-input"
                    placeholder="Enter character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="manga-input h-24 resize-none"
                    placeholder="Describe your character's appearance and personality"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Character Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ARCHETYPES.map((archetype) => (
                      <button
                        key={archetype.value}
                        onClick={() => setFormData(prev => ({ ...prev, archetype: archetype.value }))}
                        className={`p-3 border-2 text-left transition-colors duration-200 ${
                          formData.archetype === archetype.value
                            ? 'border-manga-black bg-manga-black text-manga-white'
                            : 'border-manga-gray-300 hover:border-manga-black'
                        }`}
                      >
                        <div className="font-medium">{archetype.label}</div>
                        <div className="text-sm opacity-75">{archetype.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-manga-black flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance & Style
                </h3>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Art Style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setFormData(prev => ({ ...prev, style: style.value }))}
                        className={`p-3 border-2 text-center transition-colors duration-200 ${
                          formData.style === style.value
                            ? 'border-manga-black bg-manga-black text-manga-white'
                            : 'border-manga-gray-300 hover:border-manga-black'
                        }`}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs opacity-75">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Character Image (Optional)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 ${
                      isDragActive
                        ? 'border-manga-black bg-manga-gray-50'
                        : 'border-manga-gray-300 hover:border-manga-black'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-manga-gray-400" />
                    <p className="text-manga-gray-600">
                      {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    {formData.image_url && (
                      <div className="mt-4">
                        <img
                          src={formData.image_url}
                          alt="Character preview"
                          className="w-20 h-20 object-cover mx-auto border border-manga-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-manga-black flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Personality & Traits
                </h3>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Character Traits
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                      className="manga-input flex-1"
                      placeholder="Add a trait (e.g., brave, mysterious, funny)"
                    />
                    <button
                      onClick={addTrait}
                      className="manga-button px-4 py-2"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-manga-gray-100 border border-manga-gray-300 flex items-center gap-2"
                      >
                        {trait}
                        <button
                          onClick={() => removeTrait(trait)}
                          className="text-manga-gray-500 hover:text-manga-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-manga-black mb-2">
                    Backstory (Optional)
                  </label>
                  <textarea
                    value={formData.backstory}
                    onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
                    className="manga-input h-24 resize-none"
                    placeholder="Tell us about your character's background and history"
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-manga-gray-200">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="manga-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="manga-button flex items-center gap-2"
                >
                  Next
                  <Sparkles className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name || !formData.description}
                  className="manga-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? 'Creating...' : 'Create Character'}
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
