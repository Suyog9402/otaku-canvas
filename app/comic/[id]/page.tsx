'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ComicExportService } from '@/lib/comic-export'
import toast from 'react-hot-toast'

interface Panel {
  panel_number: number
  image_url: string
  scene_description: string
  dialogue: string
  prompt_used: string
}

interface SharedComic {
  id: string
  story: string
  panels: Panel[]
  characterRef?: string
  createdAt: string
  expiresAt: string
}

export default function SharedComicPage({ params }: { params: { id: string } }) {
  const [comic, setComic] = useState<SharedComic | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchSharedComic()
  }, [params.id])

  const fetchSharedComic = async () => {
    try {
      // In a real app, you'd fetch from the database
      // For now, we'll show a placeholder
      setComic({
        id: params.id,
        story: "This is a shared comic! In a real app, this would be fetched from the database.",
        panels: [
          {
            panel_number: 1,
            image_url: '',
            scene_description: 'Panel 1 description',
            dialogue: 'Sample dialogue',
            prompt_used: 'Sample prompt'
          },
          {
            panel_number: 2,
            image_url: '',
            scene_description: 'Panel 2 description',
            dialogue: 'More dialogue',
            prompt_used: 'Sample prompt'
          }
        ],
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    } catch (error) {
      console.error('Error fetching shared comic:', error)
      toast.error('Failed to load shared comic')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!comic || comic.panels.length === 0) {
      toast.error('No comic panels to export')
      return
    }

    setIsExporting(true)
    try {
      const exportService = new ComicExportService()
      
      const comicPanels = comic.panels.map(panel => ({
        panel_number: panel.panel_number,
        image_url: panel.image_url || '/images/placeholders/placeholder.png',
        scene_description: panel.scene_description,
        dialogue: panel.dialogue
      }))

      const pdfBlob = await exportService.exportToPDF(comicPanels, comic.story, {
        format: 'pdf',
        quality: 'high',
        includeDialogue: true,
        includeStory: true
      })

      exportService.downloadBlob(pdfBlob, `shared_comic_${comic.id}.pdf`)
      toast.success('Comic exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export comic. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Comic Not Found</h1>
          <p className="text-gray-600 mb-6">This shared comic may have expired or doesn't exist.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Create Your Own Comic
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link 
            href="/" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Comic Generator
          </Link>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>
          </div>
        </motion.div>

        {/* Comic Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shared Comic</h1>
            <p className="text-gray-600">Created on {new Date(comic.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Story */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Story</h2>
            <p className="text-gray-700 leading-relaxed">{comic.story}</p>
          </div>

          {/* Panels */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comic Panels</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {comic.panels.map((panel) => (
                <div key={panel.panel_number} className="text-center">
                  <div className="bg-gray-100 rounded-lg p-4 mb-2 min-h-[200px] flex items-center justify-center overflow-hidden">
                    {panel.image_url ? (
                      <img 
                        src={panel.image_url} 
                        alt={`Panel ${panel.panel_number}`}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    ) : (
                      <span className="text-gray-500">Panel {panel.panel_number}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{panel.scene_description}</p>
                  {panel.dialogue && (
                    <p className="text-xs text-blue-600 italic">"{panel.dialogue}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>This comic was shared from OtakuCanvas - AI-Powered Manga Creator</p>
            <p>Expires on {new Date(comic.expiresAt).toLocaleDateString()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
