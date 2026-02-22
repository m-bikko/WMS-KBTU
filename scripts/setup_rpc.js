const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined.');
    process.exit(1);
}

const sql = postgres(connectionString);

async function setupRpc() {
    try {
        console.log('Setting up exec_sql RPC function...');

        // Warning: This is a high-privilege function. In production, restrict access carefully.
        await sql`
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
        
        IF result IS NULL THEN
            result := '[]'::jsonb;
        END IF;
        
        RETURN result;
      END;
      $$;
    `;

        console.log('RPC function exec_sql created successfully.');
    } catch (error) {
        console.error('Error creating RPC function:', error);
    } finally {
        await sql.end();
    }
}

setupRpc();
