"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@testing-library/react");
const vitest_1 = require("vitest");
const ToastNotification_1 = require("../../../components/ToastNotification");
(0, vitest_1.describe)('ToastNotification', () => {
    const mockOnClose = vitest_1.vi.fn();
    beforeEach(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('renders toast notification with message', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Test message", type: "success", onClose: mockOnClose }));
        (0, vitest_1.expect)(react_1.screen.getByText('Test message')).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders success toast with correct styling', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Success message", type: "success", onClose: mockOnClose }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveClass('bg-green-500');
        (0, vitest_1.expect)(react_1.screen.getByText('✓')).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders error toast with correct styling', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Error message", type: "error", onClose: mockOnClose }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveClass('bg-red-500');
        (0, vitest_1.expect)(react_1.screen.getByText('✕')).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders warning toast with correct styling', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Warning message", type: "warning", onClose: mockOnClose }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveClass('bg-yellow-500');
        (0, vitest_1.expect)(react_1.screen.getByText('⚠')).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders info toast with correct styling', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Info message", type: "info", onClose: mockOnClose }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveClass('bg-blue-500');
        (0, vitest_1.expect)(react_1.screen.getByText('ℹ')).toBeInTheDocument();
    });
    (0, vitest_1.it)('calls onClose when close button is clicked', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Test message", type: "success", onClose: mockOnClose }));
        const closeButton = react_1.screen.getByRole('button', { name: /close/i });
        react_1.fireEvent.click(closeButton);
        (0, vitest_1.expect)(mockOnClose).toHaveBeenCalledWith('test-toast');
    });
    (0, vitest_1.it)('auto-closes after duration when autoClose is true', async () => {
        vitest_1.vi.useFakeTimers();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Test message", type: "success", onClose: mockOnClose, autoClose: true, duration: 1000 }));
        (0, vitest_1.expect)(react_1.screen.getByText('Test message')).toBeInTheDocument();
        vitest_1.vi.advanceTimersByTime(1000);
        await (0, react_1.waitFor)(() => {
            (0, vitest_1.expect)(mockOnClose).toHaveBeenCalledWith('test-toast');
        });
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)('does not auto-close when autoClose is false', async () => {
        vitest_1.vi.useFakeTimers();
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Test message", type: "success", onClose: mockOnClose, autoClose: false }));
        (0, vitest_1.expect)(react_1.screen.getByText('Test message')).toBeInTheDocument();
        vitest_1.vi.advanceTimersByTime(5000);
        (0, vitest_1.expect)(mockOnClose).not.toHaveBeenCalled();
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)('renders persistent toast correctly', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Persistent message", type: "info", onClose: mockOnClose, persistent: true }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveClass('bg-blue-500');
        (0, vitest_1.expect)(react_1.screen.getByText('Persistent message')).toBeInTheDocument();
    });
    (0, vitest_1.it)('has proper accessibility attributes', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Test message", type: "success", onClose: mockOnClose }));
        const toast = react_1.screen.getByRole('alert');
        (0, vitest_1.expect)(toast).toHaveAttribute('aria-live', 'polite');
        (0, vitest_1.expect)(toast).toHaveAttribute('aria-atomic', 'true');
    });
    (0, vitest_1.it)('handles long messages correctly', () => {
        const longMessage = 'This is a very long message that should be handled properly by the toast notification component without breaking the layout or causing any issues with the display';
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: longMessage, type: "info", onClose: mockOnClose }));
        (0, vitest_1.expect)(react_1.screen.getByText(longMessage)).toBeInTheDocument();
    });
    (0, vitest_1.it)('renders with custom duration', () => {
        (0, react_1.render)((0, jsx_runtime_1.jsx)(ToastNotification_1.ToastNotification, { id: "test-toast", message: "Custom duration message", type: "success", onClose: mockOnClose, autoClose: true, duration: 3000 }));
        (0, vitest_1.expect)(react_1.screen.getByText('Custom duration message')).toBeInTheDocument();
    });
});
//# sourceMappingURL=ToastNotification.test.js.map