# Địa Giới — bản mô phỏng 01

Trang tĩnh có thể đưa nguyên thư mục lên GitHub Pages. Mở `index.html` qua máy chủ HTTP (ES modules không chạy ổn định qua `file://`). Không cần build hoặc máy chủ ứng dụng.

## Đang chơi được

- Sinh địa hình và các cộng đồng từ một hạt giống; cùng hạt giống và cùng chuỗi quyết định cho cùng lịch sử.
- Mỗi năm cập nhật mưa, nước, sản lượng, kho lương, dân số, rừng, đất, dịch, tri thức, tài sản, di cư và xung đột.
- 13 can thiệp ở cấp vùng hoặc toàn hành tinh; tác động lập tức và tác động dây chuyền đều được ghi lại.
- Chọn vùng trên bản đồ hoặc trong danh sách; xem biến số và nguyên nhân của kết quả năm gần nhất.
- Tự lưu trong trình duyệt; xuất/nhập tệp JSON để mang lịch sử sang thiết bị khác.

## Ranh giới của mô hình

Thế giới bắt đầu tại một trạng thái có cộng đồng; không giả vờ mô phỏng hư vô hay giải thích khởi nguyên thật. Các số và quy tắc của `engine.mjs` là giả định thiết kế, không phải hằng số đo của Trái Đất. Các cộng đồng là đơn vị gộp; mô hình chưa mô phỏng từng cá thể, chính thể hay sinh học tiến hóa. Bản thử nghiệm nhằm kiểm tra liệu can thiệp có hậu quả nhất quán, truy ngược được và khác nhau qua thời gian.

Nền nghiên cứu và các giả định chưa khóa nằm trong [`docs/khoi-dau.md`](docs/khoi-dau.md) và [`docs/thoi-gian-nhan-qua.md`](docs/thoi-gian-nhan-qua.md).

## Kiểm tra tại máy

```sh
python3 -m http.server 8000
```

Truy cập `http://localhost:8000/other-earth/` nếu khởi chạy từ thư mục cha. Kiểm thử quy luật với `node --test other-earth/engine.test.mjs`.

## GitHub Pages

Đưa bốn tệp `index.html`, `style.css`, `app.mjs`, `engine.mjs` lên gốc một repository mới. Trong **Settings → Pages**, chọn nguồn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`. Không cần chuyển nội dung sang một dịch vụ khác. Muốn giữ README và kiểm thử, đưa cả thư mục dự án làm gốc repository.
