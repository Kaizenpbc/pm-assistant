import {
  Shield,
  Cloud,
  DollarSign,
  Calendar,
  Users,
  Info,
} from 'lucide-react';
import { useUIStore, type Notification } from '../../stores/uiStore';

interface AlertItemProps {
  notification: Notification;
  onClose: () => void;
}

const typeIcons: Record<Notification['type'], React.ElementType> = {
  risk: Shield,
  weather: Cloud,
  budget: DollarSign,
  schedule: Calendar,
  resource: Users,
  info: Info,
};

const severityStyles: Record<Notification['severity'], { dot: string; bg: string }> = {
  critical: { dot: 'bg-risk-critical', bg: 'bg-red-50' },
  high: { dot: 'bg-risk-high', bg: 'bg-orange-50' },
  medium: { dot: 'bg-risk-medium', bg: 'bg-yellow-50' },
  low: { dot: 'bg-risk-low', bg: 'bg-green-50' },
};

export function AlertItem({ notification }: AlertItemProps) {
  const { dismissNotification } = useUIStore();
  const Icon = typeIcons[notification.type] || Info;
  const severity = severityStyles[notification.severity] || severityStyles.medium;

  const timeAgo = getTimeAgo(notification.createdAt);

  function handleClick() {
    dismissNotification(notification.id);
    // If notification has a projectId, could navigate to it
    // For now just mark as read
  }

  return (
    <button
      onClick={handleClick}
      className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${severity.bg}`}>
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${severity.dot}`} />
          )}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
          {notification.message}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-gray-400">{timeAgo}</span>
          {notification.projectName && (
            <>
              <span className="text-[10px] text-gray-300">&middot;</span>
              <span className="max-w-[140px] truncate text-[10px] text-ai-primary">
                {notification.projectName}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
