# Kế hoạch dự án: nền tảng dữ liệu và đề xuất trồng trọt

Oct 11, 2026 · @HuyNguyen

Dự án đi qua 8 giai đoạn trong khoảng 44 tuần, cần khoảng 390 ngày công cộng 20% dự phòng, và mỗi giai đoạn kết thúc bằng một cổng quyết định có tiêu chí đo được.

Việc nào do AI agent làm, làm thế nào và kiểm thử ra sao: xem tab Đặc tả cho AI agent.

## Phạm vi, giả định và thước đo thành công

Dự án làm hai sản phẩm trên cùng một lõi dữ liệu: dashboard cho dân phân tích và ứng dụng đề xuất cho nông dân, bắt đầu từ 1 vùng và 3 đến 4 loại rau.

**Giả định cần xác nhận**

- Các AI agent chuyên biệt thực hiện việc kỹ thuật theo tab "Đặc tả cho AI agent"; con người gồm 1 chủ dự án duyệt cổng, 1 người thực địa ở vùng thí điểm, và chuyên gia nông nghiệp, luật sư khi cần.
- Ngày công là đơn vị đo độ lớn của việc, tính theo một người làm đủ một ngày. Thời gian thật của agent chưa biết; lịch 44 tuần được giữ làm khung vì cổng duyệt, việc thực địa và chu kỳ cây không rút ngắn được. Dùng hết 20% dự phòng thì kéo dài tới khoảng 48 tuần.
- Điểm nghẽn là con người duyệt và làm việc thực địa. Nếu thời gian chờ duyệt vượt 3 ngày làm việc kéo dài, cắt phạm vi: bỏ màn Thời tiết và Chất lượng dữ liệu ở giai đoạn 4, việc 5.8, và các việc 7.3 đến 7.5.
- Ít nhất 3 nguồn giá thật lấy được ổn định. Điều này được kiểm ở cổng G0; nếu không đạt thì đổi sang mô hình nhập liệu có tổ chức qua hợp tác xã.

**Tổng hợp các giai đoạn**

| Giai đoạn | Tuần | Ngày công | Cổng cuối giai đoạn |
| --- | --- | --- | --- |
| 0. Khám phá và kiểm chứng | 1–3 | 20,5 | G0: bài toán đáng làm, dữ liệu lấy được |
| 1. Thu thập dữ liệu | 3–10 | 51 | G1: thu ổn định 4 tuần liên tục |
| 2. Làm sạch và kho dữ liệu | 6–13 | 36 | G2: chuỗi giá sạch, truy ngược được |
| 3. Phân tích và mô hình | 11–20 | 49 | G3: mô hình thắng mốc so sánh |
| 4. Dashboard phân tích | 14–21 | 45 | G4: người dùng phân tích dùng không cần hướng dẫn |
| 5. Ứng dụng nông dân và Zalo | 18–26 | 45 | G5: nông dân hiểu đúng đề xuất |
| 6. Thử nghiệm thực địa | 24–36 | 46 | G6: quyết định phát hành rộng hay dừng |
| 7. Vận hành, mở rộng, kinh doanh | 34–44 | 48 | G7: có khách trả tiền hoặc dừng |
| Xuyên suốt | 1–44 | 51 | Không có cổng riêng |
| **Cộng trực tiếp** |  | **391,5** |  |
| Dự phòng 20% |  | 78 |  |
| **Tổng** |  | **≈ 470** |  |

**Thước đo thành công, đo ở cổng G6**

| Thước đo | Ngưỡng đạt |
| --- | --- |
| Thu thập dữ liệu | Từ 95% lịch chạy thành công, tỷ lệ thiếu dưới 10% |
| Độ chính xác dự báo | Sai số thấp hơn mốc "giá cùng tuần năm trước" ở ít nhất 2 trên 3 cây |
| Độ tin cậy của khoảng dự báo | Giá thật nằm trong dải 80% ở 72% đến 88% số tuần |
| Hiệu quả cho hộ | Tỷ lệ vụ lỗ của hộ dùng không cao hơn nhóm so sánh |
| Mức độ chấp nhận | Từ 70% hộ thử dùng tiếp vụ sau |

## Lộ trình tổng thể

