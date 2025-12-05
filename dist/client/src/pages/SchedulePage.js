"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const lucide_react_1 = require("lucide-react");
const ProjectPlanningTemplates_1 = __importDefault(require("../components/ProjectPlanningTemplates"));
const AITaskBreakdown_1 = require("../components/AITaskBreakdown");
const api_1 = require("../services/api");
const EditScheduleForm = ({ schedule, onSave, onCancel }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        name: schedule.name || 'Project Schedule',
        description: schedule.description || 'Auto-generated schedule',
        start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
        end_date: schedule.end_date ? schedule.end_date.split('T')[0] : '',
        status: schedule.status || 'planned'
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedSchedule = {
            ...schedule,
            name: formData.name,
            description: formData.description,
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : schedule.start_date,
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : schedule.end_date,
            status: formData.status,
            updated_at: new Date().toISOString()
        };
        onSave(updatedSchedule);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    return ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Schedule Name" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "name", name: "name", value: formData.name, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter schedule name", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), (0, jsx_runtime_1.jsx)("textarea", { id: "description", name: "description", value: formData.description, onChange: handleChange, rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter schedule description" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "start_date", className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Date" }), (0, jsx_runtime_1.jsx)("input", { type: "date", id: "start_date", name: "start_date", value: formData.start_date, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "end_date", className: "block text-sm font-medium text-gray-700 mb-1", children: "End Date" }), (0, jsx_runtime_1.jsx)("input", { type: "date", id: "end_date", name: "end_date", value: formData.end_date, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "status", className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), (0, jsx_runtime_1.jsxs)("select", { id: "status", name: "status", value: formData.status, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "planned", children: "Planned" }), (0, jsx_runtime_1.jsx)("option", { value: "in_progress", children: "In Progress" }), (0, jsx_runtime_1.jsx)("option", { value: "completed", children: "Completed" }), (0, jsx_runtime_1.jsx)("option", { value: "cancelled", children: "Cancelled" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-3 pt-4", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onCancel, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2", children: "Save Changes" })] })] }));
};
const SchedulePage = () => {
    const { projectId, id } = (0, react_router_dom_1.useParams)();
    const actualProjectId = projectId || id;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const queryClient = (0, react_query_1.useQueryClient)();
    const [project, setProject] = (0, react_1.useState)(null);
    const [currentSchedule, setCurrentSchedule] = (0, react_1.useState)(null);
    const [scheduleTasks, setScheduleTasks] = (0, react_1.useState)([]);
    const [taskHierarchy, setTaskHierarchy] = (0, react_1.useState)({});
    const [expandedTasks, setExpandedTasks] = (0, react_1.useState)({});
    const [editableDates, setEditableDates] = (0, react_1.useState)({});
    const [editableDurations, setEditableDurations] = (0, react_1.useState)({});
    const [editableWorkEfforts, setEditableWorkEfforts] = (0, react_1.useState)({});
    const [editableDependencies, setEditableDependencies] = (0, react_1.useState)({});
    const [editableDependencyTypes, setEditableDependencyTypes] = (0, react_1.useState)({});
    const [editableLagTimes, setEditableLagTimes] = (0, react_1.useState)({});
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = (0, react_1.useState)(false);
    const [showTemplates, setShowTemplates] = (0, react_1.useState)(false);
    const [showSuccessMessage, setShowSuccessMessage] = (0, react_1.useState)(false);
    const [showErrorMessage, setShowErrorMessage] = (0, react_1.useState)(false);
    const [showEditModal, setShowEditModal] = (0, react_1.useState)(false);
    const [messageText, setMessageText] = (0, react_1.useState)('');
    const [showAIBreakdown, setShowAIBreakdown] = (0, react_1.useState)(false);
    const [isLoadingSchedule, setIsLoadingSchedule] = (0, react_1.useState)(false);
    const [loadError] = (0, react_1.useState)(null);
    const { data: projectData } = (0, react_query_1.useQuery)({
        queryKey: ['project', actualProjectId],
        queryFn: () => api_1.apiService.getProject(actualProjectId),
        enabled: !!actualProjectId,
        select: (data) => data.project,
    });
    const { data: schedulesData, isLoading: isLoadingSchedules } = (0, react_query_1.useQuery)({
        queryKey: ['schedules', actualProjectId],
        queryFn: () => api_1.apiService.getSchedules(actualProjectId),
        enabled: !!actualProjectId,
        select: (data) => data.schedules || [],
    });
    (0, react_1.useEffect)(() => {
        if (projectData) {
            setProject(projectData);
        }
        else if (actualProjectId) {
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
    (0, react_1.useEffect)(() => {
        if (!schedulesData || schedulesData.length === 0) {
            setCurrentSchedule(null);
            setIsLoadingSchedule(false);
            return;
        }
        const scheduleToUse = schedulesData[0];
        setCurrentSchedule(scheduleToUse);
    }, [schedulesData]);
    const { data: tasksData, isLoading: isLoadingTasks } = (0, react_query_1.useQuery)({
        queryKey: ['tasks', currentSchedule?.id],
        queryFn: () => api_1.apiService.getTasks(currentSchedule.id),
        enabled: !!currentSchedule?.id,
        select: (data) => data.tasks || [],
    });
    (0, react_1.useEffect)(() => {
        if (isSaving || hasUnsavedChanges) {
            return;
        }
        if (tasksData) {
            const uniqueTasks = tasksData.filter((task, index, self) => index === self.findIndex(t => t.id === task.id));
            console.log('Loaded tasks:', uniqueTasks.length, 'original:', tasksData.length);
            setScheduleTasks(uniqueTasks);
            const hierarchy = {};
            const mainTasks = [];
            const subtasks = [];
            uniqueTasks.forEach((task) => {
                if (!task.parent_task_id) {
                    mainTasks.push(task);
                }
                else {
                    subtasks.push(task);
                }
            });
            setScheduleTasks(mainTasks);
            mainTasks.forEach((mainTask) => {
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
        }
        else if (currentSchedule && !hasUnsavedChanges && !isSaving) {
            setScheduleTasks([]);
            setTaskHierarchy({});
            setIsLoadingSchedule(false);
        }
    }, [tasksData, currentSchedule?.id, isSaving, hasUnsavedChanges]);
    (0, react_1.useEffect)(() => {
        if (isLoadingSchedules) {
            setIsLoadingSchedule(true);
        }
        else if (!schedulesData || schedulesData.length === 0) {
            setIsLoadingSchedule(false);
        }
        else if (currentSchedule) {
            setIsLoadingSchedule(isLoadingTasks);
        }
    }, [isLoadingSchedules, schedulesData, isLoadingTasks, currentSchedule]);
    (0, react_1.useEffect)(() => {
        if (scheduleTasks.length > 0) {
            const initialDates = {};
            const initialDurations = {};
            const initialWorkEfforts = {};
            const initialDependencies = {};
            const initialDependencyTypes = {};
            const initialLagTimes = {};
            scheduleTasks.forEach(task => {
                if (task.startDate)
                    initialDates[task.id] = { start: task.startDate };
                if (task.endDate)
                    initialDates[task.id] = { ...initialDates[task.id], finish: task.endDate };
                if (task.estimated_duration_hours) {
                    initialDurations[task.id] = (task.estimated_duration_hours / 8).toString();
                }
                else if (task.estimated_days) {
                    initialDurations[task.id] = task.estimated_days.toString();
                }
                if (task.work_effort)
                    initialWorkEfforts[task.id] = task.work_effort;
                if (task.dependency)
                    initialDependencies[task.id] = task.dependency;
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
    const handleTaskToggle = (taskId) => {
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
    const handleTaskSelect = (task) => {
        console.log('Task selected:', task);
    };
    const handleDateChange = (taskId, type, value) => {
        setEditableDates(prev => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [type]: value
            }
        }));
        setHasUnsavedChanges(true);
        if (type === 'start') {
            autoCalculateFinishDate(taskId);
        }
        if (type === 'finish') {
            autoCalculateDuration(taskId);
        }
    };
    const handleDurationChange = (taskId, value) => {
        console.log('Duration changed for task:', taskId, 'to:', value);
        setEditableDurations(prev => ({
            ...prev,
            [taskId]: value
        }));
        setHasUnsavedChanges(true);
        autoCalculateFinishDate(taskId);
        const dependentTasks = scheduleTasks.filter(task => editableDependencies[task.id] === taskId || task.dependency === taskId);
        dependentTasks.forEach(dependentTask => {
            recalculateTaskDates(dependentTask.id, taskId);
        });
    };
    const handleWorkEffortChange = (taskId, value) => {
        setEditableWorkEfforts(prev => ({
            ...prev,
            [taskId]: value
        }));
        setHasUnsavedChanges(true);
        autoCalculateFinishDate(taskId);
    };
    const handleDependencyChange = (taskId, value) => {
        setEditableDependencies(prev => ({
            ...prev,
            [taskId]: value
        }));
        setHasUnsavedChanges(true);
        if (value) {
            recalculateTaskDates(taskId, value);
        }
    };
    const handleDependencyTypeChange = (taskId, value) => {
        setEditableDependencyTypes(prev => ({
            ...prev,
            [taskId]: value
        }));
        setHasUnsavedChanges(true);
        const dependencyTaskId = editableDependencies[taskId];
        if (dependencyTaskId) {
            recalculateTaskDates(taskId, dependencyTaskId);
        }
    };
    const handleLagTimeChange = (taskId, value) => {
        const lagDays = parseInt(value) || 0;
        setEditableLagTimes(prev => ({
            ...prev,
            [taskId]: lagDays
        }));
        setHasUnsavedChanges(true);
        const dependencyTaskId = editableDependencies[taskId];
        if (dependencyTaskId) {
            recalculateTaskDates(taskId, dependencyTaskId);
        }
    };
    const recalculateTaskDates = (dependentTaskId, predecessorTaskId) => {
        const predecessorTask = scheduleTasks.find(task => task.id === predecessorTaskId);
        const dependentTask = scheduleTasks.find(task => task.id === dependentTaskId);
        if (!predecessorTask || !dependentTask)
            return;
        const dependencyType = editableDependencyTypes[dependentTaskId] || 'FS';
        const lagDays = editableLagTimes[dependentTaskId] || 0;
        const duration = parseInt(editableDurations[dependentTaskId] || dependentTask.estimated_days?.toString() || '1');
        let newStartDate;
        let newEndDate;
        const predStartDate = editableDates[predecessorTaskId]?.start
            ? new Date(editableDates[predecessorTaskId].start)
            : predecessorTask.startDate
                ? new Date(predecessorTask.startDate)
                : new Date();
        const predEndDate = editableDates[predecessorTaskId]?.finish
            ? new Date(editableDates[predecessorTaskId].finish)
            : predecessorTask.endDate
                ? new Date(predecessorTask.endDate)
                : new Date();
        switch (dependencyType) {
            case 'FS':
                newStartDate = new Date(predEndDate);
                newStartDate.setDate(newStartDate.getDate() + lagDays + 1);
                newEndDate = new Date(newStartDate);
                newEndDate.setDate(newEndDate.getDate() + duration - 1);
                break;
            case 'SS':
                newStartDate = new Date(predStartDate);
                newStartDate.setDate(newStartDate.getDate() + lagDays);
                newEndDate = new Date(newStartDate);
                newEndDate.setDate(newEndDate.getDate() + duration - 1);
                break;
            case 'FF':
                newEndDate = new Date(predEndDate);
                newEndDate.setDate(newEndDate.getDate() + lagDays);
                newStartDate = new Date(newEndDate);
                newStartDate.setDate(newStartDate.getDate() - duration + 1);
                break;
            case 'SF':
                newEndDate = new Date(predStartDate);
                newEndDate.setDate(newEndDate.getDate() + lagDays);
                newStartDate = new Date(newEndDate);
                newStartDate.setDate(newStartDate.getDate() - duration + 1);
                break;
            default:
                return;
        }
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
    const autoCalculateFinishDate = (taskId) => {
        const startDate = editableDates[taskId]?.start;
        const duration = editableDurations[taskId];
        console.log('Auto-calculating finish date for task:', taskId, 'startDate:', startDate, 'duration:', duration);
        let actualStartDate = startDate;
        if (!actualStartDate) {
            const task = scheduleTasks.find(t => t.id === taskId);
            if (task && task.startDate) {
                actualStartDate = task.startDate;
            }
            else {
                actualStartDate = new Date().toISOString().split('T')[0];
            }
        }
        console.log('Actual start date:', actualStartDate);
        if (actualStartDate && duration) {
            const start = new Date(actualStartDate);
            const days = parseInt(duration) || 1;
            const finish = new Date(start);
            finish.setDate(finish.getDate() + days - 1);
            const finishDateStr = finish.toISOString().split('T')[0];
            console.log('Calculated finish date:', finishDateStr, 'from start:', actualStartDate, 'and duration:', days, 'days');
            setEditableDates(prev => ({
                ...prev,
                [taskId]: {
                    ...prev[taskId],
                    start: actualStartDate,
                    finish: finishDateStr
                }
            }));
            setScheduleTasks(prev => prev.map(task => task.id === taskId
                ? { ...task,
                    estimatedDays: parseInt(duration) || 1,
                    startDate: actualStartDate,
                    endDate: finishDateStr
                }
                : task));
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
        }
        else {
            console.log('Cannot calculate finish date - missing startDate or duration');
        }
    };
    const autoCalculateDuration = (taskId) => {
        const startDate = editableDates[taskId]?.start;
        const finishDate = editableDates[taskId]?.finish;
        if (startDate && finishDate) {
            const start = new Date(startDate);
            const finish = new Date(finishDate);
            const diffTime = finish.getTime() - start.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setEditableDurations(prev => ({
                ...prev,
                [taskId]: diffDays.toString()
            }));
            setScheduleTasks(prev => prev.map(task => task.id === taskId
                ? { ...task,
                    estimatedDays: diffDays,
                    startDate: startDate,
                    endDate: finishDate
                }
                : task));
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
    const handleAITasksGenerated = (aiTasks, phases) => {
        console.log('=== AI TASKS GENERATED ===');
        console.log('AI Tasks:', aiTasks);
        console.log('Phases:', phases);
        const convertedTasks = aiTasks.map(task => ({
            id: task.id,
            schedule_id: currentSchedule?.id || 'default-schedule',
            name: task.name,
            description: task.description,
            status: 'pending',
            priority: task.priority,
            estimated_days: task.estimatedDays,
            work_effort: task.estimatedDays?.toString() + ' days',
            dependency: task.dependencies?.join(', '),
            risks: task.riskLevel > 50 ? `High risk task (${task.riskLevel}%)` : undefined,
            comments: `AI-generated task. Category: ${task.category}. Skills: ${task.skills?.join(', ')}`,
            created_by: 'ai-system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            complexity: task.complexity,
            riskLevel: task.riskLevel,
            category: task.category,
            skills: task.skills,
            deliverables: task.deliverables,
            dependencies: task.dependencies
        }));
        if (phases && phases.length > 0) {
            console.log('Creating phase structure...');
            const newTasks = [];
            const newHierarchy = {};
            phases.forEach(phase => {
                const phaseTask = {
                    id: `phase-${phase.id}`,
                    schedule_id: currentSchedule?.id || 'default-schedule',
                    name: phase.name,
                    description: phase.description,
                    status: 'pending',
                    priority: 'medium',
                    estimated_days: phase.estimatedDays,
                    work_effort: phase.estimatedDays?.toString() + ' days',
                    created_by: 'ai-system',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    category: 'Phase',
                    complexity: 'medium',
                    riskLevel: 20
                };
                newTasks.push(phaseTask);
                const phaseTaskIds = phase.tasks.map((t) => t.id);
                const phaseSubtasks = convertedTasks.filter(task => phaseTaskIds.includes(task.id));
                newHierarchy[phaseTask.id] = phaseSubtasks;
            });
            console.log('Phase tasks created:', newTasks);
            console.log('Phase hierarchy:', newHierarchy);
            setScheduleTasks(prev => [...prev, ...newTasks]);
            setTaskHierarchy(prev => ({ ...prev, ...newHierarchy }));
        }
        else {
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
            let scheduleId;
            if (!currentSchedule) {
                if (!project?.id) {
                    console.error('Cannot save schedule: project ID is missing');
                    return;
                }
                const existingSchedules = await api_1.apiService.getSchedules(project.id);
                if (existingSchedules.schedules && existingSchedules.schedules.length > 0) {
                    let scheduleToUse = existingSchedules.schedules[0];
                    let maxTasks = 0;
                    for (const schedule of existingSchedules.schedules) {
                        try {
                            const tasksResponse = await api_1.apiService.getTasks(schedule.id);
                            const taskCount = tasksResponse.tasks ? tasksResponse.tasks.length : 0;
                            if (taskCount > maxTasks) {
                                maxTasks = taskCount;
                                scheduleToUse = schedule;
                            }
                        }
                        catch (error) {
                            console.warn(`Could not load tasks for schedule ${schedule.id}:`, error);
                        }
                    }
                    console.log(`Using existing schedule ${scheduleToUse.id} with ${maxTasks} tasks`);
                    setCurrentSchedule(scheduleToUse);
                    scheduleId = scheduleToUse.id;
                }
                else {
                    const scheduleData = {
                        projectId: project?.id || '',
                        name: 'Project Schedule',
                        description: 'Auto-generated schedule',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    };
                    const response = await api_1.apiService.createSchedule(scheduleData);
                    scheduleId = response.schedule.id;
                    setCurrentSchedule(response.schedule);
                    console.log('Created new schedule:', response.schedule);
                }
            }
            else if (currentSchedule.id === 'default-schedule') {
                const scheduleData = {
                    projectId: project?.id || '',
                    name: currentSchedule.name,
                    description: currentSchedule.description,
                    startDate: currentSchedule.start_date,
                    endDate: currentSchedule.end_date,
                };
                const response = await api_1.apiService.createSchedule(scheduleData);
                scheduleId = response.schedule.id;
                setCurrentSchedule(response.schedule);
                console.log('Created new schedule:', response.schedule);
            }
            else {
                scheduleId = currentSchedule.id;
                const updateData = {
                    name: currentSchedule.name,
                    description: currentSchedule.description,
                    startDate: currentSchedule.start_date,
                    endDate: currentSchedule.end_date,
                };
                await api_1.apiService.updateSchedule(scheduleId, updateData);
                console.log('Updated schedule:', scheduleId);
            }
            console.log('=== DEBUG: STATE BEFORE TASK COLLECTION ===');
            console.log('scheduleTasks:', scheduleTasks);
            console.log('taskHierarchy:', taskHierarchy);
            console.log('taskHierarchy keys:', Object.keys(taskHierarchy));
            console.log('taskHierarchy values:', Object.values(taskHierarchy));
            const allTasksToSave = [...scheduleTasks];
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
            const taskIdMapping = {};
            for (let index = 0; index < allTasksToSave.length; index++) {
                const task = allTasksToSave[index];
                const isNewTask = task.id.startsWith('task-') || task.id.startsWith('phase-') || !task.created_at;
                if (isNewTask && task.id.startsWith('phase-')) {
                    console.log(`[PHASE ${index + 1}/${allTasksToSave.length}] Processing phase: ${task.name} (ID: ${task.id})`);
                    const taskData = {
                        name: task.name,
                        description: task.description || '',
                        status: task.status,
                        priority: task.priority,
                        assignedTo: (task.assigned_to || task.assignedTo) === 'TBD' ? undefined : (task.assigned_to || task.assignedTo),
                        dueDate: (task.due_date || task.endDate) ? new Date(task.due_date || task.endDate || '').toISOString().split('T')[0] : undefined,
                        estimatedDays: task.estimated_days ? Number(task.estimated_days) : undefined,
                        workEffort: editableWorkEfforts[task.id] || task.work_effort,
                        dependency: editableDependencies[task.id] || task.dependency,
                        dependencyType: editableDependencyTypes[task.id] || 'FS',
                        lagTime: editableLagTimes[task.id] || 0,
                        risks: task.risks,
                        issues: task.issues,
                        comments: task.comments,
                        parentTaskId: undefined,
                    };
                    Object.keys(taskData).forEach(key => {
                        if (taskData[key] === '') {
                            taskData[key] = undefined;
                        }
                    });
                    console.log('=== CREATING PHASE TASK ===');
                    console.log('Phase name:', task.name);
                    console.log('Phase data being sent:', JSON.stringify(taskData, null, 2));
                    try {
                        const result = await api_1.apiService.createTask(scheduleId, taskData);
                        console.log('✅ Created phase task:', task.name, 'Result:', result);
                        taskIdMapping[task.id] = result.task.id;
                        console.log(`Mapped frontend ID ${task.id} to database ID ${result.task.id}`);
                    }
                    catch (error) {
                        console.error('❌ Failed to create phase task:', task.name, error);
                        console.error('Phase data:', taskData);
                        throw error;
                    }
                }
            }
            for (let index = 0; index < allTasksToSave.length; index++) {
                const task = allTasksToSave[index];
                const isNewTask = task.id.startsWith('task-') || task.id.startsWith('phase-') || !task.created_at;
                if (isNewTask && task.id.startsWith('task-')) {
                    console.log(`[SUBTASK ${index + 1}/${allTasksToSave.length}] Processing subtask: ${task.name} (ID: ${task.id})`);
                    let parentTaskId = task.parent_task_id;
                    if (parentTaskId && taskIdMapping[parentTaskId]) {
                        parentTaskId = taskIdMapping[parentTaskId];
                        console.log(`Updated parent_task_id from ${task.parent_task_id} to ${parentTaskId}`);
                    }
                    else if (parentTaskId) {
                        console.warn(`⚠️ Parent task ID ${parentTaskId} not found in mapping. Available mappings:`, Object.keys(taskIdMapping));
                    }
                    const taskData = {
                        name: task.name,
                        description: task.description || '',
                        status: task.status,
                        priority: task.priority,
                        assignedTo: (task.assigned_to || task.assignedTo) === 'TBD' ? undefined : (task.assigned_to || task.assignedTo),
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
                    Object.keys(taskData).forEach(key => {
                        if (taskData[key] === '') {
                            taskData[key] = undefined;
                        }
                    });
                    console.log('=== CREATING SUBTASK ===');
                    console.log('Subtask name:', task.name);
                    console.log('Subtask data being sent:', JSON.stringify(taskData, null, 2));
                    try {
                        const result = await api_1.apiService.createTask(scheduleId, taskData);
                        console.log('✅ Created subtask:', task.name, 'Result:', result);
                        taskIdMapping[task.id] = result.task.id;
                        console.log(`Mapped frontend ID ${task.id} to database ID ${result.task.id}`);
                    }
                    catch (error) {
                        console.error('❌ Failed to create subtask:', task.name, error);
                        console.error('Subtask data:', taskData);
                        throw error;
                    }
                }
                else if (!isNewTask) {
                    console.log(`[UPDATE ${index + 1}/${allTasksToSave.length}] Processing existing task: ${task.name} (ID: ${task.id})`);
                    const updateData = {
                        name: task.name,
                        description: task.description || '',
                        status: task.status,
                        priority: task.priority,
                        assignedTo: (task.assigned_to || task.assignedTo) === 'TBD' ? undefined : (task.assigned_to || task.assignedTo),
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
                    Object.keys(updateData).forEach(key => {
                        if (updateData[key] === '') {
                            updateData[key] = undefined;
                        }
                    });
                    try {
                        const result = await api_1.apiService.updateTask(scheduleId, task.id, updateData);
                        console.log('✅ Updated existing task:', task.name, 'Result:', result);
                    }
                    catch (error) {
                        console.error('❌ Failed to update task:', task.name, error);
                        console.error('Update data:', updateData);
                        throw error;
                    }
                }
            }
            console.log('✅ All tasks saved successfully');
            setHasUnsavedChanges(false);
            await queryClient.invalidateQueries({ queryKey: ['tasks', scheduleId] });
            await queryClient.invalidateQueries({ queryKey: ['schedules', actualProjectId] });
            setMessageText(`Schedule saved successfully with ${allTasksToSave.length} tasks!`);
            setShowSuccessMessage(true);
            setShowErrorMessage(false);
            setTimeout(() => setShowSuccessMessage(false), 4000);
            console.log('Schedule saved successfully to database!');
            console.log('Tasks saved:', scheduleTasks.length);
            console.log('Schedule ID:', scheduleId);
        }
        catch (error) {
            console.error('Error saving schedule:', error);
            setMessageText('Failed to save schedule. Please try again.');
            setShowErrorMessage(true);
            setShowSuccessMessage(false);
            setTimeout(() => setShowErrorMessage(false), 4000);
        }
        finally {
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
            await api_1.apiService.deleteSchedule(currentSchedule.id);
            setScheduleTasks([]);
            setTaskHierarchy({});
            setCurrentSchedule(null);
            setHasUnsavedChanges(false);
            console.log('✅ Schedule deleted successfully from database');
        }
        catch (error) {
            console.error('Failed to delete schedule:', error);
            alert('Failed to delete schedule. Please try again.');
        }
    };
    const handleTemplateSelection = async (templateData) => {
        console.log('=== TEMPLATE SELECTION START ===');
        console.log('Template selected:', templateData);
        let template, selectedPhases, selectedDocuments;
        if (templateData.template) {
            ({ template, selectedPhases, selectedDocuments } = templateData);
        }
        else if (templateData.id) {
            template = templateData;
            selectedPhases = templateData.selectedPhases || [];
            selectedDocuments = templateData.selectedDocuments || [];
        }
        else {
            console.error('Invalid template data format:', templateData);
            return;
        }
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
                const response = await api_1.apiService.createSchedule(scheduleData);
                workingSchedule = response.schedule;
                setCurrentSchedule(workingSchedule);
                console.log('Created new schedule:', workingSchedule);
            }
            catch (error) {
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
        const newTasks = [...scheduleTasks];
        const newHierarchy = { ...taskHierarchy };
        let taskCounter = Math.max(1, ...scheduleTasks.map(task => {
            const match = task.id.match(/task-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        })) + 1;
        console.log('Processing selectedPhases:', selectedPhases);
        selectedPhases.forEach((phaseId, index) => {
            console.log(`Processing phase ${index + 1}/${selectedPhases.length}: ${phaseId}`);
            const phase = template.phases.find((p) => p.id === phaseId);
            console.log(`Found phase:`, phase);
            if (!phase) {
                console.warn(`Phase ${phaseId} not found in template`);
                return;
            }
            const existingPhaseId = `phase-${phaseId}`;
            const existingPhase = newTasks.find(task => task.id === existingPhaseId);
            if (existingPhase) {
                console.log(`Phase ${phaseId} already exists in schedule, skipping`);
                return;
            }
            const phaseTask = {
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
            const subtasks = [];
            if (phase.tasks) {
                phase.tasks.forEach((task) => {
                    const subtask = {
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
                        parent_task_id: phaseTask.id,
                    };
                    subtasks.push(subtask);
                });
            }
            newHierarchy[phaseTask.id] = subtasks;
        });
        console.log('=== UPDATING SCHEDULE ===');
        console.log('newTasks:', newTasks);
        console.log('newHierarchy:', newHierarchy);
        console.log(`Total phases: ${newTasks.length}, Total subtasks: ${Object.values(newHierarchy).flat().length}`);
        console.log('=== TEMPLATE APPLIED (Frontend Only) ===');
        console.log('Note: Tasks added to frontend state. Click "Save Schedule" to persist to database.');
        setScheduleTasks(newTasks);
        setTaskHierarchy(newHierarchy);
        setHasUnsavedChanges(true);
        setShowTemplates(false);
        const addedPhases = newTasks.length - scheduleTasks.length;
        const addedTasks = Object.values(newHierarchy).flat().length - Object.values(taskHierarchy).flat().length;
        if (addedPhases > 0) {
            setMessageText(`Added ${addedPhases} new phase(s) with ${addedTasks} tasks to your schedule!`);
        }
        else {
            setMessageText(`Schedule updated successfully!`);
        }
        setShowSuccessMessage(true);
        setShowErrorMessage(false);
        setTimeout(() => setShowSuccessMessage(false), 4000);
        console.log(`=== TEMPLATE SELECTION COMPLETE ===`);
        console.log(`Generated schedule with ${newTasks.length} phases and ${Object.values(newHierarchy).flat().length} tasks`);
        console.log('Selected documents:', selectedDocuments);
    };
    if (!project || isLoadingSchedule) {
        console.log('🔄 SchedulePage: Still loading, showing spinner');
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-4" }), (0, jsx_runtime_1.jsx)("p", { children: !project ? 'Loading project data...' : 'Loading schedule data...' })] }) }));
    }
    if (loadError) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-red-500 text-6xl mb-4", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mb-4", children: loadError }), (0, jsx_runtime_1.jsx)("button", { onClick: () => window.location.reload(), className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700", children: "Retry" })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-white", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white shadow-sm border-b", children: (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between h-16", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => navigate('/dashboard'), className: "flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowLeft, { className: "h-4 w-4" }), (0, jsx_runtime_1.jsx)("span", { children: "Back to Dashboard" })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 w-px bg-gray-300" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", { className: "text-xl font-semibold text-gray-900", children: [project?.name || 'Loading...', " - Schedule"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-gray-500", children: [project?.code || '', " \u2022 ", project?.category || ''] })] })] }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [showSuccessMessage && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-green-800 font-medium", children: messageText })] }) })), showErrorMessage && ((0, jsx_runtime_1.jsx)("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-5 w-5 text-red-600" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-800 font-medium", children: messageText })] }) })), process.env.NODE_ENV === 'development' && ((0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-gray-100 text-xs text-gray-600 space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Debug: showSuccessMessage=", showSuccessMessage.toString(), ", showErrorMessage=", showErrorMessage.toString()] }), (0, jsx_runtime_1.jsxs)("div", { children: ["messageText=\"", messageText, "\""] }), (0, jsx_runtime_1.jsxs)("div", { children: ["scheduleTasks.length=", scheduleTasks.length, ", hasUnsavedChanges=", hasUnsavedChanges.toString()] }), (0, jsx_runtime_1.jsxs)("div", { children: ["scheduleTasks: ", JSON.stringify(scheduleTasks.map(t => ({ id: t.id, name: t.name })))] }), (0, jsx_runtime_1.jsxs)("div", { children: ["showAIBreakdown: ", showAIBreakdown.toString()] }), (0, jsx_runtime_1.jsx)("div", { children: "AI Button should be visible in action bar" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-900", children: "Project Schedule" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Manage project phases, tasks, and timelines" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                console.log('AI Task Breakdown button clicked!');
                                                setShowAIBreakdown(true);
                                            }, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2", style: { backgroundColor: '#7c3aed' }, children: "\uD83E\uDD16 AI Task Breakdown" }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleAddPhases, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }), "Add Phases"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => setShowEditModal(true), disabled: !currentSchedule, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit3, { className: "h-4 w-4" }), "Edit Schedule"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleClearSchedule, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-4 w-4" }), "Clear Schedule"] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSaveSchedule, disabled: isSaving || !hasUnsavedChanges, className: "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed", children: isSaving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }), "Saving..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "h-4 w-4" }), "Save Schedule"] })) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-6 py-4 border-b border-gray-200", children: (0, jsx_runtime_1.jsxs)("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-5 w-5" }), "Schedule: ", currentSchedule?.name || 'No Schedule Created'] }) }), (0, jsx_runtime_1.jsx)("div", { className: "p-6", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "w-full border-collapse border border-gray-300", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { className: "bg-gray-50", children: [(0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Task" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[80px]", children: "Dependency" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Base Start" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Base Finish" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Actual Start" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Projected Finish" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Work Effort" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Duration" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Progress" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Resource" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Risks" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Issues" }), (0, jsx_runtime_1.jsx)("th", { className: "border border-gray-300 px-3 py-2 text-left text-sm font-medium", children: "Comments" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: scheduleTasks.length === 0 ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 13, className: "border border-gray-300 px-6 py-12 text-center text-gray-500", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-12 w-12 text-gray-300" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900", children: "No tasks yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-500 mt-1", children: "Get started by creating your first schedule using the AI Task Breakdown or Add Phases buttons above." })] })] }) }) })) : (scheduleTasks
                                                        .filter(task => !task.parent_task_id)
                                                        .map((task, taskIndex) => {
                                                        const subtasks = taskHierarchy[task.id] || [];
                                                        const isExpanded = expandedTasks[task.id] || false;
                                                        console.log(`Task: ${task.name}, Task ID: ${task.id}, Subtasks: ${subtasks.length}, isExpanded: ${isExpanded}`);
                                                        console.log('Full expandedTasks state:', expandedTasks);
                                                        console.log('Full taskHierarchy:', taskHierarchy);
                                                        console.log('Task hierarchy keys:', Object.keys(taskHierarchy));
                                                        const taskStartDate = new Date();
                                                        taskStartDate.setDate(taskStartDate.getDate() + taskIndex);
                                                        const taskEndDate = new Date(taskStartDate);
                                                        taskEndDate.setDate(taskEndDate.getDate() + (task.estimated_days || 1));
                                                        return ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50", children: [(0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [subtasks.length > 0 ? ((0, jsx_runtime_1.jsx)("button", { onClick: (e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            console.log('Button clicked for task:', task.id);
                                                                                            handleTaskToggle(task.id);
                                                                                        }, className: "h-6 w-6 p-0 hover:bg-gray-100 rounded flex items-center justify-center border border-gray-300", title: `${subtasks.length} subtasks - Click to ${isExpanded ? 'collapse' : 'expand'}`, children: isExpanded ? ((0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { className: "h-4 w-4 text-blue-600" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { className: "h-4 w-4 text-gray-600" })) })) : ((0, jsx_runtime_1.jsx)("div", { className: "h-6 w-6 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 text-xs", children: "\u2022" }) })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "cursor-pointer hover:text-blue-600", onClick: () => handleTaskSelect(task), children: [task.name, subtasks.length > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full", children: [subtasks.length, " tasks"] }))] }), task.created_by === 'ai-system' && ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full", children: "\uD83E\uDD16 AI" })), task.complexity && ((0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 text-xs rounded-full ${task.complexity === 'high' ? 'bg-red-100 text-red-800' :
                                                                                                    task.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                                                        'bg-green-100 text-green-800'}`, children: task.complexity })), task.riskLevel && task.riskLevel > 50 && ((0, jsx_runtime_1.jsxs)("span", { className: "px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full", children: ["\u26A0\uFE0F ", task.riskLevel, "%"] }))] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("select", { value: editableDependencies[task.id] || task.dependency || '', onChange: (e) => handleDependencyChange(task.id, e.target.value), className: "w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "No dependency" }), scheduleTasks
                                                                                                .filter(otherTask => otherTask.id !== task.id && !otherTask.parent_task_id)
                                                                                                .map(otherTask => ((0, jsx_runtime_1.jsx)("option", { value: otherTask.id, children: otherTask.name }, otherTask.id)))] }), (editableDependencies[task.id] || task.dependency) && ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsxs)("select", { value: editableDependencyTypes[task.id] || 'FS', onChange: (e) => handleDependencyTypeChange(task.id, e.target.value), className: "flex-1 border-0 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-blue-500", title: "Dependency Type", children: [(0, jsx_runtime_1.jsx)("option", { value: "FS", children: "FS" }), (0, jsx_runtime_1.jsx)("option", { value: "SS", children: "SS" }), (0, jsx_runtime_1.jsx)("option", { value: "FF", children: "FF" }), (0, jsx_runtime_1.jsx)("option", { value: "SF", children: "SF" })] }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "365", value: editableLagTimes[task.id] || 0, onChange: (e) => handleLagTimeChange(task.id, e.target.value), className: "w-12 border-0 bg-transparent text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500", placeholder: "0", title: "Lag Days" })] }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: editableDates[task.id]?.start || taskStartDate.toISOString().split('T')[0], onChange: (e) => handleDateChange(task.id, 'start', e.target.value), className: "w-full border-0 bg-transparent text-sm" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: editableDates[task.id]?.finish || taskEndDate.toISOString().split('T')[0], onChange: (e) => handleDateChange(task.id, 'finish', e.target.value), className: "w-full border-0 bg-transparent text-sm" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.actualStartDate ? new Date(task.actualStartDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.projectedFinishDate ? new Date(task.projectedFinishDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "text", value: editableWorkEfforts[task.id] || task.work_effort || '', onChange: (e) => handleWorkEffortChange(task.id, e.target.value), className: "w-full border-0 bg-transparent text-sm", placeholder: "e.g., 8 hours/day" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0.1", step: "0.1", value: editableDurations[task.id] || (task.estimated_duration_hours ? (task.estimated_duration_hours / 8).toFixed(1) : task.estimated_days || 1), onChange: (e) => handleDurationChange(task.id, e.target.value), className: "w-full border-0 bg-transparent text-sm", placeholder: "Days" }), task.estimated_duration_hours && ((0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: [task.estimated_duration_hours, "h"] }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", value: task.progress_percentage || 0, onChange: (e) => {
                                                                                            const newProgress = parseInt(e.target.value);
                                                                                            setScheduleTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress_percentage: newProgress } : t));
                                                                                        }, className: "w-16 border-0 bg-transparent text-sm text-center", placeholder: "0" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500", children: "%" })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.assigned_to || task.assignedResource || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status === 'completed'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : task.status === 'in_progress'
                                                                                        ? 'bg-blue-100 text-blue-800'
                                                                                        : 'bg-gray-100 text-gray-800'}`, children: task.status || 'pending' }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.risks || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.issues || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: task.comments || '-' })] }), isExpanded && subtasks.map((subtask, subtaskIndex) => ((0, jsx_runtime_1.jsxs)("tr", { className: "bg-gray-50 hover:bg-gray-100", children: [(0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 pl-8", children: (0, jsx_runtime_1.jsx)("span", { className: "cursor-pointer hover:text-blue-600", onClick: () => handleTaskSelect(subtask), children: subtask.name }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.dependency || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: editableDates[subtask.id]?.start || new Date().toISOString().split('T')[0], onChange: (e) => handleDateChange(subtask.id, 'start', e.target.value), className: "w-full border-0 bg-transparent text-sm" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "date", value: editableDates[subtask.id]?.finish || new Date().toISOString().split('T')[0], onChange: (e) => handleDateChange(subtask.id, 'finish', e.target.value), className: "w-full border-0 bg-transparent text-sm" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.actualStartDate ? new Date(subtask.actualStartDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.projectedFinishDate ? new Date(subtask.projectedFinishDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("input", { type: "text", value: editableWorkEfforts[subtask.id] || subtask.work_effort || '', onChange: (e) => handleWorkEffortChange(subtask.id, e.target.value), className: "w-full border-0 bg-transparent text-sm", placeholder: "e.g., 8 hours/day" }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0.1", step: "0.1", value: editableDurations[subtask.id] || (subtask.estimated_duration_hours ? (subtask.estimated_duration_hours / 8).toFixed(1) : subtask.estimated_days || 1), onChange: (e) => handleDurationChange(subtask.id, e.target.value), className: "w-full border-0 bg-transparent text-sm", placeholder: "Days" }), subtask.estimated_duration_hours && ((0, jsx_runtime_1.jsxs)("span", { className: "text-xs text-gray-500", children: [subtask.estimated_duration_hours, "h"] }))] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "100", value: subtask.progress_percentage || 0, onChange: (e) => {
                                                                                            const newProgress = parseInt(e.target.value);
                                                                                            setScheduleTasks(prev => prev.map(t => t.id === subtask.id ? { ...t, progress_percentage: newProgress } : t));
                                                                                        }, className: "w-16 border-0 bg-transparent text-sm text-center", placeholder: "0" }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-gray-500", children: "%" })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.assigned_to || subtask.assignedResource || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subtask.status === 'completed'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : subtask.status === 'in_progress'
                                                                                        ? 'bg-blue-100 text-blue-800'
                                                                                        : 'bg-gray-100 text-gray-800'}`, children: subtask.status || 'pending' }) }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.risks || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.issues || '-' }), (0, jsx_runtime_1.jsx)("td", { className: "border border-gray-300 px-3 py-2 text-sm", children: subtask.comments || '-' })] }, subtask.id)))] }, task.id));
                                                    })) })] }) }) })] }), showTemplates && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-200 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900", children: "\uD83C\uDFD7\uFE0F Project Planning Templates" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowTemplates(false), className: "text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)(ProjectPlanningTemplates_1.default, { projectCategory: project?.category || '', onTemplateSelect: handleTemplateSelection, onClose: () => setShowTemplates(false) }) })] }) })), showAIBreakdown && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-200 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900", children: "\uD83E\uDD16 AI Task Breakdown" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowAIBreakdown(false), className: "text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)(AITaskBreakdown_1.AITaskBreakdown, { onTasksGenerated: handleAITasksGenerated, projectId: project?.id, existingDescription: project?.description || '', projectName: project?.name || '', projectCode: project?.code || '', projectStatus: project?.status || '' }) })] }) })), showEditModal && currentSchedule && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-gray-200 flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900", children: "Edit Schedule Details" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowEditModal(false), className: "text-gray-400 hover:text-gray-600", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4", children: (0, jsx_runtime_1.jsx)(EditScheduleForm, { schedule: currentSchedule, onSave: (updatedSchedule) => {
                                                setCurrentSchedule(updatedSchedule);
                                                setShowEditModal(false);
                                                setHasUnsavedChanges(true);
                                            }, onCancel: () => setShowEditModal(false) }) })] }) }))] }) })] }));
};
exports.default = SchedulePage;
//# sourceMappingURL=SchedulePage.js.map