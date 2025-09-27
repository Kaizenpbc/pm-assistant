"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
const vitest_1 = require("vitest");
const server_1 = require("./mocks/server");
(0, vitest_1.beforeAll)(() => {
    server_1.server.listen({ onUnhandledRequest: 'error' });
});
(0, vitest_1.afterEach)(() => {
    server_1.server.resetHandlers();
});
(0, vitest_1.afterAll)(() => {
    server_1.server.close();
});
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
        register: vi.fn().mockResolvedValue({
            installing: null,
            waiting: null,
            active: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }),
    },
});
const mockIndexedDB = {
    open: vi.fn().mockReturnValue({
        result: {
            createObjectStore: vi.fn(),
            transaction: vi.fn(),
        },
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
    }),
};
Object.defineProperty(window, 'indexedDB', {
    writable: true,
    value: mockIndexedDB,
});
//# sourceMappingURL=setup.js.map