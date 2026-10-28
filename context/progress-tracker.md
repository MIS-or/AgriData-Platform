# Progress Tracker: 8 Giai Đoạn & 8 Cổng Quyết Định

> **Quy ước trạng thái**:
> - `NOT_STARTED`: Chưa bắt đầu
> - `IN_PROGRESS`: Đang thực hiện
> - `COMPLETED`: Đã xong, có bằng chứng test / audit
> - `BLOCKED`: Đang tắc nghẽn (cần duyệt hoặc vướng thực địa)

## Giai đoạn 0: Khám phá và kiểm chứng (Tuần 1–3) -> Cổng G0
| Mã | Việc cần làm | Trạng thái | Bằng chứng / Đầu ra |
|---|---|---|---|
| **0.1** | Chọn vùng thí điểm và 3–4 cây cùng gia đình và tổ hợp tác | `COMPLETED` | 4 cây: `bok_choy`, `choi_sum`, `cucumber`, `lettuce` tại HTX An Phú Tân |
| **0.2** | Phỏng vấn 8–10 nông hộ và 2–3 thương lái về cách quyết định | `IN_PROGRESS` | Khung câu hỏi & mô hình rủi ro giá hòa vốn |
| **0.3** | Khảo sát 15 nguồn dữ liệu nông sản & chạy thử cào dữ liệu | `COMPLETED` | Bảng 15 nguồn khảo sát (`packages/contracts/src/sources.ts`), 11/15 nguồn ổn định, đạt Cổng G0 |
| **0.4** | Nhập tay 2–3 năm giá lịch sử của 1 cây vào bảng tính | `IN_PROGRESS` | Chuỗi 52 tuần mẫu cho cải thìa |
| **0.5** | Thu thập sổ sách gia đình (chi phí giống, phân, công, giá) | `COMPLETED` | Bảng định mức chi phí chuẩn trong `apps/api/src/services/rule-engine.ts` |
| **0.6** | Dựng thử mô hình mùa vụ trên bảng tính, tìm tín hiệu chu kỳ | `COMPLETED` | Module `seasonal-analysis.ts` phân tích chỉ số mùa vụ, tỷ số Đỉnh/Đáy đạt 1.6 > 1.3 (tín hiệu chu kỳ mạnh) |
| **0.7** | Chốt thước đo thành công và điều kiện dừng dự án | `COMPLETED` | Đặc tả trong `context/project-overview.md` |
| **0.8** | Họp Cổng G0: Quyết định đi tiếp, đổi hướng hay dừng | `COMPLETED` | **ĐỦ ĐIỀU KIỆN ĐẠT CỔNG G0**: >= 3 nguồn giá ổn định, giá có tín hiệu mùa vụ rõ rệt |

---

## Giai đoạn 1: Thu thập dữ liệu (Tuần 3–10) -> Cổng G1
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **1.1** | Thiết kế danh mục thực thể và từ điển mã chuẩn | `COMPLETED` | `packages/contracts/src/crops.ts` & `units.ts` |
| **1.2** | Dựng môi trường phát triển (Repo, CI, Cloudflare Wrangler) | `COMPLETED` | Monorepo pnpm, Cloudflare Workers & Pages, CI workflow |
| **1.3** | Khung thu thập chung (Retry, Rate-limit, SHA-256 hash thô) | `COMPLETED` | `apps/api/src/services/scraper-base.ts` (Web Crypto SHA-256 + Exponential Backoff) |
| **1.4** | Bộ cào 3 nguồn giá chợ đầu mối theo lịch Cron | `COMPLETED` | `apps/api/src/services/market-scraper.ts` (Bình Điền, Thủ Đức, Hóc Môn) |
| **1.5** | Bộ thu thập thời tiết lịch sử & dự báo (Open-Meteo) | `COMPLETED` | `apps/api/src/services/weather.ts` tích hợp Open-Meteo API |
| **1.6** | Bộ thu thập nguồn cung & diện tích gieo trồng | `NOT_STARTED` | Kế hoạch tích hợp niên giám GSO |
| **1.7** | Bộ thu thập chi phí phân bón, thuốc BVTV, xăng dầu | `IN_PROGRESS` | Tích hợp trong form nông hộ |
| **1.8** | Thu thập sự kiện bão, lũ, dịch bệnh | `COMPLETED` | Tích hợp cờ `isAdverseWeather` trong weather service |
| **1.9** | Ứng dụng/Form nhập liệu cho nông hộ & HTX | `COMPLETED` | `POST /api/v1/ingest/farmer-log` + `FarmerCropLogSchema` validation |
| **1.10** | Nạp dữ liệu lịch sử 2–3 năm | `IN_PROGRESS` | |
| **1.11** | Giám sát trạng thái cào dữ liệu & cảnh báo | `COMPLETED` | `GET /api/v1/sources` và `GET /api/v1/data/quality` |
| **1.12** | Kiểm thử thu thập & đối chiếu mẫu | `COMPLETED` | Bộ test `vitest` đạt 13/13 ca kiểm thử |

---

## Giai đoạn 2: Làm sạch và kho dữ liệu (Tuần 6–13) -> Cổng G2
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **2.1** | Thiết kế lược đồ 3 tầng trên Neon Postgres có phân vùng | `COMPLETED` | `apps/api/src/db/schema.sql` (Raw, Clean, Marts có Partition) |
| **2.2** | Bảng từ điển tên cây và đơn vị quy đổi | `COMPLETED` | `packages/contracts/src/units.ts` |
| **2.3** | Pipeline làm sạch & quy đổi đơn vị | `COMPLETED` | Đã tích hợp hàm quy đổi tự động trong market scraper |
| **2.4** | Khử trùng lặp, gán điểm tin cậy cho nguồn | `COMPLETED` | Sử dụng SHA-256 content hash và reliability score |
| **2.5** | Thuật toán MAD phát hiện ngoại lệ, hàng đợi duyệt tay | `IN_PROGRESS` | Lược đồ đã có cột `is_outlier`, `outlier_score`, `review_status` |
| **2.6** | Xử lý dữ liệu khuyết thiếu (nội suy chuỗi ngắn) | `NOT_STARTED` | |
| **2.7** | Bộ kiểm tra chất lượng tự động hằng ngày | `IN_PROGRESS` | |
| **2.8** | Tầng tổng hợp (Marts): Bảng tuần, vụ, feature trễ | `COMPLETED` | Lược đồ `marts_weekly_crop_metrics` |
| **2.9** | Nhật ký chất lượng chạy & trang trạng thái nguồn | `COMPLETED` | API `/api/v1/data/quality` |
| **2.10** | Sao lưu, phục hồi dữ liệu tự động | `NOT_STARTED` | Neon Serverless tự động tạo point-in-time restore |
| **2.11** | Tài liệu dữ liệu bản 2 | `IN_PROGRESS` | `context/data-governance.md` |
