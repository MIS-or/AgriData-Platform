import { z } from 'zod';
import { CropCodeSchema } from './crops.js';
import { UnitCodeSchema } from './units.js';

export const FarmerCropLogSchema = z.object({
  farmerAnonymousId: z.string().min(3), // Mã ẩn danh bảo vệ PII (Nghị định 13)
  cooperativeId: z.string().default('htx_an_phu_tan'),
  cropCode: CropCodeSchema,
  plantingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD'),
  plantedAreaM2: z.number().positive('Diện tích gieo phải lớn hơn 0'),
  estimatedHarvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Chi phí đầu vào ước tính (VNĐ)
  seedCostVnd: z.number().nonnegative().default(0),
  fertilizerCostVnd: z.number().nonnegative().default(0),
  pesticideCostVnd: z.number().nonnegative().default(0),
  laborAndFuelCostVnd: z.number().nonnegative().default(0),

  // Khi đã thu hoạch (nếu có)
  actualYieldKg: z.number().positive().optional(),
  actualSellingPrice: z.number().positive().optional(),
  sellingUnit: UnitCodeSchema.default('kg'),
  buyerType: z.enum(['trader', 'cooperative', 'local_market', 'supermarket']).default('trader'),
  notes: z.string().max(500).optional(),
});

export type FarmerCropLog = z.infer<typeof FarmerCropLogSchema>;

export interface IngestionResponse {
  success: boolean;
  logId: string;
  calculatedBreakevenPriceVndPerKg: number;
  message: string;
  timestamp: string;
}
