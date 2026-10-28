import { useState } from 'react';
import {
  CROP_DICTIONARY,
  CropCode,
} from '@agridata/contracts';

export type DashboardTab =
  | 'overview'
  | 'price_seasonality'
  | 'supply_demand'
  | 'weather'
  | 'cost_breakeven'
  | 'forecast_risk'
  | 'data_quality';

interface FlaggedOutlierItem {
  id: number;
  cropName: string;
  marketName: string;
  priceVnd: number;
  zScore: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [selectedCrop, setSelectedCrop] = useState<CropCode>('bok_choy');
  const [outlierQueue, setOutlierQueue] = useState<FlaggedOutlierItem[]>([
    { id: 601, cropName: 'Cải thìa', marketName: 'Bình Điền', priceVnd: 48000, zScore: 4.8, date: '2026-10-27', status: 'pending' },
    { id: 602, cropName: 'Dưa leo', marketName: 'Hóc Môn', priceVnd: 2500, zScore: -3.8, date: '2026-10-28', status: 'pending' },
  ]);

  const handleReviewOutlier = (id: number, decision: 'approved' | 'rejected') => {
    setOutlierQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: decision } : item))
    );
  };

  const crop = CROP_DICTIONARY[selectedCrop];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Crop Selector & Live Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#111827', fontWeight: 'bold' }}>
            Bảng Phân Tích Nông Nghiệp & Điều Hành Cung Cầu
          </h2>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Hệ thống dữ liệu chuẩn hóa 3 tầng · Vùng thí điểm An Phú Tân · Tuần 43/2026
          </span>
        </div>

        {/* Global Filter Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value as CropCode)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#1F2937',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {Object.values(CROP_DICTIONARY).map((c) => (
              <option key={c.code} value={c.code}>
                {c.vietnameseName}
              </option>
            ))}
          </select>

          <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
            🟢 Cổng G2 & G3: ĐẠT CHUẨN
          </span>
        </div>
      </div>

      {/* 7 Tabs Navigation */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: '1. Tổng quan' },
          { id: 'price_seasonality', label: '2. Giá & Mùa vụ' },
          { id: 'supply_demand', label: '3. Cung & Cầu' },
          { id: 'weather', label: '4. Thời tiết' },
          { id: 'cost_breakeven', label: '5. Chi phí & Hòa vốn' },
          { id: 'forecast_risk', label: '6. Dự báo & Rủi ro' },
          { id: 'data_quality', label: '7. Chất lượng dữ liệu' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#064E3B' : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#4B5563',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SCREEN 1: TỔNG QUAN (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Giá Chợ Bình Điền ({crop.vietnameseName})</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '6px 0' }}>12.500 đ/kg</div>
              <div style={{ fontSize: '12px', color: '#059669' }}>▲ +4.2% so với tuần trước</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Giá Hòa Vốn Ước Tính</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '6px 0' }}>7.500 đ/kg</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Biên an toàn: +66.7%</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Dự Báo Thu Hoạch (Q50)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857', margin: '6px 0' }}>12.200 đ/kg</div>
              <div style={{ fontSize: '12px', color: '#059669' }}>Dải 80%: [10.000 - 14.400] đ</div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Xác Suất Lỗ (Monte Carlo)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', margin: '6px 0' }}>4.8%</div>
              <div style={{ fontSize: '12px', color: '#059669' }}>Rủi ro rất thấp · Khuyến nghị nên trồng</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#065F46' }}>💡 Tín Hiệu Thị Trường Cần Chú Ý Trong Tuần</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#047857', lineHeight: 1.5 }}>
              Khu vực Tây Nam Bộ bắt đầu vào cuối vụ mưa. Giá cải thìa và cải ngọt tại chợ đầu mối Bình Điền tăng nhẹ 4-6% do sản lượng cục bộ giảm 15%. Diện tích đăng ký tại HTX An Phú Tân đang ở mức 85% hạn mức an toàn, chưa xuất hiện nguy cơ đổ xô dội chợ.
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 2: GIÁ & MÙA VỤ */}
      {activeTab === 'price_seasonality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Phân Tích Mùa Vụ 52 Tuần ({crop.vietnameseName})</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            Chỉ số mùa vụ được chuẩn hóa từ chuỗi dữ liệu lịch sử 2 năm (Mã việc 0.6 & 3.1).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '6px', marginTop: '10px' }}>
            {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map((month, idx) => {
              const isHigh = idx >= 5 && idx <= 8;
              return (
                <div
                  key={month}
                  style={{
                    backgroundColor: isHigh ? '#FEE2E2' : '#EFF6FF',
                    border: `1px solid ${isHigh ? '#FCA5A5' : '#BFDBFE'}`,
                    padding: '10px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>{month}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: isHigh ? '#DC2626' : '#2563EB', marginTop: '4px' }}>
                    {isHigh ? '+18%' : '-8%'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6B7280' }}>{isHigh ? 'Mùa đắt' : 'Thuận mùa'}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>Biến Động Giá Tuần Gần Đây (Marts Layer)</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '140px', padding: '10px 0' }}>
              {[
                { week: 'W39', price: 11000, h: 60 },
                { week: 'W40', price: 11500, h: 70 },
                { week: 'W41', price: 12200, h: 85 },
                { week: 'W42', price: 12000, h: 80 },
                { week: 'W43', price: 12500, h: 95 },
                { week: 'W44 (Dự báo)', price: 12800, h: 105, isForecast: true },
              ].map((item) => (
                <div key={item.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: item.isForecast ? '#047857' : '#1F2937' }}>
                    {item.price.toLocaleString()}đ
                  </span>
                  <div
                    style={{
                      width: '80%',
                      height: `${item.h}px`,
                      backgroundColor: item.isForecast ? '#059669' : '#3B82F6',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{item.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: CUNG & CẦU */}
      {activeTab === 'supply_demand' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Giám Sát Nguồn Cung & Phòng Chống Đổ Xô (Mã việc 1.6 & 5.8)</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1F2937' }}>Tiến Độ Gieo Trồng Toàn Vùng</h4>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#047857' }}>8.500 / 10.000 m²</div>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#4B5563' }}>
                Đã đạt 85% hạn mức an toàn của hợp tác xã. Cơ chế Anti-herd đang ở mức giám sát xanh.
              </p>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1F2937' }}>Ước Tính Sản Lượng 12 Tuần Tới</h4>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1F2937' }}>185 Tấn</div>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#4B5563' }}>
                Khả năng hấp thụ của 3 chợ đầu mối TP.HCM ước đạt 220 tấn/tuần. Chưa có nguy cơ dư cung.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 4: THỜI TIẾT */}
      {activeTab === 'weather' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Thời Tiết & Tương Quan Năng Suất (Open-Meteo)</h3>
              <span style={{ fontSize: '13px', color: '#6B7280' }}>Độ nhạy nước của {crop.vietnameseName}: <strong>Cao</strong></span>
            </div>
            <span style={{ backgroundColor: '#ECFDF5', color: '#065F46', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
              Tọa độ: 10.04°N, 105.78°E
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {[
              { day: 'Hôm nay', temp: '25° - 32°C', rain: '8mm' },
              { day: 'Thứ 5', temp: '24° - 31°C', rain: '14mm' },
              { day: 'Thứ 6', temp: '24° - 30°C', rain: '22mm' },
              { day: 'Thứ 7', temp: '23° - 29°C', rain: '35mm' },
              { day: 'Chủ Nhật', temp: '24° - 32°C', rain: '12mm' },
            ].map((w) => (
              <div key={w.day} style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>{w.day}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: '4px 0' }}>{w.temp}</div>
                <div style={{ fontSize: '12px', color: '#2563EB' }}>🌧️ {w.rain}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 5: CHI PHÍ & HÒA VỐN */}
      {activeTab === 'cost_breakeven' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Cấu Thành Chi Phí Sản Xuất & Giá Hòa Vốn (Mã việc 0.5 & 4.8)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
            Dựa trên số liệu sổ sách thực tế 8 vụ gần nhất của hộ nông dân và định mức vật tư vùng.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Hạt giống & cây con</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px' }}>1.200 đ/kg (16%)</div>
            </div>
            <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Phân bón & cải tạo đất</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px' }}>2.800 đ/kg (37%)</div>
            </div>
            <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Thuốc BVTV sinh học</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px' }}>1.400 đ/kg (19%)</div>
            </div>
            <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Công cày, tưới, thu hái</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px' }}>2.100 đ/kg (28%)</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#92400E' }}>
              Tổng chi phí hòa vốn ước tính: 7.500 đ/kg
            </span>
            <span style={{ fontSize: '13px', color: '#B45309' }}>
              Điểm bán an toàn kỳ vọng: $\ge$ 9.000 đ/kg (Lãi tối thiểu 20%)
            </span>
          </div>
        </div>
      )}

      {/* SCREEN 6: DỰ BÁO & RỦI RO */}
      {activeTab === 'forecast_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Dự Báo Phân Vị & Phân Bổ Diện Tích Chia Lô (Mã việc 3.7 & 3.8)</h3>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              Độ phủ dải 80%: 81.4% (Đạt Cổng G3)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1F2937' }}>Dự Báo Giá 4 Tuần Tới (Biểu đồ quạt)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Kịch bản xấu 10% (Q10):</span>
                <strong style={{ color: '#DC2626' }}>10.000 đ/kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Giá kỳ vọng trung vị (Q50):</span>
                <strong style={{ color: '#047857' }}>12.200 đ/kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Kịch bản thuận lợi (Q90):</span>
                <strong style={{ color: '#2563EB' }}>14.400 đ/kg</strong>
              </div>
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1F2937' }}>Tối Ưu Chia Lô Đa Canh (10.000 m²)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>🌱 Cải thìa (Chủ lực):</span>
                <strong>5.000 m² (50%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>🥗 Xà lách:</span>
                <strong>3.000 m² (30%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                <span>🥬 Cải ngọt:</span>
                <strong>2.000 m² (20%)</strong>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#059669', fontStyle: 'italic' }}>
                ✓ Phân bổ tuân thủ giới hạn tối đa 60% diện tích cho 1 cây để chống sốc giá.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 7: CHẤT LƯỢNG DỮ LIỆU */}
      {activeTab === 'data_quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Giám Sát 15 Nguồn & Hàng Đợi Ngoại Lệ MAD (Cổng G2)</h3>
            <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              Tỷ lệ thiếu: 4.8% (&lt; 10%) · Tính truy vết: 100%
            </span>
          </div>

          <h4 style={{ margin: '10px 0 6px 0', fontSize: '14px', color: '#374151' }}>Hàng Đợi Duyệt Tay Ngoại Lệ MAD (Mã việc 2.5)</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '8px' }}>Mã Dòng</th>
                <th style={{ padding: '8px' }}>Nông Sản</th>
                <th style={{ padding: '8px' }}>Thị Trường</th>
                <th style={{ padding: '8px' }}>Giá Đột Biến</th>
                <th style={{ padding: '8px' }}>Điểm MAD Z-Score</th>
                <th style={{ padding: '8px' }}>Trạng Thái</th>
                <th style={{ padding: '8px' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {outlierQueue.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '8px' }}>#{item.id}</td>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{item.cropName}</td>
                  <td style={{ padding: '8px' }}>{item.marketName}</td>
                  <td style={{ padding: '8px', color: '#DC2626', fontWeight: 'bold' }}>{item.priceVnd.toLocaleString()} đ</td>
                  <td style={{ padding: '8px' }}>{item.zScore}</td>
                  <td style={{ padding: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: item.status === 'approved' ? '#D1FAE5' : item.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                        color: item.status === 'approved' ? '#065F46' : item.status === 'rejected' ? '#B91C1C' : '#92400E',
                      }}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    {item.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleReviewOutlier(item.id, 'approved')}
                          style={{ padding: '4px 8px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReviewOutlier(item.id, 'rejected')}
                          style={{ padding: '4px 8px', backgroundColor: '#DC2626', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
