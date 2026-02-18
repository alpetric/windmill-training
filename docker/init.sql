-- Demo environments table
CREATE TABLE IF NOT EXISTS demo_environments (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    app_name TEXT NOT NULL DEFAULT 'Demo Workspace',
    num_users INTEGER NOT NULL DEFAULT 10,
    num_rooms INTEGER NOT NULL DEFAULT 4,
    ttl_minutes INTEGER NOT NULL DEFAULT 30,
    container_id TEXT,
    container_name TEXT,
    url TEXT,
    port INTEGER,
    status TEXT NOT NULL DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    app_state JSONB
);

-- Index for quick status lookups
CREATE INDEX idx_demo_environments_status ON demo_environments(status);

-- Insert some sample data for the demo (optional - comment out if you want to start empty)
-- INSERT INTO demo_environments (customer_name, app_name, status, container_name, url, expires_at)
-- VALUES
--     ('Acme Corp', 'Team Workspace', 'active', 'demo-acme-corp', 'http://localhost:8080', NOW() + INTERVAL '30 minutes'),
--     ('TechStart Inc', 'Demo Workspace', 'pending_approval', NULL, NULL, NULL);
