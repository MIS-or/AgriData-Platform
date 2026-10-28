import { describe, it, expect } from 'vitest';
import {
  runDailyDataQualityCheck,
  DailyQualityCheckRow,
} from './data-quality-checker.js';

describe('Daily Data Quality Checker & Gate G2 Test (Mã việc 2.7 & Cổng G2)', () => {
  it('passes Gate G2 when data is complete, traceable, and prices within bounds', () => {
    const goodRows: DailyQualityCheckRow[] = [
      { cleanId: 1, rawRecordId: 101, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12000, recordDate: '2026-10-20', isOutlier: false },
      { cleanId: 2, rawRecordId: 102, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12500, recordDate: '2026-10-21', isOutlier: false },
      { cleanId: 3, rawRecordId: 103, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 13000, recordDate: '2026-10-22', isOutlier: false },
    ];

    const report = runDailyDataQualityCheck(goodRows);

    expect(report.gateG2Status).toBe('PASSED');
    expect(report.missingDataPercentage).toBe(0);
    expect(report.untraceableRowsCount).toBe(0);
  });

  it('fails Gate G2 when rows cannot be traced back to raw source (Traceability Violation)', () => {
    const brokenLineageRows: DailyQualityCheckRow[] = [
      { cleanId: 1, rawRecordId: null, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12000, recordDate: '2026-10-20', isOutlier: false },
    ];

    const report = runDailyDataQualityCheck(brokenLineageRows);

    expect(report.gateG2Status).toBe('FAILED');
    expect(report.untraceableRowsCount).toBe(1);
    expect(report.issuesSummary[0]).toContain('Không có raw_record_id');
  });

  it('fails Gate G2 when price violates biological/market feasibility bounds', () => {
    const crazyPriceRows: DailyQualityCheckRow[] = [
      { cleanId: 1, rawRecordId: 101, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 500000, recordDate: '2026-10-20', isOutlier: false },
    ];

    const report = runDailyDataQualityCheck(crazyPriceRows);

    expect(report.gateG2Status).toBe('FAILED');
    expect(report.priceRangeViolationsCount).toBe(1);
  });
});
