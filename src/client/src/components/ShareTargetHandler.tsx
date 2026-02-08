import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toastService } from '../services/toastService';

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface ShareTargetHandlerProps {
  onSharedContent?: (content: SharedContent) => void;
}

export const ShareTargetHandler: React.FC<ShareTargetHandlerProps> = ({ 
  onSharedContent 
}) => {
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're on a share target page
    if (window.location.pathname === '/share-target') {
      handleSharedContent();
    }
  }, []);

  const handleSharedContent = async () => {
    try {
      setIsProcessing(true);
      
      // Get shared data from URL parameters or form data
      const urlParams = new URLSearchParams(window.location.search);
      const formData = await getFormData();
      
      const content: SharedContent = {
        title: urlParams.get('title') || formData?.get('title')?.toString(),
        text: urlParams.get('text') || formData?.get('text')?.toString(),
        url: urlParams.get('url') || formData?.get('url')?.toString(),
        files: formData ? Array.from(formData.getAll('files') as File[]) : []
      };

      // Filter out empty values
      Object.keys(content).forEach(key => {
        if (!content[key as keyof SharedContent] || 
            (Array.isArray(content[key as keyof SharedContent]) && 
             (content[key as keyof SharedContent] as any[]).length === 0)) {
          delete content[key as keyof SharedContent];
        }
      });

      if (Object.keys(content).length > 0) {
        setSharedContent(content);
        onSharedContent?.(content);
        
        toastService.success('Success', 'Content received successfully!');
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard?shared=true');
        }, 2000);
      } else {
        toastService.warning('No content was shared');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error handling shared content:', error);
      toastService.error('Error', 'Failed to process shared content');
      navigate('/dashboard');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFormData = async (): Promise<FormData | null> => {
    try {
      // Check if there's form data in the request
      const response = await fetch(window.location.href, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.ok) {
        return await response.formData();
      }
    } catch (error) {
      console.log('No form data found or error retrieving:', error);
    }
    return null;
  };

  const createProjectFromSharedContent = () => {
    if (!sharedContent) return;

    const projectData = {
      name: sharedContent.title || 'Shared Project',
      description: sharedContent.text || sharedContent.url || 'Project created from shared content',
      category: 'General',
      status: 'planning',
      sharedContent: sharedContent
    };

    // Navigate to project creation with pre-filled data
    navigate('/dashboard?action=create-project', { 
      state: { projectData } 
    });
  };

  const createTaskFromSharedContent = () => {
    if (!sharedContent) return;

    const taskData = {
      name: sharedContent.title || 'Shared Task',
      description: sharedContent.text || sharedContent.url || 'Task created from shared content',
      priority: 'medium',
      sharedContent: sharedContent
    };

    // Navigate to task creation with pre-filled data
    navigate('/dashboard?action=create-task', { 
      state: { taskData } 
    });
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Shared Content</h2>
          <p className="text-gray-600">Please wait while we process the shared content...</p>
        </div>
      </div>
    );
  }

  if (!sharedContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Content Shared</h2>
          <p className="text-gray-600 mb-6">No content was found to be shared with the application.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Shared Successfully!</h1>
            <p className="text-gray-600">Choose how you'd like to use the shared content</p>
          </div>

          {/* Shared Content Preview */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shared Content:</h3>
            
            {sharedContent.title && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                <p className="text-gray-900 bg-white p-3 rounded border">{sharedContent.title}</p>
              </div>
            )}
            
            {sharedContent.text && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Text:</label>
                <p className="text-gray-900 bg-white p-3 rounded border">{sharedContent.text}</p>
              </div>
            )}
            
            {sharedContent.url && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL:</label>
                <a 
                  href={sharedContent.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 bg-white p-3 rounded border block break-all"
                >
                  {sharedContent.url}
                </a>
              </div>
            )}
            
            {sharedContent.files && sharedContent.files.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Files:</label>
                <div className="space-y-2">
                  {sharedContent.files.map((file, index) => (
                    <div key={index} className="bg-white p-3 rounded border flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-900">{file.name}</span>
                      <span className="text-gray-500 ml-2">({Math.round(file.size / 1024)} KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={createProjectFromSharedContent}
              className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <h4 className="font-semibold">Create New Project</h4>
                  <p className="text-sm opacity-90">Use shared content as project details</p>
                </div>
              </div>
            </button>

            <button
              onClick={createTaskFromSharedContent}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div>
                  <h4 className="font-semibold">Create New Task</h4>
                  <p className="text-sm opacity-90">Use shared content as task details</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <div>
                  <h4 className="font-semibold">Go to Dashboard</h4>
                  <p className="text-sm opacity-90">Continue with regular workflow</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSharedContent(null);
                navigate('/share-target');
              }}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-left"
            >
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div>
                  <h4 className="font-semibold">Share More Content</h4>
                  <p className="text-sm opacity-90">Share additional content</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTargetHandler;
