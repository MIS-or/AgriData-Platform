import { GateG7AuditResult } from '@agridata/contracts';
import { B2BManager, globalB2BManager } from '../domain/b2b-manager.js';

export function evaluateGateG7(manager: B2BManager = globalB2BManager): GateG7AuditResult {
  const activeContracts = manager.getActiveContracts();
  const hasPayingContract = activeContracts.length >= 1;

  const costAudit = manager.auditInfrastructureCost('2026-10');
  const totalMonthlyCostVnd = costAudit.totalMonthlyCostVnd;
  const projectedMonthlyRevenueVnd = manager.calculateMonthlyRecurringRevenueVnd();
  const netMonthlyMarginVnd = projectedMonthlyRevenueVnd - totalMonthlyCostVnd;

  const isOperatingCostCovered = totalMonthlyCostVnd <= projectedMonthlyRevenueVnd;

  const secondRegion = manager.getExpansionPlan('LAM_DONG_DALAT');
  const hasSecondRegionExpansionPlan =
    !!secondRegion && !!secondRegion.representativeName && secondRegion.budgetVnd > 0;

  const passed =
    hasPayingContract && isOperatingCostCovered && hasSecondRegionExpansionPlan;

  return {
    hasPayingContract,
    totalMonthlyCostVnd,
    projectedMonthlyRevenueVnd,
    netMonthlyMarginVnd,
    isOperatingCostCovered,
    hasSecondRegionExpansionPlan,
    secondRegionCode: secondRegion?.regionCode || 'NONE',
    passed,
    actionDecision: passed ? 'ENTERPRISE_SCALE' : 'MAINTAIN_NON_PROFIT',
    evaluatedAtIso: new Date().toISOString(),
  };
}
