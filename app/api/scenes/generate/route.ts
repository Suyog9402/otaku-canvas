import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/scenes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      throw new Error('Failed to generate scene')
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating scene:', error)
    return NextResponse.json({ error: 'Failed to generate scene' }, { status: 500 })
  }
}