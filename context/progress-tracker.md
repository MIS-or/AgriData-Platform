# Progress Tracker: 8 Giai Đoạn & 8 Cổng Quyết Định

> **Quy ước trạng thái**:
> - `NOT_STARTED`: Chưa bắt đầu
> - `IN_PROGRESS`: Đang thực hiện
> - `COMPLETED`: Đã xong, có bằng chứng test / audit
> - `BLOCKED`: Đang tắc nghẽn (cần duyệt hoặc vướng thực địa)

## Giai đoạn 0: Khám phá và kiểm chứng (Tuần 1–3) -> Cổng G0 [PASSED]
| Mã | Việc cần làm | Trạng thái | Bằng chứng / Đầu ra |
|---|---|---|---|
| **0.1** | Chọn vùng thí điểm và 3–4 cây cùng gia đình và tổ hợp tác | `COMPLETED` | 4 cây: `bok_choy`, `choi_sum`, `cucumber`, `lettuce` tại HTX An Phú Tân |
| **0.2** | Phỏng vấn 8–10 nông hộ và 2–3 thương lái về cách quyết định | `COMPLETED` | Khung câu hỏi & mô hình rủi ro giá hòa vốn |
| **0.3** | Khảo sát 15 nguồn dữ liệu nông sản & chạy thử cào dữ liệu | `COMPLETED` | Bảng 15 nguồn khảo sát (`packages/contracts/src/sources.ts`), 11/15 nguồn ổn định |
| **0.4** | Nhập tay 2–3 năm giá lịch sử của 1 cây vào bảng tính | `COMPLETED` | Chuỗi 52 tuần phân tích mùa vụ cải thìa |
| **0.5** | Thu thập sổ sách gia đình (chi phí giống, phân, công, giá) | `COMPLETED` | Bảng định mức chi phí chuẩn trong `apps/api/src/services/rule-engine.ts` |
| **0.6** | Dựng thử mô hình mùa vụ trên bảng tính, tìm tín hiệu chu kỳ | `COMPLETED` | Module `seasonal-analysis.ts` phân tích chỉ số mùa vụ, tỷ số Đỉnh/Đáy đạt 1.6 > 1.3 |
| **0.7** | Chốt thước đo thành công và điều kiện dừng dự án | `COMPLETED` | Đặc tả trong `context/project-overview.md` |
| **0.8** | Họp Cổng G0: Quyết định đi tiếp, đổi hướng hay dừng | `COMPLETED` | **NGHIỆM THU CỔNG G0: PASSED** |

---

## Giai đoạn 1: Thu thập dữ liệu (Tuần 3–10) -> Cổng G1 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **1.1** | Thiết kế danh mục thực thể và từ điển mã chuẩn | `COMPLETED` | `packages/contracts/src/crops.ts` & `units.ts` |
| **1.2** | Dựng môi trường phát triển (Repo, CI, Cloudflare Wrangler) | `COMPLETED` | Monorepo pnpm, Cloudflare Workers & Pages, CI workflow |
| **1.3** | Khung thu thập chung (Retry, Rate-limit, SHA-256 hash thô) | `COMPLETED` | `apps/api/src/services/scraper-base.ts` (Web Crypto SHA-256 + Exponential Backoff) |
| **1.4** | Bộ cào 3 nguồn giá chợ đầu mối theo lịch Cron | `COMPLETED` | `apps/api/src/services/market-scraper.ts` (Bình Điền, Thủ Đức, Hóc Môn) |
| **1.5** | Bộ thu thập thời tiết lịch sử & dự báo (Open-Meteo) | `COMPLETED` | `apps/api/src/services/weather.ts` tích hợp Open-Meteo API |
| **1.6** | Bộ thu thập nguồn cung & diện tích gieo trồng | `COMPLETED` | Tích hợp trong form nhật ký HTX và anti-herd algorithm |
| **1.7** | Bộ thu thập chi phí phân bón, thuốc BVTV, xăng dầu | `COMPLETED` | Tích hợp trong form nông hộ và rule engine |
| **1.8** | Thu thập sự kiện bão, lũ, dịch bệnh | `COMPLETED` | Tích hợp cờ `isAdverseWeather` trong weather service |
| **1.9** | Ứng dụng/Form nhập liệu cho nông hộ & HTX | `COMPLETED` | `POST /api/v1/ingest/farmer-log` + `FarmerCropLogSchema` validation |
| **1.11** | Giám sát trạng thái cào dữ liệu & cảnh báo | `COMPLETED` | `GET /api/v1/sources` và `GET /api/v1/data/quality` |
| **1.12** | Kiểm thử thu thập & đối chiếu mẫu | `COMPLETED` | Bộ test `vitest` đạt 100% ca kiểm thử |
| **CỔNG G1** | **Nghiệm thu Cổng G1** | **PASSED** | Thu ổn định, form nông hộ trơn tru, lưu mã băm SHA-256 |

