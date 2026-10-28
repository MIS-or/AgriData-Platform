# Code Standards & Engineering Guidelines

## 1. TypeScript & Edge Runtime Standards
- Toàn bộ backend (`apps/api`), frontend (`apps/web`) và contracts (`packages/contracts`) sử dụng TypeScript ở chế độ nghiêm ngặt (`"strict": true`).
- Tuyệt đối tránh sử dụng kiểu `any`. Dùng `unknown` kèm type narrowing hoặc Zod schemas để thẩm định dữ liệu đầu vào.
- Tránh import các package Node.js có chứa C++ native bindings hoặc `fs/child_process` trong mã nguồn Cloudflare Worker. Sử dụng Web Standards APIs (`fetch`, `Request`, `Response`, `Web Crypto`, `Streams`).

## 2. API Contract & Validation
- Mọi request và response giữa Client và Edge Worker phải được định nghĩa thông qua thư viện Zod (`packages/contracts`).
- Error response phải tuân thủ chuẩn RFC 7807 (Problem Details):
  ```json
  {
    "type": "https://agridata.vn/errors/invalid-crop-unit",
    "title": "Đơn vị không hợp lệ",
    "status": 400,
    "detail": "Đơn vị 'bao' chưa được định nghĩa trong từ điển cho cây cải thìa",
    "instance": "/api/v1/ingest/price-record"
  }
  ```

## 3. Database Access Pattern (Neon Postgres + D1)
- Truy cập Neon Postgres thông qua connection pooler của `@neondatabase/serverless` (HTTP fetch mode khi truy vấn đơn lẻ, WebSocket mode khi chạy transaction có khóa dòng).
- Bắt buộc dùng tham số hóa (Parameterized Queries) để chống SQL Injection.
- Luôn đặt giới hạn kết quả (`LIMIT`) và sử dụng phân trang dạng con trỏ (Cursor-based Pagination) cho các chuỗi dữ liệu thời gian lớn.
