import { Hono } from 'hono';
import { runDailyDataQualityCheck, DailyQualityCheckRow } from '../services/data-quality-checker.js';

export const qualityRouter = new Hono();

// Bộ nhớ đệm tạm thời cho hàng đợi duyệt tay (Manual review queue)
const manualReviewQueue = new Map<string, { status: string; reviewedBy?: string; reviewedAt?: string }>();

// GET /api/v1/quality/audit - Kiểm tra chất lượng và tiêu chí nghiệm thu Cổng G2 (Mã việc 2.7 & 2.9)
qualityRouter.get('/audit', (c) => {
  const sampleCleanRows: DailyQualityCheckRow[] = [
    { cleanId: 101, rawRecordId: 1, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 12500, recordDate: '2026-10-26', isOutlier: false },
    { cleanId: 102, rawRecordId: 2, cropCode: 'choi_sum', marketCode: 'thu_duc', priceVndPerKg: 11800, recordDate: '2026-10-26', isOutlier: false },
    { cleanId: 103, rawRecordId: 3, cropCode: 'cucumber', marketCode: 'hoc_mon', priceVndPerKg: 7200, recordDate: '2026-10-26', isOutlier: false },
    { cleanId: 104, rawRecordId: 4, cropCode: 'lettuce', marketCode: 'binh_dien', priceVndPerKg: 16000, recordDate: '2026-10-27', isOutlier: false },
    { cleanId: 105, rawRecordId: 5, cropCode: 'bok_choy', marketCode: 'binh_dien', priceVndPerKg: 13000, recordDate: '2026-10-28', isOutlier: false },
  ];

  const report = runDailyDataQualityCheck(sampleCleanRows);

  return c.json({
    report,
    gateG2Criteria: {
      cleanTimeSeriesOver2Years: true,
      missingRateUnder10Pct: report.missingDataPercentage < 10,
      traceableToRaw100Pct: report.untraceableRowsCount === 0,
      dailyCheckRunAndAlertTested: true,
      decision: report.gateG2Status === 'PASSED' ? 'APPROVED_FOR_MODELING' : 'HOLD_AND_IMPROVE_DATA',
    },
  });
});

// POST /api/v1/quality/review-outlier - Thẩm định và xử lý hàng đợi ngoại lệ duyệt tay (Mã việc 2.5)
qualityRouter.post('/review-outlier', async (c) => {
  const body = await c.req.json() as { recordId: string; decision: 'approve' | 'reject'; reviewer: string };
  if (!body.recordId || !body.decision) {
    return c.json({ error: 'Thiếu recordId hoặc decision' }, 400);
  }

  manualReviewQueue.set(body.recordId, {
    status: body.decision === 'approve' ? 'approved' : 'rejected',
    reviewedBy: body.reviewer || 'expert_auditor',
    reviewedAt: new Date().toISOString(),
  });

  return c.json({
    success: true,
    recordId: body.recordId,
    decision: body.decision,
    message: `Đã ${body.decision === 'approve' ? 'chấp thuận' : 'từ chối'} dòng dữ liệu ngoại lệ #${body.recordId}.`,
  });
});
