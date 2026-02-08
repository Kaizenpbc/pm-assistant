import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  MapPin, 
  Bell, 
  Calendar, 


  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  ArrowLeft,
  Building2,
  FileText
} from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishedAt: string;
  expiresAt?: string;
}

interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  startDate?: string;
  endDate?: string;
}

export const RegionInfoPage: React.FC = () => {
  const { regionId } = useParams<{ regionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'notices' | 'projects'>('overview');

  // Get region content sections (public)
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['region-content', regionId],
    queryFn: () => apiService.getRegionContent(regionId!),
    enabled: !!regionId,
  });

  // Get region notices (public)
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ['notices', regionId],
    queryFn: () => apiService.getNotices(regionId!),
    enabled: !!regionId,
  });

  // Get public projects for region
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-region', regionId],
    queryFn: () => apiService.getProjectsByRegion(regionId!),
    enabled: !!regionId,
  });

  const sections: any[] = contentData?.sections || [];
  const notices: Notice[] = noticesData?.notices || [];
  const projects: Project[] = projectsData?.projects || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'project_update':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'public_meeting':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'maintenance':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Region Information</h1>
                  <p className="text-sm text-gray-600">Public information and project status</p>
                </div>
              </div>
            </div>
            {user && (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{user.fullName || user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('notices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'notices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notices & Announcements</span>
                {notices.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {notices.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Project Status</span>
                {projects.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {projects.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div>
            {contentLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading region information...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                <p className="text-gray-600">Region information sections have not been set up yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                  >
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'notices' && (
          <div>
            {noticesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notices...</p>
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Notices Available</h3>
                <p className="text-gray-600">There are currently no published notices for this region.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-shadow ${
                      notice.priority === 'urgent' ? 'border-red-300' :
                      notice.priority === 'high' ? 'border-orange-300' :
                      notice.priority === 'medium' ? 'border-yellow-300' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(notice.category)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {notice.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                              {notice.priority}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {notice.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(notice.publishedAt)}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                    </div>
                    {notice.expiresAt && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Expires: {formatDate(notice.expiresAt)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'projects' && (
          <div>
            {projectsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Available</h3>
                <p className="text-gray-600">There are currently no active projects in this region.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500">{project.code}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {project.description || 'No description available'}
                    </p>
                    {project.budgetAllocated && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Budget</span>
                          <span>
                            {formatCurrency(project.budgetSpent || 0)} / {formatCurrency(project.budgetAllocated)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(((project.budgetSpent || 0) / project.budgetAllocated) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                      {project.startDate && (
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Started: {formatDate(project.startDate)}
                        </span>
                      )}
                      {project.endDate && (
                        <span className="flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Ends: {formatDate(project.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

