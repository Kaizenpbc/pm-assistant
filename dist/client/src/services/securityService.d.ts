declare class SecurityService {
    private config;
    constructor();
    private getSecurityConfig;
    generateCSP(): string;
    generatePermissionsPolicy(): string;
    validateSecurityHeaders(): {
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    };
    logSecurityInfo(): void;
    sanitizeInput(input: string): string;
    validateUrl(url: string): boolean;
    isSecureContext(): boolean;
    getSecurityRecommendations(): string[];
    generateSecurityMetaTags(): string;
}
export declare const securityService: SecurityService;
export {};
//# sourceMappingURL=securityService.d.ts.map