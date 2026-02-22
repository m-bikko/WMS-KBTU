require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupWarehouseLocations() {
    console.log('Creating warehouse_locations table...');

    // Create table
    // Sometimes exec_sql wraps in a SELECT which causes issues with DDL.
    // Trying to ensure correct whitespace and syntax.
    const tableQuery = `
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

    const { error: tableError } = await supabase.rpc('exec_sql', { query: tableQuery });

    if (tableError) {
        console.error('Error creating table:', tableError);
        // If syntax error persists, it might be due to exec_sql wrapper logic.
        // Try simpler command without semi-colon if wrapper adds one? No, usually wrapper wraps in SELECT.
        // The wrapper is: EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;
        // THAT wrapper CANNOT run DDL like CREATE TABLE because it tries to SELECT FROM (CREATE TABLE ...)
        // which is invalid SQL.

        // Changing approach: We need a different RPC or use REST API if enabled?
        // Wait, I saw exec_sql implementation earlier.
        /*
          CREATE OR REPLACE FUNCTION exec_sql(query text)
          RETURNS jsonb
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            result jsonb;
          BEGIN
            IF query IS NOT NULL THEN
                EXECUTE 'SELECT jsonb_agg(t) FROM (' || query || ') t' INTO result;
            ELSE
                result := '[]'::jsonb;
            END IF;
            ...
        */
        // YES, the wrapper is purely for SELECTs. It breaks DDL.
        console.log("exec_sql is for SELECT only. Switching to direct SQL execution via a new RPC or notifying user.");
        return;
    }

    console.log('Table warehouse_locations created.');
}

setupWarehouseLocations();
