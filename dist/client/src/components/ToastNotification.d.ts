import React from 'react';
export interface ToastNotificationProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    onClose?: () => void;
    persistent?: boolean;
}
declare const ToastNotification: React.FC<ToastNotificationProps>;
interface ToastManagerProps {
    toasts: ToastNotificationProps[];
    onRemoveToast: (id: string) => void;
}
export declare const ToastManager: React.FC<ToastManagerProps>;
export default ToastNotification;
//# sourceMappingURL=ToastNotification.d.ts.map