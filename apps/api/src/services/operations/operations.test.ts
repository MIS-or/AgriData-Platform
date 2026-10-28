import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePopulationStabilityIndex,
  evaluateDataDrift,
} from './retraining-pipeline';
import { B2BManager } from './b2b-manager';
import { evaluateGateG7 } from './gate-g7-evaluator';

describe('Phase 7 Production Operations & B2B Expansion', () => {
  let b2bManager: B2BManager;

  beforeEach(() => {
    b2bManager = new B2BManager();
  });

  describe('Data Drift Detection & Retraining Pipeline (Mã 7.2)', () => {
    it('returns near-zero PSI for identical distributions', () => {
      const baseline = [0.25, 0.25, 0.25, 0.25];
      const current = [0.25, 0.25, 0.25, 0.25];
      const psi = calculatePopulationStabilityIndex(baseline, current);
      expect(psi).toBe(0);

      const metrics = evaluateDataDrift('price_distribution', baseline, current);
      expect(metrics.driftSeverity).toBe('NONE');
      expect(metrics.retrainingRecommended).toBe(false);
    });

    it('detects moderate drift when distribution shifts slightly (0.10 <= PSI <= 0.25)', () => {
      const baseline = [0.4, 0.3, 0.2, 0.1];
      const current = [0.25, 0.35, 0.25, 0.15];
      const metrics = evaluateDataDrift('price_distribution', baseline, current);
      expect(metrics.populationStabilityIndex).toBeGreaterThanOrEqual(0.1);
      expect(metrics.populationStabilityIndex).toBeLessThanOrEqual(0.25);
      expect(metrics.driftSeverity).toBe('MODERATE');
      expect(metrics.retrainingRecommended).toBe(false);
    });

    it('triggers automated retraining recommendation when PSI > 0.25', () => {
      const baseline = [0.5, 0.3, 0.15, 0.05];
      const current = [0.05, 0.15, 0.3, 0.5]; // Heavy market shock
      const metrics = evaluateDataDrift('price_distribution', baseline, current);
      expect(metrics.populationStabilityIndex).toBeGreaterThan(0.25);
      expect(metrics.driftSeverity).toBe('SIGNIFICANT');
      expect(metrics.retrainingRecommended).toBe(true);
    });
  });

  describe('B2B Commercial Contracts & Cloudflare 0$ Infrastructure (Mã 7.4 - 7.6)', () => {
    it('calculates monthly recurring revenue (MRR) from active B2B subscriptions', () => {
      const mrr = b2bManager.calculateMonthlyRecurringRevenueVnd();
      expect(mrr).toBe(3500000); // 3.5M VND from An Phu Tan Coop
    });

    it('guarantees 0 VND/month infrastructure cost on Cloudflare Free Tier', () => {
      const costAudit = b2bManager.auditInfrastructureCost('2026-10');
      expect(costAudit.totalMonthlyCostVnd).toBe(0);
      expect(costAudit.isZeroCostGuaranteed).toBe(true);
      expect(costAudit.cloudflareWorkersPagesVnd).toBe(0);
      expect(costAudit.neonPostgresVnd).toBe(0);
    });

    it('maintains 6-month expansion plan for Region 2 (Lâm Đồng / Đà Lạt)', () => {
      const plan = b2bManager.getExpansionPlan('LAM_DONG_DALAT');
      expect(plan).toBeDefined();
      expect(plan!.province).toBe('Lâm Đồng');
      expect(plan!.representativeName).toBeDefined();
      expect(plan!.budgetVnd).toBeGreaterThan(0);
    });
  });

  describe('Gate G7 Audit Evaluation', () => {
    it('passes Gate G7 with positive operating margin and expansion plan', () => {
      const audit = evaluateGateG7(b2bManager);
      expect(audit.passed).toBe(true);
      expect(audit.hasPayingContract).toBe(true);
      expect(audit.totalMonthlyCostVnd).toBe(0);
      expect(audit.projectedMonthlyRevenueVnd).toBeGreaterThan(0);
      expect(audit.isOperatingCostCovered).toBe(true);
      expect(audit.hasSecondRegionExpansionPlan).toBe(true);
      expect(audit.actionDecision).toBe('ENTERPRISE_SCALE');
    });

    it('fails Gate G7 if there are no paying B2B customers', () => {
      const emptyManager = new B2BManager();
      // Clear all contracts
      (emptyManager as any).contracts.clear();

      const audit = evaluateGateG7(emptyManager);
      expect(audit.passed).toBe(false);
      expect(audit.hasPayingContract).toBe(false);
      expect(audit.actionDecision).toBe('MAINTAIN_NON_PROFIT');
    });
  });
});
