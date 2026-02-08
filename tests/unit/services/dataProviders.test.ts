import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock the config module BEFORE any provider module imports it.
// The real config.ts calls validateConfiguration() at module scope which
// requires env vars (JWT_SECRET, etc.) that are not available in unit tests.
// ---------------------------------------------------------------------------
vi.mock('../../../src/server/config', () => ({
  config: {
    NODE_ENV: 'test',
    WEATHER_API_PROVIDER: 'mock',
    WEATHER_API_KEY: undefined,
    WEATHER_CACHE_MINUTES: 60,
  },
}));

// Mock axios so real providers don't make network calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    create: vi.fn(),
  },
  AxiosError: class extends Error {
    response: any;
    constructor(message: string) {
      super(message);
      this.response = null;
    }
  },
}));

// Import after mocks are established
import {
  MockWeatherProvider,
  DataProviderManager,
} from '../../../src/server/services/dataProviders/index';
import type { WeatherForecast } from '../../../src/server/services/dataProviders/types';

// =============================================================================
// MockWeatherProvider
// =============================================================================

describe('MockWeatherProvider', () => {
  let provider: MockWeatherProvider;

  beforeEach(() => {
    provider = new MockWeatherProvider();
  });

  it('has the name "MockWeather"', () => {
    expect(provider.name).toBe('MockWeather');
  });

  it('has the type "weather"', () => {
    expect(provider.type).toBe('weather');
  });

  it('isConfigured() returns true (always available)', () => {
    expect(provider.isConfigured()).toBe(true);
  });

  describe('getForecast()', () => {
    it('returns a valid WeatherForecast structure', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      // Verify top-level properties exist
      expect(forecast).toHaveProperty('location');
      expect(forecast).toHaveProperty('current');
      expect(forecast).toHaveProperty('daily');
      expect(forecast).toHaveProperty('fetchedAt');
      expect(forecast).toHaveProperty('expiresAt');
    });

    it('returns location data with correct structure', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      expect(forecast.location).toHaveProperty('lat');
      expect(forecast.location).toHaveProperty('lon');
      expect(forecast.location).toHaveProperty('name');
      expect(typeof forecast.location.lat).toBe('number');
      expect(typeof forecast.location.lon).toBe('number');
      expect(typeof forecast.location.name).toBe('string');
    });

    it('returns data with correct location for Georgetown coordinates', async () => {
      // Georgetown, Guyana: approximately 6.80, -58.16
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      expect(forecast.location.lat).toBe(6.80);
      expect(forecast.location.lon).toBe(-58.16);
      expect(forecast.location.name).toBe('Georgetown');
      expect(forecast.location.region).toBe('Demerara-Mahaica');
    });

    it('returns data with correct location for New Amsterdam coordinates', async () => {
      const forecast = await provider.getForecast(6.50, -58.03, 7);

      expect(forecast.location.lat).toBe(6.50);
      expect(forecast.location.lon).toBe(-58.03);
      expect(forecast.location.name).toBe('New Amsterdam');
    });

    it('returns a generic location name for coordinates far from known locations', async () => {
      const forecast = await provider.getForecast(10.0, -60.0, 3);

      expect(forecast.location.lat).toBe(10.0);
      expect(forecast.location.lon).toBe(-60.0);
      // Far from all known Guyana locations, should get generic name
      expect(forecast.location.name).toContain('Location');
    });

    it('returns daily array with the correct number of days', async () => {
      const forecast3 = await provider.getForecast(6.80, -58.16, 3);
      expect(forecast3.daily).toHaveLength(3);

      const forecast7 = await provider.getForecast(6.80, -58.16, 7);
      expect(forecast7.daily).toHaveLength(7);

      const forecast14 = await provider.getForecast(6.80, -58.16, 14);
      expect(forecast14.daily).toHaveLength(14);
    });

    it('caps daily array at 14 days maximum', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 20);
      expect(forecast.daily.length).toBeLessThanOrEqual(14);
    });

    it('returns current weather with all required fields', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      expect(forecast.current).toHaveProperty('temperature');
      expect(forecast.current).toHaveProperty('feelsLike');
      expect(forecast.current).toHaveProperty('humidity');
      expect(forecast.current).toHaveProperty('windSpeed');
      expect(forecast.current).toHaveProperty('condition');
      expect(forecast.current).toHaveProperty('conditionCode');
      expect(forecast.current).toHaveProperty('precipitation');
      expect(forecast.current).toHaveProperty('visibility');
      expect(forecast.current).toHaveProperty('uvIndex');
    });

    it('returns temperatures in a realistic tropical range (20-40 C)', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      expect(forecast.current.temperature).toBeGreaterThanOrEqual(20);
      expect(forecast.current.temperature).toBeLessThanOrEqual(40);
    });

    it('returns daily entries with all required fields', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 3);

      for (const day of forecast.daily) {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('tempMin');
        expect(day).toHaveProperty('tempMax');
        expect(day).toHaveProperty('condition');
        expect(day).toHaveProperty('conditionCode');
        expect(day).toHaveProperty('precipitationChance');
        expect(day).toHaveProperty('precipitationAmount');
        expect(day).toHaveProperty('windSpeed');
        expect(day).toHaveProperty('humidity');
      }
    });

    it('returns fetchedAt as a valid ISO timestamp', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      expect(typeof forecast.fetchedAt).toBe('string');
      const parsed = new Date(forecast.fetchedAt);
      expect(parsed.toISOString()).toBe(forecast.fetchedAt);
    });

    it('returns expiresAt as a valid ISO timestamp after fetchedAt', async () => {
      const forecast = await provider.getForecast(6.80, -58.16, 7);

      const fetchedAt = new Date(forecast.fetchedAt).getTime();
      const expiresAt = new Date(forecast.expiresAt).getTime();
      expect(expiresAt).toBeGreaterThan(fetchedAt);
    });
  });

  describe('fetchData()', () => {
    it('delegates to getForecast with correct parameters', async () => {
      const forecast = await provider.fetchData({ lat: 6.80, lon: -58.16, days: 5 });

      expect(forecast.location.lat).toBe(6.80);
      expect(forecast.location.lon).toBe(-58.16);
      expect(forecast.daily).toHaveLength(5);
    });
  });
});

