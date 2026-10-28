# Data Governance, Dictionaries & Quality Assurance

## 1. Tiêu Chuẩn Hóa Danh Mục Cây Trồng Thí Điểm
| Tên Thường Gọi | Mã Chuẩn (`crop_code`) | Tên Tiếng Anh | Chu Kỳ Sinh Trưởng | Mức Độ Nhạy Cảm Mùa Vụ |
|---|---|---|---|---|
| Cải thìa / Cải bẹ trắng | `bok_choy` | Bok Choy | 28 - 35 ngày | Cao (dễ ngập úng mùa mưa) |
| Cải ngọt | `choi_sum` | Choy Sum | 30 - 38 ngày | Trung bình |
| Dưa leo / Dưa chuột | `cucumber` | Cucumber | 40 - 50 ngày | Cao (biến động giá mạnh theo lứa) |
| Xà lách | `lettuce` | Lettuce | 35 - 45 ngày | Rất cao (yêu cầu bảo quản lạnh) |

## 2. Tiêu Chuẩn Quy Đổi Đơn Vị Về VNĐ/kg
Mọi đơn vị đầu vào phải được chuyển đổi theo hệ số chuẩn duy nhất:
- `1 kg` = 1
- `1 yến` = 10 kg
- `1 tạ` = 100 kg
- `1 tấn` = 1,000 kg
- `1 chục` (theo quy ước địa phương miền Tây/miền Nam) = 12 hoặc 14 quả/bó -> Quy đổi dựa trên khối lượng trung bình của từng giống cây lưu trong từ điển.

## 3. Thuật Toán Lọc Ngoại Lệ: Median Absolute Deviation (MAD)
Không sử dụng độ lệch chuẩn ($\sigma$) vì giá nông sản có phân phối đuôi dày và dễ bị méo bởi các cú sốc giá.
$$\text{MAD} = \text{median}(|X_i - \text{median}(X)|)$$
$$\text{Modified Z-Score} = \frac{0.6745 \cdot (X_i - \text{median}(X))}{\text{MAD}}$$
- Ngưỡng cảnh báo: $|M_i| > 3.5$
- **Quy tắc bất di bất dịch**: Dữ liệu nghi ngờ ngoại lệ chỉ được **gắn cờ** (`is_outlier = TRUE, review_status = 'pending'`), tuyệt đối không tự ý xóa khỏi cơ sở dữ liệu.

## 4. Bảo Vệ Dữ Liệu Cá Nhân Nông Hộ (Nghị định 13/2023/NĐ-CP - X3)
- Tuyệt đối không lưu số điện thoại, CCCD, hoặc tọa độ GPS chính xác của thửa ruộng ở dạng bản rõ (plaintext).
- Tọa độ thửa đất được làm mờ (geohash cấp xã/huyện, độ lệch ngẫu nhiên 500m) khi tổng hợp dữ liệu bản đồ cung cầu.
- Số điện thoại đăng ký nhận tin Zalo được băm (hashing SHA-256 kèm secret salt) cho khóa đối soát.
