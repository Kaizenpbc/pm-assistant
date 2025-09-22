"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
class UserService {
    users = [
        {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QZqK2K',
            fullName: 'Administrator',
            role: 'admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    async findById(id) {
        return this.users.find(user => user.id === id) || null;
    }
    async findByUsername(username) {
        return this.users.find(user => user.username === username) || null;
    }
    async findByEmail(email) {
        return this.users.find(user => user.email === email) || null;
    }
    async create(data) {
        const user = {
            id: Math.random().toString(36).substr(2, 9),
            username: data.username,
            email: data.email,
            passwordHash: data.passwordHash,
            fullName: data.fullName,
            role: data.role || 'user',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.push(user);
        return user;
    }
    async update(id, data) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1)
            return null;
        this.users[userIndex] = {
            ...this.users[userIndex],
            ...data,
            updatedAt: new Date(),
        };
        return this.users[userIndex];
    }
    async delete(id) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1)
            return false;
        this.users.splice(userIndex, 1);
        return true;
    }
    async list() {
        return this.users;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map