'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Edit, MessageSquare } from 'lucide-react'
import Image from 'next/image'

interface Panel {
  id: string
  index: number
  prompt: string
  image_url: string
  description: string
  character_ids: string[]
}

interface ScenePanelProps {
  panel: Panel
  onRegenerate: (newPrompt: string) => void
  loading: boolean
}

export default function ScenePanel({ panel, onRegenerate, loading }: ScenePanelProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [editPrompt, setEditPrompt] = useState(panel.prompt)
  const [dialogue, setDialogue] = useState('')

  const handleRegenerate = () => {
    onRegenerate(editPrompt)
    setShowEdit(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="manga-panel"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-manga-black">
          Panel {panel.index + 1}
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEdit(!showEdit)}
            className="p-2 bg-manga-gray-100 hover:bg-manga-gray-200 text-manga-black transition-colors duration-200"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegenerate}
            disabled={loading}
            className="p-2 bg-manga-black hover:bg-manga-gray-800 text-manga-white transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Panel Image */}
      <div className="relative mb-4">
        <div className="aspect-[4/3] bg-manga-gray-100 border-2 border-manga-gray-300 relative overflow-hidden">
          {panel.image_url ? (
            <Image
              src={panel.image_url}
              alt={panel.description}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-manga-gray-400">
              <span className="text-2xl font-bold">Panel {panel.index + 1}</span>
            </div>
          )}
        </div>
        
        {/* Dialogue Bubble */}
        {dialogue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 left-4 bg-manga-white border-2 border-manga-black p-3 max-w-xs"
          >
            <div className="text-sm font-medium text-manga-black">
              {dialogue}
            </div>
            <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-manga-black"></div>
          </motion.div>
        )}
      </div>

      {/* Panel Description */}
      <div className="text-sm text-manga-gray-700 mb-4">
        {panel.description}
      </div>

      {/* Edit Panel */}
      {showEdit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-manga-gray-200 pt-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Edit Panel Description
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="manga-input h-20 resize-none"
              placeholder="Describe how you want this panel to look..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Add Dialogue (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                className="manga-input flex-1"
                placeholder="Enter dialogue for this panel..."
              />
              <button
                onClick={() => setDialogue('')}
                className="manga-button-secondary px-4"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegenerate}
              disabled={loading}
              className="manga-button flex-1 disabled:opacity-50"
            >
              {loading ? 'Regenerating...' : 'Regenerate Panel'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowEdit(false)}
              className="manga-button-secondary px-6"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
