/**
 * Security Service - Client-side security utilities and CSP management
 */

interface SecurityConfig {
  isDevelopment: boolean;
  baseUrl: string;
  apiUrl: string;
  wsUrl: string;
}

class SecurityService {
  private config: SecurityConfig;

  constructor() {
    this.config = this.getSecurityConfig();
  }

  private getSecurityConfig(): SecurityConfig {
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

  /**
   * Generate CSP header content for the current environment
   */
  public generateCSP(): string {
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

  /**
   * Generate Permissions Policy header content
   */
  public generatePermissionsPolicy(): string {
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

  /**
   * Validate that the current page has proper security headers
   */
  public validateSecurityHeaders(): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      issues.push('Missing Content Security Policy meta tag');
    }

    // Check for X-Frame-Options
    const frameOptions = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    if (!frameOptions) {
      issues.push('Missing X-Frame-Options meta tag');
    }

    // Check for X-Content-Type-Options
    const contentTypeOptions = document.querySelector('meta[http-equiv="X-Content-Type-Options"]');
    if (!contentTypeOptions) {
      issues.push('Missing X-Content-Type-Options meta tag');
    }

    // Check for HTTPS in production
    if (!this.config.isDevelopment && window.location.protocol !== 'https:') {
      issues.push('Application should use HTTPS in production');
    }

    // Check for secure cookies
    if (this.config.isDevelopment) {
      recommendations.push('Enable secure cookies in production');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Log security information for debugging
   */
  public logSecurityInfo(): void {
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

  /**
   * Sanitize user input to prevent XSS
   */
  public sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate URL to prevent open redirects
   */
  public validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Check if the current context is secure
   */
  public isSecureContext(): boolean {
    return window.isSecureContext;
  }

  /**
   * Get security recommendations based on current context
   */
  public getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];

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

  /**
   * Generate security headers for dynamic injection
   */
  public generateSecurityMetaTags(): string {
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

export const securityService = new SecurityService();
