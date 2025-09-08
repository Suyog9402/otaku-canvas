import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const demoScenarios = [
      {
        id: 'magic-portal',
        title: 'Magic Portal Dream',
        description: 'Fantasy adventure with magical cats',
        story: 'I dreamed I found a hidden portal in my backyard that led to a magical world where cats rule everything and I became their chosen human ambassador.',
        category: 'fantasy'
      },
      {
        id: 'grandmother-recipe',
        title: 'Grandmother\'s Recipe',
        description: 'Emotional family story about baking',
        story: 'The day my grandmother taught me to make her secret chocolate chip cookies, her wrinkled hands guiding mine as we mixed love into every ingredient, not knowing it would be our last time baking together.',
        category: 'emotional'
      },
      {
        id: 'superhero-hamster',
        title: 'Superhero Hamster',
        description: 'Comedy adventure with tiny hero',
        story: 'My pet hamster Mr. Nibbles discovered he had superpowers and had to save our neighborhood from robot vacuum cleaners that gained sentience.',
        category: 'adventure'
      }
    ]

    return NextResponse.json({ scenarios: demoScenarios })
  } catch (error) {
    console.error('Error fetching demo scenarios:', error)
    return NextResponse.json({ error: 'Failed to fetch demo scenarios' }, { status: 500 })
  }
}
