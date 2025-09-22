"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const react_query_1 = require("@tanstack/react-query");
const App_1 = __importDefault(require("./App"));
require("./index.css");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            retry: (failureCount, error) => {
                if (error?.response?.status === 401) {
                    return false;
                }
                return failureCount < 3;
            },
        },
    },
});
client_1.default.createRoot(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(react_query_1.QueryClientProvider, { client: queryClient, children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }) }));
//# sourceMappingURL=main.js.map