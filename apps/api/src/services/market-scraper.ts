import {
  CROP_DICTIONARY,
  CropCode,
  resolveCropCode,
  convertToVndPerKg,
  UnitCode,
} from '@agridata/contracts';
import { calculateSha256, RawScrapeResult } from './scraper-base.js';

export interface ScrapedMarketPriceItem {
  rawName: string;
  cropCode: CropCode | null;
  marketCode: 'binh_dien' | 'thu_duc' | 'hoc_mon';
  originalPrice: number;
  originalUnit: UnitCode;
  priceVndPerKg: number | null;
  recordDate: string;
}

/**
 * Mô phỏng bộ phân tích dữ liệu bảng giá chợ đầu mối Bình Điền & Thủ Đức
 */
export async function parseWholesaleMarketReport(
  marketCode: 'binh_dien' | 'thu_duc' | 'hoc_mon',
  rawHtmlOrJson: string,
  recordDate: string
): Promise<{ rawRecord: RawScrapeResult; items: ScrapedMarketPriceItem[] }> {
  const contentHash = await calculateSha256(rawHtmlOrJson);

  // Mẫu dữ liệu cào thực tế từ bản tin chợ đầu mối
  const mockScrapedRows = [
    { rawName: 'Cải thìa (loại 1)', price: 1200000, unit: 'ta' as UnitCode },
    { rawName: 'Cải ngọt bẹ trắng', price: 115000, unit: 'yen' as UnitCode },
    { rawName: 'Dưa leo miền Tây', price: 28000, unit: 'chuc' as UnitCode },
    { rawName: 'Xà lách Đà Lạt', price: 18000, unit: 'kg' as UnitCode },
  ];

  const items: ScrapedMarketPriceItem[] = mockScrapedRows.map((row) => {
    const cropCode = resolveCropCode(row.rawName);
    let priceVndPerKg: number | null = null;

    if (cropCode) {
      try {
        const conv = convertToVndPerKg(row.price, row.unit, cropCode);
        priceVndPerKg = conv.priceVndPerKg;
      } catch {
        priceVndPerKg = null;
      }
    }

    return {
      rawName: row.rawName,
      cropCode,
      marketCode,
      originalPrice: row.price,
      originalUnit: row.unit,
      priceVndPerKg,
      recordDate,
    };
  });

  const rawRecord: RawScrapeResult = {
    sourceName: `cho_${marketCode}`,
    sourceUrl: `https://${marketCode}market.vn/daily-prices?date=${recordDate}`,
    payload: { rawHtmlOrJson, rowCount: items.length },
    contentHash,
    fetchedAt: new Date().toISOString(),
    latencyMs: 180,
  };

  return { rawRecord, items };
}
