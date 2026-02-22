export const databaseSchema = `
The database uses PostgreSQL via Supabase.

Table: warehouses
- id (uuid, primary key)
- name (text)
- address (text)
- capacity_sqft (integer)

Table: inventory_items
- id (uuid, primary key)
- sku (text, unique)
- name (text)
- category (text)
- min_threshold (integer)
- max_threshold (integer)
- unit_cost (decimal)
- warehouse_id (uuid, foreign key to warehouses.id)

Table: inventory_locations
- id (uuid, primary key)
- warehouse_id (uuid, foreign key to warehouses.id)
- zone (text)
- aisle (text)
- shelf (text)
- bin (text)
- capacity (integer)

Table: inventory_stock
- id (uuid, primary key)
- item_id (uuid, foreign key to inventory_items.id)
- location_id (uuid, foreign key to inventory_locations.id)
- quantity (integer)
- last_updated (timestamptz)

Table: orders
- id (uuid, primary key)
- order_number (text, unique)
- customer_name (text)
- status (text: pending, picking, packing, shipped, cancelled)
- priority (text: normal, high, urgent)
- warehouse_id (uuid, foreign key to warehouses.id)
- created_at (timestamptz)

Table: order_items
- id (uuid, primary key)
- order_id (uuid, foreign key to orders.id)
- item_id (uuid, foreign key to inventory_items.id)
- quantity_ordered (integer)
- quantity_picked (integer)

Table: alert_rules
- id (uuid, primary key)
- alert_type (text: low_stock, overstock, slow_moving)
- conditions_json (jsonb)
- is_active (boolean)

Table: generated_alerts
- id (uuid, primary key)
- alert_rule_id (uuid, foreign key to alert_rules.id)
- severity (text: info, warning, critical)
- message (text)
- created_at (timestamptz)

Table: daily_insights
- id (uuid, primary key)
- type (text: summary, anomaly, trend)
- title (text)
- content (text)
- severity (text: info, warning, critical)
- related_data (jsonb)
- created_at (timestamptz)

Table: reorder_recommendations
- id (uuid, primary key)
- item_id (uuid, foreign key to inventory_items.id)
- recommended_quantity (integer)
- reasoning (text)
- confidence_score (integer)
- status (text: pending, accepted, rejected)

`
