const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;
const sql = postgres(connectionString);

async function seedPhase3Data() {
    try {
        console.log('Seeding Phase 3 Data...');

        // 1. Seed some alerts
        const [rule] = await sql`SELECT id FROM alert_rules LIMIT 1`;
        if (rule) {
            await sql`
            INSERT INTO generated_alerts (alert_rule_id, severity, message, created_at)
            VALUES 
                (${rule.id}, 'warning', 'Low stock alert: Widget B is below threshold (5 units)', NOW() - INTERVAL '2 hours'),
                (${rule.id}, 'info', 'New shipment of Electronics received.', NOW() - INTERVAL '5 hours'),
                (${rule.id}, 'critical', 'Urgent order #ORD-003 is overdue for picking.', NOW() - INTERVAL '30 minutes')
        `;
            console.log('Seeded 3 alerts.');
        }

        // 2. Seed some insights
        await sql`
        INSERT INTO daily_insights (type, title, content, severity, created_at)
        VALUES 
            ('anomaly', 'Unusual Order Volume', 'Order volume for "HomeGoods" category is 40% higher than the 30-day average.', 'warning', NOW()),
            ('trend', 'Inventory Value Increasing', 'Total inventory value has increased by 15% this week due to recent high-value receipts.', 'info', NOW()),
            ('summary', 'Daily Digest', 'Operations are running smoothly. 12 orders shipped yesterday. 2 pending orders require attention.', 'info', NOW())
    `;
        console.log('Seeded 3 daily insights.');

    } catch (error) {
        console.error('Error seeding Phase 3 data:', error);
    } finally {
        await sql.end();
    }
}

seedPhase3Data();
