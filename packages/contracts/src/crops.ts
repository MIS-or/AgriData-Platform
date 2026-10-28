import { z } from 'zod';

export const CropCodeSchema = z.enum([
  'bok_choy',   // Cải thìa / Cải bẹ trắng
  'choi_sum',   // Cải ngọt
  'cucumber',   // Dưa leo / Dưa chuột
  'lettuce',    // Xà lách
]);

export type CropCode = z.infer<typeof CropCodeSchema>;

export interface CropMetadata {
  code: CropCode;
  vietnameseName: string;
  aliases: string[];
  englishName: string;
  growthDaysMin: number;
  growthDaysMax: number;
  averageYieldKgPer1000m2: number;
  waterSensitivity: 'low' | 'medium' | 'high';
  temperatureRangeCelsius: [number, number];
}

export const CROP_DICTIONARY: Record<CropCode, CropMetadata> = {
  bok_choy: {
    code: 'bok_choy',
    vietnameseName: 'Cải thìa (Cải bẹ trắng)',
    aliases: ['cải thìa', 'cải bẹ trắng', 'cải chíp', 'bok choy'],
    englishName: 'Bok Choy',
    growthDaysMin: 28,
    growthDaysMax: 35,
    averageYieldKgPer1000m2: 2200,
    waterSensitivity: 'high',
    temperatureRangeCelsius: [20, 32],
  },
  choi_sum: {
    code: 'choi_sum',
    vietnameseName: 'Cải ngọt',
    aliases: ['cải ngọt', 'choy sum'],
    englishName: 'Choy Sum',
    growthDaysMin: 30,
    growthDaysMax: 38,
    averageYieldKgPer1000m2: 2000,
    waterSensitivity: 'medium',
    temperatureRangeCelsius: [22, 34],
  },
  cucumber: {
    code: 'cucumber',
    vietnameseName: 'Dưa leo (Dưa chuột)',
    aliases: ['dưa leo', 'dưa chuột'],
    englishName: 'Cucumber',
    growthDaysMin: 40,
    growthDaysMax: 50,
    averageYieldKgPer1000m2: 3500,
    waterSensitivity: 'high',
    temperatureRangeCelsius: [24, 35],
  },
  lettuce: {
    code: 'lettuce',
    vietnameseName: 'Xà lách',
    aliases: ['xà lách', 'rau diếp'],
    englishName: 'Lettuce',
    growthDaysMin: 35,
    growthDaysMax: 45,
    averageYieldKgPer1000m2: 1800,
    waterSensitivity: 'high',
    temperatureRangeCelsius: [18, 28],
  },
};

/**
 * Phân giải tên nông sản thô từ chợ (hỗ trợ tên chứa ghi chú như 'Cải thìa (loại 1)', 'Dưa leo miền Tây')
 */
export function resolveCropCode(input: string): CropCode | null {
  const normalized = input.trim().toLowerCase();

  // 1. Khớp chính xác trước
  for (const crop of Object.values(CROP_DICTIONARY)) {
    if (crop.code === normalized || crop.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return crop.code;
    }
  }

  // 2. Khớp chuỗi con (nếu tên chứa phụ ngữ như 'loại 1', 'Đà Lạt', 'miền Tây')
  for (const crop of Object.values(CROP_DICTIONARY)) {
    if (crop.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      return crop.code;
    }
  }

  return null;
}
