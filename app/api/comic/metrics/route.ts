import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/comic/metrics`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Return demo metrics if backend is unavailable
    return NextResponse.json({
      metrics: {
        totalGenerations: 12,
        averageTime: 8.5,
        successRate: 95,
        apiUsage: 48,
        totalPanelsGenerated: 48,
        lastGenerationTime: 7.2
      }
    })
  }
}
