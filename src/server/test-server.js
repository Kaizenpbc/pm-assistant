const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const config = require('../../test-server-config');

const app = express();
const PORT = config.PORT;

// Time unit conversion utility
const convertToDays = (value, unit = 'days') => {
  if (!value || value <= 0) return 1; // Default to 1 day
  
  const conversions = {
    'hours': value / 8, // 8 hours = 1 day
    'days': value,
    'weeks': value * 5, // 5 working days per week
    'months': value * 20, // 20 working days per month
    'half-days': value / 2, // 2 half-days = 1 day
    'quarters': value * 60 // 60 working days per quarter
  };
  
  return Math.max(0.5, conversions[unit] || value); // Minimum 0.5 days
};

const convertToHours = (value, unit = 'days') => {
  if (!value || value <= 0) return 8; // Default to 8 hours
  
  const conversions = {
    'hours': value,
    'days': value * 8,
    'weeks': value * 40, // 40 hours per week
    'months': value * 160, // 160 hours per month
    'half-days': value * 4, // 4 hours per half-day
    'quarters': value * 480 // 480 hours per quarter
  };
  
  return Math.max(1, conversions[unit] || value * 8); // Minimum 1 hour
};

// Database connection pool
let dbPool;

// All data now stored in database - no more in-memory storage!

// Initialize database connection
async function initDatabase() {
  try {
    dbPool = mysql.createPool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await dbPool.getConnection();
    console.log('✅ Test database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize database
initDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));

// Add debugging middleware before JSON parsing
app.use((req, res, next) => {
  console.log(`=== ${req.method} ${req.path} ===`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Content-Type:', req.headers['content-type']);
  }
  next();
});

app.use(express.json());

// Error handling for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('JSON Parse Error:', error.message);
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    console.error('Request Headers:', req.headers);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid JSON in request body',
      error: error.message 
    });
  }
  next();
});

// Health scoring logic (simplified)
function calculateHealthScore(projectData) {
  const factors = {
    timelineHealth: Math.min(100, Math.max(0, 100 - Math.abs(50 - (projectData.completedTasks / projectData.totalTasks * 100)))),
    budgetHealth: Math.min(100, Math.max(0, 100 - Math.abs(70 - (projectData.budgetSpent / projectData.budgetAllocated * 100)))),
    resourceHealth: Math.min(100, Math.max(0, (projectData.assignedResources / projectData.requiredResources) * 100)),
    riskHealth: Math.max(0, 100 - (projectData.highRisks * 10 + projectData.mediumRisks * 5 + projectData.lowRisks * 2)),
    progressHealth: (projectData.completedTasks / projectData.totalTasks) * 100,
    issueHealth: Math.max(0, 100 - (projectData.openIssues * 5 + projectData.criticalIssues * 15))
  };

  const overallScore = (
    factors.timelineHealth * 0.25 +
    factors.budgetHealth * 0.20 +
    factors.resourceHealth * 0.15 +
    factors.riskHealth * 0.20 +
    factors.progressHealth * 0.10 +
    factors.issueHealth * 0.10
  );

  const healthStatus = overallScore >= 90 ? 'excellent' : 
                      overallScore >= 80 ? 'good' : 
                      overallScore >= 70 ? 'fair' : 
                      overallScore >= 60 ? 'poor' : 'critical';

  const healthColor = overallScore >= 90 ? 'green' : 
                     overallScore >= 80 ? 'yellow' : 
                     overallScore >= 70 ? 'orange' : 
                     overallScore >= 60 ? 'red' : 'dark-red';

  return {
    overallScore: Math.round(overallScore),
    healthStatus,
    healthColor,
    factors,
    recommendations: [
      'Monitor project timeline closely',
      'Review budget allocation',
      'Assess resource requirements'
    ],
    lastUpdated: new Date().toISOString()
  };
}

