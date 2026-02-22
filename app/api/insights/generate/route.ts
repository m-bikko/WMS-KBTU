import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/ai/gemini'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        // 1. Fetch data summary from the last 24 hours (or general stats for demo)

        // a. Order Count (Total & Pending)
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true })
        const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

        // b. Low Stock Items
        const { data: items } = await supabase.from('inventory_items').select('name, min_threshold, inventory_stock(quantity)')
        const lowStockItems = items?.filter(item => {
            const total = item.inventory_stock.reduce((acc: number, curr: any) => acc + curr.quantity, 0)
            return total < item.min_threshold
        }) || []

        const dataContext = `
      Current Warehouse Status:
      - Total Orders: ${totalOrders}
      - Pending Orders: ${pendingOrders}
      - Low Stock Items Count: ${lowStockItems.length}
      - Specific Low Stock Items: ${lowStockItems.map(i => i.name).join(', ')}
      - Date: ${new Date().toLocaleDateString()}
    `

        // 2. Generate Insight with Gemini
        const prompt = `
      You are an intelligent warehouse analyst. Analyze the following data and generate 3 key insights for the warehouse manager.
      
      Data:
      ${dataContext}
      
      Rules:
      1. Return a JSON array of objects with keys: "title", "content", "severity" (info, warning, critical), "type" (summary, anomaly, trend).
      2. No markdown, just raw JSON.
      3. Focus on actionable insights.
      4. Example: [{"title": "Low Stock Warning", "content": "5 items are below threshold...", "severity": "warning", "type": "anomaly"}]
    `

        const result = await geminiModel.generateContent(prompt)
        const responseText = result.response.text().replace(/```json|```/g, '').trim()
        const insights = JSON.parse(responseText)

        // 3. Save to Database
        const inserts = insights.map((insight: any) => ({
            title: insight.title,
            content: insight.content,
            severity: insight.severity,
            type: insight.type,
            related_data: { context: 'daily_gen' }
        }))

        const { error } = await supabase.from('daily_insights').insert(inserts)

        if (error) throw error

        return NextResponse.json({ success: true, insights: inserts })

    } catch (error: any) {
        console.error('Insight Gen Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
