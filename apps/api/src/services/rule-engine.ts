import {
  CropCode,
  FarmerRecommendation,
  RecommendationLabel,
} from '@agridata/contracts';
import { checkAntiHerdSafety } from './anti-herd.js';

export interface CropEvaluationInput {
  cropCode: CropCode;
  breakevenPriceVnd: number;             // Giá hòa vốn (VNĐ/kg)
  expectedPriceVndRange: [number, number]; // [Cận dưới dải 80%, Cận trên dải 80%]
  cooperativeRegisteredAreaM2?: number;  // Diện tích đã đăng ký xuống giống
  cooperativeMaxSafeAreaM2?: number;     // Hạn mức an toàn của HTX
  cooperativeId?: string;
  hasAdverseWeatherAlert?: boolean;      // Cảnh báo bão/ngập úng
}

export function evaluateFarmerRecommendation(
  input: CropEvaluationInput
): FarmerRecommendation {
  const [lowerPrice, upperPrice] = input.expectedPriceVndRange;
  const breakeven = input.breakevenPriceVnd;

  let initialLabel: RecommendationLabel = 'CONSIDER';
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  let plainReason = '';

  // 1. Kiểm tra biên lợi nhuận kỳ vọng so với giá hòa vốn
  // Nếu cận dưới dải 80% vẫn cao hơn 15% giá hòa vốn -> Khả năng lỗ rất thấp
  if (lowerPrice >= breakeven * 1.15 && !input.hasAdverseWeatherAlert) {
    initialLabel = 'RECOMMENDED';
    riskLevel = 'low';
    plainReason = `Giá thu hoạch dự kiến dao động từ ${lowerPrice.toLocaleString('vi-VN')}đ đến ${upperPrice.toLocaleString('vi-VN')}đ/kg, cao hơn mức hòa vốn ${breakeven.toLocaleString('vi-VN')}đ. Thời tiết và thị trường đang thuận lợi.`;
  } else if (upperPrice < breakeven) {
    // Ngay cả kịch bản tốt nhất cũng dưới giá hòa vốn -> Chắc chắn lỗ
    initialLabel = 'NOT_RECOMMENDED';
    riskLevel = 'high';
    plainReason = `Giá dự kiến chỉ đạt tối đa ${upperPrice.toLocaleString('vi-VN')}đ/kg, thấp hơn chi phí sản xuất hòa vốn (${breakeven.toLocaleString('vi-VN')}đ/kg). Nguy cơ thua lỗ cao, bà con không nên xuống giống lứa này.`;
  } else if (input.hasAdverseWeatherAlert) {
    // Có cảnh báo thời tiết cực đoan
    initialLabel = 'NOT_RECOMMENDED';
    riskLevel = 'high';
    plainReason = 'Khu vực có dự báo bão hoặc ngập úng trong 2 tuần tới, dễ làm hư hại lứa rau non và tăng chi phí phân thuốc.';
  } else {
    // Nằm trong vùng tranh chấp (giá hòa vốn nằm giữa cận dưới và cận trên)
    initialLabel = 'CONSIDER';
    riskLevel = 'medium';
    plainReason = `Giá dự kiến nằm sát mức hòa vốn (${breakeven.toLocaleString('vi-VN')}đ/kg). Bà con nên cân nhắc giảm diện tích hoặc chia làm nhiều lứa nhỏ để phòng rủi ro.`;
  }

  // 2. Chạy qua Bộ phân bổ chống hiệu ứng đổ xô (Anti-herd)
  let finalLabel = initialLabel;
  let quotaExceeded = false;

  if (
    input.cooperativeRegisteredAreaM2 !== undefined &&
    input.cooperativeMaxSafeAreaM2 !== undefined
  ) {
    const herdResult = checkAntiHerdSafety(
      {
        cropCode: input.cropCode,
        cooperativeId: input.cooperativeId || 'default_coop',
        registeredAreaM2: input.cooperativeRegisteredAreaM2,
        maxHistoricalSafeAreaM2: input.cooperativeMaxSafeAreaM2,
      },
      initialLabel
    );

    finalLabel = herdResult.adjustedLabel;
    if (!herdResult.isSafe) {
      quotaExceeded = true;
      plainReason = herdResult.warningNote || plainReason;
      riskLevel = 'high';
    }
  }

  const actionTextMap: Record<RecommendationLabel, string> = {
    RECOMMENDED: 'Nên trồng',
    CONSIDER: 'Cân nhắc',
    NOT_RECOMMENDED: 'Chưa nên trồng',
  };

  return {
    cropCode: input.cropCode,
    label: finalLabel,
    actionText: actionTextMap[finalLabel],
    breakevenPriceVnd: breakeven,
    expectedPriceVndRange: input.expectedPriceVndRange,
    riskLevel,
    plainReason,
    allocationQuotaExceeded: quotaExceeded,
    generatedAt: new Date().toISOString(),
  };
}
