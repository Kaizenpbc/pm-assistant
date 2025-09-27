/**
 * Path Service - Handles dynamic path resolution for deployment flexibility
 * 
 * This service ensures the app works correctly when deployed to:
 * - Domain root (e.g., https://example.com/)
 * - Subdirectories (e.g., https://example.com/app/)
 * - Subdomains (e.g., https://app.example.com/)
 */

class PathService {
  private basePath: string;

  constructor() {
    // Get the base path from the current URL
    this.basePath = this.getBasePath();
  }

  /**
   * Get the base path for the application
   * Handles various deployment scenarios
   */
  private getBasePath(): string {
    // In development, usually just '/'
    if (import.meta.env.DEV) {
      return '/';
    }

    // In production, determine base path from current location
    const pathname = window.location.pathname;
    
    // If we're at root, return '/'
    if (pathname === '/') {
      return '/';
    }

    // If we have a path like /app/, extract the base path
    // This handles cases like /app/, /pm-assistant/, etc.
    const segments = pathname.split('/').filter(Boolean);
    
    // For single-segment deployments like /app/
    if (segments.length === 1 && pathname.endsWith('/')) {
      return `/${segments[0]}/`;
    }

    // For multi-segment deployments like /company/app/
    if (segments.length > 1) {
      return `/${segments.slice(0, -1).join('/')}/`;
    }

    // Default fallback
    return '/';
  }

  /**
   * Resolve a path relative to the application base path
   * @param path - The path to resolve (e.g., '/icon-192x192.png')
   * @returns The resolved path (e.g., '/app/icon-192x192.png' or '/icon-192x192.png')
   */
  public resolve(path: string): string {
    // Ensure path starts with '/'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // If base path is '/', return as-is
    if (this.basePath === '/') {
      return normalizedPath;
    }

    // Combine base path with normalized path
    return `${this.basePath}${normalizedPath.slice(1)}`;
  }

  /**
   * Get the service worker path
   */
  public getServiceWorkerPath(): string {
    return this.resolve('/sw.js');
  }

  /**
   * Get the manifest path
   */
  public getManifestPath(): string {
    return this.resolve('/manifest.json');
  }

  /**
   * Get icon paths
   */
  public getIconPath(size: string): string {
    return this.resolve(`/icon-${size}.png`);
  }

  /**
   * Get favicon path
   */
  public getFaviconPath(): string {
    return this.resolve('/favicon.ico');
  }

  /**
   * Get splash screen paths
   */
  public getSplashPath(resolution: string): string {
    return this.resolve(`/splash-${resolution}.png`);
  }

  /**
   * Get API base URL
   */
  public getApiBaseUrl(): string {
    // For API calls, we typically want to keep them relative to the current domain
    // but this can be customized based on deployment needs
    const protocol = window.location.protocol;
    const host = window.location.host;
    
    // In development, use the dev server
    if (import.meta.env.DEV) {
      return 'http://localhost:3002';
    }

    // In production, use the same domain with /api prefix
    return `${protocol}//${host}/api`;
  }

  /**
   * Get static asset paths
   */
  public getStaticPath(asset: string): string {
    return this.resolve(`/static/${asset}`);
  }

  /**
   * Get the current base path (for debugging)
   */
  public getCurrentBasePath(): string {
    return this.basePath;
  }

  /**
   * Check if we're deployed to a subdirectory
   */
  public isSubdirectoryDeployment(): boolean {
    return this.basePath !== '/';
  }

  /**
   * Get deployment info for debugging
   */
  public getDeploymentInfo(): {
    basePath: string;
    isSubdirectory: boolean;
    currentUrl: string;
    pathname: string;
  } {
    return {
      basePath: this.basePath,
      isSubdirectory: this.isSubdirectoryDeployment(),
      currentUrl: window.location.href,
      pathname: window.location.pathname
    };
  }
}

export const pathService = new PathService();
