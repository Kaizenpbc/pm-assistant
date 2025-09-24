/**
 * Build utilities for handling dynamic paths in production builds
 */

import { pathService } from '../services/pathService';

/**
 * Generate dynamic HTML content with correct paths
 */
export function generateDynamicHTML(baseHTML: string): string {
  const basePath = pathService.getCurrentBasePath();
  
  // Replace hardcoded paths with dynamic ones
  let dynamicHTML = baseHTML;
  
  // Replace service worker registration
  dynamicHTML = dynamicHTML.replace(
    'navigator.serviceWorker.register(\'/sw.js\')',
    `navigator.serviceWorker.register('${basePath === '/' ? '/sw.js' : `${basePath}sw.js`}')`
  );
  
  // Replace icon paths in notifications
  dynamicHTML = dynamicHTML.replace(
    /icon: '\/icon-192x192\.png'/g,
    `icon: '${basePath === '/' ? '/icon-192x192.png' : `${basePath}icon-192x192.png`}'`
  );
  
  // Replace manifest path
  dynamicHTML = dynamicHTML.replace(
    'href="/manifest.json"',
    `href="${basePath === '/' ? '/manifest.json' : `${basePath}manifest.json`}"`
  );
  
  return dynamicHTML;
}

/**
 * Generate dynamic manifest.json content
 */
export function generateDynamicManifest(baseManifest: any): any {
  const basePath = pathService.getCurrentBasePath();
  
  const dynamicManifest = { ...baseManifest };
  
  // Update start_url and scope
  dynamicManifest.start_url = basePath === '/' ? '.' : basePath;
  dynamicManifest.scope = basePath === '/' ? '.' : basePath;
  
  // Update icon paths
  if (dynamicManifest.icons) {
    dynamicManifest.icons = dynamicManifest.icons.map((icon: any) => ({
      ...icon,
      src: basePath === '/' ? icon.src : icon.src.replace('./', basePath)
    }));
  }
  
  return dynamicManifest;
}

/**
 * Environment-specific path configuration
 */
export function getEnvironmentConfig() {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    isDev,
    isProd,
    basePath: pathService.getCurrentBasePath(),
    deploymentInfo: pathService.getDeploymentInfo()
  };
}

/**
 * Log deployment information for debugging
 */
export function logDeploymentInfo() {
  const config = getEnvironmentConfig();
  console.log('🚀 PM Application Deployment Info:', config);
  
  if (config.deploymentInfo.isSubdirectory) {
    console.log('📁 Deployed to subdirectory:', config.deploymentInfo.basePath);
    console.log('🔗 Current URL:', config.deploymentInfo.currentUrl);
  } else {
    console.log('🌐 Deployed to domain root');
  }
}
