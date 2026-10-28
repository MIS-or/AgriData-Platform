/**
 * Module 5 [field-experiment] - Public Boundary Facade (Gate G6)
 * Only symbols exported here may be consumed outside the `field-experiment` module.
 */
export { fieldAuditRouter } from './api/field-audit.routes.js';
export { ForecastVault, globalForecastVault } from './domain/forecast-vault.js';
export {
  analyzeForecastAccuracy,
  compareCohortImpact,
  evaluateRankingDecisions,
  type PostHarvestComparison,
  type RankingDecisionEvaluation,
} from './domain/impact-analyzer.js';
export { evaluateGateG6 } from './application/gate-g6-evaluator.js';
