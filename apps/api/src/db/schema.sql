-- ====================================================================
-- AGRIDATA PLATFORM: 3-TIER DATA WAREHOUSE SCHEMA (PostgreSQL / Neon)
-- Compliant with Gate G1 & Gate G2 data governance standards
-- ====================================================================

-- --------------------------------------------------------------------
-- TẦNG 1: RAW DATA (DỮ LIỆU THÔ BẤT BIẾN - IMMUTABLE)
-- Quy tắc: Không bao giờ được phép UPDATE hoặc DELETE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_market_records (
    id BIGSERIAL,
    source_name VARCHAR(100) NOT NULL,       -- 'cho_binh_dien', 'cho_thu_duc', 'open_meteo'
    raw_payload JSONB NOT NULL,              -- Nội dung thô thu thập được
    content_hash CHAR(64) NOT NULL,          -- Mã băm SHA-256 chống trùng lặp
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, fetched_at)
) PARTITION BY RANGE (fetched_at);

-- Tạo partition mẫu theo năm
CREATE TABLE IF NOT EXISTS raw_market_records_2026 PARTITION OF raw_market_records
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE INDEX IF NOT EXISTS idx_raw_source_hash ON raw_market_records (source_name, content_hash);

-- --------------------------------------------------------------------
-- TẦNG 2: CLEAN DATA (DỮ LIỆU SẠCH ĐÃ CHUẨN HÓA VÀ GẮN CỜ MAD)
-- Quy tắc: Quy đổi về VND/kg, truy ngược được 100% về raw_record_id
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean_market_prices (
    id BIGSERIAL PRIMARY KEY,
    raw_record_id BIGINT,                    -- Khóa ngoại truy ngược về bản thô
    crop_code VARCHAR(50) NOT NULL,          -- 'bok_choy', 'choi_sum', 'cucumber', 'lettuce'
    market_code VARCHAR(50) NOT NULL,        -- 'binh_dien', 'thu_duc', 'hoc_mon'
    price_vnd_per_kg NUMERIC(12, 2) NOT NULL CHECK (price_vnd_per_kg > 0),
    original_price NUMERIC(12, 2) NOT NULL,
    original_unit VARCHAR(20) NOT NULL,
    record_date DATE NOT NULL,
    
    -- Gắn cờ lọc ngoại lệ MAD (Median Absolute Deviation)
    is_outlier BOOLEAN DEFAULT FALSE,
    outlier_score NUMERIC(6, 2),             -- Modified Z-score theo MAD
    review_status VARCHAR(20) DEFAULT 'approved' CHECK (review_status IN ('approved', 'flagged', 'rejected')),
    
    cleaned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_crop_market_date UNIQUE (crop_code, market_code, record_date)
);

CREATE INDEX IF NOT EXISTS idx_clean_crop_date ON clean_market_prices (crop_code, record_date);

-- --------------------------------------------------------------------
-- TẦNG 3: MARTS (DỮ LIỆU TỔNG HỢP THEO TUẦN CHO PHÂN TÍCH & MÔ HÌNH)
-- Quy tắc: Cung cấp trực tiếp cho Edge API, Dashboard và Rule Engine
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marts_weekly_crop_metrics (
    id BIGSERIAL PRIMARY KEY,
    crop_code VARCHAR(50) NOT NULL,
    region_code VARCHAR(50) NOT NULL,        -- 'vung_thi_diem_1'
    year_week VARCHAR(8) NOT NULL,           -- '2026-W43'
    week_start_date DATE NOT NULL,
    
    -- Chỉ số giá tuần
    avg_price_vnd NUMERIC(12, 2) NOT NULL,
    min_price_vnd NUMERIC(12, 2) NOT NULL,
    max_price_vnd NUMERIC(12, 2) NOT NULL,
    median_price_vnd NUMERIC(12, 2) NOT NULL,
    price_volatility_pct NUMERIC(6, 2),      -- Độ biến động (%)
    
    -- Chỉ số cung & thời tiết tổng hợp
    estimated_supply_tons NUMERIC(10, 2),
    cumulative_rainfall_mm NUMERIC(8, 2),
    avg_temperature_celsius NUMERIC(5, 2),
    
    -- Tham số mô hình & Khuyến nghị
    breakeven_cost_vnd NUMERIC(12, 2) NOT NULL, -- Giá hòa vốn ước tính
    expected_lower_bound_80 NUMERIC(12, 2),     -- Dải 80% cận dưới
    expected_upper_bound_80 NUMERIC(12, 2),     -- Dải 80% cận trên
    recommendation_label VARCHAR(20) NOT NULL CHECK (recommendation_label IN ('RECOMMENDED', 'CONSIDER', 'NOT_RECOMMENDED')),
    
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_crop_region_week UNIQUE (crop_code, region_code, year_week)
);

CREATE INDEX IF NOT EXISTS idx_marts_crop_week ON marts_weekly_crop_metrics (crop_code, week_start_date DESC);
