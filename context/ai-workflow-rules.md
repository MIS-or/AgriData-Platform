# AI Workflow Rules & Git Conventions

## 1. Git Branching Model & Quy Chuẩn Nhánh
- **Nhánh chính**: `main` (Luôn luôn sẵn sàng triển khai sản xuất, được bảo vệ).
- **Quy tắc tạo nhánh bắt buộc**:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b <type>/<scope>-<short-description>
  ```
  *Tuyệt đối không được rẽ nhánh từ một feature branch khác chưa merge.*

### Tiền tố loại nhánh (`<type>`):
- `feat/`: Tính năng mới (ví dụ: `feat/scraper-binhdien`, `feat/rule-engine-3-labels`).
- `data/`: Dữ liệu & Migrations (ví dụ: `data/init-3tier-postgres`, `data/crop-dictionary`).
- `model/`: Mô hình hóa & Backtest (ví dụ: `model/sarima-baseline`, `model/monte-carlo-profit`).
- `fix/`: Sửa lỗi (ví dụ: `fix/unit-conversion-quintal`, `fix/outlier-mad-division-by-zero`).
- `test/`: Bổ sung kiểm thử (ví dụ: `test/anti-herd-allocation`).
- `docs/`: Cập nhật tài liệu & báo cáo Cổng (ví dụ: `docs/gate-g0-audit-report`).

## 2. Chuẩn Cam Kết Conventional Commits
Mỗi commit phải mang tính nguyên tử (atomic) và tuân thủ định dạng:
```
<type>(<scope>): <mô tả ngắn bằng tiếng Việt hoặc tiếng Anh>
```
Ví dụ hợp lệ:
- `feat(api): add market price query endpoint with edge caching`
- `data(schema): create 3-tier tables in postgres with partition key`
- `fix(scraper): handle dynamic table structure change in wholesale market`
- `test(rule-engine): verify fallback to cost-of-production when model fails G3`

## 3. Định Nghĩa Hoàn Thành (Definition of Done - DoD)
Một nhiệm vụ kỹ thuật chỉ được đánh dấu là HOÀN THÀNH khi:
1. Mã nguồn tuân thủ TypeScript strict mode, không có lỗi linter.
2. Đã vượt qua các tầng kiểm thử tương ứng (Unit, Integration, hoặc Rule Contract).
3. Đã xác nhận không vượt giới hạn Cloudflare Free Tier (Memory < 128MB, CPU < 10ms).
4. Không có dữ liệu cá nhân (PII) bị commit vào git history.
5. Đã cập nhật tiến độ tương ứng trong file `context/progress-tracker.md`.
