import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/characters/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create character')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json({ error: 'Failed to create character' }, { status: 500 })
  }
}