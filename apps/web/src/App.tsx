import { useState } from 'react';
import {
  CROP_DICTIONARY,
  CropCode,
} from '@agridata/contracts';

export default function App() {
  const [viewMode, setViewMode] = useState<'farmer' | 'dashboard'>('farmer');
  const [selectedCrop, setSelectedCrop] = useState<CropCode>('bok_choy');
  const [registeredArea, setRegisteredArea] = useState<number>(8500);
  const maxSafeArea = 10000;

  // Mô phỏng dữ liệu phản hồi từ Rule Engine (Gate G5)
  const currentCropInfo = CROP_DICTIONARY[selectedCrop];
  const saturationRatio = registeredArea / maxSafeArea;

  let badgeColor = '#059669'; // Green
  let actionText = 'NÊN XUỐNG GIỐNG LỨA NÀY';
  let plainReason = `Giá thu hoạch dự kiến từ 10.000đ - 14.000đ/kg, cao hơn mức hòa vốn 7.500đ/kg. Thời tiết 2 tuần tới mát mẻ, ít sâu bệnh.`;

  if (selectedCrop === 'cucumber') {
    badgeColor = '#DC2626'; // Red
    actionText = 'CHƯA NÊN TRỒNG';
    plainReason = `Giá chợ đầu mối đang dội hàng, dự kiến chỉ đạt tối đa 8.500đ/kg, thấp hơn chi phí sản xuất 9.500đ/kg. Bà con xuống giống lứa này khả năng lỗ cao.`;
  } else if (saturationRatio >= 1.2) {
    badgeColor = '#DC2626';
    actionText = 'CẢNH BÁO ĐỔ XÔ: CHƯA NÊN TRỒNG';
    plainReason = `Trong xã đã có quá nhiều hộ đăng ký gieo ${currentCropInfo.vietnameseName} (vượt 120% định mức an toàn). Nếu tiếp tục trồng sẽ bị rớt giá đồng loạt!`;
  } else if (saturationRatio >= 1.0) {
    badgeColor = '#D97706'; // Amber
    actionText = 'CẦN CÂN NHẮC KỸ';
    plainReason = `Diện tích toàn vùng đã gần chạm ngưỡng bão hòa. Bà con nên chia nhỏ diện tích hoặc gieo cách tuần để tránh áp lực bán tháo.`;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{
        backgroundColor: '#064E3B',
        color: '#FFFFFF',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🌱</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>AgriData Việt Nam</h1>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>Cloudflare Free Tier Edge Platform</span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('farmer')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundColor: viewMode === 'farmer' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'farmer' ? '#064E3B' : '#FFFFFF',
            }}
          >
            🌾 Nông Dân (PWA)
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              backgroundColor: viewMode === 'dashboard' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'dashboard' ? '#064E3B' : '#FFFFFF',
            }}
          >
            📊 Dân Phân Tích
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '20px', maxWidth: viewMode === 'farmer' ? '500px' : '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {viewMode === 'farmer' ? (
          /* FARMER MOBILE PWA VIEW (GATE G5) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', color: '#065F46', fontWeight: 600 }}>📍 Vùng thí điểm 1: Hợp tác xã An Phú Tân</span>
              <span style={{ fontSize: '12px', color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '12px' }}>Tuần 43/2026</span>
            </div>

            {/* Crop Selector Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
                Chọn loại rau bà con dự định trồng:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.values(CROP_DICTIONARY).map((crop) => (
                  <button
                    key={crop.code}
                    onClick={() => setSelectedCrop(crop.code)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: selectedCrop === crop.code ? '2px solid #059669' : '1px solid #D1D5DB',
                      backgroundColor: selectedCrop === crop.code ? '#F0FDF4' : '#FFFFFF',
                      color: selectedCrop === crop.code ? '#065F46' : '#1F2937',
                      fontWeight: selectedCrop === crop.code ? 'bold' : 'normal',
                      fontSize: '15px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {crop.vietnameseName}
                    <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                      Chu kỳ: {crop.growthDaysMin}-{crop.growthDaysMax} ngày
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Big Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              border: `2px solid ${badgeColor}`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{
                backgroundColor: badgeColor,
                color: '#FFFFFF',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.5px'
              }}>
                {actionText}
              </div>

              {/* Price Figures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Chi phí hòa vốn ước tính</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F2937', marginTop: '4px' }}>
                    {selectedCrop === 'cucumber' ? '9.500' : '7.500'} đ/kg
                  </div>
                </div>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Giá thu hoạch dự kiến</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: badgeColor, marginTop: '4px' }}>
                    {selectedCrop === 'cucumber' ? '6.000 - 8.500' : '10.000 - 14.000'} đ
                  </div>
                </div>
              </div>

              {/* Plain Reason */}
              <div style={{ backgroundColor: '#F3F4F6', padding: '14px', borderRadius: '10px', fontSize: '14px', lineHeight: 1.5, color: '#374151' }}>
                <strong>Lời khuyên: </strong>{plainReason}
              </div>

              {/* Anti-herd Status Indicator */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4B5563', marginBottom: '4px' }}>
                  <span>Tiến độ diện tích gieo toàn xã:</span>
                  <strong>{registeredArea.toLocaleString()} / {maxSafeArea.toLocaleString()} m² ({(saturationRatio * 100).toFixed(0)}%)</strong>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(saturationRatio * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: saturationRatio >= 1.2 ? '#DC2626' : saturationRatio >= 1.0 ? '#D97706' : '#059669',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Farmer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setRegisteredArea((prev) => prev + 1000)}
                style={{
                  backgroundColor: '#047857',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📝 Đăng Ký Diện Tích Xuống Giống (+1.000m²)
              </button>
              <button
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#065F46',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #065F46',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                📲 Nhận Bản Tin Khuyến Nghị Qua Zalo
              </button>
            </div>
          </div>
        ) : (
          /* ANALYST DASHBOARD VIEW (GATE G4) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>Bảng Điều Khiển Dữ Liệu Thị Trường</h2>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Dữ liệu đồng bộ từ Chợ Đầu Mối Bình Điền & Thủ Đức lúc 04:00 AM</span>
              </div>
              <span style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                🟢 3/3 Nguồn Đang Hoạt Động (G1 OK)
              </span>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Chợ Đầu Mối Bình Điền (Cải thìa)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '6px 0' }}>12.500 đ/kg</div>
                <div style={{ fontSize: '12px', color: '#059669' }}>▲ +4.2% so với tuần trước</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Chợ Đầu Mối Thủ Đức (Cải ngọt)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '6px 0' }}>11.800 đ/kg</div>
                <div style={{ fontSize: '12px', color: '#DC2626' }}>▼ -1.5% so với tuần trước</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Ước tính sản lượng 4 tuần tới</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '6px 0' }}>185 Tấn</div>
                <div style={{ fontSize: '12px', color: '#059669' }}>Trong ngưỡng an toàn hấp thụ</div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Độ phủ dải dự báo 80% (G3)</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857', margin: '6px 0' }}>81.4%</div>
                <div style={{ fontSize: '12px', color: '#059669' }}>Đạt tiêu chuẩn Cổng G3 (72%-88%)</div>
              </div>
            </div>

            {/* Sample Table for Clean Data */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#374151' }}>Bảng Giá Chuẩn Hóa Lớp 2 (Clean Data Layer - VND/kg)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '8px' }}>Mã Cây</th>
                    <th style={{ padding: '8px' }}>Tên Cây</th>
                    <th style={{ padding: '8px' }}>Thị Trường</th>
                    <th style={{ padding: '8px' }}>Giá Sạch (VNĐ/kg)</th>
                    <th style={{ padding: '8px' }}>Đơn Vị Gốc</th>
                    <th style={{ padding: '8px' }}>Trạng Thái MAD</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px' }}><code>bok_choy</code></td>
                    <td style={{ padding: '8px' }}>Cải thìa</td>
                    <td style={{ padding: '8px' }}>Bình Điền</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>12.500 đ</td>
                    <td style={{ padding: '8px' }}>1.250.000 đ / tạ</td>
                    <td style={{ padding: '8px', color: '#059669' }}>Hợp lệ (Z=0.4)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px' }}><code>choi_sum</code></td>
                    <td style={{ padding: '8px' }}>Cải ngọt</td>
                    <td style={{ padding: '8px' }}>Thủ Đức</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>11.800 đ</td>
                    <td style={{ padding: '8px' }}>118.000 đ / yến</td>
                    <td style={{ padding: '8px', color: '#059669' }}>Hợp lệ (Z=0.8)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px' }}><code>cucumber</code></td>
                    <td style={{ padding: '8px' }}>Dưa leo</td>
                    <td style={{ padding: '8px' }}>Hóc Môn</td>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>7.200 đ</td>
                    <td style={{ padding: '8px' }}>14.400 đ / chục</td>
                    <td style={{ padding: '8px', color: '#D97706' }}>Cảnh báo thấp (Z=-2.1)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        padding: '12px 20px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6B7280'
      }}>
        AgriData Platform · Vận hành hoàn toàn trên gói miễn phí Cloudflare (Pages + Workers + D1) & Neon PostgreSQL
      </footer>
    </div>
  );
}
