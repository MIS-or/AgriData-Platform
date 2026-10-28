/**
 * Module 4 [farmer-advisory] - Public Boundary Facade (Gate G5)
 * Only symbols exported here may be consumed outside the `farmer-advisory` module.
 */
export { farmerRouter } from './api/farmer.routes.js';
export {
  evaluateFarmerRecommendation,
  type CropEvaluationInput,
} from './domain/rule-engine.js';
export { checkAntiHerdSafety } from './domain/anti-herd.js';
export {
  generatePersonalizedRecommendations,
  PILOT_CROP_COST_BENCHMARKS,
  type CropCostBenchmark,
  type AntiHerdRegionalCapacities,
} from './application/farmer-personalization.js';
export {
  generateZaloWeeklyBulletin,
  auditGateG5,
} from './application/zalo-bulletin.js';

