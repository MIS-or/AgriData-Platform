import { z } from 'zod';

export type B2BSubscriptionTier = 'FREE_TRIAL' | 'COOP_STANDARD' | 'ENTERPRISE';

export interface B2BContractAgreement {
  contractId: string;
  clientName: string;
  clientType: 'COOPERATIVE' | 'OFFTAKER' | 'INPUT_SUPPLIER';
  tier: B2BSubscriptionTier;
  monthlyFeeVnd: number;
  signedAtIso: string;
  effectiveFromIso: string;
  effectiveToIso: string;
  status: 'ACTIVE' | 'PENDING' | 'TERMINATED';
  contactPerson: string;
}

export const B2BContractAgreementSchema = z.object({
  contractId: z.string().min(1),
  clientName: z.string().min(1),
  clientType: z.enum(['COOPERATIVE', 'OFFTAKER', 'INPUT_SUPPLIER']),
  tier: z.enum(['FREE_TRIAL', 'COOP_STANDARD', 'ENTERPRISE']),
  monthlyFeeVnd: z.number().nonnegative(),
  signedAtIso: z.string(),
  effectiveFromIso: z.string(),
  effectiveToIso: z.string(),
  status: z.enum(['ACTIVE', 'PENDING', 'TERMINATED']),
  contactPerson: z.string().min(1),
});

export interface RegionalExpansionPlan {
  regionCode: string; // e.g. LAM_DONG_DALAT
  regionName: string;
  province: string;
  representativeName: string;
  targetCrops: string[];
  launchTargetDateIso: string;
  budgetVnd: number;
  status: 'PLANNING' | 'SURVEYING' | 'READY';
}

export interface CloudflareFreeServiceSpec {
  serviceId:
    | 'CLOUDFLARE_PAGES'
    | 'CLOUDFLARE_WORKERS_CRON'
    | 'CLOUDFLARE_D1_SQL'
    | 'CLOUDFLARE_WORKERS_KV'
    | 'CLOUDFLARE_R2_STORAGE'
    | 'CLOUDFLARE_HYPERDRIVE'
    | 'CLOUDFLARE_WORKERS_AI'
    | 'CLOUDFLARE_VECTORIZE'
    | 'CLOUDFLARE_ANALYTICS_ENGINE'
    | 'CLOUDFLARE_TURNSTILE';
  serviceName: string;
  bindingName: string;
  freeTierQuota: string;
  currentUsageSummary: string;
  utilizationPercent: number;
  purposeInAgriData: string;
  monthlyCostVnd: number; // Always 0 VND on Free Tier
  status: 'ACTIVE_EDGE' | 'ACTIVE_LOCAL_FALLBACK';
}

export interface CloudflareFreeTierSuiteReport {
  totalServicesConfigured: number;
  activeServicesCount: number;
  totalMonthlyCostVnd: number;
  isZeroWasteOptimized: boolean;
  services: CloudflareFreeServiceSpec[];
  evaluatedAtIso: string;
}

export interface InfrastructureCostAudit {
  evaluatedMonth: string;
  cloudflareWorkersPagesVnd: number; // 0 VND on free tier
  neonPostgresVnd: number;           // 0 VND on free tier
  openMeteoApiVnd: number;           // 0 VND non-commercial open API
  domainDnsVnd: number;              // 0 VND with pages.dev
  totalMonthlyCostVnd: number;       // 0 VND
  isZeroCostGuaranteed: boolean;
  notes: string;
}

export interface DataDriftMetrics {
  featureName: string;
  populationStabilityIndex: number; // PSI
  driftSeverity: 'NONE' | 'MODERATE' | 'SIGNIFICANT';
  retrainingRecommended: boolean;
  evaluatedAtIso: string;
}

export interface GateG7AuditResult {
  hasPayingContract: boolean;
  totalMonthlyCostVnd: number;
  projectedMonthlyRevenueVnd: number;
  netMonthlyMarginVnd: number;
  isOperatingCostCovered: boolean;
  hasSecondRegionExpansionPlan: boolean;
  secondRegionCode: string;
  passed: boolean;
  actionDecision: 'ENTERPRISE_SCALE' | 'MAINTAIN_NON_PROFIT';
  evaluatedAtIso: string;
}
