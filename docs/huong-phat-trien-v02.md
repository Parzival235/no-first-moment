# Hướng phát triển Địa Giới — nghiên cứu khởi động 0.2

**04/11/2026.** Tài liệu này xuất phát từ mã của bản đang chạy, các phép thử lặp nhiều hạt giống, và nghiên cứu về mô phỏng tác nhân. Nó là một chương trình kiểm chứng, chưa phải lời hứa rằng thêm nhiều biến sẽ tự sinh ra một thế giới đáng tin.

## 1. Mục đích cần khóa trước khi thêm tính năng

Một câu hỏi đủ cụ thể cho phiên bản kế tiếp: **Từ các quy tắc về nước, thức ăn, sinh kế và quyết định của cộng đồng, thế giới có thể tự sinh ra sự hình thành, di chuyển, hợp tác, chia tách và tan rã của các khu cư trú; người chơi có thể lần ngược nguyên nhân của một biến cố không?**

Đây là một mô hình giả tưởng để khám phá cơ chế và hậu quả, không phải dự báo lịch sử Trái Đất. ODD yêu cầu nói rõ mục đích, thực thể, biến trạng thái, thang thời gian, thứ tự cập nhật và các mẫu dùng để đánh giá mô hình. Không thể thay mục đích cụ thể bằng câu “thế giới sống động”. [Grimm và cộng sự, 2020](https://www.jasss.org/23/2/7.html).

**Giới hạn bản thể:** năm 0 là lúc hồ sơ quan sát bắt đầu. Cộng đồng, luật và địa hình có sẵn. Cơ chế trò chơi không khẳng định vũ trụ thật có khoảnh khắc đầu hay đã xuất hiện từ hư vô. Cần giữ riêng ba việc: điều thế giới làm, điều người quan sát biết, và cách giao diện cho phép người chơi tác động. Xem [hồ sơ khởi đầu](./khoi-dau.md) và [thời gian, nhân quả](./thoi-gian-nhan-qua.md).

## 2. Kiểm toán bản 01

Mã hiện tại: `engine.mjs` tính từng năm cho khoảng 17–22 vùng cố định trên bản đồ 36 × 24 ô; `app.mjs` vẽ bản đồ, lịch sử, 13 can thiệp và hai nhánh so sánh. Mỗi vùng là một khối số gộp. Bản đồ và danh sách vùng được tạo lúc bắt đầu; không có quy tắc sinh một khu cư trú mới, tách cộng đồng hoặc dựng quan hệ xã hội mới.

### Thử nghiệm lặp

- **Không can thiệp:** chạy hạt giống 1–100, lấy trạng thái năm 0, 25, 100, 300. Tại năm 300, cả 100 lượt vẫn giữ đúng số cộng đồng có lúc đầu (17–22); trung vị theo thứ tự mẫu là 20. Dân số toàn thế giới ở năm 300 nằm trong khoảng 965,6–1446,5 nghìn, phần tử thứ 50 là 1157,5 nghìn. Số sự kiện mất mùa ở năm 300 nằm trong khoảng 73–179, phần tử thứ 50 là 125. **Kết luận giới hạn:** trong mẫu này hệ dễ đi tới dao động thiếu lương của những cộng đồng đã định sẵn; mẫu không chứng minh không bao giờ có tan rã với mọi hạt giống và mọi can thiệp.
- **Một can thiệp ở năm 10:** với hạt giống 1–50, chọn vùng đầu tiên, so sánh một hành động với nhánh giữ nguyên tại năm 20. Chênh lệch dân số thế giới bằng 0 (theo độ chính xác 0,1 nghìn người) ở cả 50 lượt đối với `rain`, `forest`, `granary`, `school`, `treaty`. Điều đó **không** có nghĩa các hành động vô hiệu: `school` tăng tri thức vùng trung bình 3,8 điểm; `granary` trừ của cải 14; `rain` có ảnh hưởng ngắn hạn. Nó cho thấy chỉ số dân số và chân trời 10 năm che nhiều hậu quả, và nhiều cơ chế hiện chưa đủ sức tạo phân kỳ xã hội.
- **Chi phí có thể bằng không:** đặt tài sản vùng bằng 0 rồi dựng hai trạm y vẫn được `clinic = 2`, `wealth = 0`, vì chi phí dùng `max(0, wealth - cost)`. Đây là một lựa chọn thiết kế chưa được giải thích: người quan sát toàn năng có thể tạo tài nguyên, hay vùng phải thực sự trả giá?
- **Cạnh địa lý:** mạng láng giềng được nối theo ô vùng sát nhau, không kiểm tra dải đất tiếp giáp. Trong 100 thế giới, 27/2952 cạnh vùng (khoảng 0,9%) không có hai ô đất chạm nhau qua biên. Đập còn giả định “hạ lưu” là ô vùng ngay phía nam, dù chưa có mạng sông.
- **Nhân quả của nhánh xem trước:** một bộ `world.rng` cấp số theo thứ tự gọi cho cả mô hình. Số lần rút ngẫu nhiên ở nhánh xung đột có điều kiện; khi hai nhánh lệch, thời tiết những năm sau có thể nhận số khác nhau. Ví dụ hạt giống 1: dựng đập sau năm 100, tới năm 120 lượng mưa ghi ở Sêra (vùng xa) là 0,66 thay vì 0,68 ở nhánh giữ nguyên. Không có quy tắc thời tiết nối đập với Sêra. **Chưa thể gán mọi chênh lệch của bản xem trước cho chính can thiệp.**

Các phép đo trên có thể tái lập bằng `makeWorld`, `advance`, `intervene`, `totals` trong `engine.mjs`; hạt giống, năm và vùng chọn đã nêu rõ để tránh biến ví dụ thành khẳng định phổ quát.

## 3. Bài học từ mô hình có liên quan

| Nguồn | Điều thực sự làm | Áp dụng có giới hạn |
|---|---|---|
| [Epstein–Axtell, *Growing Artificial Societies* (1996)](https://www.brookings.edu/books/growing-artificial-societies/) | Tác nhân tìm tài nguyên, tiêu hao, sinh sản, di chuyển; tương tác địa phương có thể tạo phân bố của cải, nhóm và lịch sử. | Khởi từ ít quy tắc địa phương có tương tác; không sao chép các kết quả Sugarscape như quy luật về người thật. |
| [Heckbert, *MayaSim* (2013)](https://www.jasss.org/16/4/11.html) | Kết hợp khu cư trú, ô sinh thái và mạng giao thương; nhịp biến đổi của đất, dân số, khí hậu khác nhau. Chính tác giả coi đây là mô hình cần hiệu chỉnh thêm. | Dùng kiến trúc ba lớp: đất/nước → quyết định khu cư trú → mạng quan hệ. Không mượn thông số Maya cho hành tinh hư cấu. |
| [Grimm và cộng sự, ODD (2020)](https://www.jasss.org/23/2/7.html) | Mô tả mục đích, thực thể, quy trình, khởi tạo và các mẫu dùng đánh giá. | Viết quy tắc đủ rõ để người khác có thể tái lập. |
| [Collins và cộng sự, kiểm định ABM (2024)](https://www.jasss.org/27/1/11.html) | Kiểm định là xem mô hình phù hợp **mục đích đã nêu** đến đâu; không có một phép thử vạn năng. | Tách kiểm tra đúng mã, phù hợp cơ chế và trải nghiệm người chơi. |
| [Thiele và cộng sự, phân tích độ nhạy (2014)](https://www.jasss.org/17/3/11.html) và [roadmap 2020](https://www.jasss.org/23/1/6.html) | Thay tham số, thử nhiều hạt giống để biết cơ chế nào thực sự lái kết quả và kết quả có bền không. | Không chọn vài ảnh đẹp làm bằng chứng rằng mô hình có chiều sâu. |
| [Park và cộng sự, *Generative Agents* (2023)](https://doi.org/10.1145/3586183.3606763) | 25 tác nhân dùng trí nhớ, suy ngẫm và kế hoạch tạo hành vi có vẻ đáng tin trong một thị trấn nhỏ. | Có thể học cách trình bày ký ức/động cơ về sau. Không cần LLM để quyết định nước, lương, sinh tử; tính có vẻ người không tự chứng minh tính đúng nhân quả. |

## 4. Kiến trúc ứng viên: một lát cắt có thể kiểm chứng

**Không mô phỏng từng người ngay.** Mỗi khu cư trú là một tác nhân có nhu cầu, kho, khả năng quan sát và quy tắc chọn hành động. Dân số có thể phân thành vài nhóm sinh kế/tuổi nếu cơ chế cần. Ô đất giữ nước, độ phì, rừng và sản lượng; mạng giữ đường đi, sông, trao đổi và thông tin. Đây là quyết định phạm vi để giữ được kiểm thử trên điện thoại, không phải khẳng định cá nhân không quan trọng.

| Lớp | Trạng thái tối thiểu | Quy tắc cần có | Dấu vết kiểm tra |
|---|---|---|---|
| Đất và nước | Mưa, trữ nước, dòng chảy, đất, rừng, sinh khối | Nước chảy theo mạng địa hình; khai thác, tái tạo và chậm thoái hóa | Tổng nước/tài nguyên theo quy ước; đập tác động đúng lưu vực |
| Khu cư trú | Người, kho, sinh kế, sức khỏe, tri thức, nơi ở | Chọn phân bổ lao động, dự trữ, thích nghi, đi/ở theo thông tin có được | Có quyết định tự phát khi người chơi đứng yên |
| Quan hệ | Trao đổi, tin cậy, hiệp ước, đường, tin tức | Giao thương, tiếp nhận người, cạnh tranh; quan hệ có thể sinh và đứt | Mạng thay đổi và sự kiện có tác nhân, lý do |
| Người quan sát | Phạm vi thấy, lịch sử, can thiệp, giả định | Chọn nhìn, hỏi “vì sao”, so sánh nhánh, sửa một điều kiện trong quyền đã định | Có thể truy nguyên hệ quả; không đánh tráo dự báo với sự thật |

**Thứ tự một năm:** tạo ngoại sinh (thời tiết) → truyền nước → sản xuất và tiêu thụ → mỗi khu cư trú chọn hành động từ trạng thái đã chụp → giải quyết trao đổi/di cư/xung đột đồng thời → sinh/tử, đất và quan hệ cập nhật → ghi sự kiện và bất biến. Cần quy định rõ bước nào dùng số liệu cũ, bước nào dùng số liệu mới; nếu không thứ tự duyệt mảng sẽ quyết định ai được ăn hoặc di cư trước.

**Ngẫu nhiên độc lập theo nguồn:** tạo dòng ngẫu nhiên xác định từ `seed + năm + thực thể + quá trình` (hoặc các dòng tách biệt có lịch cố định) cho thời tiết, dịch và kết quả xung đột. Hai nhánh cùng năm phải nhận cùng ngoại sinh; sự khác nhau do can thiệp và phản ứng nội sinh mới được ghi là hệ quả. Một nhánh có thể thay đổi xác suất chiến tranh, nhưng không được vô cớ đổi cơn mưa ở lục địa khác vì đã rút thêm một số.

**Lịch sử là dữ liệu có cấu trúc:** sự kiện gồm tác nhân, địa điểm, năm, biến đổi, các sự kiện/điều kiện tiền đề và mức chắc chắn của lời giải thích. Một dòng văn bản chỉ được sinh từ dữ liệu này. Không nên gán một nguyên nhân độc nhất nếu kết quả phụ thuộc nhiều điều kiện. Bản lưu cần `schemaVersion` và đường nâng cấp từ v1; không làm mất lịch sử cũ của người chơi.

## 5. Những phép thử phải qua trước khi gọi là “thế giới hoạt động”

1. **Tự vận hành:** 100–1000 hạt giống không can thiệp, đo phân bố biến cố qua 300 năm; có khu cư trú mới, di chuyển, tan rã và mạng thay đổi ở một phần đáng kể lượt chạy; không ép một tỷ lệ chỉ để đạt bài kiểm tra.
2. **Cân bằng và thứ tự:** dân, lương, nước không tự nhân đôi qua di cư/giao thương; đổi thứ tự lưu tác nhân không đổi kết quả nếu quy tắc đã tuyên bố đồng thời.
3. **Phản thực:** cùng ngoại sinh cho nhánh giữ nguyên và nhánh can thiệp; thay đập ở Aru không tự đổi mưa ở Sêra. Phân biệt chênh lệch do can thiệp với độ nhạy ngẫu nhiên còn lại.
4. **Độ nhạy:** biến đổi các tham số trọng yếu trong dải có lý do; đo kết quả ở nhiều hạt giống. Nếu mọi tham số đều không quan trọng, hệ quá cứng; nếu một thay đổi rất nhỏ phá mọi lịch sử, phải công bố độ nhạy ấy.
5. **Khả năng chơi:** người chơi tìm được một biến cố, đọc lý do, chọn một can thiệp, rồi thấy hệ quả gần/xa và tác dụng phụ. Quan sát thử người chơi thật thay vì đo số nút bấm.
6. **Hiệu năng:** mô phỏng chạy ở luồng nền khi số tác nhân tăng; lưu lịch sử lớn bằng IndexedDB thay cho một chuỗi JSON lớn trong localStorage. Web Workers và IndexedDB đều có hỗ trợ cho các việc này; đo trên thiết bị mục tiêu trước khi tối ưu. [MDN Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers); [MDN IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

## 6. Thứ tự phát triển đề nghị

**Chặng A — sửa nền nhân quả.** Tách dòng ngẫu nhiên, viết phép thử phản thực; khai báo đơn vị, bất biến, lưu phiên bản; sửa mạng sông và cạnh láng giềng. Giữ nguyên giao diện và dữ liệu v1 bằng chuyển đổi có kiểm thử.

**Chặng B — xã hội tự vận hành ở quy mô nhỏ.** Chỉ 4–8 khu cư trú trên một lưu vực; cho lựa chọn trồng, tích trữ, đổi hàng, di cư, dựng khu mới; vùng có thể hình thành và tan. Cho chúng chạy không cần người chơi. Khi cơ chế này có biến cố hiểu được mới mở rộng ra toàn bản đồ.

**Chặng C — lịch sử có thể điều tra.** Nhật ký quan hệ, một màn hình “vì sao”, các nhánh so sánh cùng ngoại sinh; hiển thị chi phí, điều chưa biết và hệ quả đối với vùng khác. Trả cho người quan sát quyền nhìn sâu, không biến quyền can thiệp thành nút thưởng vô giá.

**Chặng D — mở rộng theo bằng chứng.** Đưa mô phỏng sang Worker, lưu bằng IndexedDB, thêm sinh thái dài hạn và thể chế nếu các quy tắc hiện có tạo được lịch sử khác nhau qua thử nghiệm. Sau đó mới cân nhắc cá thể, ngôn ngữ, văn hóa, vũ trụ khác hoặc một tầng luật cho phép người chơi chỉnh quy tắc.

**Để sau:** đồ họa 3D, hàng triệu tác nhân, LLM cho mọi nhân vật, hàng trăm nút can thiệp, mô hình “trước khi có gì”. Chúng làm tăng bề mặt hiển thị và chi phí trước khi giải được vấn đề nhân quả của bản hiện tại.

## 7. Ba quyết định thiết kế còn mở

- **Người chơi là ai?** Người quan sát với giao diện ngoài hư cấu, chủ thể trong vũ trụ, hay tác nhân ở tầng ngoài? Mỗi cách tạo giới hạn thông tin và quyền tác động khác nhau. Bản 01 mới dùng quy ước giao diện ngoài hư cấu.
- **Can thiệp lấy gì làm giá?** Nếu quyền năng vô hạn, giá có thể là hậu quả không lường hết chứ không nhất thiết là “điểm năng lượng”. Nếu can thiệp qua xã hội, phải có vật liệu, lao động, tài sản và sự đồng thuận. Không dùng `max(0, chi phí)` để giả vờ đã trả giá.
- **Thế giới nào?** Một Earth khác có thể dựa vào quy luật vật lý/sinh thái quen thuộc với các giả định công bố. Vũ trụ khác thật sự phải chọn các quy luật nền khác và chấp nhận rằng nhiều khái niệm như “năm”, “người” hoặc “nước” có thể không áp dụng. Chưa nên coi đổi tên địa hình là đã tạo một vũ trụ khác.
