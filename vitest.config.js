"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const path_1 = require("path");
exports.default = (0, config_1.defineConfig)({
    test: {
        globals: true,
        environment: 'node',
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
                'src/client/dist/',
                'src/client/node_modules/'
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
            '@server': (0, path_1.resolve)(__dirname, './src/server'),
            '@client': (0, path_1.resolve)(__dirname, './src/client'),
            '@shared': (0, path_1.resolve)(__dirname, './src/shared')
        }
    }
});
//# sourceMappingURL=vitest.config.js.map