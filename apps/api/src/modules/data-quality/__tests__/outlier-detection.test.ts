import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  detectOutliersWithMad,
  PriceRecordForOutlierCheck,
} from '../domain/outlier-detection.js';
import { calculateSeasonalIndices } from '../domain/seasonal-analysis.js';

describe('Module 2 [data-quality]: MAD Outlier Detection & Seasonal Signal Test', () => {
  it('correctly computes median for odd and even length arrays', () => {
    expect(calculateMedian([10, 20, 30])).toBe(20);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([])).toBe(0);
  });

  it('detects extreme price shocks and flags them as outliers without deletion', () => {
    const records: PriceRecordForOutlierCheck[] = [
      { id: 1, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 11000, recordDate: '2026-10-01' },
      { id: 2, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12000, recordDate: '2026-10-02' },
      { id: 3, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12500, recordDate: '2026-10-03' },
      { id: 4, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 11800, recordDate: '2026-10-04' },
      { id: 5, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12200, recordDate: '2026-10-05' },
      { id: 6, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 95000, recordDate: '2026-10-06' },
    ];

    const results = detectOutliersWithMad(records);

    expect(results.length).toBe(6);
    const outlier = results.find((r) => r.recordId === 6);
    expect(outlier).toBeDefined();
    expect(outlier?.isOutlier).toBe(true);
    expect(outlier?.reviewStatus).toBe('flagged');
    expect(outlier?.modifiedZScore).toBeGreaterThan(3.5);
    expect(outlier?.reason).toContain('cao bất thường');

    const normal = results.find((r) => r.recordId === 2);
    expect(normal?.isOutlier).toBe(false);
    expect(normal?.reviewStatus).toBe('approved');
  });

  it('detects clear seasonal signal from 52 weeks historical price series', () => {
    const mock52Weeks: { weekNumber: number; priceVnd: number }[] = [];
    for (let w = 1; w <= 52; w++) {
      let price = 10000;
      if (w >= 26 && w <= 36) {
        price = 16000;
      } else if (w >= 48 || w <= 4) {
        price = 9000;
      }
      mock52Weeks.push({ weekNumber: w, priceVnd: price });
    }

    const report = calculateSeasonalIndices('bok_choy', mock52Weeks);
    expect(report.weeklyIndices.length).toBe(52);
    expect(report.hasClearSeasonalSignal).toBe(true);
    expect(report.peakToTroughRatio).toBeGreaterThanOrEqual(1.3);
  });
});
