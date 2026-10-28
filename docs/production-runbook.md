# Sổ Tay Vận Hành Sản Xuất (Production Operations Runbook)
**Dự án**: Nền tảng dữ liệu nông nghiệp và đề xuất trồng trọt (AgriData Platform)  
**Phiên bản**: 1.0.0 (Sản xuất)  
**Tuân thủ**: Cloudflare Free Tier ($0/tháng), Neon Free Tier, Nghị định 13/2023/NĐ-CP  

---

## 1. Kiến Trúc Hạ Tầng 0 Đồng (Zero-Cost Infrastructure)
Nền tảng được thiết kế chạy 100% trên các gói miễn phí không giới hạn thời gian:

| Thành phần | Công nghệ | Gói sử dụng | Giới hạn miễn phí | Chi phí hàng tháng |
|---|---|---|---|---|
| **Frontend PWA & Dashboard** | Cloudflare Pages (React 19 + Vite) | Free | Băng thông không giới hạn, SSL tự động | **0 VNĐ** |
| **Edge API & Cron Worker** | Cloudflare Workers (Hono TypeScript) | Free | 100.000 requests/ngày, CPU < 10ms | **0 VNĐ** |
| **Kho Dữ Liệu 3 Tầng** | Neon Serverless PostgreSQL | Free | 0.5 GB lưu trữ, auto-suspend | **0 VNĐ** |
| **Bộ Nhớ Đệm Biên** | Cloudflare D1 & KV | Free | 100.000 reads/ngày | **0 VNĐ** |
| **Dữ Liệu Thời Tiết** | Open-Meteo API | Non-commercial | 10.000 calls/ngày | **0 VNĐ** |
| **Tổng Chi Phí Hạ Tầng** | | | | **0 VNĐ / tháng** |

---

## 2. Quy Trình Vận Hành & Khắc Phục Sự Cố (Incident Response)

### 2.1. Nguồn cào dữ liệu chợ đầu mối bị lỗi hoặc đổi cấu trúc (Mã 1.11, 7.1)
- **Dấu hiệu**: Hệ thống kiểm tra chất lượng dữ liệu báo `completenessRate < 90%` hoặc crawler trả về `HTTP 403 / 500`.
- **Hành động**:
  1. Kiểm tra mã băm SHA-256 bản ghi cào gần nhất tại `GET /api/v1/quality/audit`.
  2. Bật cờ dự phòng: Kích hoạt form nhập liệu tay có tổ chức từ thương lái và Ban quản lý chợ qua endpoint `POST /api/v1/ingest/farmer-log`.
  3. Cập nhật CSS/HTML selector trong `apps/api/src/services/market-scraper.ts` và deploy lại qua `wrangler deploy`.

### 2.2. Phát hiện trôi dữ liệu và Huấn luyện lại mô hình (Mã 7.2)
- **Tần suất**: Đánh giá tự động mỗi 2 tuần hoặc sau mỗi vụ thu hoạch (30-45 ngày).
- **Chỉ số theo dõi**: Population Stability Index (PSI):
  - $\text{PSI} < 0.1$: Ổn định, không cần can thiệp.
  - $0.1 \le \text{PSI} \le 0.25$: Độ trôi vừa phải, theo dõi sát sao.
  - $\text{PSI} > 0.25$: Trôi dữ liệu nghiêm trọng, kích hoạt quy trình tái hiệu chuẩn quantile regression và phân tích mùa vụ 52 tuần.

---

## 3. Chính Sách Hỗ Trợ & Khiếu Nại Nông Hộ (Mã 7.7)
- **Kênh tiếp nhận**: Zalo Official Account hợp tác xã và số điện thoại cán bộ kỹ thuật nông nghiệp địa phương.
- **Cam kết chất lượng (SLA)**:
  - Phản hồi giải đáp thắc mắc khuyến nghị trong vòng 4 giờ làm việc.
  - Sửa lỗi số liệu sổ sách nông hộ báo sai trong vòng 24 giờ.
  - Thu hồi / đính chính bản tin Zalo nếu phát hiện thiên tai cực đoan bất ngờ trong vòng 30 phút.

---

## 4. Bảo Mật & Tuân Thủ Nghị Định 13/2023/NĐ-CP (Mã X2, X3)
- Mọi dữ liệu nhật ký sản xuất, diện tích và chi phí của bà con nông dân đều được ẩn danh hóa (pseudonymized) trước khi đưa vào kho dữ liệu Marts tổng hợp.
- Tuyệt đối không bán hoặc chuyển giao dữ liệu cá nhân cho bên thứ ba vì mục đích thương mại.
