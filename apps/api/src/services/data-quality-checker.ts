export interface DailyQualityCheckRow {
  cleanId: number | string;
  rawRecordId: number | string | null;
  cropCode: string;
  marketCode: string;
  priceVndPerKg: number | null;
  recordDate: string;
  isOutlier: boolean;
}

export interface DataQualityReport {
  generatedAt: string;
  gateG2Status: 'PASSED' | 'FAILED';
  totalRowsReceived: number;
  validRowsCount: number;
  missingDataCount: number;
  missingDataPercentage: number;
  untraceableRowsCount: number; // Dòng không truy ngược được về bản thô
  outliersFlaggedCount: number;
  priceRangeViolationsCount: number;
  issuesSummary: string[];
}

/**
 * Bộ kiểm tra chất lượng dữ liệu tự động hằng ngày (Mã việc 2.7 & Cổng G2)
 */
export function runDailyDataQualityCheck(
  rows: DailyQualityCheckRow[],
  expectedPriceBounds = { min: 2000, max: 100000 }
): DataQualityReport {
  const totalRows = rows.length;
  if (totalRows === 0) {
    return {
      generatedAt: new Date().toISOString(),
      gateG2Status: 'FAILED',
      totalRowsReceived: 0,
      validRowsCount: 0,
      missingDataCount: 0,
      missingDataPercentage: 100,
      untraceableRowsCount: 0,
      outliersFlaggedCount: 0,
      priceRangeViolationsCount: 0,
      issuesSummary: ['Không có dữ liệu trong kỳ kiểm tra'],
    };
  }

  let missingCount = 0;
  let untraceableCount = 0;
  let outlierCount = 0;
  let priceRangeViolations = 0;
  const issues: string[] = [];

  for (const row of rows) {
    // 1. Kiểm tra thiếu dữ liệu
    if (row.priceVndPerKg === null || row.priceVndPerKg <= 0) {
      missingCount++;
    } else {
      // 2. Kiểm tra khoảng giá hợp lý theo sinh học/thương mại
      if (
        row.priceVndPerKg < expectedPriceBounds.min ||
        row.priceVndPerKg > expectedPriceBounds.max
      ) {
        priceRangeViolations++;
        issues.push(
          `Dòng #${row.cleanId} (${row.cropCode}): Giá ${row.priceVndPerKg} đ/kg nằm ngoài ngưỡng hợp lý [${expectedPriceBounds.min} - ${expectedPriceBounds.max}]`
        );
      }
    }

    // 3. Kiểm tra tính truy vết (Lineage Traceability - Cổng G2)
    if (!row.rawRecordId) {
      untraceableCount++;
      issues.push(`Dòng #${row.cleanId} vi phạm tính toàn vẹn: Không có raw_record_id truy ngược về bản thô`);
    }

    // 4. Ngoại lệ MAD
    if (row.isOutlier) {
      outlierCount++;
    }
  }

  const missingPercentage = Number(((missingCount / totalRows) * 100).toFixed(2));
  const validRows = totalRows - missingCount - priceRangeViolations;

  // Tiêu chuẩn Cổng G2:
  // - Tỷ lệ thiếu < 10%
  // - 100% dòng sạch truy ngược được về bản thô (untraceableCount === 0)
  // - Không có vi phạm khoảng giá bất hợp lý
  const isGateG2Passed =
    missingPercentage < 10.0 &&
    untraceableCount === 0 &&
    priceRangeViolations === 0;

  return {
    generatedAt: new Date().toISOString(),
    gateG2Status: isGateG2Passed ? 'PASSED' : 'FAILED',
    totalRowsReceived: totalRows,
    validRowsCount: Math.max(0, validRows),
    missingDataCount: missingCount,
    missingDataPercentage: missingPercentage,
    untraceableRowsCount: untraceableCount,
    outliersFlaggedCount: outlierCount,
    priceRangeViolationsCount: priceRangeViolations,
    issuesSummary: issues.slice(0, 10), // Giữ tối đa 10 cảnh báo đầu
  };
}
