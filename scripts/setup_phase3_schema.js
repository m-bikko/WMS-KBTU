const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function setupPhase3Schema() {
    try {
        console.log('Setting up Phase 3 Schema...');

        // 1. Alert Rules
        await sql`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID, -- Optional, if specific to a user
        alert_type TEXT NOT NULL, -- 'low_stock', 'overstock', 'slow_moving'
        conditions_json JSONB DEFAULT '{}'::jsonb,
        notification_method TEXT DEFAULT 'app',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created table: alert_rules');

        // 2. Generated Alerts
        await sql`
      CREATE TABLE IF NOT EXISTS generated_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_rule_id UUID REFERENCES alert_rules(id),
        severity TEXT DEFAULT 'info', -- 'info', 'warning', 'critical'
        message TEXT NOT NULL,
        data_json JSONB, -- Related data (e.g., item_id)
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created table: generated_alerts');

        // 3. Daily Insights
        await sql`
      CREATE TABLE IF NOT EXISTS daily_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL, -- 'summary', 'anomaly', 'trend'
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        severity TEXT DEFAULT 'info',
        related_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created table: daily_insights');

        // Seed some default alert rules
        const [existingRules] = await sql`SELECT count(*) FROM alert_rules`;
        if (existingRules.count == 0) {
            await sql`
        INSERT INTO alert_rules (alert_type, conditions_json, is_active)
        VALUES 
            ('low_stock', '{"threshold": 10}', true),
            ('high_value_order', '{"threshold": 1000}', true)
        `;
            console.log('Seeded default alert rules.');
        }

        console.log('Phase 3 Schema setup complete.');
    } catch (error) {
        console.error('Error setting up Phase 3 schema:', error);
    } finally {
        await sql.end();
    }
}

setupPhase3Schema();
