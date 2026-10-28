export interface TimeSeriesDataPoint {
  date: string;
  actualPriceVnd: number;
  predictedPriceVnd: number;
  predictedLower80Vnd: number; // Q10
  predictedUpper80Vnd: number; // Q90
}

export interface BacktestEvaluationMetrics {
  cropCode: string;
  modelName: string;
  sampleCount: number;
  mae: number;              // Mean Absolute Error (VNĐ)
  mape: number;             // Mean Absolute Percentage Error (%)
  coverage80Pct: number;    // Tỷ lệ % giá thật nằm trong dải [Q10, Q90]
  isCoverageValidG3: boolean; // 72% <= Coverage <= 88%
  beatsBaseline: boolean;   // Có thắng mốc so sánh không
}

/**
 * Khung kiểm định ngược chuỗi thời gian không rò rỉ dữ liệu (Mã việc 3.2 & Cổng G3)
 */
export function evaluateTimeSeriesBacktest(
  cropCode: string,
  modelName: string,
  points: TimeSeriesDataPoint[],
  baselineMae?: number
): BacktestEvaluationMetrics {
  if (points.length === 0) {
    throw new Error('Cần ít nhất 1 điểm dữ liệu để đánh giá kiểm định');
  }

  let totalAbsError = 0;
  let totalPctError = 0;
  let insideCoverageCount = 0;

  for (const pt of points) {
    const absError = Math.abs(pt.actualPriceVnd - pt.predictedPriceVnd);
    totalAbsError += absError;
    totalPctError += (absError / Math.max(pt.actualPriceVnd, 1)) * 100;

    // Kiểm tra điểm thực tế có nằm trong dải 80% [Lower, Upper]
    if (
      pt.actualPriceVnd >= pt.predictedLower80Vnd &&
      pt.actualPriceVnd <= pt.predictedUpper80Vnd
    ) {
      insideCoverageCount++;
    }
  }

  const mae = Math.round(totalAbsError / points.length);
  const mape = Number((totalPctError / points.length).toFixed(2));
  const coverage80Pct = Number(((insideCoverageCount / points.length) * 100).toFixed(2));

  // Tiêu chí Cổng G3: Độ phủ dải 80% phải đạt từ 72% đến 88%
  const isCoverageValidG3 = coverage80Pct >= 72.0 && coverage80Pct <= 88.0;
  const beatsBaseline = baselineMae !== undefined ? mae < baselineMae : true;

  return {
    cropCode,
    modelName,
    sampleCount: points.length,
    mae,
    mape,
    coverage80Pct,
    isCoverageValidG3,
    beatsBaseline,
  };
}
