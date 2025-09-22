export interface ErrorInfo {
    message: string;
    stack?: string;
    timestamp: string;
    userAgent: string;
    url: string;
}
export declare class ErrorService {
    private errors;
    reportError(error: Error, _context?: string): void;
    getErrors(): ErrorInfo[];
    clearErrors(): void;
    getErrorCount(): number;
}
export declare const errorService: ErrorService;
//# sourceMappingURL=errorService.d.ts.map