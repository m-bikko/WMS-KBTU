const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function setupPhase4Schema() {
    try {
        console.log('Setting up Phase 4 Schema (Recommendations)...');

        // 1. reorder_recommendations
        await sql`
      CREATE TABLE IF NOT EXISTS reorder_recommendations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
        recommended_quantity INTEGER NOT NULL,
        reasoning TEXT,
        confidence_score INTEGER, -- 0 to 100
        status TEXT DEFAULT 'pending', -- pending, accepted, rejected
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created table: reorder_recommendations');

        console.log('Phase 4 Schema setup complete.');
    } catch (error) {
        console.error('Error setting up schema:', error);
    } finally {
        await sql.end();
    }
}

setupPhase4Schema();
