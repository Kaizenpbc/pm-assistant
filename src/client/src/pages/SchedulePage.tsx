import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  AlertTriangle,
  Edit3
} from 'lucide-react';
import ProjectPlanningTemplates from '../components/ProjectPlanningTemplates';
import { AITaskBreakdown } from '../components/AITaskBreakdown';
import { apiService } from '../services/api';

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
  schedule_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  due_date?: string;
  estimated_days?: number;
  parent_task_id?: string;
  work_effort?: string;
  dependency?: string;
  risks?: string;
  issues?: string;
  comments?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // AI-generated fields
  complexity?: 'low' | 'medium' | 'high';
  riskLevel?: number;
  category?: string;
  skills?: string[];
  deliverables?: string[];
  dependencies?: string[];
  // Legacy fields for compatibility
  startDate?: string;
  endDate?: string;
  progress?: number;
  estimatedHours?: number;
  actualHours?: number;
  assignedResource?: string;
  actualStartDate?: string;
  projectedFinishDate?: string;
}

interface ProjectSchedule {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  projectId?: string;
  templateId?: string;
  templateName?: string;
}

interface EditScheduleFormProps {
  schedule: ProjectSchedule;
  onSave: (updatedSchedule: ProjectSchedule) => void;
  onCancel: () => void;
}

