"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
class ProjectService {
    projects = [
        {
            id: '1',
            name: 'Anna Regina Infrastructure Development',
            description: 'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities',
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
    ];
    async findById(id, userId) {
        const project = this.projects.find(p => p.id === id && p.userId === userId);
        return project || null;
    }
    async findByUserId(userId) {
        return this.projects.filter(project => project.userId === userId);
    }
    async create(data) {
        const project = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name,
            description: data.description,
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
    async update(id, data, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === id && p.userId === userId);
        if (projectIndex === -1)
            return null;
        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...data,
            updatedAt: new Date(),
        };
        return this.projects[projectIndex];
    }
    async delete(id, userId) {
        const projectIndex = this.projects.findIndex(p => p.id === id && p.userId === userId);
        if (projectIndex === -1)
            return false;
        this.projects.splice(projectIndex, 1);
        return true;
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=ProjectService.js.map