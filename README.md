# Địa Giới — bản mô phỏng 02

Trang tĩnh có thể đưa nguyên thư mục lên GitHub Pages. Mở `index.html` qua máy chủ HTTP (ES modules không chạy ổn định qua `file://`). Không cần build hoặc máy chủ ứng dụng.

## Đang chơi được

- Sinh địa hình và các cộng đồng từ một hạt giống; cùng hạt giống và cùng chuỗi quyết định cho cùng lịch sử.
- Mỗi năm cập nhật mưa, nước, sản lượng, kho lương, dân số, rừng, đất, dịch, tri thức, tài sản, di cư và xung đột.
- 13 can thiệp ở cấp vùng hoặc toàn hành tinh; tác động lập tức và tác động dây chuyền đều được ghi lại.
- Cộng đồng tự chọn canh tác, dự trữ, phục hồi hoặc trao đổi; có thể mang người và lương tới một vùng chưa định cư. Mạng láng giềng theo đất tiếp giáp; nước hạ lưu theo độ cao vùng.
- Hai nhánh xem trước dùng cùng ngoại sinh theo năm, vùng và quá trình. Một biến cố phát sinh ở nhánh này không làm lệch bộ số thời tiết của nhánh kia.
- Chọn vùng trên bản đồ hoặc trong danh sách; xem biến số và nguyên nhân của kết quả năm gần nhất.
- Tự lưu trong trình duyệt; xuất/nhập tệp JSON để mang lịch sử sang thiết bị khác. Tệp bản 01 được nâng cấp, giữ năm và sự kiện cũ.

## Ranh giới của mô hình

Thế giới bắt đầu tại một trạng thái có tám cộng đồng; không giả vờ mô phỏng hư vô hay giải thích khởi nguyên thật. Các số và quy tắc là giả định thiết kế, không phải hằng số đo của Trái Đất. Các cộng đồng là đơn vị gộp; mô hình chưa mô phỏng từng cá thể, chính thể hay sinh học tiến hóa. Nước mới đi theo một mạng dốc giữa các vùng, chưa phải mô hình thủy văn bảo toàn lưu lượng. Phần so sánh nhánh chỉ giữ ngoại sinh chung, vẫn có thể phân kỳ nội sinh qua hành động của cộng đồng.

Nền nghiên cứu và các giả định chưa khóa nằm trong [`docs/khoi-dau.md`](docs/khoi-dau.md), [`docs/thoi-gian-nhan-qua.md`](docs/thoi-gian-nhan-qua.md), [kiểm toán và lộ trình v2](docs/huong-phat-trien-v02.md), cùng [ranh giới các lĩnh vực](docs/kien-truc-linh-vuc.md).

## Kiểm tra tại máy

```sh
python3 -m http.server 8000
```

Truy cập `http://localhost:8000/other-earth/` nếu khởi chạy từ thư mục cha. Kiểm thử quy luật với `node --test other-earth/engine.test.mjs`.

## GitHub Pages

Repository `Parzival235/no-first-moment` đã phát hành trên GitHub Pages từ nhánh `main`. Giữ nguyên thư mục `systems/` bên cạnh `engine.mjs` khi triển khai; các tệp là ES modules và không cần bước build.
