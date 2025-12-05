-- PM Application v2 Database Schema
-- Production-ready schema with proper indexing and constraints

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS pm_application_v2;
USE pm_application_v2;

-- Regions table for region-based project management
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Users table with enhanced security and region support
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'member', 'region_admin', 'citizen') DEFAULT 'member',
    region_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_region (region_id),
    INDEX idx_active (is_active)
);

-- Projects table with comprehensive project management and region support
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    budget_allocated DECIMAL(15, 2),
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    region_id VARCHAR(36) NOT NULL,
    project_manager_id VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
    FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_region (region_id),
    INDEX idx_manager (project_manager_id),
    INDEX idx_created_by (created_by),
    INDEX idx_dates (start_date, end_date)
);

-- Project schedules table
CREATE TABLE IF NOT EXISTS project_schedules (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planned', 'in_progress', 'completed', 'cancelled') DEFAULT 'planned',
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_project (project_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to VARCHAR(36),
    due_date DATE,
    completed_at TIMESTAMP NULL,
    parent_task_id VARCHAR(36),
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    estimated_days INT,
    estimated_duration_hours DECIMAL(8,2),
    actual_duration_hours DECIMAL(8,2),
    start_date DATE,
    end_date DATE,
    work_effort TEXT,
    dependency VARCHAR(36),
    dependency_type ENUM('FS', 'SS', 'FF', 'SF') DEFAULT 'FS',
    lag_time INT DEFAULT 0,
    risks TEXT,
    issues TEXT,
    comments TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES project_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_assigned (assigned_to),
    INDEX idx_parent (parent_task_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date)
);

-- Project templates table
CREATE TABLE IF NOT EXISTS project_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    template_data JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Audit trail table for comprehensive logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id VARCHAR(36) PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    duration_ms DECIMAL(10, 2) NOT NULL,
    memory_usage BIGINT,
    request_id VARCHAR(100),
    user_id VARCHAR(36),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_operation (operation),
    INDEX idx_duration (duration_ms),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id VARCHAR(36) PRIMARY KEY,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    category ENUM('network', 'validation', 'authentication', 'authorization', 'business', 'system') DEFAULT 'system',
    user_id VARCHAR(36),
    request_id VARCHAR(100),
    url VARCHAR(500),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_error_type (error_type),
    INDEX idx_severity (severity),
    INDEX idx_category (category),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- User sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- Project permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS project_permissions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    permission ENUM('read', 'write', 'admin') NOT NULL,
    granted_by VARCHAR(36) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    UNIQUE KEY unique_project_user (project_id, user_id),
    INDEX idx_project (project_id),
    INDEX idx_user (user_id),
    INDEX idx_permission (permission),
    INDEX idx_active (is_active)
);

-- Region content sections table for predefined page sections
CREATE TABLE IF NOT EXISTS region_content_sections (
    id VARCHAR(36) PRIMARY KEY,
    region_id VARCHAR(36) NOT NULL,
    section_type ENUM('about', 'contact', 'services', 'statistics', 'location', 'demographics', 'history', 'leadership', 'custom') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_region (region_id),
    INDEX idx_section_type (section_type),
    INDEX idx_display_order (display_order),
    INDEX idx_visible (is_visible),
    UNIQUE KEY unique_region_section_type (region_id, section_type)
);

-- Region notices/announcements table for public communication
CREATE TABLE IF NOT EXISTS region_notices (
    id VARCHAR(36) PRIMARY KEY,
    region_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'project_update', 'public_meeting', 'emergency', 'maintenance') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_region (region_id),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_published (is_published),
    INDEX idx_published_at (published_at),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
);

-- Create views for common queries
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.status,
    p.priority,
    p.budget_allocated,
    p.budget_spent,
    p.start_date,
    p.end_date,
    CONCAT(u.first_name, ' ', u.last_name) as manager_name,
    COUNT(ps.id) as schedule_count,
    COUNT(t.id) as task_count,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
FROM projects p
LEFT JOIN users u ON p.project_manager_id = u.id
LEFT JOIN project_schedules ps ON p.id = ps.project_id
LEFT JOIN tasks t ON ps.id = t.schedule_id
GROUP BY p.id, p.code, p.name, p.status, p.priority, p.budget_allocated, p.budget_spent, p.start_date, p.end_date, u.first_name, u.last_name;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetUserProjects(IN user_id VARCHAR(36))
BEGIN
    SELECT DISTINCT p.*, pp.permission
    FROM projects p
    LEFT JOIN project_permissions pp ON p.id = pp.project_id AND pp.user_id = user_id
    WHERE p.created_by = user_id 
       OR p.project_manager_id = user_id 
       OR pp.user_id = user_id
    ORDER BY p.updated_at DESC;
END //

CREATE PROCEDURE IF NOT EXISTS GetProjectStats()
BEGIN
    SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_projects,
        SUM(budget_allocated) as total_budget,
        SUM(budget_spent) as total_spent
    FROM projects;
END //

DELIMITER ;

-- Insert default admin user
INSERT IGNORE INTO users (
    id, username, email, password_hash, first_name, last_name, role, is_active
) VALUES (
    'admin-001',
    'admin',
    'admin@pm-application.com',
    '$2b$10$rQZ8K9vX7wE2tY3uI6oPcO1nM4qR5sT8vW9xY2zA3bC4dE5fG6hI7jK8lM9nO0p',
    'System',
    'Administrator',
    'admin',
    TRUE
);

-- Insert sample project templates
INSERT IGNORE INTO project_templates (
    id, name, description, category, template_data, created_by
) VALUES (
    'template-001',
    'Infrastructure Development',
    'Template for infrastructure development projects',
    'Infrastructure',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Planning', 'Design', 'Construction', 'Testing', 'Deployment'),
        'default_tasks', JSON_ARRAY('Site survey', 'Design review', 'Permit acquisition', 'Construction', 'Quality assurance'),
        'estimated_duration', 180,
        'required_roles', JSON_ARRAY('Project Manager', 'Engineer', 'Contractor', 'Inspector')
    ),
    'admin-001'
),
(
    'template-002',
    'Software Development',
    'Template for software development projects',
    'Software',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Requirements', 'Design', 'Development', 'Testing', 'Deployment'),
        'default_tasks', JSON_ARRAY('Requirements gathering', 'System design', 'Coding', 'Unit testing', 'Integration testing', 'Deployment'),
        'estimated_duration', 120,
        'required_roles', JSON_ARRAY('Product Manager', 'Developer', 'QA Engineer', 'DevOps Engineer')
    ),
    'admin-001'
),
(
    'template-003',
    'Research Project',
    'Template for research and development projects',
    'Research',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Literature Review', 'Hypothesis', 'Experiment Design', 'Data Collection', 'Analysis', 'Reporting'),
        'default_tasks', JSON_ARRAY('Literature review', 'Hypothesis formulation', 'Experiment setup', 'Data collection', 'Statistical analysis', 'Report writing'),
        'estimated_duration', 365,
        'required_roles', JSON_ARRAY('Research Lead', 'Data Analyst', 'Statistician', 'Technical Writer')
    ),
    'admin-001'
);
