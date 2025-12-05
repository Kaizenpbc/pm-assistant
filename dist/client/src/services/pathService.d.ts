declare class PathService {
    private basePath;
    constructor();
    private getBasePath;
    resolve(path: string): string;
    getServiceWorkerPath(): string;
    getManifestPath(): string;
    getIconPath(size: string): string;
    getFaviconPath(): string;
    getSplashPath(resolution: string): string;
    getApiBaseUrl(): string;
    getStaticPath(asset: string): string;
    getCurrentBasePath(): string;
    isSubdirectoryDeployment(): boolean;
    getDeploymentInfo(): {
        basePath: string;
        isSubdirectory: boolean;
        currentUrl: string;
        pathname: string;
    };
}
export declare const pathService: PathService;
export {};
//# sourceMappingURL=pathService.d.ts.map