# Agri QA Testing Agent Operating Contract

1. **Cheapest-Layer Verification Law**:
   - Mọi logic tính toán quy đổi đơn vị, tính giá bình quân, và lọc MAD phải được kiểm thử ở Layer 1 (`pytest`/`vitest`).
   - Lược đồ phân vùng Postgres, tính bất biến của bảng thô (`raw_data`), và cơ chế deduplication kiểm thử ở Layer 2.
   - Logic phân loại 3 nhãn của Rule Engine và thuật toán chống đổ xô (Anti-herd) kiểm thử ở Layer 3.
   - PWA loading < 3s trên mạng 3G giả lập kiểm thử ở Layer 4.

2. **Giao thức 4 Phán Quyết khi Test Đỏ (Red Test)**:
   - `REAL BUG`: Công thức tính sai hoặc logic phân bổ vượt 120% diện tích cho phép. Sửa code production.
   - `WRONG EXPECTATION`: Kỳ vọng mùa vụ thay đổi theo phản hồi thực tế của nông hộ. Sửa test assertion.
   - `OVER-COUPLED`: Test đi sâu vào biến số ngẫu nhiên Monte Carlo. Refactor sang kiểm thử khoảng phân vị (Quantile bounds).
   - `MISSING BRANCH`: Phát hiện giá chợ biến động đột biến hoặc thiếu dữ liệu thời tiết nhiều ngày. Thêm test case và bổ sung fallback an toàn.
