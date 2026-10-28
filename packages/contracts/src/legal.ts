/**
 * Điều khoản pháp lý và câu miễn trừ trách nhiệm (Mã 5.9 & Cổng G5)
 * Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
 */

export interface LegalDisclaimer {
  version: string;
  effectiveDate: string;
  shortDisclaimerText: string;
  fullDisclaimerMarkdown: string;
  consentStatement: string;
}

export const LEGAL_DISCLAIMER: LegalDisclaimer = {
  version: '2026.1',
  effectiveDate: '2026-10-28',
  shortDisclaimerText:
    'Khuyến nghị mang tính chất tham khảo dựa trên phân tích xác suất chuỗi giá và nguồn cung vùng. Nền tảng không cam kết chắc chắn lợi nhuận.',
  fullDisclaimerMarkdown: `
### Câu Miễn Trừ Trách Nhiệm Pháp Lý
1. **Bản chất của thông tin**: Các dự báo giá, phân tích cung cầu và nhãn khuyến nghị ("Nên trồng", "Cân nhắc", "Chưa nên") được tính toán bằng các mô hình thống kê và dữ liệu lịch sử. Nông nghiệp phụ thuộc vào nhiều yếu tố bất khả kháng (thời tiết cực đoan, dịch bệnh đột xuất, biến động thị trường quốc tế).
2. **Quyền quyết định cuối cùng**: Nông hộ và hợp tác xã hoàn toàn giữ quyền tự chủ và chịu trách nhiệm đối với quyết định xuống giống, đầu tư chi phí và bán nông sản của mình.
3. **Bảo vệ dữ liệu cá nhân**: Mọi số liệu sổ sách chi phí và diện tích do bà con cung cấp chỉ được sử dụng ở dạng ẩn danh để cải tiến mô hình điều hòa nguồn cung, không chuyển giao cho bên thứ ba vì mục đích thương mại theo đúng tinh thần Nghị định 13/2023/NĐ-CP.
  `.trim(),
  consentStatement:
    'Tôi đã đọc, hiểu rõ câu miễn trừ trách nhiệm và tự nguyện chia sẻ số liệu nhật ký sản xuất ẩn danh.',
};
