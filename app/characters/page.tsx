'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Sparkles } from 'lucide-react'
import CharacterCard from '@/components/CharacterCard'
import CharacterCreator from '@/components/CharacterCreator'

interface Character {
  id: string
  name: string
  description: string
  archetype: string
  image_url?: string
  created_at: string
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreator, setShowCreator] = useState(false)

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/characters')
      const data = await response.json()
      
      // Ensure characters is always an array
      if (Array.isArray(data)) {
        setCharacters(data)
      } else {
        console.error('Invalid characters data:', data)
        setCharacters([])
      }
    } catch (error) {
      console.error('Error fetching characters:', error)
      setCharacters([])
    } finally {
      setLoading(false)
    }
  }

  const handleCharacterCreated = (newCharacter: Character) => {
    setCharacters(prev => [...prev, newCharacter])
    setShowCreator(false)
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
            Character Roster
          </h1>
          <p className="text-xl text-manga-gray-700 mb-8">
            Create and manage your manga characters
          </p>
        </motion.div>

        {/* Create Character Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreator(true)}
            className="manga-button text-lg px-8 py-4 flex items-center gap-3 mx-auto"
          >
            <Plus className="w-6 h-6" />
            Create New Character
          </motion.button>
        </motion.div>

        {/* Character Creator Modal */}
        {showCreator && (
          <CharacterCreator
            onCharacterCreated={handleCharacterCreated}
            onClose={() => setShowCreator(false)}
          />
        )}

        {/* Characters Grid */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-manga-black mx-auto mb-4"></div>
            <p className="text-manga-gray-600">Loading characters...</p>
          </motion.div>
        ) : characters.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {characters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <CharacterCard character={character} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="w-24 h-24 text-manga-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-manga-gray-500 mb-4">
              No Characters Yet
            </h3>
            <p className="text-manga-gray-400 mb-8">
              Create your first character to get started with manga creation
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreator(true)}
              className="manga-button flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Character
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
