export interface RawScrapeResult {
  sourceName: string;
  sourceUrl: string;
  payload: Record<string, unknown>;
  contentHash: string;
  fetchedAt: string;
  latencyMs: number;
}

/**
 * Tính toán mã băm SHA-256 bất biến bằng Web Crypto API (Tương thích 100% Cloudflare Workers)
 */
export async function calculateSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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

      // 4xx client errors (ngoại trừ 429 Rate Limit) không cần retry
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP Client Error: ${response.status} ${response.statusText} for ${url}`);
      }
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`Đã vượt quá ${maxRetries} lần thử lại khi kết nối tới ${url}. Lỗi: ${String(err)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Gấp đôi thời gian chờ
    }
  }

  throw new Error(`Thất bại sau ${maxRetries} lần thử`);
}
