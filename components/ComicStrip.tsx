'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Share2, MessageSquare, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import { ComicExportService, ComicPanel, ExportOptions } from '@/lib/comic-export'

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

interface ComicStripProps {
  panels: Panel[]
  story: string
  generationResult: ComicGeneration | null
}

export default function ComicStrip({ panels, story, generationResult }: ComicStripProps) {
  const [editingDialogue, setEditingDialogue] = useState<number | null>(null)
  const [dialogueText, setDialogueText] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)

  const exportService = new ComicExportService()

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const exportOptions: ExportOptions = {
        format: 'pdf',
        quality: 'high',
        includeDialogue: true,
        includeStory: true
      }
      
      const pdfBlob = await exportService.exportToPDF(panels, story, exportOptions)
      exportService.downloadBlob(pdfBlob, 'my-ai-comic.pdf')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const shareToSocial = () => {
    const shareText = `I just created an AI comic from my story! Check out this amazing tool: ${window.location.href}`
    if (navigator.share) {
      navigator.share({
        title: 'My AI Generated Comic',
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Share link copied to clipboard!')
    }
  }

  const startEditingDialogue = (panelIndex: number, currentDialogue: string) => {
    setEditingDialogue(panelIndex)
    setDialogueText(currentDialogue)
  }

  const saveDialogue = () => {
    if (editingDialogue !== null) {
      // Update dialogue in panels array
      panels[editingDialogue].dialogue = dialogueText
      setEditingDialogue(null)
      setDialogueText('')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Generated Comic</h2>
        <p className="text-gray-600 mb-4">Story: {story.substring(0, 100)}...</p>
        {generationResult && (
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>Generation Time: {generationResult.generation_time}s</span>
            <span>•</span>
            <span>Panels: {panels.length}</span>
            {generationResult.is_sample && (
              <>
                <span>•</span>
                <span className="text-green-600">Sample Comic</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Comic Panels Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {panels.map((panel, index) => (
          <motion.div
            key={panel.panel_number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Panel Image */}
            <div className="relative aspect-square bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
              {panel.image_url ? (
                <Image
                  src={panel.image_url}
                  alt={`Panel ${panel.panel_number}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">Panel {panel.panel_number}</div>
                    <div className="text-sm">Generated Image</div>
                  </div>
                </div>
              )}
              
              {/* Dialogue Bubble */}
              {panel.dialogue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 left-4 bg-white border-2 border-gray-800 p-3 max-w-xs rounded-lg shadow-lg"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {editingDialogue === index ? (
                      <textarea
                        value={dialogueText}
                        onChange={(e) => setDialogueText(e.target.value)}
                        className="w-full p-1 border rounded text-sm"
                        rows={2}
                        autoFocus
                      />
                    ) : (
                      panel.dialogue
                    )}
                  </div>
                  <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                </motion.div>
              )}
            </div>

            {/* Panel Controls */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Panel {panel.panel_number}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEditingDialogue(index, panel.dialogue)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                  title="Edit dialogue"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                {editingDialogue === index && (
                  <button
                    onClick={saveDialogue}
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                    title="Save dialogue"
                  >
                    ✓
                  </button>
                )}
              </div>
            </div>

            {/* Panel Description */}
            <div className="mt-2 text-xs text-gray-500">
              {panel.scene_description}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Export and Share Buttons */}
      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportToPDF}
          disabled={isExporting}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download PDF
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareToSocial}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share Comic
        </motion.button>
      </div>
    </div>
  )
}