Thu thập, làm sạch, mô hình và dashboard chạy chồng nhau để rút ngắn lịch; thử nghiệm thực địa là giai đoạn dài nhất và quyết định có phát hành rộng hay không.

&#91;embedded content: lộ trình 8 giai đoạn theo tuần, mỗi giai đoạn kết thúc ở một cổng\]

Cổng G6 ở tuần 36 là điểm quyết định: nếu không đạt thì giai đoạn 7 không bắt đầu đầy đủ.

## Giai đoạn 0: Khám phá và kiểm chứng (tuần 1–3)

Giai đoạn này trả lời hai câu hỏi trước khi viết dòng mã nào: bài toán có đáng làm không, và dữ liệu có lấy được không.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 0.1 | Chọn vùng thí điểm và 3 đến 4 cây cùng ba mẹ và tổ hợp tác | Phiếu mô tả vùng, danh sách cây, chu kỳ từng cây | 2 |  |
| 0.2 | Phỏng vấn 8 đến 10 nông hộ và 2 đến 3 thương lái: họ quyết định trồng gì dựa vào đâu, bán giá nào, mất tiền ở khâu nào | Bản ghi phỏng vấn, tóm tắt các kiểu quyết định | 4 | 0.1 |
| 0.3 | Khảo sát nguồn dữ liệu: liệt kê ít nhất 15 nguồn, thử lấy thật (API, trang web, PDF, nhập tay), ghi tần suất, độ trễ, điều khoản sử dụng | Bảng nguồn có cột "lấy được ổn định hay không" | 4 | 0.1 |
| 0.4 | Nhập tay 2 đến 3 năm giá lịch sử của 1 cây vào bảng tính | Bảng tính giá tuần | 3 | 0.3 |
| 0.5 | Thu sổ sách thật của gia đình: chi phí, năng suất, giá bán 6 đến 10 vụ gần nhất | Bộ dữ liệu "gia đình" | 3 | 0.1 |
| 0.6 | Dựng thử mô hình mùa vụ và cung trên bảng tính, xem có tín hiệu không | Báo cáo 2 trang | 3 | 0.4, 0.5 |
| 0.7 | Chốt thước đo thành công và điều kiện dừng dự án | Tài liệu 1 trang | 1 | 0.2 |
| 0.8 | Họp cổng G0 với ba mẹ và người có liên quan | Biên bản quyết định | 0,5 | tất cả |

**Cổng G0, cần đạt để sang giai đoạn 1**

- Ít nhất 3 nguồn giá lấy được ổn định, và có ít nhất 2 năm giá lịch sử cho 1 cây.
- Bảng tính thử cho thấy giá có mùa vụ hoặc có quan hệ với lượng cung vùng; nếu không có tín hiệu nào, dừng và đổi cách tiếp cận.
- Nông hộ xác nhận đây là nỗi đau thật và nói được họ sẵn lòng nhìn vào thông tin gì trước khi xuống giống.

## Giai đoạn 1: Thu thập dữ liệu (tuần 3–10)

