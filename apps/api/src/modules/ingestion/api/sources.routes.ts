import { Hono } from 'hono';
import { CANDIDATE_15_DATA_SOURCES } from '@agridata/contracts';

export const sourcesRouter = new Hono();

// GET /api/v1/sources - Danh mục 15 nguồn dữ liệu khảo sát (Mã việc 0.3)
sourcesRouter.get('/', (c) => {
  const stableCount = CANDIDATE_15_DATA_SOURCES.filter((s) => s.isStable).length;
  const sampleSuccessCount = CANDIDATE_15_DATA_SOURCES.filter((s) => s.sampleDataRetrieved).length;

  return c.json({
    totalSources: CANDIDATE_15_DATA_SOURCES.length,
    stableSources: stableCount,
    sampleRetrievedCount: sampleSuccessCount,
    gateG0ConditionMet: stableCount >= 3, // Tiêu chuẩn Cổng G0: Ít nhất 3 nguồn ổn định
    sources: CANDIDATE_15_DATA_SOURCES,
  });
});
