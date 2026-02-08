import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Edit3,
  Trash2,
  Layout,
  List,


} from 'lucide-react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
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
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  start_date?: string;
  end_date?: string;
  progress_percentage?: number;
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
  const queryClient = useQueryClient();

  const [project, setProject] = useState<Project | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
  const [taskHierarchy, setTaskHierarchy] = useState<Record<string, ScheduleTask[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [editableDates, setEditableDates] = useState<Record<string, { start?: string; finish?: string }>>({});
  const [editableDurations, setEditableDurations] = useState<Record<string, string>>({});
  const [editableWorkEfforts, setEditableWorkEfforts] = useState<Record<string, string>>({});
  const [editableDependencies, setEditableDependencies] = useState<Record<string, string>>({});
  const [editableDependencyTypes, setEditableDependencyTypes] = useState<Record<string, string>>({});
  const [editableLagTimes, setEditableLagTimes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [loadError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'list' | 'gantt'>('list');
  const [ganttViewMode, setGanttViewMode] = useState<ViewMode>(ViewMode.Month);
  const [ganttError, setGanttError] = useState<string | null>(null);

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

  // Update tasks state when data loads - only on initial load or when schedule changes
  useEffect(() => {
    // Don't overwrite frontend state if we're currently saving or have unsaved changes
    if (isSaving || hasUnsavedChanges) {
      return;
    }

    if (tasksData) {
      // Deduplicate tasks by ID to prevent duplicates
      const uniqueTasks = tasksData.filter((task: ScheduleTask, index: number, self: ScheduleTask[]) =>
        index === self.findIndex(t => t.id === task.id)
      );

      console.log('Loaded tasks:', uniqueTasks.length, 'original:', tasksData.length);
      setScheduleTasks(uniqueTasks);

      // Build task hierarchy
      const hierarchy: Record<string, ScheduleTask[]> = {};

      // Separate main tasks (phases) from subtasks
      const mainTasks: ScheduleTask[] = [];
      const subtasks: ScheduleTask[] = [];

      uniqueTasks.forEach((task: ScheduleTask) => {
        if (!task.parent_task_id) {
          mainTasks.push(task);
        } else {
          subtasks.push(task);
        }
      });

      // Set main tasks as the schedule tasks
      setScheduleTasks(mainTasks);

      // Build hierarchy by grouping subtasks under their parent tasks
      mainTasks.forEach((mainTask: ScheduleTask) => {
        hierarchy[mainTask.id] = subtasks.filter(subtask => subtask.parent_task_id === mainTask.id);
      });

      console.log('=== BUILDING TASK HIERARCHY ===');
      console.log('All tasks:', uniqueTasks.length);
      console.log('All tasks details:', uniqueTasks);
      console.log('Main tasks (phases):', mainTasks);
      console.log('Subtasks:', subtasks);
      console.log('Built hierarchy:', hierarchy);

      setTaskHierarchy(hierarchy);
      setIsLoadingSchedule(false);
    } else if (currentSchedule && !hasUnsavedChanges && !isSaving) {
      // Only clear the hierarchy if we're not in the middle of saving or have unsaved changes
      setScheduleTasks([]);
      setTaskHierarchy({});
      setIsLoadingSchedule(false);
    }
  }, [tasksData, currentSchedule?.id, isSaving, hasUnsavedChanges]);

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
      const initialDependencies: Record<string, string> = {};
      const initialDependencyTypes: Record<string, string> = {};
      const initialLagTimes: Record<string, number> = {};

      scheduleTasks.forEach(task => {
        if (task.startDate) initialDates[task.id] = { start: task.startDate };
        if (task.endDate) initialDates[task.id] = { ...initialDates[task.id], finish: task.endDate };
        if (task.estimated_duration_hours) {
          // Convert hours to days (assuming 8 hours per day)
          initialDurations[task.id] = (task.estimated_duration_hours / 8).toString();
        } else if (task.estimated_days) {
          initialDurations[task.id] = task.estimated_days.toString();
        }
        if (task.work_effort) initialWorkEfforts[task.id] = task.work_effort;
        if (task.dependency) initialDependencies[task.id] = task.dependency;

        // Default dependency type to FS (Finish-to-Start) for existing dependencies
        if (task.dependency) {
          initialDependencyTypes[task.id] = 'FS';
          initialLagTimes[task.id] = 0;
        }
      });

      setEditableDates(initialDates);
      setEditableDurations(initialDurations);
      setEditableWorkEfforts(initialWorkEfforts);
      setEditableDependencies(initialDependencies);
      setEditableDependencyTypes(initialDependencyTypes);
      setEditableLagTimes(initialLagTimes);
    }
  }, [scheduleTasks]);

  // Validate Gantt tasks and clear errors when view mode changes
  useEffect(() => {
    if (viewType === 'gantt' && scheduleTasks.length > 0) {
      try {
        const tasks = getGanttTasks();
        // Validate that all tasks have valid dates
        const hasInvalidDates = tasks.some(task =>
          !task.start || !task.end ||
          isNaN(task.start.getTime()) ||
          isNaN(task.end.getTime())
        );

        if (hasInvalidDates) {
          setGanttError('Some tasks have invalid dates. Please check your task data.');
        } else {
          setGanttError(null);
        }
      } catch (error) {
        console.error('Error validating Gantt tasks:', error);
        setGanttError(`Failed to load Gantt chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      setGanttError(null);
    }
  }, [viewType, ganttViewMode, scheduleTasks, taskHierarchy, editableDates]);

  const handleDeleteTask = (taskId: string, isSubtask: boolean = false, parentId?: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    console.log('Deleting task:', taskId, 'isSubtask:', isSubtask, 'parentId:', parentId);

    if (isSubtask && parentId) {
      // Delete subtask
      setTaskHierarchy(prev => {
        const newHierarchy = { ...prev };
        if (newHierarchy[parentId]) {
          newHierarchy[parentId] = newHierarchy[parentId].filter(t => t.id !== taskId);
        }
        return newHierarchy;
      });
    } else {
      // Delete main task (phase)
      setScheduleTasks(prev => prev.filter(t => t.id !== taskId));
      // Also remove its hierarchy entry if it exists
      setTaskHierarchy(prev => {
        const newHierarchy = { ...prev };
        delete newHierarchy[taskId];
        return newHierarchy;
      });
    }

    setHasUnsavedChanges(true);
  };

  const handleTaskToggle = (taskId: string) => {
    console.log('=== TASK TOGGLE CLICKED ===');
    console.log('Task ID:', taskId);
    console.log('Current expanded state:', expandedTasks[taskId]);

    setExpandedTasks(prev => {
      const newState = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      console.log('New expanded state:', newState);
      return newState;
    });
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

    // If this is a subtask, auto-update parent phase dates
    const task = scheduleTasks.find(t => t.id === taskId);
    if (task?.parent_task_id) {
      console.log(`🔄 Subtask ${taskId} date changed in List view, updating parent ${task.parent_task_id}`);
      setTimeout(() => updateParentPhaseDates(task.parent_task_id!), 100);
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

    // If this task has dependencies, recalculate dependent tasks
    const dependentTasks = scheduleTasks.filter(task =>
      editableDependencies[task.id] === taskId || task.dependency === taskId
    );

    dependentTasks.forEach(dependentTask => {
      recalculateTaskDates(dependentTask.id, taskId);
    });
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

  const handleDependencyChange = (taskId: string, value: string) => {
    setEditableDependencies(prev => ({
      ...prev,
      [taskId]: value
    }));
    setHasUnsavedChanges(true);

    // Trigger automatic date recalculation
    if (value) {
      recalculateTaskDates(taskId, value);
    }
  };

  const handleDependencyTypeChange = (taskId: string, value: string) => {
    setEditableDependencyTypes(prev => ({
      ...prev,
      [taskId]: value
    }));
    setHasUnsavedChanges(true);

    // Recalculate dates when dependency type changes
    const dependencyTaskId = editableDependencies[taskId];
    if (dependencyTaskId) {
      recalculateTaskDates(taskId, dependencyTaskId);
    }
  };

  const handleLagTimeChange = (taskId: string, value: string) => {
    const lagDays = parseInt(value) || 0;
    setEditableLagTimes(prev => ({
      ...prev,
      [taskId]: lagDays
    }));
    setHasUnsavedChanges(true);

    // Recalculate dates when lag time changes
    const dependencyTaskId = editableDependencies[taskId];
    if (dependencyTaskId) {
      recalculateTaskDates(taskId, dependencyTaskId);
    }
  };

  // Microsoft Project-style dependency calculation
  const recalculateTaskDates = (dependentTaskId: string, predecessorTaskId: string) => {
    const predecessorTask = scheduleTasks.find(task => task.id === predecessorTaskId);
    const dependentTask = scheduleTasks.find(task => task.id === dependentTaskId);

    if (!predecessorTask || !dependentTask) return;

    const dependencyType = editableDependencyTypes[dependentTaskId] || 'FS'; // Default to Finish-to-Start
    const lagDays = editableLagTimes[dependentTaskId] || 0;
    const duration = parseInt(editableDurations[dependentTaskId] || dependentTask.estimated_days?.toString() || '1');

    let newStartDate: Date;
    let newEndDate: Date;

    // Get predecessor dates (use editable dates if available)
    const predStartDate = editableDates[predecessorTaskId]?.start
      ? new Date(editableDates[predecessorTaskId].start!)
      : predecessorTask.startDate
        ? new Date(predecessorTask.startDate)
        : new Date();

    const predEndDate = editableDates[predecessorTaskId]?.finish
      ? new Date(editableDates[predecessorTaskId].finish!)
      : predecessorTask.endDate
        ? new Date(predecessorTask.endDate)
        : new Date();

    // Calculate new dates based on dependency type
    switch (dependencyType) {
      case 'FS': // Finish-to-Start: Dependent task starts when predecessor finishes
        newStartDate = new Date(predEndDate);
        newStartDate.setDate(newStartDate.getDate() + lagDays + 1); // +1 because next day
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + duration - 1); // -1 because inclusive
        break;

      case 'SS': // Start-to-Start: Both tasks start at same time
        newStartDate = new Date(predStartDate);
        newStartDate.setDate(newStartDate.getDate() + lagDays);
        newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + duration - 1);
        break;

      case 'FF': // Finish-to-Finish: Both tasks finish at same time
        newEndDate = new Date(predEndDate);
        newEndDate.setDate(newEndDate.getDate() + lagDays);
        newStartDate = new Date(newEndDate);
        newStartDate.setDate(newStartDate.getDate() - duration + 1);
        break;

      case 'SF': // Start-to-Finish: Dependent task finishes when predecessor starts
        newEndDate = new Date(predStartDate);
        newEndDate.setDate(newEndDate.getDate() + lagDays);
        newStartDate = new Date(newEndDate);
        newStartDate.setDate(newStartDate.getDate() - duration + 1);
        break;

      default:
        return;
    }

    // Update the dependent task's dates
    setEditableDates(prev => ({
      ...prev,
      [dependentTaskId]: {
        start: newStartDate.toISOString().split('T')[0],
        finish: newEndDate.toISOString().split('T')[0]
      }
    }));

    console.log(`📅 Recalculated dates for ${dependentTask.name}:`, {
      dependencyType,
      lagDays,
      newStartDate: newStartDate.toISOString().split('T')[0],
      newEndDate: newEndDate.toISOString().split('T')[0]
    });
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
          ? {
            ...task,
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
          ? {
            ...task,
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
    console.log('🚀 handleSaveSchedule called!');

    if (!project) {
      console.error('No project to save');
      return;
    }

    setIsSaving(true);
    try {
      console.log('=== SAVING SCHEDULE TO DATABASE ===');
      console.log('Current schedule state:', currentSchedule);
      console.log('Schedule tasks count:', scheduleTasks.length);
      console.log('Schedule tasks:', scheduleTasks);
      console.log('Task hierarchy:', taskHierarchy);
      console.log('Task hierarchy keys:', Object.keys(taskHierarchy));
      console.log('Task hierarchy values:', Object.values(taskHierarchy));

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
            projectId: project?.id || '',
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
          projectId: project?.id || '',
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

      // DEBUG: Check what's in the state before collecting tasks
      console.log('=== DEBUG: STATE BEFORE TASK COLLECTION ===');
      console.log('scheduleTasks:', scheduleTasks);
      console.log('taskHierarchy:', taskHierarchy);
      console.log('taskHierarchy keys:', Object.keys(taskHierarchy));
      console.log('taskHierarchy values:', Object.values(taskHierarchy));

      // Collect all tasks to save (main tasks + subtasks from hierarchy)
      const allTasksToSave = [...scheduleTasks];

      // Add all subtasks from hierarchy to the save list with proper parent_task_id
      Object.entries(taskHierarchy).forEach(([parentId, subtasks]) => {
        const subtasksWithParent = subtasks.map(subtask => ({
          ...subtask,
          parent_task_id: parentId
        }));
        allTasksToSave.push(...subtasksWithParent);
      });

      console.log('=== SAVING ALL TASKS ===');
      console.log('Main tasks:', scheduleTasks.length);
      console.log('Main tasks details:', scheduleTasks);
      console.log('Task hierarchy keys:', Object.keys(taskHierarchy));
      console.log('Task hierarchy values:', Object.values(taskHierarchy));
      console.log('Subtasks from hierarchy:', Object.values(taskHierarchy).flat().length);
      console.log('Subtasks details:', Object.values(taskHierarchy).flat());
      console.log('Total tasks to save:', allTasksToSave.length);
      console.log('All tasks to save details:', allTasksToSave);

      // Process tasks sequentially to handle parent-child relationships correctly
      console.log('=== STARTING TASK SAVE PROCESS ===');
      console.log('allTasksToSave.length:', allTasksToSave.length);
      console.log('allTasksToSave:', allTasksToSave);

      if (allTasksToSave.length === 0) {
        console.log('✅ NO TASKS TO SAVE - Schedule is empty, which is valid after clearing');
        setHasUnsavedChanges(false);
        setShowSuccessMessage(true);
        setShowErrorMessage(false);
        setMessageText('Schedule saved successfully (no tasks to save).');
        setTimeout(() => setShowSuccessMessage(false), 3000);
        return;
      }

      const taskIdMapping: Record<string, string> = {}; // Maps frontend IDs to database UUIDs

      // First pass: Save all parent tasks (phases) to get their real UUIDs
      for (let index = 0; index < allTasksToSave.length; index++) {
        const task = allTasksToSave[index];
        const isNewTask = task.id.startsWith('task-') || task.id.startsWith('phase-') || !task.created_at;

        // Only process parent tasks (phases) in the first pass
        if (isNewTask && task.id.startsWith('phase-')) {
          console.log(`[PHASE ${index + 1}/${allTasksToSave.length}] Processing phase: ${task.name} (ID: ${task.id})`);

          const taskData = {
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: (task.assigned_to || (task as any).assignedTo) === 'TBD' ? undefined : (task.assigned_to || (task as any).assignedTo),
            dueDate: (task.due_date || task.endDate) ? new Date(task.due_date || task.endDate || '').toISOString().split('T')[0] : undefined,
            estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
            workEffort: editableWorkEfforts[task.id] || task.work_effort,
            dependency: editableDependencies[task.id] || task.dependency,
            dependencyType: editableDependencyTypes[task.id] || 'FS',
            lagTime: editableLagTimes[task.id] || 0,
            risks: task.risks,
            issues: task.issues,
            comments: task.comments,
            parentTaskId: undefined, // Phases don't have parents
          };

          // Remove empty string values that cause validation errors
          Object.keys(taskData).forEach(key => {
            if ((taskData as any)[key] === '') {
              (taskData as any)[key] = undefined;
            }
          });

          console.log('=== CREATING PHASE TASK ===');
          console.log('Phase name:', task.name);
          console.log('Phase data being sent:', JSON.stringify(taskData, null, 2));

          try {
            const result = await apiService.createTask(scheduleId, taskData);
            console.log('✅ Created phase task:', task.name, 'Result:', result);

            // Store the mapping from frontend ID to database UUID
            taskIdMapping[task.id] = result.task.id;
            console.log(`Mapped frontend ID ${task.id} to database ID ${result.task.id}`);
          } catch (error) {
            console.error('❌ Failed to create phase task:', task.name, error);
            console.error('Phase data:', taskData);
            throw error;
          }
        }
      }

      // Second pass: Save all subtasks with correct parent IDs
      for (let index = 0; index < allTasksToSave.length; index++) {
        const task = allTasksToSave[index];
        const isNewTask = task.id.startsWith('task-') || task.id.startsWith('phase-') || !task.created_at;

        // Process subtasks and existing tasks in the second pass
        if (isNewTask && task.id.startsWith('task-')) {
          console.log(`[SUBTASK ${index + 1}/${allTasksToSave.length}] Processing subtask: ${task.name} (ID: ${task.id})`);

          // If this task has a parent_task_id, check if we have the real UUID for it
          let parentTaskId = task.parent_task_id;
          if (parentTaskId && taskIdMapping[parentTaskId]) {
            parentTaskId = taskIdMapping[parentTaskId];
            console.log(`Updated parent_task_id from ${task.parent_task_id} to ${parentTaskId}`);
          } else if (parentTaskId) {
            console.warn(`⚠️ Parent task ID ${parentTaskId} not found in mapping. Available mappings:`, Object.keys(taskIdMapping));
          }

          const taskData = {
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: (task.assigned_to || (task as any).assignedTo) === 'TBD' ? undefined : (task.assigned_to || (task as any).assignedTo),
            dueDate: (task.due_date || task.endDate) ? new Date(task.due_date || task.endDate || '').toISOString().split('T')[0] : undefined,
            estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
            workEffort: editableWorkEfforts[task.id] || task.work_effort,
            dependency: editableDependencies[task.id] || task.dependency,
            dependencyType: editableDependencyTypes[task.id] || 'FS',
            lagTime: editableLagTimes[task.id] || 0,
            risks: task.risks,
            issues: task.issues,
            comments: task.comments,
            parentTaskId: parentTaskId,
          };

          // Remove empty string values that cause validation errors
          Object.keys(taskData).forEach(key => {
            if ((taskData as any)[key] === '') {
              (taskData as any)[key] = undefined;
            }
          });

          console.log('=== CREATING SUBTASK ===');
          console.log('Subtask name:', task.name);
          console.log('Subtask data being sent:', JSON.stringify(taskData, null, 2));

          try {
            const result = await apiService.createTask(scheduleId, taskData);
            console.log('✅ Created subtask:', task.name, 'Result:', result);

            // Store the mapping from frontend ID to database UUID
            taskIdMapping[task.id] = result.task.id;
            console.log(`Mapped frontend ID ${task.id} to database ID ${result.task.id}`);
          } catch (error) {
            console.error('❌ Failed to create subtask:', task.name, error);
            console.error('Subtask data:', taskData);
            throw error;
          }
        } else if (!isNewTask) {
          // This is an existing task, update it
          console.log(`[UPDATE ${index + 1}/${allTasksToSave.length}] Processing existing task: ${task.name} (ID: ${task.id})`);

          const updateData = {
            name: task.name,
            description: task.description || '',
            status: task.status,
            priority: task.priority,
            assignedTo: (task.assigned_to || (task as any).assignedTo) === 'TBD' ? undefined : (task.assigned_to || (task as any).assignedTo),
            dueDate: (task.due_date || task.endDate) ? new Date(task.due_date || task.endDate || '').toISOString().split('T')[0] : undefined,
            estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
            workEffort: editableWorkEfforts[task.id] || task.work_effort,
            dependency: editableDependencies[task.id] || task.dependency,
            dependencyType: editableDependencyTypes[task.id] || 'FS',
            lagTime: editableLagTimes[task.id] || 0,
            risks: task.risks,
            issues: task.issues,
            comments: task.comments,
            parentTaskId: task.parent_task_id,
          };

          // Remove empty string values that cause validation errors
          Object.keys(updateData).forEach(key => {
            if ((updateData as any)[key] === '') {
              (updateData as any)[key] = undefined;
            }
          });

          try {
            const result = await apiService.updateTask(scheduleId, task.id, updateData);
            console.log('✅ Updated existing task:', task.name, 'Result:', result);
          } catch (error) {
            console.error('❌ Failed to update task:', task.name, error);
            console.error('Update data:', updateData);
            throw error;
          }
        }
      }

      console.log('✅ All tasks saved successfully');

      setHasUnsavedChanges(false);

      // Invalidate React Query cache to trigger refetch of tasks
      await queryClient.invalidateQueries({ queryKey: ['tasks', scheduleId] });
      await queryClient.invalidateQueries({ queryKey: ['schedules', actualProjectId] });

      // Show success message
      setMessageText(`Schedule saved successfully with ${allTasksToSave.length} tasks!`);
      setShowSuccessMessage(true);
      setShowErrorMessage(false);
      setTimeout(() => setShowSuccessMessage(false), 4000);

      console.log('Schedule saved successfully to database!');
      console.log('Tasks saved:', scheduleTasks.length);
      console.log('Schedule ID:', scheduleId);
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

  const handleTemplateSelection = async (templateData: any) => {
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

    // Create a schedule if one doesn't exist
    let workingSchedule = currentSchedule;
    if (!workingSchedule || currentSchedule?.id || 'default-schedule' === 'default-schedule') {
      console.log('Creating new schedule for template...');
      try {
        const scheduleData = {
          projectId: project?.id || '',
          name: 'Project Schedule',
          description: 'Auto-generated schedule',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        const response = await apiService.createSchedule(scheduleData);
        workingSchedule = response.schedule;
        setCurrentSchedule(workingSchedule);
        console.log('Created new schedule:', workingSchedule);
      } catch (error) {
        console.error('Failed to create schedule:', error);
        setMessageText('Failed to create schedule. Please try again.');
        setShowErrorMessage(true);
        setShowSuccessMessage(false);
        return;
      }
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
            parent_task_id: phaseTask.id, // Link subtask to its parent phase
          };

          subtasks.push(subtask);
        });
      }

      newHierarchy[phaseTask.id] = subtasks;

      // IMPORTANT: Add subtasks to the main tasks array (Microsoft Project style)
      // All tasks (summary and subtasks) should be in scheduleTasks
      // The parent_task_id field indicates the hierarchy
      newTasks.push(...subtasks);
    });

    // Update the schedule with new tasks
    console.log('=== UPDATING SCHEDULE ===');
    console.log('newTasks:', newTasks);
    console.log('newHierarchy:', newHierarchy);
    console.log(`Total tasks (phases + subtasks): ${newTasks.length}`);
    console.log(`Total phases: ${newTasks.filter(t => !t.parent_task_id).length}`);
    console.log(`Total subtasks: ${newTasks.filter(t => t.parent_task_id).length}`);

    // For now, just update the frontend state
    // TODO: Add database persistence later
    console.log('=== TEMPLATE APPLIED (Frontend Only) ===');
    console.log('Note: Tasks added to frontend state. Click "Save Schedule" to persist to database.');

    setScheduleTasks(newTasks);
    setTaskHierarchy(newHierarchy);
    setHasUnsavedChanges(true); // Mark as unsaved since we need to save to DB
    setShowTemplates(false);

    // Show success message
    const addedPhases = newTasks.filter(t => !t.parent_task_id).length - scheduleTasks.filter(t => !t.parent_task_id).length;
    const addedSubtasks = newTasks.filter(t => t.parent_task_id).length - scheduleTasks.filter(t => t.parent_task_id).length;

    if (addedPhases > 0) {
      setMessageText(`Added ${addedPhases} new phase(s) with ${addedSubtasks} subtasks to your schedule!`);
    } else {
      setMessageText(`Schedule updated successfully!`);
    }

    setShowSuccessMessage(true);
    setShowErrorMessage(false); // Clear any error messages
    setTimeout(() => setShowSuccessMessage(false), 4000);

    console.log(`=== TEMPLATE SELECTION COMPLETE ===`);
    console.log(`Generated schedule with ${newTasks.filter(t => !t.parent_task_id).length} phases and ${newTasks.filter(t => t.parent_task_id).length} subtasks`);
    console.log('Selected documents:', selectedDocuments);
  };



  // Helper to convert our tasks to Gantt tasks
  const getGanttTasks = (): GanttTask[] => {
    const allTasks: ScheduleTask[] = [];

    // Add main tasks (phases)
    scheduleTasks.forEach(task => {
      if (!task.parent_task_id) {
        allTasks.push(task);
        // Add subtasks for this phase immediately after
        if (taskHierarchy[task.id]) {
          allTasks.push(...taskHierarchy[task.id]);
        }
      }
    });

    if (allTasks.length === 0) return [];

    return allTasks.map(task => {
      // Get start date with fallback chain
      let startDate = new Date(editableDates[task.id]?.start || task.startDate || task.created_at);

      // Validate start date
      if (isNaN(startDate.getTime())) {
        console.warn(`Invalid start date for task ${task.id}, using current date`);
        startDate = new Date();
      }

      // Get end date with fallback chain
      let endDate = new Date(editableDates[task.id]?.finish || task.endDate || task.due_date || task.created_at);

      // Validate end date
      if (isNaN(endDate.getTime())) {
        console.warn(`Invalid end date for task ${task.id}, using start date + 1 day`);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
      }

      // Ensure end date is after start date (minimum 1 day duration)
      if (endDate <= startDate) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
      }

      // For Day view, ensure tasks have reasonable duration (at least 1 day)
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (duration < 1) {
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
      }

      return {
        start: startDate,
        end: endDate,
        name: task.name,
        id: task.id,
        type: task.parent_task_id ? 'task' : 'project',
        progress: task.progress_percentage || 0,
        isDisabled: false,
        styles: {
          progressColor: task.status === 'completed' ? '#10b981' : '#3b82f6',
          progressSelectedColor: '#2563eb',
        },
        project: task.parent_task_id,
        dependencies: task.dependency ? [task.dependency] : undefined,
        hideChildren: !task.parent_task_id && !expandedTasks[task.id] // Hide children if parent is collapsed
      };
    });
  };

  // Auto-calculate parent phase dates and progress from subtasks
  const updateParentPhaseDates = (parentId: string) => {
    const subtasks = taskHierarchy[parentId] || [];
    if (subtasks.length === 0) return;

    // Find earliest start date and latest end date from subtasks
    const startDates = subtasks.map(t => {
      const date = editableDates[t.id]?.start || t.startDate || t.created_at;
      return new Date(date);
    });
    const endDates = subtasks.map(t => {
      const date = editableDates[t.id]?.finish || t.endDate || t.due_date || t.created_at;
      return new Date(date);
    });

    const minStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxEnd = new Date(Math.max(...endDates.map(d => d.getTime())));

    // Calculate average progress
    const totalProgress = subtasks.reduce((sum, t) => sum + (t.progress_percentage || 0), 0);
    const avgProgress = subtasks.length > 0 ? Math.round(totalProgress / subtasks.length) : 0;

    console.log(`📊 Auto-calculating parent ${parentId}:`, {
      subtaskCount: subtasks.length,
      minStart: minStart.toISOString().split('T')[0],
      maxEnd: maxEnd.toISOString().split('T')[0],
      avgProgress
    });

    // Update parent task dates
    handleDateChange(parentId, 'start', minStart.toISOString().split('T')[0]);
    handleDateChange(parentId, 'finish', maxEnd.toISOString().split('T')[0]);

    // Update parent task progress
    setScheduleTasks(prev => prev.map(t =>
      t.id === parentId ? { ...t, progress_percentage: avgProgress } : t
    ));

    setHasUnsavedChanges(true);
  };

  const handleGanttTaskChange = (task: GanttTask) => {
    console.log("On date change Id:" + task.id);
    // Update date in our state
    handleDateChange(task.id, 'start', task.start.toISOString().split('T')[0]);
    handleDateChange(task.id, 'finish', task.end.toISOString().split('T')[0]);

    // If this is a subtask, auto-update parent phase dates
    if (task.project) {
      console.log(`🔄 Subtask ${task.id} changed, updating parent ${task.project}`);
      // Use setTimeout to ensure state updates have completed
      setTimeout(() => updateParentPhaseDates(task.project!), 100);
    }
  };

  const handleGanttProgressChange = (task: GanttTask) => {
    console.log("On progress change Id:" + task.id);
    setScheduleTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, progress_percentage: task.progress } : t
    ));
    // Also update subtasks in hierarchy
    setTaskHierarchy(prev => {
      const newHierarchy = { ...prev };
      Object.keys(newHierarchy).forEach(key => {
        newHierarchy[key] = newHierarchy[key].map(t =>
          t.id === task.id ? { ...t, progress_percentage: task.progress } : t
        );
      });
      return newHierarchy;
    });
    setHasUnsavedChanges(true);

    // If this is a subtask, auto-update parent phase progress
    if (task.project) {
      console.log(`🔄 Subtask ${task.id} progress changed, updating parent ${task.project}`);
      setTimeout(() => updateParentPhaseDates(task.project!), 100);
    }
  };

  const handleGanttDelete = (task: GanttTask) => {
    const conf = confirm("Are you sure you want to delete " + task.name + "?");
    if (conf) {
      const isSubtask = !!task.project;
      handleDeleteTask(task.id, isSubtask, task.project);
    }
    return conf;
  };

  const handleGanttExpanderClick = (task: GanttTask) => {
    handleTaskToggle(task.id);
    setExpandedTasks(prev => ({
      ...prev,
      [task.id]: !prev[task.id]
    }));
  };

  // Handle double-click on Gantt task to open task details
  const handleGanttDoubleClick = (task: GanttTask) => {
    console.log('Double-clicked task:', task);
    // Find the full task object
    const fullTask = scheduleTasks.find(t => t.id === task.id);
    if (fullTask) {
      handleTaskSelect(fullTask);
    }
  };

  // Handle task selection in Gantt chart
  const handleGanttSelect = (task: GanttTask, isSelected: boolean) => {
    console.log('Task selected:', task.name, 'Selected:', isSelected);
    if (isSelected) {
      const fullTask = scheduleTasks.find(t => t.id === task.id);
      if (fullTask) {
        handleTaskSelect(fullTask);
      }
    }
  };

  // Custom tooltip component for Gantt chart
  const GanttTooltip: React.FC<{
    task: GanttTask;
    fontSize: string;
    fontFamily: string;
  }> = ({ task }) => {
    const fullTask = scheduleTasks.find(t => t.id === task.id);
    const isPhase = !task.project;
    const subtaskCount = isPhase ? (taskHierarchy[task.id]?.length || 0) : 0;

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[250px]">
        <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          {isPhase && <span className="text-blue-600">📋</span>}
          {task.name}
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span className="font-medium">Start:</span>
            <span>{task.start.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">End:</span>
            <span>{task.end.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24))} days</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Progress:</span>
            <span>{task.progress}%</span>
          </div>
          {isPhase && subtaskCount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Subtasks:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {subtaskCount} tasks
              </span>
            </div>
          )}
          {fullTask?.status && (
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${fullTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                fullTask.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  fullTask.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                {fullTask.status}
              </span>
            </div>
          )}
          {fullTask?.assigned_to && fullTask.assigned_to !== 'TBD' && (
            <div className="flex justify-between">
              <span className="font-medium">Assigned:</span>
              <span>{fullTask.assigned_to}</span>
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          💡 Tip: Drag to change dates, resize to adjust duration
        </div>
      </div>
    );
  };

  const loadTestData = () => {
    console.log('Loading test data...');
    // Create mock project
    setProject({
      id: 'test-project',
      code: 'TEST-001',
      name: 'Test Project',
      description: 'A project for testing Gantt features',
      status: 'active',
      priority: 'high',
      category: 'Construction'
    });

    // Create mock schedule
    const mockSchedule: any = {
      id: 'test-schedule',
      project_id: 'test-project',
      name: 'Master Schedule',
      description: 'Test schedule',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'planned',
      created_by: 'tester',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentSchedule(mockSchedule);

    // Create mock tasks
    const today = new Date();
    const task1Start = new Date(today);
    const task1End = new Date(today); task1End.setDate(today.getDate() + 5);

    const task2Start = new Date(today); task2Start.setDate(today.getDate() + 2);
    const task2End = new Date(today); task2End.setDate(today.getDate() + 7);

    const tasks: ScheduleTask[] = [
      // Phase 1
      {
        id: 'phase-1',
        schedule_id: 'test-schedule',
        name: 'Phase 1: Foundation',
        description: 'Initial phase',
        status: 'in_progress',
        priority: 'high',
        start_date: task1Start.toISOString(),
        end_date: task2End.toISOString(),
        progress_percentage: 50,
        created_by: 'tester',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Subtask 1
      {
        id: 'task-1',
        schedule_id: 'test-schedule',
        name: 'Excavation',
        description: 'Digging',
        status: 'completed',
        priority: 'high',
        start_date: task1Start.toISOString(),
        end_date: task1End.toISOString(),
        progress_percentage: 100,
        parent_task_id: 'phase-1',
        created_by: 'tester',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Subtask 2 (Dependent on Task 1)
      {
        id: 'task-2',
        schedule_id: 'test-schedule',
        name: 'Pouring Concrete',
        description: 'Pouring',
        status: 'pending',
        priority: 'high',
        start_date: task2Start.toISOString(),
        end_date: task2End.toISOString(),
        progress_percentage: 0,
        parent_task_id: 'phase-1',
        dependency: 'task-1', // Dependency!
        created_by: 'tester',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setScheduleTasks(tasks);

    // Build hierarchy
    setTaskHierarchy({
      'phase-1': [tasks[1], tasks[2]]
    });

    // Expand phase
    setExpandedTasks({ 'phase-1': true });

    setMessageText('Loaded test data!');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    setIsLoadingSchedule(false);
  };

  // Show loading state while loading project or schedule data
  if ((!project || isLoadingSchedule) && !currentSchedule) { // Modified to allow showing if we have mock data
    console.log('🔄 SchedulePage: Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{!project ? 'Loading project data...' : 'Loading schedule data...'}</p>
          <button
            onClick={loadTestData}
            className="mt-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium border border-yellow-300 hover:bg-yellow-200"
          >
            🧪 Load Test Data (Offline Mode)
          </button>
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
          <button
            onClick={loadTestData}
            className="mt-2 ml-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            🧪 Load Test Data
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
              <button
                onClick={loadTestData}
                className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium border border-yellow-300 hover:bg-yellow-200"
              >
                🧪 Load Test Data
              </button>
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
              <div>scheduleTasks: {JSON.stringify(scheduleTasks.map(t => ({ id: t.id, name: t.name })))}</div>
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
              {/* View Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewType === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setViewType('gantt')}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewType === 'gantt'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Layout className="h-4 w-4" />
                  Gantt
                </button>
              </div>

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
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Schedule: {currentSchedule?.name || 'No Schedule Created'}
              </h3>
              {viewType === 'gantt' && (
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setGanttViewMode(ViewMode.Day)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${ganttViewMode === ViewMode.Day ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                      }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setGanttViewMode(ViewMode.Week)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${ganttViewMode === ViewMode.Week ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                      }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setGanttViewMode(ViewMode.Month)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${ganttViewMode === ViewMode.Month ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                      }`}
                  >
                    Month
                  </button>
                </div>
              )}
            </div>
            <div className="p-6">
              {viewType === 'gantt' && scheduleTasks.length > 0 ? (
                ganttError ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Gantt Chart Error</h3>
                    <p className="text-sm text-red-700 mb-4 text-center max-w-md">
                      {ganttError}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setGanttError(null);
                          setGanttViewMode(ViewMode.Month);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reset to Month View
                      </button>
                      <button
                        onClick={() => {
                          setGanttError(null);
                          setViewType('list');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Switch to List View
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Gantt
                      tasks={getGanttTasks()}
                      viewMode={ganttViewMode}
                      onDateChange={handleGanttTaskChange}
                      onDelete={handleGanttDelete}
                      onProgressChange={handleGanttProgressChange}
                      onExpanderClick={handleGanttExpanderClick}
                      onDoubleClick={handleGanttDoubleClick}
                      onSelect={handleGanttSelect}
                      TooltipContent={GanttTooltip}
                      listCellWidth="155px"
                      columnWidth={
                        ganttViewMode === ViewMode.Day ? 50 :
                          ganttViewMode === ViewMode.Week ? 65 :
                            300 // Month view
                      }
                      barFill={60}
                      ganttHeight={500}
                      barCornerRadius={3}
                      handleWidth={8}
                      arrowColor="#94a3b8"
                      arrowIndent={20}
                      fontSize="14px"
                      fontFamily="Inter, system-ui, sans-serif"
                    />
                  </div>
                )
              ) : (
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
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Progress</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Resource</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Status</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Risks</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Issues</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Comments</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[60px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleTasks.length === 0 ? (
                        <tr>
                          <td colSpan={15} className="border border-gray-300 px-6 py-12 text-center text-gray-500">
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
                        scheduleTasks
                          .filter(task => !task.parent_task_id) // Only show main tasks (phases)
                          .map((task, taskIndex) => {
                            const subtasks = taskHierarchy[task.id] || [];
                            const isExpanded = expandedTasks[task.id] || false;

                            // Debug logging
                            console.log(`Task: ${task.name}, Task ID: ${task.id}, Subtasks: ${subtasks.length}, isExpanded: ${isExpanded}`);
                            console.log('Full expandedTasks state:', expandedTasks);
                            console.log('Full taskHierarchy:', taskHierarchy);
                            console.log('Task hierarchy keys:', Object.keys(taskHierarchy));

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
                                      {subtasks.length > 0 ? (
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Button clicked for task:', task.id);
                                            handleTaskToggle(task.id);
                                          }}
                                          className="h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center border border-gray-300"
                                          title={`${subtasks.length} subtasks - Click to ${isExpanded ? 'collapse' : 'expand'}`}
                                        >
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-blue-600" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-600" />
                                          )}
                                        </button>
                                      ) : (
                                        <div className="h-6 w-6 flex items-center justify-center">
                                          <span className="text-gray-400 text-xs">•</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="cursor-pointer hover:text-blue-600"
                                          onClick={() => handleTaskSelect(task)}
                                        >
                                          {task.name}
                                          {subtasks.length > 0 && (
                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                              {subtasks.length} tasks
                                            </span>
                                          )}
                                        </span>
                                        {task.created_by === 'ai-system' && (
                                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                            🤖 AI
                                          </span>
                                        )}
                                        {task.complexity && (
                                          <span className={`px-2 py-1 text-xs rounded-full ${task.complexity === 'high' ? 'bg-red-100 text-red-800' :
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
                                    <div className="space-y-1">
                                      {/* Dependency Task Selector */}
                                      <select
                                        value={editableDependencies[task.id] || task.dependency || ''}
                                        onChange={(e) => handleDependencyChange(task.id, e.target.value)}
                                        className="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">No dependency</option>
                                        {scheduleTasks
                                          .filter(otherTask => otherTask.id !== task.id && !otherTask.parent_task_id)
                                          .map(otherTask => (
                                            <option key={otherTask.id} value={otherTask.id}>
                                              {otherTask.name}
                                            </option>
                                          ))}
                                      </select>

                                      {/* Dependency Type and Lag Time (only show if dependency is selected) */}
                                      {(editableDependencies[task.id] || task.dependency) && (
                                        <div className="flex gap-1">
                                          <select
                                            value={editableDependencyTypes[task.id] || 'FS'}
                                            onChange={(e) => handleDependencyTypeChange(task.id, e.target.value)}
                                            className="flex-1 border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            title="Dependency Type"
                                          >
                                            <option value="FS">FS</option>
                                            <option value="SS">SS</option>
                                            <option value="FF">FF</option>
                                            <option value="SF">SF</option>
                                          </select>
                                          <input
                                            type="number"
                                            min="0"
                                            max="365"
                                            value={editableLagTimes[task.id] || 0}
                                            onChange={(e) => handleLagTimeChange(task.id, e.target.value)}
                                            className="w-12 border-0 bg-transparent text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="0"
                                            title="Lag Days"
                                          />
                                        </div>
                                      )}
                                    </div>
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
                                    <div className="flex flex-col gap-1">
                                      <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={editableDurations[task.id] || (task.estimated_duration_hours ? (task.estimated_duration_hours / 8).toFixed(1) : task.estimated_days || 1)}
                                        onChange={(e) => handleDurationChange(task.id, e.target.value)}
                                        className="w-full border-0 bg-transparent text-sm"
                                        placeholder="Days"
                                      />
                                      {task.estimated_duration_hours && (
                                        <span className="text-xs text-gray-500">
                                          {task.estimated_duration_hours}h
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={task.progress_percentage || 0}
                                        onChange={(e) => {
                                          const newProgress = parseInt(e.target.value);
                                          setScheduleTasks(prev => prev.map(t =>
                                            t.id === task.id ? { ...t, progress_percentage: newProgress } : t
                                          ));
                                        }}
                                        className="w-16 border-0 bg-transparent text-sm text-center"
                                        placeholder="0"
                                      />
                                      <span className="text-xs text-gray-500">%</span>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.assigned_to || task.assignedResource || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed'
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
                                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                      title="Delete Task"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>

                                {/* Subtasks */}
                                {isExpanded && subtasks.map((subtask, _subtaskIndex) => (
                                  <tr key={subtask.id} className="bg-gray-50 hover:bg-gray-100">
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
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="number"
                                          min="0.1"
                                          step="0.1"
                                          value={editableDurations[subtask.id] || (subtask.estimated_duration_hours ? (subtask.estimated_duration_hours / 8).toFixed(1) : subtask.estimated_days || 1)}
                                          onChange={(e) => handleDurationChange(subtask.id, e.target.value)}
                                          className="w-full border-0 bg-transparent text-sm"
                                          placeholder="Days"
                                        />
                                        {subtask.estimated_duration_hours && (
                                          <span className="text-xs text-gray-500">
                                            {subtask.estimated_duration_hours}h
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={subtask.progress_percentage || 0}
                                          onChange={(e) => {
                                            const newProgress = parseInt(e.target.value);
                                            setScheduleTasks(prev => prev.map(t =>
                                              t.id === subtask.id ? { ...t, progress_percentage: newProgress } : t
                                            ));
                                          }}
                                          className="w-16 border-0 bg-transparent text-sm text-center"
                                          placeholder="0"
                                        />
                                        <span className="text-xs text-gray-500">%</span>
                                      </div>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.assigned_to || subtask.assignedResource || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subtask.status === 'completed'
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
                                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTask(subtask.id, true, task.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Delete Subtask"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
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
              )}
            </div>
          </div>

          {/* Template Selection Modal */}
          {showTemplates && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">🏗️ Project Planning Templates</h3>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-4">
                  <ProjectPlanningTemplates
                    projectCategory={project?.category || ''}
                    onTemplateSelect={handleTemplateSelection}
                    onClose={() => setShowTemplates(false)}
                  />
                </div>
              </div>
            </div>
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