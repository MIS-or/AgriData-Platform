import { describe, it, expect } from 'vitest';
import {
  calculateMedian,
  detectOutliersWithMad,
  PriceRecordForOutlierCheck,
} from './outlier-detection.js';

describe('MAD Outlier Detection Test (Mã việc 2.5)', () => {
  it('correctly computes median for odd and even length arrays', () => {
    expect(calculateMedian([10, 20, 30])).toBe(20);
    expect(calculateMedian([10, 20, 30, 40])).toBe(25);
    expect(calculateMedian([])).toBe(0);
  });

  it('detects extreme price shocks and flags them as outliers without deletion', () => {
    // Chuỗi giá thông thường: 11k, 12k, 12k, 13k, 12.5k, nhưng có 1 ngày giá bị nhập nhầm thành 95k
    const records: PriceRecordForOutlierCheck[] = [
      { id: 1, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 11000, recordDate: '2026-10-01' },
      { id: 2, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12000, recordDate: '2026-10-02' },
      { id: 3, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12500, recordDate: '2026-10-03' },
      { id: 4, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 11800, recordDate: '2026-10-04' },
      { id: 5, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12200, recordDate: '2026-10-05' },
      { id: 6, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 95000, recordDate: '2026-10-06' }, // Ngoại lệ
    ];

    const results = detectOutliersWithMad(records);

    expect(results.length).toBe(6);
    const outlier = results.find((r) => r.recordId === 6);
    expect(outlier).toBeDefined();
    expect(outlier?.isOutlier).toBe(true);
    expect(outlier?.reviewStatus).toBe('flagged');
    expect(outlier?.modifiedZScore).toBeGreaterThan(3.5);
    expect(outlier?.reason).toContain('cao bất thường');

    // Các dòng khác vẫn được duyệt bình thường
    const normal = results.find((r) => r.recordId === 2);
    expect(normal?.isOutlier).toBe(false);
    expect(normal?.reviewStatus).toBe('approved');
  });
});
