import { describe, it, expect } from 'vitest';
import { evaluateFarmerRecommendation } from './rule-engine.js';

describe('Farmer Recommendation Rule Engine & Anti-Herd Test', () => {
  it('gives RECOMMENDED when expected price range is safely above breakeven', () => {
    const rec = evaluateFarmerRecommendation({
      cropCode: 'bok_choy',
      breakevenPriceVnd: 7500,
      expectedPriceVndRange: [10000, 14000], // Cận dưới 10k > 7.5k * 1.15
    });

    expect(rec.label).toBe('RECOMMENDED');
    expect(rec.actionText).toBe('Nên trồng');
    expect(rec.riskLevel).toBe('low');
    expect(rec.allocationQuotaExceeded).toBe(false);
  });

  it('gives NOT_RECOMMENDED when upper price is strictly below breakeven cost', () => {
    const rec = evaluateFarmerRecommendation({
      cropCode: 'cucumber',
      breakevenPriceVnd: 9500,
      expectedPriceVndRange: [6000, 8500], // Cận trên 8.5k < 9.5k (chắc chắn lỗ)
    });

    expect(rec.label).toBe('NOT_RECOMMENDED');
    expect(rec.actionText).toBe('Chưa nên trồng');
    expect(rec.riskLevel).toBe('high');
    expect(rec.plainReason).toContain('thấp hơn chi phí sản xuất hòa vốn');
  });

  it('downgrades to NOT_RECOMMENDED when anti-herd saturation ratio exceeds 120%', () => {
    // Giá rất tốt, nhưng toàn bộ xã đổ xô trồng vượt 130% diện tích an toàn
    const rec = evaluateFarmerRecommendation({
      cropCode: 'bok_choy',
      breakevenPriceVnd: 7500,
      expectedPriceVndRange: [12000, 16000],
      cooperativeRegisteredAreaM2: 13000,
      cooperativeMaxSafeAreaM2: 10000, // 130%
    });

    expect(rec.label).toBe('NOT_RECOMMENDED');
    expect(rec.allocationQuotaExceeded).toBe(true);
    expect(rec.plainReason).toContain('Cảnh báo đổ xô');
  });

  it('downgrades from RECOMMENDED to CONSIDER when saturation ratio is between 100% and 119%', () => {
    const rec = evaluateFarmerRecommendation({
      cropCode: 'bok_choy',
      breakevenPriceVnd: 7500,
      expectedPriceVndRange: [12000, 16000],
      cooperativeRegisteredAreaM2: 10500,
      cooperativeMaxSafeAreaM2: 10000, // 105%
    });

    expect(rec.label).toBe('CONSIDER');
    expect(rec.actionText).toBe('Cân nhắc');
    expect(rec.allocationQuotaExceeded).toBe(true);
  });
});