Giai đoạn này dựng bộ thu thập tự động cho từng nhóm dữ liệu và một cổng nhập liệu cho nông hộ, vì nhiều nguồn nông sản không có API.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 1.1 | Thiết kế danh mục dữ liệu: các thực thể (cây, vùng, chợ, nguồn, đơn vị, chất lượng) và mã chuẩn | Từ điển dữ liệu bản 1 | 3 | G0 |
| 1.2 | Dựng môi trường phát triển: kho mã, tích hợp liên tục, container, quản lý khóa bí mật | Repo chạy được, pipeline CI | 2 | G0 |
| 1.3 | Khung thu thập chung: thử lại khi lỗi, giới hạn tốc độ, lưu bản thô kèm nguồn, thời điểm lấy, mã băm | Thư viện thu thập dùng lại | 5 | 1.1, 1.2 |
| 1.4 | Bộ thu thập giá cho 3 nguồn (chợ đầu mối, cơ quan quản lý, nguồn thứ ba chọn ở G0) | 3 bộ thu thập chạy theo lịch | 8 | 1.3 |
| 1.5 | Bộ thu thập thời tiết: lịch sử và dự báo | Bảng thô thời tiết theo ngày | 3 | 1.3 |
| 1.6 | Bộ thu thập nguồn cung: niên giám, diện tích gieo trồng, nhập từ hợp tác xã | Bảng thô diện tích, sản lượng | 5 | 1.3 |
| 1.7 | Bộ thu thập chi phí vật tư và nhiên liệu | Bảng thô giá vật tư | 3 | 1.3 |
| 1.8 | Thu thập sự kiện: cảnh báo bão, dịch bệnh, chính sách, gắn nhãn loại sự kiện | Bảng sự kiện có nhãn | 4 | 1.3 |
| 1.9 | Ứng dụng nhập liệu cho nông hộ và hợp tác xã (web di động hoặc biểu mẫu Zalo): giá bán, diện tích xuống giống, chi phí, sản lượng | Biểu mẫu chạy được, có kiểm tra giá trị nhập | 8 | 1.1 |
| 1.10 | Nạp dữ liệu lịch sử 2 đến 3 năm cho các nguồn có sẵn | Bảng thô đầy đủ lịch sử | 4 | 1.4, 1.5, 1.6 |
| 1.11 | Lịch chạy và giám sát: cảnh báo khi nguồn hỏng hoặc đổi cấu trúc trang | Bảng điều khiển trạng thái thu thập | 3 | 1.4 |
| 1.12 | Kiểm thử thu thập: đối chiếu mẫu với nguồn gốc, thử khi trang đổi giao diện | Báo cáo kiểm thử | 3 | 1.10 |

**Cổng G1, cần đạt để sang giai đoạn 3 (giai đoạn 2 chạy chồng)**

- 4 tuần liên tục có từ 95% lịch chạy thành công; mọi bản thô lưu đủ nguồn và thời điểm.
- Ít nhất 10 nông hộ nhập liệu thử và không bị kẹt ở biểu mẫu.
- Mỗi nguồn có người chịu trách nhiệm khi nó hỏng, và có cách làm thủ công thay thế.

## Giai đoạn 2: Làm sạch và kho dữ liệu (tuần 6–13)

Giai đoạn này biến dữ liệu thô thành chuỗi sạch có thể tin được, theo ba tầng: thô (không bao giờ sửa), sạch, và tổng hợp để phân tích.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 2.1 | Thiết kế lược đồ 3 tầng trong PostgreSQL, có phân vùng theo thời gian | Lược đồ và tập lệnh tạo bảng | 3 | 1.1 |
| 2.2 | Bảng từ điển: tên cây (cải thìa, cải bẹ trắng, bok choy), đơn vị (kg, tạ, yến, chục), phân loại chất lượng | Bảng từ điển có người duyệt | 3 | 2.1 |
| 2.3 | Pipeline chuẩn hóa tên và đơn vị về VNĐ/kg | Bảng sạch lớp 1 | 4 | 2.2 |
| 2.4 | Khử trùng lặp, gán điểm tin cậy cho nguồn, quy tắc xử lý khi các nguồn mâu thuẫn | Bảng sạch lớp 2, nhật ký xung đột | 4 | 2.3 |
| 2.5 | Phát hiện ngoại lệ (độ lệch tuyệt đối trung vị, quy tắc nghiệp vụ) và hàng đợi duyệt tay; gắn cờ, không tự xóa | Hàng đợi ngoại lệ có lý do | 4 | 2.3 |
| 2.6 | Xử lý dữ liệu thiếu: nội suy khoảng ngắn, để trống và ghi chú khoảng dài | Quy tắc và mã xử lý | 2 | 2.4 |
| 2.7 | Bộ kiểm tra chất lượng tự động chạy hằng ngày (độ đầy đủ, khoảng giá hợp lý, đơn vị) | Bộ kiểm tra, cảnh báo khi trượt | 4 | 2.4, 2.5 |
| 2.8 | Tầng tổng hợp: bảng theo tuần, vụ, vùng; các đặc trưng cho mô hình (giá trễ, mưa tích lũy, diện tích thu hoạch) | Bảng phân tích sẵn dùng | 5 | 2.6 |
| 2.9 | Nhật ký chất lượng mỗi lần chạy: dòng nhận, dòng loại, lý do; trang trạng thái nguồn | Bảng nhật ký và trang trạng thái | 3 | 2.7 |
| 2.10 | Sao lưu, phục hồi và thử khôi phục thật | Quy trình sao lưu đã thử | 2 | 2.1 |
| 2.11 | Tài liệu dữ liệu: ý nghĩa từng cột, nguồn gốc, quy tắc biến đổi | Từ điển dữ liệu bản 2 | 2 | 2.8 |

