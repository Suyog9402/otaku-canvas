'use client'

import { motion } from 'framer-motion'
import { Edit, Trash2, Eye } from 'lucide-react'
import Image from 'next/image'

interface Character {
  id: string
  name: string
  description: string
  archetype: string
  style: string
  traits: string[]
  appearance: Record<string, any>
  personality: Record<string, any>
  image_url?: string
  created_at: string
}

interface CharacterCardProps {
  character: Character
  onEdit: () => void
  onDelete: () => void
}

export default function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="manga-card group cursor-pointer"
    >
      {/* Character Image */}
      <div className="aspect-square mb-4 bg-manga-gray-100 border-2 border-manga-gray-300 relative overflow-hidden">
        {character.image_url ? (
          <Image
            src={character.image_url}
            alt={character.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-manga-gray-400">
            <span className="text-4xl font-bold">?</span>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-manga-black mb-1">
            {character.name}
          </h3>
          <p className="text-sm text-manga-gray-600 uppercase tracking-wider">
            {character.archetype}
          </p>
        </div>

        <p className="text-manga-gray-700 text-sm line-clamp-3">
          {character.description}
        </p>

        {/* Traits */}
        {character.traits.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {character.traits.slice(0, 3).map((trait, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-manga-gray-100 text-xs font-medium text-manga-gray-700 border border-manga-gray-300"
              >
                {trait}
              </span>
            ))}
            {character.traits.length > 3 && (
              <span className="px-2 py-1 bg-manga-gray-100 text-xs font-medium text-manga-gray-700 border border-manga-gray-300">
                +{character.traits.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex-1 bg-manga-gray-100 hover:bg-manga-gray-200 text-manga-black px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDelete}
            className="bg-manga-accent hover:bg-red-600 text-manga-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
