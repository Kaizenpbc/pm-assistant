import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  FileText,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import ProjectPlanningTemplates from '../components/ProjectPlanningTemplates';

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  category: string;
}

interface ScheduleTask {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  assignedTo?: string;
  parentTaskId?: string;
  dependencies?: string[];
  estimatedDays?: number;
  dependency?: string;
  workEffort?: string;
  assignedResource?: string;
  risks?: string;
  issues?: string;
  comments?: string;
  actualStartDate?: string;
  projectedFinishDate?: string;
}

interface ProjectSchedule {
  id: string;
  name: string;
  description: string;
  projectId: string;
  templateId?: string;
  templateName?: string;
}

const SchedulePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
  const [taskHierarchy, setTaskHierarchy] = useState<Record<string, ScheduleTask[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [editableDates, setEditableDates] = useState<Record<string, { start?: string; finish?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Mock project data - updated to use the correct project based on ID
  const mockProjects: Record<string, Project> = {
    '1': {
      id: '1',
      code: 'AR-INFRA-2024',
      name: 'Anna Regina Infrastructure Development',
      description: 'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities',
      status: 'active',
      priority: 'high',
      category: 'infrastructure'
    },
    '2': {
      id: '2',
      code: 'GSC-2024',
      name: 'Georgetown Smart City Initiative',
      description: 'Implementation of smart city technologies including IoT sensors, data analytics, and digital governance systems',
      status: 'active',
      priority: 'high',
      category: 'technology'
    },
    '3': {
      id: '3',
      code: 'DES-2024',
      name: 'Dartmouth Essequibo School Construction',
      description: 'Construction of a new primary school in Dartmouth, Essequibo to serve the local community',
      status: 'planning',
      priority: 'high',
      category: 'education'
    }
  };


  // Mock schedule data
  const mockSchedule: ProjectSchedule = {
    id: 'schedule-001',
    name: 'Current Project Schedule',
    description: 'Active project schedule',
    projectId: projectId || '2',
    templateId: 'building-construction',
    templateName: 'Building Construction'
  };

  // Mock tasks data - Road Construction template
  const roadConstructionTasks: ScheduleTask[] = [
    {
      id: 'phase-initiation',
      name: 'Project Initiation',
      description: 'Initial project setup and stakeholder alignment',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      status: 'completed',
      priority: 'high',
      progress: 100,
      estimatedHours: 40,
      actualHours: 40,
      estimatedDays: 5,
      dependency: '',
      workEffort: '8 hours/day',
      assignedResource: 'Project Manager',
      risks: 'Low',
      issues: 'None',
      comments: 'Completed on time'
    },
    {
      id: 'phase-analysis',
      name: 'Site Analysis & Survey',
      description: 'Comprehensive site assessment and condition analysis',
      startDate: '2024-01-21',
      endDate: '2024-02-05',
      status: 'in-progress',
      priority: 'high',
      progress: 60,
      estimatedHours: 120,
      actualHours: 72,
      estimatedDays: 15,
      dependency: 'Project Initiation',
      workEffort: '8 hours/day',
      assignedResource: 'Survey Team',
      risks: 'Medium - Weather dependent',
      issues: 'Equipment delay',
      comments: 'On track despite delays'
    },
    {
      id: 'phase-design',
      name: 'Design & Planning',
      description: 'Create detailed project design and specifications',
      startDate: '2024-02-06',
      endDate: '2024-02-25',
      status: 'not-started',
      priority: 'high',
      progress: 0,
      estimatedHours: 160,
      actualHours: 0,
      estimatedDays: 20,
      dependency: 'Site Analysis & Survey',
      workEffort: '8 hours/day',
      assignedResource: 'Engineering Team',
      risks: 'Low',
      issues: 'None',
      comments: 'Waiting for survey completion'
    },
    {
      id: 'phase-construction',
      name: 'Construction & Execution',
      description: 'Physical construction and implementation',
      startDate: '2024-02-26',
      endDate: '2024-04-15',
      status: 'not-started',
      priority: 'high',
      progress: 0,
      estimatedHours: 400,
      actualHours: 0,
      estimatedDays: 50,
      dependency: 'Design & Planning',
      workEffort: '8 hours/day',
      assignedResource: 'Construction Team',
      risks: 'High - Weather and material delays',
      issues: 'None',
      comments: 'Major construction phase'
    }
  ];

  // Mock subtasks for phases
  const mockSubtasks: Record<string, ScheduleTask[]> = {
    'phase-initiation': [
      {
        id: 'task-1',
        name: 'Project kickoff meeting',
        description: 'Meet with stakeholders and team',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        status: 'completed',
        priority: 'high',
        progress: 100,
        estimatedHours: 4,
        actualHours: 4,
        parentTaskId: 'phase-initiation',
        estimatedDays: 1,
        dependency: '',
        workEffort: '4 hours',
        assignedResource: 'Project Manager',
        risks: 'None',
        issues: 'None',
        comments: 'Successful meeting'
      },
      {
        id: 'task-2',
        name: 'Site access coordination',
        description: 'Arrange site access and permits',
        startDate: '2024-01-16',
        endDate: '2024-01-18',
        status: 'completed',
        priority: 'high',
        progress: 100,
        estimatedHours: 8,
        actualHours: 8,
        parentTaskId: 'phase-initiation',
        estimatedDays: 2,
        dependency: 'Project kickoff meeting',
        workEffort: '4 hours/day',
        assignedResource: 'Project Manager',
        risks: 'Low',
        issues: 'None',
        comments: 'Permits obtained'
      }
    ],
    'phase-analysis': [
      {
        id: 'task-3',
        name: 'Road condition survey',
        description: 'Assess current road condition and damage',
        startDate: '2024-01-21',
        endDate: '2024-01-25',
        status: 'completed',
        priority: 'high',
        progress: 100,
        estimatedHours: 16,
        actualHours: 16,
        parentTaskId: 'phase-analysis',
        estimatedDays: 4,
        dependency: '',
        workEffort: '4 hours/day',
        assignedResource: 'Survey Team',
        risks: 'Medium',
        issues: 'None',
        comments: 'Survey completed'
      },
      {
        id: 'task-4',
        name: 'Traffic impact assessment',
        description: 'Analyze traffic patterns and impact',
        startDate: '2024-01-26',
        endDate: '2024-01-30',
        status: 'in-progress',
        priority: 'high',
        progress: 60,
        estimatedHours: 12,
        actualHours: 7,
        parentTaskId: 'phase-analysis',
        estimatedDays: 3,
        dependency: 'Road condition survey',
        workEffort: '4 hours/day',
        assignedResource: 'Traffic Engineer',
        risks: 'Medium',
        issues: 'Data collection delay',
        comments: 'In progress'
      }
    ]
  };

  useEffect(() => {
    // Load project data
    const currentProject = mockProjects[projectId || '2'];
    setProject(currentProject);
    setCurrentSchedule(mockSchedule);
    
    // Try to load saved schedule first
    const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '{}');
    const savedScheduleKey = `${currentProject.id}-${mockSchedule.id}`;
    const savedSchedule = savedSchedules[savedScheduleKey];
    
    if (savedSchedule) {
      console.log('Loading saved schedule:', savedSchedule);
      setScheduleTasks(savedSchedule.phases);
      setTaskHierarchy(savedSchedule.taskHierarchy);
    } else {
      console.log('No saved schedule found, starting with empty schedule');
      setScheduleTasks([]);
      setTaskHierarchy({});
    }
  }, [projectId]);

  const handleTaskToggle = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleTaskSelect = (task: ScheduleTask) => {
    console.log('Task selected:', task);
    // You can implement task editing modal here
  };

  const handleDateChange = (taskId: string, type: 'start' | 'finish', value: string) => {
    setEditableDates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [type]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSchedule = async () => {
    if (!project || !currentSchedule) {
      console.error('No project or schedule to save');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the schedule data to save
      const scheduleData = {
        projectId: project.id,
        scheduleId: currentSchedule.id,
        scheduleName: currentSchedule.name,
        phases: scheduleTasks,
        taskHierarchy: taskHierarchy,
        lastModified: new Date().toISOString(),
        totalTasks: scheduleTasks.length,
        totalSubtasks: Object.values(taskHierarchy).flat().length,
        isEmpty: scheduleTasks.length === 0 // Flag to indicate if schedule is empty
      };

      // Simulate API call (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for now (replace with actual API call)
      const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '{}');
      savedSchedules[`${project.id}-${currentSchedule.id}`] = scheduleData;
      localStorage.setItem('savedSchedules', JSON.stringify(savedSchedules));
      
      setHasUnsavedChanges(false);
      
      // Show success message
      if (scheduleTasks.length === 0) {
        setMessageText('Empty schedule saved successfully!');
      } else {
        setMessageText(`Schedule saved successfully with ${scheduleTasks.length} phases and ${Object.values(taskHierarchy).flat().length} tasks!`);
      }
      setShowSuccessMessage(true);
      setShowErrorMessage(false); // Clear any error messages
      console.log('Setting success message:', messageText);
      setTimeout(() => {
        console.log('Hiding success message');
        setShowSuccessMessage(false);
      }, 4000);
      
      console.log('Schedule saved successfully:', scheduleData);
    } catch (error) {
      console.error('Error saving schedule:', error);
      
      // Show error message
      setMessageText('Failed to save schedule. Please try again.');
      setShowErrorMessage(true);
      setShowSuccessMessage(false); // Clear any success messages
      console.log('Setting error message:', messageText);
      setTimeout(() => {
        console.log('Hiding error message');
        setShowErrorMessage(false);
      }, 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhases = () => {
    console.log('Add Phases clicked');
    setShowTemplates(true);
  };

  const handleClearSchedule = () => {
    if (!confirm('Are you sure you want to clear the current schedule? This will delete all phases and tasks.')) {
      return;
    }
    
    setScheduleTasks([]);
    setTaskHierarchy({});
    setHasUnsavedChanges(true); // Mark as having unsaved changes so user can save the empty state
    console.log('Schedule cleared');
  };

  const handleTemplateSelection = (templateData: any) => {
    console.log('=== TEMPLATE SELECTION START ===');
    console.log('Template selected:', templateData);
    
    // Handle the case where templateData is the template object directly
    let template, selectedPhases, selectedDocuments;
    
    if (templateData.template) {
      // Old format: { template, selectedPhases, selectedDocuments }
      ({ template, selectedPhases, selectedDocuments } = templateData);
    } else if (templateData.id) {
      // New format: template object directly with selectedPhases and selectedDocuments as properties
      template = templateData;
      selectedPhases = templateData.selectedPhases || [];
      selectedDocuments = templateData.selectedDocuments || [];
    } else {
      console.error('Invalid template data format:', templateData);
      return;
    }
    
    console.log('Template:', template);
    console.log('Selected phases:', selectedPhases);
    console.log('Selected documents:', selectedDocuments);
    console.log('Number of selected phases:', selectedPhases.length);
    
    // Generate new tasks from selected phases (ADD to existing, don't replace)
    const newTasks: ScheduleTask[] = [...scheduleTasks]; // Start with existing tasks
    const newHierarchy: Record<string, ScheduleTask[]> = { ...taskHierarchy }; // Start with existing hierarchy
    
    // Find the highest task counter to continue numbering
    let taskCounter = Math.max(1, ...scheduleTasks.map(task => {
      const match = task.id.match(/task-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })) + 1;
    
    // Process each selected phase
    console.log('Processing selectedPhases:', selectedPhases);
    selectedPhases.forEach((phaseId: string, index: number) => {
      console.log(`Processing phase ${index + 1}/${selectedPhases.length}: ${phaseId}`);
      const phase = template.phases.find((p: any) => p.id === phaseId);
      console.log(`Found phase:`, phase);
      if (!phase) {
        console.warn(`Phase ${phaseId} not found in template`);
        return;
      }
      
      // Check if this phase already exists in the schedule
      const existingPhaseId = `phase-${phaseId}`;
      const existingPhase = newTasks.find(task => task.id === existingPhaseId);
      if (existingPhase) {
        console.log(`Phase ${phaseId} already exists in schedule, skipping`);
        return;
      }
      
      // Create main phase task
      const phaseTask: ScheduleTask = {
        id: `phase-${phaseId}`,
        name: phase.name,
        description: phase.description,
        status: 'not-started',
        priority: 'medium',
        estimatedHours: phase.estimatedDays * 8, // Convert days to hours
        actualHours: 0,
        assignedTo: 'TBD',
        startDate: '',
        endDate: '',
        dependencies: phase.dependencies || [],
        progress: 0
      };
      
      newTasks.push(phaseTask);
      
      // Create subtasks for this phase
      const subtasks: ScheduleTask[] = [];
      if (phase.tasks) {
        phase.tasks.forEach((task: any) => {
          const subtask: ScheduleTask = {
            id: `task-${taskCounter++}`,
            name: task.name,
            description: task.description,
            status: 'not-started',
            priority: 'medium',
            estimatedHours: task.estimatedHours || 8,
            actualHours: 0,
            assignedTo: 'TBD',
            startDate: '',
            endDate: '',
            dependencies: [],
            progress: 0
          };
          
          subtasks.push(subtask);
        });
      }
      
      newHierarchy[phaseTask.id] = subtasks;
    });
    
    // Update the schedule with new tasks
    console.log('=== UPDATING SCHEDULE ===');
    console.log('newTasks:', newTasks);
    console.log('newHierarchy:', newHierarchy);
    console.log(`Total phases: ${newTasks.length}, Total subtasks: ${Object.values(newHierarchy).flat().length}`);
    
    setScheduleTasks(newTasks);
    setTaskHierarchy(newHierarchy);
    setHasUnsavedChanges(true);
    setShowTemplates(false);
    
    // Show success message
    const addedPhases = newTasks.length - scheduleTasks.length;
    const addedTasks = Object.values(newHierarchy).flat().length - Object.values(taskHierarchy).flat().length;
    
    if (addedPhases > 0) {
      setMessageText(`Added ${addedPhases} new phase(s) with ${addedTasks} tasks to your schedule!`);
    } else {
      setMessageText(`Schedule updated successfully!`);
    }
    
    setShowSuccessMessage(true);
    setShowErrorMessage(false); // Clear any error messages
    setTimeout(() => setShowSuccessMessage(false), 4000);
    
    console.log(`=== TEMPLATE SELECTION COMPLETE ===`);
    console.log(`Generated schedule with ${newTasks.length} phases and ${Object.values(newHierarchy).flat().length} tasks`);
    console.log('Selected documents:', selectedDocuments);
  };


  if (!project || !currentSchedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project.name} - Schedule
                </h1>
                <p className="text-sm text-gray-500">
                  {project.code} • {project.category}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">{messageText}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {showErrorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">{messageText}</p>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-2 bg-gray-100 text-xs text-gray-600 space-y-1">
              <div>Debug: showSuccessMessage={showSuccessMessage.toString()}, showErrorMessage={showErrorMessage.toString()}</div>
              <div>messageText="{messageText}"</div>
              <div>scheduleTasks.length={scheduleTasks.length}, hasUnsavedChanges={hasUnsavedChanges.toString()}</div>
              <div>scheduleTasks: {JSON.stringify(scheduleTasks.map(t => ({id: t.id, name: t.name})))}</div>
            </div>
          )}

          {/* Schedule Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Project Schedule</h2>
              <p className="text-gray-600">Manage project phases, tasks, and timelines</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddPhases}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <Plus className="h-4 w-4" />
                Add Phases
              </button>
              <button 
                onClick={handleClearSchedule}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <X className="h-4 w-4" />
                Clear Schedule
              </button>
              <button 
                onClick={handleSaveSchedule}
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Schedule
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Schedule Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Schedule: {currentSchedule.name}
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Task</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[80px]">Dependency</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Base Start</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Base Finish</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Actual Start</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Projected Finish</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Work Effort</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Duration</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Resource</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Status</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Risks</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Issues</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleTasks.map((task, taskIndex) => {
                      const subtasks = taskHierarchy[task.id] || [];
                      const isExpanded = expandedTasks[task.id] || false;
                      
                      // Calculate dates
                      const taskStartDate = new Date();
                      taskStartDate.setDate(taskStartDate.getDate() + taskIndex);
                      
                      const taskEndDate = new Date(taskStartDate);
                      taskEndDate.setDate(taskEndDate.getDate() + (task.estimatedDays || 1));
                      
                      return (
                        <React.Fragment key={task.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="flex items-center gap-2">
                                {subtasks.length > 0 && (
                                <button
                                  onClick={() => handleTaskToggle(task.id)}
                                  className="h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center"
                                >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                                <span 
                                  className="cursor-pointer hover:text-blue-600"
                                  onClick={() => handleTaskSelect(task)}
                                >
                                  {task.name}
                                </span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.dependency || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <input
                                type="date"
                                value={editableDates[task.id]?.start || taskStartDate.toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange(task.id, 'start', e.target.value)}
                                className="w-full border-0 bg-transparent text-sm"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <input
                                type="date"
                                value={editableDates[task.id]?.finish || taskEndDate.toISOString().split('T')[0]}
                                onChange={(e) => handleDateChange(task.id, 'finish', e.target.value)}
                                className="w-full border-0 bg-transparent text-sm"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.actualStartDate ? new Date(task.actualStartDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.projectedFinishDate ? new Date(task.projectedFinishDate).toLocaleDateString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.workEffort || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.estimatedDays || 1} days
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.assignedResource || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : task.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status || 'pending'}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.risks || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.issues || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.comments || '-'}
                            </td>
                          </tr>
                          
                          {/* Subtasks */}
                          {isExpanded && subtasks.map((subtask) => (
                            <tr key={subtask.id} className="bg-gray-50">
                              <td className="border border-gray-300 px-3 py-2 pl-8">
                                <span 
                                  className="cursor-pointer hover:text-blue-600"
                                  onClick={() => handleTaskSelect(subtask)}
                                >
                                  {subtask.name}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.dependency || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <input
                                  type="date"
                                  value={editableDates[subtask.id]?.start || new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleDateChange(subtask.id, 'start', e.target.value)}
                                  className="w-full border-0 bg-transparent text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <input
                                  type="date"
                                  value={editableDates[subtask.id]?.finish || new Date().toISOString().split('T')[0]}
                                  onChange={(e) => handleDateChange(subtask.id, 'finish', e.target.value)}
                                  className="w-full border-0 bg-transparent text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.actualStartDate ? new Date(subtask.actualStartDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.projectedFinishDate ? new Date(subtask.projectedFinishDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.workEffort || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.estimatedDays || 1} days
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.assignedResource || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  subtask.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : subtask.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {subtask.status || 'pending'}
                                </span>
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.risks || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.issues || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.comments || '-'}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Template Selection Modal */}
          {showTemplates && (
            <ProjectPlanningTemplates
              projectCategory={project?.category || ''}
              onTemplateSelect={handleTemplateSelection}
              onClose={() => setShowTemplates(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;