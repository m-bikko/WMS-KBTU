import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/ai/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        // 1. Fetch relevant data: Inventory items that are low in stock (or all items to be safe)
        // For this prototype, we'll fetch items where current_quantity < min_threshold * 1.5 (near low stock)
        const { data: items, error: itemsError } = await supabase
            .from('inventory_items')
            .select('*')

        if (itemsError) throw itemsError

        // 2. Fetch recent movements to calculate velocity (mocking this logic slightly for now as we might not have enough history)
        const { data: movements, error: movementsError } = await supabase
            .from('movements')
            .select('*')
            .limit(100)
            .order('created_at', { ascending: false })

        if (movementsError) throw movementsError

        const prompt = `
      Analyze the following inventory data and recent movements to identify items that need reordering.
      
      Inventory Items:
      ${JSON.stringify(items).slice(0, 3000)}
      
      Recent Movements:
      ${JSON.stringify(movements).slice(0, 3000)}
      
      Goal: 
      Recommend reorder quantities for items that are low in stock or moving fast. 
      Calculate a recommended quantity based on: (Target Stock = Max Threshold) - Current Stock.
      
      Output Format (JSON Array):
      [
        {
          "sku": "ITEM_SKU",
          "recommended_quantity": 50,
          "reasoning": "Stock is 5 units below min threshold and velocity is high.",
          "confidence_score": 85
        }
      ]
      
      Return ONLY valid JSON.
    `

        const result = await geminiModel.generateContent(prompt)
        const responseText = result.response.text().replace(/```json|```/g, '').trim()
        const recommendations = JSON.parse(responseText)

        const savedRecommendations = []

        // 3. Save recommendations to DB
        for (const rec of recommendations) {
            // Find item ID by SKU
            const item = items.find((i: any) => i.sku === rec.sku)
            if (item) {
                const { data, error } = await supabase
                    .from('reorder_recommendations')
                    .insert({
                        item_id: item.id,
                        recommended_quantity: rec.recommended_quantity,
                        reasoning: rec.reasoning,
                        confidence_score: rec.confidence_score,
                        status: 'pending'
                    })
                    .select()

                if (!error && data) savedRecommendations.push(data[0])
            }
        }

        return NextResponse.json({
            success: true,
            generated: savedRecommendations.length,
            recommendations: savedRecommendations
        })

    } catch (error: any) {
        console.error('Error in reorder recommendations:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
