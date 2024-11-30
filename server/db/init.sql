-- Create setup_status table
CREATE TABLE IF NOT EXISTS setup_status (
    is_initialized BOOLEAN DEFAULT FALSE,
    initialized_at TIMESTAMP,
    initialized_by INTEGER
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial setup_status record if it doesn't exist
INSERT INTO setup_status (is_initialized)
SELECT FALSE
WHERE NOT EXISTS (SELECT 1 FROM setup_status); 