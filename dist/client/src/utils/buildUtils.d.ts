export declare function generateDynamicHTML(baseHTML: string): string;
export declare function generateDynamicManifest(baseManifest: any): any;
export declare function getEnvironmentConfig(): {
    isDev: any;
    isProd: any;
    basePath: string;
    deploymentInfo: {
        basePath: string;
        isSubdirectory: boolean;
        currentUrl: string;
        pathname: string;
    };
};
export declare function logDeploymentInfo(): void;
//# sourceMappingURL=buildUtils.d.ts.map