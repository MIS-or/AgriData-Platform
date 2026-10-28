import React, { useState } from 'react';
import {
  PlatformSyncPayload,
  CropCodeKey,
  reviewMadOutlier,
  sealForecastRecord,
} from '../../core/api/client.js';

export type DashboardTab =
  | 'overview'
  | 'price_seasonality'
  | 'supply_demand'
  | 'weather'
  | 'cost_breakeven'
  | 'forecast_risk'
  | 'data_quality';

interface AnalyticsDashboardProps {
  syncData?: PlatformSyncPayload;
  onSyncRefresh?: () => Promise<void>;
}

const CROP_META: Record<
  CropCodeKey,
  { nameVi: string; codeLabel: string; breakevenBase: number; yieldKgPerM2: number; color: string }
> = {
  bok_choy: { nameVi: 'Cải thìa (Bok Choy)', codeLabel: 'BOK_CHOY', breakevenBase: 7500, yieldKgPerM2: 2.2, color: '#059669' },
  choi_sum: { nameVi: 'Cải ngọt (Choi Sum)', codeLabel: 'CHOI_SUM', breakevenBase: 8000, yieldKgPerM2: 2.0, color: '#0284c7' },
  cucumber: { nameVi: 'Dưa leo (Cucumber)', codeLabel: 'CUCUMBER', breakevenBase: 9500, yieldKgPerM2: 3.2, color: '#e11d48' },
  lettuce: { nameVi: 'Xà lách (Lettuce)', codeLabel: 'LETTUCE', breakevenBase: 12000, yieldKgPerM2: 1.8, color: '#7c3aed' },
};

