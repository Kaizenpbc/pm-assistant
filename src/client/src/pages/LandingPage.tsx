import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
// apiService available if needed
import { MapPin } from 'lucide-react';

interface Region {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Guyana's 10 Administrative Regions (default if API fails)
  const defaultRegions: Region[] = [
    { id: 'region-001', code: 'R1', name: 'Barima-Waini' },
    { id: 'region-002', code: 'R2', name: 'Pomeroon-Supenaam' },
    { id: 'region-003', code: 'R3', name: 'Essequibo Islands-West Demerara' },
    { id: 'region-004', code: 'R4', name: 'Demerara-Mahaica' },
    { id: 'region-005', code: 'R5', name: 'Mahaica-Berbice' },
    { id: 'region-006', code: 'R6', name: 'East Berbice-Corentyne' },
    { id: 'region-007', code: 'R7', name: 'Cuyuni-Mazaruni' },
    { id: 'region-008', code: 'R8', name: 'Potaro-Siparuni' },
    { id: 'region-009', code: 'R9', name: 'Upper Takutu-Upper Essequibo' },
    { id: 'region-010', code: 'R10', name: 'Upper Demerara-Berbice' },
  ];

  useEffect(() => {
    // Try to fetch regions from API, fallback to defaults
    const fetchRegions = async () => {
      try {
        // TODO: Add API endpoint for regions
        // const response = await apiService.getRegions();
        // setRegions(response.regions || defaultRegions);
        setRegions(defaultRegions);
      } catch (error) {
        console.error('Failed to fetch regions, using defaults:', error);
        setRegions(defaultRegions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleRegionClick = (region: Region) => {
    // Store selected region
    localStorage.setItem('selectedRegionId', region.id);
    localStorage.setItem('selectedRegionName', region.name);

    // Check user role and navigate accordingly
    if (user?.role === 'region_admin' && user.region_id === region.id) {
      // Region admin goes to dashboard
      navigate('/dashboard');
    } else if (user?.role === 'admin') {
      // Admins can access any region dashboard
      navigate('/dashboard');
    } else if (user?.role === 'citizen') {
      // Citizens go to region info page
      navigate(`/region/${region.id}/info`);
    } else {
      // For non-authenticated users or other roles, show region info (public)
      navigate(`/region/${region.id}/info`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading regions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PM Assistant</h1>
            </div>
            {user && (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{user.fullName || user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Region
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your region to view and manage projects in your area
          </p>
        </div>

        {/* Region Grid - 10 boxes in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {regions.map((region) => {
            const isUserRegion = user?.role === 'region_admin' && user.region_id === region.id;
            const canAccess = user?.role === 'admin' || isUserRegion;

            // Allow all users (including citizens) to click on regions
            const canClick = !user || user.role === 'citizen' || canAccess || !user;

            return (
              <button
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className={`
                  relative p-6 rounded-lg border-2 transition-all duration-200
                  ${canClick
                    ? 'bg-white border-blue-300 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                    : 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                  }
                  ${isUserRegion ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {region.code}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {region.name}
                  </p>
                  {isUserRegion && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Your Region
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Message */}
        {user?.role === 'region_admin' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> As a Region Administrator, you can only access your assigned region.
            </p>
          </div>
        )}

        {!user && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Click on a region to view public information, notices, and project status. Sign in for full access.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
