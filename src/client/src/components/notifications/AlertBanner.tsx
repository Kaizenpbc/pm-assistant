import { AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export function AlertBanner() {
  const { notifications, dismissNotification } = useUIStore();

  const criticalAlerts = notifications.filter(
    (n) => n.severity === 'critical' && !n.read
  );

  if (criticalAlerts.length === 0) return null;

  const alert = criticalAlerts[0];

  return (
    <div className="animate-slide-up border-b border-red-200 bg-red-50 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-risk-critical">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-900">
            {alert.title}
          </p>
          <p className="truncate text-xs text-red-700">
            {alert.message}
          </p>
        </div>
        {criticalAlerts.length > 1 && (
          <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            +{criticalAlerts.length - 1} more
          </span>
        )}
        <button
          onClick={() => dismissNotification(alert.id)}
          className="flex-shrink-0 rounded-md p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
