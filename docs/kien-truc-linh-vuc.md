# Ranh giới hệ thống để mở rộng Địa Giới

**Bản 0.1 — 04/11/2026.** Đây là hợp đồng thiết kế, không phải tuyên bố các lĩnh vực dưới đây đã được mô phỏng. Bản hiện tại có `systems/random.mjs`, `systems/geography.mjs`, `systems/settlements.mjs`; `engine.mjs` vẫn điều phối khí hậu, sản lượng, dịch, dân số và xung đột. Việc tách những hệ tiếp theo chỉ nên làm khi quy luật và phép thử tương ứng đã rõ.

## Một lát cắt đi qua nhiều lĩnh vực

Ví dụ: mưa ít → nước trên mạng hạ lưu giảm → thu hoạch thấp → kho lương giảm → một cộng đồng chọn tăng canh tác → đất bị khai thác → người di cư → cộng đồng đích nhận người và thay sinh kế. Mỗi mũi tên phải có biến đầu vào, quy tắc cập nhật, khoảng thời gian và một phép thử phản thực. Sự kiện văn bản được ghi sau khi trạng thái đổi, không được tạo trước rồi bắt các con số phục vụ câu chuyện.

| Lĩnh vực tương lai | Đơn vị/nhịp dự kiến | Đầu vào phải khai báo | Đầu ra có thể kiểm tra |
|---|---|---|---|
| Địa hình, nước, khí hậu | Ô đất / mùa hoặc năm | Độ cao, mưa, trữ nước | Dòng nước, hạn, ngập; bảo toàn theo quy ước |
| Sinh thái, đất, cây trồng | Ô đất / năm và nhiều thập kỷ | Nước, đất, khai thác | Sinh khối, độ phì, lương thực |
| Dân số, sức khỏe | Khu cư trú; sau này nhóm tuổi / năm | Lương, dịch, di cư | Sinh, chết, sức khỏe, phân bố người |
| Kinh tế và mạng trao đổi | Khu cư trú, đường đi / năm | Dư thiếu, lao động, hàng, tài sản | Luồng hàng và tài sản có nguồn nhận |
| Thể chế, luật, xung đột | Quan hệ giữa nhóm / nhiều năm | Nguồn lực, lợi ích, ký ức, quyền lực | Quyết định, hiệp ước, tranh chấp, thay đổi luật |
| Tri thức, ngôn ngữ, văn hóa | Nhóm và quan hệ truyền tin / nhiều thế hệ | Tiếp xúc, giáo dục, ký ức | Kỹ thuật, tập quán hoặc phân nhánh có cơ chế truyền |
| Người quan sát | Giao diện và lịch sử / theo hành động | Tín hiệu được phép thấy, nhánh mô phỏng | Giải thích có giới hạn, can thiệp và hệ quả |

Không thêm một biến chỉ vì tên lĩnh vực hấp dẫn. Chẳng hạn “văn hóa = 68%” không nói văn hóa được truyền, sai khác và thay đổi thế nào. Muốn đưa lĩnh vực vào lõi, phải có ít nhất một cơ chế tương tác với hệ khác và một biểu hiện mà người chơi có thể quan sát.

## Hợp đồng khi thêm một hệ mới

1. **Mục đích:** câu hỏi nào hệ này giúp trả lời? Điều gì trong bản hiện tại không thể xảy ra nếu thiếu nó?
2. **Chủ sở hữu trạng thái:** trường nào do hệ này cập nhật; đơn vị và giới hạn hợp lệ. Hệ khác đọc qua một ảnh trạng thái hoặc một giao dịch đã định nghĩa.
3. **Thời điểm:** cập nhật trước/sau hệ nào; cùng một năm dùng trạng thái cũ hay mới. Sự phụ thuộc vòng cần chia thành các pha rõ ràng.
4. **Ngẫu nhiên:** mỗi sự kiện ngoại sinh dùng khóa riêng gồm hạt giống, năm, thực thể, quá trình. Không dựa vào số lần rút của hệ khác.
5. **Bảo toàn và phản thực:** trao đổi người, hàng hoặc nước không tự sinh lượng mới; hai nhánh cùng ngoại sinh để đo tác động của một can thiệp.
6. **Lưu trữ:** thêm phiên bản dữ liệu và phép chuyển đổi giữ bản lưu cũ. Dấu vết sự kiện ghi tác nhân, nơi, lúc và các điều kiện liên quan.
7. **Độ nhạy:** chạy nhiều hạt giống và thay tham số; chỉ giữ quy luật tạo được kết quả có thể giải thích, không chỉ một kịch bản đẹp.

## Ranh giới của bản đang chạy

- `systems/random.mjs` cấp số có địa chỉ cho từng năm, vùng và quá trình. Nó đảm bảo cùng ngoại sinh cho hai nhánh; không bảo đảm hai lịch sử sẽ giống nhau nếu quyết định nội sinh đã khác.
- `systems/geography.mjs` nối vùng có đất chạm biên và chọn một cạnh xuống dốc. Đây là đồ thị nước sơ khởi, chưa có sông hay lưu lượng bảo toàn.
- `systems/settlements.mjs` cho cộng đồng chọn sinh kế, chuyển lương và lập khu cư trú. Quy tắc hiện ở cấp nhóm gộp; không suy ra hành vi của từng người.
- `engine.mjs` điều phối một năm và xử lý bản lưu v1 → v2. Trong các bản sau nên tách thêm sản xuất, dịch, dân số khi đã có kiểm thử chéo giữa hệ.

**Ưu tiên sau bản này:** giải thích được vì sao một cộng đồng chọn hành động ở một năm cụ thể; lưu quan hệ và dòng hàng thành dữ liệu có cấu trúc; thay đồ thị dốc giản lược bằng nước có nguồn, dòng và giới hạn. Sau đó mới chọn lĩnh vực kế tiếp theo điều nó cho phép thế giới làm, chứ không theo danh sách chủ đề.
