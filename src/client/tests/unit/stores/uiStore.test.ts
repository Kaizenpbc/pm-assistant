import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../../src/stores/uiStore';
import type { AIPanelContext } from '../../../src/stores/uiStore';

/**
 * Reset the zustand store to its initial state before each test.
 * Zustand stores are singletons, so state persists between tests unless reset.
 */
function resetStore() {
  useUIStore.setState({
    sidebarCollapsed: false,
    aiPanelOpen: true,
    aiPanelContext: { type: 'dashboard' },
    notifications: [],
    unreadCount: 0,
  });
}

describe('uiStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  describe('initial state', () => {
    it('has sidebarCollapsed set to false', () => {
      const state = useUIStore.getState();
      expect(state.sidebarCollapsed).toBe(false);
    });

    it('has aiPanelOpen set to true', () => {
      const state = useUIStore.getState();
      expect(state.aiPanelOpen).toBe(true);
    });

    it('has aiPanelContext with type "dashboard"', () => {
      const state = useUIStore.getState();
      expect(state.aiPanelContext).toEqual({ type: 'dashboard' });
    });

    it('has an empty notifications array', () => {
      const state = useUIStore.getState();
      expect(state.notifications).toEqual([]);
    });

    it('has unreadCount of 0', () => {
      const state = useUIStore.getState();
      expect(state.unreadCount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // toggleSidebar
  // ---------------------------------------------------------------------------

  describe('toggleSidebar', () => {
    it('flips sidebarCollapsed from false to true', () => {
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar();
      expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    });

    it('flips sidebarCollapsed from true back to false', () => {
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar(); // false -> true
      toggleSidebar(); // true -> false
      expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // toggleAIPanel
  // ---------------------------------------------------------------------------

  describe('toggleAIPanel', () => {
    it('flips aiPanelOpen from true to false', () => {
      const { toggleAIPanel } = useUIStore.getState();
      toggleAIPanel();
      expect(useUIStore.getState().aiPanelOpen).toBe(false);
    });

    it('flips aiPanelOpen from false back to true', () => {
      const { toggleAIPanel } = useUIStore.getState();
      toggleAIPanel(); // true -> false
      toggleAIPanel(); // false -> true
      expect(useUIStore.getState().aiPanelOpen).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // setAIPanelContext
  // ---------------------------------------------------------------------------

  describe('setAIPanelContext', () => {
    it('updates the context to a new type', () => {
      const { setAIPanelContext } = useUIStore.getState();
      const newContext: AIPanelContext = { type: 'project', projectId: 'p-123', projectName: 'Road Repair' };
      setAIPanelContext(newContext);

      const state = useUIStore.getState();
      expect(state.aiPanelContext).toEqual(newContext);
    });

    it('updates context to region type with regionId', () => {
      const { setAIPanelContext } = useUIStore.getState();
      const regionContext: AIPanelContext = { type: 'region', regionId: 'r-456' };
      setAIPanelContext(regionContext);

      expect(useUIStore.getState().aiPanelContext).toEqual(regionContext);
    });
  });

  // ---------------------------------------------------------------------------
  // addNotification
  // ---------------------------------------------------------------------------

  describe('addNotification', () => {
    it('adds a notification to the list', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'risk',
        severity: 'high',
        title: 'Risk Alert',
        message: 'Project X has a high risk of delay',
      });

      const state = useUIStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].title).toBe('Risk Alert');
      expect(state.notifications[0].message).toBe('Project X has a high risk of delay');
      expect(state.notifications[0].type).toBe('risk');
      expect(state.notifications[0].severity).toBe('high');
      expect(state.notifications[0].read).toBe(false);
    });

    it('auto-generates an id for the notification', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'info',
        severity: 'low',
        title: 'Info',
        message: 'Test',
      });

      const notification = useUIStore.getState().notifications[0];
      expect(notification.id).toBeDefined();
      expect(notification.id).toMatch(/^notif-/);
    });

    it('auto-generates a createdAt timestamp', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'info',
        severity: 'low',
        title: 'Info',
        message: 'Test',
      });

      const notification = useUIStore.getState().notifications[0];
      expect(notification.createdAt).toBeDefined();
      // Verify it is a valid ISO date string
      expect(new Date(notification.createdAt).toISOString()).toBe(notification.createdAt);
    });

    it('increments unreadCount by 1', () => {
      const { addNotification } = useUIStore.getState();
      expect(useUIStore.getState().unreadCount).toBe(0);

      addNotification({
        type: 'budget',
        severity: 'medium',
        title: 'Budget Warning',
        message: 'Over budget',
      });
      expect(useUIStore.getState().unreadCount).toBe(1);

      addNotification({
        type: 'weather',
        severity: 'high',
        title: 'Weather Alert',
        message: 'Heavy rain expected',
      });
      expect(useUIStore.getState().unreadCount).toBe(2);
    });

    it('prepends new notifications (newest first)', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'info',
        severity: 'low',
        title: 'First',
        message: 'First notification',
      });
      addNotification({
        type: 'info',
        severity: 'low',
        title: 'Second',
        message: 'Second notification',
      });

      const notifications = useUIStore.getState().notifications;
      expect(notifications[0].title).toBe('Second');
      expect(notifications[1].title).toBe('First');
    });
  });

  // ---------------------------------------------------------------------------
  // dismissNotification
  // ---------------------------------------------------------------------------

  describe('dismissNotification', () => {
    it('marks the notification as read', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'risk',
        severity: 'critical',
        title: 'Critical Risk',
        message: 'Something is wrong',
      });

      const notifId = useUIStore.getState().notifications[0].id;
      useUIStore.getState().dismissNotification(notifId);

      const notification = useUIStore.getState().notifications.find((n) => n.id === notifId);
      expect(notification).toBeDefined();
      expect(notification!.read).toBe(true);
    });

    it('decrements unreadCount when dismissing an unread notification', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'risk',
        severity: 'critical',
        title: 'Critical Risk',
        message: 'Something is wrong',
      });
      addNotification({
        type: 'info',
        severity: 'low',
        title: 'Info',
        message: 'FYI',
      });

      expect(useUIStore.getState().unreadCount).toBe(2);

      const notifId = useUIStore.getState().notifications[0].id;
      useUIStore.getState().dismissNotification(notifId);

      expect(useUIStore.getState().unreadCount).toBe(1);
    });

    it('does not decrement unreadCount when dismissing an already-read notification', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({
        type: 'risk',
        severity: 'critical',
        title: 'Critical Risk',
        message: 'Something is wrong',
      });

      const notifId = useUIStore.getState().notifications[0].id;
      // Dismiss once (marks as read, decrements)
      useUIStore.getState().dismissNotification(notifId);
      expect(useUIStore.getState().unreadCount).toBe(0);

      // Dismiss again (already read, should not decrement further)
      useUIStore.getState().dismissNotification(notifId);
      expect(useUIStore.getState().unreadCount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // markAllRead
  // ---------------------------------------------------------------------------

  describe('markAllRead', () => {
    it('sets all notifications to read', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({ type: 'risk', severity: 'high', title: 'A', message: 'msg' });
      addNotification({ type: 'budget', severity: 'medium', title: 'B', message: 'msg' });
      addNotification({ type: 'weather', severity: 'low', title: 'C', message: 'msg' });

      useUIStore.getState().markAllRead();

      const state = useUIStore.getState();
      expect(state.notifications.every((n) => n.read === true)).toBe(true);
    });

    it('sets unreadCount to 0', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({ type: 'risk', severity: 'high', title: 'A', message: 'msg' });
      addNotification({ type: 'budget', severity: 'medium', title: 'B', message: 'msg' });

      expect(useUIStore.getState().unreadCount).toBe(2);

      useUIStore.getState().markAllRead();

      expect(useUIStore.getState().unreadCount).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // clearNotifications
  // ---------------------------------------------------------------------------

  describe('clearNotifications', () => {
    it('empties the notifications list', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({ type: 'risk', severity: 'high', title: 'A', message: 'msg' });
      addNotification({ type: 'budget', severity: 'medium', title: 'B', message: 'msg' });

      expect(useUIStore.getState().notifications).toHaveLength(2);

      useUIStore.getState().clearNotifications();

      expect(useUIStore.getState().notifications).toEqual([]);
    });

    it('resets unreadCount to 0', () => {
      const { addNotification } = useUIStore.getState();
      addNotification({ type: 'risk', severity: 'high', title: 'A', message: 'msg' });

      useUIStore.getState().clearNotifications();

      expect(useUIStore.getState().unreadCount).toBe(0);
    });
  });
});
