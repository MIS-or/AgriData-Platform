export interface MonteCarloSimulationInput {
  plantedAreaM2: number;
  expectedYieldKgPerM2: number; // Năng suất kỳ vọng (ví dụ 2.2 kg/m2)
  totalCostVnd: number;         // Tổng chi phí đầu vào thực tế của hộ
  forecastLowerVnd: number;     // Q10 từ mô hình
  forecastUpperVnd: number;     // Q90 từ mô hình
  simulationIterations?: number; // Mặc định 1000 lần
}

export interface MonteCarloSimulationResult {
  iterations: number;
  expectedProfitVnd: number;       // Lợi nhuận kỳ vọng trung bình
  expectedRoiPct: number;          // Tỷ suất sinh lời kỳ vọng (%)
  lossProbabilityPct: number;      // Xác suất bị lỗ (%)
  worstCase10PctLossVnd: number;   // Giá trị thua lỗ ở kịch bản xấu 10% (VaR 10%)
  breakevenPriceVndPerKg: number;  // Giá hòa vốn
  profitDistribution: {
    minProfitVnd: number;
    p10ProfitVnd: number;
    p50ProfitVnd: number;
    p90ProfitVnd: number;
    maxProfitVnd: number;
  };
}

/**
 * Hàm sinh số ngẫu nhiên theo phân phối chuẩn xấp xỉ (Box-Muller transform)
 */
function randomGaussian(mean: number, stdDev: number): number {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Mô phỏng Monte Carlo Lợi Nhuận & Rủi Ro Thua Lỗ (Mã việc 3.7)
 * Áp dụng trực tiếp số liệu chi phí thật từ sổ sách gia đình nông hộ
 */
export function runMonteCarloProfitSimulation(
  input: MonteCarloSimulationInput
): MonteCarloSimulationResult {
  const iterations = input.simulationIterations || 1000;
  const profits: number[] = [];
  let lossCount = 0;

  const expectedTotalYield = input.plantedAreaM2 * input.expectedYieldKgPerM2;
  const breakevenPrice = Math.round(input.totalCostVnd / Math.max(expectedTotalYield, 1));

  // Biên độ biến động năng suất: độ lệch chuẩn 12%
  const yieldStdDev = expectedTotalYield * 0.12;
  const priceMean = (input.forecastLowerVnd + input.forecastUpperVnd) / 2;
  const priceStdDev = (input.forecastUpperVnd - input.forecastLowerVnd) / (2 * 1.28); // 80% range ~ 2 * 1.28 stdDev

  for (let i = 0; i < iterations; i++) {
    // 1. Rút ngẫu nhiên năng suất thực tế
    const simulatedYield = Math.max(randomGaussian(expectedTotalYield, yieldStdDev), expectedTotalYield * 0.4);

    // 2. Rút ngẫu nhiên tỷ lệ hao hụt sau thu hoạch (5% - 15%)
    const lossRatio = 0.05 + Math.random() * 0.10;
    const sellableYieldKg = simulatedYield * (1 - lossRatio);

    // 3. Rút ngẫu nhiên giá thị trường tại thời điểm thu hoạch
    const simulatedPrice = Math.max(randomGaussian(priceMean, priceStdDev), 2000);

    // 4. Doanh thu & Lợi nhuận
    const revenue = sellableYieldKg * simulatedPrice;
    const profit = Math.round(revenue - input.totalCostVnd);

    profits.push(profit);
    if (profit < 0) {
      lossCount++;
    }
  }

  profits.sort((a, b) => a - b);

  const sumProfit = profits.reduce((a, b) => a + b, 0);
  const expectedProfitVnd = Math.round(sumProfit / iterations);
  const expectedRoiPct = Number(((expectedProfitVnd / input.totalCostVnd) * 100).toFixed(1));
  const lossProbabilityPct = Number(((lossCount / iterations) * 100).toFixed(1));

  const p10Index = Math.floor(iterations * 0.1);
  const p50Index = Math.floor(iterations * 0.5);
  const p90Index = Math.floor(iterations * 0.9);

  return {
    iterations,
    expectedProfitVnd,
    expectedRoiPct,
    lossProbabilityPct,
    worstCase10PctLossVnd: profits[p10Index]!,
    breakevenPriceVndPerKg: breakevenPrice,
    profitDistribution: {
      minProfitVnd: profits[0]!,
      p10ProfitVnd: profits[p10Index]!,
      p50ProfitVnd: profits[p50Index]!,
      p90ProfitVnd: profits[p90Index]!,
      maxProfitVnd: profits[iterations - 1]!,
    },
  };
}