const EditScheduleForm: React.FC<EditScheduleFormProps> = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: schedule.name || 'Project Schedule',
    description: schedule.description || 'Auto-generated schedule',
    start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
    end_date: schedule.end_date ? schedule.end_date.split('T')[0] : '',
    status: schedule.status || 'planned'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSchedule: ProjectSchedule = {
      ...schedule,
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : schedule.start_date,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : schedule.end_date,
      status: formData.status as any,
      updated_at: new Date().toISOString()
    };
    
    onSave(updatedSchedule);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Schedule Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter schedule name"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter schedule description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const SchedulePage: React.FC = () => {
  const { projectId, id } = useParams<{ projectId?: string; id?: string }>();
  const actualProjectId = projectId || id;
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
  const [taskHierarchy, setTaskHierarchy] = useState<Record<string, ScheduleTask[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [editableDates, setEditableDates] = useState<Record<string, { start?: string; finish?: string }>>({});
  const [editableDurations, setEditableDurations] = useState<Record<string, string>>({});
  const [editableWorkEfforts, setEditableWorkEfforts] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // No mock project data - clean development environment


  // Mock schedule data - removed, will be loaded from database

  // Clean development environment - no mock data

  // Load project data using React Query (cached)
  const { data: projectData } = useQuery({
    queryKey: ['project', actualProjectId],
    queryFn: () => apiService.getProject(actualProjectId!),
    enabled: !!actualProjectId,
    select: (data) => data.project,
  });

  // Load schedules data using React Query (cached)
  const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules', actualProjectId],
    queryFn: () => apiService.getSchedules(actualProjectId!),
    enabled: !!actualProjectId,
    select: (data) => data.schedules || [],
  });

  // Update project state when data loads
  useEffect(() => {
    if (projectData) {
      setProject(projectData);
    } else if (actualProjectId) {
      // Fallback project object
      setProject({
        id: actualProjectId,
        code: 'PROJECT',
        name: 'Project',
        description: 'Project description',
        status: 'active',
        priority: 'medium',
        category: 'general'
      });
    }
  }, [projectData, actualProjectId]);

  // Handle schedule selection
  useEffect(() => {
    if (!schedulesData || schedulesData.length === 0) {
      setCurrentSchedule(null);
      setIsLoadingSchedule(false); // No schedules means no loading needed
      return;
    }

    // Use the first schedule (simplified)
    const scheduleToUse = schedulesData[0];
    setCurrentSchedule(scheduleToUse);
  }, [schedulesData]);

  // Load tasks data using React Query (cached)
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', currentSchedule?.id],
    queryFn: () => apiService.getTasks(currentSchedule!.id),
    enabled: !!currentSchedule?.id,
    select: (data) => data.tasks || [],
  });

  // Update tasks state when data loads
  useEffect(() => {
    if (tasksData) {
      setScheduleTasks(tasksData);
      
      // Build task hierarchy
      const hierarchy: Record<string, ScheduleTask[]> = {};
      tasksData.forEach((task: ScheduleTask) => {
        if (task.parent_task_id) {
          if (!hierarchy[task.parent_task_id]) {
            hierarchy[task.parent_task_id] = [];
          }
          hierarchy[task.parent_task_id].push(task);
        }
      });
      setTaskHierarchy(hierarchy);
      setIsLoadingSchedule(false);
    } else if (currentSchedule) {
      setScheduleTasks([]);
      setTaskHierarchy({});
      setIsLoadingSchedule(false);
    }
  }, [tasksData, currentSchedule]);

  // Update loading state based on schedules and tasks loading
  useEffect(() => {
    if (isLoadingSchedules) {
      setIsLoadingSchedule(true);
    } else if (!schedulesData || schedulesData.length === 0) {
      setIsLoadingSchedule(false); // No schedules to load
    } else if (currentSchedule) {
      setIsLoadingSchedule(isLoadingTasks);
    }
  }, [isLoadingSchedules, schedulesData, isLoadingTasks, currentSchedule]);

  // Initialize editable states with current task data
  useEffect(() => {
    if (scheduleTasks.length > 0) {
      const initialDates: Record<string, { start?: string; finish?: string }> = {};
      const initialDurations: Record<string, string> = {};
      const initialWorkEfforts: Record<string, string> = {};
      
      scheduleTasks.forEach(task => {
        if (task.startDate) initialDates[task.id] = { start: task.startDate };
        if (task.endDate) initialDates[task.id] = { ...initialDates[task.id], finish: task.endDate };
        if (task.estimated_days) initialDurations[task.id] = task.estimated_days.toString();
        if (task.work_effort) initialWorkEfforts[task.id] = task.work_effort;
      });
      
      setEditableDates(initialDates);
      setEditableDurations(initialDurations);
      setEditableWorkEfforts(initialWorkEfforts);
    }
  }, [scheduleTasks]);

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
    
    // Auto-calculate finish date when start date changes
    if (type === 'start') {
      autoCalculateFinishDate(taskId);
    }
    
    // Auto-calculate duration when finish date changes
    if (type === 'finish') {
      autoCalculateDuration(taskId);
    }
  };

  const handleDurationChange = (taskId: string, value: string) => {
    console.log('Duration changed for task:', taskId, 'to:', value);
    setEditableDurations(prev => ({
      ...prev,
      [taskId]: value
    }));
    setHasUnsavedChanges(true);
    // Auto-calculate finish date when duration changes
    autoCalculateFinishDate(taskId);
  };

  const handleWorkEffortChange = (taskId: string, value: string) => {
    setEditableWorkEfforts(prev => ({
      ...prev,
      [taskId]: value
    }));
    setHasUnsavedChanges(true);
    // Auto-calculate finish date when work effort changes
    autoCalculateFinishDate(taskId);
  };

  // Helper function to auto-calculate finish date based on start date and duration
  const autoCalculateFinishDate = (taskId: string) => {
    const startDate = editableDates[taskId]?.start;
    const duration = editableDurations[taskId];
    
    console.log('Auto-calculating finish date for task:', taskId, 'startDate:', startDate, 'duration:', duration);
    
    // If no start date in editable state, try to get it from task data
    let actualStartDate = startDate;
    if (!actualStartDate) {
      const task = scheduleTasks.find(t => t.id === taskId);
      if (task && task.startDate) {
        actualStartDate = task.startDate;
      } else {
        // Use today's date as default
        actualStartDate = new Date().toISOString().split('T')[0];
      }
    }
    
    console.log('Actual start date:', actualStartDate);
    
    if (actualStartDate && duration) {
      const start = new Date(actualStartDate);
      const days = parseInt(duration) || 1;
      
      // Calculate finish date (subtract 1 day since start and end are both working days)
      const finish = new Date(start);
      finish.setDate(finish.getDate() + days - 1);
      
      const finishDateStr = finish.toISOString().split('T')[0];
      console.log('Calculated finish date:', finishDateStr, 'from start:', actualStartDate, 'and duration:', days, 'days');
      
      // Update the finish date in editable state
      setEditableDates(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          start: actualStartDate,
          finish: finishDateStr
        }
      }));
      
      // Also update the actual task data
      setScheduleTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, 
              estimatedDays: parseInt(duration) || 1,
              startDate: actualStartDate,
              endDate: finishDateStr
            }
          : task
      ));
      
      // Update subtasks too if this is a parent task
      setTaskHierarchy(prev => {
        const newHierarchy = { ...prev };
        if (newHierarchy[taskId]) {
          newHierarchy[taskId] = newHierarchy[taskId].map(subtask => ({
            ...subtask,
            estimatedDays: parseInt(duration) || 1
          }));
        }
        return newHierarchy;
      });
      
      console.log('Successfully updated finish date to:', finishDateStr);
      
    } else {
      console.log('Cannot calculate finish date - missing startDate or duration');
    }
  };

  // Helper function to auto-calculate duration based on start and finish dates
  const autoCalculateDuration = (taskId: string) => {
    const startDate = editableDates[taskId]?.start;
    const finishDate = editableDates[taskId]?.finish;
    
    if (startDate && finishDate) {
      const start = new Date(startDate);
      const finish = new Date(finishDate);
      
      // Calculate duration in days (add 1 day since both start and end are working days)
      const diffTime = finish.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Update the duration in editable state
      setEditableDurations(prev => ({
        ...prev,
        [taskId]: diffDays.toString()
      }));
      
      // Also update the actual task data
      setScheduleTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, 
              estimatedDays: diffDays,
              startDate: startDate,
              endDate: finishDate
            }
          : task
      ));
      
      // Update subtasks too if this is a parent task
      setTaskHierarchy(prev => {
        const newHierarchy = { ...prev };
        if (newHierarchy[taskId]) {
          newHierarchy[taskId] = newHierarchy[taskId].map(subtask => ({
            ...subtask,
            estimatedDays: diffDays
          }));
        }
        return newHierarchy;
      });
      
    }
  };

  const handleAITasksGenerated = (aiTasks: any[], phases?: any[]) => {
    console.log('=== AI TASKS GENERATED ===');
    console.log('AI Tasks:', aiTasks);
    console.log('Phases:', phases);

    // Convert AI tasks to ScheduleTask format
    const convertedTasks: ScheduleTask[] = aiTasks.map(task => ({
      id: task.id,
      schedule_id: currentSchedule?.id || 'default-schedule',
      name: task.name,
      description: task.description,
      status: 'pending' as const,
      priority: task.priority,
      estimated_days: task.estimatedDays,
      work_effort: task.estimatedDays?.toString() + ' days',
      dependency: task.dependencies?.join(', '),
      risks: task.riskLevel > 50 ? `High risk task (${task.riskLevel}%)` : undefined,
      comments: `AI-generated task. Category: ${task.category}. Skills: ${task.skills?.join(', ')}`,
      created_by: 'ai-system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // AI fields
      complexity: task.complexity,
      riskLevel: task.riskLevel,
      category: task.category,
      skills: task.skills,
      deliverables: task.deliverables,
      dependencies: task.dependencies
    }));

    // Create phase structure if phases are provided
    if (phases && phases.length > 0) {
      console.log('Creating phase structure...');
      
      // Create phase tasks and organize subtasks
      const newTasks: ScheduleTask[] = [];
      const newHierarchy: Record<string, ScheduleTask[]> = {};

      phases.forEach(phase => {
        // Create phase header task
        const phaseTask: ScheduleTask = {
          id: `phase-${phase.id}`,
          schedule_id: currentSchedule?.id || 'default-schedule',
          name: phase.name,
          description: phase.description,
          status: 'pending' as const,
          priority: 'medium',
          estimated_days: phase.estimatedDays,
          work_effort: phase.estimatedDays?.toString() + ' days',
          created_by: 'ai-system',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Mark as phase
          category: 'Phase',
          complexity: 'medium',
          riskLevel: 20
        };

        newTasks.push(phaseTask);

        // Get tasks for this phase
        const phaseTaskIds = phase.tasks.map((t: any) => t.id);
        const phaseSubtasks = convertedTasks.filter(task => phaseTaskIds.includes(task.id));
        
        // Add phase subtasks to hierarchy
        newHierarchy[phaseTask.id] = phaseSubtasks;
      });

      console.log('Phase tasks created:', newTasks);
      console.log('Phase hierarchy:', newHierarchy);

      // Update state with phase structure
      setScheduleTasks(prev => [...prev, ...newTasks]);
      setTaskHierarchy(prev => ({ ...prev, ...newHierarchy }));
    } else {
      // Fallback to flat structure if no phases
      console.log('No phases provided, using flat structure');
      setScheduleTasks(prev => [...prev, ...convertedTasks]);
    }

    setHasUnsavedChanges(true);
    setShowAIBreakdown(false);
    
    const phaseCount = phases ? phases.length : 0;
    setMessageText(`AI generated ${convertedTasks.length} tasks in ${phaseCount} phases successfully!`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  const handleSaveSchedule = async () => {
    if (!project) {
      console.error('No project to save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('=== SAVING SCHEDULE TO DATABASE ===');
      console.log('Current schedule state:', currentSchedule);
      console.log('Schedule tasks count:', scheduleTasks.length);
      
      // Create a schedule if none exists
      let scheduleId;
      
      if (!currentSchedule) {
        // Check if there are any existing schedules for this project first
        if (!project?.id) {
          console.error('Cannot save schedule: project ID is missing');
          return;
        }
        const existingSchedules = await apiService.getSchedules(project.id);
        
        if (existingSchedules.schedules && existingSchedules.schedules.length > 0) {
          // Use the existing schedule with most tasks
          let scheduleToUse = existingSchedules.schedules[0];
          let maxTasks = 0;
          
          for (const schedule of existingSchedules.schedules) {
            try {
              const tasksResponse = await apiService.getTasks(schedule.id);
              const taskCount = tasksResponse.tasks ? tasksResponse.tasks.length : 0;
              
              if (taskCount > maxTasks) {
                maxTasks = taskCount;
                scheduleToUse = schedule;
              }
            } catch (error) {
              console.warn(`Could not load tasks for schedule ${schedule.id}:`, error);
            }
          }
          
          console.log(`Using existing schedule ${scheduleToUse.id} with ${maxTasks} tasks`);
          setCurrentSchedule(scheduleToUse);
          scheduleId = scheduleToUse.id;
        } else {
          // Create new schedule only if none exist
      const scheduleData = {
        projectId: project?.id,
            name: 'Project Schedule',
            description: 'Auto-generated schedule',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          };
          
          const response = await apiService.createSchedule(scheduleData);
          scheduleId = response.schedule.id;
          
          // Update current schedule with database ID
          setCurrentSchedule(response.schedule);
          console.log('Created new schedule:', response.schedule);
        }
      } else if (currentSchedule.id === 'default-schedule') {
        // Create new schedule in database
        const scheduleData = {
          projectId: project?.id,
          name: currentSchedule.name,
          description: currentSchedule.description,
          startDate: currentSchedule.start_date,
          endDate: currentSchedule.end_date,
        };
        
        const response = await apiService.createSchedule(scheduleData);
        scheduleId = response.schedule.id;
        
        // Update current schedule with database ID
        setCurrentSchedule(response.schedule);
        console.log('Created new schedule:', response.schedule);
      } else {
        // Update existing schedule
        scheduleId = currentSchedule.id;
        const updateData = {
          name: currentSchedule.name,
          description: currentSchedule.description,
          startDate: currentSchedule.start_date,
          endDate: currentSchedule.end_date,
        };
        
        await apiService.updateSchedule(scheduleId, updateData);
        console.log('Updated schedule:', scheduleId);
      }
      
      // Save all tasks
      for (const task of scheduleTasks) {
        if (task.id.startsWith('task-') || task.id.startsWith('phase-')) {
          // This is a new task, create it
          // Format date properly for server (YYYY-MM-DD)
          // const formatDateForServer = (dateStr: string | undefined) => {
          //   if (!dateStr) return undefined;
          //   const date = new Date(dateStr);
          //   return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
          // };

          const taskData = {
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: (task.assigned_to || (task as any).assignedTo) === 'TBD' ? undefined : (task.assigned_to || (task as any).assignedTo),
            dueDate: (task.due_date || task.endDate) || undefined,
            estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
            workEffort: task.work_effort,
            dependency: task.dependency,
            risks: task.risks,
            issues: task.issues,
            comments: task.comments,
          };
          
          // Remove empty string values that cause validation errors
          Object.keys(taskData).forEach(key => {
            if ((taskData as any)[key] === '') {
              (taskData as any)[key] = undefined;
            }
          });
          
          console.log('=== CREATING TASK ===');
          console.log('Task name:', task.name);
          console.log('Task data being sent:', JSON.stringify(taskData, null, 2));
          
          await apiService.createTask(scheduleId, taskData);
          console.log('Created new task:', task.name);
        } else {
          // This is an existing task, update it
          const updateData = {
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: (task.assigned_to || (task as any).assignedTo) === 'TBD' ? undefined : (task.assigned_to || (task as any).assignedTo),
            dueDate: (task.due_date || task.endDate) || undefined,
            estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
            workEffort: task.work_effort,
            dependency: task.dependency,
            risks: task.risks,
            issues: task.issues,
            comments: task.comments,
          };
          
          // Remove empty string values that cause validation errors
          Object.keys(updateData).forEach(key => {
            if ((updateData as any)[key] === '') {
              (updateData as any)[key] = undefined;
            }
          });
          
          await apiService.updateTask(scheduleId, task.id, updateData);
          console.log('Updated task:', task.name);
        }
      }
      
      setHasUnsavedChanges(false);
      
      // Show success message
      setMessageText(`Schedule saved successfully with ${scheduleTasks.length} tasks!`);
      setShowSuccessMessage(true);
      setShowErrorMessage(false);
      setTimeout(() => setShowSuccessMessage(false), 4000);
      
      console.log('Schedule saved successfully to database!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      
      // Show error message
      setMessageText('Failed to save schedule. Please try again.');
      setShowErrorMessage(true);
      setShowSuccessMessage(false);
      setTimeout(() => setShowErrorMessage(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhases = () => {
    console.log('Add Phases clicked');
    setShowTemplates(true);
  };

  const handleClearSchedule = async () => {
    if (!confirm('Are you sure you want to clear the current schedule? This will delete all phases and tasks.')) {
      return;
    }
    
    if (!currentSchedule?.id) {
      console.log('No schedule to clear');
      return;
    }
    
    try {
      console.log('Deleting schedule from database:', currentSchedule.id);
      await apiService.deleteSchedule(currentSchedule.id);
      
      // Clear frontend state
      setScheduleTasks([]);
      setTaskHierarchy({});
      setCurrentSchedule(null);
      setHasUnsavedChanges(false); // No unsaved changes since we deleted everything
      
      console.log('✅ Schedule deleted successfully from database');
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
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
        schedule_id: currentSchedule?.id || 'default-schedule',
        name: phase.name,
        description: phase.description,
        status: 'pending',
        priority: 'medium',
        estimated_days: phase.estimatedDays,
        assigned_to: 'TBD',
        due_date: new Date(Date.now() + phase.estimatedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_by: 'admin-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      newTasks.push(phaseTask);
      
      // Create subtasks for this phase
      const subtasks: ScheduleTask[] = [];
      if (phase.tasks) {
        phase.tasks.forEach((task: any) => {
          const subtask: ScheduleTask = {
            id: `task-${taskCounter++}`,
            schedule_id: currentSchedule?.id || 'default-schedule',
            name: task.name,
            description: task.description,
            status: 'pending',
            priority: 'medium',
            estimated_days: task.estimatedDays || 1,
            assigned_to: 'TBD',
            due_date: new Date(Date.now() + (task.estimatedDays || 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_by: 'admin-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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


  // Show loading state while loading project or schedule data
  if (!project || isLoadingSchedule) {
    console.log('🔄 SchedulePage: Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{!project ? 'Loading project data...' : 'Loading schedule data...'}</p>
        </div>
      </div>
    );
  }

  // Show error state if loading failed
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{loadError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No loading state needed - always show the schedule interface

  return (
    <div className="min-h-screen bg-white">
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
                  {project?.name || 'Loading...'} - Schedule
                </h1>
                <p className="text-sm text-gray-500">
                  {project?.code || ''} • {project?.category || ''}
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
              <div>showAIBreakdown: {showAIBreakdown.toString()}</div>
              <div>AI Button should be visible in action bar</div>
            </div>
          )}

          {/* Schedule Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Project Schedule</h2>
              <p className="text-gray-600">Manage project phases, tasks, and timelines</p>
            </div>
            <div className="flex gap-3">
              {/* AI Task Breakdown Button */}
              <button 
                onClick={() => {
                  console.log('AI Task Breakdown button clicked!');
                  setShowAIBreakdown(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                style={{ backgroundColor: '#7c3aed' }} // Fallback color
              >
                🤖 AI Task Breakdown
              </button>
              <button 
                onClick={handleAddPhases}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <Plus className="h-4 w-4" />
                Add Phases
              </button>
              <button 
                onClick={() => setShowEditModal(true)}
                disabled={!currentSchedule}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="h-4 w-4" />
                Edit Schedule
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
                Schedule: {currentSchedule?.name || 'No Schedule Created'}
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
                    {scheduleTasks.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="border border-gray-300 px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="h-12 w-12 text-gray-300" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Get started by creating your first schedule using the AI Task Breakdown or Add Phases buttons above.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      scheduleTasks.map((task, taskIndex) => {
                      const subtasks = taskHierarchy[task.id] || [];
                      const isExpanded = expandedTasks[task.id] || false;
                      
                      // Calculate dates
                      const taskStartDate = new Date();
                      taskStartDate.setDate(taskStartDate.getDate() + taskIndex);
                      
                      const taskEndDate = new Date(taskStartDate);
                      taskEndDate.setDate(taskEndDate.getDate() + (task.estimated_days || 1));
                      
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
                                <div className="flex items-center gap-2">
                                <span 
                                  className="cursor-pointer hover:text-blue-600"
                                  onClick={() => handleTaskSelect(task)}
                                >
                                  {task.name}
                                </span>
                                  {task.created_by === 'ai-system' && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                      🤖 AI
                                    </span>
                                  )}
                                  {task.complexity && (
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      task.complexity === 'high' ? 'bg-red-100 text-red-800' :
                                      task.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {task.complexity}
                                    </span>
                                  )}
                                  {task.riskLevel && task.riskLevel > 50 && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                      ⚠️ {task.riskLevel}%
                                    </span>
                                  )}
                                </div>
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
                              <input
                                type="text"
                                value={editableWorkEfforts[task.id] || task.work_effort || ''}
                                onChange={(e) => handleWorkEffortChange(task.id, e.target.value)}
                                className="w-full border-0 bg-transparent text-sm"
                                placeholder="e.g., 8 hours/day"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <input
                                type="number"
                                min="1"
                                value={editableDurations[task.id] || task.estimated_days || 1}
                                onChange={(e) => handleDurationChange(task.id, e.target.value)}
                                className="w-full border-0 bg-transparent text-sm"
                                placeholder="Days"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              {task.assigned_to || task.assignedResource || '-'}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : task.status === 'in_progress'
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
                                <input
                                  type="text"
                                  value={editableWorkEfforts[subtask.id] || subtask.work_effort || ''}
                                  onChange={(e) => handleWorkEffortChange(subtask.id, e.target.value)}
                                  className="w-full border-0 bg-transparent text-sm"
                                  placeholder="e.g., 8 hours/day"
                                />
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <input
                                  type="number"
                                  min="1"
                                  value={editableDurations[subtask.id] || subtask.estimated_days || 1}
                                  onChange={(e) => handleDurationChange(subtask.id, e.target.value)}
                                  className="w-full border-0 bg-transparent text-sm"
                                  placeholder="Days"
                                />
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                {subtask.assigned_to || subtask.assignedResource || '-'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  subtask.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : subtask.status === 'in_progress'
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
                    })
                  )}
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

          {/* AI Task Breakdown Modal */}
          {showAIBreakdown && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">🤖 AI Task Breakdown</h3>
                  <button
                    onClick={() => setShowAIBreakdown(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4">
                  <AITaskBreakdown
                    onTasksGenerated={handleAITasksGenerated}
                    projectId={project?.id}
                    existingDescription={project?.description || ''}
                    projectName={project?.name || ''}
                    projectCode={project?.code || ''}
                    projectStatus={project?.status || ''}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Edit Schedule Modal */}
          {showEditModal && currentSchedule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Schedule Details</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4">
                  <EditScheduleForm
                    schedule={currentSchedule}
                    onSave={(updatedSchedule) => {
                      setCurrentSchedule(updatedSchedule);
                      setShowEditModal(false);
                      setHasUnsavedChanges(true);
                    }}
                    onCancel={() => setShowEditModal(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;