-- Migration: Add duration and dependency fields to tasks table
-- Date: 2025-10-03
-- Description: Enhance tasks table with duration tracking and dependency management

-- Add duration-related fields
ALTER TABLE tasks 
ADD COLUMN estimated_duration_hours INT DEFAULT NULL COMMENT 'Estimated duration in hours',
ADD COLUMN actual_duration_hours INT DEFAULT NULL COMMENT 'Actual duration in hours',
ADD COLUMN start_date DATE DEFAULT NULL COMMENT 'Planned start date',
ADD COLUMN end_date DATE DEFAULT NULL COMMENT 'Planned end date',
ADD COLUMN actual_start_date TIMESTAMP NULL COMMENT 'Actual start timestamp',
ADD COLUMN actual_end_date TIMESTAMP NULL COMMENT 'Actual end timestamp',
ADD COLUMN dependency VARCHAR(36) DEFAULT NULL COMMENT 'Task dependency (ID of prerequisite task)',
ADD COLUMN progress_percentage INT DEFAULT 0 COMMENT 'Progress percentage (0-100)',
ADD COLUMN notes TEXT DEFAULT NULL COMMENT 'Additional notes and comments';

-- Add indexes for new fields
ALTER TABLE tasks 
ADD INDEX idx_estimated_duration (estimated_duration_hours),
ADD INDEX idx_start_date (start_date),
ADD INDEX idx_end_date (end_date),
ADD INDEX idx_progress (progress_percentage),
ADD INDEX idx_dependency (dependency);

-- Add foreign key constraint for dependency
ALTER TABLE tasks 
ADD CONSTRAINT fk_task_dependency 
FOREIGN KEY (dependency) REFERENCES tasks(id) ON DELETE SET NULL;

-- Update existing tasks with default duration estimates based on task type
UPDATE tasks 
SET estimated_duration_hours = CASE 
    WHEN name LIKE '%Planning%' OR name LIKE '%Design%' THEN 40
    WHEN name LIKE '%Construction%' OR name LIKE '%Building%' THEN 160
    WHEN name LIKE '%Completion%' OR name LIKE '%Handover%' THEN 20
    WHEN name LIKE '%Procurement%' THEN 30
    WHEN name LIKE '%Initiation%' THEN 16
    WHEN name LIKE '%Analysis%' OR name LIKE '%Survey%' THEN 24
    ELSE 20
END
WHERE estimated_duration_hours IS NULL;

-- Add sample due dates based on estimated duration
UPDATE tasks 
SET due_date = DATE_ADD(CURDATE(), INTERVAL estimated_duration_hours HOUR)
WHERE due_date IS NULL AND estimated_duration_hours IS NOT NULL;
