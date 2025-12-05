import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Info,
  X,
  Save,
  ArrowLeft
} from 'lucide-react';

interface Notice {
  id: string;
  regionId: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export const RegionNoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'project_update' | 'public_meeting' | 'emergency' | 'maintenance',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    expiresAt: '',
  });

  const regionId = user?.region_id || localStorage.getItem('selectedRegionId');

  // Get all notices for the region
  const { data: noticesData, isLoading } = useQuery({
    queryKey: ['notices-all', regionId],
    queryFn: () => apiService.getAllNotices(regionId!),
    enabled: !!regionId && (user?.role === 'admin' || user?.role === 'region_admin'),
  });

  const notices: Notice[] = noticesData?.notices || [];

  // Create notice mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.createNotice({ ...data, regionId: regionId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices-all', regionId] });
      queryClient.invalidateQueries({ queryKey: ['notices', regionId] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Update notice mutation
  const updateMutation = useMutation({
    mutationFn: ({ noticeId, data }: { noticeId: string; data: any }) =>
      apiService.updateNotice(noticeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices-all', regionId] });
      queryClient.invalidateQueries({ queryKey: ['notices', regionId] });
      setIsModalOpen(false);
      setEditingNotice(null);
      resetForm();
    },
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: ({ noticeId, isPublished }: { noticeId: string; isPublished: boolean }) =>
      apiService.publishNotice(noticeId, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices-all', regionId] });
      queryClient.invalidateQueries({ queryKey: ['notices', regionId] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (noticeId: string) => apiService.deleteNotice(noticeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices-all', regionId] });
      queryClient.invalidateQueries({ queryKey: ['notices', regionId] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      expiresAt: '',
    });
    setEditingNotice(null);
  };

  const handleOpenModal = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        category: notice.category as any,
        priority: notice.priority as any,
        expiresAt: notice.expiresAt ? new Date(notice.expiresAt).toISOString().slice(0, 16) : '',
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      updateMutation.mutate({ noticeId: editingNotice.id, data: formData });
    } else {
      createMutation.mutate(formData);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!regionId || (user?.role !== 'admin' && user?.role !== 'region_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have permission to manage notices.</p>
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
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Manage Notices</h1>
                  <p className="text-sm text-gray-600">Post and manage region announcements</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Notice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notices Yet</h3>
            <p className="text-gray-600 mb-4">Create your first notice to keep citizens informed.</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Notice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-white rounded-lg border-2 p-6 shadow-sm ${
                  !notice.isPublished ? 'opacity-60 border-gray-300' :
                  notice.priority === 'urgent' ? 'border-red-300' :
                  notice.priority === 'high' ? 'border-orange-300' :
                  notice.priority === 'medium' ? 'border-yellow-300' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    {getCategoryIcon(notice.category)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notice.title}
                        </h3>
                        {!notice.isPublished && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                          {notice.priority}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {notice.category.replace('_', ' ')}
                        </span>
                        {notice.publishedAt && (
                          <span className="text-xs text-gray-500">
                            Published: {formatDate(notice.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => publishMutation.mutate({ noticeId: notice.id, isPublished: !notice.isPublished })}
                      className={`p-2 rounded-lg transition-colors ${
                        notice.isPublished
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={notice.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {notice.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleOpenModal(notice)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this notice?')) {
                          deleteMutation.mutate(notice.id);
                        }
                      }}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                </div>
                {notice.expiresAt && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Expires: {formatDate(notice.expiresAt)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingNotice ? 'Edit Notice' : 'Create New Notice'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter notice title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter notice content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="project_update">Project Update</option>
                    <option value="public_meeting">Public Meeting</option>
                    <option value="emergency">Emergency</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNotice ? 'Update' : 'Create'} Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

