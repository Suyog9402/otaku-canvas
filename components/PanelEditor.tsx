'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Move, 
  Resize, 
  Type, 
  Trash2, 
  Save, 
  RotateCcw,
  Download,
  Upload
} from 'lucide-react'
import Image from 'next/image'

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

interface PanelEditorProps {
  panels: Panel[]
  onUpdatePanel: (panelId: string, updates: Partial<Panel>) => void
  onDeletePanel: (panelId: string) => void
  onSave: () => void
  onExport: (format: string) => void
  loading?: boolean
}

export default function PanelEditor({ 
  panels, 
  onUpdatePanel, 
  onDeletePanel, 
  onSave, 
  onExport,
  loading = false 
}: PanelEditorProps) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showDialogueEditor, setShowDialogueEditor] = useState<string | null>(null)
  const [dialogueText, setDialogueText] = useState('')
  
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent, panelId: string, action: 'move' | 'resize') => {
    e.preventDefault()
    e.stopPropagation()
    
    const panel = panels.find(p => p.id === panelId)
    if (!panel) return

    setSelectedPanel(panelId)
    
    if (action === 'move') {
      setIsDragging(true)
      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    } else if (action === 'resize') {
      setIsResizing(true)
    }
  }, [panels])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedPanel || (!isDragging && !isResizing)) return

    const panel = panels.find(p => p.id === selectedPanel)
    if (!panel) return

    if (isDragging) {
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      const newX = e.clientX - canvasRect.left - dragOffset.x
      const newY = e.clientY - canvasRect.top - dragOffset.y

      onUpdatePanel(selectedPanel, {
        position: {
          x: Math.max(0, Math.min(newX, canvasRect.width - panel.size.width)),
          y: Math.max(0, Math.min(newY, canvasRect.height - panel.size.height))
        }
      })
    } else if (isResizing) {
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      const newWidth = Math.max(100, e.clientX - canvasRect.left - panel.position.x)
      const newHeight = Math.max(100, e.clientY - canvasRect.top - panel.position.y)

      onUpdatePanel(selectedPanel, {
        size: {
          width: Math.min(newWidth, canvasRect.width - panel.position.x),
          height: Math.min(newHeight, canvasRect.height - panel.position.y)
        }
      })
    }
  }, [selectedPanel, isDragging, isResizing, dragOffset, panels, onUpdatePanel])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const handleDialogueEdit = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId)
    setDialogueText(panel?.dialogue || '')
    setShowDialogueEditor(panelId)
  }

  const handleDialogueSave = () => {
    if (selectedPanel) {
      onUpdatePanel(selectedPanel, { dialogue: dialogueText })
      setShowDialogueEditor(null)
    }
  }

  const handleRotate = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId)
    if (!panel) return

    const currentRotation = panel.rotation || 0
    const newRotation = (currentRotation + 90) % 360
    
    onUpdatePanel(panelId, { rotation: newRotation })
  }

  return (
    <div className="h-full flex flex-col bg-manga-gray-50">
      {/* Toolbar */}
      <div className="p-4 border-b-2 border-manga-black bg-manga-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-manga-black">Panel Editor</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-manga-gray-600">
              {panels.length} panel{panels.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSave}
            disabled={loading}
            className="manga-button flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </motion.button>
          
          <div className="relative">
            <select
              onChange={(e) => onExport(e.target.value)}
              className="manga-button-secondary appearance-none pr-8"
            >
              <option value="">Export</option>
              <option value="pdf">PDF</option>
              <option value="webtoon">Webtoon</option>
              <option value="instagram">Instagram</option>
            </select>
            <Download className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative bg-manga-white border-2 border-manga-gray-300"
          style={{ minHeight: '600px' }}
        >
          {panels.map((panel) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute border-2 cursor-move ${
                selectedPanel === panel.id
                  ? 'border-manga-accent shadow-lg'
                  : 'border-manga-black hover:border-manga-gray-600'
              }`}
              style={{
                left: panel.position.x,
                top: panel.position.y,
                width: panel.size.width,
                height: panel.size.height,
                transform: panel.rotation ? `rotate(${panel.rotation}deg)` : 'none',
                zIndex: selectedPanel === panel.id ? 10 : 1
              }}
              onMouseDown={(e) => handleMouseDown(e, panel.id, 'move')}
            >
              {/* Panel Image */}
              <div className="w-full h-full relative overflow-hidden bg-manga-gray-100">
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
              {panel.dialogue && (
                <div className="absolute top-2 left-2 bg-manga-white border border-manga-black p-2 max-w-[80%] rounded-lg">
                  <div className="text-sm font-medium text-manga-black">
                    {panel.dialogue}
                  </div>
                  <div className="absolute -bottom-1 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-manga-black"></div>
                </div>
              )}

              {/* Panel Controls */}
              <div className="absolute top-1 right-1 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDialogueEdit(panel.id)}
                  className="p-1 bg-manga-white border border-manga-black text-manga-black hover:bg-manga-gray-100"
                  title="Edit Dialogue"
                >
                  <Type className="w-3 h-3" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRotate(panel.id)}
                  className="p-1 bg-manga-white border border-manga-black text-manga-black hover:bg-manga-gray-100"
                  title="Rotate"
                >
                  <RotateCcw className="w-3 h-3" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeletePanel(panel.id)}
                  className="p-1 bg-manga-accent border border-manga-black text-manga-white hover:bg-red-600"
                  title="Delete Panel"
                >
                  <Trash2 className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-manga-accent cursor-se-resize"
                onMouseDown={(e) => handleMouseDown(e, panel.id, 'resize')}
              />
            </motion.div>
          ))}

          {/* Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dialogue Editor Modal */}
      <AnimatePresence>
        {showDialogueEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDialogueEditor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-manga-white border-2 border-manga-black p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-manga-black mb-4">
                Edit Dialogue
              </h3>
              
              <textarea
                value={dialogueText}
                onChange={(e) => setDialogueText(e.target.value)}
                className="manga-input h-24 resize-none mb-4"
                placeholder="Enter dialogue for this panel..."
                autoFocus
              />
              
              <div className="flex gap-2 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDialogueEditor(null)}
                  className="manga-button-secondary"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDialogueSave}
                  className="manga-button"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
