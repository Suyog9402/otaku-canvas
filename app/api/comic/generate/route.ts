import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const story = formData.get('story') as string
    const characterReference = formData.get('character_reference') as File | null

    if (!story) {
      return NextResponse.json({ error: 'Story is required' }, { status: 400 })
    }

    // Create FormData for backend
    const backendFormData = new FormData()
    backendFormData.append('story', story)
    if (characterReference) {
      backendFormData.append('character_reference', characterReference)
    }

    const response = await fetch(`${API_BASE_URL}/comic/generate`, {
      method: 'POST',
      body: backendFormData
    })

    if (!response.ok) {
      throw new Error('Failed to generate comic')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating comic:', error)
    return NextResponse.json({ error: 'Failed to generate comic' }, { status: 500 })
  }
}
