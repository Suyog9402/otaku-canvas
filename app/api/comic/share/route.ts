import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { story, panels, characterRef } = body

    // Generate a unique share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // In a real app, you'd store this in a database
    // For now, we'll create a simple shareable object
    const shareData = {
      id: shareId,
      story,
      panels,
      characterRef,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }

    // Create shareable URL
    const shareUrl = `${request.nextUrl.origin}/comic/${shareId}`
    
    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      shareData
    })
  } catch (error) {
    console.error('Error creating share:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create share' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('id')

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: 'Share ID required' },
        { status: 400 }
      )
    }

    // In a real app, you'd fetch from database
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      shareId,
      message: 'Share data would be fetched from database'
    })
  } catch (error) {
    console.error('Error fetching share:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch share' },
      { status: 500 }
    )
  }
}