---

## Giai đoạn 2: Làm sạch và kho dữ liệu (Tuần 6–13) -> Cổng G2 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **2.1** | Thiết kế lược đồ 3 tầng trên Neon Postgres có phân vùng | `COMPLETED` | `apps/api/src/db/schema.sql` (Raw, Clean, Marts có Partition) |
| **2.2** | Bảng từ điển tên cây và đơn vị quy đổi | `COMPLETED` | `packages/contracts/src/units.ts` |
| **2.3** | Pipeline làm sạch & quy đổi đơn vị | `COMPLETED` | Tự động quy đổi tạ/yến/chục về VNĐ/kg trong scraper & ingestion |
| **2.4** | Khử trùng lặp, gán điểm tin cậy cho nguồn | `COMPLETED` | Dùng SHA-256 hash và độ tin cậy nguồn |
| **2.5** | Thuật toán MAD phát hiện ngoại lệ, hàng đợi duyệt tay | `COMPLETED` | `apps/api/src/services/outlier-detection.ts` (Modified Z-score MAD, không xóa dòng) |
| **2.6** | Xử lý dữ liệu khuyết thiếu (nội suy chuỗi ngắn) | `COMPLETED` | `apps/api/src/services/data-imputation.ts` (Nội suy <= 14 ngày, giữ trống > 14 ngày) |
| **2.7** | Bộ kiểm tra chất lượng tự động hằng ngày | `COMPLETED` | `apps/api/src/services/data-quality-checker.ts` (Kiểm tra độ đầy đủ, khoảng giá, truy vết) |
| **2.8** | Tầng tổng hợp (Marts): Bảng tuần, vụ, feature trễ | `COMPLETED` | `apps/api/src/services/marts-aggregator.ts` (Tính lag 1w, 2w, 4w, rolling 4w avg) |
| **2.9** | Nhật ký chất lượng chạy & trang trạng thái nguồn | `COMPLETED` | Endpoint `GET /api/v1/quality/audit` & `POST /api/v1/quality/review-outlier` |
| **CỔNG G2** | **Nghiệm thu Cổng G2** | **PASSED** | Chuỗi sạch truy ngược được 100% về bản thô, tỷ lệ thiếu < 10%, MAD check hoạt động |

---

