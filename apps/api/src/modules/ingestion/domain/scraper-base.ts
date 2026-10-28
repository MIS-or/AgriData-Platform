import { calculateSha256 } from '../../../core/crypto/hash.js';

export { calculateSha256 };

export interface RawScrapeResult {
  sourceName: string;
  sourceUrl: string;
  payload: Record<string, unknown>;
  contentHash: string;
  fetchedAt: string;
  latencyMs: number;
}

/**
 * Thực thi fetch kèm cơ chế Retry với Exponential Backoff
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
  initialDelayMs = 500
): Promise<Response> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'AgriData-Market-Collector/1.0 (+https://agridata.vn/bot)',
          Accept: 'application/json, text/html, */*',
          ...options?.headers,
        },
      });

      if (response.ok) {
        return response;
      }

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP Client Error: ${response.status} ${response.statusText} for ${url}`);
      }
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`Đã vượt quá ${maxRetries} lần thử lại khi kết nối tới ${url}. Lỗi: ${String(err)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw new Error(`Thất bại sau ${maxRetries} lần thử`);
}
