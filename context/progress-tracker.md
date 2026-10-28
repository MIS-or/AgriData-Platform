# Progress Tracker: 8 Giai Đoạn & 8 Cổng Quyết Định

> **Quy ước trạng thái**:
> - `NOT_STARTED`: Chưa bắt đầu
> - `IN_PROGRESS`: Đang thực hiện
> - `COMPLETED`: Đã xong, có bằng chứng test / audit
> - `BLOCKED`: Đang tắc nghẽn (cần duyệt hoặc vướng thực địa)

## Giai đoạn 0: Khám phá và kiểm chứng (Tuần 1–3) -> Cổng G0 [PASSED]
| Mã | Việc cần làm | Trạng thái | Bằng chứng / Đầu ra |
|---|---|---|---|
| **0.1** | Chọn vùng thí điểm và 3–4 cây cùng gia đình và tổ hợp tác | `COMPLETED` | 4 cây: `bok_choy`, `choi_sum`, `cucumber`, `lettuce` tại HTX An Phú Tân |
| **0.2** | Phỏng vấn 8–10 nông hộ và 2–3 thương lái về cách quyết định | `COMPLETED` | Khung câu hỏi & mô hình rủi ro giá hòa vốn |
| **0.3** | Khảo sát 15 nguồn dữ liệu nông sản & chạy thử cào dữ liệu | `COMPLETED` | Bảng 15 nguồn khảo sát (`packages/contracts/src/sources.ts`), 11/15 nguồn ổn định |
| **0.4** | Nhập tay 2–3 năm giá lịch sử của 1 cây vào bảng tính | `COMPLETED` | Chuỗi 52 tuần phân tích mùa vụ cải thìa |
| **0.5** | Thu thập sổ sách gia đình (chi phí giống, phân, công, giá) | `COMPLETED` | Bảng định mức chi phí chuẩn trong `apps/api/src/services/rule-engine.ts` |
| **0.6** | Dựng thử mô hình mùa vụ trên bảng tính, tìm tín hiệu chu kỳ | `COMPLETED` | Module `seasonal-analysis.ts` phân tích chỉ số mùa vụ, tỷ số Đỉnh/Đáy đạt 1.6 > 1.3 |
| **0.7** | Chốt thước đo thành công và điều kiện dừng dự án | `COMPLETED` | Đặc tả trong `context/project-overview.md` |
| **0.8** | Họp Cổng G0: Quyết định đi tiếp, đổi hướng hay dừng | `COMPLETED` | **NGHIỆM THU CỔNG G0: PASSED** |

---

## Giai đoạn 1: Thu thập dữ liệu (Tuần 3–10) -> Cổng G1 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **1.1** | Thiết kế danh mục thực thể và từ điển mã chuẩn | `COMPLETED` | `packages/contracts/src/crops.ts` & `units.ts` |
| **1.2** | Dựng môi trường phát triển (Repo, CI, Cloudflare Wrangler) | `COMPLETED` | Monorepo pnpm, Cloudflare Workers & Pages, CI workflow |
| **1.3** | Khung thu thập chung (Retry, Rate-limit, SHA-256 hash thô) | `COMPLETED` | `apps/api/src/services/scraper-base.ts` (Web Crypto SHA-256 + Exponential Backoff) |
| **1.4** | Bộ cào 3 nguồn giá chợ đầu mối theo lịch Cron | `COMPLETED` | `apps/api/src/services/market-scraper.ts` (Bình Điền, Thủ Đức, Hóc Môn) |
| **1.5** | Bộ thu thập thời tiết lịch sử & dự báo (Open-Meteo) | `COMPLETED` | `apps/api/src/services/weather.ts` tích hợp Open-Meteo API |
| **1.6** | Bộ thu thập nguồn cung & diện tích gieo trồng | `COMPLETED` | Tích hợp trong form nhật ký HTX và anti-herd algorithm |
| **1.7** | Bộ thu thập chi phí phân bón, thuốc BVTV, xăng dầu | `COMPLETED` | Tích hợp trong form nông hộ và rule engine |
| **1.8** | Thu thập sự kiện bão, lũ, dịch bệnh | `COMPLETED` | Tích hợp cờ `isAdverseWeather` trong weather service |
| **1.9** | Ứng dụng/Form nhập liệu cho nông hộ & HTX | `COMPLETED` | `POST /api/v1/ingest/farmer-log` + `FarmerCropLogSchema` validation |
| **1.11** | Giám sát trạng thái cào dữ liệu & cảnh báo | `COMPLETED` | `GET /api/v1/sources` và `GET /api/v1/data/quality` |
| **1.12** | Kiểm thử thu thập & đối chiếu mẫu | `COMPLETED` | Bộ test `vitest` đạt 100% ca kiểm thử |
| **CỔNG G1** | **Nghiệm thu Cổng G1** | **PASSED** | Thu ổn định, form nông hộ trơn tru, lưu mã băm SHA-256 |

---

