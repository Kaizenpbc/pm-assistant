import { z } from 'zod';

export interface Schedule {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    status: 'pending' | 'active' | 'completed' | 'on_hold' | 'cancelled';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Task {
    id: string;
    scheduleId: string;
    name: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    dueDate?: Date;
    estimatedDays?: number;
    estimatedDurationHours?: number;
    actualDurationHours?: number;
    startDate?: Date;
    endDate?: Date;
    progressPercentage?: number;
    workEffort?: string;
    dependency?: string;
    risks?: string;
    issues?: string;
    comments?: string;
    parentTaskId?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateScheduleData {
    projectId: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
}

export interface CreateTaskData {
    scheduleId: string;
    name: string;
    description?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;
    dueDate?: Date;
    estimatedDays?: number;
    estimatedDurationHours?: number;
    actualDurationHours?: number;
    startDate?: Date;
    endDate?: Date;
    progressPercentage?: number;
    workEffort?: string;
    dependency?: string;
    risks?: string;
    issues?: string;
    comments?: string;
    parentTaskId?: string;
    createdBy: string;
}

export class ScheduleService {
    // Mock Data Store
    private schedules: Schedule[] = [
        {
            id: 'sch-1',
            projectId: '3', // Dartmouth Project
            name: 'Main Construction Schedule',
            description: 'Primary construction timeline for Dartmouth School',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2025-12-31'),
            status: 'active',
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    private tasks: Task[] = [
        // Phase 1: Planning & Design
        {
            id: 'task-1',
            scheduleId: 'sch-1',
            name: 'Phase 1: Planning & Design',
            description: 'Initial planning and architectural design phase',
            status: 'completed',
            priority: 'high',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-08-30'),
            progressPercentage: 100,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-1-1',
            scheduleId: 'sch-1',
            parentTaskId: 'task-1',
            name: 'Project Initiation',
            description: 'Project charter and stakeholder identification',
            status: 'completed',
            priority: 'high',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-06-15'),
            progressPercentage: 100,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-1-2',
            scheduleId: 'sch-1',
            parentTaskId: 'task-1',
            name: 'Site Analysis & Survey',
            description: 'Topographical survey and soil testing',
            status: 'completed',
            priority: 'high',
            startDate: new Date('2024-06-16'),
            endDate: new Date('2024-07-15'),
            progressPercentage: 100,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-1-3',
            scheduleId: 'sch-1',
            parentTaskId: 'task-1',
            name: 'Architectural Drawings',
            description: 'Detailed architectural plans and blueprints',
            status: 'completed',
            priority: 'high',
            startDate: new Date('2024-07-16'),
            endDate: new Date('2024-08-30'),
            progressPercentage: 100,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Phase 2: Procurement
        {
            id: 'task-2',
            scheduleId: 'sch-1',
            name: 'Phase 2: Procurement',
            description: 'Sourcing materials and contractor selection',
            status: 'in_progress',
            priority: 'high',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-10-31'),
            progressPercentage: 60,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-2-1',
            scheduleId: 'sch-1',
            parentTaskId: 'task-2',
            name: 'Tender Process',
            description: 'Publishing tenders and evaluating bids',
            status: 'completed',
            priority: 'high',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-09-30'),
            progressPercentage: 100,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-2-2',
            scheduleId: 'sch-1',
            parentTaskId: 'task-2',
            name: 'Material Procurement',
            description: 'Ordering steel, cement, and other core materials',
            status: 'in_progress',
            priority: 'medium',
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-10-31'),
            progressPercentage: 40,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Phase 3: Construction
        {
            id: 'task-3',
            scheduleId: 'sch-1',
            name: 'Phase 3: Construction',
            description: 'Main construction activities',
            status: 'pending',
            priority: 'urgent',
            startDate: new Date('2024-11-01'),
            endDate: new Date('2025-10-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-3-1',
            scheduleId: 'sch-1',
            parentTaskId: 'task-3',
            name: 'Foundation Work',
            description: 'Excavation and foundation laying',
            status: 'pending',
            priority: 'urgent',
            startDate: new Date('2024-11-01'),
            endDate: new Date('2025-01-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-3-2',
            scheduleId: 'sch-1',
            parentTaskId: 'task-3',
            name: 'Structural Framework',
            description: 'Erecting columns, beams, and slabs',
            status: 'pending',
            priority: 'high',
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-05-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-3-3',
            scheduleId: 'sch-1',
            parentTaskId: 'task-3',
            name: 'Roofing & Cladding',
            description: 'Installation of roof and external walls',
            status: 'pending',
            priority: 'medium',
            startDate: new Date('2025-06-01'),
            endDate: new Date('2025-08-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-3-4',
            scheduleId: 'sch-1',
            parentTaskId: 'task-3',
            name: 'Interior Finishing',
            description: 'Flooring, painting, and fixtures',
            status: 'pending',
            priority: 'medium',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-10-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },

        // Phase 4: Completion
        {
            id: 'task-4',
            scheduleId: 'sch-1',
            name: 'Phase 4: Completion',
            description: 'Final inspection and handover',
            status: 'pending',
            priority: 'high',
            startDate: new Date('2025-11-01'),
            endDate: new Date('2025-12-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-4-1',
            scheduleId: 'sch-1',
            parentTaskId: 'task-4',
            name: 'Quality Inspection',
            description: 'Final quality checks and snag list',
            status: 'pending',
            priority: 'high',
            startDate: new Date('2025-11-01'),
            endDate: new Date('2025-11-30'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'task-4-2',
            scheduleId: 'sch-1',
            parentTaskId: 'task-4',
            name: 'Project Handover',
            description: 'Final documentation and key handover',
            status: 'pending',
            priority: 'high',
            startDate: new Date('2025-12-01'),
            endDate: new Date('2025-12-31'),
            progressPercentage: 0,
            createdBy: 'admin-001',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    async findByProjectId(projectId: string): Promise<Schedule[]> {
        return this.schedules.filter(s => s.projectId === projectId);
    }

    async findById(id: string): Promise<Schedule | null> {
        return this.schedules.find(s => s.id === id) || null;
    }

    async create(data: CreateScheduleData): Promise<Schedule> {
        const schedule: Schedule = {
            id: Math.random().toString(36).substr(2, 9),
            projectId: data.projectId,
            name: data.name,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            status: 'active',
            createdBy: data.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.schedules.push(schedule);
        return schedule;
    }

    async update(id: string, data: Partial<Omit<Schedule, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<Schedule | null> {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index === -1) return null;

        this.schedules[index] = {
            ...this.schedules[index],
            ...data,
            updatedAt: new Date(),
        };

        return this.schedules[index];
    }

    async delete(id: string): Promise<boolean> {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index === -1) return false;

        // Delete schedule
        this.schedules.splice(index, 1);

        // Delete associated tasks
        this.tasks = this.tasks.filter(t => t.scheduleId !== id);

        return true;
    }

    // Task Methods
    async findTasksByScheduleId(scheduleId: string): Promise<Task[]> {
        return this.tasks.filter(t => t.scheduleId === scheduleId);
    }

    async createTask(data: CreateTaskData): Promise<Task> {
        const task: Task = {
            id: Math.random().toString(36).substr(2, 9),
            scheduleId: data.scheduleId,
            name: data.name,
            description: data.description,
            status: data.status || 'pending',
            priority: data.priority || 'medium',
            assignedTo: data.assignedTo,
            dueDate: data.dueDate,
            estimatedDays: data.estimatedDays,
            estimatedDurationHours: data.estimatedDurationHours,
            actualDurationHours: data.actualDurationHours,
            startDate: data.startDate,
            endDate: data.endDate,
            progressPercentage: data.progressPercentage || 0,
            workEffort: data.workEffort,
            dependency: data.dependency,
            risks: data.risks,
            issues: data.issues,
            comments: data.comments,
            parentTaskId: data.parentTaskId,
            createdBy: data.createdBy,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.tasks.push(task);
        return task;
    }

    async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return null;

        this.tasks[index] = {
            ...this.tasks[index],
            ...data,
            updatedAt: new Date(),
        };

        return this.tasks[index];
    }

    async deleteTask(id: string): Promise<boolean> {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return false;

        this.tasks.splice(index, 1);
        return true;
    }
}