// =============================================================================
// DataProviderManager
// =============================================================================

describe('DataProviderManager', () => {
  let manager: DataProviderManager;

  beforeEach(() => {
    manager = new DataProviderManager();
  });

  describe('getCacheStats()', () => {
    it('returns initial stats with 0 entries', () => {
      const stats = manager.getCacheStats();
      expect(stats.entries).toBe(0);
    });

    it('returns initial stats with 0 hits and 0 misses', () => {
      const stats = manager.getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });

    it('returns initial hitRate of 0', () => {
      const stats = manager.getCacheStats();
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('clearCache()', () => {
    it('empties the cache (0 entries after clear)', () => {
      manager.clearCache();
      const stats = manager.getCacheStats();
      expect(stats.entries).toBe(0);
    });

    it('resets hit and miss counters', () => {
      manager.clearCache();
      const stats = manager.getCacheStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getActiveWeatherProviderName()', () => {
    it('returns "MockWeather" when WEATHER_API_PROVIDER is "mock"', () => {
      expect(manager.getActiveWeatherProviderName()).toBe('MockWeather');
    });
  });

  describe('getWeather()', () => {
    it('fetches weather data and populates cache', async () => {
      const forecast = await manager.getWeather(6.80, -58.16, 7);

      expect(forecast).toBeDefined();
      expect(forecast.location.name).toBe('Georgetown');

      const stats = manager.getCacheStats();
      expect(stats.entries).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it('returns cached data on second call with same coordinates', async () => {
      const forecast1 = await manager.getWeather(6.80, -58.16, 7);
      const forecast2 = await manager.getWeather(6.80, -58.16, 7);

      // Data should be identical (from cache)
      expect(forecast1.fetchedAt).toBe(forecast2.fetchedAt);

      const stats = manager.getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });

    it('throws for invalid latitude', async () => {
      await expect(manager.getWeather(100, -58.16)).rejects.toThrow('Invalid latitude');
    });

    it('throws for invalid longitude', async () => {
      await expect(manager.getWeather(6.80, -200)).rejects.toThrow('Invalid longitude');
    });

    it('clears cache including populated entries', async () => {
      await manager.getWeather(6.80, -58.16, 7);
      expect(manager.getCacheStats().entries).toBe(1);

      manager.clearCache();
      expect(manager.getCacheStats().entries).toBe(0);
    });
  });

  describe('pruneExpiredEntries()', () => {
    it('returns 0 when cache is empty', () => {
      const pruned = manager.pruneExpiredEntries();
      expect(pruned).toBe(0);
    });
  });
});
