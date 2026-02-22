require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    console.log('Checking schema...');

    const tables = ['inventory_locations'];

    for (const table of tables) {
        console.log(`\n--- ${table} ---`);
        // Querying information_schema to check columns
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`
        });

        if (error) {
            console.error(`Error querying ${table}:`, error);
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

checkSchema();
