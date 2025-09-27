"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityService = void 0;
class SecurityService {
    config;
    constructor() {
        this.config = this.getSecurityConfig();
    }
    getSecurityConfig() {
        const isDevelopment = import.meta.env.DEV;
        const baseUrl = window.location.origin;
        const apiUrl = isDevelopment ? 'http://localhost:3001' : `${baseUrl}/api`;
        const wsUrl = isDevelopment ? 'ws://localhost:3000' : `wss://${window.location.host}`;
        return {
            isDevelopment,
            baseUrl,
            apiUrl,
            wsUrl
        };
    }
    generateCSP() {
        const { isDevelopment, baseUrl, apiUrl, wsUrl } = this.config;
        const directives = [
            `default-src 'self'`,
            `script-src 'self'${isDevelopment ? " 'unsafe-eval' 'unsafe-inline'" : ''}`,
            `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
            `font-src 'self' https://fonts.gstatic.com`,
            `img-src 'self' data: blob: https:`,
            `connect-src 'self' ${isDevelopment ? `${apiUrl} ${wsUrl}` : apiUrl}`,
            `media-src 'self'`,
            `object-src 'none'`,
            `frame-src 'none'`,
            `base-uri 'self'`,
            `form-action 'self'`,
            ...(isDevelopment ? [] : ['upgrade-insecure-requests'])
        ];
        return directives.join('; ');
    }
    generatePermissionsPolicy() {
        return [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'interest-cohort=()',
            'payment=()',
            'usb=()',
            'accelerometer=()',
            'gyroscope=()',
            'magnetometer=()'
        ].join(', ');
    }
    validateSecurityHeaders() {
        const issues = [];
        const recommendations = [];
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            issues.push('Missing Content Security Policy meta tag');
        }
        const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
        if (!frameOptions) {
            issues.push('Missing X-Frame-Options meta tag');
        }
        const contentTypeOptions = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
        if (!contentTypeOptions) {
            issues.push('Missing X-Content-Type-Options meta tag');
        }
        if (!this.config.isDevelopment && window.location.protocol !== 'https:') {
            issues.push('Application should use HTTPS in production');
        }
        if (this.config.isDevelopment) {
            recommendations.push('Enable secure cookies in production');
        }
        return {
            isValid: issues.length === 0,
            issues,
            recommendations
        };
    }
    logSecurityInfo() {
        const validation = this.validateSecurityHeaders();
        console.group('🔒 Security Configuration');
        console.log('Environment:', this.config.isDevelopment ? 'Development' : 'Production');
        console.log('Base URL:', this.config.baseUrl);
        console.log('API URL:', this.config.apiUrl);
        console.log('Protocol:', window.location.protocol);
        console.log('CSP:', this.generateCSP());
        console.log('Security Valid:', validation.isValid);
        if (validation.issues.length > 0) {
            console.warn('Security Issues:', validation.issues);
        }
        if (validation.recommendations.length > 0) {
            console.info('Recommendations:', validation.recommendations);
        }
        console.groupEnd();
    }
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    validateUrl(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.origin === window.location.origin;
        }
        catch {
            return false;
        }
    }
    isSecureContext() {
        return window.isSecureContext;
    }
    getSecurityRecommendations() {
        const recommendations = [];
        if (!this.isSecureContext()) {
            recommendations.push('Use HTTPS for secure context features');
        }
        if (this.config.isDevelopment) {
            recommendations.push('Review CSP directives for production deployment');
            recommendations.push('Enable HSTS in production');
            recommendations.push('Set secure cookie flags in production');
        }
        return recommendations;
    }
    generateSecurityMetaTags() {
        return `
      <meta http-equiv="Content-Security-Policy" content="${this.generateCSP()}" />
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      <meta http-equiv="X-Frame-Options" content="DENY" />
      <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
      <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      <meta http-equiv="Permissions-Policy" content="${this.generatePermissionsPolicy()}" />
    `.trim();
    }
}
exports.securityService = new SecurityService();
//# sourceMappingURL=securityService.js.map