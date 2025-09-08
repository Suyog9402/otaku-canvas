'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye,
  Calendar,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Story {
  id: string
  title: string
  description: string
  style: string
  total_pages: number
  created_at: string
  updated_at: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  title: string
  description: string
  chapter_number: number
  pages: Page[]
}

interface Page {
  id: string
  scene_id: string
  page_number: number
  title: string
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories')
      const data = await response.json()
      setStories(data)
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStory = async (title: string, description: string) => {
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          user_id: 'default_user'
        })
      })

      if (response.ok) {
        const newStory = await response.json()
        setStories([newStory, ...stories])
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating story:', error)
    }
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStories(stories.filter(s => s.id !== storyId))
      }
    } catch (error) {
      console.error('Error deleting story:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
            My Stories
          </h1>
          <p className="text-xl text-manga-gray-700 mb-8">
            Build and manage your manga stories
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="manga-button text-lg px-8 py-4 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create New Story
          </motion.button>
        </motion.div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-manga-black"></div>
          </div>
        ) : stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-24 h-24 text-manga-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-manga-gray-500 mb-4">
              No Stories Yet
            </h3>
            <p className="text-manga-gray-400 mb-8">
              Create your first story to get started
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="manga-button"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Story
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="manga-card group"
              >
                {/* Story Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-manga-black mb-2 group-hover:text-comic-blue transition-colors duration-200">
                      {story.title}
                    </h3>
                    <p className="text-sm text-manga-gray-600 uppercase tracking-wider">
                      {story.style} • {story.total_pages} pages
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-2 bg-manga-accent hover:bg-red-600 text-manga-white transition-colors duration-200"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Story Description */}
                <p className="text-manga-gray-700 text-sm mb-4 line-clamp-3">
                  {story.description || 'No description provided'}
                </p>

                {/* Story Stats */}
                <div className="flex items-center justify-between text-sm text-manga-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(story.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {story.chapters?.length || 0} chapters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/stories/${story.id}`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full manga-button flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Story
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="manga-button-secondary px-4"
                    title="Edit Story"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="manga-button-secondary px-4"
                    title="Export Story"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create Story Modal */}
        {showCreateModal && (
          <CreateStoryModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateStory}
          />
        )}
      </div>
    </div>
  )
}

// Create Story Modal Component
function CreateStoryModal({ onClose, onCreate }: { 
  onClose: () => void
  onCreate: (title: string, description: string) => void 
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState('manga')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onCreate(title.trim(), description.trim())
    }
  }

  return (
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
        className="bg-manga-white border-2 border-manga-black w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b-2 border-manga-black">
          <h2 className="text-2xl font-bold text-manga-black">Create New Story</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="manga-input"
              placeholder="Enter story title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="manga-input h-24 resize-none"
              placeholder="Describe your story..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Art Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="manga-input"
            >
              <option value="manga">Manga</option>
              <option value="manhwa">Manhwa</option>
              <option value="western_comic">Western Comic</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="manga-button-secondary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="manga-button"
            >
              Create Story
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
