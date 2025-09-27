import { ToastNotificationProps } from '../components/ToastNotification';
declare class ToastService {
    private toasts;
    private listeners;
    subscribe(listener: (toasts: ToastNotificationProps[]) => void): () => void;
    getToasts(): ToastNotificationProps[];
    addToast(toast: Omit<ToastNotificationProps, 'id'>): string;
    removeToast(id: string): void;
    clearAll(): void;
    success(title: string, message: string, options?: Partial<ToastNotificationProps>): string;
    error(title: string, message: string, options?: Partial<ToastNotificationProps>): string;
    warning(title: string, message: string, options?: Partial<ToastNotificationProps>): string;
    info(title: string, message: string, options?: Partial<ToastNotificationProps>): string;
    pwaRegistrationSuccess(): string;
    pwaRegistrationError(): string;
    pwaUnsupportedBrowser(): string;
    pwaUpdateAvailable(): string;
    offlineMode(): string;
    onlineMode(): string;
    private notifyListeners;
}
export declare const toastService: ToastService;
export {};
//# sourceMappingURL=toastService.d.ts.map