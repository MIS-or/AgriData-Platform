/**
 * Module 2 [data-quality] - Public Boundary Facade (Gate G2)
 * Only symbols exported here may be consumed outside the `data-quality` module.
 */
export { qualityRouter } from './api/quality.routes.js';
export { martsRouter } from './api/marts.routes.js';
export {
  runDailyDataQualityCheck,
  type DailyQualityCheckRow,
  type DataQualityReport,
} from './application/data-quality-checker.js';
export {
  aggregateCleanPricesToMarts,
  getYearWeekString,
  type CleanPriceInput,
  type WeeklyMartsMetric,
} from './application/marts-aggregator.js';
export {
  calculateMedian,
  detectOutliersWithMad,
  type PriceRecordForOutlierCheck,
  type OutlierCheckResult,
} from './domain/outlier-detection.js';
export {
  imputeMissingPriceSeries,
  type DatedPricePoint,
} from './domain/data-imputation.js';
export {
  calculateSeasonalIndices,
  type WeeklySeasonalPoint,
  type SeasonalSignalReport,
} from './domain/seasonal-analysis.js';