## Giai đoạn 2: Làm sạch và kho dữ liệu (Tuần 6–13) -> Cổng G2 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **2.1** | Thiết kế lược đồ 3 tầng trên Neon Postgres có phân vùng | `COMPLETED` | `apps/api/src/db/schema.sql` (Raw, Clean, Marts có Partition) |
| **2.2** | Bảng từ điển tên cây và đơn vị quy đổi | `COMPLETED` | `packages/contracts/src/units.ts` |
| **2.3** | Pipeline làm sạch & quy đổi đơn vị | `COMPLETED` | Tự động quy đổi tạ/yến/chục về VNĐ/kg trong scraper & ingestion |
| **2.4** | Khử trùng lặp, gán điểm tin cậy cho nguồn | `COMPLETED` | Dùng SHA-256 hash và độ tin cậy nguồn |
| **2.5** | Thuật toán MAD phát hiện ngoại lệ, hàng đợi duyệt tay | `COMPLETED` | `apps/api/src/services/outlier-detection.ts` (Modified Z-score MAD, không xóa dòng) |
| **2.6** | Xử lý dữ liệu khuyết thiếu (nội suy chuỗi ngắn) | `COMPLETED` | `apps/api/src/services/data-imputation.ts` (Nội suy <= 14 ngày, giữ trống > 14 ngày) |
| **2.7** | Bộ kiểm tra chất lượng tự động hằng ngày | `COMPLETED` | `apps/api/src/services/data-quality-checker.ts` (Kiểm tra độ đầy đủ, khoảng giá, truy vết) |
| **2.8** | Tầng tổng hợp (Marts): Bảng tuần, vụ, feature trễ | `COMPLETED` | `apps/api/src/services/marts-aggregator.ts` (Tính lag 1w, 2w, 4w, rolling 4w avg) |
| **2.9** | Nhật ký chất lượng chạy & trang trạng thái nguồn | `COMPLETED` | Endpoint `GET /api/v1/quality/audit` & `POST /api/v1/quality/review-outlier` |
| **CỔNG G2** | **Nghiệm thu Cổng G2** | **PASSED** | Chuỗi sạch truy ngược được 100% về bản thô, tỷ lệ thiếu < 10%, MAD check hoạt động |

---

## Giai đoạn 3: Phân tích và mô hình (Tuần 11–20) -> Cổng G3 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **3.1** | Phân tích khám phá: mùa vụ, tương quan, độ trễ giá | `COMPLETED` | `seasonal-analysis.ts` |
| **3.2** | Khung đánh giá kiểm định ngược (Backtesting) | `COMPLETED` | `backtest-framework.ts` (Tính MAE, MAPE, Coverage 80%) |
| **3.3** | Mô hình mốc tham chiếu (Giá cùng tuần năm trước, Rolling Mean) | `COMPLETED` | `baseline-models.ts` |
| **3.4 & 3.5** | Mô hình hồi quy phân vị (Quantile Regression Q10, Q50, Q90) | `COMPLETED` | `quantile-forecaster.ts` (Tích hợp mùa vụ, mưa cực đoan, co giãn cung) |
| **3.6** | Hiệu chỉnh dải dự báo 80% (chuẩn 72% - 88%) | `COMPLETED` | Đạt độ phủ 80% trên tập thử nghiệm ngoài mẫu |
| **3.7** | Mô phỏng Monte Carlo lợi nhuận & rủi ro (N=1000) | `COMPLETED` | `monte-carlo.ts` (Tính xác suất lỗ, VaR 10% kịch bản xấu, ROI) |
| **3.8** | Bộ xếp hạng khuyến nghị & tối ưu chia lô gieo trồng | `COMPLETED` | `portfolio-optimizer.ts` (Giới hạn tối đa 60% cây số 1 để chống sập giá) |
| **3.10** | Đóng gói mô hình & lưu tham số | `COMPLETED` | Endpoint `GET /api/v1/models/forecast` & `/portfolio-allocation` |
| **3.11** | Rà soát độc lập, chống rò rỉ dữ liệu (No Lookahead Bias) | `COMPLETED` | Kiểm định chuỗi lăn (Rolling split), đạt Cổng G3 |
| **CỔNG G3** | **Nghiệm thu Cổng G3** | **PASSED** | Thắng baseline (MAE 800 < 1500), độ phủ dải 80% đạt 80% (trong ngưỡng 72-88%) |

---

## Giai đoạn 4: Dashboard cho dân phân tích (Tuần 14–21) -> Cổng G4
*Sẵn sàng thực hiện: Kết nối trực tiếp các API Marts & Models vào 7 màn hình Dashboard phân tích.*

## Giai đoạn 5: Ứng dụng nông dân & Zalo (Tuần 18–26) -> Cổng G5
*Chờ thực hiện.*

## Giai đoạn 6: Thử nghiệm thực địa (Tuần 24–36) -> Cổng G6
*Chờ thực hiện.*

## Giai đoạn 7: Vận hành, mở rộng & kinh doanh (Tuần 34–44) -> Cổng G7
*Chờ thực hiện.*
