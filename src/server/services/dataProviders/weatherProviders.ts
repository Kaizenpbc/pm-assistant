// =============================================================================
// Weather Provider Implementations
// Phase 1.3 - Data Provider Abstraction Layer
// =============================================================================

import axios, { AxiosError } from 'axios';
import { config } from '../../config';
import {
  WeatherProvider,
  WeatherForecast,
  WeatherConditionCode,
} from './types';

// =============================================================================
// Helper Utilities
// =============================================================================

/**
 * Build ISO date string (YYYY-MM-DD) from a Date object.
 */
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Build ISO timestamp string from a Date object.
 */
function toISOTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Compute cache expiry timestamp based on configured TTL.
 */
function computeExpiresAt(fetchedAt: Date): string {
  const expiresAt = new Date(fetchedAt.getTime() + config.WEATHER_CACHE_MINUTES * 60 * 1000);
  return toISOTimestamp(expiresAt);
}

// =============================================================================
// OpenWeatherMap Provider
// =============================================================================

/**
 * Maps OpenWeatherMap weather condition IDs to normalized condition codes.
 * Reference: https://openweathermap.org/weather-conditions
 */
function mapOWMConditionCode(id: number): WeatherConditionCode {
  if (id === 800) return 'clear';
  if (id === 801) return 'partly-cloudy';
  if (id === 802) return 'cloudy';
  if (id === 803 || id === 804) return 'overcast';
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id === 500) return 'light-rain';
  if (id === 501) return 'moderate-rain';
  if (id >= 502 && id < 510) return 'heavy-rain';
  if (id === 511) return 'sleet';
  if (id >= 520 && id < 532) return 'moderate-rain';
  if (id === 600) return 'light-snow';
  if (id === 601) return 'moderate-snow';
  if (id >= 602 && id < 700) return 'heavy-snow';
  if (id === 701 || id === 721) return 'mist';
  if (id === 741) return 'fog';
  if (id === 711) return 'smoke';
  if (id === 731 || id === 761) return 'dust';
  if (id === 751) return 'sand';
  if (id === 762) return 'haze';
  if (id === 771) return 'tropical-storm';
  if (id === 781) return 'tornado';
  return 'unknown';
}

/**
 * Provider adapter for the OpenWeatherMap One Call API 3.0.
 *
 * API docs: https://openweathermap.org/api/one-call-3
 * Endpoint: GET https://api.openweathermap.org/data/3.0/onecall
 */
