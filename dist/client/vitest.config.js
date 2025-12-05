"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                'tests/',
                '**/*.d.ts',
                '**/*.config.*',
                'public/',
                'src/main.tsx'
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80
                }
            }
        },
        testTimeout: 10000,
        hookTimeout: 10000
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, './src'),
            '@components': (0, path_1.resolve)(__dirname, './src/components'),
            '@services': (0, path_1.resolve)(__dirname, './src/services'),
            '@pages': (0, path_1.resolve)(__dirname, './src/pages'),
            '@utils': (0, path_1.resolve)(__dirname, './src/utils'),
            '@types': (0, path_1.resolve)(__dirname, './src/types')
        }
    }
});
//# sourceMappingURL=vitest.config.js.map