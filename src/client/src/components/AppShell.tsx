import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

interface AppShellState {
  isLoaded: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  updateVersion?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  useLocation(); // Triggers re-render on route change
  const [shellState, setShellState] = useState<AppShellState>({
    isLoaded: false,
    isOnline: navigator.onLine,
    hasUpdate: false
  });

  useEffect(() => {
    // Initialize app shell
    initializeAppShell();
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeAppShell = async () => {
    try {
      // Preload critical resources
      await preloadCriticalResources();
      
      // Initialize app shell state
      setShellState(prev => ({ ...prev, isLoaded: true }));
      
      // Check for updates
      await checkForUpdates();
      
    } catch (error) {
      console.error('❌ Failed to initialize app shell:', error);
    }
  };

  const preloadCriticalResources = async () => {
    // Only preload manifest.json for now
    // Other resources will be loaded when needed
    const criticalResources = [
      '/manifest.json'
    ];

    const preloadPromises = criticalResources.map(async (resource) => {
      try {
        const response = await fetch(resource, { cache: 'force-cache' });
        if (response.ok) {
          console.log(`✅ Preloaded: ${resource}`);
        }
      } catch (error) {
        console.log(`⚠️ Failed to preload: ${resource}`);
      }
    });

    await Promise.allSettled(preloadPromises);
  };

  const checkForUpdates = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage(
          { type: 'CHECK_FOR_UPDATES' },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error('❌ Failed to check for updates:', error);
      }
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { data } = event;
    
    switch (data.type) {
      case 'UPDATE_AVAILABLE':
        setShellState(prev => ({
          ...prev,
          hasUpdate: true,
          updateVersion: data.newVersion
        }));
        break;
        
      case 'NO_UPDATE_AVAILABLE':
        console.log('✅ App is up to date');
        break;
        
      case 'UPDATE_CHECK_ERROR':
        console.error('❌ Update check failed:', data.error);
        break;
        
      case 'FORCE_UPDATE':
        handleForceUpdate(data.version);
        break;
    }
  };

  const handleOnline = () => {
    setShellState(prev => ({ ...prev, isOnline: true }));
    console.log('🌐 App shell: Online');
  };

  const handleOffline = () => {
    setShellState(prev => ({ ...prev, isOnline: false }));
    console.log('📴 App shell: Offline');
  };

  const handleForceUpdate = (version: string) => {
    console.log(`🔄 Forcing update to version ${version}`);
    window.location.reload();
  };

  const handleUpdateNow = () => {
    if (shellState.updateVersion) {
      handleForceUpdate(shellState.updateVersion);
    }
  };

  const handleUpdateLater = () => {
    setShellState(prev => ({ ...prev, hasUpdate: false }));
  };

  // Show loading state
  if (!shellState.isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading PM Application</h2>
          <p className="text-gray-600">Initializing app shell...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-gray-50">
      {/* App Shell Header */}
      <header className="app-shell-header bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* App Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">PM Application v2</h1>
              {!shellState.isOnline && (
                <span className="ml-3 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  Offline
                </span>
              )}
            </div>
            
            {/* App Shell Actions */}
            <div className="flex items-center space-x-4">
              {/* Update Available Badge */}
              {shellState.hasUpdate && (
                <button
                  onClick={handleUpdateNow}
                  className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                >
                  Update Available
                </button>
              )}
              
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  shellState.isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {shellState.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="app-shell-main">
        {children}
      </main>

      {/* Update Notification Modal */}
      {shellState.hasUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Update Available</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Version {shellState.updateVersion} is ready to install. 
              This update includes bug fixes and improvements.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateNow}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Update Now
              </button>
              <button
                onClick={handleUpdateLater}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Shell Footer */}
      <footer className="app-shell-footer bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              © 2024 PM Application v2. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Status: {shellState.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
