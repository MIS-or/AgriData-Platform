# Project Overview: Nền Tảng Dữ Liệu & Đề Xuất Trồng Trọt

## 1. Mục tiêu cốt lõi
Xây dựng hai sản phẩm trên cùng một lõi dữ liệu nông sản (Data Warehouse 3 tầng):
1. **Dashboard cho dân phân tích**: Hỗ trợ cán bộ khuyến nông, hợp tác xã (HTX), chuyên gia và thương lái theo dõi chuỗi giá, cung cầu, thời tiết, chi phí hòa vốn và rủi ro.
2. **Ứng dụng đề xuất trồng trọt cho nông dân**: Ứng dụng web di động siêu nhẹ (PWA) và bản tin định kỳ qua Zalo OA, giúp nông hộ trả lời câu hỏi *"Nên trồng cây gì, vào thời điểm nào, quy mô bao nhiêu để hạn chế tối đa nguy cơ thua lỗ?"*.

## 2. Phạm vi & Kế hoạch 8 Giai đoạn (44 tuần)
| Giai đoạn | Tuần | Trọng tâm kỹ thuật | Cổng kiểm soát cuối giai đoạn |
|---|---|---|---|
| **0. Khám phá & kiểm chứng** | 1–3 | Khảo sát 1 vùng, 3-4 loại rau; lấy thử 15 nguồn; số hóa sổ sách gia đình | **G0**: Bài toán đáng làm, có >=3 nguồn giá ổn định |
| **1. Thu thập dữ liệu** | 3–10 | Scraper tự động chợ đầu mối, thời tiết, diện tích gieo; form nhập liệu hộ/HTX | **G1**: Thu ổn định 4 tuần liên tục, >=95% lịch chạy thành công |
| **2. Làm sạch & kho dữ liệu** | 6–13 | Kho Postgres 3 tầng (Raw/Clean/Marts); từ điển rau củ, chuẩn hóa VNĐ/kg, lọc MAD | **G2**: Chuỗi giá sạch >=2 năm, truy ngược được 100% về bản thô |
| **3. Phân tích & mô hình** | 11–20 | Baseline SARIMA -> Cung-giá -> GBDT -> Monte Carlo lợi nhuận -> Chia lô | **G3**: Mô hình thắng mốc so sánh ở >=2/3 cây; dải 80% đạt 72-88% |
| **4. Dashboard phân tích** | 14–21 | FastAPI/Hono Edge API + 7 màn hình phân tích trực quan hóa số liệu | **G4**: Người dùng phân tích thao tác không cần chỉ dẫn, tải <3s |
| **5. Ứng dụng nông dân & Zalo** | 18–26 | PWA nông dân, Rule Engine 3 nhãn, bản tin Zalo OA, bộ phân bổ chống đổ xô | **G5**: >=8/10 hộ hiểu đúng đề xuất; bản tin Zalo gửi thông suốt |
| **6. Thử nghiệm thực địa** | 24–36 | Thử nghiệm 15-30 hộ, 1-2 HTX qua 2 chu kỳ rau ngắn ngày | **G6**: Khuyến nghị đúng hướng >=70%, tỷ lệ lỗ <= nhóm đối chứng |
| **7. Vận hành & mở rộng** | 34–44 | Sản xuất hóa, retraining định kỳ, gói B2B cho HTX và doanh nghiệp thu mua | **G7**: Có khách hàng trả tiền hoặc tài trợ duy trì |
| **Xuyên suốt (X1 - X6)** | 1–44 | X1 QLDA; X2 Bảo mật; X3 Pháp lý & PII; X4 Kiểm thử; X5 Tài liệu; X6 Chi phí | Duy trì xuyên suốt dự án |

## 3. Ràng buộc hạ tầng Cloudflare Free Tier
- **Frontend**: Cloudflare Pages (Free).
- **Edge API**: Cloudflare Workers (Free 100k requests/ngày, 10ms CPU time).
- **Kho dữ liệu**: Neon Serverless PostgreSQL (0.5GB Free) kết hợp Cloudflare D1/KV cho Edge Cache.
- **Tiến trình tự động**: Cloudflare Cron Triggers cho cào dữ liệu nhẹ + GitHub Actions cho huấn luyện/mô phỏng nặng.
