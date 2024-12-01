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