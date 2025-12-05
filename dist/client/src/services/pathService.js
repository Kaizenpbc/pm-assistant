"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathService = void 0;
class PathService {
    basePath;
    constructor() {
        this.basePath = this.getBasePath();
    }
    getBasePath() {
        if (import.meta.env.DEV) {
            return '/';
        }
        const pathname = window.location.pathname;
        if (pathname === '/') {
            return '/';
        }
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1 && pathname.endsWith('/')) {
            return `/${segments[0]}/`;
        }
        if (segments.length > 1) {
            return `/${segments.slice(0, -1).join('/')}/`;
        }
        return '/';
    }
    resolve(path) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        if (this.basePath === '/') {
            return normalizedPath;
        }
        return `${this.basePath}${normalizedPath.slice(1)}`;
    }
    getServiceWorkerPath() {
        return this.resolve('/sw.js');
    }
    getManifestPath() {
        return this.resolve('/manifest.json');
    }
    getIconPath(size) {
        return this.resolve(`/icon-${size}.png`);
    }
    getFaviconPath() {
        return this.resolve('/favicon.ico');
    }
    getSplashPath(resolution) {
        return this.resolve(`/splash-${resolution}.png`);
    }
    getApiBaseUrl() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        if (import.meta.env.DEV) {
            return 'http://localhost:3002';
        }
        return `${protocol}//${host}/api`;
    }
    getStaticPath(asset) {
        return this.resolve(`/static/${asset}`);
    }
    getCurrentBasePath() {
        return this.basePath;
    }
    isSubdirectoryDeployment() {
        return this.basePath !== '/';
    }
    getDeploymentInfo() {
        return {
            basePath: this.basePath,
            isSubdirectory: this.isSubdirectoryDeployment(),
            currentUrl: window.location.href,
            pathname: window.location.pathname
        };
    }
}
exports.pathService = new PathService();
//# sourceMappingURL=pathService.js.map