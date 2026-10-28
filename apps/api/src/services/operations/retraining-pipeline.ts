import { DataDriftMetrics } from '@agridata/contracts';

/**
 * Tính toán Chỉ số Ổn định Dân số (Population Stability Index - PSI) để phát hiện trôi dữ liệu (Mã 7.2)
 * PSI = sum( (Actual% - Expected%) * ln(Actual% / Expected%) )
 */
export function calculatePopulationStabilityIndex(
  baselineDistribution: number[], // Expected probabilities per bin
  currentDistribution: number[]   // Actual probabilities per bin
): number {
  if (baselineDistribution.length !== currentDistribution.length) {
    throw new Error('Số lượng bin phân phối cơ sở và hiện tại phải bằng nhau');
  }

  let psi = 0;
  const epsilon = 1e-4; // Tránh chia cho 0 và ln(0)

  for (let i = 0; i < baselineDistribution.length; i++) {
    const expected = Math.max(baselineDistribution[i]!, epsilon);
    const actual = Math.max(currentDistribution[i]!, epsilon);

    const term = (actual - expected) * Math.log(actual / expected);
    psi += term;
  }

  return Number(psi.toFixed(4));
}

/**
 * Đánh giá độ trôi dữ liệu và khuyến nghị huấn luyện lại mô hình
 */
export function evaluateDataDrift(
  featureName: string,
  baselineDistribution: number[],
  currentDistribution: number[]
): DataDriftMetrics {
  const psi = calculatePopulationStabilityIndex(baselineDistribution, currentDistribution);

  let driftSeverity: 'NONE' | 'MODERATE' | 'SIGNIFICANT' = 'NONE';
  let retrainingRecommended = false;

  if (psi > 0.25) {
    driftSeverity = 'SIGNIFICANT';
    retrainingRecommended = true;
  } else if (psi >= 0.1) {
    driftSeverity = 'MODERATE';
    retrainingRecommended = false; // Theo dõi thêm
  } else {
    driftSeverity = 'NONE';
    retrainingRecommended = false;
  }

  return {
    featureName,
    populationStabilityIndex: psi,
    driftSeverity,
    retrainingRecommended,
    evaluatedAtIso: new Date().toISOString(),
  };
}
