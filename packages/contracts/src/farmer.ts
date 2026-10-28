import { z } from 'zod';
import { PilotCropCode } from './crops';

export type SoilType = 'alluvial' | 'sandy_clay' | 'saline_light';

export interface FarmerProfile {
  farmerId: string;
  name: string;
  phone: string;
  coopId: string;
  coopName: string;
  totalAreaM2: number;
  availableCapitalVnd: number;
  soilType: SoilType;
  experienceYears: number;
}

export const FarmerProfileSchema = z.object({
  farmerId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(8),
  coopId: z.string().min(1),
  coopName: z.string().min(1),
  totalAreaM2: z.number().positive(),
  availableCapitalVnd: z.number().nonnegative(),
  soilType: z.enum(['alluvial', 'sandy_clay', 'saline_light']),
  experienceYears: z.number().nonnegative(),
});

export type RecommendationTag = 'NEN_TRONG' | 'CAN_NHAC' | 'CHUA_NEN';

export interface FarmerPersonalizedRecommendation {
  cropCode: PilotCropCode;
  cropName: string;
  recommendationTag: RecommendationTag;
  vietnameseTag: 'Nên trồng' | 'Cân nhắc' | 'Chưa nên';
  tagColor: 'green' | 'amber' | 'red';
  allocatedAreaM2: number;
  estimatedCostVnd: number;
  breakevenPriceVnd: number;
  expectedPriceRange: {
    q10: number;
    q50: number;
    q90: number;
  };
  reasonSummary: string;
  riskNote: string;
  antiHerdStatus: 'SAFE' | 'WARNING_HIGH_CAPACITY' | 'RESTRICTED';
}

export interface ZaloBulletinMessage {
  broadcastWeek: string;
  coopId: string;
  coopName: string;
  targetAudienceCount: number;
  sentAtIso: string;
  title: string;
  cropsSummary: Array<{
    cropName: string;
    tag: string;
    priceRangeText: string;
    breakevenText: string;
  }>;
  weatherAlert: string;
  antiHerdNotice?: string;
  disclaimerText: string;
  actionUrl: string;
}

export interface GateG5AuditResult {
  passed: boolean;
  comprehensionRate: number; // target >= 80% (8/10 farmers)
  zaloConsecutiveWeeksSent: number; // target >= 4
  zaloDeliveryFailureCount: number; // target === 0
  legalVetted: boolean; // target true
  checkedAt: string;
}
