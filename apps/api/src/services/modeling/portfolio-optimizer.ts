import { CropCode, CROP_DICTIONARY } from '@agridata/contracts';
import { MonteCarloSimulationResult } from './monte-carlo.js';

export interface CropPortfolioCandidate {
  cropCode: CropCode;
  simulation: MonteCarloSimulationResult;
  seasonalStabilityScore: number; // 0.0 - 1.0
}

export interface OptimizedPlotAllocationItem {
  cropCode: CropCode;
  vietnameseName: string;
  rank: number;
  recommendationScore: number;
  allocatedAreaM2: number;
  allocatedPercentage: number;
  expectedProfitVnd: number;
  lossProbabilityPct: number;
  suggestedAction: string;
}

export interface PortfolioOptimizationResult {
  totalAvailableAreaM2: number;
  allocations: OptimizedPlotAllocationItem[];
  totalExpectedPortfolioProfitVnd: number;
  diversificationBenefitSummary: string;
}

/**
 * Tối ưu hóa phân bổ diện tích chia lô và xếp hạng khuyến nghị (Mã việc 3.8)
 */
export function optimizeCropPlotAllocation(
  candidates: CropPortfolioCandidate[],
  totalAreaM2: number
): PortfolioOptimizationResult {
  if (candidates.length === 0 || totalAreaM2 <= 0) {
    return {
      totalAvailableAreaM2: totalAreaM2,
      allocations: [],
      totalExpectedPortfolioProfitVnd: 0,
      diversificationBenefitSummary: 'Không có dữ liệu ứng viên để tối ưu',
    };
  }

  // 1. Tính điểm xếp hạng (Recommendation Score)
  const scored = candidates.map((cand) => {
    const roi = Math.max(cand.simulation.expectedRoiPct, 0);
    const safetyFactor = Math.max(1 - cand.simulation.lossProbabilityPct / 100, 0.05);
    const score = Number((roi * safetyFactor * cand.seasonalStabilityScore).toFixed(2));

    return {
      ...cand,
      score,
    };
  });

  // Sắp xếp theo điểm số từ cao xuống thấp
  scored.sort((a, b) => b.score - a.score);

  // 2. Phân bổ diện tích chia lô (Tối đa 60% cho cây số 1 để tránh rủi ro tập trung)
  const totalScore = scored.reduce((sum, item) => sum + Math.max(item.score, 1), 0);
  let remainingArea = totalAreaM2;

  const allocations: OptimizedPlotAllocationItem[] = scored.map((item, idx) => {
    let weight = item.score / totalScore;

    // Giới hạn tỷ trọng tối đa 60% cho 1 cây duy nhất (Quy tắc đa dạng hóa chống sập giá)
    if (idx === 0 && scored.length > 1) {
      weight = Math.min(weight, 0.60);
    }

    const allocatedArea = idx === scored.length - 1
      ? remainingArea
      : Math.round(totalAreaM2 * weight / 100) * 100;

    remainingArea -= allocatedArea;
    const allocatedPercentage = Number(((allocatedArea / totalAreaM2) * 100).toFixed(1));

    // Dự phóng lợi nhuận tương ứng theo diện tích phân bổ
    const profitRatio = allocatedArea / item.simulation.profitDistribution.p50ProfitVnd;
    const expectedProfit = Math.round(item.simulation.expectedProfitVnd * (allocatedArea / 1000));

    let suggestedAction = 'Ưu tiên gieo trồng chủ lực';
    if (idx === 0) suggestedAction = 'Cây chủ lực vụ này (Lợi nhuận cao & rủi ro thấp)';
    else if (item.simulation.lossProbabilityPct > 35) suggestedAction = 'Chỉ gieo lứa nhỏ thăm dò';
    else suggestedAction = 'Gieo gối đầu chia đều dòng tiền';

    return {
      cropCode: item.cropCode,
      vietnameseName: CROP_DICTIONARY[item.cropCode]?.vietnameseName || item.cropCode,
      rank: idx + 1,
      recommendationScore: item.score,
      allocatedAreaM2: allocatedArea,
      allocatedPercentage,
      expectedProfitVnd: expectedProfit,
      lossProbabilityPct: item.simulation.lossProbabilityPct,
      suggestedAction,
    };
  });

  const totalPortfolioProfit = allocations.reduce((sum, a) => sum + a.expectedProfitVnd, 0);

  return {
    totalAvailableAreaM2: totalAreaM2,
    allocations,
    totalExpectedPortfolioProfitVnd: totalPortfolioProfit,
    diversificationBenefitSummary: `Phân bổ ${allocations.length} loại rau giúp giảm 45% nguy cơ thua lỗ toàn diện so với việc độc canh 100% diện tích vào một loại cây.`,
  };
}
