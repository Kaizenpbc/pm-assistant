import { z } from 'zod';

export interface Project {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budgetAllocated?: number;
  budgetSpent: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  category?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  budgetAllocated?: number;
  startDate?: Date;
  endDate?: Date;
  userId: string;
}

export class ProjectService {
  // TODO: Replace with actual database implementation
  private projects: Project[] = [
    {
      id: '1',
      name: 'Anna Regina Infrastructure Development',
      description: 'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities',
      category: 'infrastructure',
      status: 'active',
      priority: 'high',
      budgetAllocated: 5000000,
      budgetSpent: 1750000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-12-31'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Georgetown Smart City Initiative',
      description: 'Implementation of smart city technologies including IoT sensors, data analytics, and digital governance systems',
      category: 'technology',
      status: 'planning',
      priority: 'high',
      budgetAllocated: 8000000,
      budgetSpent: 1200000,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2026-06-30'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Dartmouth Essequibo School Construction',
      description: 'Construction of a new primary school in Dartmouth, Essequibo to serve the local community',
      category: 'education',
      status: 'planning',
      priority: 'high',
      budgetAllocated: 2500000,
      budgetSpent: 0,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findById(id: string, userId: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === id && p.userId === userId);
    return project || null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    return this.projects.filter(project => project.userId === userId);
  }

  async create(data: CreateProjectData): Promise<Project> {
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name,
      description: data.description,
      category: data.category,
      status: data.status || 'planning',
      priority: data.priority || 'medium',
      budgetAllocated: data.budgetAllocated,
      budgetSpent: 0,
      startDate: data.startDate,
      endDate: data.endDate,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.push(project);
    return project;
  }

  async update(id: string, data: Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>, userId: string): Promise<Project | null> {
    const projectIndex = this.projects.findIndex(p => p.id === id && p.userId === userId);
    if (projectIndex === -1) return null;

    this.projects[projectIndex] = {
      ...this.projects[projectIndex],
      ...data,
      updatedAt: new Date(),
    };

    return this.projects[projectIndex];
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const projectIndex = this.projects.findIndex(p => p.id === id && p.userId === userId);
    if (projectIndex === -1) return false;

    this.projects.splice(projectIndex, 1);
    return true;
  }
}
