-- Create database
CREATE DATABASE form_management;

-- Connect to the database
\c form_management;

-- Create schemas for each microservice
CREATE SCHEMA IF NOT EXISTS user_management;
CREATE SCHEMA IF NOT EXISTS form_management;
CREATE SCHEMA IF NOT EXISTS group_management;
CREATE SCHEMA IF NOT EXISTS form_submission;
CREATE SCHEMA IF NOT EXISTS reports;

-- User Management Schema
CREATE TABLE user_management.users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(50) NOT NULL DEFAULT 'USER'
);

-- Form Management Schema
CREATE TABLE form_management.forms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields TEXT NOT NULL, -- JSON string
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_template BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE form_management.form_fields (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL REFERENCES form_management.forms(id),
    field_id VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    placeholder TEXT,
    options TEXT, -- JSON array
    field_order INTEGER NOT NULL DEFAULT 0
);

-- Group Management Schema
CREATE TABLE group_management.groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    max_members INTEGER
);

CREATE TABLE group_management.group_members (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES group_management.groups(id),
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Form Submission Schema
CREATE TABLE form_submission.form_submissions (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    submitted_by VARCHAR(255) NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answers TEXT NOT NULL, -- JSON string
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    last_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE form_submission.form_assignments (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    assigned_by VARCHAR(255) NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Reports Schema (for analytics and reporting)
CREATE TABLE reports.analytics (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON user_management.users(username);
CREATE INDEX idx_users_email ON user_management.users(email);
CREATE INDEX idx_users_active ON user_management.users(is_active);

CREATE INDEX idx_forms_created_by ON form_management.forms(created_by);
CREATE INDEX idx_forms_active ON form_management.forms(is_active);
CREATE INDEX idx_forms_template ON form_management.forms(is_template);

CREATE INDEX idx_groups_created_by ON group_management.groups(created_by);
CREATE INDEX idx_groups_active ON group_management.groups(is_active);

CREATE INDEX idx_submissions_form_id ON form_submission.form_submissions(form_id);
CREATE INDEX idx_submissions_user_id ON form_submission.form_submissions(user_id);
CREATE INDEX idx_submissions_submitted_at ON form_submission.form_submissions(submitted_at);

CREATE INDEX idx_assignments_form_id ON form_submission.form_assignments(form_id);
CREATE INDEX idx_assignments_group_id ON form_submission.form_assignments(group_id);

-- Insert sample data
INSERT INTO user_management.users (username, email, password, name, role) VALUES
('admin', 'admin@example.com', '$2a$10$rDmFN6ZqJdcQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXe', 'Administrator', 'ADMIN'),
('user1', 'user1@example.com', '$2a$10$rDmFN6ZqJdcQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXe', 'User One', 'USER'),
('user2', 'user2@example.com', '$2a$10$rDmFN6ZqJdcQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXeQKzGX9zGqXe', 'User Two', 'USER');

INSERT INTO form_management.forms (name, description, fields, created_by) VALUES
('Sample Form', 'A sample form for testing', '[{"fieldId":"name","type":"text","label":"Name","isRequired":true}]', 'admin'),
('Feedback Form', 'A feedback form', '[{"fieldId":"rating","type":"number","label":"Rating","isRequired":true},{"fieldId":"comment","type":"textarea","label":"Comment"}]', 'admin');

INSERT INTO group_management.groups (name, description, created_by) VALUES
('Test Group', 'A test group', 'admin'),
('Development Team', 'Software development team', 'admin');

INSERT INTO group_management.group_members (group_id, user_id, is_admin) VALUES
(1, 1, true),
(1, 2, false),
(2, 1, true);
