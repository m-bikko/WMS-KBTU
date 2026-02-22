import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/ai/gemini'

export async function POST(req: NextRequest) {
    try {
        const { items, warehouse_layout } = await req.json()

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
        }

        const prompt = `
      You are an expert in warehouse logistics and Traveling Salesman Problem optimization.
      
      I have a list of items to pick for an order.
      I need you to reorder them into the most efficient "Pick Path" to minimize walking distance.
      
      Items to Pick (with locations):
      ${JSON.stringify(items)}
      
      Warehouse Layout Strategy:
      - Zones are ordered A -> B -> C -> D.
      - Aisles are numbered 1-20.
      - Zig-zag path is usually most efficient.
      
      Output Format (JSON Array of Strings):
      ["Item A SKU", "Item B SKU", ...]
      
      Return ONLY the sorted array of SKUs.
    `

        const result = await geminiModel.generateContent(prompt)
        const responseText = result.response.text().replace(/```json|```/g, '').trim()
        const sortedSkus = JSON.parse(responseText)

        // Reorder original items based on returned SKUs
        const sortedItems = sortedSkus.map((sku: string) => items.find((i: any) => i.sku === sku)).filter(Boolean)

        return NextResponse.json({ path: sortedItems })

    } catch (error: any) {
        console.error('Error optimizing pick path:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
