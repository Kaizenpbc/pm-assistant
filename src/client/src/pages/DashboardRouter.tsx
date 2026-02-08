import { useAuthStore } from '../stores/authStore';
import { PMDashboard } from './PMDashboard';
import { MinisterDashboard } from './MinisterDashboard';
import { REODashboard } from './REODashboard';

export function DashboardRouter() {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      // Admin gets the minister (national) view by default
      return <MinisterDashboard />;
    case 'region_admin':
    case 'rdc':
      return <REODashboard />;
    case 'citizen':
      // Citizens don't get a management dashboard — redirect handled in routing
      return <PMDashboard />;
    case 'manager':
    case 'user':
    default:
      return <PMDashboard />;
  }
}