**Cổng G2, cần đạt để mô hình hóa nghiêm túc**

- Chuỗi giá tuần sạch từ 2 năm trở lên cho các cây thí điểm, tỷ lệ thiếu dưới 10%.
- Mọi dòng ở tầng sạch truy ngược được về bản thô và quy tắc đã áp dụng.
- Bộ kiểm tra chất lượng chạy hằng ngày và đã báo lỗi thật ít nhất một lần khi thử.

## Giai đoạn 3: Phân tích và mô hình (tuần 11–20)

Giai đoạn này dựng mô hình dự báo giá và rủi ro, và chỉ coi nó là dùng được khi nó thắng các cách đoán đơn giản trên dữ liệu chưa từng thấy.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 3.1 | Phân tích khám phá: mùa vụ, tương quan, độ trễ giữa giá và diện tích gieo | Sổ phân tích, danh sách giả thuyết kiểm chứng được | 5 | 2.8 |
| 3.2 | Khung đánh giá: kiểm định ngược theo thời gian, mốc so sánh, chỉ số (sai số phần trăm, độ phủ khoảng, sai số phân vị) | Bộ đánh giá dùng chung cho mọi mô hình | 4 | 3.1 |
| 3.3 | Mô hình mốc: giá cùng tuần năm trước, trung bình mùa vụ, ETS hoặc SARIMA | Điểm số mốc cho từng cây | 4 | 3.2 |
| 3.4 | Mô hình cung và giá: hồi quy theo diện tích thu hoạch và chỉ số mùa vụ | Mô hình bản 1, hệ số có ý nghĩa nghiệp vụ | 5 | 3.2 |
| 3.5 | Mô hình nâng cao (cây quyết định tăng cường, hồi quy phân vị) thêm thời tiết, chi phí, sự kiện | Mô hình bản 2 và so sánh với bản 1 | 6 | 3.4 |
| 3.6 | Hiệu chỉnh khoảng dự báo để độ phủ 80% đúng thật | Khoảng dự báo đã hiệu chỉnh | 3 | 3.5 |
| 3.7 | Mô phỏng Monte Carlo lợi nhuận: giá, năng suất, hao hụt, chi phí rút ngẫu nhiên, dùng số liệu thật của hộ | Bảng xác suất lỗ, lợi nhuận kỳ vọng, mức xấu 10% | 5 | 3.6, 0.5 |
| 3.8 | Bộ xếp hạng khuyến nghị và tối ưu chia lô xuống giống | Hàm khuyến nghị có kiểm thử | 5 | 3.7 |
| 3.9 | Mô hình diện tích xuống giống của vùng, dự báo nguồn cung từ tín hiệu sớm | Dự báo diện tích 4 đến 12 tuần tới | 5 | 3.4 |
| 3.10 | Đóng gói mô hình: đánh số phiên bản, lưu tham số, theo dõi trôi dữ liệu | Quy trình huấn luyện lại tự động | 4 | 3.8 |
| 3.11 | Rà soát độc lập: một người khác đọc kết quả, tìm rò rỉ dữ liệu và lỗi logic | Báo cáo rà soát, danh sách sửa | 3 | 3.8 |

**Cổng G3, quyết định có dự báo giá hay không**

- Mô hình thắng mốc "giá cùng tuần năm trước" về sai số trên tập thử ngoài mẫu, ở ít nhất 2 trên 3 cây.
- Độ phủ dải 80% nằm trong khoảng 72% đến 88%.
- Nếu không đạt: không phát hành dự báo giá. Thay bằng thống kê mô tả, cảnh báo nguồn cung và giá hòa vốn, rồi quay lại cải thiện dữ liệu.

## Giai đoạn 4: Dashboard cho dân phân tích (tuần 14–21)

