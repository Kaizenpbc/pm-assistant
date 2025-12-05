"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDynamicHTML = generateDynamicHTML;
exports.generateDynamicManifest = generateDynamicManifest;
exports.getEnvironmentConfig = getEnvironmentConfig;
exports.logDeploymentInfo = logDeploymentInfo;
const pathService_1 = require("../services/pathService");
function generateDynamicHTML(baseHTML) {
    const basePath = pathService_1.pathService.getCurrentBasePath();
    let dynamicHTML = baseHTML;
    dynamicHTML = dynamicHTML.replace('navigator.serviceWorker.register(\'/sw.js\')', `navigator.serviceWorker.register('${basePath === '/' ? '/sw.js' : `${basePath}sw.js`}')`);
    dynamicHTML = dynamicHTML.replace(/icon: '\/icon-192x192\.png'/g, `icon: '${basePath === '/' ? '/icon-192x192.png' : `${basePath}icon-192x192.png`}'`);
    dynamicHTML = dynamicHTML.replace('href="/manifest.json"', `href="${basePath === '/' ? '/manifest.json' : `${basePath}manifest.json`}"`);
    return dynamicHTML;
}
function generateDynamicManifest(baseManifest) {
    const basePath = pathService_1.pathService.getCurrentBasePath();
    const dynamicManifest = { ...baseManifest };
    dynamicManifest.start_url = basePath === '/' ? '.' : basePath;
    dynamicManifest.scope = basePath === '/' ? '.' : basePath;
    if (dynamicManifest.icons) {
        dynamicManifest.icons = dynamicManifest.icons.map((icon) => ({
            ...icon,
            src: basePath === '/' ? icon.src : icon.src.replace('./', basePath)
        }));
    }
    return dynamicManifest;
}
function getEnvironmentConfig() {
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;
    return {
        isDev,
        isProd,
        basePath: pathService_1.pathService.getCurrentBasePath(),
        deploymentInfo: pathService_1.pathService.getDeploymentInfo()
    };
}
function logDeploymentInfo() {
    const config = getEnvironmentConfig();
    console.log('🚀 PM Application Deployment Info:', config);
    if (config.deploymentInfo.isSubdirectory) {
        console.log('📁 Deployed to subdirectory:', config.deploymentInfo.basePath);
        console.log('🔗 Current URL:', config.deploymentInfo.currentUrl);
    }
    else {
        console.log('🌐 Deployed to domain root');
    }
}
//# sourceMappingURL=buildUtils.js.map