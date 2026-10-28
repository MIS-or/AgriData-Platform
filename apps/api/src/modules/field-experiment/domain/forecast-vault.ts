import {
  PilotCropCode,
  TimestampedForecastRecord,
} from '@agridata/contracts';
import { calculateSha256 } from '../../../core/crypto/hash.js';

export class ForecastVault {
  private records: Map<string, TimestampedForecastRecord> = new Map();

  /**
   * Đóng dấu thời gian và băm SHA-256 niêm phong dự báo trước khi vụ thu hoạch diễn ra (Mã việc 6.3)
   */
  async sealForecast(
    broadcastWeekIso: string,
    cropCode: PilotCropCode,
    q10PriceVnd: number,
    q50PriceVnd: number,
    q90PriceVnd: number,
    recommendedRank: number,
    sealedAtIso?: string
  ): Promise<TimestampedForecastRecord> {
    const timestamp = sealedAtIso || new Date().toISOString();
    const forecastId = `VAULT_${broadcastWeekIso}_${cropCode}`;

    const payloadToHash = JSON.stringify({
      forecastId,
      broadcastWeekIso,
      cropCode,
      q10PriceVnd,
      q50PriceVnd,
      q90PriceVnd,
      recommendedRank,
      sealedAtIso: timestamp,
    });

    const contentHash = await calculateSha256(payloadToHash);

    const record: TimestampedForecastRecord = {
      forecastId,
      broadcastWeekIso,
      cropCode,
      q10PriceVnd,
      q50PriceVnd,
      q90PriceVnd,
      recommendedRank,
      sealedAtIso: timestamp,
      contentHash,
    };

    this.records.set(forecastId, record);
    return record;
  }

  getForecast(broadcastWeekIso: string, cropCode: PilotCropCode): TimestampedForecastRecord | undefined {
    return this.records.get(`VAULT_${broadcastWeekIso}_${cropCode}`);
  }

  getAllForecasts(): TimestampedForecastRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Kiểm tra tính toàn vẹn (Tamper-evident verification)
   */
  async verifyIntegrity(record: TimestampedForecastRecord): Promise<boolean> {
    const payloadToHash = JSON.stringify({
      forecastId: record.forecastId,
      broadcastWeekIso: record.broadcastWeekIso,
      cropCode: record.cropCode,
      q10PriceVnd: record.q10PriceVnd,
      q50PriceVnd: record.q50PriceVnd,
      q90PriceVnd: record.q90PriceVnd,
      recommendedRank: record.recommendedRank,
      sealedAtIso: record.sealedAtIso,
    });

    const expectedHash = await calculateSha256(payloadToHash);
    return expectedHash === record.contentHash;
  }
}

export const globalForecastVault = new ForecastVault();
