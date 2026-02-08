import {
  Bell,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { AlertItem } from './AlertItem';

interface AlertDropdownProps {
  onClose: () => void;
}

export function AlertDropdown({ onClose }: AlertDropdownProps) {
  const { notifications, unreadCount, markAllRead, clearNotifications } = useUIStore();

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 animate-fade-in rounded-xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-md px-2 py-1 text-xs text-ai-primary transition-colors hover:bg-ai-surface"
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Clear all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No notifications yet</p>
            <p className="mt-1 text-xs text-gray-400">
              AI-generated alerts will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.slice(0, 20).map((notification) => (
              <AlertItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 20 && (
        <div className="border-t border-gray-100 px-4 py-2 text-center">
          <button className="text-xs font-medium text-ai-primary hover:text-ai-primary-hover">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