Bản dashboard mẫu đã làm là đặc tả giao diện; giai đoạn này thay dữ liệu mô phỏng bằng dữ liệu thật qua một lớp API và làm cho nó dùng được hằng ngày.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 4.1 | Từ điển chỉ số: định nghĩa, công thức, nguồn của từng con số hiển thị | Tài liệu chỉ số, một nguồn sự thật duy nhất | 2 | 2.8 |
| 4.2 | Lớp API truy vấn (FastAPI) có bộ nhớ đệm, giới hạn truy vấn | API có tài liệu và kiểm thử | 5 | 4.1 |
| 4.3 | Khung giao diện: bộ lọc chung (cây, vùng, thời gian, chất lượng), đăng nhập, phân quyền | Khung ứng dụng chạy được | 5 | 4.2 |
| 4.4 | Màn Tổng quan: thẻ chỉ số, giá và dải thấp–cao, tín hiệu cần chú ý, xếp hạng | Màn hình dùng dữ liệu thật | 4 | 4.3, 3.8 |
| 4.5 | Màn Giá và mùa vụ: bản đồ nhiệt, so sánh các năm, boxplot, phân rã chuỗi | Màn hình hoàn chỉnh | 4 | 4.3 |
| 4.6 | Màn Cung và cầu: diện tích thu hoạch, biểu đồ nhện, tương quan chéo, nguồn cung 12 tuần tới | Màn hình hoàn chỉnh | 4 | 4.3, 3.9 |
| 4.7 | Màn Thời tiết: mưa và nhiệt độ, ma trận tương quan | Màn hình hoàn chỉnh | 3 | 4.3 |
| 4.8 | Màn Chi phí và hòa vốn: thác nước, độ nhạy, lãi/lỗ theo tuần | Màn hình hoàn chỉnh | 3 | 4.3 |
| 4.9 | Màn Dự báo và rủi ro: biểu đồ quạt, kiểm định ngược, phân phối lợi nhuận, chia lô | Màn hình hoàn chỉnh | 5 | 4.3, 3.8 |
| 4.10 | Màn Chất lượng dữ liệu: trạng thái nguồn, độ đầy đủ, ngoại lệ chờ duyệt | Màn hình hoàn chỉnh | 3 | 2.9 |
| 4.11 | Hiệu năng, hiển thị trên điện thoại, hỗ trợ bàn phím và trình đọc màn hình | Báo cáo kiểm tra | 3 | 4.4 đến 4.10 |
| 4.12 | Thử với 2 đến 3 người làm phân tích hoặc cán bộ khuyến nông, sửa theo phản hồi | Danh sách phản hồi và bản sửa | 4 | 4.11 |

**Cổng G4**

- Ít nhất 3 người dùng thực hiện được 5 tình huống kiểm thử (ví dụ "tìm tháng nào giá thấp nhất", "cây nào đang dư cung") mà không cần hướng dẫn.
- Mọi con số trên màn hình truy ngược được tới nguồn và công thức trong từ điển chỉ số.
- Thời gian tải mỗi màn hình dưới 3 giây trên mạng di động bình thường.

## Giai đoạn 5: Ứng dụng cho nông dân và Zalo (tuần 18–26)

Giai đoạn này biến kết quả mô hình thành một đề xuất mà nông dân hiểu và dám làm theo, đồng thời giữ cho cả vùng không cùng đổ xô vào một cây.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 5.1 | Quan sát 5 đến 8 nông hộ dùng bản thử: thiết bị, thói quen, chỗ họ hiểu sai | Ghi chú quan sát, danh sách vấn đề | 4 | G3 |
| 5.2 | Thiết kế nội dung đề xuất: cách nói rủi ro bằng lời, thứ tự thông tin, từ ngữ địa phương | Bộ quy tắc nội dung | 3 | 5.1 |
| 5.3 | Máy quy tắc khuyến nghị: chuyển kết quả mô hình thành nhãn "nên trồng, cân nhắc, chưa nên", lý do và lưu ý | Máy quy tắc có kiểm thử | 5 | 3.8, 5.2 |
| 5.4 | Giao diện web di động (ứng dụng web có thể cài lên màn hình) | Bản chạy được trên máy rẻ, mạng yếu | 6 | 5.2 |
| 5.5 | Tích hợp Zalo: bản tin hằng tuần qua tài khoản chính thức; kiểm tra điều kiện, chi phí và phê duyệt mẫu tin | Bản tin tự động gửi được | 6 | 5.3 |
| 5.6 | Nhập liệu vụ của chính hộ: xuống giống, chi phí, bán | Nhật ký vụ cá nhân | 5 | 1.9 |
| 5.7 | Cá nhân hóa theo diện tích, vốn, kinh nghiệm, loại đất | Đề xuất khác nhau theo hộ | 4 | 5.6 |
| 5.8 | Cơ chế tránh đổ xô: gợi ý khác nhau theo hợp tác xã và diện tích đã đăng ký xuống giống | Bộ phân bổ khuyến nghị | 5 | 5.3, 3.9 |
| 5.9 | Điều khoản sử dụng, câu miễn trừ trách nhiệm, đồng ý chia sẻ dữ liệu cá nhân | Văn bản được rà soát pháp lý | 3 | 5.4 |
| 5.10 | Kiểm thử khả dụng với 10 nông hộ | Báo cáo và bản sửa | 4 | 5.4, 5.5 |

