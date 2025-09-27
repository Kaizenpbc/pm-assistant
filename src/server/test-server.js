const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// In-memory storage for tasks (in a real app, this would be a database)
const taskStorage = new Map(); // scheduleId -> array of tasks

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

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

// Auth endpoints (mock for testing)
app.post('/api/v1/auth/login', (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    // Mock authentication - accept any credentials for testing
    if (username && password) {
      res.status(200).json({
        success: true,
        user: {
          id: '1',
          email: username, // Use username as email for compatibility
          name: 'Test User'
        },
        token: 'mock-jwt-token-for-testing'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Username and password are required'
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

// Projects endpoint
app.get('/api/v1/projects', (req, res) => {
  try {
    // Mock projects data for testing
    const mockProjects = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'in-progress',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        progress: 65,
        health: {
          overallScore: 74,
          healthStatus: 'fair',
          healthColor: 'orange'
        }
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        status: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        progress: 15,
        health: {
          overallScore: 85,
          healthStatus: 'good',
          healthColor: 'green'
        }
      },
      {
        id: '3',
        name: 'Database Migration',
        description: 'Migrate legacy database to cloud',
        status: 'completed',
        startDate: '2023-11-01',
        endDate: '2024-01-31',
        progress: 100,
        health: {
          overallScore: 95,
          healthStatus: 'excellent',
          healthColor: 'green'
        }
      }
    ];
    
    res.status(200).json({
      success: true,
      projects: mockProjects
    });
  } catch (error) {
    console.error('Projects endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// Individual project endpoint
app.get('/api/v1/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock projects data for testing
    const mockProjects = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        status: 'in-progress',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        progress: 65,
        health: {
          overallScore: 74,
          healthStatus: 'fair',
          healthColor: 'orange'
        }
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        status: 'planning',
        startDate: '2024-02-01',
        endDate: '2024-06-30',
        progress: 15,
        health: {
          overallScore: 85,
          healthStatus: 'good',
          healthColor: 'green'
        }
      },
      {
        id: '3',
        name: 'Database Migration',
        description: 'Migrate legacy database to cloud',
        status: 'completed',
        startDate: '2023-11-01',
        endDate: '2024-01-31',
        progress: 100,
        health: {
          overallScore: 95,
          healthStatus: 'excellent',
          healthColor: 'green'
        }
      }
    ];
    
    const project = mockProjects.find(p => p.id === id);
    
    if (project) {
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

// Schedules endpoints
app.get('/api/v1/schedules/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock schedule data for testing
    const mockSchedules = [
      {
        id: '1',
        projectId: projectId,
        name: 'Project Schedule',
        description: 'Main project schedule',
        status: 'active',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        tasks: [
          {
            id: '1',
            name: 'Project Planning',
            description: 'Initial project planning phase',
            status: 'completed',
            startDate: '2024-01-15',
            endDate: '2024-01-20',
            progress: 100,
            priority: 'high'
          },
          {
            id: '2',
            name: 'Development Phase',
            description: 'Main development work',
            status: 'in-progress',
            startDate: '2024-01-21',
            endDate: '2024-02-15',
            progress: 65,
            priority: 'high'
          },
          {
            id: '3',
            name: 'Testing Phase',
            description: 'Quality assurance and testing',
            status: 'pending',
            startDate: '2024-02-16',
            endDate: '2024-02-28',
            progress: 0,
            priority: 'medium'
          }
        ]
      }
    ];
    
    res.status(200).json({
      success: true,
      schedules: mockSchedules
    });
  } catch (error) {
    console.error('Schedules endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
});

app.post('/api/v1/schedules', (req, res) => {
  try {
    const scheduleData = req.body;
    
    // Mock creating a new schedule
    const newSchedule = {
      id: Date.now().toString(),
      ...scheduleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      schedule: newSchedule
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule' });
  }
});

app.put('/api/v1/schedules/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Mock updating a schedule
    const updatedSchedule = {
      id: id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      schedule: updatedSchedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

// Tasks endpoint for schedules
app.get('/api/v1/schedules/:scheduleId/tasks', (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    // Mock tasks data for testing
    const mockTasks = [
      {
        id: '1',
        scheduleId: scheduleId,
        name: 'Project Planning',
        description: 'Initial project planning phase',
        status: 'completed',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        progress: 100,
        priority: 'high',
        assignee: 'John Doe',
        dependencies: []
      },
      {
        id: '2',
        scheduleId: scheduleId,
        name: 'Development Phase',
        description: 'Main development work',
        status: 'in-progress',
        startDate: '2024-01-21',
        endDate: '2024-02-15',
        progress: 65,
        priority: 'high',
        assignee: 'Jane Smith',
        dependencies: ['1']
      },
      {
        id: '3',
        scheduleId: scheduleId,
        name: 'Testing Phase',
        description: 'Quality assurance and testing',
        status: 'pending',
        startDate: '2024-02-16',
        endDate: '2024-02-28',
        progress: 0,
        priority: 'medium',
        assignee: 'Bob Johnson',
        dependencies: ['2']
      }
    ];
    
    // Get tasks from storage, or return empty array if none exist
    const tasks = taskStorage.get(scheduleId) || [];
    
    // If no tasks are stored, return some default mock tasks for initial setup
    if (tasks.length === 0) {
      // Store the default tasks
      taskStorage.set(scheduleId, mockTasks);
      
      res.status(200).json({
        success: true,
        tasks: mockTasks
      });
    } else {
      // Return the stored tasks
      res.status(200).json({
        success: true,
        tasks: tasks
      });
    }
  } catch (error) {
    console.error('Tasks endpoint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
});

// Create a new task in a schedule
app.post('/api/v1/schedules/:scheduleId/tasks', (req, res) => {
  try {
    const { scheduleId } = req.params;
    const taskData = req.body;
    
    // Generate a new task ID
    const newTaskId = Date.now().toString();
    
    // Create the new task
    const newTask = {
      id: newTaskId,
      scheduleId: scheduleId,
      name: taskData.name || 'New Task',
      description: taskData.description || 'Task description',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      estimatedHours: taskData.estimatedHours || 8,
      assignee: taskData.assignee || null,
      startDate: taskData.startDate || null,
      endDate: taskData.endDate || null,
      dependencies: taskData.dependencies || []
    };
    
    console.log('New task created:', newTask);
    
    // Store the new task in our in-memory storage
    const existingTasks = taskStorage.get(scheduleId) || [];
    existingTasks.push(newTask);
    taskStorage.set(scheduleId, existingTasks);
    
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
    
    // Mock AI analysis response
    const mockAnalysis = {
      success: true,
      analysis: {
        projectId: projectId || '1',
        projectName: projectName || 'Sample Project',
        complexity: 'medium',
        estimatedDuration: '8-12 weeks',
        riskLevel: 'low',
        recommendedApproach: 'Agile methodology with 2-week sprints',
        resourceRequirements: {
          developers: 3,
          designers: 1,
          testers: 2,
          managers: 1
        },
        suggestedPhases: [
          {
            id: 'phase-1',
            name: 'Planning & Setup',
            duration: '1-2 weeks',
            estimatedDays: 10,
            description: 'Project initialization, requirements gathering, and team setup',
            tasks: [
              {
                id: 'task-1',
                name: 'Project Kickoff',
                description: 'Initial project meeting and stakeholder alignment',
                estimatedHours: 8,
                estimatedDays: 1,
                priority: 'high',
                complexity: 'low',
                riskLevel: 10,
                category: 'Planning',
                phase: 'Planning & Setup',
                skills: ['Project Management', 'Communication', 'Stakeholder Management'],
                deliverables: ['Project Charter', 'Team Roster', 'Initial Timeline']
              },
              {
                id: 'task-2',
                name: 'Requirements Analysis',
                description: 'Detailed requirements gathering and documentation',
                estimatedHours: 16,
                estimatedDays: 2,
                priority: 'high',
                complexity: 'medium',
                riskLevel: 20,
                category: 'Analysis',
                phase: 'Planning & Setup',
                skills: ['Business Analysis', 'Documentation', 'Requirements Gathering'],
                deliverables: ['Requirements Document', 'User Stories', 'Acceptance Criteria']
              },
              {
                id: 'task-3',
                name: 'Technical Architecture',
                description: 'System design and technical architecture planning',
                estimatedHours: 24,
                estimatedDays: 3,
                priority: 'high',
                complexity: 'high',
                riskLevel: 30,
                category: 'Design',
                phase: 'Planning & Setup',
                skills: ['System Design', 'Architecture', 'Technical Planning'],
                deliverables: ['Architecture Diagram', 'Technical Specs', 'Technology Stack']
              }
            ]
          },
          {
            id: 'phase-2',
            name: 'Development',
            duration: '6-8 weeks',
            estimatedDays: 49,
            description: 'Core development work with iterative releases',
            tasks: [
              {
                id: 'task-4',
                name: 'Core Development',
                description: 'Main feature development and implementation',
                estimatedHours: 120,
                estimatedDays: 15,
                priority: 'high',
                complexity: 'high',
                riskLevel: 40,
                category: 'Development',
                phase: 'Development',
                skills: ['Programming', 'Code Review', 'Testing', 'Debugging'],
                deliverables: ['Source Code', 'Unit Tests', 'Code Documentation']
              }
            ]
          },
          {
            id: 'phase-3',
            name: 'Testing & QA',
            duration: '1-2 weeks',
            estimatedDays: 10,
            description: 'Quality assurance, testing, and bug fixes',
            tasks: [
              {
                id: 'task-5',
                name: 'Integration Testing',
                description: 'System integration and end-to-end testing',
                estimatedHours: 32,
                estimatedDays: 4,
                priority: 'medium',
                complexity: 'medium',
                riskLevel: 25,
                category: 'Testing',
                phase: 'Testing & QA',
                skills: ['Testing', 'Quality Assurance', 'Bug Tracking'],
                deliverables: ['Test Cases', 'Test Results', 'Bug Reports']
              },
              {
                id: 'task-6',
                name: 'User Acceptance Testing',
                description: 'Final testing with stakeholders and users',
                estimatedHours: 16,
                estimatedDays: 2,
                priority: 'medium',
                complexity: 'low',
                riskLevel: 15,
                category: 'Testing',
                phase: 'Testing & QA',
                skills: ['User Testing', 'Feedback Collection', 'Documentation'],
                deliverables: ['UAT Results', 'User Feedback', 'Sign-off Document']
              }
            ]
          }
        ],
        taskSuggestions: [
          {
            id: 'task-1',
            name: 'Project Kickoff',
            description: 'Initial project meeting and stakeholder alignment',
            estimatedHours: 8,
            estimatedDays: 1,
            priority: 'high',
            complexity: 'low',
            riskLevel: 10,
            category: 'Planning',
            phase: 'Planning & Setup',
            skills: ['Project Management', 'Communication', 'Stakeholder Management'],
            deliverables: ['Project Charter', 'Team Roster', 'Initial Timeline']
          },
          {
            id: 'task-2',
            name: 'Requirements Analysis',
            description: 'Detailed requirements gathering and documentation',
            estimatedHours: 16,
            estimatedDays: 2,
            priority: 'high',
            complexity: 'medium',
            riskLevel: 20,
            category: 'Analysis',
            phase: 'Planning & Setup',
            skills: ['Business Analysis', 'Documentation', 'Requirements Gathering'],
            deliverables: ['Requirements Document', 'User Stories', 'Acceptance Criteria']
          },
          {
            id: 'task-3',
            name: 'Technical Architecture',
            description: 'System design and technical architecture planning',
            estimatedHours: 24,
            estimatedDays: 3,
            priority: 'high',
            complexity: 'high',
            riskLevel: 30,
            category: 'Design',
            phase: 'Planning & Setup',
            skills: ['System Design', 'Architecture', 'Technical Planning'],
            deliverables: ['Architecture Diagram', 'Technical Specs', 'Technology Stack']
          },
          {
            id: 'task-4',
            name: 'Core Development',
            description: 'Main feature development and implementation',
            estimatedHours: 120,
            estimatedDays: 15,
            priority: 'high',
            complexity: 'high',
            riskLevel: 40,
            category: 'Development',
            phase: 'Development',
            skills: ['Programming', 'Code Review', 'Testing', 'Debugging'],
            deliverables: ['Source Code', 'Unit Tests', 'Code Documentation']
          },
          {
            id: 'task-5',
            name: 'Integration Testing',
            description: 'System integration and end-to-end testing',
            estimatedHours: 32,
            estimatedDays: 4,
            priority: 'medium',
            complexity: 'medium',
            riskLevel: 25,
            category: 'Testing',
            phase: 'Testing & QA',
            skills: ['Testing', 'Quality Assurance', 'Bug Tracking'],
            deliverables: ['Test Cases', 'Test Results', 'Bug Reports']
          },
          {
            id: 'task-6',
            name: 'User Acceptance Testing',
            description: 'Final testing with stakeholders and users',
            estimatedHours: 16,
            estimatedDays: 2,
            priority: 'medium',
            complexity: 'low',
            riskLevel: 15,
            category: 'Testing',
            phase: 'Testing & QA',
            skills: ['User Testing', 'Feedback Collection', 'Documentation'],
            deliverables: ['UAT Results', 'User Feedback', 'Sign-off Document']
          }
        ],
        recommendations: [
          'Consider breaking down large tasks into smaller, manageable chunks',
          'Implement regular check-ins and progress reviews',
          'Allocate buffer time for unexpected issues',
          'Ensure clear communication channels between team members'
        ]
      }
    };
    
    res.status(200).json(mockAnalysis);
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
    
    // Mock task generation response
    const mockTasks = [
      {
        id: 'ai-1',
        name: 'Project Initialization',
        description: 'Set up project structure and initial configuration',
        estimatedHours: 8,
        priority: 'high',
        status: 'pending',
        assignee: null,
        startDate: null,
        endDate: null,
        dependencies: []
      },
      {
        id: 'ai-2', 
        name: 'Requirements Gathering',
        description: 'Collect and document detailed project requirements',
        estimatedHours: 16,
        priority: 'high',
        status: 'pending',
        assignee: null,
        startDate: null,
        endDate: null,
        dependencies: ['ai-1']
      },
      {
        id: 'ai-3',
        name: 'System Design',
        description: 'Create technical architecture and system design',
        estimatedHours: 24,
        priority: 'high',
        status: 'pending',
        assignee: null,
        startDate: null,
        endDate: null,
        dependencies: ['ai-2']
      },
      {
        id: 'ai-4',
        name: 'Core Implementation',
        description: 'Implement main features and functionality',
        estimatedHours: 80,
        priority: 'high',
        status: 'pending',
        assignee: null,
        startDate: null,
        endDate: null,
        dependencies: ['ai-3']
      },
      {
        id: 'ai-5',
        name: 'Testing & Validation',
        description: 'Comprehensive testing and quality assurance',
        estimatedHours: 32,
        priority: 'medium',
        status: 'pending',
        assignee: null,
        startDate: null,
        endDate: null,
        dependencies: ['ai-4']
      }
    ];
    
    res.status(200).json({
      success: true,
      tasks: mockTasks,
      summary: {
        totalTasks: mockTasks.length,
        estimatedTotalHours: mockTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
        highPriorityTasks: mockTasks.filter(task => task.priority === 'high').length
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
app.put('/api/v1/schedules/:scheduleId/tasks/:taskId', (req, res) => {
  try {
    const { scheduleId, taskId } = req.params;
    const taskData = req.body;
    
    console.log('Updating task:', taskId, 'in schedule:', scheduleId);
    console.log('Update data:', taskData);
    
    // For now, just return success since this is a mock server
    // In a real implementation, you would update the task in the database
    const updatedTask = {
      id: taskId,
      scheduleId: scheduleId,
      name: taskData.name || 'Updated Task',
      description: taskData.description || 'Updated task description',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      estimatedHours: taskData.estimatedHours || 8,
      assignee: taskData.assignee || null,
      startDate: taskData.startDate || null,
      endDate: taskData.endDate || null,
      dependencies: taskData.dependencies || [],
      updatedAt: new Date().toISOString()
    };
    
    console.log('Task updated:', updatedTask);
    
    // Update the task in our in-memory storage
    const existingTasks = taskStorage.get(scheduleId) || [];
    const taskIndex = existingTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      existingTasks[taskIndex] = updatedTask;
      taskStorage.set(scheduleId, existingTasks);
    }
    
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
