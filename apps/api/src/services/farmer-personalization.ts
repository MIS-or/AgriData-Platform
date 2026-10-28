import {
  FarmerProfile,
  FarmerPersonalizedRecommendation,
  PilotCropCode,
  PILOT_CROPS,
} from '@agridata/contracts';

export interface CropCostBenchmark {
  totalCostPerM2: number;
  benchmarkYieldPerM2: number;
  expectedBreakevenPerKg: number;
}

export const PILOT_CROP_COST_BENCHMARKS: Record<PilotCropCode, CropCostBenchmark> = {
  bok_choy: {
    totalCostPerM2: 16500,
    benchmarkYieldPerM2: 2.2,
    expectedBreakevenPerKg: 7500,
  },
  choi_sum: {
    totalCostPerM2: 16000,
    benchmarkYieldPerM2: 2.0,
    expectedBreakevenPerKg: 8000,
  },
  cucumber: {
    totalCostPerM2: 33250,
    benchmarkYieldPerM2: 3.5,
    expectedBreakevenPerKg: 9500,
  },
  lettuce: {
    totalCostPerM2: 21600,
    benchmarkYieldPerM2: 1.8,
    expectedBreakevenPerKg: 12000,
  },
};

export interface AntiHerdRegionalCapacities {
  [cropCode: string]: {
    safeCapacityM2: number;
    currentRegisteredM2: number;
  };
}

export function generatePersonalizedRecommendations(
  farmer: FarmerProfile,
  regionalCapacities: AntiHerdRegionalCapacities,
  marketForecasts: Record<PilotCropCode, { q10: number; q50: number; q90: number }>,
  weatherCaution?: string
): FarmerPersonalizedRecommendation[] {
  const recommendations: FarmerPersonalizedRecommendation[] = [];

  for (const crop of PILOT_CROPS) {
    const benchmark = PILOT_CROP_COST_BENCHMARKS[crop.code];
    const forecast = marketForecasts[crop.code] || { q10: 10000, q50: 13000, q90: 16000 };
    const capacityInfo = regionalCapacities[crop.code] || {
      safeCapacityM2: 10000,
      currentRegisteredM2: 5000,
    };

    // 1. Soil suitability factor
    let soilSuitabilityFactor = 1.0;
    let soilNote = 'Đất phù sa rất thích hợp cho canh tác.';
    if (farmer.soilType === 'sandy_clay') {
      soilSuitabilityFactor = crop.code === 'cucumber' ? 1.05 : 0.95;
      soilNote = 'Đất thịt pha cát, cần bổ sung phân hữu cơ giữ ẩm.';
    } else if (farmer.soilType === 'saline_light') {
      soilSuitabilityFactor = 0.85;
      soilNote = 'Đất có nguy cơ nhiễm mặn nhẹ, chú ý đo độ mặn trước khi tưới.';
    }

    // 2. Anti-herd behavior check (Mã 5.8 & 3.9)
    const capacityRatio = capacityInfo.currentRegisteredM2 / capacityInfo.safeCapacityM2;
    let antiHerdStatus: 'SAFE' | 'WARNING_HIGH_CAPACITY' | 'RESTRICTED' = 'SAFE';
    let antiHerdReason = '';

    if (capacityRatio > 1.2) {
      antiHerdStatus = 'RESTRICTED';
      antiHerdReason = 'Hợp tác xã đã có diện tích đăng ký vượt 120% sức hấp thụ, nguy cơ dội chợ sụt giá.';
    } else if (capacityRatio >= 0.9) {
      antiHerdStatus = 'WARNING_HIGH_CAPACITY';
      antiHerdReason = 'Diện tích đăng ký toàn vùng sắp chạm ngưỡng an toàn, nên cân đối.';
    }

    // 3. Recommended area & capital check
    const plannedArea = Math.min(farmer.totalAreaM2, 1000); // allocate chunk per crop
    const estimatedCostVnd = Math.round(plannedArea * benchmark.totalCostPerM2);
    const hasEnoughCapital = farmer.availableCapitalVnd >= estimatedCostVnd;

    // 4. Yield & Breakeven calculation
    const expectedYieldKg = plannedArea * benchmark.benchmarkYieldPerM2 * soilSuitabilityFactor;
    const breakevenPrice = Math.round(estimatedCostVnd / expectedYieldKg);

    // 5. Final tag determination
    let recommendationTag: 'NEN_TRONG' | 'CAN_NHAC' | 'CHUA_NEN' = 'NEN_TRONG';
    let vietnameseTag: 'Nên trồng' | 'Cân nhắc' | 'Chưa nên' = 'Nên trồng';
    let tagColor: 'green' | 'amber' | 'red' = 'green';
    let reasonSummary = '';

    if (antiHerdStatus === 'RESTRICTED') {
      recommendationTag = 'CHUA_NEN';
      vietnameseTag = 'Chưa nên';
      tagColor = 'red';
      reasonSummary = antiHerdReason;
    } else if (!hasEnoughCapital) {
      recommendationTag = 'CAN_NHAC';
      vietnameseTag = 'Cân nhắc';
      tagColor = 'amber';
      reasonSummary = `Vốn khả dụng chưa đủ chi phí đầu tư khuyến nghị (${estimatedCostVnd.toLocaleString('vi-VN')} đ).`;
    } else if (forecast.q50 < breakevenPrice * 1.05) {
      recommendationTag = 'CHUA_NEN';
      vietnameseTag = 'Chưa nên';
      tagColor = 'red';
      reasonSummary = `Giá dự báo trung vị (${forecast.q50.toLocaleString('vi-VN')} đ) sát hoặc dưới giá hòa vốn (${breakevenPrice.toLocaleString('vi-VN')} đ).`;
    } else if (antiHerdStatus === 'WARNING_HIGH_CAPACITY' || farmer.soilType === 'saline_light') {
      recommendationTag = 'CAN_NHAC';
      vietnameseTag = 'Cân nhắc';
      tagColor = 'amber';
      reasonSummary = antiHerdReason || soilNote;
    } else {
      recommendationTag = 'NEN_TRONG';
      vietnameseTag = 'Nên trồng';
      tagColor = 'green';
      const marginPct = Math.round(((forecast.q50 - breakevenPrice) / breakevenPrice) * 100);
      reasonSummary = `Giá dự báo Q50 cao hơn giá hòa vốn ${marginPct}%, nguồn cung vùng ổn định.`;
    }

    const riskNote = weatherCaution
      ? `${weatherCaution}; ${soilNote}`
      : soilNote;

    recommendations.push({
      cropCode: crop.code,
      cropName: crop.vietnameseName,
      recommendationTag,
      vietnameseTag,
      tagColor,
      allocatedAreaM2: plannedArea,
      estimatedCostVnd,
      breakevenPriceVnd: breakevenPrice,
      expectedPriceRange: forecast,
      reasonSummary,
      riskNote,
      antiHerdStatus,
    });
  }

  // Sort: NEN_TRONG first, then CAN_NHAC, then CHUA_NEN
  const tagPriority = { NEN_TRONG: 1, CAN_NHAC: 2, CHUA_NEN: 3 };
  return recommendations.sort((a, b) => tagPriority[a.recommendationTag] - tagPriority[b.recommendationTag]);
}
