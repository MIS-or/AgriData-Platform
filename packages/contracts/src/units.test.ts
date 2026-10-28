import { describe, it, expect } from 'vitest';
import { resolveCropCode, convertToVndPerKg } from './index.js';

describe('Crop Dictionary & Unit Conversion Contracts', () => {
  it('resolves crop aliases correctly', () => {
    expect(resolveCropCode('Cải thìa')).toBe('bok_choy');
    expect(resolveCropCode('cải bẹ trắng')).toBe('bok_choy');
    expect(resolveCropCode('Dưa chuột')).toBe('cucumber');
    expect(resolveCropCode('xà lách')).toBe('lettuce');
    expect(resolveCropCode('cây táo lạ')).toBeNull();
  });

  it('converts prices from various units to VND/kg', () => {
    // 1 tạ = 100 kg. Giá 1,200,000 VND / tạ -> 12,000 VND / kg
    const resTa = convertToVndPerKg(1200000, 'ta', 'bok_choy');
    expect(resTa.priceVndPerKg).toBe(12000);

    // 1 yến = 10 kg. Giá 150,000 VND / yến -> 15,000 VND / kg
    const resYen = convertToVndPerKg(150000, 'yen', 'choi_sum');
    expect(resYen.priceVndPerKg).toBe(15000);

    // 1 chục (12 quả) dưa leo ≈ 2.0 kg. Giá 30,000 VND / chục -> 15,000 VND / kg
    const resChuc = convertToVndPerKg(30000, 'chuc', 'cucumber', 12);
    expect(resChuc.priceVndPerKg).toBe(15000);
  });

  it('rejects zero or negative prices', () => {
    expect(() => convertToVndPerKg(0, 'kg', 'bok_choy')).toThrow();
    expect(() => convertToVndPerKg(-5000, 'kg', 'bok_choy')).toThrow();
  });
});
