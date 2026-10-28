import { z } from 'zod';

export const SourceTypeSchema = z.enum([
  'wholesale_market',      // Chợ đầu mối
  'government_agency',     // Cơ quan quản lý (Sở NN&PTNT, Sở Công Thương)
  'weather_api',           // Thời tiết
  'statistical_yearbook',  // Niên giám thống kê (GSO, Cục Trồng trọt)
  'cooperative_log',       // Sổ sách ghi chép Hợp tác xã
  'trader_report',         // Thương lái thu mua
]);

export type SourceType = z.infer<typeof SourceTypeSchema>;

export interface DataSourceCatalogItem {
  id: string;
  name: string;
  type: SourceType;
  endpointOrUrl: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  accessMethod: 'api' | 'web_scraping' | 'pdf_ocr' | 'manual_input';
  reliabilityScore: number; // 0.0 - 1.0
  isStable: boolean;
  legalTermsSummary: string; // Tóm tắt điều khoản sử dụng
  sampleDataRetrieved: boolean;
}

// 15 nguồn dữ liệu khảo sát ở Giai đoạn 0 (Mã việc 0.3)
export const CANDIDATE_15_DATA_SOURCES: DataSourceCatalogItem[] = [
  {
    id: 'cho_binh_dien',
    name: 'Bản tin giá Chợ Đầu Mối Bình Điền',
    type: 'wholesale_market',
    endpointOrUrl: 'http://binhdienmarket.com.vn',
    updateFrequency: 'daily',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.95,
    isStable: true,
    legalTermsSummary: 'Dữ liệu công khai phục vụ điều hành thị trường hàng ngày',
    sampleDataRetrieved: true,
  },
  {
    id: 'cho_thu_duc',
    name: 'Bản tin Chợ Đầu Mối Nông Sản Thủ Đức',
    type: 'wholesale_market',
    endpointOrUrl: 'http://chothuduc.vn',
    updateFrequency: 'daily',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.92,
    isStable: true,
    legalTermsSummary: 'Dữ liệu niêm yết thương mại tự do',
    sampleDataRetrieved: true,
  },
  {
    id: 'cho_hoc_mon',
    name: 'Bản tin Chợ Đầu Mối Hóc Môn',
    type: 'wholesale_market',
    endpointOrUrl: 'http://chohocmon.com.vn',
    updateFrequency: 'daily',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.90,
    isStable: true,
    legalTermsSummary: 'Bản tin niêm yết hàng ngày',
    sampleDataRetrieved: true,
  },
  {
    id: 'open_meteo',
    name: 'Open-Meteo Weather API',
    type: 'weather_api',
    endpointOrUrl: 'https://api.open-meteo.com/v1/forecast',
    updateFrequency: 'daily',
    accessMethod: 'api',
    reliabilityScore: 0.99,
    isStable: true,
    legalTermsSummary: 'Open Data phi thương mại, không cần API Key',
    sampleDataRetrieved: true,
  },
  {
    id: 'so_cong_thuong_hcm',
    name: 'Sở Công Thương TP.HCM (Chương trình Bình ổn thị trường)',
    type: 'government_agency',
    endpointOrUrl: 'https://congthuong.hochiminhcity.gov.vn',
    updateFrequency: 'weekly',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.88,
    isStable: true,
    legalTermsSummary: 'Thông tin công khai của cơ quan nhà nước',
    sampleDataRetrieved: true,
  },
  {
    id: 'so_nnptnt_tien_giang',
    name: 'Sở NN&PTNT Tiền Giang (Bản tin nông vụ)',
    type: 'government_agency',
    endpointOrUrl: 'https://snnptnt.tiengiang.gov.vn',
    updateFrequency: 'weekly',
    accessMethod: 'pdf_ocr',
    reliabilityScore: 0.80,
    isStable: false,
    legalTermsSummary: 'Công báo dạng PDF hàng tuần',
    sampleDataRetrieved: true,
  },
  {
    id: 'so_nnptnt_can_tho',
    name: 'Sở NN&PTNT TP. Cần Thơ (Giá nông sản)',
    type: 'government_agency',
    endpointOrUrl: 'https://snnptnt.cantho.gov.vn',
    updateFrequency: 'weekly',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.82,
    isStable: true,
    legalTermsSummary: 'Cổng thông tin điện tử Cần Thơ',
    sampleDataRetrieved: true,
  },
  {
    id: 'gso_agriculture',
    name: 'Niên giám Thống kê Nông nghiệp (Tổng cục Thống kê)',
    type: 'statistical_yearbook',
    endpointOrUrl: 'https://www.gso.gov.vn',
    updateFrequency: 'monthly',
    accessMethod: 'manual_input',
    reliabilityScore: 0.95,
    isStable: true,
    legalTermsSummary: 'Số liệu thống kê quốc gia',
    sampleDataRetrieved: true,
  },
  {
    id: 'cuc_trong_trot',
    name: 'Cục Trồng trọt - Bộ NN&PTNT (Diện tích & Cơ cấu giống)',
    type: 'statistical_yearbook',
    endpointOrUrl: 'http://cuben.cuctrongtrot.gov.vn',
    updateFrequency: 'seasonal',
    accessMethod: 'manual_input',
    reliabilityScore: 0.88,
    isStable: true,
    legalTermsSummary: 'Báo cáo chuyên ngành nông vụ',
    sampleDataRetrieved: false,
  },
  {
    id: 'htx_an_phu_tan_log',
    name: 'Sổ sách nhật ký Hợp tác xã An Phú Tân (Thí điểm)',
    type: 'cooperative_log',
    endpointOrUrl: 'local://coop_logs/an_phu_tan.csv',
    updateFrequency: 'weekly',
    accessMethod: 'manual_input',
    reliabilityScore: 0.96,
    isStable: true,
    legalTermsSummary: 'Đã ký thỏa thuận chia sẻ dữ liệu nghiên cứu (X3)',
    sampleDataRetrieved: true,
  },
  {
    id: 'gia_dinh_notebook',
    name: 'Sổ tay chi phí & năng suất gia đình (6-10 vụ)',
    type: 'cooperative_log',
    endpointOrUrl: 'local://family_logs/sotay.csv',
    updateFrequency: 'seasonal',
    accessMethod: 'manual_input',
    reliabilityScore: 0.98,
    isStable: true,
    legalTermsSummary: 'Dữ liệu nội bộ gia đình (Mã việc 0.5)',
    sampleDataRetrieved: true,
  },
  {
    id: 'thuong_lai_can_tho',
    name: 'Báo giá thu mua vựa thương lái Cần Thơ',
    type: 'trader_report',
    endpointOrUrl: 'direct://phone_interview/trader_01',
    updateFrequency: 'daily',
    accessMethod: 'manual_input',
    reliabilityScore: 0.85,
    isStable: true,
    legalTermsSummary: 'Phỏng vấn trực tiếp hàng tuần',
    sampleDataRetrieved: true,
  },
  {
    id: 'thuong_lai_tien_giang',
    name: 'Báo giá vựa thu mua Cái Bè - Tiền Giang',
    type: 'trader_report',
    endpointOrUrl: 'direct://phone_interview/trader_02',
    updateFrequency: 'daily',
    accessMethod: 'manual_input',
    reliabilityScore: 0.84,
    isStable: true,
    legalTermsSummary: 'Phỏng vấn trực tiếp hàng tuần',
    sampleDataRetrieved: true,
  },
  {
    id: 'gia_vat_tu_phan_bon',
    name: 'Bảng giá phân bón & thuốc BVTV đại lý khu vực',
    type: 'trader_report',
    endpointOrUrl: 'direct://dealer_survey/vattu_01',
    updateFrequency: 'monthly',
    accessMethod: 'manual_input',
    reliabilityScore: 0.90,
    isStable: true,
    legalTermsSummary: 'Khảo sát giá niêm yết bán lẻ',
    sampleDataRetrieved: true,
  },
  {
    id: 'canh_bao_thien_tai',
    name: 'Trung tâm Dự báo Khí tượng Thủy văn Quốc gia',
    type: 'weather_api',
    endpointOrUrl: 'https://nchmf.gov.vn',
    updateFrequency: 'daily',
    accessMethod: 'web_scraping',
    reliabilityScore: 0.94,
    isStable: true,
    legalTermsSummary: 'Cảnh báo bão, triều cường và ngập lụt',
    sampleDataRetrieved: true,
  },
];
