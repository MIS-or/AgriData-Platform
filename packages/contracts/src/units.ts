import { z } from 'zod';
import { CropCode } from './crops.js';

export const UnitCodeSchema = z.enum([
  'kg',
  'yen',     // 10 kg
  'ta',      // 100 kg
  'tan',     // 1000 kg
  'chuc',    // 12 hoặc 14 quả/bó (tùy giống)
]);

export type UnitCode = z.infer<typeof UnitCodeSchema>;

export const UNIT_MULTIPLIERS_KG: Record<Exclude<UnitCode, 'chuc'>, number> = {
  kg: 1,
  yen: 10,
  ta: 100,
  tan: 1000,
};

// Ước tính kg/chục (12 quả/bó) theo từng loại cây
export const CHUC_AVERAGE_KG: Record<CropCode, number> = {
  bok_choy: 1.5,   // 1 chục cải thìa ≈ 1.5 kg
  choi_sum: 1.2,   // 1 chục cải ngọt ≈ 1.2 kg
  cucumber: 2.0,   // 1 chục dưa leo ≈ 2.0 kg
  lettuce: 1.0,    // 1 chục xà lách ≈ 1.0 kg
};

export interface PriceConversionResult {
  priceVndPerKg: number;
  originalPrice: number;
  originalUnit: UnitCode;
  cropCode: CropCode;
}

export function convertToVndPerKg(
  price: number,
  unit: UnitCode,
  cropCode: CropCode,
  chucCount: 12 | 14 = 12
): PriceConversionResult {
  if (price <= 0) {
    throw new Error(`Giá nông sản phải là số dương, nhận được: ${price}`);
  }

  if (unit === 'chuc') {
    const avgKgPerUnit = CHUC_AVERAGE_KG[cropCode] * (chucCount / 12);
    const priceVndPerKg = Math.round(price / avgKgPerUnit);
    return {
      priceVndPerKg,
      originalPrice: price,
      originalUnit: unit,
      cropCode,
    };
  }

  const multiplier = UNIT_MULTIPLIERS_KG[unit];
  const priceVndPerKg = Math.round(price / multiplier);

  return {
    priceVndPerKg,
    originalPrice: price,
    originalUnit: unit,
    cropCode,
  };
}
