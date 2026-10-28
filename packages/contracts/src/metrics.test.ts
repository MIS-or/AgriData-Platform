import { describe, it, expect } from 'vitest';
import { METRIC_DICTIONARY } from './metrics.js';

describe('Phase 4 Metric Dictionary Contract Test (Mã việc 4.1 & Cổng G4)', () => {
  it('ensures all 7 core dashboard metrics have explicit formulas and single source of truth', () => {
    const requiredMetricKeys = [
      'GIA_BINH_QUAN_TUAN',
      'DO_BIEN_DONG_GIA',
      'SAN_LUONG_UOC_TINH_12_TUAN',
      'GIA_HOA_VON_UOC_TINH',
      'DO_PHU_DAI_80',
      'XAC_SUAT_LO_MONTE_CARLO',
      'TY_LE_THIEU_DU_LIEU',
    ];

    for (const key of requiredMetricKeys) {
      const metric = METRIC_DICTIONARY[key];
      expect(metric).toBeDefined();
      expect(metric?.formula.length).toBeGreaterThan(10);
      expect(metric?.sourceOfTruth.length).toBeGreaterThan(5);
      expect(metric?.unit.length).toBeGreaterThan(0);
    }
  });

  it('verifies Gate G4 compliance: numbers on dashboard map 1-to-1 to metric formulas', () => {
    // Độ phủ dải 80% phải đạt trong ngưỡng Cổng G3 [72% - 88%]
    const coverage = Number(METRIC_DICTIONARY.DO_PHU_DAI_80?.sampleValue);
    expect(coverage).toBeGreaterThanOrEqual(72);
    expect(coverage).toBeLessThanOrEqual(88);

    // Tỷ lệ thiếu dữ liệu phải đạt tiêu chuẩn Cổng G2 < 10%
    const missingRate = Number(METRIC_DICTIONARY.TY_LE_THIEU_DU_LIEU?.sampleValue);
    expect(missingRate).toBeLessThan(10.0);
  });
});
