# Progress Tracker: 8 Giai Đoạn & 8 Cổng Quyết Định

> **Quy ước trạng thái**:
> - `NOT_STARTED`: Chưa bắt đầu
> - `IN_PROGRESS`: Đang thực hiện
> - `COMPLETED`: Đã xong, có bằng chứng test / audit
> - `BLOCKED`: Đang tắc nghẽn (cần duyệt hoặc vướng thực địa)

## Giai đoạn 0: Khám phá và kiểm chứng (Tuần 1–3) -> Cổng G0
| Mã | Việc cần làm | Trạng thái | Bằng chứng / Đầu ra |
|---|---|---|---|
| **0.1** | Chọn vùng thí điểm và 3–4 cây cùng gia đình và tổ hợp tác | `IN_PROGRESS` | Danh sách 4 cây: Cải thìa, Cải ngọt, Dưa leo, Xà lách |
| **0.2** | Phỏng vấn 8–10 nông hộ và 2–3 thương lái về cách quyết định | `NOT_STARTED` | Bản ghi phỏng vấn & tóm tắt kiểu quyết định |
| **0.3** | Khảo sát 15 nguồn dữ liệu nông sản & chạy thử cào dữ liệu | `IN_PROGRESS` | Bảng 15 nguồn khảo sát |
| **0.4** | Nhập tay 2–3 năm giá lịch sử của 1 cây vào bảng tính | `NOT_STARTED` | File dữ liệu giá tuần sạch đầu tiên |
| **0.5** | Thu thập sổ sách gia đình (chi phí giống, phân, công, giá) | `NOT_STARTED` | Bộ dữ liệu chi phí gia đình |
| **0.6** | Dựng thử mô hình mùa vụ trên bảng tính, tìm tín hiệu chu kỳ | `NOT_STARTED` | Báo cáo phân tích tín hiệu mùa vụ (2 trang) |
| **0.7** | Chốt thước đo thành công và điều kiện dừng dự án | `COMPLETED` | Đã đặc tả trong context/project-overview.md |
| **0.8** | Họp Cổng G0: Quyết định đi tiếp, đổi hướng hay dừng | `NOT_STARTED` | Biên bản quyết định Cổng G0 |

---

## Giai đoạn 1: Thu thập dữ liệu (Tuần 3–10) -> Cổng G1
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **1.1** | Thiết kế danh mục thực thể và từ điển mã chuẩn | `IN_PROGRESS` | `packages/contracts/src/crops.ts` |
| **1.2** | Dựng môi trường phát triển (Repo, CI, Cloudflare Wrangler) | `IN_PROGRESS` | Thiết lập monorepo Cloudflare Free Tier |
| **1.3** | Khung thu thập chung (Retry, Rate-limit, SHA-256 hash thô) | `NOT_STARTED` | `apps/api/src/services/scraper.ts` |
| **1.4** | Bộ cào 3 nguồn giá chợ đầu mối theo lịch Cron | `NOT_STARTED` | Cloudflare Cron Triggers (`0 4 * * *`) |
| **1.5** | Bộ thu thập thời tiết lịch sử & dự báo (Open-Meteo) | `NOT_STARTED` | API Open-Meteo miễn phí |
| **1.6** | Bộ thu thập nguồn cung & diện tích gieo trồng | `NOT_STARTED` | |
| **1.7** | Bộ thu thập chi phí phân bón, thuốc BVTV, xăng dầu | `NOT_STARTED` | |
| **1.8** | Thu thập sự kiện bão, lũ, dịch bệnh | `NOT_STARTED` | |
| **1.9** | Ứng dụng/Form nhập liệu cho nông hộ & HTX | `NOT_STARTED` | Web di động trên Cloudflare Pages |
| **1.10** | Nạp dữ liệu lịch sử 2–3 năm | `NOT_STARTED` | |
| **1.11** | Giám sát trạng thái cào dữ liệu & cảnh báo | `NOT_STARTED` | |
| **1.12** | Kiểm thử thu thập & đối chiếu mẫu | `NOT_STARTED` | |

---

## Giai đoạn 2: Làm sạch và kho dữ liệu (Tuần 6–13) -> Cổng G2
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **2.1** | Thiết kế lược đồ 3 tầng trên Neon Postgres có phân vùng | `IN_PROGRESS` | `apps/api/src/db/schema.sql` |
| **2.2** | Bảng từ điển tên cây và đơn vị quy đổi | `IN_PROGRESS` | Chuẩn hóa VNĐ/kg |
| **2.3** | Pipeline làm sạch & quy đổi đơn vị | `NOT_STARTED` | |
| **2.4** | Khử trùng lặp, gán điểm tin cậy cho nguồn | `NOT_STARTED` | |
| **2.5** | Thuật toán MAD phát hiện ngoại lệ, hàng đợi duyệt tay | `NOT_STARTED` | |
| **2.6** | Xử lý dữ liệu khuyết thiếu (nội suy chuỗi ngắn) | `NOT_STARTED` | |
| **2.7** | Bộ kiểm tra chất lượng tự động hằng ngày | `NOT_STARTED` | |
| **2.8** | Tầng tổng hợp (Marts): Bảng tuần, vụ, feature trễ | `NOT_STARTED` | |
| **2.9** | Nhật ký chất lượng chạy & trang trạng thái nguồn | `NOT_STARTED` | |
| **2.10** | Sao lưu, phục hồi dữ liệu tự động | `NOT_STARTED` | |
| **2.11** | Tài liệu dữ liệu bản 2 | `NOT_STARTED` | |

---

## Giai đoạn 3: Phân tích và mô hình (Tuần 11–20) -> Cổng G3
*Trạng thái: NOT_STARTED (Chờ hoàn thành Cổng G2)*

## Giai đoạn 4: Dashboard cho dân phân tích (Tuần 14–21) -> Cổng G4
*Trạng thái: NOT_STARTED*

## Giai đoạn 5: Ứng dụng nông dân & Zalo (Tuần 18–26) -> Cổng G5
*Trạng thái: NOT_STARTED*

## Giai đoạn 6: Thử nghiệm thực địa (Tuần 24–36) -> Cổng G6
*Trạng thái: NOT_STARTED*

## Giai đoạn 7: Vận hành, mở rộng & kinh doanh (Tuần 34–44) -> Cổng G7
*Trạng thái: NOT_STARTED*
