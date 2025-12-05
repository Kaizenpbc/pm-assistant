import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  Settings, 
  FileText, 
  Bell, 
  Building2, 
  Eye,
  Edit,
  Plus,
  ArrowLeft,
  Info,
  Phone,
  Briefcase,
  BarChart3,
  MapPin,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ContentSection {
  id: string;
  sectionType: string;
  title: string;
  content: string;
  isVisible: boolean;
  displayOrder: number;
}

export const RegionAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const regionId = user?.region_id || localStorage.getItem('selectedRegionId');

  // Get all content sections
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ['region-content-all', regionId],
    queryFn: () => apiService.getAllRegionContent(regionId!),
    enabled: !!regionId && (user?.role === 'admin' || user?.role === 'region_admin'),
  });

  const sections: ContentSection[] = sectionsData?.sections || [];

  // Get section type info
  const sectionTypes = [
    { type: 'about', label: 'About the Region', icon: Info, description: 'General information about your region' },
    { type: 'contact', label: 'Contact Information', icon: Phone, description: 'Phone, email, address, office hours' },
    { type: 'services', label: 'Services Offered', icon: Briefcase, description: 'Services available to citizens' },
    { type: 'statistics', label: 'Statistics & Demographics', icon: BarChart3, description: 'Population, demographics, key metrics' },
    { type: 'location', label: 'Location & Map', icon: MapPin, description: 'Geographic information and maps' },
    { type: 'demographics', label: 'Demographics', icon: Users, description: 'Population demographics and data' },
    { type: 'history', label: 'History', icon: Clock, description: 'Historical information about the region' },
    { type: 'leadership', label: 'Leadership', icon: Users, description: 'Regional leadership and officials' },
  ];

  const getSectionByType = (type: string) => {
    return sections.find(s => s.sectionType === type);
  };

  const handleEditSection = (sectionType: string) => {
    setSelectedSection(sectionType);
    navigate(`/region/admin/sections/${sectionType}`);
  };

  if (!regionId || (user?.role !== 'admin' && user?.role !== 'region_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have permission to access this dashboard.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Region Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage all your region content and information</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/region/${regionId}/info`)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>Preview Public Page</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/region/notices')}
            className="bg-white rounded-lg border-2 border-blue-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Notices</h3>
                <p className="text-sm text-gray-600">Post announcements</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Create, edit, and publish notices for citizens</p>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white rounded-lg border-2 border-green-200 p-6 hover:border-green-400 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Projects</h3>
                <p className="text-sm text-gray-600">Update project status</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">View and update project information</p>
          </button>

          <button
            onClick={() => navigate(`/region/${regionId}/info`)}
            className="bg-white rounded-lg border-2 border-purple-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Public Page</h3>
                <p className="text-sm text-gray-600">See citizen view</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Preview how citizens see your region page</p>
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Region Content Sections</h2>
            <p className="text-sm text-gray-600 mt-1">Edit the content that appears on your public region page</p>
          </div>

          {sectionsLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sections...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sectionTypes.map((sectionType) => {
                  const section = getSectionByType(sectionType.type);
                  const Icon = sectionType.icon;
                  const hasContent = !!section;
                  const isVisible = section?.isVisible ?? false;

                  return (
                    <div
                      key={sectionType.type}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        hasContent && isVisible
                          ? 'border-green-200 bg-green-50'
                          : hasContent && !isVisible
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className={`w-5 h-5 ${
                            hasContent && isVisible ? 'text-green-600' :
                            hasContent && !isVisible ? 'text-yellow-600' :
                            'text-gray-400'
                          }`} />
                          <h3 className="font-semibold text-gray-900 text-sm">{sectionType.label}</h3>
                        </div>
                        {hasContent && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isVisible
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{sectionType.description}</p>
                      <button
                        onClick={() => handleEditSection(sectionType.type)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasContent
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {hasContent ? (
                          <span className="flex items-center justify-center space-x-1">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center space-x-1">
                            <Plus className="w-4 h-4" />
                            <span>Create</span>
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How to Update Your Region Page</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Click on any section above to create or edit its content</li>
                <li>Use "Manage Notices" to post announcements and updates</li>
                <li>Use "Manage Projects" to update project status and information</li>
                <li>Click "Preview Public Page" to see how citizens view your region</li>
                <li>All changes are saved immediately and appear on the public page</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

