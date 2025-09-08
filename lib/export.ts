import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface ExportOptions {
  format: 'pdf' | 'webtoon' | 'instagram'
  quality: 'high' | 'medium' | 'low'
  includeMetadata: boolean
  title?: string
  author?: string
}

export interface Panel {
  id: string
  image_url: string
  dialogue?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation?: number
}

export class ExportService {
  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  private getQualitySettings(quality: string) {
    switch (quality) {
      case 'high':
        return { scale: 2, quality: 1.0 }
      case 'medium':
        return { scale: 1.5, quality: 0.8 }
      case 'low':
        return { scale: 1, quality: 0.6 }
      default:
        return { scale: 1.5, quality: 0.8 }
    }
  }

  async exportToPDF(panels: Panel[], options: ExportOptions): Promise<Blob> {
    const { scale, quality } = this.getQualitySettings(options.quality)
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // PDF settings
    const pageWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const margin = 10
    const contentWidth = pageWidth - (margin * 2)
    const contentHeight = pageHeight - (margin * 2)

    let currentY = margin
    let pageNumber = 1

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i]
      
      try {
        // Load panel image
        const img = await this.loadImage(panel.image_url)
        
        // Calculate dimensions
        const aspectRatio = img.width / img.height
        const maxWidth = contentWidth
        const maxHeight = contentHeight * 0.8 // Leave space for dialogue
        
        let imgWidth = maxWidth
        let imgHeight = maxWidth / aspectRatio
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight
          imgWidth = maxHeight * aspectRatio
        }

        // Check if we need a new page
        if (currentY + imgHeight + 20 > pageHeight - margin) {
          pdf.addPage()
          currentY = margin
          pageNumber++
        }

        // Add panel image
        pdf.addImage(
          img,
          'JPEG',
          margin + (contentWidth - imgWidth) / 2,
          currentY,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        )

        currentY += imgHeight + 5

        // Add dialogue if exists
        if (panel.dialogue) {
          pdf.setFontSize(10)
          pdf.setFont('helvetica', 'normal')
          
          // Split dialogue into lines that fit the page width
          const maxLineWidth = contentWidth - 10
          const words = panel.dialogue.split(' ')
          let line = ''
          const lines: string[] = []
          
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word
            const textWidth = pdf.getTextWidth(testLine)
            
            if (textWidth > maxLineWidth && line) {
              lines.push(line)
              line = word
            } else {
              line = testLine
            }
          }
          if (line) lines.push(line)

          // Add dialogue lines
          for (const dialogueLine of lines) {
            if (currentY + 5 > pageHeight - margin) {
              pdf.addPage()
              currentY = margin
              pageNumber++
            }
            
            pdf.text(dialogueLine, margin + 5, currentY)
            currentY += 5
          }
        }

        currentY += 10

      } catch (error) {
        console.error(`Error processing panel ${i + 1}:`, error)
        // Add placeholder for failed panel
        pdf.setFontSize(12)
        pdf.text(`Panel ${i + 1} - Image failed to load`, margin, currentY)
        currentY += 20
      }
    }

    // Add metadata if requested
    if (options.includeMetadata) {
      const totalPages = pdf.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Page ${i} of ${totalPages}${options.title ? ` - ${options.title}` : ''}`,
          pageWidth - 50,
          pageHeight - 5
        )
      }
    }

    return pdf.output('blob')
  }

  async exportToWebtoon(panels: Panel[], options: ExportOptions): Promise<Blob> {
    const { scale } = this.getQualitySettings(options.quality)
    const webtoonWidth = 800
    const spacing = 20
    
    // Calculate total height
    let totalHeight = 0
    const processedPanels: { img: HTMLImageElement; height: number }[] = []
    
    for (const panel of panels) {
      try {
        const img = await this.loadImage(panel.image_url)
        const aspectRatio = img.width / img.height
        const panelHeight = webtoonWidth / aspectRatio
        processedPanels.push({ img, height: panelHeight })
        totalHeight += panelHeight + spacing
      } catch (error) {
        console.error('Error processing panel:', error)
      }
    }

    // Create canvas for webtoon
    const canvas = document.createElement('canvas')
    canvas.width = webtoonWidth
    canvas.height = totalHeight
    const ctx = canvas.getContext('2d')!
    
    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw panels
    let currentY = 0
    for (const { img, height } of processedPanels) {
      ctx.drawImage(img, 0, currentY, webtoonWidth, height)
      currentY += height + spacing
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/jpeg', 0.9)
    })
  }

  async exportToInstagram(panels: Panel[], options: ExportOptions): Promise<Blob[]> {
    const { scale } = this.getQualitySettings(options.quality)
    const instagramSize = 1080 // Instagram square size
    const blobs: Blob[] = []

    for (const panel of panels) {
      try {
        const img = await this.loadImage(panel.image_url)
        
        // Create square canvas
        const canvas = document.createElement('canvas')
        canvas.width = instagramSize
        canvas.height = instagramSize
        const ctx = canvas.getContext('2d')!
        
        // Fill background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Calculate dimensions to fit in square
        const aspectRatio = img.width / img.height
        let drawWidth = instagramSize
        let drawHeight = instagramSize
        
        if (aspectRatio > 1) {
          // Landscape - fit to width
          drawHeight = instagramSize / aspectRatio
        } else {
          // Portrait - fit to height
          drawWidth = instagramSize * aspectRatio
        }

        const x = (instagramSize - drawWidth) / 2
        const y = (instagramSize - drawHeight) / 2

        // Draw image
        ctx.drawImage(img, x, y, drawWidth, drawHeight)

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
        console.error('Error processing panel for Instagram:', error)
      }
    }

    return blobs
  }

  async exportPanels(panels: Panel[], options: ExportOptions): Promise<Blob | Blob[]> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(panels, options)
      case 'webtoon':
        return this.exportToWebtoon(panels, options)
      case 'instagram':
        return this.exportToInstagram(panels, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
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
      this.downloadBlob(blob, `${baseFilename}_${index + 1}.jpg`)
    })
  }
}