export class OpenWeatherMapProvider implements WeatherProvider {
  readonly name = 'OpenWeatherMap';
  readonly type = 'weather' as const;
  private readonly baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = config.WEATHER_API_KEY;
  }

  isConfigured(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }

  async fetchData(params: Record<string, any>): Promise<WeatherForecast> {
    const lat = params['lat'] as number;
    const lon = params['lon'] as number;
    const days = (params['days'] as number) || 7;
    return this.getForecast(lat, lon, days);
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast> {
    if (!this.isConfigured()) {
      throw new Error(
        `[${this.name}] Provider is not configured. Set WEATHER_API_KEY in your environment.`
      );
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          exclude: 'minutely,hourly,alerts',
        },
        timeout: 10000,
      });

      const data = response.data;
      const fetchedAt = new Date();

      const current = data.current;
      const currentWeather = current.weather?.[0] || {};

      const dailyForecasts = (data.daily || [])
        .slice(0, days)
        .map((day: any) => {
          const dayWeather = day.weather?.[0] || {};
          return {
            date: toISODate(new Date(day.dt * 1000)),
            tempMin: Math.round(day.temp.min * 10) / 10,
            tempMax: Math.round(day.temp.max * 10) / 10,
            condition: dayWeather.description || dayWeather.main || 'Unknown',
            conditionCode: mapOWMConditionCode(dayWeather.id || 0),
            precipitationChance: Math.round((day.pop || 0) * 100),
            precipitationAmount: Math.round(((day.rain || 0) + (day.snow || 0)) * 10) / 10,
            windSpeed: Math.round((day.wind_speed || 0) * 3.6 * 10) / 10, // m/s -> km/h
            humidity: day.humidity || 0,
          };
        });

      return {
        location: {
          lat: data.lat,
          lon: data.lon,
          name: `${data.lat.toFixed(2)}, ${data.lon.toFixed(2)}`,
          region: data.timezone || undefined,
        },
        current: {
          temperature: Math.round(current.temp * 10) / 10,
          feelsLike: Math.round(current.feels_like * 10) / 10,
          humidity: current.humidity || 0,
          windSpeed: Math.round((current.wind_speed || 0) * 3.6 * 10) / 10, // m/s -> km/h
          condition: currentWeather.description || currentWeather.main || 'Unknown',
          conditionCode: mapOWMConditionCode(currentWeather.id || 0),
          precipitation: Math.round(((current.rain?.['1h'] || 0) + (current.snow?.['1h'] || 0)) * 10) / 10,
          visibility: Math.round((current.visibility || 10000) / 100) / 10, // m -> km
          uvIndex: current.uvi || 0,
        },
        daily: dailyForecasts,
        fetchedAt: toISOTimestamp(fetchedAt),
        expiresAt: computeExpiresAt(fetchedAt),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        throw new Error(
          `[${this.name}] API request failed (HTTP ${status || 'unknown'}): ${message}`
        );
      }
      throw new Error(
        `[${this.name}] Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// =============================================================================
// WeatherAPI.com Provider
// =============================================================================

/**
 * Maps WeatherAPI.com condition codes to normalized condition codes.
 * Reference: https://www.weatherapi.com/docs/weather_conditions.json
 */
function mapWeatherAPIConditionCode(code: number): WeatherConditionCode {
  // Clear / Sunny
  if (code === 1000) return 'clear';
  // Partly cloudy
  if (code === 1003) return 'partly-cloudy';
  // Cloudy
  if (code === 1006) return 'cloudy';
  // Overcast
  if (code === 1009) return 'overcast';
  // Mist
  if (code === 1030) return 'mist';
  // Fog / Freezing fog
  if (code === 1135 || code === 1147) return 'fog';
  // Light drizzle / freezing drizzle
  if (code === 1150 || code === 1153 || code === 1168) return 'light-drizzle';
  // Heavy freezing drizzle / drizzle
  if (code === 1171) return 'drizzle';
  // Patchy light rain / Light rain
  if (code === 1063 || code === 1180 || code === 1183) return 'light-rain';
  // Moderate rain / moderate rain at times
  if (code === 1186 || code === 1189) return 'moderate-rain';
  // Heavy rain / heavy rain at times
  if (code === 1192 || code === 1195) return 'heavy-rain';
  // Light freezing rain
  if (code === 1198) return 'light-rain';
  // Moderate/heavy freezing rain
  if (code === 1201) return 'heavy-rain';
  // Light rain shower
  if (code === 1240) return 'light-rain';
  // Moderate/heavy rain shower
  if (code === 1243) return 'heavy-rain';
  // Torrential rain shower
  if (code === 1246) return 'heavy-rain';
  // Patchy light snow / light snow
  if (code === 1066 || code === 1210 || code === 1213) return 'light-snow';
  // Patchy moderate snow / moderate snow
  if (code === 1216 || code === 1219) return 'moderate-snow';
  // Patchy heavy snow / heavy snow / blizzard
  if (code === 1222 || code === 1225) return 'heavy-snow';
  if (code === 1117) return 'blizzard';
  // Sleet
  if (code === 1069 || code === 1204 || code === 1207 || code === 1249 || code === 1252) return 'sleet';
  // Ice pellets
  if (code === 1237 || code === 1261 || code === 1264) return 'hail';
  // Thunderstorm
  if (code === 1087 || code === 1273 || code === 1276 || code === 1279 || code === 1282) return 'thunderstorm';
  // Snow showers
  if (code === 1255) return 'light-snow';
  if (code === 1258) return 'heavy-snow';

  return 'unknown';
}

/**
 * Provider adapter for WeatherAPI.com.
 *
 * API docs: https://www.weatherapi.com/docs/
 * Endpoint: GET https://api.weatherapi.com/v1/forecast.json
 */
export class WeatherAPIProvider implements WeatherProvider {
  readonly name = 'WeatherAPI';
  readonly type = 'weather' as const;
  private readonly baseUrl = 'https://api.weatherapi.com/v1/forecast.json';
  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = config.WEATHER_API_KEY;
  }

  isConfigured(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.length > 0;
  }

  async fetchData(params: Record<string, any>): Promise<WeatherForecast> {
    const lat = params['lat'] as number;
    const lon = params['lon'] as number;
    const days = (params['days'] as number) || 7;
    return this.getForecast(lat, lon, days);
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast> {
    if (!this.isConfigured()) {
      throw new Error(
        `[${this.name}] Provider is not configured. Set WEATHER_API_KEY in your environment.`
      );
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: `${lat},${lon}`,
          days: Math.min(days, 14), // WeatherAPI.com supports up to 14-day forecast
          aqi: 'no',
          alerts: 'no',
        },
        timeout: 10000,
      });

      const data = response.data;
      const fetchedAt = new Date();

      const current = data.current;
      const location = data.location;
      const forecastDays = data.forecast?.forecastday || [];

      const dailyForecasts = forecastDays.slice(0, days).map((day: any) => {
        const dayData = day.day;
        const conditionCode = dayData.condition?.code || 0;
        return {
          date: day.date, // WeatherAPI returns YYYY-MM-DD already
          tempMin: Math.round(dayData.mintemp_c * 10) / 10,
          tempMax: Math.round(dayData.maxtemp_c * 10) / 10,
          condition: dayData.condition?.text || 'Unknown',
          conditionCode: mapWeatherAPIConditionCode(conditionCode),
          precipitationChance: dayData.daily_chance_of_rain || 0,
          precipitationAmount: Math.round((dayData.totalprecip_mm || 0) * 10) / 10,
          windSpeed: Math.round((dayData.maxwind_kph || 0) * 10) / 10,
          humidity: dayData.avghumidity || 0,
        };
      });

      const currentConditionCode = current.condition?.code || 0;

      return {
        location: {
          lat: location.lat,
          lon: location.lon,
          name: location.name,
          region: location.region || undefined,
        },
        current: {
          temperature: Math.round(current.temp_c * 10) / 10,
          feelsLike: Math.round(current.feelslike_c * 10) / 10,
          humidity: current.humidity || 0,
          windSpeed: Math.round((current.wind_kph || 0) * 10) / 10,
          condition: current.condition?.text || 'Unknown',
          conditionCode: mapWeatherAPIConditionCode(currentConditionCode),
          precipitation: Math.round((current.precip_mm || 0) * 10) / 10,
          visibility: Math.round((current.vis_km || 10) * 10) / 10,
          uvIndex: current.uv || 0,
        },
        daily: dailyForecasts,
        fetchedAt: toISOTimestamp(fetchedAt),
        expiresAt: computeExpiresAt(fetchedAt),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const apiError = error.response?.data?.error;
        const message = apiError?.message || error.message;
        throw new Error(
          `[${this.name}] API request failed (HTTP ${status || 'unknown'}): ${message}`
        );
      }
      throw new Error(
        `[${this.name}] Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// =============================================================================
// Mock Weather Provider
// =============================================================================

/**
 * Deterministic hash for seeding pseudo-random values.
 * Produces a number between 0 and 1 from a string seed.
 */
function seededRandom(seed: string): () => number {
  // Simple but adequate hash: djb2
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
  }
  // Use the hash as a seed for a linear congruential generator
  let state = Math.abs(hash);
  return () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Guyana location names based on approximate coordinates.
 */
function getGuyanaLocationName(lat: number, lon: number): { name: string; region: string } {
  // Major Guyanese locations for realistic mock data
  const locations: Array<{ lat: number; lon: number; name: string; region: string }> = [
    { lat: 6.80, lon: -58.16, name: 'Georgetown', region: 'Demerara-Mahaica' },
    { lat: 6.50, lon: -58.03, name: 'New Amsterdam', region: 'East Berbice-Corentyne' },
    { lat: 6.40, lon: -57.52, name: 'Rose Hall', region: 'East Berbice-Corentyne' },
    { lat: 6.25, lon: -57.53, name: 'Corriverton', region: 'East Berbice-Corentyne' },
    { lat: 7.37, lon: -58.79, name: 'Bartica', region: 'Cuyuni-Mazaruni' },
    { lat: 5.88, lon: -57.53, name: 'Skeldon', region: 'East Berbice-Corentyne' },
    { lat: 6.59, lon: -58.67, name: 'Parika', region: 'Essequibo Islands-West Demerara' },
    { lat: 6.23, lon: -57.18, name: 'Springlands', region: 'East Berbice-Corentyne' },
    { lat: 5.18, lon: -59.48, name: 'Lethem', region: 'Upper Takutu-Upper Essequibo' },
    { lat: 6.36, lon: -58.69, name: 'Vreed-en-Hoop', region: 'Essequibo Islands-West Demerara' },
  ];

  // Find closest location
  let closest = locations[0];
  let minDist = Number.MAX_VALUE;
  for (const loc of locations) {
    const dist = Math.sqrt(Math.pow(loc.lat - lat, 2) + Math.pow(loc.lon - lon, 2));
    if (dist < minDist) {
      minDist = dist;
      closest = loc;
    }
  }

  // If we are close enough, use the real name; otherwise generate a generic one
  if (minDist < 0.5) {
    return { name: closest.name, region: closest.region };
  }
  return {
    name: `Location ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
    region: 'Guyana',
  };
}

/**
 * Mock weather provider for development and testing.
 *
 * Generates realistic tropical weather data appropriate for Guyana's climate:
 * - Temperature range: 24-34 C (tropical)
 * - High humidity: 60-95%
 * - Two seasons: wet (May-July, Nov-Jan) and dry (Feb-Apr, Aug-Oct)
 * - Frequent rainfall during wet season
 *
 * Uses deterministic seeding so the same coordinates produce consistent
 * results within a cache period.
 */
export class MockWeatherProvider implements WeatherProvider {
  readonly name = 'MockWeather';
  readonly type = 'weather' as const;

  isConfigured(): boolean {
    return true;
  }

  async fetchData(params: Record<string, any>): Promise<WeatherForecast> {
    const lat = params['lat'] as number;
    const lon = params['lon'] as number;
    const days = (params['days'] as number) || 7;
    return this.getForecast(lat, lon, days);
  }

  async getForecast(lat: number, lon: number, days: number = 7): Promise<WeatherForecast> {
    const fetchedAt = new Date();
    // Seed based on coordinates and the current hour (consistent within cache window)
    const cacheWindow = Math.floor(fetchedAt.getTime() / (config.WEATHER_CACHE_MINUTES * 60 * 1000));
    const seed = `${lat.toFixed(4)}_${lon.toFixed(4)}_${cacheWindow}`;
    const rng = seededRandom(seed);

    const now = new Date();
    const month = now.getMonth(); // 0-indexed

    // Determine season: wet months are May(4)-Jul(6) and Nov(10)-Jan(0)
    const isWetSeason =
      (month >= 4 && month <= 6) || month >= 10 || month === 0;

    // Base temperature range for Guyana (tropical)
    const baseTemp = 27 + rng() * 4; // 27-31 C base
    const tempVariation = 2 + rng() * 2; // 2-4 C daily swing

    // Humidity: higher in wet season
    const baseHumidity = isWetSeason ? 78 + rng() * 17 : 62 + rng() * 18; // 78-95 or 62-80

    // Wind speed: generally light in Guyana, 5-20 km/h
    const baseWindSpeed = 5 + rng() * 15;

    // Precipitation chance: higher in wet season
    const basePrecipChance = isWetSeason ? 50 + rng() * 40 : 10 + rng() * 30;

    const location = getGuyanaLocationName(lat, lon);

    // Pick current condition based on season and randomness
    const currentCondition = this.pickCondition(rng(), isWetSeason);

    const currentTemp = Math.round((baseTemp + (rng() - 0.5) * tempVariation) * 10) / 10;
    const currentFeelsLike = Math.round((currentTemp + 1 + rng() * 3) * 10) / 10; // heat index: feels warmer
    const currentPrecip = currentCondition.code === 'clear' || currentCondition.code === 'partly-cloudy'
      ? 0
      : Math.round(rng() * (isWetSeason ? 15 : 5) * 10) / 10;

    const dailyForecasts = [];
    for (let i = 0; i < Math.min(days, 14); i++) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() + i);

      // Each day gets its own slight variation
      const dayRng = seededRandom(`${seed}_day${i}`);
      const dayCondition = this.pickCondition(dayRng(), isWetSeason);
      const dayTempMin = Math.round((baseTemp - tempVariation / 2 + (dayRng() - 0.5) * 2) * 10) / 10;
      const dayTempMax = Math.round((dayTempMin + tempVariation + dayRng() * 2) * 10) / 10;
      const dayPrecipChance = Math.min(100, Math.max(0, Math.round(basePrecipChance + (dayRng() - 0.5) * 30)));
      const dayPrecipAmount = dayPrecipChance > 40
        ? Math.round(dayRng() * (isWetSeason ? 25 : 10) * 10) / 10
        : Math.round(dayRng() * 2 * 10) / 10;
      const dayWindSpeed = Math.round((baseWindSpeed + (dayRng() - 0.5) * 8) * 10) / 10;
      const dayHumidity = Math.min(100, Math.max(40, Math.round(baseHumidity + (dayRng() - 0.5) * 15)));

      dailyForecasts.push({
        date: toISODate(dayDate),
        tempMin: dayTempMin,
        tempMax: dayTempMax,
        condition: dayCondition.label,
        conditionCode: dayCondition.code,
        precipitationChance: dayPrecipChance,
        precipitationAmount: dayPrecipAmount,
        windSpeed: Math.max(0, dayWindSpeed),
        humidity: dayHumidity,
      });
    }

    return {
      location: {
        lat,
        lon,
        name: location.name,
        region: location.region,
      },
      current: {
        temperature: currentTemp,
        feelsLike: currentFeelsLike,
        humidity: Math.round(baseHumidity),
        windSpeed: Math.round(baseWindSpeed * 10) / 10,
        condition: currentCondition.label,
        conditionCode: currentCondition.code,
        precipitation: currentPrecip,
        visibility: currentCondition.code === 'fog' || currentCondition.code === 'heavy-rain'
          ? Math.round((2 + rng() * 4) * 10) / 10
          : Math.round((8 + rng() * 7) * 10) / 10,
        uvIndex: currentCondition.code === 'clear'
          ? Math.round((8 + rng() * 4) * 10) / 10
          : Math.round((3 + rng() * 5) * 10) / 10,
      },
      daily: dailyForecasts,
      fetchedAt: toISOTimestamp(fetchedAt),
      expiresAt: computeExpiresAt(fetchedAt),
    };
  }

  /**
   * Pick a weather condition weighted by season.
   */
  private pickCondition(
    roll: number,
    isWetSeason: boolean
  ): { label: string; code: WeatherConditionCode } {
    if (isWetSeason) {
      // Wet season: more rain, thunderstorms
      if (roll < 0.10) return { label: 'Clear', code: 'clear' };
      if (roll < 0.22) return { label: 'Partly Cloudy', code: 'partly-cloudy' };
      if (roll < 0.32) return { label: 'Cloudy', code: 'cloudy' };
      if (roll < 0.40) return { label: 'Overcast', code: 'overcast' };
      if (roll < 0.50) return { label: 'Light Rain', code: 'light-rain' };
      if (roll < 0.65) return { label: 'Moderate Rain', code: 'moderate-rain' };
      if (roll < 0.80) return { label: 'Heavy Rain', code: 'heavy-rain' };
      if (roll < 0.90) return { label: 'Thunderstorm', code: 'thunderstorm' };
      if (roll < 0.95) return { label: 'Light Drizzle', code: 'light-drizzle' };
      return { label: 'Mist', code: 'mist' };
    } else {
      // Dry season: more clear skies, occasional rain
      if (roll < 0.30) return { label: 'Clear', code: 'clear' };
      if (roll < 0.50) return { label: 'Partly Cloudy', code: 'partly-cloudy' };
      if (roll < 0.65) return { label: 'Cloudy', code: 'cloudy' };
      if (roll < 0.75) return { label: 'Overcast', code: 'overcast' };
      if (roll < 0.82) return { label: 'Light Rain', code: 'light-rain' };
      if (roll < 0.90) return { label: 'Moderate Rain', code: 'moderate-rain' };
      if (roll < 0.95) return { label: 'Heavy Rain', code: 'heavy-rain' };
      return { label: 'Thunderstorm', code: 'thunderstorm' };
    }
  }
}
