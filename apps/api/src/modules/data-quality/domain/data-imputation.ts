export interface DatedPricePoint {
  date: string; // YYYY-MM-DD
  priceVndPerKg: number | null;
  isImputed?: boolean;
  imputationMethod?: 'linear' | 'none';
  missingReason?: string;
}

/**
 * Xử lý chuỗi dữ liệu thiếu (Mã việc 2.6):
 * - Khoảng trống ngắn (<= 14 ngày): Nội suy tuyến tính (Linear Interpolation).
 * - Khoảng trống dài (> 14 ngày): Giữ nguyên trạng thái khuyết thiếu, ghi rõ lý do, không làm giả dữ liệu.
 */
export function imputeMissingPriceSeries(
  sortedSeries: { date: string; priceVndPerKg: number | null }[]
): DatedPricePoint[] {
  if (sortedSeries.length <= 1) {
    return sortedSeries.map((s) => ({
      date: s.date,
      priceVndPerKg: s.priceVndPerKg,
      isImputed: false,
      imputationMethod: 'none',
    }));
  }

  const result: DatedPricePoint[] = [];

  for (let i = 0; i < sortedSeries.length; i++) {
    const current = sortedSeries[i]!;

    if (current.priceVndPerKg !== null) {
      result.push({
        date: current.date,
        priceVndPerKg: current.priceVndPerKg,
        isImputed: false,
        imputationMethod: 'none',
      });
      continue;
    }

    // Tìm điểm có dữ liệu gần nhất phía trước và phía sau
    let prevIndex = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (sortedSeries[j]?.priceVndPerKg !== null) {
        prevIndex = j;
        break;
      }
    }

    let nextIndex = -1;
    for (let j = i + 1; j < sortedSeries.length; j++) {
      if (sortedSeries[j]?.priceVndPerKg !== null) {
        nextIndex = j;
        break;
      }
    }

    if (prevIndex !== -1 && nextIndex !== -1) {
      const prevDate = new Date(sortedSeries[prevIndex]!.date).getTime();
      const nextDate = new Date(sortedSeries[nextIndex]!.date).getTime();
      const currentDate = new Date(current.date).getTime();

      const gapDays = Math.round((nextDate - prevDate) / (1000 * 60 * 60 * 24));

      // Ngưỡng 14 ngày: khoảng trống ngắn được nội suy tuyến tính
      if (gapDays <= 14) {
        const prevPrice = sortedSeries[prevIndex]!.priceVndPerKg!;
        const nextPrice = sortedSeries[nextIndex]!.priceVndPerKg!;

        const progress = (currentDate - prevDate) / (nextDate - prevDate);
        const interpolatedPrice = Math.round(prevPrice + progress * (nextPrice - prevPrice));

        result.push({
          date: current.date,
          priceVndPerKg: interpolatedPrice,
          isImputed: true,
          imputationMethod: 'linear',
        });
        continue;
      }
    }

    // Khoảng trống dài > 14 ngày hoặc ở hai đầu mút
    result.push({
      date: current.date,
      priceVndPerKg: null,
      isImputed: false,
      imputationMethod: 'none',
      missingReason: 'long_gap_unobserved (khoảng trống > 14 ngày, không nội suy để bảo toàn tính trung thực)',
    });
  }

  return result;
}
