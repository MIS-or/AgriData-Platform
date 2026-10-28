import React, { useEffect, useState, useCallback } from 'react';
import { AnalyticsDashboard } from './modules/analytics-dashboard/index.js';
import {
  CropCodeKey,
  FarmerRecommendationDto,
  PlatformSyncPayload,
  fetchFarmerRecommendation,
  fetchPlatformSyncOverview,
  submitFarmerCropLog,
} from './core/api/client.js';

type ViewMode = 'farmer' | 'dashboard';

const CROP_BUTTONS: Array<{ code: CropCodeKey; label: string; cycleDays: string }> = [
  { code: 'bok_choy', label: '🥬 Cải thìa', cycleDays: '30–35 ngày' },
  { code: 'choi_sum', label: '🌿 Cải ngọt', cycleDays: '28–32 ngày' },
  { code: 'cucumber', label: '🥒 Dưa leo', cycleDays: '38–45 ngày' },
  { code: 'lettuce', label: '🥗 Xà lách', cycleDays: '35–40 ngày' },
];

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('farmer');
  const [selectedCrop, setSelectedCrop] = useState<CropCodeKey>('bok_choy');
  const [registeredAreaM2, setRegisteredAreaM2] = useState<number>(4500);
  const [recommendation, setRecommendation] = useState<FarmerRecommendationDto | null>(null);
  const [syncData, setSyncData] = useState<PlatformSyncPayload | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Interactive Modals for Farmer PWA
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [showZaloModal, setShowZaloModal] = useState<boolean>(false);
  const [logAreaM2, setLogAreaM2] = useState<number>(1500);
  const [logSeedVnd, setLogSeedVnd] = useState<number>(1800000);
  const [logFertVnd, setLogFertVnd] = useState<number>(4200000);
  const [logPestVnd, setLogPestVnd] = useState<number>(1500000);
  const [logLaborVnd, setLogLaborVnd] = useState<number>(4500000);
  const [submittingLog, setSubmittingLog] = useState<boolean>(false);
  const [logResultBanner, setLogResultBanner] = useState<string | null>(null);

  const refreshAllData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [overview, rec] = await Promise.all([
        fetchPlatformSyncOverview(),
        fetchFarmerRecommendation(selectedCrop, registeredAreaM2, 10000),
      ]);
      setSyncData(overview);
      setRecommendation(rec);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedCrop, registeredAreaM2]);

  useEffect(() => {
    void refreshAllData();
  }, [refreshAllData]);

  const handleCropLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLog(true);
    try {
      const result = await submitFarmerCropLog({
        cooperativeId: 'htx_an_phu_tan',
        farmerHashId: 'sha256_farmer_an_phu_tan_demo_001',
        cropCode: selectedCrop,
        plantedAreaM2: logAreaM2,
        plantingDate: '2026-10-28',
        expectedHarvestDate: '2026-11-30',
        seedCostVnd: logSeedVnd,
        fertilizerCostVnd: logFertVnd,
        pesticideCostVnd: logPestVnd,
        laborAndFuelCostVnd: logLaborVnd,
      });

      setLogResultBanner(
        `✓ Đã lưu Nhật ký #${result.warehouseRecordId} vào Kho Tầng 1 (Neon DB + R2: ${result.rawArchiveKey}). Giá hòa vốn thực tế của bác: ${result.calculatedBreakevenPriceVndPerKg.toLocaleString('vi-VN')} đ/kg.`
      );
      setShowLogModal(false);
      await refreshAllData();
    } finally {
      setSubmittingLog(false);
    }
  };

  const actionColor =
    recommendation?.actionLabel === 'RECOMMENDED'
      ? '#047857'
      : recommendation?.actionLabel === 'CONSIDER'
      ? '#B45309'
      : '#BE123C';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Enterprise Cloudflare / Linear Style Global Top Command Bar */}
      <header
        style={{
          backgroundColor: '#0B0F19',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.09)',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              }}
            >
              🌾
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '16.5px',
                    letterSpacing: '-0.02em',
                    color: '#F8FAFC',
                  }}
                >
                  AgriData Edge Cloud
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: 'rgba(246, 130, 31, 0.18)',
                    color: '#FB923C',
                    border: '1px solid rgba(246, 130, 31, 0.35)',
                  }}
                >
                  v2.4 PRO MAX
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                HTX Nông Nghiệp An Phú Tân · Kho 3 Tầng Neon Postgres & Cloudflare Edge
              </div>
            </div>
          </div>

          {/* Live API & Database Telemetry Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#111827',
              border: '1px solid #1E293B',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '12px',
            }}
          >
            <span className="live-dot" />
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
              {syncData?.connectionMode === 'LIVE_NEON_POSTGRES'
                ? 'Neon Postgres 3-Tier (LIVE)'
                : 'Edge Sync Ready'}
            </span>
            <span className="tabular-nums" style={{ color: '#34D399', fontWeight: 700 }}>
              {syncData?.latencyMs ?? 4}ms
            </span>
            <button
              onClick={() => void refreshAllData()}
              disabled={isSyncing}
              className="interactive-btn"
              style={{
                background: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid #334155',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              {isSyncing ? '⟳ Đang đồng bộ...' : '⟳ Đồng bộ API & DB'}
            </button>
          </div>

          {/* Dual-Persona Switcher */}
          <div
            role="tablist"
            aria-label="Chuyển đổi giao diện người dùng"
            style={{
              display: 'flex',
              background: '#111827',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid #1E293B',
              gap: '4px',
            }}
          >
            <button
              role="tab"
              aria-selected={viewMode === 'farmer'}
              onClick={() => setViewMode('farmer')}
              className="interactive-btn"
              style={{
                padding: '7px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: viewMode === 'farmer' ? '#059669' : 'transparent',
                color: viewMode === 'farmer' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              📱 Nông Dân PWA (Ngoài nắng)
            </button>
            <button
              role="tab"
              aria-selected={viewMode === 'dashboard'}
              onClick={() => setViewMode('dashboard')}
              className="interactive-btn"
              style={{
                padding: '7px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: viewMode === 'dashboard' ? '#F6821F' : 'transparent',
                color: viewMode === 'dashboard' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              📊 Trung Tâm Phân Tích (7 Tab)
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: HIGH-CONTRAST FARMER MOBILE PWA (GATE G5) */}
      {viewMode === 'farmer' ? (
        <main
          style={{
            maxWidth: '480px',
            margin: '24px auto 56px',
            padding: '0 14px',
          }}
        >
          {/* Sunlight High-Contrast Mobile Card Shell */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #CBD5E1',
              overflow: 'hidden',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.12)',
            }}
          >
            {/* Mobile PWA Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
                color: '#FFFFFF',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'rgba(255,255,255,0.18)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  HTX An Phú Tân · Vụ Đông Xuân
                </span>
                <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 700, color: '#A7F3D0' }}>
                  ● T3 Marts Synced
                </span>
              </div>
              <h1
                style={{
                  margin: '10px 0 4px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                Trợ Lý Chọn Cây Trồng & Giá Chợ
              </h1>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#D1FAE5' }}>
                Chữ lớn · Tương phản cao ngoài trời nắng · Chống trồng ồ ạt
              </p>
            </div>

            <div style={{ padding: '18px' }}>
              {/* Saved Log Notification */}
              {logResultBanner && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '2px solid #059669',
                    color: '#065F46',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    marginBottom: '16px',
                  }}
                >
                  {logResultBanner}
                </div>
              )}

              {/* 4 Crop Selector Touch Targets (>= 48px height) */}
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#334155',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  1. Chọn Cây Trồng Bác Đang Định Xuống Giống:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {CROP_BUTTONS.map((btn) => {
                    const active = selectedCrop === btn.code;
                    return (
                      <button
                        key={btn.code}
                        onClick={() => setSelectedCrop(btn.code)}
                        className="interactive-btn"
                        style={{
                          minHeight: '52px',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          border: active ? '2px solid #047857' : '1.5px solid #CBD5E1',
                          background: active ? '#ECFDF5' : '#F8FAFC',
                          color: active ? '#065F46' : '#1E293B',
                          fontWeight: 800,
                          fontSize: '14.5px',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <span>{btn.label}</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
                          Thu hoạch: {btn.cycleDays}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hero Traffic-Light Recommendation Card */}
              <section
                aria-label="Khuyến nghị hành động mùa vụ"
                style={{
                  border: `3px solid ${actionColor}`,
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '16px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: actionColor,
                    color: '#FFFFFF',
                    fontWeight: 800,
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '13.5px',
                    marginBottom: '10px',
                  }}
                >
                  KHUYẾN NGHỊ: {recommendation?.actionTitleVi || 'NÊN TRỒNG'}
                </div>

                <h2
                  style={{
                    margin: '0 0 12px',
                    fontSize: '21px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: '#0F172A',
                  }}
                >
                  {recommendation?.cropNameVi || 'Cải thìa (Bok Choy)'}
                </h2>

                {/* Price & Breakeven Comparison Box */}
                <div
                  className="tabular-nums"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    backgroundColor: '#F8FAFC',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      Giá Hòa Vốn Ước Tính
                    </div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      {(recommendation?.breakevenPriceVnd ?? 7500).toLocaleString('vi-VN')} đ/kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                      Giá Dự Kiến Lúc Bán (80%)
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                      {(recommendation?.expectedPriceRangeVnd[0] ?? 12000).toLocaleString('vi-VN')} –{' '}
                      {(recommendation?.expectedPriceRangeVnd[1] ?? 16800).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                </div>

                {/* 3 Plain-Language Reasons */}
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A', marginBottom: '6px' }}>
                  3 Lý do cốt lõi từ dữ liệu chợ đầu mối & thời tiết:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#1E293B', lineHeight: 1.55, fontSize: '14px' }}>
                  {(recommendation?.reasonsVi || []).map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Anti-Herd Cooperative Saturation Interactive Bar */}
              <section
                aria-label="Cảnh báo diện tích vùng chống trồng ồ ạt"
                style={{
                  backgroundColor: '#FFFBEB',
                  border: '2px solid #F59E0B',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#92400E', fontSize: '13.5px' }}>
                    🛡️ Hạn Mức Chống Trồng Ồ Ạt (Anti-Herd 25%)
                  </strong>
                  <span className="tabular-nums" style={{ fontWeight: 800, fontSize: '13px', color: '#B45309' }}>
                    {recommendation?.saturationRatioPct ?? 45}% / Trần 80%
                  </span>
                </div>
                <div
                  style={{
                    background: '#FDE68A',
                    height: '12px',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, recommendation?.saturationRatioPct ?? 45)}%`,
                      height: '100%',
                      background: (recommendation?.saturationRatioPct ?? 45) >= 80 ? '#E11D48' : '#D97706',
                      transition: 'width 250ms ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', color: '#78350F' }}>
                  <span>Mô phỏng diện tích HTX đã đăng ký:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[4500, 7500, 8500].map((areaVal) => (
                      <button
                        key={areaVal}
                        onClick={() => setRegisteredAreaM2(areaVal)}
                        className="interactive-btn tabular-nums"
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: registeredAreaM2 === areaVal ? '1.5px solid #92400E' : '1px solid #FCD34D',
                          background: registeredAreaM2 === areaVal ? '#F59E0B' : '#FEF3C7',
                          color: registeredAreaM2 === areaVal ? '#FFFFFF' : '#92400E',
                          fontWeight: 700,
                          fontSize: '11.5px',
                        }}
                      >
                        {(areaVal / 1000).toFixed(1)}k m²
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* High-Touch Action Buttons (>= 52px height) */}
              <div style={{ display: 'grid', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(true)}
                  className="interactive-btn"
                  style={{
                    width: '100%',
                    minHeight: '54px',
                    backgroundColor: '#047857',
                    color: '#FFFFFF',
                    fontSize: '15.5px',
                    fontWeight: 800,
                    border: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 6px 16px rgba(4, 120, 87, 0.28)',
                  }}
                >
                  📝 Ghi Nhật Ký Chi Phí Vụ Mùa (Tính Giá Hòa Vốn)
                </button>

                <button
                  type="button"
                  onClick={() => setShowZaloModal(true)}
                  className="interactive-btn"
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '14.5px',
                    fontWeight: 800,
                    border: '2px solid #93C5FD',
                    borderRadius: '14px',
                  }}
                >
                  💬 Xem Bản Tin Zalo OA Hàng Tuần (≤ 120 chữ)
                </button>
              </div>
            </div>
          </div>

          {/* MODAL 1: FARMER CROP LOG FORM (POST /api/v1/ingest/farmer-log) */}
          {showLogModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <form
                onSubmit={handleCropLogSubmit}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  maxWidth: '440px',
                  width: '100%',
                  padding: '22px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                  📝 Ghi Nhật Ký Vụ Mùa Vào Kho Tầng 1
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#475569' }}>
                  Dữ liệu được bảo vệ chống bot bằng Cloudflare Turnstile, lưu vào <code>raw_market_records</code> (Neon DB) và <code>Cloudflare R2</code>.
                </p>

                <div style={{ display: 'grid', gap: '10px', marginBottom: '16px', fontSize: '13.5px' }}>
                  <label style={{ display: 'grid', gap: '4px', fontWeight: 700 }}>
                    <span>Diện tích xuống giống (m²):</span>
                    <input
                      type="number"
                      value={logAreaM2}
                      onChange={(e) => setLogAreaM2(Number(e.target.value))}
                      className="tabular-nums"
                      style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '15px', fontWeight: 700 }}
                    />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '4px', fontWeight: 700 }}>
                      <span>Tiền giống (VNĐ):</span>
                      <input
                        type="number"
                        value={logSeedVnd}
                        onChange={(e) => setLogSeedVnd(Number(e.target.value))}
                        className="tabular-nums"
                        style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontWeight: 700 }}>
                      <span>Tiền phân bón (VNĐ):</span>
                      <input
                        type="number"
                        value={logFertVnd}
                        onChange={(e) => setLogFertVnd(Number(e.target.value))}
                        className="tabular-nums"
                        style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontWeight: 700 }}>
                      <span>Thuốc BVTV (VNĐ):</span>
                      <input
                        type="number"
                        value={logPestVnd}
                        onChange={(e) => setLogPestVnd(Number(e.target.value))}
                        className="tabular-nums"
                        style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '4px', fontWeight: 700 }}>
                      <span>Công & Xăng dầu (VNĐ):</span>
                      <input
                        type="number"
                        value={logLaborVnd}
                        onChange={(e) => setLogLaborVnd(Number(e.target.value))}
                        className="tabular-nums"
                        style={{ padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontWeight: 700 }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontWeight: 700,
                    }}
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLog}
                    style={{
                      flex: 2,
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#047857',
                      color: '#FFFFFF',
                      fontWeight: 800,
                    }}
                  >
                    {submittingLog ? 'Đang lưu Neon DB...' : 'Lưu Nhật Ký & Tính Hòa Vốn'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODAL 2: ZALO OA WEEKLY BULLETIN PREVIEW */}
          {showZaloModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  maxWidth: '420px',
                  width: '100%',
                  padding: '22px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#1D4ED8', fontSize: '16px' }}>
                    💬 Tin Nhắn Zalo OA Tự Động (Sáng Thứ Hai)
                  </strong>
                  <span style={{ fontSize: '11px', background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: '99px', fontWeight: 700 }}>
                    Chuẩn G5 (≤ 120 từ)
                  </span>
                </div>
                <div
                  style={{
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    color: '#0F172A',
                    marginBottom: '16px',
                  }}
                >
                  <strong>[HTX An Phú Tân - Tuần 44/2026]</strong>
                  <br />
                  🌱 <strong>Nên trồng:</strong> Cải thìa (tối đa 45% đất, giá dự kiến 12.000–16.800đ/kg, hòa vốn 7.500đ).
                  <br />
                  ⚖️ <strong>Cân nhắc:</strong> Cải ngọt (35% đất, giá 9.800–13.500đ/kg).
                  <br />
                  ⛔ <strong>Tạm ngưng:</strong> Dưa leo (chợ Hóc Môn đang dư hàng, giá dưới hòa vốn).
                  <br />
                  🌧️ <strong>Thời tiết:</strong> Thứ Năm có mưa 52mm, bà con khơi thông rãnh thoát nước.
                </div>
                <button
                  type="button"
                  onClick={() => setShowZaloModal(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#1D4ED8',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '14px',
                  }}
                >
                  Đã Hiểu & Đóng Bản Tin
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* VIEW 2: 7-SCREEN ENTERPRISE ANALYTICS DASHBOARD */
        <AnalyticsDashboard syncData={syncData} onSyncRefresh={refreshAllData} />
      )}
    </div>
  );
}