**Cổng G5**

- Ít nhất 8 trên 10 hộ diễn đạt lại đúng đề xuất và mức rủi ro bằng lời của họ.
- Bản tin Zalo gửi ổn định 4 tuần liên tục, không nhầm người nhận.
- Điều khoản và câu miễn trừ đã qua rà soát pháp lý.

## Giai đoạn 6: Thử nghiệm thực địa (tuần 24–36)

Đây là giai đoạn quan trọng nhất: chạy hệ thống với hộ thật qua ít nhất 2 chu kỳ rau ngắn ngày, và quyết định phát hành rộng dựa trên kết quả thật, không dựa trên mô hình.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 6.1 | Tuyển 15 đến 30 hộ và 1 đến 2 hợp tác xã, ký thỏa thuận tham gia và chia sẻ dữ liệu | Danh sách hộ, thỏa thuận đã ký | 5 | G5 |
| 6.2 | Tập huấn tại chỗ, cầm tay chỉ việc cho từng hộ | Hộ dùng được mà không cần gọi hỏi | 3 | 6.1 |
| 6.3 | Chạy song song: mỗi tuần chốt và lưu lại dự báo trước khi biết kết quả, không ép hộ làm theo | Kho dự báo đã đóng dấu thời gian | 2 | 6.1 |
| 6.4 | Theo dõi hằng tuần: dữ liệu về đủ không, dự báo ra sao, hộ thật sự làm gì (khoảng 1 ngày mỗi tuần, 12 tuần) | Sổ theo dõi hằng tuần | 12 | 6.2 |
| 6.5 | Cuối mỗi vụ, so dự báo với thực tế: sai số, độ phủ khoảng, quyết định đúng hay sai | Báo cáo sau mỗi vụ | 6 | 6.3 |
| 6.6 | So hộ dùng với nhóm đối chiếu (hộ không dùng, hoặc chính hộ đó ở vụ trước): lợi nhuận, tỷ lệ vụ lỗ | Phân tích tác động | 5 | 6.5 |
| 6.7 | Thu phản hồi, sửa lỗi, cải tiến theo vòng 2 tuần | Danh sách thay đổi đã làm | 10 | 6.4 |
| 6.8 | Báo cáo kết quả vụ thử và quyết định phát hành rộng hay dừng | Báo cáo cổng G6 | 3 | 6.6 |

**Cổng G6, quyết định phát hành rộng**

- Khuyến nghị đúng hướng (cây được xếp trên thật sự lời hơn cây xếp dưới) ở ít nhất 70% quyết định đã có kết quả.
- Tỷ lệ vụ lỗ của hộ dùng không cao hơn nhóm đối chiếu; mức giảm mục tiêu đặt từ số liệu sổ sách gia đình ở 0.5.
- Từ 70% hộ chọn dùng tiếp vụ sau.
- Không đạt: dừng mở rộng, quay lại giai đoạn 3 hoặc 5 theo nguyên nhân tìm được ở 6.5.

## Giai đoạn 7: Vận hành, mở rộng và kinh doanh (tuần 34–44)