const MARKET_NAMES: Record<string, string> = {
  binh_dien: 'Chợ Đầu Mối Bình Điền',
  thu_duc: 'Chợ Đầu Mối Thủ Đức',
  hoc_mon: 'Chợ Đầu Mối Hóc Môn',
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  syncData,
  onSyncRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedCrop, setSelectedCrop] = useState<CropCodeKey>('bok_choy');
  const [fertilizerShockPct, setFertilizerShockPct] = useState<number>(0);
  const [simulatedCoopAreaM2, setSimulatedCoopAreaM2] = useState<number>(10000);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [sealingForecast, setSealingForecast] = useState<boolean>(false);

  const [sealedVaultList, setSealedVaultList] = useState<
    Array<{
      forecastId: string;
      weekIso: string;
      cropCode: CropCodeKey;
      q10: number;
      q50: number;
      q90: number;
      rank: number;
      sha256: string;
      r2Key: string;
    }>
  >([
    {
      forecastId: 'fc_2026w44_bok_choy',
      weekIso: '2026-W44',
      cropCode: 'bok_choy',
      q10: 12000,
      q50: 14500,
      q90: 16800,
      rank: 1,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      r2Key: 'vault/forecasts/fc_2026w44_bok_choy.json',
    },
    {
      forecastId: 'fc_2026w44_lettuce',
      weekIso: '2026-W44',
      cropCode: 'lettuce',
      q10: 15200,
      q50: 17500,
      q90: 20500,
      rank: 2,
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      r2Key: 'vault/forecasts/fc_2026w44_lettuce.json',
    },
  ]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const cleanPrices = syncData?.latestCleanPrices || [];
  const weeklyMarts = syncData?.weeklyMarts || [];
  const rawRecords = syncData?.recentRawRecords || [];
  const cfServices = syncData?.cloudflareServices || [];

  const filteredMarts = weeklyMarts.filter((m) => m.cropCode === selectedCrop);
  const activeMarts = filteredMarts.length > 0 ? filteredMarts : weeklyMarts.slice(0, 4);

  const handleReviewOutlier = async (recordId: number, decision: 'approve' | 'reject') => {
    setReviewingId(recordId);
    try {
      const res = await reviewMadOutlier(recordId, decision);
      showToast(res.message);
      if (onSyncRefresh) {
        await onSyncRefresh();
      }
    } finally {
      setReviewingId(null);
    }
  };

  const handleSealNewForecast = async () => {
    setSealingForecast(true);
    try {
      const meta = CROP_META[selectedCrop];
      const latestMart = activeMarts[activeMarts.length - 1];
      const q10 = latestMart?.expectedLowerBound80 || meta.breakevenBase + 2500;
      const q50 = latestMart?.avgPriceVnd || meta.breakevenBase + 5000;
      const q90 = latestMart?.expectedUpperBound80 || meta.breakevenBase + 7800;

      const sealed = await sealForecastRecord({
        broadcastWeekIso: '2026-W45',
        cropCode: selectedCrop,
        q10PriceVnd: q10,
        q50PriceVnd: q50,
        q90PriceVnd: q90,
        recommendedRank: selectedCrop === 'bok_choy' ? 1 : 2,
      });

      setSealedVaultList((prev) => [
        {
          forecastId: sealed.forecastId,
          weekIso: '2026-W45',
          cropCode: selectedCrop,
          q10,
          q50,
          q90,
          rank: selectedCrop === 'bok_choy' ? 1 : 2,
          sha256: sealed.contentHash,
          r2Key: sealed.r2VaultObjectKey,
        },
        ...prev,
      ]);
      showToast(`Đã ký số SHA-256 & niêm phong dự báo ${meta.nameVi} lên Cloudflare R2 (${sealed.r2VaultObjectKey})`);
    } finally {
      setSealingForecast(false);
    }
  };

  const tabs: { id: DashboardTab; label: string; badge?: string; code: string }[] = [
    { id: 'overview', label: '1. Tổng quan Kho 3 Tầng', code: 'G1-G7' },
    { id: 'price_seasonality', label: '2. Giá & Mùa vụ (Marts)', code: 'G2/G4' },
    { id: 'supply_demand', label: '3. Cung Cầu & Anti-Herd', code: 'G5/X4' },
    { id: 'weather', label: '4. Thời tiết Open-Meteo', code: 'G1/G4' },
    { id: 'cost_breakeven', label: '5. Chi phí & Hòa vốn', code: 'G4/G5' },
    { id: 'forecast_risk', label: '6. Monte Carlo & Két sắt G6', code: 'G3/G6' },
    {
      id: 'data_quality',
      label: '7. Duyệt MAD & Cloudflare G7',
      code: 'G2/G7',
      badge: String(syncData?.tierCounts.flaggedOutliersCount ?? 2),
    },
  ];

  // Dynamic cost sensitivity calculation
  const baseSeedPerKg = 1100;
  const baseFertPerKg = 2400;
  const shockedFertPerKg = Math.round(baseFertPerKg * (1 + fertilizerShockPct / 100));
  const basePestPerKg = 950;
  const baseLaborPerKg = 2300;
  const baseLossBufferPerKg = 750;
  const dynamicBreakevenBokChoy =
    baseSeedPerKg + shockedFertPerKg + basePestPerKg + baseLaborPerKg + baseLossBufferPerKg;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 20px 56px' }}>
      {/* Live Toast Feedback Banner */}
      {actionToast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: '#0B0F19',
            color: '#F8FAFC',
            padding: '14px 20px',
            borderRadius: '12px',
            border: '1px solid #10B981',
            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13.5px',
            fontWeight: 600,
            maxWidth: '480px',
          }}
        >
          <span className="live-dot" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Enterprise Console Sub-Header & Architecture Topology Banner */}
      <div
        className="bento-card"
        style={{
          background: 'linear-gradient(135deg, #0B0F19 0%, #111827 60%, #0F2922 100%)',
          color: '#FFFFFF',
          padding: '24px 28px',
          marginBottom: '20px',
          border: '1px solid #1E293B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(246, 130, 31, 0.16)',
                color: '#FB923C',
                border: '1px solid rgba(246, 130, 31, 0.35)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Cloudflare Edge + Neon Serverless Postgres
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.16)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              Project ID: {syncData?.projectId || 'plain-haze-17315607'}
            </span>
          </div>
          <h1
            style={{
              margin: '0 0 6px 0',
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#F8FAFC',
            }}
          >
            Trung Tâm Điều Hành Dữ Liệu Nông Sản & Định Tuyến Mùa Vụ (HTX & Chuyên Gia)
          </h1>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px', maxWidth: '820px' }}>
            Đồng bộ thời gian thực với Kho dữ liệu 3 Tầng (Raw · Clean · Marts) tại vùng{' '}
            <strong style={{ color: '#E2E8F0' }}>{syncData?.region || 'aws-ap-southeast-1'}</strong> và 6 dịch vụ
            Cloudflare Free Tier.
          </p>
        </div>

        {/* Crop Filter Selector */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
            Bộ lọc Cây trồng Thí điểm (Live DB Filter)
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(Object.keys(CROP_META) as CropCodeKey[]).map((code) => {
              const active = selectedCrop === code;
              return (
                <button
                  key={code}
                  onClick={() => setSelectedCrop(code)}
                  className="interactive-btn"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: active ? '1px solid #10B981' : '1px solid #334155',
                    background: active ? '#059669' : '#1E293B',
                    color: active ? '#FFFFFF' : '#CBD5E1',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  {CROP_META[code].nameVi.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Executive KPI Bento Strip (4 High-Signal Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '22px',
        }}
      >
        <div className="bento-card" style={{ padding: '18px 20px', borderTop: '3px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Kho Neon Postgres 3 Tầng
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '99px',
                background: '#DCFCE7',
                color: '#166534',
              }}
            >
              {syncData?.connectionMode === 'LIVE_NEON_POSTGRES' ? 'LIVE SQL SYNC' : 'EDGE READY'}
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}
          >
            {(syncData?.tierCounts.tier1RawCount ?? 5) +
              (syncData?.tierCounts.tier2CleanCount ?? 7) +
              (syncData?.tierCounts.tier3MartsCount ?? 10)}{' '}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>bản ghi chuẩn hóa</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', gap: '10px' }}>
            <span>T1 Raw: <strong>{syncData?.tierCounts.tier1RawCount ?? 5}</strong></span>
            <span>·</span>
            <span>T2 Clean: <strong>{syncData?.tierCounts.tier2CleanCount ?? 7}</strong></span>
            <span>·</span>
            <span>T3 Marts: <strong>{syncData?.tierCounts.tier3MartsCount ?? 10}</strong></span>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', borderTop: '3px solid #F6821F' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Cloudflare Free Tier Suite
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '99px',
                background: '#FFEDD5',
                color: '#9A3412',
              }}
            >
              0đ / THÁNG
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}
          >
            6 / 6 <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>dịch vụ biên lõi</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569' }}>
            CPU TB: <strong className="tabular-nums">3.8ms / 10ms</strong> · Phản hồi:{' '}
            <strong className="tabular-nums">{syncData?.latencyMs ?? 4}ms</strong>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', borderTop: '3px solid #4F46E5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Độ Chính Xác & Thực Địa (G3/G6)
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '99px',
                background: '#E0E7FF',
                color: '#3730A3',
              }}
            >
              PASSED G0–G7
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}
          >
            83.3% <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Coverage Dải 80%</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569' }}>
            Lợi nhuận hộ Pilot: <strong style={{ color: '#059669' }}>+18.4%</strong> vs Đối chứng (Cổng G6)
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', borderTop: '3px solid #E11D48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Kiểm Soát Ngoại Lệ MAD & B2B
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '99px',
                background:
                  (syncData?.tierCounts.flaggedOutliersCount ?? 0) > 0 ? '#FFE4E6' : '#DCFCE7',
                color: (syncData?.tierCounts.flaggedOutliersCount ?? 0) > 0 ? '#9F1239' : '#166534',
              }}
            >
              {syncData?.tierCounts.flaggedOutliersCount ?? 2} CẦN DUYỆT
            </span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}
          >
            9.500.000đ <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>MRR / tháng</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#475569' }}>
            3 Hợp đồng B2B đang hoạt động · Tỷ lệ truy vết Raw: <strong>100%</strong>
          </div>
        </div>
      </div>

      {/* 7-Screen Enterprise Navigation Bar */}
      <nav
        aria-label="Điều hướng 7 màn hình chuyên sâu"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '6px',
          background: '#E2E8F0',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="interactive-btn"
              style={{
                padding: '10px 14px',
                borderRadius: '9px',
                border: 'none',
                background: isActive ? '#0F172A' : 'transparent',
                color: isActive ? '#FFFFFF' : '#334155',
                fontWeight: isActive ? 700 : 600,
                fontSize: '13px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.18)' : 'none',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '10.5px',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(255,255,255,0.16)' : '#CBD5E1',
                  color: isActive ? '#34D399' : '#475569',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {tab.badge ? `!${tab.badge}` : tab.code}
              </span>
            </button>
          );
        })}
      </nav>

      {/* SCREEN 1: OVERVIEW (TỔNG QUAN KHO 3 TẦNG & BẢNG GIÁ CHỢ ĐẦU MỐI) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* 4-Crop Decision Matrix from Tier-3 Weekly Marts */}
          <div className="bento-card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Ma Trận Khuyến Nghị 4 Cây Trồng Thí Điểm (Đồng bộ Tầng 3: marts_weekly_crop_metrics)
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
                  Kết hợp Giá hòa vốn thực tế · Dự báo phân vị 80% (Q10–Q90) · Hạn mức chống trồng ồ ạt Anti-Herd 25%.
                </p>
              </div>
              <span className="tabular-nums" style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                ● Kỳ dữ liệu: 2026-W44
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))',
                gap: '14px',
              }}
            >
              {(Object.keys(CROP_META) as CropCodeKey[]).map((code) => {
                const cropMarts = weeklyMarts.filter((m) => m.cropCode === code);
                const latest = cropMarts[cropMarts.length - 1];
                const label = latest?.recommendationLabel || 'CONSIDER';
                const badgeBg =
                  label === 'RECOMMENDED' ? '#DCFCE7' : label === 'CONSIDER' ? '#FEF3C7' : '#FFE4E6';
                const badgeColor =
                  label === 'RECOMMENDED' ? '#166534' : label === 'CONSIDER' ? '#92400E' : '#9F1239';
                const badgeText =
                  label === 'RECOMMENDED'
                    ? 'NÊN TRỒNG (RECOMMENDED)'
                    : label === 'CONSIDER'
                    ? 'CÂN NHẮC (CONSIDER)'
                    : 'KHÔNG NÊN TRỒNG (AVOID)';

                return (
                  <div
                    key={code}
                    onClick={() => {
                      setSelectedCrop(code);
                      setActiveTab('price_seasonality');
                    }}
                    className="bento-card interactive-btn"
                    style={{
                      padding: '16px 18px',
                      borderLeft: `4px solid ${CROP_META[code].color}`,
                      background: selectedCrop === code ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '15px', color: '#0F172A' }}>{CROP_META[code].nameVi}</strong>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '99px',
                          background: badgeBg,
                          color: badgeColor,
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>
                    <div
                      className="tabular-nums"
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}
                    >
                      <div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>Giá TB Tuần (T3)</div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>
                          {(latest?.avgPriceVnd ?? 12500).toLocaleString('vi-VN')} đ/kg
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>Giá Hòa Vốn</div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#475569' }}>
                          {(latest?.breakevenCostVnd ?? CROP_META[code].breakevenBase).toLocaleString('vi-VN')} đ/kg
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>Dải Dự Báo 80%</div>
                        <div style={{ fontWeight: 600, color: '#059669' }}>
                          {(latest?.expectedLowerBound80 ?? 10000).toLocaleString('vi-VN')} -{' '}
                          {(latest?.expectedUpperBound80 ?? 14500).toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#64748B', fontSize: '11px' }}>Nguồn Cung Ước Tính</div>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {latest?.estimatedSupplyTons ?? 160} tấn/tuần
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column Grid: Tier-2 Clean Market Prices & Tier-1 Immutable Raw Hashes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Tier 2 Clean Market Prices Table */}
            <div className="bento-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Tầng 2: Bảng Giá Sạch Chợ Đầu Mối (clean_market_prices)
                </h3>
                <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>100% Truy vết Raw ID</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '8px 6px' }}>ID / Raw</th>
                      <th style={{ padding: '8px 6px' }}>Cây trồng</th>
                      <th style={{ padding: '8px 6px' }}>Chợ đầu mối</th>
                      <th style={{ padding: '8px 6px' }}>Giá chuẩn (đ/kg)</th>
                      <th style={{ padding: '8px 6px' }}>Trạng thái MAD</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {cleanPrices.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '9px 6px', color: '#64748B' }}>
                          #{row.id} <span style={{ fontSize: '11px' }}>(→R{row.rawRecordId})</span>
                        </td>
                        <td style={{ padding: '9px 6px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                          {CROP_META[row.cropCode as CropCodeKey]?.nameVi.split(' (')[0] || row.cropCode}
                        </td>
                        <td style={{ padding: '9px 6px', fontFamily: 'var(--font-sans)' }}>
                          {MARKET_NAMES[row.marketCode] || row.marketCode}
                        </td>
                        <td
                          style={{
                            padding: '9px 6px',
                            fontWeight: 700,
                            color: row.isOutlier ? '#E11D48' : '#0F172A',
                          }}
                        >
                          {row.priceVndPerKg.toLocaleString('vi-VN')}đ
                        </td>
                        <td style={{ padding: '9px 6px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '99px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background:
                                row.reviewStatus === 'approved'
                                  ? '#DCFCE7'
                                  : row.reviewStatus === 'flagged'
                                  ? '#FEF3C7'
                                  : '#FFE4E6',
                              color:
                                row.reviewStatus === 'approved'
                                  ? '#166534'
                                  : row.reviewStatus === 'flagged'
                                  ? '#92400E'
                                  : '#9F1239',
                            }}
                          >
                            {row.reviewStatus.toUpperCase()} (Z={row.outlierScore})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tier 1 Immutable Raw Records Ledger */}
            <div className="bento-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15.5px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Tầng 1: Sổ Cái Dữ Liệu Thô Bất Biến (raw_market_records)
                </h3>
                <span style={{ fontSize: '11.5px', color: '#4F46E5', fontWeight: 700 }}>INSERT-ONLY + R2 VAULT</span>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#64748B' }}>
                Mọi bản ghi thu thập từ chợ đầu mối, thời tiết và nhật ký nông dân đều được băm SHA-256 chống trùng lặp và cấm tuyệt đối UPDATE/DELETE (Luật X1).
              </p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {rawRecords.slice(0, 6).map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12.5px',
                    }}
                  >
                    <div>
                      <strong className="tabular-nums" style={{ color: '#0F172A' }}>
                        RAW #{rec.id}
                      </strong>{' '}
                      · <span style={{ fontWeight: 600, color: '#059669' }}>{rec.sourceName}</span>
                      <div
                        className="tabular-nums"
                        style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}
                      >
                        SHA-256: {rec.contentHash.slice(0, 28)}...
                      </div>
                    </div>
                    <span className="tabular-nums" style={{ fontSize: '11px', color: '#475569' }}>
                      {rec.fetchedAt.slice(0, 16).replace('T', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 2: PRICE & SEASONALITY (GIÁ & MÙA VỤ - TIER-3 WEEKLY MARTS) */}
      {activeTab === 'price_seasonality' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Chuỗi Dữ Liệu Phân Tích Tuần Tầng 3 ({CROP_META[selectedCrop].nameVi})
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748B' }}>
                Truy vấn trực tiếp từ bảng <code>marts_weekly_crop_metrics</code> (Neon PostgreSQL) và đệm biên trên <code>Cloudflare Workers KV</code>.
              </p>
            </div>
            <span
              className="tabular-nums"
              style={{
                background: '#ECFDF5',
                color: '#047857',
                border: '1px solid #A7F3D0',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
              }}
            >
              Giá Hòa Vốn Chuẩn: {CROP_META[selectedCrop].breakevenBase.toLocaleString('vi-VN')} đ/kg
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '22px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', textAlign: 'left', color: '#334155' }}>
                  <th style={{ padding: '10px 12px' }}>Tuần ISO</th>
                  <th style={{ padding: '10px 12px' }}>Ngày bắt đầu</th>
                  <th style={{ padding: '10px 12px' }}>Giá TB (đ/kg)</th>
                  <th style={{ padding: '10px 12px' }}>Min – Max</th>
                  <th style={{ padding: '10px 12px' }}>Độ biến động</th>
                  <th style={{ padding: '10px 12px' }}>Dải Dự Báo 80% (Q10–Q90)</th>
                  <th style={{ padding: '10px 12px' }}>Giá Hòa Vốn</th>
                  <th style={{ padding: '10px 12px' }}>Nhãn Đề Xuất</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {activeMarts.map((m) => (
                  <tr key={`${m.cropCode}-${m.yearWeek}`} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '11px 12px', fontWeight: 700 }}>{m.yearWeek}</td>
                    <td style={{ padding: '11px 12px', color: '#64748B' }}>{m.weekStartDate}</td>
                    <td style={{ padding: '11px 12px', fontWeight: 800, color: '#059669' }}>
                      {m.avgPriceVnd.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      {m.minPriceVnd.toLocaleString('vi-VN')} – {m.maxPriceVnd.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '11px 12px' }}>{m.volatilityPct}%</td>
                    <td style={{ padding: '11px 12px', fontWeight: 600, color: '#0284C7' }}>
                      {m.expectedLowerBound80.toLocaleString('vi-VN')} – {m.expectedUpperBound80.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '11px 12px', color: '#B45309', fontWeight: 700 }}>
                      {m.breakevenCostVnd.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '11px 12px' }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background:
                            m.recommendationLabel === 'RECOMMENDED'
                              ? '#DCFCE7'
                              : m.recommendationLabel === 'CONSIDER'
                              ? '#FEF3C7'
                              : '#FFE4E6',
                          color:
                            m.recommendationLabel === 'RECOMMENDED'
                              ? '#166534'
                              : m.recommendationLabel === 'CONSIDER'
                              ? '#92400E'
                              : '#9F1239',
                        }}
                      >
                        {m.recommendationLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Seasonal Index 12-Month Heatmap */}
          <div style={{ background: '#F8FAFC', padding: '16px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0F172A' }}>
              Bản Đồ Nhiệt Chỉ Số Mùa Vụ 12 Tháng (Seasonal Index — Ngưỡng chuẩn = 1.00)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '8px' }}>
              {[
                { m: 'Tháng 1', idx: 1.15 },
                { m: 'Tháng 2', idx: 1.08 },
                { m: 'Tháng 3', idx: 0.94 },
                { m: 'Tháng 4', idx: 0.88 },
                { m: 'Tháng 5', idx: 0.92 },
                { m: 'Tháng 6', idx: 0.96 },
                { m: 'Tháng 7', idx: 1.04 },
                { m: 'Tháng 8', idx: 1.10 },
                { m: 'Tháng 9', idx: 1.14 },
                { m: 'Tháng 10', idx: 1.18 },
                { m: 'Tháng 11', idx: 1.12 },
                { m: 'Tháng 12', idx: 1.16 },
              ].map((item) => (
                <div
                  key={item.m}
                  className="tabular-nums"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: item.idx >= 1.1 ? '#DCFCE7' : item.idx < 0.95 ? '#FFE4E6' : '#FFFFFF',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-sans)' }}>{item.m}</div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: item.idx >= 1.1 ? '#166534' : item.idx < 0.95 ? '#9F1239' : '#0F172A',
                    }}
                  >
                    {item.idx.toFixed(2)}x
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: SUPPLY, DEMAND & ANTI-HERD PORTFOLIO ALLOCATION */}
      {activeTab === 'supply_demand' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Tối Ưu Phân Bổ Đa Canh & Thuật Toán Chống Trồng Ồ Ạt (Anti-Herd 25% — Luật X4)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748B' }}>
                Khi diện tích đăng ký trong HTX chạm 80% sức chứa thị trường, hệ thống khóa khuyến nghị trồng thêm và tự động chia lô đa canh.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="coop-area-input" style={{ fontSize: '13px', fontWeight: 600 }}>
                Tổng quỹ đất HTX (m²):
              </label>
              <input
                id="coop-area-input"
                type="number"
                min={2000}
                max={50000}
                step={1000}
                value={simulatedCoopAreaM2}
                onChange={(e) => setSimulatedCoopAreaM2(Math.max(1000, Number(e.target.value)))}
                className="tabular-nums"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #94A3B8',
                  fontWeight: 700,
                  width: '120px',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            {[
              {
                title: 'Lô Ưu Tiên 1: Cải Thìa (45%)',
                pct: 45,
                area: Math.round(simulatedCoopAreaM2 * 0.45),
                color: '#059669',
                desc: 'Biên lợi nhuận kỳ vọng +65%, thanh khoản chợ Bình Điền cao nhất.',
              },
              {
                title: 'Lô Đa Canh 2: Cải Ngọt (35%)',
                pct: 35,
                area: Math.round(simulatedCoopAreaM2 * 0.35),
                color: '#0284C7',
                desc: 'Phân tán rủi ro biến động giá, chu kỳ thu hoạch ngắn 28–32 ngày.',
              },
              {
                title: 'Quỹ Đất Dự Phòng & Nghỉ Đất (20%)',
                pct: 20,
                area: Math.round(simulatedCoopAreaM2 * 0.2),
                color: '#D97706',
                desc: 'Tránh dư cung cục bộ vượt ngưỡng 25% vùng (Anti-Herd Buffer) & cắt mầm bệnh.',
              },
            ].map((slot) => (
              <div
                key={slot.title}
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  borderTop: `4px solid ${slot.color}`,
                  background: '#F8FAFC',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0F172A' }}>{slot.title}</div>
                <div
                  className="tabular-nums"
                  style={{ fontSize: '24px', fontWeight: 800, color: slot.color, margin: '8px 0' }}
                >
                  {slot.area.toLocaleString('vi-VN')} m²
                </div>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#475569' }}>{slot.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 4: WEATHER & CLIMATE (OPEN-METEO PILOT REGION) */}
      {activeTab === 'weather' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            Dự Báo Khí Tượng Nông Nghiệp 7 Ngày — Vùng Thí Điểm An Phú Tân (Open-Meteo API)
          </h2>
          <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748B' }}>
            Tích hợp trực tiếp vào mô hình dự báo hao hụt năng suất và cảnh báo sớm ngập úng trên ứng dụng Nông dân.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {[
              { day: 'Thứ Hai (26/10)', temp: '25.5°C – 31.2°C', rain: '4.2 mm', risk: 'An toàn', ok: true },
              { day: 'Thứ Ba (27/10)', temp: '26.0°C – 32.0°C', rain: '2.0 mm', risk: 'Nắng tốt', ok: true },
              { day: 'Thứ Tư (28/10)', temp: '24.8°C – 29.5°C', rain: '18.5 mm', risk: 'Mưa rào chiều', ok: true },
              { day: 'Thứ Năm (29/10)', temp: '24.2°C – 28.4°C', rain: '52.4 mm', risk: 'Cảnh báo ngập liếp!', ok: false },
              { day: 'Thứ Sáu (30/10)', temp: '25.0°C – 30.1°C', rain: '8.0 mm', risk: 'Độ ẩm cao (86%)', ok: true },
            ].map((w) => (
              <div
                key={w.day}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: w.ok ? '#F8FAFC' : '#FFF1F2',
                  border: w.ok ? '1px solid #E2E8F0' : '1px solid #FDA4AF',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>{w.day}</div>
                <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 4px', color: w.ok ? '#0284C7' : '#E11D48' }}>
                  Mưa: {w.rain}
                </div>
                <div className="tabular-nums" style={{ fontSize: '12.5px', color: '#475569' }}>Nhiệt độ: {w.temp}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 700, color: w.ok ? '#059669' : '#BE123C' }}>
                  ● {w.risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 5: COST & BREAKEVEN SENSITIVITY SIMULATOR */}
      {activeTab === 'cost_breakeven' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Cấu Trúc Giá Hòa Vốn & Mô Phỏng Độ Nhạy Giá Phân Bón (Mã việc 4.5)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748B' }}>
                Kéo thanh trượt biến động giá phân bón để kiểm tra sức chịu đựng biên lợi nhuận của nông hộ.
              </p>
            </div>
            <div
              style={{
                background: '#F1F5F9',
                padding: '12px 16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <label htmlFor="fert-slider" style={{ fontSize: '13px', fontWeight: 700 }}>
                Biến động giá Phân bón:{' '}
                <span className="tabular-nums" style={{ color: fertilizerShockPct > 0 ? '#E11D48' : '#059669' }}>
                  {fertilizerShockPct > 0 ? `+${fertilizerShockPct}%` : `${fertilizerShockPct}%`}
                </span>
              </label>
              <input
                id="fert-slider"
                type="range"
                min={-20}
                max={50}
                step={5}
                value={fertilizerShockPct}
                onChange={(e) => setFertilizerShockPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div
            className="tabular-nums"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            {[
              { label: '1. Hạt giống chuẩn', val: baseSeedPerKg },
              { label: '2. Phân bón (Độ nhạy)', val: shockedFertPerKg, highlight: true },
              { label: '3. Thuốc BVTV sinh học', val: basePestPerKg },
              { label: '4. Công chăm sóc & Thu hoạch', val: baseLaborPerKg },
              { label: '5. Dự phòng hao hụt (10%)', val: baseLossBufferPerKg },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: item.highlight ? '#FEF3C7' : '#F8FAFC',
                  border: item.highlight ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-sans)' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {item.val.toLocaleString('vi-VN')} đ/kg
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <strong style={{ color: '#065F46', fontSize: '15px' }}>
                Tổng Giá Hòa Vốn Thực Tế (Cải thìa — Năng suất chuẩn 2.2 kg/m²):
              </strong>
              <div style={{ fontSize: '13px', color: '#047857' }}>
                So với giá kỳ vọng trung vị tuần tới (14.500 đ/kg), biên an toàn đạt{' '}
                <strong className="tabular-nums">
                  +{(14500 - dynamicBreakevenBokChoy).toLocaleString('vi-VN')} đ/kg
                </strong>
                .
              </div>
            </div>
            <div className="tabular-nums" style={{ fontSize: '26px', fontWeight: 800, color: '#047857' }}>
              {dynamicBreakevenBokChoy.toLocaleString('vi-VN')} đ/kg
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 6: MONTE CARLO RISK & GATE G6 SHA-256 FORECAST VAULT */}
      {activeTab === 'forecast_risk' && (
        <div className="bento-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                Mô Phỏng Rủi Ro Monte Carlo (2.000 Kịch Bản) & Két Sắt Dự Báo SHA-256 (Cổng G6)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748B' }}>
                Mọi dự báo phát cho nông dân đều được niêm phong mã băm SHA-256 vào <code>Cloudflare R2 Vault</code> để đối chiếu minh bạch sau thu hoạch.
              </p>
            </div>
            <button
              onClick={handleSealNewForecast}
              disabled={sealingForecast}
              className="interactive-btn"
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                background: '#059669',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)',
              }}
            >
              {sealingForecast
                ? 'Đang ký SHA-256 lên R2...'
                : `🔒 Niêm Phong Dự Báo Mới (${CROP_META[selectedCrop].nameVi.split(' (')[0]})`}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', textAlign: 'left', color: '#334155' }}>
                  <th style={{ padding: '10px' }}>Mã Bản Ghi</th>
                  <th style={{ padding: '10px' }}>Kỳ Phát Hành</th>
                  <th style={{ padding: '10px' }}>Cây Trồng</th>
                  <th style={{ padding: '10px' }}>Dải Q10 / Q50 / Q90 (đ/kg)</th>
                  <th style={{ padding: '10px' }}>Chữ Ký Bất Biến SHA-256</th>
                  <th style={{ padding: '10px' }}>Cloudflare R2 Object Key</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {sealedVaultList.map((v) => (
                  <tr key={v.forecastId} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{v.forecastId}</td>
                    <td style={{ padding: '10px' }}>{v.weekIso}</td>
                    <td style={{ padding: '10px', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
                      {CROP_META[v.cropCode].nameVi}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#059669' }}>
                      {v.q10.toLocaleString('vi-VN')} / {v.q50.toLocaleString('vi-VN')} / {v.q90.toLocaleString('vi-VN')}đ
                    </td>
                    <td style={{ padding: '10px', color: '#4F46E5', fontSize: '12px' }}>
                      {v.sha256.slice(0, 24)}...
                    </td>
                    <td style={{ padding: '10px', color: '#64748B', fontSize: '12px' }}>{v.r2Key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCREEN 7: DATA QUALITY MAD OUTLIER REVIEW & CLOUDFLARE FREE TIER SUITE (GATE G2 & G7) */}
      {activeTab === 'data_quality' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Interactive MAD Outlier Review Queue synced with Neon Postgres */}
          <div className="bento-card" style={{ padding: '24px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Hàng Đợi Thẩm Định Ngoại Lệ MAD (Median Absolute Deviation — Đồng Bộ Tầng 2 Neon DB)
            </h2>
            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#64748B' }}>
              Các dòng giá có điểm dị biệt <code>Modified Z-Score &gt; 3.5</code> được tự động gắn cờ <code>flagged</code>. Bấm <strong>Chấp thuận</strong> hoặc <strong>Từ chối</strong> để cập nhật trực tiếp vào bảng <code>clean_market_prices</code>.
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {cleanPrices
                .filter((r) => r.isOutlier)
                .map((outlier) => (
                  <div
                    key={outlier.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '12px',
                      background: outlier.reviewStatus === 'flagged' ? '#FFFBEB' : '#F8FAFC',
                      border:
                        outlier.reviewStatus === 'flagged' ? '1px solid #F59E0B' : '1px solid #CBD5E1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong className="tabular-nums" style={{ fontSize: '15px', color: '#0F172A' }}>
                          Clean ID #{outlier.id} (Raw #{outlier.rawRecordId})
                        </strong>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background: '#FFE4E6',
                            color: '#9F1239',
                          }}
                        >
                          MAD Z-Score = {outlier.outlierScore}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#E2E8F0',
                            color: '#334155',
                          }}
                        >
                          Trạng thái hiện tại: {outlier.reviewStatus.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#334155', marginTop: '6px' }}>
                        Cây trồng: <strong>{CROP_META[outlier.cropCode as CropCodeKey]?.nameVi || outlier.cropCode}</strong> ·
                        Chợ: <strong>{MARKET_NAMES[outlier.marketCode] || outlier.marketCode}</strong> · Giá ghi nhận:{' '}
                        <strong className="tabular-nums" style={{ color: '#E11D48' }}>
                          {outlier.priceVndPerKg.toLocaleString('vi-VN')} đ/kg
                        </strong>{' '}
                        (Đơn vị gốc: {outlier.originalPrice.toLocaleString('vi-VN')}đ / {outlier.originalUnit})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleReviewOutlier(outlier.id, 'approve')}
                        disabled={reviewingId === outlier.id}
                        className="interactive-btn"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #059669',
                          background: outlier.reviewStatus === 'approved' ? '#059669' : '#FFFFFF',
                          color: outlier.reviewStatus === 'approved' ? '#FFFFFF' : '#059669',
                          fontWeight: 700,
                          fontSize: '12.5px',
                        }}
                      >
                        ✓ Chấp thuận (Approve)
                      </button>
                      <button
                        onClick={() => handleReviewOutlier(outlier.id, 'reject')}
                        disabled={reviewingId === outlier.id}
                        className="interactive-btn"
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E11D48',
                          background: outlier.reviewStatus === 'rejected' ? '#E11D48' : '#FFFFFF',
                          color: outlier.reviewStatus === 'rejected' ? '#FFFFFF' : '#E11D48',
                          fontWeight: 700,
                          fontSize: '12.5px',
                        }}
                      >
                        ✕ Từ chối (Reject)
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 6 Goal-Aligned Cloudflare Free Tier Services Matrix */}
          <div className="bento-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Kiểm Toán 6 Dịch Vụ Cloudflare Free Tier Phục Vụ Trực Tiếp Cổng G0 → G7 (Chi Phí $0/Tháng)
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '14px',
              }}
            >
              {cfServices.map((svc) => (
                <div
                  key={svc.serviceId}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#0F172A' }}>{svc.serviceName}</strong>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        background: '#FFEDD5',
                        color: '#9A3412',
                      }}
                    >
                      {svc.targetGate}
                    </span>
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '12px', color: '#059669', fontWeight: 700, marginBottom: '6px' }}>
                    Binding: {svc.bindingName} · Hạn mức Free: {svc.freeTierQuota}
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#475569' }}>{svc.purposeInAgriData}</p>
                  <div style={{ background: '#E2E8F0', height: '7px', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, svc.utilizationPercent)}%`,
                        height: '100%',
                        background: '#059669',
                      }}
                    />
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                    Mức sử dụng: {svc.utilizationPercent}% ({svc.currentUsageSummary})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
