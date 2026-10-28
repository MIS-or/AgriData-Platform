import { calculateMedian } from './outlier-detection.js';

export interface CleanPriceInput {
  cropCode: string;
  regionCode: string;
  date: string; // YYYY-MM-DD
  priceVndPerKg: number;
}

export interface WeeklyMartsMetric {
  cropCode: string;
  regionCode: string;
  yearWeek: string; // '2026-W43'
  weekStartDate: string;
  avgPriceVnd: number;
  minPriceVnd: number;
  maxPriceVnd: number;
  medianPriceVnd: number;
  volatilityPct: number;
  sampleCount: number;

  // Feature phái sinh cho mô hình hóa (Giai đoạn 3)
  lag1wPriceVnd?: number;
  lag2wPriceVnd?: number;
  lag4wPriceVnd?: number;
  rolling4wAvgVnd?: number;
}

/**
 * Lấy chuỗi Year-Week dạng chuẩn ISO (ví dụ: '2026-W43')
 */
export function getYearWeekString(dateStr: string): { yearWeek: string; weekStartDate: string } {
  const d = new Date(dateStr);
  const day = d.getUTCDay();
  // Điều chỉnh về ngày đầu tuần (Thứ Hai)
  const diffToMonday = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));

  const year = monday.getUTCFullYear();
  const firstJan = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(((monday.getTime() - firstJan.getTime()) / 86400000 + 1) / 7);

  const formattedWeek = `W${String(weekNum).padStart(2, '0')}`;
  const weekStartDate = monday.toISOString().split('T')[0]!;

  return {
    yearWeek: `${year}-${formattedWeek}`,
    weekStartDate,
  };
}

/**
 * Tổng hợp dữ liệu tầng sạch (Clean) thành tầng phân tích (Marts) theo tuần (Mã việc 2.8)
 */
export function aggregateCleanPricesToMarts(
  cleanPrices: CleanPriceInput[]
): WeeklyMartsMetric[] {
  if (cleanPrices.length === 0) return [];

  // Nhóm theo cropCode + regionCode + yearWeek
  const groups: Record<string, CleanPriceInput[]> = {};

  for (const item of cleanPrices) {
    const { yearWeek } = getYearWeekString(item.date);
    const key = `${item.cropCode}__${item.regionCode}__${yearWeek}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key]!.push(item);
  }

  const rawMarts: WeeklyMartsMetric[] = [];

  for (const [key, items] of Object.entries(groups)) {
    const [cropCode, regionCode, yearWeek] = key.split('__') as [string, string, string];
    const prices = items.map((i) => i.priceVndPerKg);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avgPrice = Math.round(sum / prices.length);
    const medianPrice = Math.round(calculateMedian(prices));

    // Độ biến động = (max - min) / avg * 100
    const volatilityPct = Number((((maxPrice - minPrice) / Math.max(avgPrice, 1)) * 100).toFixed(2));

    const { weekStartDate } = getYearWeekString(items[0]!.date);

    rawMarts.push({
      cropCode,
      regionCode,
      yearWeek,
      weekStartDate,
      avgPriceVnd: avgPrice,
      minPriceVnd: minPrice,
      maxPriceVnd: maxPrice,
      medianPriceVnd: medianPrice,
      volatilityPct,
      sampleCount: items.length,
    });
  }

  // Sắp xếp theo thứ tự thời gian để tính toán lag features
  rawMarts.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));

  // Bổ sung các lag features (độ trễ 1, 2, 4 tuần và trung bình trượt 4 tuần)
  for (let i = 0; i < rawMarts.length; i++) {
    const current = rawMarts[i]!;

    if (i >= 1) current.lag1wPriceVnd = rawMarts[i - 1]?.avgPriceVnd;
    if (i >= 2) current.lag2wPriceVnd = rawMarts[i - 2]?.avgPriceVnd;
    if (i >= 4) {
      current.lag4wPriceVnd = rawMarts[i - 4]?.avgPriceVnd;
      const last4Prices = rawMarts.slice(i - 3, i + 1).map((m) => m.avgPriceVnd);
      current.rolling4wAvgVnd = Math.round(last4Prices.reduce((a, b) => a + b, 0) / 4);
    }
  }

  return rawMarts;
}
