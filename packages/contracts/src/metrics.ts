export interface MetricDefinition {
  id: string;
  name: string;
  unit: string;
  formula: string;
  sourceOfTruth: string;
  targetScreen: string;
  sampleValue: string | number;
}

export const METRIC_DICTIONARY: Record<string, MetricDefinition> = {
  GIA_BINH_QUAN_TUAN: {
    id: 'GIA_BINH_QUAN_TUAN',
    name: 'Giá bình quân tuần',
    unit: 'VNĐ/kg',
    formula: 'SUM(price_vnd_per_kg * volume_kg) / SUM(volume_kg) theo tuần ISO',
    sourceOfTruth: 'marts_weekly_crop_metrics.avg_price_vnd',
    targetScreen: 'Tổng quan & Giá mùa vụ',
    sampleValue: 12500,
  },
  DO_BIEN_DONG_GIA: {
    id: 'DO_BIEN_DONG_GIA',
    name: 'Độ biến động giá',
    unit: '%',
    formula: '((max_price - min_price) / avg_price) * 100',
    sourceOfTruth: 'marts_weekly_crop_metrics.volatility_pct',
    targetScreen: 'Giá & Mùa vụ',
    sampleValue: 14.2,
  },
  SAN_LUONG_UOC_TINH_12_TUAN: {
    id: 'SAN_LUONG_UOC_TINH_12_TUAN',
    name: 'Ước tính nguồn cung 12 tuần tới',
    unit: 'Tấn',
    formula: 'SUM(registered_area_m2 * average_yield_kg_per_m2 * (1 - loss_rate)) / 1000',
    sourceOfTruth: 'apps/api/src/services/modeling/quantile-forecaster.ts',
    targetScreen: 'Cung & Cầu',
    sampleValue: 185.0,
  },
  GIA_HOA_VON_UOC_TINH: {
    id: 'GIA_HOA_VON_UOC_TINH',
    name: 'Giá hòa vốn ước tính',
    unit: 'VNĐ/kg',
    formula: 'total_input_cost_vnd / expected_harvest_yield_kg',
    sourceOfTruth: 'rule-engine.ts & sổ sách nông hộ',
    targetScreen: 'Chi phí & Hòa vốn',
    sampleValue: 7500,
  },
  DO_PHU_DAI_80: {
    id: 'DO_PHU_DAI_80',
    name: 'Độ phủ dải dự báo 80%',
    unit: '%',
    formula: '(COUNT(actual_price IN [Q10, Q90]) / total_evaluated_weeks) * 100',
    sourceOfTruth: 'backtest-framework.ts (Tiêu chuẩn Cổng G3: 72% - 88%)',
    targetScreen: 'Dự báo & Rủi ro',
    sampleValue: 81.4,
  },
  XAC_SUAT_LO_MONTE_CARLO: {
    id: 'XAC_SUAT_LO_MONTE_CARLO',
    name: 'Xác suất thua lỗ Monte Carlo',
    unit: '%',
    formula: '(COUNT(simulated_profit < 0) / N_iterations) * 100 với N = 1000',
    sourceOfTruth: 'monte-carlo.ts',
    targetScreen: 'Dự báo & Rủi ro',
    sampleValue: 8.5,
  },
  TY_LE_THIEU_DU_LIEU: {
    id: 'TY_LE_THIEU_DU_LIEU',
    name: 'Tỷ lệ dữ liệu khuyết thiếu',
    unit: '%',
    formula: '(COUNT(missing_prices) / total_expected_daily_points) * 100',
    sourceOfTruth: 'data-quality-checker.ts (Tiêu chuẩn Cổng G2: < 10%)',
    targetScreen: 'Chất lượng dữ liệu',
    sampleValue: 4.8,
  },
};