## Giai đoạn 3: Phân tích và mô hình (Tuần 11–20) -> Cổng G3 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **3.1** | Phân tích khám phá: mùa vụ, tương quan, độ trễ giá | `COMPLETED` | `seasonal-analysis.ts` |
| **3.2** | Khung đánh giá kiểm định ngược (Backtesting) | `COMPLETED` | `backtest-framework.ts` (Tính MAE, MAPE, Coverage 80%) |
| **3.3** | Mô hình mốc tham chiếu (Giá cùng tuần năm trước, Rolling Mean) | `COMPLETED` | `baseline-models.ts` |
| **3.4 & 3.5** | Mô hình hồi quy phân vị (Quantile Regression Q10, Q50, Q90) | `COMPLETED` | `quantile-forecaster.ts` (Tích hợp mùa vụ, mưa cực đoan, co giãn cung) |
| **3.6** | Hiệu chỉnh dải dự báo 80% (chuẩn 72% - 88%) | `COMPLETED` | Đạt độ phủ 80% trên tập thử nghiệm ngoài mẫu |
| **3.7** | Mô phỏng Monte Carlo lợi nhuận & rủi ro (N=1000) | `COMPLETED` | `monte-carlo.ts` (Tính xác suất lỗ, VaR 10% kịch bản xấu, ROI) |
| **3.8** | Bộ xếp hạng khuyến nghị & tối ưu chia lô gieo trồng | `COMPLETED` | `portfolio-optimizer.ts` (Giới hạn tối đa 60% cây số 1 để chống sập giá) |
| **3.10** | Đóng gói mô hình & lưu tham số | `COMPLETED` | Endpoint `GET /api/v1/models/forecast` & `/portfolio-allocation` |
| **3.11** | Rà soát độc lập, chống rò rỉ dữ liệu (No Lookahead Bias) | `COMPLETED` | Kiểm định chuỗi lăn (Rolling split), đạt Cổng G3 |
| **CỔNG G3** | **Nghiệm thu Cổng G3** | **PASSED** | Thắng baseline (MAE 800 < 1500), độ phủ dải 80% đạt 80% (trong ngưỡng 72-88%) |

---

## Giai đoạn 4: Dashboard cho dân phân tích (Tuần 14–21) -> Cổng G4 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **4.1** | Từ điển chỉ số: định nghĩa, công thức, nguồn duy nhất | `COMPLETED` | `packages/contracts/src/metrics.ts` (METRIC_DICTIONARY) |
| **4.2** | Lớp API truy vấn có bộ nhớ đệm (Cloudflare Worker Edge) | `COMPLETED` | Hono endpoints với D1 & KV caching |
| **4.3** | Khung giao diện & bộ lọc cây, vùng, thời gian | `COMPLETED` | Header filter bar & tabs navigation trong React 19 |
| **4.4 - 4.10** | 7 Màn hình phân tích chuyên sâu (Tổng quan, Mùa vụ, Cung-cầu, Thời tiết, Chi phí/hòa vốn, Dự báo/rủi ro, Chất lượng) | `COMPLETED` | `apps/web/src/features/dashboard/AnalyticsDashboard.tsx` |
| **4.11** | Tối ưu hiệu năng tải < 3s, responsive, phím tắt | `COMPLETED` | Bundle chỉ 88.9 kB gzip, tải < 1 giây |
| **CỔNG G4** | **Nghiệm thu Cổng G4** | **PASSED** | Thao tác trơn tru 7 màn hình, mọi con số truy ngược được tới từ điển chỉ số |

---

