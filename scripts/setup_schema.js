const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // 1. Warehouses
        await sql`
      CREATE TABLE IF NOT EXISTS warehouses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT,
        capacity_sqft INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created warehouses table');

        // 2. Users (Extension of Auth)
        // Note: 'users' table in public schema often references auth.users
        await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        role TEXT CHECK (role IN ('admin', 'manager', 'operator')),
        warehouse_id UUID REFERENCES warehouses(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created profiles table');

        // 3. Inventory Items
        await sql`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        min_threshold INTEGER DEFAULT 0,
        max_threshold INTEGER,
        unit_cost DECIMAL(10, 2),
        warehouse_id UUID REFERENCES warehouses(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created inventory_items table');

        // 4. Inventory Locations
        await sql`
      CREATE TABLE IF NOT EXISTS inventory_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID REFERENCES warehouses(id),
        zone TEXT,
        aisle TEXT,
        shelf TEXT,
        bin TEXT,
        capacity INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created inventory_locations table');

        // 5. Inventory Stock (Junction table for item-location)
        await sql`
      CREATE TABLE IF NOT EXISTS inventory_stock (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES inventory_items(id),
        location_id UUID REFERENCES inventory_locations(id),
        quantity INTEGER DEFAULT 0,
        last_updated TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created inventory_stock table');

        // 6. Orders
        await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        status TEXT CHECK (status IN ('pending', 'picking', 'packing', 'shipped', 'cancelled')),
        priority TEXT CHECK (priority IN ('normal', 'high', 'urgent')),
        warehouse_id UUID REFERENCES warehouses(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created orders table');

        // 7. Order Items
        await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        item_id UUID REFERENCES inventory_items(id),
        quantity_ordered INTEGER NOT NULL,
        quantity_picked INTEGER DEFAULT 0
      );
    `;
        console.log('Created order_items table');

        // 8. Receiving Logs
        await sql`
      CREATE TABLE IF NOT EXISTS receiving_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID REFERENCES warehouses(id),
        supplier TEXT,
        received_date TIMESTAMPTZ DEFAULT NOW(),
        items_json JSONB,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created receiving_logs table');

        // 9. Movements
        await sql`
      CREATE TABLE IF NOT EXISTS movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id UUID REFERENCES inventory_items(id),
        from_location_id UUID REFERENCES inventory_locations(id),
        to_location_id UUID REFERENCES inventory_locations(id),
        quantity INTEGER NOT NULL,
        reason TEXT,
        user_id UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
        console.log('Created movements table');

        console.log('Database setup completed successfully.');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await sql.end();
    }
}

setupDatabase();
