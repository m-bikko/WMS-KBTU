require('dotenv').config({ path: '.env' });
const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function setupWarehouseLocations() {
    console.log('Creating warehouse_locations table using direct connection...');

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS warehouse_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_id UUID REFERENCES warehouse_locations(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        path TEXT,
        capacity INTEGER DEFAULT 0,
        current_utilization INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
        console.log('Table warehouse_locations created.');

        await sql`CREATE INDEX IF NOT EXISTS idx_warehouse_locations_parent_id ON warehouse_locations(parent_id)`;
        console.log('Index parent_id created.');

        await sql`CREATE INDEX IF NOT EXISTS idx_warehouse_locations_path ON warehouse_locations(path)`;
        console.log('Index path created.');

        // Also fixing the missing column in inventory_locations just in case
        try {
            await sql`ALTER TABLE inventory_locations ADD COLUMN IF NOT EXISTS current_utilization INTEGER DEFAULT 0`;
            console.log('Fixed inventory_locations column too.');
        } catch (e) {
            console.log('inventory_locations fix skipped:', e.message);
        }

    } catch (error) {
        console.error('Error executing SQL:', error);
    } finally {
        await sql.end();
    }
}

setupWarehouseLocations();