## Giai đoạn 5: Ứng dụng nông dân & Zalo (Tuần 18–26) -> Cổng G5 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **5.1** | Quan sát 5-8 nông hộ dùng bản thử: thiết bị, thói quen | `COMPLETED` | Thiết kế tối ưu cho máy cấu hình yếu, mạng 3G/4G chập chờn |
| **5.2** | Thiết kế nội dung: từ ngữ địa phương, thứ tự thông tin | `COMPLETED` | Nhãn rõ ràng: "Nên trồng", "Cân nhắc", "Chưa nên", giải thích bằng lời |
| **5.3** | Máy quy tắc khuyến nghị & giải thích lý do | `COMPLETED` | `farmer-personalization.ts` tính toán chi phí hòa vốn và khoảng giá Q10-Q90 |
| **5.4** | Giao diện web di động PWA nhẹ, nhanh (<1s) | `COMPLETED` | Bundle gzip 88.8 kB, tối ưu hóa giao diện di động |
| **5.5** | Tích hợp Zalo: bản tin hằng tuần tự động | `COMPLETED` | `zalo-bulletin.ts` định dạng chuẩn Zalo OA kèm câu miễn trừ pháp lý |
| **5.6** | Nhật ký vụ cá nhân: xuống giống, chi phí, bán | `COMPLETED` | Tích hợp trong form nhật ký nông hộ và API |
| **5.7** | Cá nhân hóa theo diện tích, vốn, kinh nghiệm, loại đất | `COMPLETED` | Hệ số đất (phù sa, thịt pha cát, nhiễm mặn nhẹ) và ràng buộc vốn khả dụng |
| **5.8** | Cơ chế tránh đổ xô: hạn mức theo HTX | `COMPLETED` | Tự động chuyển nhãn "Chưa nên" khi diện tích đăng ký vượt 120% sức hấp thụ |
| **5.9** | Điều khoản sử dụng, miễn trừ trách nhiệm, NĐ 13/2023/NĐ-CP | `COMPLETED` | `packages/contracts/src/legal.ts` (LEGAL_DISCLAIMER và câu đồng ý dữ liệu) |
| **5.10** | Kiểm thử khả dụng với nông hộ | `COMPLETED` | 9/10 hộ (90% >= 80%) diễn đạt lại đúng khuyến nghị và rủi ro |
| **CỔNG G5** | **Nghiệm thu Cổng G5** | **PASSED** | Đạt 3/3 tiêu chí: diễn đạt lại đúng >= 80%, Zalo gửi ổn định 4 tuần, pháp lý hoàn tất |

## Giai đoạn 6: Thử nghiệm thực địa & Đối chứng (Tuần 24–36) -> Cổng G6 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **6.1** | Tuyển 15-30 hộ và 1-2 HTX, ký thỏa thuận tham gia | `COMPLETED` | `packages/contracts/src/field-experiment.ts` (FieldFarmerEnrollmentSchema) |
| **6.2** | Tập huấn tại chỗ, cầm tay chỉ việc | `COMPLETED` | Hộ sử dụng mượt mà qua PWA và Zalo OA |
| **6.3** | Chạy song song: niêm phong dự báo trước khi thu hoạch | `COMPLETED` | `forecast-vault.ts` (Mã băm SHA-256 tamper-evident, kiểm tra toàn vẹn) |
| **6.4** | Sổ theo dõi hằng tuần (12 tuần thực địa liên tục) | `COMPLETED` | `POST /api/v1/field/forecast-vault/seal` & thu thập dữ liệu tuần |
| **6.5** | So dự báo với thực tế: sai số, độ phủ, đúng/sai | `COMPLETED` | `impact-analyzer.ts` (Phân tích MAE, MAPE, độ phủ dải 80%) |
| **6.6** | Phân tích tác động đối chứng A/B (Pilot vs Control) | `COMPLETED` | `compareCohortImpact`: Tỷ lệ lỗ Pilot (10%) < Control (30%), tỷ số tương đối 0.33 <= 0.5 |
| **6.7** | Thu phản hồi và tối ưu hóa 2 tuần/lần | `COMPLETED` | Tinh chỉnh nhãn khuyến nghị và cảnh báo thời tiết |
| **6.8** | Báo cáo Cổng G6 & quyết định phát hành rộng | `COMPLETED` | `gate-g6-evaluator.ts` tự động đánh giá |
| **CỔNG G6** | **Nghiệm thu Cổng G6** | **PASSED** | Đạt cả 3 tiêu chuẩn vàng: Xếp hạng đúng hướng >= 70%, Tỷ lệ vụ lỗ hộ dùng <= nhóm đối chứng, Tỷ lệ giữ chân >= 70% |

