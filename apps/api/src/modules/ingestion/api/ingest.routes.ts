import { Hono } from 'hono';
import { FarmerCropLogSchema } from '@agridata/contracts';
import { Env } from '../../../core/config/env.js';
import {
  edgeR2PutImmutableObject,
  verifyTurnstileToken,
} from '../../../core/cloudflare/edge-services.js';
import { insertRawFarmerLogInWarehouse } from '../../../core/database/neon-client.js';

export const ingestRouter = new Hono<{ Bindings: Env }>();

// POST /api/v1/ingest/farmer-log - Nhập nhật ký sản xuất vụ mùa của nông hộ/HTX (Mã việc 1.9 & 5.6)
ingestRouter.post('/farmer-log', async (c) => {
  try {
    const body = await c.req.json();

    // [Goal G1 & X2] Cloudflare Turnstile anti-bot check before accepting crowd-sourced data
    const turnstileToken = c.req.header('x-turnstile-token') || body.turnstileToken;
    const turnstileCheck = await verifyTurnstileToken(c.env, turnstileToken);
    if (!turnstileCheck.verified) {
      return c.json(
        {
          success: false,
          error: 'Xác thực chống bot (Cloudflare Turnstile) không hợp lệ.',
        },
        403
      );
    }

    const validatedLog = FarmerCropLogSchema.parse(body);

    // Tính toán chi phí hòa vốn ước tính trên 1 kg
    const totalCost =
      validatedLog.seedCostVnd +
      validatedLog.fertilizerCostVnd +
      validatedLog.pesticideCostVnd +
      validatedLog.laborAndFuelCostVnd;

    // Ước tính năng suất dựa trên diện tích nếu chưa có sản lượng thực tế (2.2kg/m2)
    const estimatedYieldKg = validatedLog.actualYieldKg || validatedLog.plantedAreaM2 * 2.2;
    const breakevenVndPerKg = Math.round(totalCost / Math.max(estimatedYieldKg, 1));

    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // [Goal G1 & X1] Archive immutable Tier-1 raw payload into Cloudflare R2 + Neon PostgreSQL Tier-1 Raw Table
    const [r2Archive, warehouseInsert] = await Promise.all([
      edgeR2PutImmutableObject(
        c.env,
        `raw/farmer-logs/${logId}.json`,
        JSON.stringify({ logId, ...validatedLog })
      ),
      insertRawFarmerLogInWarehouse(
        c.env,
        'htx_an_phu_tan',
        { logId, ...validatedLog, breakevenVndPerKg },
        logId.replace(/[^a-zA-Z0-9]/g, '').padEnd(64, 'a')
      ),
    ]);

    return c.json({
      success: true,
      logId,
      calculatedBreakevenPriceVndPerKg: breakevenVndPerKg,
      rawArchiveKey: r2Archive.key,
      warehouseRecordId: warehouseInsert.rawRecordId,
      warehouseSource: warehouseInsert.source,
      message: 'Nhật ký vụ mùa đã được ghi nhận vào kho dữ liệu sạch lớp 1 và lưu trữ bất biến trên R2.',
      timestamp: new Date().toISOString(),
      summary: {
        cropCode: validatedLog.cropCode,
        plantedAreaM2: validatedLog.plantedAreaM2,
        totalCostVnd: totalCost,
        breakevenVndPerKg,
      },
    }, 201);
  } catch (err: any) {
    return c.json({
      success: false,
      error: 'Dữ liệu nhập không hợp lệ',
      details: err.errors || err.message,
    }, 400);
  }
});
