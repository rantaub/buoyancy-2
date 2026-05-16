import { NextRequest, NextResponse } from 'next/server'
import { identifyFossil, DEMO_FOSSIL } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json()

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Image data required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Return demo data when no API key is configured
      await new Promise(r => setTimeout(r, 2000))
      return NextResponse.json(DEMO_FOSSIL)
    }

    const fossilData = await identifyFossil(imageBase64, mimeType)
    return NextResponse.json(fossilData)
  } catch (error) {
    console.error('Identification error:', error)
    return NextResponse.json(
      { error: 'Failed to identify fossil. Please try again.' },
      { status: 500 }
    )
  }
}
