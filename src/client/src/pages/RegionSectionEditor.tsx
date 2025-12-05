import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff,
  X,
  AlertCircle,
  Info,
  Phone,
  Briefcase,
  BarChart3,
  MapPin,
  Users,
  Clock
} from 'lucide-react';

interface Section {
  id?: string;
  sectionType: string;
  title: string;
  content: string;
  displayOrder: number;
  isVisible: boolean;
  metadata?: any;
}

const sectionTypeInfo: Record<string, { label: string; icon: any; description: string; placeholder: string }> = {
  about: {
    label: 'About the Region',
    icon: Info,
    description: 'General information about your region',
    placeholder: 'Enter information about your region, its history, key features, and what makes it unique...'
  },
  contact: {
    label: 'Contact Information',
    icon: Phone,
    description: 'Phone, email, address, office hours',
    placeholder: 'Enter contact information:\n\nAddress: ...\nPhone: ...\nEmail: ...\nOffice Hours: ...'
  },
  services: {
    label: 'Services Offered',
    icon: Briefcase,
    description: 'Services available to citizens',
    placeholder: 'List the services available in your region:\n\n• Service 1\n• Service 2\n• Service 3'
  },
  statistics: {
    label: 'Statistics & Demographics',
    icon: BarChart3,
    description: 'Population, demographics, key metrics',
    placeholder: 'Enter statistics and key metrics:\n\nPopulation: ...\nArea: ...\nKey Statistics: ...'
  },
  location: {
    label: 'Location & Map',
    icon: MapPin,
    description: 'Geographic information and maps',
    placeholder: 'Enter location information and geographic details...'
  },
  demographics: {
    label: 'Demographics',
    icon: Users,
    description: 'Population demographics and data',
    placeholder: 'Enter demographic information...'
  },
  history: {
    label: 'History',
    icon: Clock,
    description: 'Historical information about the region',
    placeholder: 'Enter historical information about your region...'
  },
  leadership: {
    label: 'Leadership',
    icon: Users,
    description: 'Regional leadership and officials',
    placeholder: 'Enter information about regional leadership:\n\n• Official 1\n• Official 2'
  },
  custom: {
    label: 'Custom Section',
    icon: Info,
    description: 'Custom content section',
    placeholder: 'Enter custom content...'
  }
};

export const RegionSectionEditor: React.FC = () => {
  const { sectionType } = useParams<{ sectionType: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const regionId = user?.region_id || localStorage.getItem('selectedRegionId');

  const [formData, setFormData] = useState<Section>({
    sectionType: sectionType || '',
    title: '',
    content: '',
    displayOrder: 0,
    isVisible: true,
  });

  // Get existing section if it exists
  const { data: sectionData, isLoading } = useQuery({
    queryKey: ['region-section', regionId, sectionType],
    queryFn: () => apiService.getRegionSection(regionId!, sectionType!),
    enabled: !!regionId && !!sectionType,
    retry: false, // Don't retry on 404
  });

  useEffect(() => {
    if (sectionData?.section) {
      const section = sectionData.section;
      setFormData({
        id: section.id,
        sectionType: section.sectionType,
        title: section.title,
        content: section.content,
        displayOrder: section.displayOrder || 0,
        isVisible: section.isVisible !== undefined ? section.isVisible : true,
        metadata: section.metadata,
      });
    } else if (sectionType) {
      // Set default title based on section type
      const info = sectionTypeInfo[sectionType];
      if (info) {
        setFormData(prev => ({
          ...prev,
          sectionType: sectionType,
          title: info.label,
        }));
      }
    }
  }, [sectionData, sectionType]);

  // Create or update mutation
  const saveMutation = useMutation({
    mutationFn: (data: Section) => apiService.createOrUpdateSection({
      regionId: regionId!,
      sectionType: data.sectionType,
      title: data.title,
      content: data.content,
      displayOrder: data.displayOrder,
      isVisible: data.isVisible,
      metadata: data.metadata,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['region-content-all', regionId] });
      queryClient.invalidateQueries({ queryKey: ['region-content', regionId] });
      queryClient.invalidateQueries({ queryKey: ['region-section', regionId, sectionType] });
      navigate('/region/admin');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const sectionInfo = sectionType ? sectionTypeInfo[sectionType] : null;
  const Icon = sectionInfo?.icon || Info;

  if (!regionId || (user?.role !== 'admin' && user?.role !== 'region_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You do not have permission to edit sections.</p>
          <button
            onClick={() => navigate('/region/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/region/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {sectionInfo?.label || 'Edit Section'}
                  </h1>
                  <p className="text-sm text-gray-600">{sectionInfo?.description}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/region/${regionId}/info`)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading section...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder={sectionInfo?.placeholder || 'Enter content...'}
                />
                <p className="mt-2 text-xs text-gray-500">
                  You can use line breaks to format your content. Basic formatting will be preserved.
                </p>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <div className="flex items-center space-x-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.isVisible}
                        onChange={() => setFormData({ ...formData, isVisible: true })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex items-center space-x-1 text-sm text-gray-700">
                        <Eye className="w-4 h-4 text-green-600" />
                        <span>Visible</span>
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!formData.isVisible}
                        onChange={() => setFormData({ ...formData, isVisible: false })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex items-center space-x-1 text-sm text-gray-700">
                        <EyeOff className="w-4 h-4 text-gray-400" />
                        <span>Hidden</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tips for writing content:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Use clear, concise language that citizens can understand</li>
                      <li>Break up long paragraphs with line breaks</li>
                      <li>Use bullet points or numbered lists for better readability</li>
                      <li>Keep contact information up to date</li>
                      <li>Save frequently to avoid losing your work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/region/admin')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(`/region/${regionId}/info`)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveMutation.isPending ? 'Saving...' : 'Save Section'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

