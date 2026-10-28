import {
  AntiHerdCheckParams,
  AntiHerdCheckResult,
  RecommendationLabel,
} from '@agridata/contracts';

/**
 * Thuật toán phân bổ chống hiệu ứng đổ xô (Anti-herd behavior allocation).
 * Ngăn chặn tình trạng nhiều hộ trong cùng HTX/vùng ồ ạt xuống giống cùng một cây
 * làm sụp đổ giá ở chu kỳ thu hoạch 30 ngày sau.
 */
export function checkAntiHerdSafety(
  params: AntiHerdCheckParams,
  originalLabel: RecommendationLabel
): AntiHerdCheckResult {
  const { registeredAreaM2, maxHistoricalSafeAreaM2, cropCode } = params;

  if (maxHistoricalSafeAreaM2 <= 0) {
    return {
      isSafe: true,
      saturationRatio: 1.0,
      adjustedLabel: originalLabel,
    };
  }

  const saturationRatio = Number((registeredAreaM2 / maxHistoricalSafeAreaM2).toFixed(2));

  // Ngưỡng 1: Vượt quá 120% diện tích thường -> Nguy cơ dư cung cao
  if (saturationRatio >= 1.2) {
    return {
      isSafe: false,
      saturationRatio,
      adjustedLabel: 'NOT_RECOMMENDED',
      warningNote: `Cảnh báo đổ xô: Diện tích gieo đăng ký trong HTX cho cây ${cropCode} đã đạt ${(saturationRatio * 100).toFixed(0)}% mức bình thường. Nguy cơ dội chợ rất cao khi thu hoạch!`,
    };
  }

  // Ngưỡng 2: Từ 100% đến 119% -> Chuyển sang Cân nhắc nếu ban đầu là Nên trồng
  if (saturationRatio >= 1.0) {
    return {
      isSafe: false,
      saturationRatio,
      adjustedLabel: originalLabel === 'RECOMMENDED' ? 'CONSIDER' : originalLabel,
      warningNote: `Diện tích đăng ký của vùng đã đạt ${(saturationRatio * 100).toFixed(0)}%. Nên cân nhắc chia nhỏ lứa gieo để tránh thu hoạch dồn dập.`,
    };
  }

  // An toàn (< 100%)
  return {
    isSafe: true,
    saturationRatio,
    adjustedLabel: originalLabel,
  };
}
