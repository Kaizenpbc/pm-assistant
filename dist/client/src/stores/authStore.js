"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
        error: null
    }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({
        error,
        isLoading: false
    }),
    logout: () => {
        localStorage.removeItem('pm-auth-storage');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
    },
    clearError: () => set({ error: null }),
}), {
    name: 'pm-auth-storage',
    partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
    }),
}));
//# sourceMappingURL=authStore.js.map