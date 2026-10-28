/**
 * Module 3 [market-intelligence] - Public Boundary Facade (Gate G3 & G4)
 * Only symbols exported here may be consumed outside the `market-intelligence` module.
 */
export { modelsRouter } from './api/models.routes.js';
export {
  evaluateTimeSeriesBacktest,
  type TimeSeriesDataPoint,
  type BacktestEvaluationMetrics,
} from './application/backtest-framework.js';
export {
  generateQuantileForecast,
  type QuantileForecastInput,
  type QuantileForecastResult,
} from './domain/quantile-forecaster.js';
export {
  runMonteCarloProfitSimulation,
  type MonteCarloSimulationInput,
  type MonteCarloSimulationResult,
} from './domain/monte-carlo.js';
export {
  optimizeCropPlotAllocation,
  type CropPortfolioCandidate,
  type OptimizedPlotAllocationItem,
  type PortfolioOptimizationResult,
} from './domain/portfolio-optimizer.js';
export {
  predictBaselineSameWeekLastYear,
  predictBaselineRollingMean,
  type HistoricalWeeklyRow,
} from './domain/baseline-models.js';

