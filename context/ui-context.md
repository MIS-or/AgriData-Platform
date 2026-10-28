# UI Context & Design Specifications

## 1. Phân Tách Hai Trải Nghiệm Người Dùng (Dual Frontend Interfaces)
Dự án có 2 nhóm đối tượng người dùng hoàn toàn khác biệt, được phục vụ trên cùng một domain Cloudflare Pages:

### A. Ứng Dụng Cho Nông Dân (`/farmer`)
- **Thiết bị mục tiêu**: Điện thoại thông minh giá rẻ (Android cũ, RAM 2GB-3GB, màn hình 720p).
- **Môi trường sử dụng**: Ngoài đồng ruộng, trời nắng gắt, mạng 3G/4G chập chờn hoặc mất sóng.
- **Nguyên tắc thiết kế UX/UI**:
  - **PWA siêu nhẹ (< 150KB gzip)**: Khởi động tức thì, có thể cài đặt ra màn hình chính (Add to Home Screen).
  - **Độ tương phản cao (High Contrast)**: Sử dụng nền sáng trắng/xanh đậm, cỡ chữ tối thiểu 16px, nút bấm to bản (tối thiểu 48x48px).
  - **3 Nhãn Đề Xuất Trực Quan**:
    * 🟢 **"Nên Trồng"**: Đang có lợi thế mùa vụ, rủi ro thấp, biên lợi nhuận kỳ vọng > 25%.
    * 🟡 **"Cân Nhắc"**: Thị trường có biến động hoặc nguồn cung vùng đang tiệm cận mức bão hòa.
    * 🔴 **"Chưa Nên"**: Nguy cơ dư cung, giá dự báo thấp hơn giá hòa vốn.
  - **Thông tin tối giản**: Chỉ hiển thị: Tên cây, Nhãn đề xuất, Giá hòa vốn ước tính, và 1 câu lý do bằng tiếng bình dân (tuyệt đối không hiển thị thuật toán hay biểu đồ ma trận phức tạp).

### B. Dashboard Dành Cho Dân Phân Tích & HTX (`/dashboard`)
- **Thiết bị mục tiêu**: Máy tính để bàn, laptop, máy tính bảng của chuyên gia phân tích và quản lý HTX.
- **7 Màn Hình Chuyên Biệt**:
  1. *Tổng quan*: Thẻ chỉ số giá các chợ, dải biến động, cảnh báo nóng.
  2. *Giá & Mùa vụ*: Biểu đồ nhiệt (Heatmap), Boxplot phân phối giá, phân rã chuỗi thời gian.
  3. *Cung & Cầu*: Diện tích gieo hạt, ước tính sản lượng 12 tuần tới, biểu đồ mạng nhện.
  4. *Thời tiết*: Ma trận tương quan lượng mưa, nhiệt độ với năng suất.
  5. *Chi phí & Hòa vốn*: Biểu đồ thác nước (Waterfall), phân tích độ nhạy theo giá phân bón.
  6. *Dự báo & Rủi ro*: Biểu đồ quạt (Fan chart) dải tin cậy 80%, mô phỏng Monte Carlo.
  7. *Chất lượng dữ liệu*: Tỷ lệ dữ liệu thiếu, trạng thái cào các nguồn, hàng đợi duyệt ngoại lệ MAD.
