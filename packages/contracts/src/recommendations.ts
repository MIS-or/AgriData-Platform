import { z } from 'zod';
import { CropCodeSchema } from './crops.js';

export const RecommendationLabelSchema = z.enum([
  'RECOMMENDED',       // 🟢 Nên trồng
  'CONSIDER',          // 🟡 Cân nhắc
  'NOT_RECOMMENDED',   // 🔴 Chưa nên trồng
]);

export type RecommendationLabel = z.infer<typeof RecommendationLabelSchema>;

export const FarmerRecommendationSchema = z.object({
  cropCode: CropCodeSchema,
  label: RecommendationLabelSchema,
  actionText: z.string(),              // "Nên trồng", "Cân nhắc", "Chưa nên"
  breakevenPriceVnd: z.number(),       // Giá hòa vốn ước tính (VNĐ/kg)
  expectedPriceVndRange: z.tuple([z.number(), z.number()]), // [thấp, cao]
  riskLevel: z.enum(['low', 'medium', 'high']),
  plainReason: z.string(),             // Lý do bình dân dễ hiểu
  allocationQuotaExceeded: z.boolean(), // Có vượt ngưỡng đổ xô của HTX không
  generatedAt: z.string().datetime(),
});

export type FarmerRecommendation = z.infer<typeof FarmerRecommendationSchema>;

export interface AntiHerdCheckParams {
  cropCode: string;
  cooperativeId: string;
  registeredAreaM2: number;
  maxHistoricalSafeAreaM2: number;
}

export interface AntiHerdCheckResult {
  isSafe: boolean;
  saturationRatio: number; // e.g. 1.25 = 125%
  adjustedLabel: RecommendationLabel;
  warningNote?: string;
}
