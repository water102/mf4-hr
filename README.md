# HỆ THỐNG QUẢN LÝ NHÂN SỰ CÔNG TY CỔ PHẦN MF14 (HRM MF14)

Hệ thống Quản trị Nhân sự kết nối trực tiếp với **Google Sheets** và **Google Drive**.

## 📌 Thông tin kết nối:
- **Google Sheet ID:** `1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I`
- **Google Drive Folder ID (Lưu trữ hợp đồng):** `1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1`

---

## 🚀 Cách mở và chạy phần mềm ngay lập tức:

Bạn có thể mở trực tiếp file `index.html` bằng trình duyệt web (Chrome, Edge, Cốc Cốc) hoặc chạy qua máy chủ web nội bộ:

```bash
# Cách 1: Mở trực tiếp trên Windows
start index.html

# Cách 2: Khởi động máy chủ web cục bộ
npx serve .
# Hoặc: python -m http.server 8765
```

---

## ⚡ Tự động khởi tạo dữ liệu vào Google Sheet (One-Click Setup)

Để bảng Google Sheet của bạn tự động có đủ 6 tab chuẩn hóa (`Nhan_Vien`, `Phong_Ban`, `Hop_Dong`, `Cham_Cong`, `Nghi_Phep`, `Bang_Luong`):

1. Mở file Google Sheet của bạn: [Link Sheet](https://docs.google.com/spreadsheets/d/1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I/edit?usp=sharing)
2. Trên thanh menu, chọn: **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
3. Mở file `google-apps-script.js` trong thư mục dự án này, copy toàn bộ nội dung và dán vào Apps Script.
4. Bấm **Triển khai (Deploy)** ➔ **Tùy chọn triển khai mới (New deployment)**:
   - Loại: **Ứng dụng web (Web app)**
   - Thực thi dưới dạng: **Tôi (Me)** *(Giúp giữ quyền riêng tư, không cần public editable)*
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
5. Bấm **Triển khai** và sao chép đường link Web App URL.
6. Mở trang web, vào mục **"Kết nối Google Sheets & Drive"** (`#setup`), dán link vào và bấm **"🚀 Tự động khởi tạo dữ liệu"**. Toàn bộ cấu trúc sheet sẽ được tạo tự động chỉ sau 2 giây!
