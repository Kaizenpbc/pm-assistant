import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorService, getApiErrorMessage } from '@services/errorService';

beforeEach(() => {
  errorService.clearErrors();
});

describe('errorService', () => {
  describe('reportError', () => {
    it('stores error info', () => {
      const err = new Error('test');
      errorService.reportError(err);
      expect(errorService.getErrorCount()).toBe(1);
      const errors = errorService.getErrors();
      expect(errors[0].message).toBe('test');
      expect(errors[0].url).toBeDefined();
      expect(errors[0].timestamp).toBeDefined();
    });

    it('accepts context', () => {
      errorService.reportError(new Error('x'), 'MyComponent');
      const errors = errorService.getErrors();
      expect(errors[0].message).toContain('[MyComponent]');
    });

    it('clearErrors resets storage', () => {
      errorService.reportError(new Error('a'));
      errorService.clearErrors();
      expect(errorService.getErrorCount()).toBe(0);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('returns message for axios 400', () => {
      const ax = { response: { status: 400 } };
      expect(errorService.getUserFriendlyMessage(ax)).toMatch(/invalid|input/i);
    });

    it('returns message for 401', () => {
      const ax = { response: { status: 401 } };
      expect(errorService.getUserFriendlyMessage(ax)).toMatch(/session|sign in/i);
    });

    it('returns message for 403', () => {
      const ax = { response: { status: 403 } };
      expect(errorService.getUserFriendlyMessage(ax)).toMatch(/permission/i);
    });

    it('returns message for 500', () => {
      const ax = { response: { status: 500 } };
      expect(errorService.getUserFriendlyMessage(ax)).toMatch(/try again|wrong/i);
    });

    it('uses server message when short', () => {
      const ax = { response: { status: 400, data: { message: 'Custom validation failed' } } };
      expect(errorService.getUserFriendlyMessage(ax)).toBe('Custom validation failed');
    });

    it('returns generic message for plain Error', () => {
      expect(errorService.getUserFriendlyMessage(new Error('foo'))).toBe('foo');
    });

    it('returns generic fallback for unknown', () => {
      expect(errorService.getUserFriendlyMessage(null)).toMatch(/Something went wrong|try again/i);
    });
  });

  describe('isNetworkError', () => {
    it('detects NetworkError', () => {
      const e = new Error('Network Error');
      e.name = 'NetworkError';
      expect(errorService.isNetworkError(e)).toBe(true);
    });

    it('detects fetch-like message', () => {
      expect(errorService.isNetworkError(new Error('fetch failed'))).toBe(true);
    });

    it('returns false for other errors', () => {
      expect(errorService.isNetworkError(new Error('other'))).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('detects 401', () => {
      expect(errorService.isAuthError({ response: { status: 401 } })).toBe(true);
    });

    it('detects 403', () => {
      expect(errorService.isAuthError({ response: { status: 403 } })).toBe(true);
    });

    it('returns false for 404', () => {
      expect(errorService.isAuthError({ response: { status: 404 } })).toBe(false);
    });
  });
});

describe('getApiErrorMessage', () => {
  it('delegates to errorService.getUserFriendlyMessage', () => {
    const ax = { response: { status: 404 } };
    expect(getApiErrorMessage(ax)).toMatch(/not found|resource/i);
  });
});
