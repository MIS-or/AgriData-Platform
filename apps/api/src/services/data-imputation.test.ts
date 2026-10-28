import { describe, it, expect } from 'vitest';
import { imputeMissingPriceSeries } from './data-imputation.js';

describe('Data Imputation Test (Mã việc 2.6)', () => {
  it('linearly interpolates short gaps (<= 14 days)', () => {
    // Ngày 2026-10-01 (10,000) và 2026-10-03 (12,000) -> Ngày 2026-10-02 bị khuyết
    const input = [
      { date: '2026-10-01', priceVndPerKg: 10000 },
      { date: '2026-10-02', priceVndPerKg: null },
      { date: '2026-10-03', priceVndPerKg: 12000 },
    ];

    const result = imputeMissingPriceSeries(input);

    expect(result.length).toBe(3);
    expect(result[1]?.priceVndPerKg).toBe(11000); // Trung bình cộng tuyến tính
    expect(result[1]?.isImputed).toBe(true);
    expect(result[1]?.imputationMethod).toBe('linear');
  });

  it('leaves long gaps (> 14 days) empty and records missing reason', () => {
    const input = [
      { date: '2026-09-01', priceVndPerKg: 10000 },
      { date: '2026-09-20', priceVndPerKg: null }, // Cách 25 ngày
      { date: '2026-09-26', priceVndPerKg: 15000 },
    ];

    const result = imputeMissingPriceSeries(input);

    expect(result[1]?.priceVndPerKg).toBeNull();
    expect(result[1]?.isImputed).toBe(false);
    expect(result[1]?.missingReason).toContain('long_gap_unobserved');
  });
});
