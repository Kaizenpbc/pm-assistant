export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'user';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budgetAllocated?: number;
  budgetSpent: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  budgetAllocated?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
