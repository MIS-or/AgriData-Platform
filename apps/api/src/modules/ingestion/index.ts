/**
 * Module 1 [ingestion] - Public Boundary Facade (Gate G0 & G1)
 * Only symbols exported here may be consumed outside the `ingestion` module.
 */
export { sourcesRouter } from './api/sources.routes.js';
export { ingestRouter } from './api/ingest.routes.js';
export {
  fetchOpenMeteoWeather,
  PILOT_REGION_1,
  type WeatherMetricsDaily,
  type RegionCoordinates,
} from './application/weather.js';
export {
  parseWholesaleMarketReport,
  type ScrapedMarketPriceItem,
} from './application/market-scraper.js';
export {
  fetchWithRetry,
  calculateSha256,
  type RawScrapeResult,
} from './domain/scraper-base.js';

