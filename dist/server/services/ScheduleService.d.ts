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
export declare class ScheduleService {
    private schedules;
    private tasks;
    findByProjectId(projectId: string): Promise<Schedule[]>;
    findById(id: string): Promise<Schedule | null>;
    create(data: CreateScheduleData): Promise<Schedule>;
    update(id: string, data: Partial<Omit<Schedule, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<Schedule | null>;
    delete(id: string): Promise<boolean>;
    findTasksByScheduleId(scheduleId: string): Promise<Task[]>;
    createTask(data: CreateTaskData): Promise<Task>;
    updateTask(id: string, data: Partial<Omit<Task, 'id' | 'scheduleId' | 'createdAt' | 'updatedAt'>>): Promise<Task | null>;
    deleteTask(id: string): Promise<boolean>;
}
//# sourceMappingURL=ScheduleService.d.ts.map