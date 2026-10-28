import { describe, it, expect } from 'vitest';
import { calculateSha256 } from './scraper-base.js';
import { parseWholesaleMarketReport } from './market-scraper.js';
import { calculateSeasonalIndices } from './seasonal-analysis.js';

describe('Scraper & Seasonal Baseline Analysis Test', () => {
  it('generates consistent 64-char SHA-256 hash for raw payload', async () => {
    const hash1 = await calculateSha256('gia_nong_san_binh_dien_2026-10-28');
    const hash2 = await calculateSha256('gia_nong_san_binh_dien_2026-10-28');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('parses wholesale market report and converts units to VND/kg', async () => {
    const rawReport = 'Bản tin giá ngày 28/10/2026: Cải thìa 1,200,000 đ/tạ, Dưa leo 28,000 đ/chục';
    const result = await parseWholesaleMarketReport('binh_dien', rawReport, '2026-10-28');

    expect(result.rawRecord.sourceName).toBe('cho_binh_dien');
    expect(result.items.length).toBe(4);

    const bokChoy = result.items.find((i) => i.cropCode === 'bok_choy');
    expect(bokChoy).toBeDefined();
    // 1,200,000 / 100 kg = 12,000 đ/kg
    expect(bokChoy?.priceVndPerKg).toBe(12000);
  });

  it('detects clear seasonal signal from 52 weeks historical price series', () => {
    // Giả lập chuỗi giá 52 tuần với mùa mưa giá cao (tháng 6-9, tuần 25-36) và mùa thuận giá thấp
    const mock52Weeks: { weekNumber: number; priceVnd: number }[] = [];
    for (let w = 1; w <= 52; w++) {
      let price = 10000;
      if (w >= 26 && w <= 36) {
        price = 16000; // Mùa mưa ngập úng, giá vọt lên 16k
      } else if (w >= 48 || w <= 4) {
        price = 9000;  // Vụ Đông Xuân thuận lợi, giá 9k
      }
      mock52Weeks.push({ weekNumber: w, priceVnd: price });
    }

    const report = calculateSeasonalIndices('bok_choy', mock52Weeks);
    expect(report.weeklyIndices.length).toBe(52);
    expect(report.hasClearSeasonalSignal).toBe(true);
    expect(report.peakToTroughRatio).toBeGreaterThanOrEqual(1.3);
  });
});
