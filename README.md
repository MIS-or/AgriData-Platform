<div align="center">

# 🌱 AgriData Platform
### Nền Tảng Dữ Liệu Nông Sản & Đề Xuất Trồng Trọt Cho Nông Dân

[![Cloudflare Free Tier](https://img.shields.io/badge/Hosting-Cloudflare%20Free%20Tier-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Neon Postgres](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-00E599?logo=postgresql&logoColor=white)](https://neon.tech)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/Farmer%20App-PWA%20Offline%20First-047857?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

*Hệ thống điều hòa cung cầu và đề xuất thời điểm xuống giống thông minh, ngăn chặn hiệu ứng đổ xô làm vỡ giá thị trường rau củ.*

</div>

---

## 🏛️ 1. Kiến Trúc Hạ Tầng 100% Gói Miễn Phí (Cloudflare Free Tier)

| Thành phần | Công nghệ | Gói sử dụng | Giới hạn miễn phí |
|---|---|---|---|
| **Giao diện Nông dân (PWA) & Dashboard** | React 19 + Vite | **Cloudflare Pages** | **Không giới hạn băng thông**, 500 lần build/tháng |
| **Edge API & Bộ máy Đề xuất** | Hono (TypeScript) | **Cloudflare Workers** | **100.000 requests/ngày**, CPU 10ms/req, RAM 128MB |
| **Kho Dữ Liệu 3 Tầng** | PostgreSQL | **Neon Serverless** | **0.5 GiB dung lượng**, tính năng partition và connection pooling |
| **Bộ Nhớ Đệm Tức Thì Tại Edge** | D1 (SQLite Edge) | **Cloudflare D1 / KV** | **5 triệu lượt đọc/ngày**, 5GB lưu trữ D1 |
| **Tiến Trình Cào Dữ Liệu Tự Động** | TypeScript Worker | **Cron Triggers** | Chạy tự động 04:00 AM mỗi ngày cào giá chợ đầu mối |

---

## 🗺️ 2. Lộ Trình 8 Giai Đoạn & 8 Cổng Kiểm Soát (Gate System)

```
[Tuần 1-3]   Giai đoạn 0: Khảo sát & kiểm chứng          ──> CỔNG G0: >=3 nguồn ổn định, có tín hiệu mùa vụ
[Tuần 3-10]  Giai đoạn 1: Thu thập tự động               ──> CỔNG G1: 4 tuần chạy cào >=95% thành công
[Tuần 6-13]  Giai đoạn 2: Làm sạch & Kho Postgres 3 tầng ──> CỔNG G2: Chuỗi sạch >=2 năm, lọc ngoại lệ MAD
[Tuần 11-20] Giai đoạn 3: Phân tích & Mô hình dự báo     ──> CỔNG G3: Thắng mốc so sánh ở >=2/3 cây
[Tuần 14-21] Giai đoạn 4: Dashboard cho dân phân tích    ──> CỔNG G4: Thao tác trơn tru không cần hướng dẫn
[Tuần 18-26] Giai đoạn 5: Ứng dụng PWA & Zalo Nông dân   ──> CỔNG G5: >=8/10 hộ hiểu đúng đề xuất & rủi ro
[Tuần 24-36] Giai đoạn 6: Thử nghiệm thực địa            ──> CỔNG G6: Khuyến nghị đúng hướng >=70%
[Tuần 34-44] Giai đoạn 7: Vận hành & Mở rộng             ──> CỔNG G7: Có khách trả tiền hoặc bảo trợ duy trì
```

---

## 🤖 3. Quy Ước Vận Hành Của AI Agent & Subagents

Dự án áp dụng nguyên bản triết lý vận hành từ **`Website-Traveling`**:
1. **Hợp đồng vận hành cốt lõi**: Xem [`AGENTS.md`](./AGENTS.md).
2. **Quy tắc định tuyến Jev**: Chọn tập kỹ năng tối thiểu, không gọi tràn lan.
3. **Tháp kiểm thử 7 tầng (`7-Layer Test Architecture`)**: Kiểm thử logic ở tầng rẻ nhất (Layer 1: Unit, Layer 2: Schema, Layer 3: Business/Rule Engine, Layer 4: E2E).
4. **Giao thức 4 phán quyết**: Báo cáo `REAL BUG`, `WRONG EXPECTATION`, `OVER-COUPLED`, hoặc `MISSING BRANCH` mỗi khi test đỏ.
5. **Chuẩn Git Branching**: Luôn tạo nhánh từ `main` mới nhất:
   ```bash
   git checkout main && git pull origin main && git checkout -b feat/ten-tinh-nang
   ```

---

## 🚀 4. Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Cài đặt dependencies (yêu cầu pnpm và Node >= 20):
```bash
pnpm install
```

### Chạy kiểm thử tự động:
```bash
pnpm test
```

### Khởi động Frontend Web & PWA Nông dân:
```bash
pnpm dev:web
```

### Khởi động Edge API (Cloudflare Worker cục bộ):
```bash
pnpm dev:api
```

### Triển khai lên Cloudflare:
```bash
pnpm deploy:pages    # Đẩy Frontend lên Cloudflare Pages
pnpm deploy:worker   # Đẩy Edge API lên Cloudflare Workers
```
