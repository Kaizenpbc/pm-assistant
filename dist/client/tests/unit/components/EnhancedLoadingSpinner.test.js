"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const EnhancedLoadingSpinner_1 = require("../../../components/EnhancedLoadingSpinner");
(0, vitest_1.describe)('EnhancedLoadingSpinner', () => {
    (0, vitest_1.it)('renders with default props', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, {}));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toBeInTheDocument();
        (0, vitest_1.expect)(spinner).toHaveAttribute('aria-label', 'Loading...');
    });
    (0, vitest_1.it)('renders with custom message', () => {
        const message = 'Loading your projects...';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { message: message }));
        (0, vitest_1.expect)(react_1.screen.getByText(message)).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders minimal variant correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { variant: "minimal" }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveClass('w-4', 'h-4');
    });
    (0, vitest_1.it)('renders default variant correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { variant: "default" }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveClass('w-6', 'h-6');
    });
    (0, vitest_1.it)('renders detailed variant correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { variant: "detailed" }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveClass('w-8', 'h-8');
    });
    (0, vitest_1.it)('renders large size correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { size: "large" }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveClass('w-12', 'h-12');
    });
    (0, vitest_1.it)('shows progress bar when showProgress is true', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { showProgress: true, progress: 50 }));
        const progressBar = react_1.screen.getByRole('progressbar');
        (0, vitest_1.expect)(progressBar).toBeInTheDocument();
        (0, vitest_1.expect)(progressBar).toHaveAttribute('aria-valuenow', '50');
        (0, vitest_1.expect)(progressBar).toHaveAttribute('aria-valuemin', '0');
        (0, vitest_1.expect)(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
    (0, vitest_1.it)('does not show progress bar when showProgress is false', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { showProgress: false }));
        (0, vitest_1.expect)(react_1.screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    (0, vitest_1.it)('applies custom className', () => {
        const customClass = 'custom-spinner-class';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { className: customClass }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveClass(customClass);
    });
    (0, vitest_1.it)('has proper accessibility attributes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { message: "Loading data..." }));
        const spinner = react_1.screen.getByRole('status', { hidden: true });
        (0, vitest_1.expect)(spinner).toHaveAttribute('aria-live', 'polite');
        (0, vitest_1.expect)(spinner).toHaveAttribute('aria-label', 'Loading...');
    });
    (0, vitest_1.it)('displays progress percentage when progress is provided', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { showProgress: true, progress: 75 }));
        (0, vitest_1.expect)(react_1.screen.getByText('75%')).toBeInTheDocument();
    });
    (0, vitest_1.it)('handles edge case progress values', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { showProgress: true, progress: 0 }));
        const progressBar = react_1.screen.getByRole('progressbar');
        (0, vitest_1.expect)(progressBar).toHaveAttribute('aria-valuenow', '0');
        (0, vitest_1.expect)(react_1.screen.getByText('0%')).toBeInTheDocument();
    });
    (0, vitest_1.it)('handles maximum progress value', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(EnhancedLoadingSpinner_1.EnhancedLoadingSpinner, { showProgress: true, progress: 100 }));
        const progressBar = react_1.screen.getByRole('progressbar');
        (0, vitest_1.expect)(progressBar).toHaveAttribute('aria-valuenow', '100');
        (0, vitest_1.expect)(react_1.screen.getByText('100%')).toBeInTheDocument();
    });
});
//# sourceMappingURL=EnhancedLoadingSpinner.test.js.map