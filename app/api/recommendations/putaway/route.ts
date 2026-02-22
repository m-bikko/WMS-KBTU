import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/ai/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const { item_name, category, size_tier } = await req.json()

        // Fetch existing locations to see where similar items are
        const { data: locations } = await supabase
            .from('inventory_locations')
            .select('*')
            .limit(20)

        const prompt = `
      Suggest the best warehouse location to store a new item:
      Item: ${item_name}
      Category: ${category}
      Size Tier: ${size_tier}
      
      Available Locations Sample:
      ${JSON.stringify(locations)}
      
      Rules:
      - Heavy items go to Zone A (Ground floor).
      - Electronics go to Zone B (Secure).
      - General items fill available space in C or D.
      
      Response Format (JSON):
      {
        "suggested_zone": "A",
        "suggested_aisle": "3",
        "reasoning": "Heavy item, should be near shipping dock in Zone A."
      }
    `

        const result = await geminiModel.generateContent(prompt)
        const responseText = result.response.text().replace(/```json|```/g, '').trim()
        const suggestion = JSON.parse(responseText)

        return NextResponse.json(suggestion)

    } catch (error: any) {
        console.error('Error suggesting putaway:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
