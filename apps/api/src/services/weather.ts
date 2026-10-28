import { calculateSha256, fetchWithRetry, RawScrapeResult } from './scraper-base.js';

export interface WeatherMetricsDaily {
  date: string;
  maxTemperatureCelsius: number;
  minTemperatureCelsius: number;
  totalPrecipitationMm: number;
  windSpeedMaxKmh: number;
  isAdverseWeather: boolean; // Mưa > 50mm hoặc bão/lốc
}

export interface RegionCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

// Tọa độ vùng thí điểm 1: Đồng bằng sông Cửu Long / An Phú Tân
export const PILOT_REGION_1: RegionCoordinates = {
  name: 'Vùng thí điểm An Phú Tân',
  latitude: 10.04,
  longitude: 105.78,
};

export async function fetchOpenMeteoWeather(
  region: RegionCoordinates = PILOT_REGION_1
): Promise<{ rawResult: RawScrapeResult; dailyMetrics: WeatherMetricsDaily[] }> {
  const startTime = Date.now();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.latitude}&longitude=${region.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Asia%2FBangkok&forecast_days=7`;

  const response = await fetchWithRetry(url);
  const data = (await response.json()) as {
    daily?: {
      time: string[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_sum: number[];
      wind_speed_10m_max: number[];
    };
  };

  const payloadString = JSON.stringify(data);
  const contentHash = await calculateSha256(payloadString);
  const latencyMs = Date.now() - startTime;

  const rawResult: RawScrapeResult = {
    sourceName: 'open_meteo',
    sourceUrl: url,
    payload: data,
    contentHash,
    fetchedAt: new Date().toISOString(),
    latencyMs,
  };

  const daily = data.daily;
  const dailyMetrics: WeatherMetricsDaily[] = [];

  if (daily && daily.time) {
    for (let i = 0; i < daily.time.length; i++) {
      const rain = daily.precipitation_sum[i] ?? 0;
      const wind = daily.wind_speed_10m_max[i] ?? 0;
      dailyMetrics.push({
        date: daily.time[i],
        maxTemperatureCelsius: daily.temperature_2m_max[i] ?? 32,
        minTemperatureCelsius: daily.temperature_2m_min[i] ?? 24,
        totalPrecipitationMm: rain,
        windSpeedMaxKmh: wind,
        isAdverseWeather: rain > 50 || wind > 40,
      });
    }
  }

  return { rawResult, dailyMetrics };
}
