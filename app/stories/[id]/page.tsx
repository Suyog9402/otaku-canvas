'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Download, 
  Save,
  Eye,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import PanelEditor from '@/components/PanelEditor'
import { ExportService } from '@/lib/export'

interface Story {
  id: string
  title: string
  description: string
  style: string
  total_pages: number
  created_at: string
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

interface Panel {
  id: string
  index: number
  prompt: string
  image_url: string
  description: string
  character_ids: string[]
  position: { x: number; y: number }
  size: { width: number; height: number }
  dialogue?: string
  rotation?: number
}

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<Story | null>(null)
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    format: 'pdf' as 'pdf' | 'webtoon' | 'instagram',
    quality: 'high' as 'high' | 'medium' | 'low',
    includeMetadata: true
  })

  useEffect(() => {
    fetchStory()
  }, [params.id])

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/stories/${params.id}`)
      if (response.ok) {
        const storyData = await response.json()
        setStory(storyData)
        
        // Load panels from all pages
        const allPanels: Panel[] = []
        for (const chapter of storyData.chapters || []) {
          for (const page of chapter.pages || []) {
            // In a real app, you'd fetch the scene data for each page
            // For now, we'll create mock panels
            const mockPanels = generateMockPanels(page.page_number)
            allPanels.push(...mockPanels)
          }
        }
        setPanels(allPanels)
      }
    } catch (error) {
      console.error('Error fetching story:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockPanels = (pageNumber: number): Panel[] => {
    return [
      {
        id: `panel-${pageNumber}-1`,
        index: 0,
        prompt: `Page ${pageNumber} Panel 1`,
        image_url: `https://via.placeholder.com/800x600/000000/FFFFFF?text=Panel+${pageNumber}-1`,
        description: `Panel 1 of page ${pageNumber}`,
        character_ids: [],
        position: { x: 50, y: 50 },
        size: { width: 300, height: 200 },
        dialogue: pageNumber === 1 ? 'Welcome to our story!' : undefined
      },
      {
        id: `panel-${pageNumber}-2`,
        index: 1,
        prompt: `Page ${pageNumber} Panel 2`,
        image_url: `https://via.placeholder.com/800x600/000000/FFFFFF?text=Panel+${pageNumber}-2`,
        description: `Panel 2 of page ${pageNumber}`,
        character_ids: [],
        position: { x: 400, y: 50 },
        size: { width: 300, height: 200 }
      }
    ]
  }

  const handleUpdatePanel = (panelId: string, updates: Partial<Panel>) => {
    setPanels(prev => prev.map(panel => 
      panel.id === panelId ? { ...panel, ...updates } : panel
    ))
  }

  const handleDeletePanel = (panelId: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== panelId))
  }

  const handleSave = async () => {
    // In a real app, save panels to the database
    console.log('Saving panels:', panels)
    // Show success message
  }

  const handleExport = async (format: string) => {
    const exportService = new ExportService()
    
    try {
      const result = await exportService.exportPanels(panels, {
        ...exportOptions,
        format: format as any,
        title: story?.title,
        author: 'User' // In real app, get from auth
      })

      if (Array.isArray(result)) {
        exportService.downloadMultipleBlobs(result, `${story?.title || 'story'}_export`)
      } else {
        exportService.downloadBlob(result, `${story?.title || 'story'}_export.${format}`)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-manga-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-manga-black"></div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-manga-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-manga-black mb-4">Story Not Found</h1>
          <Link href="/stories" className="manga-button">
            Back to Stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-manga-white">
      {/* Header */}
      <div className="border-b-2 border-manga-black bg-manga-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/stories">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-manga-gray-100 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-manga-black">{story.title}</h1>
                <p className="text-sm text-manga-gray-600">
                  {story.total_pages} pages • {story.chapters?.length || 0} chapters
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(!editing)}
                className={`px-4 py-2 border-2 font-medium transition-colors duration-200 ${
                  editing
                    ? 'bg-manga-black text-manga-white border-manga-black'
                    : 'bg-manga-white text-manga-black border-manga-black hover:bg-manga-black hover:text-manga-white'
                }`}
              >
                {editing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                {editing ? 'Save' : 'Edit'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExportModal(true)}
                className="manga-button-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)]">
        {editing ? (
          <PanelEditor
            panels={panels}
            onUpdatePanel={handleUpdatePanel}
            onDeletePanel={handleDeletePanel}
            onSave={handleSave}
            onExport={handleExport}
          />
        ) : (
          <div className="h-full overflow-y-auto manga-scroll">
            <div className="max-w-4xl mx-auto p-8">
              <div className="grid gap-8">
                {panels.map((panel, index) => (
                  <motion.div
                    key={panel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="manga-panel"
                  >
                    <div className="relative">
                      <img
                        src={panel.image_url}
                        alt={panel.description}
                        className="w-full h-auto"
                      />
                      {panel.dialogue && (
                        <div className="absolute top-4 left-4 bg-manga-white border-2 border-manga-black p-3 max-w-xs rounded-lg">
                          <div className="text-sm font-medium text-manga-black">
                            {panel.dialogue}
                          </div>
                          <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-manga-black"></div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-manga-gray-600">
                      Panel {panel.index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          options={exportOptions}
          onOptionsChange={setExportOptions}
        />
      )}
    </div>
  )
}

// Export Modal Component
function ExportModal({ 
  onClose, 
  onExport, 
  options, 
  onOptionsChange 
}: {
  onClose: () => void
  onExport: (format: string) => void
  options: any
  onOptionsChange: (options: any) => void
}) {
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
          <h2 className="text-2xl font-bold text-manga-black">Export Story</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Export Format
            </label>
            <select
              value={options.format}
              onChange={(e) => onOptionsChange({ ...options, format: e.target.value })}
              className="manga-input"
            >
              <option value="pdf">PDF (Comic Book)</option>
              <option value="webtoon">Webtoon (Vertical Scroll)</option>
              <option value="instagram">Instagram (Square Panels)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-manga-black mb-2">
              Quality
            </label>
            <select
              value={options.quality}
              onChange={(e) => onOptionsChange({ ...options, quality: e.target.value })}
              className="manga-input"
            >
              <option value="high">High Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="low">Low Quality</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeMetadata"
              checked={options.includeMetadata}
              onChange={(e) => onOptionsChange({ ...options, includeMetadata: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="includeMetadata" className="text-sm text-manga-black">
              Include metadata (page numbers, title)
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="manga-button-secondary"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onExport(options.format)}
              className="manga-button"
            >
              Export
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
