import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        // 1. Fetch Active Alert Rules
        const { data: rules } = await supabase.from('alert_rules').select('*').eq('is_active', true)
        if (!rules || rules.length === 0) return NextResponse.json({ message: 'No active rules' })

        const alertsToCreate = []

        for (const rule of rules) {
            if (rule.alert_type === 'low_stock') {
                const threshold = rule.conditions_json.threshold || 10

                // Check for items below threshold
                const { data: items } = await supabase.from('inventory_items').select('id, name, min_threshold, inventory_stock(quantity)')

                if (items) {
                    for (const item of items) {
                        const totalStock = item.inventory_stock.reduce((acc: number, curr: any) => acc + curr.quantity, 0)
                        if (totalStock < threshold) {
                            alertsToCreate.push({
                                alert_rule_id: rule.id,
                                severity: 'warning',
                                message: `Low stock alert: ${item.name} has ${totalStock} units (Threshold: ${threshold})`,
                                data_json: { item_id: item.id, current_stock: totalStock }
                            })
                        }
                    }
                }
            }
        }

        // 2. Insert Alerts (deduplicate logic would go here in production)
        if (alertsToCreate.length > 0) {
            const { error } = await supabase.from('generated_alerts').insert(alertsToCreate)
            if (error) throw error
        }

        return NextResponse.json({ success: true, alerts_generated: alertsToCreate.length })

    } catch (error: any) {
        console.error('Alert Check Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
