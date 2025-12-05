"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorService = exports.ErrorService = void 0;
class ErrorService {
    errors = [];
    reportError(error, _context) {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
        this.errors.push(errorInfo);
        if (process.env.NODE_ENV === 'development') {
            console.error('Error reported:', errorInfo);
        }
    }
    getErrors() {
        return [...this.errors];
    }
    clearErrors() {
        this.errors = [];
    }
    getErrorCount() {
        return this.errors.length;
    }
}
exports.ErrorService = ErrorService;
exports.errorService = new ErrorService();
//# sourceMappingURL=errorService.js.map