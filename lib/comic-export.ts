import jsPDF from 'jspdf'

export interface ComicPanel {
  panel_number: number
  image_url: string
  scene_description: string
  dialogue: string
}

export interface ExportOptions {
  format: 'pdf' | 'images'
  quality: 'high' | 'medium' | 'low'
  includeDialogue: boolean
  includeStory: boolean
}

export class ComicExportService {
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  async exportToPDF(panels: ComicPanel[], story: string, options: ExportOptions): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Add title page
    pdf.setFontSize(20)
    pdf.text('My AI Generated Comic', 105, 30, { align: 'center' })
    
    if (options.includeStory) {
      pdf.setFontSize(12)
      const storyLines = this.wrapText(story, 80)
      let y = 50
      for (const line of storyLines) {
        pdf.text(line, 20, y)
        y += 6
      }
    }
    
    // Add panels (2x2 grid)
    for (let i = 0; i < panels.length; i++) {
      const x = (i % 2) * 90 + 20
      const y = Math.floor(i / 2) * 100 + (options.includeStory ? 80 : 50)
      
      try {
        // For demo purposes, we'll add placeholder rectangles
        // In production, you'd load actual images
        pdf.rect(x, y, 80, 80)
        pdf.setFontSize(10)
        pdf.text(`Panel ${i + 1}`, x + 40, y + 40, { align: 'center' })
        
        // Add dialogue below panel
        if (options.includeDialogue && panels[i].dialogue) {
          pdf.setFontSize(8)
          const dialogueLines = this.wrapText(panels[i].dialogue, 80)
          let dialogueY = y + 85
          for (const line of dialogueLines) {
            pdf.text(line, x, dialogueY)
            dialogueY += 4
          }
        }
      } catch (error) {
        console.error('Error adding panel to PDF:', error)
        // Fallback for failed images
        pdf.rect(x, y, 80, 80)
        pdf.text(`Panel ${i + 1}`, x + 40, y + 40, { align: 'center' })
      }
    }
    
    return pdf.output('blob')
  }

  async exportAsImages(panels: ComicPanel[]): Promise<Blob[]> {
    const blobs: Blob[] = []
    
    for (const panel of panels) {
      try {
        const img = await this.loadImage(panel.image_url)
        
        // Create canvas for each panel
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        
        // Draw image
        ctx.drawImage(img, 0, 0)
        
        // Note: Dialogue is now included in the image itself as speech bubbles
        // No need to add separate dialogue overlay
        
        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, 'image/jpeg', 0.9)
        })
        
        blobs.push(blob)
      } catch (error) {
        console.error('Error processing panel for export:', error)
      }
    }
    
    return blobs
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (testLine.length <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          lines.push(word)
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  downloadMultipleBlobs(blobs: Blob[], baseFilename: string) {
    blobs.forEach((blob, index) => {
      this.downloadBlob(blob, `${baseFilename}_panel_${index + 1}.jpg`)
    })
  }
}
