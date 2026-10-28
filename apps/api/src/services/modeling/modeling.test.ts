import { describe, it, expect } from 'vitest';
import { evaluateTimeSeriesBacktest, TimeSeriesDataPoint } from './backtest-framework.js';
import { generateQuantileForecast } from './quantile-forecaster.js';
import { runMonteCarloProfitSimulation } from './monte-carlo.js';
import { optimizeCropPlotAllocation } from './portfolio-optimizer.js';

describe('Phase 3: Forecasting Models & Monte Carlo Simulation Tests (Cổng G3)', () => {
  it('backtest framework correctly calculates MAE, MAPE and checks Gate G3 coverage criteria', () => {
    const points: TimeSeriesDataPoint[] = [
      { date: '2026-W01', actualPriceVnd: 12000, predictedPriceVnd: 12200, predictedLower80Vnd: 10000, predictedUpper80Vnd: 14000 },
      { date: '2026-W02', actualPriceVnd: 13000, predictedPriceVnd: 12800, predictedLower80Vnd: 11000, predictedUpper80Vnd: 15000 },
      { date: '2026-W03', actualPriceVnd: 12500, predictedPriceVnd: 12400, predictedLower80Vnd: 10500, predictedUpper80Vnd: 14500 },
      { date: '2026-W04', actualPriceVnd: 14000, predictedPriceVnd: 13500, predictedLower80Vnd: 11500, predictedUpper80Vnd: 15500 },
      { date: '2026-W05', actualPriceVnd: 16000, predictedPriceVnd: 13000, predictedLower80Vnd: 11000, predictedUpper80Vnd: 15000 }, // Rơi ngoài dải
    ];

    const baselineMae = 1500;
    const metrics = evaluateTimeSeriesBacktest('bok_choy', 'GBDT_Quantile', points, baselineMae);

    expect(metrics.sampleCount).toBe(5);
    expect(metrics.mae).toBe(800); // Trung bình (200 + 200 + 100 + 500 + 3000) / 5 = 800
    expect(metrics.beatsBaseline).toBe(true); // 800 < 1500
    expect(metrics.coverage80Pct).toBe(80); // 4 / 5 = 80%
    expect(metrics.isCoverageValidG3).toBe(true); // 80% nằm trong [72%, 88%] (Cổng G3 đạt chuẩn)
  });

  it('quantile forecaster incorporates seasonal factor and rainfall shock', () => {
    // Trường hợp thời tiết bình thường
    const normal = generateQuantileForecast({
      cropCode: 'bok_choy',
      recentPriceVnd: 10000,
      seasonalIndex: 1.10, // +10%
      weeklyRainfallMm: 20,
      estimatedSupplyTons: 100,
      baselineHistoricalSupplyTons: 100,
    });

    expect(normal.pointForecastVnd).toBe(11000);
    expect(normal.lowerBound80Vnd).toBeLessThan(normal.pointForecastVnd);
    expect(normal.upperBound80Vnd).toBeGreaterThan(normal.pointForecastVnd);

    // Trường hợp mưa ngập úng cực đoan (> 60mm) trên cải thìa
    const rainy = generateQuantileForecast({
      cropCode: 'bok_choy',
      recentPriceVnd: 10000,
      seasonalIndex: 1.10,
      weeklyRainfallMm: 95, // Mưa lớn
      estimatedSupplyTons: 100,
      baselineHistoricalSupplyTons: 100,
    });

    expect(rainy.factors.weatherPenaltyVnd).toBeGreaterThan(0);
    expect(rainy.pointForecastVnd).toBeGreaterThan(normal.pointForecastVnd);
  });

  it('Monte Carlo simulation generates empirical profit distribution and calculates loss probability', () => {
    const sim = runMonteCarloProfitSimulation({
      plantedAreaM2: 2000,
      expectedYieldKgPerM2: 2.2,
      totalCostVnd: 12000000, // Chi phí 12 triệu
      forecastLowerVnd: 10000,
      forecastUpperVnd: 14000,
      simulationIterations: 500,
    });

    expect(sim.iterations).toBe(500);
    expect(sim.breakevenPriceVndPerKg).toBe(Math.round(12000000 / 4400)); // ~2,727 đ/kg
    expect(sim.expectedProfitVnd).toBeGreaterThan(0);
    expect(sim.lossProbabilityPct).toBeLessThan(10); // Giá tối thiểu 10k > chi phí 2.7k nên xác suất lỗ rất thấp
    expect(sim.profitDistribution.p10ProfitVnd).toBeLessThan(sim.profitDistribution.p90ProfitVnd);
  });

  it('plot portfolio optimizer enforces maximum 60% allocation on top crop for risk diversification', () => {
    const sim1 = runMonteCarloProfitSimulation({ plantedAreaM2: 1000, expectedYieldKgPerM2: 2.2, totalCostVnd: 5000000, forecastLowerVnd: 12000, forecastUpperVnd: 16000 });
    const sim2 = runMonteCarloProfitSimulation({ plantedAreaM2: 1000, expectedYieldKgPerM2: 2.0, totalCostVnd: 5000000, forecastLowerVnd: 10000, forecastUpperVnd: 13000 });

    const portfolio = optimizeCropPlotAllocation(
      [
        { cropCode: 'bok_choy', simulation: sim1, seasonalStabilityScore: 0.95 },
        { cropCode: 'choi_sum', simulation: sim2, seasonalStabilityScore: 0.85 },
      ],
      10000 // 10,000 m2
    );

    expect(portfolio.allocations.length).toBe(2);
    // Cây số 1 không được chiếm quá 60% diện tích
    expect(portfolio.allocations[0]?.allocatedPercentage).toBeLessThanOrEqual(60.1);
    // Tổng diện tích phải đúng 10,000 m2
    const totalAllocated = portfolio.allocations.reduce((sum, a) => sum + a.allocatedAreaM2, 0);
    expect(totalAllocated).toBe(10000);
  });
});