Giai đoạn này chỉ bắt đầu đầy đủ sau khi G6 đạt; nó đưa hệ thống từ bản thử thành dịch vụ chạy ổn định và tìm người trả tiền.

| Mã | Việc cần làm | Đầu ra | Ngày công | Cần xong trước |
| --- | --- | --- | --- | --- |
| 7.1 | Hạ tầng sản xuất: giám sát, cảnh báo, phiên trực, sổ tay xử lý sự cố | Hệ thống có người trực và quy trình | 6 | G5 |
| 7.2 | Quy trình huấn luyện lại mô hình sau mỗi vụ và khi phát hiện trôi dữ liệu | Quy trình có lịch và tiêu chí | 4 | 3.10 |
| 7.3 | Mở rộng cây và vùng: danh sách việc cho mỗi vùng mới (nguồn, từ điển, hiệu chỉnh, tuyển hộ) | Bộ việc mẫu và 1 vùng thứ hai | 10 | G6 |
| 7.4 | Gói dịch vụ cho hợp tác xã và doanh nghiệp: dashboard vùng, cảnh báo cung, kế hoạch xuống giống chung | Gói dịch vụ bản thử | 10 | G6 |
| 7.5 | Thử hợp đồng với 1 đến 2 doanh nghiệp thu mua hoặc đại lý vật tư | Hợp đồng thử hoặc lý do bị từ chối | 8 | 7.4 |
| 7.6 | Mô hình giá và doanh thu, thử các mức giá với khách thật | Bảng giá và dự phóng | 3 | 7.5 |
| 7.7 | Hỗ trợ người dùng và quy trình xử lý khiếu nại, sửa số liệu sai | Kênh hỗ trợ, thời hạn phản hồi | 4 | 7.1 |
| 7.8 | Đo lường kinh doanh: người dùng hoạt động hằng tuần, tỷ lệ giữ chân, doanh thu | Bảng điều khiển kinh doanh | 3 | 7.5 |

**Cổng G7, quyết định theo đuổi hay dừng**

- Có ít nhất 1 khách trả tiền hoặc cam kết bằng văn bản sau thời gian thử.
- Chi phí vận hành hằng tháng nhỏ hơn doanh thu dự kiến trong 6 tháng tới; nếu không, chuyển sang dạng dự án phi lợi nhuận hoặc có tài trợ.
- Có kế hoạch 6 tháng cho vùng thứ hai và người phụ trách.

## Công việc xuyên suốt (tuần 1–44)

Sáu mảng việc này chạy song song với mọi giai đoạn và chiếm 51 ngày công; bỏ qua chúng là cách phổ biến nhất khiến dự án dữ liệu hỏng giữa chừng.

| Mã | Mảng việc | Việc cụ thể | Ngày công |
| --- | --- | --- | --- |
| X1 | Quản lý dự án | Danh sách việc còn tồn, họp tuần 30 phút, báo cáo cuối mỗi cổng, ghi lại quyết định | 20 |
| X2 | Bảo mật | Phân quyền theo vai trò, mã hóa dữ liệu cá nhân của hộ, quản lý khóa, sao lưu ngoài hệ thống chính | 6 |
| X3 | Pháp lý và quyền riêng tư | Đọc điều khoản của từng nguồn dữ liệu, xin đồng ý rõ ràng khi thu dữ liệu của hộ, rà soát quy định bảo vệ dữ liệu cá nhân hiện hành với luật sư (chi phí tư vấn tính riêng) | 6 |
| X4 | Kiểm thử và chất lượng | Kiểm thử tự động cho mã, cho dữ liệu và cho mô hình (so sánh với phiên bản trước khi cập nhật) | 10 |
| X5 | Tài liệu và chuyển giao | Tài liệu cài đặt, sổ tay vận hành, hướng dẫn cho người dùng, video ngắn cho nông dân | 6 |
| X6 | Theo dõi rủi ro và chi phí | Rà soát bảng rủi ro mỗi 2 tuần, theo dõi chi phí hạ tầng và phí nhắn tin | 3 |

Chi phí ngoài nhân công cần báo giá trước khi bắt đầu giai đoạn 1: máy chủ và lưu trữ, phí tin nhắn Zalo, tư vấn pháp lý, chi phí đi lại và hỗ trợ hộ ở thực địa.

