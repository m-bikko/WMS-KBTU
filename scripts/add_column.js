require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumn() {
    console.log('Adding current_utilization column...');

    const { data, error } = await supabase.rpc('exec_sql', {
        query: `ALTER TABLE inventory_locations ADD COLUMN IF NOT EXISTS current_utilization INTEGER DEFAULT 0;`
    });

    if (error) {
        console.error('Error adding column:', error);
    } else {
        console.log('Column added successfully:', data);
    }
}

addMissingColumn();