// Enhanced Auth endpoints with database user management
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    // Query user from database
    const [rows] = await dbPool.execute(
      'SELECT id, username, password, role, full_name, email FROM users WHERE username = ?',
      [username]
    );
    
    if (rows.length > 0) {
      const user = rows[0];
      
      if (user.password === password) {
        const userResponse = {
          id: user.id,
          username: user.username,
          email: user.email || `${user.username}@pm-application.com`,
          fullName: user.full_name,
          role: user.role
        };
        console.log('✅ Login successful for user:', user.username);
        console.log('📤 Sending user data:', userResponse);
        
        res.status(200).json({
          success: true,
          user: userResponse,
          token: 'mock-jwt-token-for-testing'
        });
      } else {
        console.log('❌ Login failed - incorrect password for user:', username);
        res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
    } else {
      console.log('❌ Login failed - user not found:', username);
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Projects endpoint with PM filtering
app.get('/api/v1/projects', async (req, res) => {
  try {
    console.log('=== GET /api/v1/projects ===');
    console.log('Headers:', req.headers);
    
    // Get user role and ID from headers
    const userRole = req.headers['x-user-role'] || 'admin';
    const userId = req.headers['x-user-id'] || 'admin-001';
    
    let query = 'SELECT * FROM projects ORDER BY created_at DESC';
    let params = [];
    
    // Filter projects based on user role
    if (userRole === 'manager') {
      // PMs only see projects assigned to them
      query = 'SELECT * FROM projects WHERE project_manager_id = ? ORDER BY created_at DESC';
      params = [userId];
    } else if (userRole === 'rdc') {
      // RDC users see projects they created
      query = 'SELECT * FROM projects WHERE created_by = ? ORDER BY created_at DESC';
      params = [userId];
    }
    // Admin sees all projects
    
    console.log('🔍 Executing query:', query, 'with params:', params);
    const [rows] = await dbPool.execute(query, params);
    console.log('📊 Query result:', rows.length, 'projects found');
    
    // Add health data to each project
    const projects = rows.map(project => ({
      ...project,
      health: {
        overallScore: 85,
        healthStatus: 'good',
        healthColor: 'green'
      }
    }));
    
    console.log('✅ Sending response with', projects.length, 'projects');
    console.log('📋 Project details:', projects.map(p => ({ id: p.id, name: p.name, code: p.code })));
    res.status(200).json({
      success: true,
      projects: projects
    });
  } catch (error) {
    console.error('Projects endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Individual project endpoint
app.get('/api/v1/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await dbPool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const project = {
        ...rows[0],
        health: {
          overallScore: 85,
          healthStatus: 'good',
          healthColor: 'green'
        }
      };
      
      res.status(200).json({
        success: true,
        project: project
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
  } catch (error) {
    console.error('Project endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

// Create new project endpoint
app.post('/api/v1/projects', async (req, res) => {
  try {
    console.log('=== PROJECT CREATION REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Body type:', typeof req.body);
    
    const projectData = req.body;
    
    // Generate RDC project code
    const generateProjectCode = async () => {
      // Get existing projects from database
      const [rows] = await dbPool.execute('SELECT code FROM projects ORDER BY created_at DESC');
      
      // Find the highest RDC number used and highest sequence within each RDC
      let maxRdcNumber = 0;
      let maxSequenceInCurrentRdc = 0;
      
      rows.forEach(row => {
        if (row.code && row.code.startsWith('RDC')) {
          const match = row.code.match(/RDC(\d+)-(\d+)/);
          if (match) {
            const rdcNumber = parseInt(match[1]);
            const sequenceNumber = parseInt(match[2]);
            maxRdcNumber = Math.max(maxRdcNumber, rdcNumber);
            
            // If this is the latest RDC group, track the sequence
            if (rdcNumber === maxRdcNumber) {
              maxSequenceInCurrentRdc = Math.max(maxSequenceInCurrentRdc, sequenceNumber);
            }
          }
        }
      });
      
      // If no projects exist, start with RDC01-0001
      if (maxRdcNumber === 0) {
        return 'RDC01-0001';
      }
      
      // Check if current RDC group has less than 9999 projects
      // If yes, increment sequence in current RDC
      // If no, start new RDC group
      if (maxSequenceInCurrentRdc < 9999) {
        const nextSequence = maxSequenceInCurrentRdc + 1;
        const paddedRdc = maxRdcNumber.toString().padStart(2, '0');
        const paddedSequence = nextSequence.toString().padStart(4, '0');
        return `RDC${paddedRdc}-${paddedSequence}`;
      } else {
        // Start new RDC group
        const nextRdcNumber = maxRdcNumber + 1;
        const paddedRdc = nextRdcNumber.toString().padStart(2, '0');
        return `RDC${paddedRdc}-0001`;
      }
    };
    
    // Generate RDC code
    const projectCode = await generateProjectCode();
    
    // Get user info from headers
    const userId = req.headers['x-user-id'] || 'admin-001';
    const userRole = req.headers['x-user-role'] || 'admin';
    
    // Create new project with RDC code
    const projectId = Date.now().toString();
    const newProject = {
      id: projectId,
      code: projectCode,
      name: projectData.name || 'New Project',
      description: projectData.description || 'Project description',
      category: projectData.category || 'general',
      status: projectData.status || 'planning',
      priority: projectData.priority || 'medium',
      budget_allocated: parseFloat(projectData.budget_allocated) || 0,
      budget_spent: 0,
      currency: projectData.currency || 'USD',
      start_date: projectData.start_date || null,
      end_date: projectData.end_date || null,
      project_manager_id: projectData.assignedPM || null,
      created_by: userId, // Track who created the project
      progress: 0
    };
    
    // Insert project into database
    await dbPool.execute(
      'INSERT INTO projects (id, code, name, description, category, status, priority, budget_allocated, budget_spent, currency, start_date, end_date, project_manager_id, created_by, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newProject.id,
        newProject.code,
        newProject.name,
        newProject.description,
        newProject.category,
        newProject.status,
        newProject.priority,
        newProject.budget_allocated,
        newProject.budget_spent,
        newProject.currency,
        newProject.start_date,
        newProject.end_date,
        newProject.project_manager_id,
        newProject.created_by,
        newProject.progress
      ]
    );
    
    console.log('✅ New project created:', newProject.code, '-', newProject.name);
    
    res.status(201).json({
      success: true,
      project: {
        ...newProject,
        health: {
          overallScore: 85,
          healthStatus: 'good',
          healthColor: 'green'
        }
      },
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create project',
      error: error.message 
    });
  }
});

// Update project endpoint
app.put('/api/v1/projects/:id', async (req, res) => {
  try {
    console.log('=== PUT /api/v1/projects/' + req.params.id + ' ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const projectId = req.params.id;
    const projectData = req.body;
    
    // Update project in database
    await dbPool.execute(
      `UPDATE projects SET 
        name = ?, 
        description = ?, 
        category = ?, 
        status = ?, 
        priority = ?, 
        budget_allocated = ?, 
        start_date = ?, 
        end_date = ?, 
        project_manager_id = ?
      WHERE id = ?`,
      [
        projectData.name || '',
        projectData.description || '',
        projectData.category || '',
        projectData.status || 'planning',
        projectData.priority || 'medium',
        parseFloat(projectData.budget) || 0,
        projectData.startDate || null,
        projectData.endDate || null,
        projectData.assignedPM || null,
        projectId
      ]
    );
    
    console.log('✅ Project updated:', projectId);
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update project',
      error: error.message 
    });
  }
});

// Delete project endpoint
app.delete('/api/v1/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== DELETE PROJECT REQUEST ===');
    console.log('Project ID:', id);
    
    // Delete from database
    const [result] = await dbPool.execute('DELETE FROM projects WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }
    
    console.log('✅ Project deleted successfully:', id);
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete project',
      error: error.message 
    });
  }
});

// Health endpoint
app.get('/api/v1/health/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock project data
    const mockProjectData = {
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-31'),
      currentDate: new Date(),
      budgetAllocated: 5000000,
      budgetSpent: 1750000,
      assignedResources: 8,
      requiredResources: 10,
      highRisks: 2,
      mediumRisks: 3,
      lowRisks: 1,
      completedTasks: 15,
      totalTasks: 25,
      openIssues: 2,
      criticalIssues: 1,
      resolvedIssues: 5
    };

    const health = calculateHealthScore(mockProjectData);

    res.json({
      success: true,
      health: {
        ...health,
        lastUpdated: health.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error calculating project health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate project health'
    });
  }
});

// Health calculation endpoint
app.post('/api/v1/health/calculate', (req, res) => {
  try {
    const projectData = req.body;
    
    if (!projectData.currentDate) {
      projectData.currentDate = new Date();
    }

    const health = calculateHealthScore(projectData);

    res.json({
      success: true,
      health: {
        ...health,
        lastUpdated: health.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error calculating project health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate project health'
    });
  }
});

// Schedules endpoints - now using database
app.get('/api/v1/schedules/project/:projectId', async (req, res) => {
  try {
    console.log('=== GET /api/v1/schedules/project/' + req.params.projectId + ' ===');
    console.log('Headers:', req.headers);
    
    const { projectId } = req.params;
    
    console.log('🔍 Looking for schedules for project:', projectId);
    
    // Query schedules from database
    const [rows] = await dbPool.execute(
      'SELECT * FROM schedules WHERE project_id = ? ORDER BY created_at ASC',
      [projectId]
    );
    
    console.log('📊 Found', rows.length, 'schedules in database');
    
    const response = {
      success: true,
      schedules: rows
    };
    
    console.log('✅ Sending schedules response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Schedules endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
});

app.post('/api/v1/schedules', async (req, res) => {
  try {
    const scheduleData = req.body;
    
    console.log('=== CREATING NEW SCHEDULE ===');
    console.log('Schedule data:', scheduleData);
    
    const scheduleId = Date.now().toString();
    
    // Convert ISO datetime strings to date format for MySQL
    const startDate = scheduleData.startDate ? scheduleData.startDate.split('T')[0] : null;
    const endDate = scheduleData.endDate ? scheduleData.endDate.split('T')[0] : null;
    
    // Insert schedule into database
    await dbPool.execute(
      'INSERT INTO schedules (id, project_id, name, description, start_date, end_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [
        scheduleId,
        scheduleData.projectId,
        scheduleData.name || 'Project Schedule',
        scheduleData.description || 'Auto-generated schedule',
        startDate,
        endDate
      ]
    );
    
    const newSchedule = {
      id: scheduleId,
      project_id: scheduleData.projectId,
      name: scheduleData.name || 'Project Schedule',
      description: scheduleData.description || 'Auto-generated schedule',
      start_date: scheduleData.startDate,
      end_date: scheduleData.endDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Schedule created in database:', scheduleId);
    
    res.status(201).json({
      success: true,
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

app.put('/api/v1/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('=== UPDATING SCHEDULE ===');
    console.log('Schedule ID:', id);
    console.log('Update data:', updateData);
    
    // Convert ISO datetime strings to date format for MySQL
    const startDate = updateData.startDate ? updateData.startDate.split('T')[0] : null;
    const endDate = updateData.endDate ? updateData.endDate.split('T')[0] : null;
    
    // Update schedule in database
    await dbPool.execute(
      'UPDATE schedules SET name = ?, description = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?',
      [
        updateData.name || 'Project Schedule',
        updateData.description || 'Auto-generated schedule',
        startDate,
        endDate,
        id
      ]
    );
    
    const updatedSchedule = {
      id: id,
      name: updateData.name || 'Project Schedule',
      description: updateData.description || 'Auto-generated schedule',
      start_date: updateData.startDate,
      end_date: updateData.endDate,
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Schedule updated in database:', id);
    
    res.status(200).json({
      success: true,
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

// Tasks endpoint for schedules - now using database
app.get('/api/v1/schedules/:scheduleId/tasks', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    console.log('=== GET TASKS FROM DATABASE ===');
    console.log('Schedule ID:', scheduleId);
    
    // Query tasks from database
    const [rows] = await dbPool.execute(
      'SELECT * FROM tasks WHERE schedule_id = ? ORDER BY created_at ASC',
      [scheduleId]
    );
    
    console.log('📊 Found', rows.length, 'tasks in database');
    
    res.status(200).json({
      success: true,
      tasks: rows
    });
  } catch (error) {
    console.error('Tasks endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// Create a new task in a schedule
app.post('/api/v1/schedules/:scheduleId/tasks', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const taskData = req.body;
    
    // Generate a new task ID
    const newTaskId = Date.now().toString();
    
    // Extract time estimation with flexible units
    const estimatedValue = taskData.estimatedDays || taskData.estimatedHours || taskData.estimatedWeeks || taskData.estimatedMonths || 1;
    const estimatedUnit = taskData.estimatedUnit || 
      (taskData.estimatedHours ? 'hours' : 
       taskData.estimatedWeeks ? 'weeks' : 
       taskData.estimatedMonths ? 'months' : 'days');
    
    // Convert to standardized units
    const estimatedDays = convertToDays(estimatedValue, estimatedUnit);
    const estimatedHours = convertToHours(estimatedValue, estimatedUnit);
    
    console.log(`Time estimation: ${estimatedValue} ${estimatedUnit} = ${estimatedDays} days = ${estimatedHours} hours`);
    
    // Create the new task with flexible time unit support
    const newTask = {
      id: newTaskId,
      schedule_id: scheduleId,
      name: taskData.name || 'New Task',
      description: taskData.description || 'Task description',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      
      // Flexible time estimation (standardized to days)
      estimated_days: estimatedDays,
      estimated_hours: estimatedHours,
      estimated_value: estimatedValue,
      estimated_unit: estimatedUnit,
      
      // Legacy support
      estimatedHours: estimatedHours,
      
      // Assignment and dates
      assigned_to: taskData.assignedTo || taskData.assigned_to || null,
      assignee: taskData.assignee || taskData.assignedTo || taskData.assigned_to || null,
      due_date: taskData.dueDate || taskData.due_date || null,
      startDate: taskData.startDate || null,
      endDate: taskData.endDate || null,
      
      // Additional fields
      work_effort: taskData.workEffort || taskData.work_effort || `${estimatedValue} ${estimatedUnit}`,
      dependency: taskData.dependency || null,
      dependency_type: taskData.dependencyType || 'FS',
      lag_time: taskData.lagTime || 0,
      risks: taskData.risks || null,
      issues: taskData.issues || null,
      comments: taskData.comments || null,
      parent_task_id: taskData.parentTaskId || taskData.parent_task_id || null,
      
      // Metadata
      created_by: 'user-001', // Default user
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      dependencies: taskData.dependencies || []
    };
    
    console.log('New task created:', newTask);
    
    // Insert task into database
    await dbPool.execute(
        `INSERT INTO tasks (
          id, schedule_id, name, description, status, priority,
          estimated_days, estimated_hours, estimated_value, estimated_unit,
          assigned_to, assignee, due_date, start_date, end_date,
          work_effort, dependency, dependency_type, lag_time, risks, issues, comments, parent_task_id, created_by, dependencies
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newTask.id,
          newTask.schedule_id,
          newTask.name,
          newTask.description,
          newTask.status,
          newTask.priority,
          newTask.estimated_days,
          newTask.estimated_hours,
          newTask.estimated_value,
          newTask.estimated_unit,
          newTask.assigned_to,
          newTask.assignee,
          newTask.due_date,
          newTask.startDate,
          newTask.endDate,
          newTask.work_effort,
          newTask.dependency,
          newTask.dependency_type || 'FS',
          newTask.lag_time || 0,
          newTask.risks,
          newTask.issues,
          newTask.comments,
          newTask.parent_task_id,
          newTask.created_by,
          JSON.stringify(newTask.dependencies)
        ]
    );
    
    console.log('✅ Task saved to database successfully');
    
    res.status(201).json({
      success: true,
      task: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task',
      error: error.message 
    });
  }
});

// AI Scheduling endpoints
app.post('/api/v1/ai-scheduling/analyze-project', (req, res) => {
  try {
    const { projectDescription, projectName, projectId } = req.body;
    
    // Clean development - no mock data
    res.status(200).json({
      success: true,
      analysis: {
        projectId: projectId || '1',
        projectName: projectName || 'New Project',
        complexity: 'medium',
        estimatedDuration: 'TBD',
        riskLevel: 'medium',
        recommendedApproach: 'Standard project methodology',
        resourceRequirements: {
          developers: 0,
          designers: 0,
          testers: 0,
          managers: 0
        },
        suggestedPhases: []
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze project',
      error: error.message 
    });
  }
});

app.post('/api/v1/ai-scheduling/generate-tasks', (req, res) => {
  try {
    const { projectDescription, projectName, projectId, requirements } = req.body;
    
    // Clean development - no mock data
    res.status(200).json({
      success: true,
      tasks: [],
      summary: {
        totalTasks: 0,
        estimatedTotalHours: 0,
        highPriorityTasks: 0
      }
    });
  } catch (error) {
    console.error('Task generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate tasks',
      error: error.message 
    });
  }
});

// Update an existing task in a schedule
app.put('/api/v1/schedules/:scheduleId/tasks/:taskId', async (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;
    const taskData = req.body;
    
    console.log('Updating task:', taskId, 'in schedule:', scheduleId);
    console.log('Update data:', taskData);
    
    // Extract time estimation with flexible units (same logic as POST)
    const estimatedValue = taskData.estimatedDays || taskData.estimatedHours || taskData.estimatedWeeks || taskData.estimatedMonths || 1;
    const estimatedUnit = taskData.estimatedUnit || 
      (taskData.estimatedHours ? 'hours' : 
       taskData.estimatedWeeks ? 'weeks' : 
       taskData.estimatedMonths ? 'months' : 'days');
    
    // Convert to standardized units
    const estimatedDays = convertToDays(estimatedValue, estimatedUnit);
    const estimatedHours = convertToHours(estimatedValue, estimatedUnit);
    
    console.log(`Updated time estimation: ${estimatedValue} ${estimatedUnit} = ${estimatedDays} days = ${estimatedHours} hours`);
    
    // Update task with flexible time unit support
    const updatedTask = {
      id: taskId,
      schedule_id: scheduleId,
      name: taskData.name || 'Updated Task',
      description: taskData.description || 'Updated task description',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      
      // Flexible time estimation (standardized to days)
      estimated_days: estimatedDays,
      estimated_hours: estimatedHours,
      estimated_value: estimatedValue,
      estimated_unit: estimatedUnit,
      
      // Legacy support
      estimatedHours: estimatedHours,
      
      // Assignment and dates
      assigned_to: taskData.assignedTo || taskData.assigned_to || null,
      assignee: taskData.assignee || taskData.assignedTo || taskData.assigned_to || null,
      due_date: taskData.dueDate || taskData.due_date || null,
      startDate: taskData.startDate || null,
      endDate: taskData.endDate || null,
      
      // Additional fields
      work_effort: taskData.workEffort || taskData.work_effort || `${estimatedValue} ${estimatedUnit}`,
      dependency: taskData.dependency || null,
      dependency_type: taskData.dependencyType || 'FS',
      lag_time: taskData.lagTime || 0,
      risks: taskData.risks || null,
      issues: taskData.issues || null,
      comments: taskData.comments || null,
      parent_task_id: taskData.parentTaskId || taskData.parent_task_id || null,
      
      // Metadata
      updated_at: new Date().toISOString(),
      dependencies: taskData.dependencies || []
    };
    
    console.log('Task updated:', updatedTask);
    
    // Convert date formats for MySQL
    const dueDate = updatedTask.due_date ? updatedTask.due_date.split('T')[0] : null;
    const startDate = updatedTask.startDate ? updatedTask.startDate.split('T')[0] : null;
    const endDate = updatedTask.endDate ? updatedTask.endDate.split('T')[0] : null;
    
    // Update task in database
    const [result] = await dbPool.execute(
      `UPDATE tasks SET 
        name = ?, description = ?, status = ?, priority = ?,
        estimated_days = ?, estimated_hours = ?, estimated_value = ?, estimated_unit = ?,
        assigned_to = ?, assignee = ?, due_date = ?, start_date = ?, end_date = ?,
        work_effort = ?, dependency = ?, dependency_type = ?, lag_time = ?, risks = ?, issues = ?, comments = ?,
        parent_task_id = ?, dependencies = ?, updated_at = NOW()
      WHERE id = ? AND schedule_id = ?`,
      [
        updatedTask.name,
        updatedTask.description,
        updatedTask.status,
        updatedTask.priority,
        updatedTask.estimated_days,
        updatedTask.estimated_hours,
        updatedTask.estimated_value,
        updatedTask.estimated_unit,
        updatedTask.assigned_to,
        updatedTask.assignee,
        dueDate,
        startDate,
        endDate,
        updatedTask.work_effort,
        updatedTask.dependency,
        updatedTask.dependency_type || 'FS',
        updatedTask.lag_time || 0,
        updatedTask.risks,
        updatedTask.issues,
        updatedTask.comments,
        updatedTask.parent_task_id,
        JSON.stringify(updatedTask.dependencies),
        taskId,
        scheduleId
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    console.log('✅ Task updated in database successfully');
    
    res.status(200).json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update task',
      error: error.message 
    });
  }
});

// DELETE endpoint for deleting a schedule and all its tasks
app.delete('/api/v1/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETING SCHEDULE ===');
    console.log('Schedule ID:', id);
    
    // Delete all tasks first (due to foreign key constraints)
    await dbPool.execute('DELETE FROM tasks WHERE schedule_id = ?', [id]);
    console.log('✅ Tasks deleted for schedule:', id);
    
    // Delete the schedule
    const [result] = await dbPool.execute('DELETE FROM schedules WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    console.log('✅ Schedule deleted successfully:', id);
    
    res.status(200).json({
      success: true,
      message: 'Schedule and all tasks deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete schedule',
      error: error.message 
    });
  }
});

// DELETE endpoint for deleting a single task
app.delete('/api/v1/schedules/:scheduleId/tasks/:taskId', async (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;
    
    console.log('=== DELETING TASK ===');
    console.log('Schedule ID:', scheduleId);
    console.log('Task ID:', taskId);
    
    // Delete the task
    const [result] = await dbPool.execute(
      'DELETE FROM tasks WHERE id = ? AND schedule_id = ?',
      [taskId, scheduleId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    console.log('✅ Task deleted successfully:', taskId);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete task',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Health Server running on http://localhost:${PORT}`);
  console.log(`📊 Health API available at http://localhost:${PORT}/api/v1/health/1`);
  console.log(`🧮 Health calculation at http://localhost:${PORT}/api/v1/health/calculate`);
  console.log('\nPress Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  process.exit(0);
});
