export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: 'admin' | 'manager' | 'user';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateUserData {
    username: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role?: 'admin' | 'manager' | 'user';
}
export declare class UserService {
    private users;
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserData): Promise<User>;
    update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
    list(): Promise<User[]>;
}
//# sourceMappingURL=UserService.d.ts.map