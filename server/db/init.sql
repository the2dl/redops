-- Create setup_status table
CREATE TABLE IF NOT EXISTS setup_status (
    is_initialized BOOLEAN DEFAULT FALSE,
    initialized_at TIMESTAMP,
    initialized_by INTEGER
);

-- Create users table with security enhancements
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    token_version INTEGER DEFAULT 1,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    azure_id VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(50) DEFAULT 'local'
);

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_azure_config_updated_at ON azure_config;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_azure_config_updated_at
    BEFORE UPDATE ON azure_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial setup_status record if it doesn't exist
INSERT INTO setup_status (is_initialized)
SELECT FALSE
WHERE NOT EXISTS (SELECT 1 FROM setup_status);

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL,
    event_details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_log(created_at);

-- Create index for azure_id lookups
CREATE INDEX IF NOT EXISTS idx_users_azure_id ON users(azure_id);

-- Create Azure AD configuration table
CREATE TABLE IF NOT EXISTS azure_config (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255),
    tenant_id VARCHAR(255),
    client_secret VARCHAR(255),
    redirect_uri VARCHAR(255),
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Insert initial azure_config record if it doesn't exist
INSERT INTO azure_config (is_enabled)
SELECT FALSE
WHERE NOT EXISTS (SELECT 1 FROM azure_config);

-- Add audit log event types for Azure config changes
COMMENT ON COLUMN security_audit_log.event_type IS 'Event types include: login, logout, register, password_change, azure_config_update';

-- Modify users table to allow NULL password_hash for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add constraint to ensure password_hash is NOT NULL only for local auth (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'check_auth_provider_password'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT check_auth_provider_password 
        CHECK (
            (auth_provider = 'local' AND password_hash IS NOT NULL) OR 
            (auth_provider != 'local')
        );
    END IF;
END $$;

-- Operations table for basic operation information
CREATE TABLE IF NOT EXISTS operations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
    target VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    success_rate INTEGER CHECK (success_rate >= 0 AND success_rate <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Critical findings table
CREATE TABLE IF NOT EXISTS critical_findings (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detections table
CREATE TABLE IF NOT EXISTS detections (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    details TEXT,
    type VARCHAR(50),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MITRE ATT&CK Techniques table
CREATE TABLE IF NOT EXISTS techniques (
    id VARCHAR(10) PRIMARY KEY,  -- e.g., 'T1595'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tactic VARCHAR(100)
);

-- Junction table for operations and techniques
CREATE TABLE IF NOT EXISTS operation_techniques (
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    technique_id VARCHAR(10) REFERENCES techniques(id) ON DELETE CASCADE,
    PRIMARY KEY (operation_id, technique_id)
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    avatar VARCHAR(255)
);

-- Junction table for operations and team members
CREATE TABLE IF NOT EXISTS operation_team_members (
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    team_member_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
    PRIMARY KEY (operation_id, team_member_id)
);

-- Operation plans table
CREATE TABLE IF NOT EXISTS operation_plans (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    objective TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan scope items table
CREATE TABLE IF NOT EXISTS plan_scope_items (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES operation_plans(id) ON DELETE CASCADE,
    scope_item TEXT NOT NULL
);

-- Plan phases table
CREATE TABLE IF NOT EXISTS plan_phases (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES operation_plans(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sequence_order INTEGER NOT NULL
);

-- Phase tasks table
CREATE TABLE IF NOT EXISTS phase_tasks (
    id SERIAL PRIMARY KEY,
    phase_id INTEGER REFERENCES plan_phases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('planned', 'in-progress', 'completed')),
    command TEXT
);

-- Junction table for tasks and techniques
CREATE TABLE IF NOT EXISTS task_techniques (
    task_id INTEGER REFERENCES phase_tasks(id) ON DELETE CASCADE,
    technique_id VARCHAR(10) REFERENCES techniques(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, technique_id)
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_operations_updated_at
    BEFORE UPDATE ON operations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operation_plans_updated_at
    BEFORE UPDATE ON operation_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_critical_findings_operation_id ON critical_findings(operation_id);
CREATE INDEX idx_detections_operation_id ON detections(operation_id);
CREATE INDEX idx_operation_techniques_operation_id ON operation_techniques(operation_id);

-- Commands table
CREATE TABLE IF NOT EXISTS commands (
    id SERIAL PRIMARY KEY,
    operation_id INTEGER REFERENCES operations(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    output TEXT,
    status VARCHAR(50) CHECK (status IN ('success', 'failure', 'detected')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Impacted entities table
CREATE TABLE IF NOT EXISTS impacted_entities (
    id SERIAL PRIMARY KEY,
    command_id INTEGER REFERENCES commands(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Command techniques junction table
CREATE TABLE IF NOT EXISTS command_techniques (
    command_id INTEGER REFERENCES commands(id) ON DELETE CASCADE,
    technique_id VARCHAR(10) REFERENCES techniques(id) ON DELETE CASCADE,
    PRIMARY KEY (command_id, technique_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_commands_operation_id ON commands(operation_id);
CREATE INDEX idx_impacted_entities_command_id ON impacted_entities(command_id);
CREATE INDEX idx_command_techniques_command_id ON command_techniques(command_id);

-- Add trigger for commands updated_at
CREATE TRIGGER update_commands_updated_at
    BEFORE UPDATE ON commands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();