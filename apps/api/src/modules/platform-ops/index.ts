/**
 * Module 6 [platform-ops] - Public Boundary Facade (Gate G7)
 * Only symbols exported here may be consumed outside the `platform-ops` module.
 */
export { operationsRouter } from './api/operations.routes.js';
export { B2BManager, globalB2BManager } from './domain/b2b-manager.js';
export {
  calculatePopulationStabilityIndex,
  evaluateDataDrift,
} from './domain/retraining-pipeline.js';
export { evaluateGateG7 } from './application/gate-g7-evaluator.js';

