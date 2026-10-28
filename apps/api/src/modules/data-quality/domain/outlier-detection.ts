export interface PriceRecordForOutlierCheck {
  id: string | number;
  cropCode: string;
  marketCode: string;
  priceVndPerKg: number;
  recordDate: string;
}

export interface OutlierCheckResult {
  recordId: string | number;
  cropCode: string;
  marketCode: string;
  priceVndPerKg: number;
  recordDate: string;
  isOutlier: boolean;
  modifiedZScore: number;
  reviewStatus: 'approved' | 'flagged' | 'rejected';
  reason?: string;
}

/**
 * Tính giá trị trung vị (Median) của mảng số thực
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid]!;
  }
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/**
 * Thuật toán phát hiện ngoại lệ bằng Median Absolute Deviation (MAD) (Mã việc 2.5)
 * Không xóa dữ liệu - chỉ gắn cờ và xếp vào hàng đợi duyệt tay.
 */
export function detectOutliersWithMad(
  records: PriceRecordForOutlierCheck[],
  threshold = 3.5
): OutlierCheckResult[] {
  if (records.length < 3) {
    // Không đủ mẫu để chạy MAD, coi như an toàn
    return records.map((r) => ({
      recordId: r.id,
      cropCode: r.cropCode,
      marketCode: r.marketCode,
      priceVndPerKg: r.priceVndPerKg,
      recordDate: r.recordDate,
      isOutlier: false,
      modifiedZScore: 0,
      reviewStatus: 'approved',
    }));
  }

  const prices = records.map((r) => r.priceVndPerKg);
  const medianPrice = calculateMedian(prices);

  const absoluteDeviations = prices.map((p) => Math.abs(p - medianPrice));
  const mad = calculateMedian(absoluteDeviations);

  return records.map((r) => {
    let modifiedZScore = 0;
    if (mad > 0) {
      modifiedZScore = Number(((0.6745 * (r.priceVndPerKg - medianPrice)) / mad).toFixed(2));
    } else {
      // Trường hợp hầu hết các giá bằng nhau (mad == 0)
      const diff = r.priceVndPerKg - medianPrice;
      modifiedZScore = diff === 0 ? 0 : Number((diff / (medianPrice || 1)).toFixed(2));
    }

    const isOutlier = Math.abs(modifiedZScore) > threshold;
    const reviewStatus = isOutlier ? 'flagged' : 'approved';
    let reason: string | undefined;

    if (isOutlier) {
      const direction = modifiedZScore > 0 ? 'cao bất thường' : 'thấp bất thường';
      reason = `Giá ${r.priceVndPerKg.toLocaleString('vi-VN')} đ/kg ${direction} so với mức trung vị ${medianPrice.toLocaleString('vi-VN')} đ/kg (Điểm Z-score = ${modifiedZScore}). Đã gắn cờ chuyển duyệt tay.`;
    }

    return {
      recordId: r.id,
      cropCode: r.cropCode,
      marketCode: r.marketCode,
      priceVndPerKg: r.priceVndPerKg,
      recordDate: r.recordDate,
      isOutlier,
      modifiedZScore,
      reviewStatus,
      reason,
    };
  });
}
