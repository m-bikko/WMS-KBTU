const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function seedDatabase() {
    try {
        console.log('Starting seed...');

        // 1. Create a Warehouse
        const [warehouse] = await sql`
      INSERT INTO warehouses (name, address, capacity_sqft)
      VALUES ('Main Distribution Center', '123 Logistics Way, Indusville', 50000)
      RETURNING id
    `;
        console.log('Created Warehouse:', warehouse.id);

        // 2. Create Items
        const categories = ['Electronics', 'HomeGoods', 'Apparel', 'Automotive'];
        const items = [];
        for (let i = 1; i <= 50; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const [item] = await sql`
            INSERT INTO inventory_items (sku, name, category, min_threshold, max_threshold, unit_cost, warehouse_id)
            VALUES (
                ${`SKU-${1000 + i}`}, 
                ${`${category} Item ${i}`}, 
                ${category}, 
                10, 
                100, 
                ${(Math.random() * 50 + 5).toFixed(2)},
                ${warehouse.id}
            )
            RETURNING id
        `;
            items.push(item);
        }
        console.log(`Created ${items.length} items.`);

        // 3. Create Locations
        const locations = [];
        for (const zone of ['A', 'B', 'C', 'D']) {
            for (let aisle = 1; aisle <= 5; aisle++) {
                const [location] = await sql`
                INSERT INTO inventory_locations (warehouse_id, zone, aisle, shelf, bin, capacity)
                VALUES (${warehouse.id}, ${zone}, ${aisle.toString()}, '1', '1', 100)
                RETURNING id
            `;
                locations.push(location);
            }
        }
        console.log(`Created ${locations.length} locations.`);

        // 4. Create Stock
        for (const item of items) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            await sql`
            INSERT INTO inventory_stock (item_id, location_id, quantity)
            VALUES (${item.id}, ${location.id}, ${Math.floor(Math.random() * 80 + 10)})
        `;
        }
        console.log('Stocked items.');

        // 5. Create Orders
        const customers = ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp'];
        const statuses = ['pending', 'picking', 'packing', 'shipped'];

        for (let i = 1; i <= 10; i++) {
            const [order] = await sql`
            INSERT INTO orders (order_number, customer_name, status, priority, warehouse_id)
            VALUES (
                ${`ORD-2023-${100 + i}`}, 
                ${customers[Math.floor(Math.random() * customers.length)]}, 
                ${statuses[Math.floor(Math.random() * statuses.length)]}, 
                ${Math.random() > 0.8 ? 'urgent' : 'normal'},
                ${warehouse.id}
            )
            RETURNING id
        `;

            // Order Items
            const numItems = Math.floor(Math.random() * 5 + 1);
            for (let j = 0; j < numItems; j++) {
                const item = items[Math.floor(Math.random() * items.length)];
                await sql`
                INSERT INTO order_items (order_id, item_id, quantity_ordered)
                VALUES (${order.id}, ${item.id}, ${Math.floor(Math.random() * 5 + 1)})
            `;
            }
        }
        console.log('Created 10 orders.');

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sql.end();
    }
}

seedDatabase();