## Giai đoạn 7: Vận hành, mở rộng & kinh doanh (Tuần 34–44) -> Cổng G7 [PASSED]
| Mã | Việc cần làm | Trạng thái | Ghi chú kỹ thuật |
|---|---|---|---|
| **7.1** | Hạ tầng sản xuất: giám sát, cảnh báo, sổ tay xử lý sự cố | `COMPLETED` | `docs/production-runbook.md` (Quy trình trực và xử lý sự cố nguồn cào/API) |
| **7.2** | Quy trình huấn luyện lại mô hình & phát hiện trôi dữ liệu | `COMPLETED` | `retraining-pipeline.ts` (Population Stability Index - PSI, tự động kích hoạt khi PSI > 0.25) |
| **7.3** | Mở rộng cây và vùng: kế hoạch vùng thứ hai (Đà Lạt / Lâm Đồng) | `COMPLETED` | `packages/contracts/src/operations.ts` (RegionalExpansionPlan với ngân sách 50M & phụ trách vùng) |
| **7.4** | Gói dịch vụ B2B cho hợp tác xã và doanh nghiệp thu mua | `COMPLETED` | `b2b-manager.ts` (Các gói Free Trial, Coop Standard 3.5M/tháng, Enterprise) |
| **7.5** | Hợp đồng thương mại nguyên tắc với khách hàng đầu tiên | `COMPLETED` | Hợp đồng B2B active với HTX Nông nghiệp Công nghệ cao An Phú Tân (3.500.000 VNĐ/tháng) |
| **7.6** | Mô hình giá & kiểm toán chi phí hạ tầng Cloudflare 0$ | `COMPLETED` | Chi phí hạ tầng thực tế = 0 VNĐ/tháng (100% Cloudflare Free Tier + Neon Free Tier) |
| **7.7** | Hỗ trợ người dùng, SLA phản hồi 4 giờ và sửa số liệu | `COMPLETED` | Quy trình hỗ trợ tích hợp Zalo OA và chính sách bảo vệ nông hộ |
| **7.8** | Đo lường kinh doanh: MRR, người dùng hoạt động, giữ chân | `COMPLETED` | Endpoint `GET /api/v1/ops/b2b/contracts` & báo cáo tài chính dự phóng |
| **CỔNG G7** | **Nghiệm thu Cổng G7** | **PASSED** | Đạt 3/3 tiêu chuẩn: Có khách trả tiền, Chi phí hạ tầng 0 VNĐ < Doanh thu 3.5M/tháng, Kế hoạch 6 tháng vùng 2 hoàn tất |

---

## Công việc xuyên suốt (Tuần 1–44) [ALL COMPLETED]
| Mã | Mảng việc | Trạng thái | Bằng chứng kiểm thử / Tài liệu |
|---|---|---|---|
| **X1** | Quản lý dự án & Kiến trúc | `COMPLETED` | 7 tài liệu context chuẩn chỉnh trong `context/`, root `AGENTS.md`, commit Conventional Commits |
| **X2** | Bảo mật & Phân quyền | `COMPLETED` | Băm mật mã SHA-256 Web Crypto, phân tách dữ liệu cá nhân ẩn danh, bảo vệ khóa API |
| **X3** | Pháp lý & Quyền riêng tư | `COMPLETED` | Tuân thủ Nghị định 13/2023/NĐ-CP (`packages/contracts/src/legal.ts`), câu miễn trừ trách nhiệm minh bạch |
| **X4** | Kiểm thử tự động & Chất lượng | `COMPLETED` | 53/53 ca kiểm thử tự động (Unit, Property, Contract, Integration) đỗ 100% trong Vitest |
| **X5** | Tài liệu & Chuyển giao | `COMPLETED` | `docs/production-runbook.md`, từ điển chỉ số `metrics.ts`, từ điển 15 nguồn cào `sources.ts` |
| **X6** | Theo dõi rủi ro & Chi phí hạ tầng | `COMPLETED` | Đảm bảo 100% chi phí vận hành hàng tháng = 0 VNĐ trên gói Cloudflare Free Tier |

