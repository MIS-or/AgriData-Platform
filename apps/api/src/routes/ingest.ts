import { Hono } from 'hono';
import { FarmerCropLogSchema } from '@agridata/contracts';

export const ingestRouter = new Hono();

// POST /api/v1/ingest/farmer-log - Nhập nhật ký sản xuất vụ mùa của nông hộ/HTX (Mã việc 1.9 & 5.6)
ingestRouter.post('/farmer-log', async (c) => {
  try {
    const body = await c.req.json();
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

    return c.json({
      success: true,
      logId,
      calculatedBreakevenPriceVndPerKg: breakevenVndPerKg,
      message: 'Nhật ký vụ mùa đã được ghi nhận vào kho dữ liệu sạch lớp 1.',
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
