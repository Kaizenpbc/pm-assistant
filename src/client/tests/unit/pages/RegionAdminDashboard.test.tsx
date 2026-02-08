import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegionAdminDashboard } from '@pages/RegionAdminDashboard';
import { useAuthStore } from '@/stores/authStore';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@/stores/authStore', () => ({ useAuthStore: vi.fn() }));
vi.mock('@/services/api', () => ({
  apiService: {
    getAllRegionContent: vi.fn().mockResolvedValue({ sections: [] }),
  },
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </MemoryRouter>
);

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('RegionAdminDashboard', () => {
  it('shows Access Denied when user has no region', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'region_admin', region_id: null } as any,
    } as any);
    render(<RegionAdminDashboard />, { wrapper });
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument();
  });

  it('shows Access Denied when user is not admin or region_admin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'member', region_id: 'region-1' } as any,
    } as any);
    render(<RegionAdminDashboard />, { wrapper });
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it('renders dashboard when user is region_admin with region', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { role: 'region_admin', region_id: 'region-1' } as any,
    } as any);
    render(<RegionAdminDashboard />, { wrapper });
    expect(await screen.findByText(/Region Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview Public Page/i)).toBeInTheDocument();
  });
});