## Rủi ro và phương án dự phòng

Ba rủi ro đầu bảng (dữ liệu, mô hình, hiệu ứng đổ xô) có thể làm dự án dừng ở cổng G0, G3 hoặc G6, nên cần được kiểm sớm nhất.

| Rủi ro | Khả năng | Ảnh hưởng | Dấu hiệu sớm | Phương án |
| --- | --- | --- | --- | --- |
| Không lấy được dữ liệu giá đủ tốt | Cao | Rất cao | Ở G0 chưa có 3 nguồn ổn định | Chuyển sang nhập liệu có tổ chức qua hợp tác xã và thương lái; thu hẹp xuống 1 cây |
| Mô hình không thắng mốc so sánh | Trung bình | Cao | Kiểm định ngược ở 3.3 đến 3.5 | Phát hành thống kê mô tả, cảnh báo cung và giá hòa vốn thay cho dự báo giá |
| Hiệu ứng đổ xô: nhiều hộ làm theo cùng một đề xuất | Trung bình | Cao | Diện tích đăng ký của một cây vượt 120% mức thường | Cơ chế phân bổ ở 5.8; hạn mức đề xuất theo hợp tác xã |
| Nông dân không tin hoặc hiểu sai đề xuất | Cao | Cao | Ở 5.10 dưới 8 trên 10 hộ diễn đạt lại đúng | Sửa nội dung, thêm người hướng dẫn qua hợp tác xã, giảm lượng thông tin |
| Nguồn đổi cấu trúc hoặc chặn thu thập | Cao | Trung bình | Bộ thu thập báo lỗi liên tục | Giám sát ở 1.11, giữ cách nhập tay thay thế, hỏi xin quyền truy cập chính thức |
| Đề xuất sai làm hộ thiệt hại | Thấp | Rất cao | Hộ báo lỗ sau khi làm theo | Câu miễn trừ, chạy song song ở G6 trước khi phát hành, luôn nói khoảng và xác suất, không hứa chắc lời |
| Vi phạm quyền riêng tư dữ liệu hộ | Thấp | Cao | Thiếu văn bản đồng ý | X3 và 5.9; chỉ thu dữ liệu cần thiết |
| Thiếu người hoặc người chủ chốt rời đi | Trung bình | Cao | Trễ liên tiếp 2 tuần | Tài liệu ở X5, cắt phạm vi theo danh sách ở mục giả định |
| Không có người trả tiền | Trung bình | Trung bình | Ở 7.5 không có hợp đồng thử | Mô hình có tài trợ hoặc phi lợi nhuận; giữ chi phí vận hành thấp |

## Hai tuần đầu tiên

Trong 2 tuần đầu chỉ làm giai đoạn 0, không viết mã hệ thống; mục tiêu là biết chắc có nên làm tiếp hay không.

**Tuần 1**

- [ ] Chốt vùng thí điểm và 3 đến 4 cây cùng ba mẹ (việc 0.1)
- [ ] Hẹn lịch phỏng vấn 8 đến 10 nông hộ và 2 đến 3 thương lái (0.2)
- [ ] Xin ba mẹ sổ sách hoặc ghi nhớ 6 đến 10 vụ gần nhất: chi phí, năng suất, giá bán (0.5)
- [ ] Lập danh sách ít nhất 15 nguồn dữ liệu có thể có cho vùng và cây đã chọn (0.3)
- [ ] Thử lấy dữ liệu thật từ 5 nguồn đầu tiên, ghi lại cái nào lấy được (0.3)

**Tuần 2**

- [ ] Hoàn tất phỏng vấn và viết tóm tắt các kiểu quyết định (0.2)
- [ ] Nhập tay giá lịch sử của 1 cây vào bảng tính (0.4)
- [ ] Đọc điều khoản sử dụng của các nguồn đã thử lấy (0.3)
- [ ] Vẽ giá theo tuần và theo tháng trên bảng tính, tìm mùa vụ (0.6)
- [ ] Viết thước đo thành công và điều kiện dừng dự án (0.7)

**Cuối tuần 3**

- [ ] Họp cổng G0 và ghi lại quyết định đi tiếp, đổi hướng hoặc dừng (0.8)
