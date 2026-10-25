/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ NHÂN SỰ CÔNG TY CỔ PHẦN MF14
 * Google Sheet ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Google Drive Folder ID: 1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1 (Lưu hợp đồng)
 * =========================================================================
 * 
 * HƯỚNG DẪN ĐỒNG BỘ DATA VÀO GOOGLE SHEET & DRIVE TRONG 30 GIÂY:
 * 1. Mở file Google Sheet: https://docs.google.com/spreadsheets/d/1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I/edit
 * 2. Menu: "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa code cũ, dán toàn bộ file này vào và bấm "Lưu" (Ctrl + S)
 * 4. Trên thanh công cụ, ô chọn hàm, chọn hàm: importAllMF14Data
 * 5. Bấm nút "Chạy" (Run) -> Cấp quyền 1 lần.
 *    => TẤT CẢ DỮ LIỆU CŨ SẼ ĐƯỢC XÓA SẠCH VÀ NẠP MỚI 100% TỪ 17 FILE EXCEL!
 * 6. Triển khai Web App (Deploy as Web app) để kích hoạt đồng bộ 2 chiều realtime!
 */

const SPREADSHEET_ID = "1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I";
const FOLDER_DRIVE_ID = "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1";

// DỮ LIỆU NHÂN SỰ 100% TỪ 17 FILE EXCEL BẢNG LƯƠNG
const EMPLOYEES_DATA = [
  {
    "id": "MS01",
    "name": "Trần Thị Ngọc Diệp",
    "dept": "HO",
    "position": "Chủ tịch HĐQT",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 33333333.0,
      "net": 30000000.0,
      "bhxhBase": 0,
      "bhxh105": 0.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 1000000.0,
        "phone": 4500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "5550909999",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS01/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Nghỉ việc/Tạm hoãn",
    "activeMonths": [
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026"
    ]
  },
  {
    "id": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "Ban giám hiệu",
    "position": "Hiệu trưởng ̣(kiêm nhiệm)",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 16666667.0,
      "net": 15000000.0,
      "bhxhBase": 0,
      "bhxh105": 0.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 2500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1978555558",
      "bankName": "ACB",
      "branch": ""
    },
    "contract": {
      "number": "MS02/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "12.2025",
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "Ban giám hiệu",
    "position": "Hiệu phó cơ sở",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 17000000.0,
      "net": 5000000.0,
      "bhxhBase": 7500000.0,
      "bhxh105": 787500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 1650000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "9000999996969",
      "bankName": "MB Bank",
      "branch": ""
    },
    "contract": {
      "number": "MS03/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "11.2025",
      "12.2025",
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "position": "Trưởng phòng vận hành",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 16000000.0,
      "net": 10829900.0,
      "bhxhBase": 7500000.0,
      "bhxh105": 787500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 1500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19035531863010",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS04/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "10.2025",
      "11.2025",
      "12.2025",
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS05",
    "name": "Hoàng Thị Hoa",
    "dept": "Ban giám hiệu",
    "position": "Hiệu phó cơ sở",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 21224000.0,
      "net": 16236400.0,
      "bhxhBase": 8000000.0,
      "bhxh105": 840000.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 1924000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19033454405011",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS05/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "12.2025",
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "position": "Giáo viên nước ngoài",
    "gender": "Nam",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 49826650.0,
      "net": 20368300.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 900000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1045887952",
      "bankName": "Vietcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS06/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "12.2025",
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9577500.0,
      "net": 6917900.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1033638061",
      "bankName": "Vietcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS07/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS08",
    "name": "Hoàng Thị Hương Li",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9000000.0,
      "net": 2045500.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19036055792017",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS08/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "Ban giám hiệu",
    "position": "Quản lý chương trình TA",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 8888889.0,
      "net": 8000000.0,
      "bhxhBase": 0,
      "bhxh105": 0.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 2000000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1991555558",
      "bankName": "ACB",
      "branch": ""
    },
    "contract": {
      "number": "MS09/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "01.2026",
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS10",
    "name": "Bùi Thị Thương",
    "dept": "Giáo viên",
    "position": "Giáo viên TA VN",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 13000000.0,
      "net": 4475300.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19033134293019",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS10/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "02.2026",
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9577500.0,
      "net": 9000000.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0563250894",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS11/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "position": "HK",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 7556500.0,
      "net": 7000000.0,
      "bhxhBase": 5300000.0,
      "bhxh105": 556500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 400000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19032824127018",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS12/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "position": "Bảo vệ",
    "gender": "Nam",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 10556500.0,
      "net": 10000000.0,
      "bhxhBase": 5300000.0,
      "bhxh105": 556500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 400000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "9904677976",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS13/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "position": "Y tế",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 13577500.0,
      "net": 13000000.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1036236348",
      "bankName": "VCB",
      "branch": ""
    },
    "contract": {
      "number": "MS14/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS15",
    "name": "Nguyễn Thị Thuỳ Trang",
    "dept": "Vận hành",
    "position": "Vận hành",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9577500.0,
      "net": 5397800.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0374624154",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS15/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "03.2026",
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS16",
    "name": "Phạm Thị Hương Thuỷ",
    "dept": "Vận hành",
    "position": "Kế toán",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 13000000.0,
      "net": 7758300.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0906951113",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS16/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9077500.0,
      "net": 9077500.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0984903219",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS17/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9577500.0,
      "net": 7911600.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "8862965558",
      "bankName": "BIDV",
      "branch": ""
    },
    "contract": {
      "number": "MS18/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS19",
    "name": "Bác Hạnh",
    "dept": "Vận hành",
    "position": "NV Bếp",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9000000.0,
      "net": 10500000.0,
      "bhxhBase": 0,
      "bhxh105": 0.0,
      "allowances": {
        "lunch": 0,
        "costume": 0,
        "phone": 0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "9333329592",
      "bankName": "VCB",
      "branch": ""
    },
    "contract": {
      "number": "MS19/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Nghỉ việc/Tạm hoãn",
    "activeMonths": [
      "04.2026",
      "05.2026"
    ]
  },
  {
    "id": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "position": "Vận hành",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9566500.0,
      "net": 9009000.0,
      "bhxhBase": 5310000.0,
      "bhxh105": 557550.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 400000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19021081619016",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS20/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "04.2026",
      "05.2026",
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS21",
    "name": "Triệu Thị Thu",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 12577500.0,
      "net": 12000000.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "150822666999",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS21/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS22",
    "name": "Nguyễn Thị Hằng",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 11577500.0,
      "net": 11000000.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19031171516025",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS22/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS23",
    "name": "Hoàng Thị Ánh Mão",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 12577500.0,
      "net": 9505700.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "19024964658010",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS23/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "Ban giám hiệu",
    "position": "Hiệu phó cơ sở",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 18787500.0,
      "net": 18000000.0,
      "bhxhBase": 7500000.0,
      "bhxh105": 787500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 2500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "8819922368",
      "bankName": "VPBank",
      "branch": ""
    },
    "contract": {
      "number": "MS24/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "06.2026",
      "07.2026",
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS25",
    "name": "Trần Thị Hà Quyên",
    "dept": "Vận hành",
    "position": "Kế toán",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 14577500.0,
      "net": 5379000.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "26829111992",
      "bankName": "VPBank",
      "branch": ""
    },
    "contract": {
      "number": "MS25/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS26",
    "name": "Nguyễn Thị Hồng Nhung",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 9577500.0,
      "net": 8375400.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "3333999933999",
      "bankName": "Techcombank",
      "branch": ""
    },
    "contract": {
      "number": "MS26/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS27",
    "name": "Phan Thị Hà Phương",
    "dept": "Giáo viên",
    "position": "Giáo viên mầm non",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 10577500.0,
      "net": 1563600.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0326696588",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS27/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS28",
    "name": "Nguyễn Thị Trung Anh",
    "dept": "Giáo viên",
    "position": "Giáo viên TA VN",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 12000000.0,
      "net": 2650100.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 500000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "0931004205722",
      "bankName": "VCB",
      "branch": ""
    },
    "contract": {
      "number": "MS28/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "08.2026",
      "09.2026"
    ]
  },
  {
    "id": "MS29",
    "name": "Hoàng Thị Ngọc",
    "dept": "Giáo viên",
    "position": "Giáo viên TA VN",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 12000000.0,
      "net": 11422500.0,
      "bhxhBase": 5500000.0,
      "bhxh105": 577500.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 780000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "8400136306003",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS29/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "09.2026"
    ]
  },
  {
    "id": "MS30",
    "name": "Vũ Thùy Duyên",
    "dept": "Kế toán",
    "position": "Phụ trách kế toán kiêm HCNS",
    "gender": "Nữ",
    "phone": "",
    "dob": "",
    "cccd": "",
    "idDate": "",
    "idPlace": "",
    "address": "Vinhomes Riverside, Hà Nội",
    "salary": {
      "gross": 23000000.0,
      "net": 5384000.0,
      "bhxhBase": 7150000.0,
      "bhxh105": 750750.0,
      "allowances": {
        "lunch": 720000.0,
        "costume": 400000.0,
        "phone": 1480000.0,
        "concurrent": 0,
        "parking": 0
      }
    },
    "bank": {
      "account": "1610123121986",
      "bankName": "MB",
      "branch": ""
    },
    "contract": {
      "number": "MS30/2026/HĐLĐ-MF14",
      "type": "HĐLĐ Chính thức",
      "status": "Đã ký",
      "driveFileUrl": ""
    },
    "status": "Đang làm việc",
    "activeMonths": [
      "09.2026"
    ]
  }
];

// DỮ LIỆU LỊCH SỬ BẢNG LƯƠNG (164 DÒNG CHI TIẾT TỪ 10/2025 -> 09/2026)
const PAYROLL_HISTORY_DATA = [
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Kế toán",
    "month": "10.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 4880000.0,
    "totalGross": 15000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 29625.0,
    "net": 14182900.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "11.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 4.0,
    "baseSalary": 6000000.0,
    "actualBase": 927272.7272727272,
    "bonusHQCV": 1233272.727272727,
    "totalGross": 2588636.3636363633,
    "bhxhDeduction": 0,
    "tax": 241554.54545454547,
    "net": 2347100.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Kế toán",
    "month": "11.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 4880000.0,
    "totalGross": 15000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 29625.0,
    "net": 14182900.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "12.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046700.0,
    "totalGross": 16666700.0,
    "bhxhDeduction": 0,
    "tax": 1666670.0,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "12.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 23.0,
    "baseSalary": 6000000.0,
    "actualBase": 6000000.0,
    "bonusHQCV": 7980000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 0,
    "tax": 1600000.0,
    "net": 14400000.0
  },
  {
    "empId": "MS05",
    "name": "Hoàng Thị Hoa",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "12.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 23.0,
    "baseSalary": 8000000.0,
    "actualBase": 6800000.0,
    "bonusHQCV": 8653000.0,
    "totalGross": 18040400.0,
    "bhxhDeduction": 0,
    "tax": 1804040.0,
    "net": 16236400.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "12.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 29625.0,
    "net": 15182900.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "12.2025",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 3.5,
    "baseSalary": 5500000.0,
    "actualBase": 711413.0434782609,
    "bonusHQCV": 5223596.8369565215,
    "totalGross": 6196292.489130435,
    "bhxhDeduction": 0,
    "tax": 1239258.497826087,
    "net": 4957000.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046700.000000002,
    "totalGross": 16666700.000000002,
    "bhxhDeduction": 0,
    "tax": 1666670.0000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 16.0,
    "baseSalary": 6000000.0,
    "actualBase": 4636363.636363636,
    "bonusHQCV": 6166363.636363636,
    "totalGross": 12363636.363636363,
    "bhxhDeduction": 0,
    "tax": 1236363.6363636365,
    "net": 11127300.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 5.0,
    "baseSalary": 6500000.0,
    "actualBase": 1477272.7272727273,
    "bonusHQCV": 1855102.2727272727,
    "totalGross": 3791465.909090909,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 3791500.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 21.0,
    "baseSalary": 6500000.0,
    "actualBase": 6113636.363636363,
    "bonusHQCV": 8021465.909090908,
    "totalGross": 16155102.272727273,
    "bhxhDeduction": 0,
    "tax": 1236363.6363636365,
    "net": 14918800.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768852.0,
    "totalGross": 8888852.0,
    "bhxhDeduction": 0,
    "tax": 888885.2000000001,
    "net": 8000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 15212500.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 7.5,
    "baseSalary": 5500000.0,
    "actualBase": 1806250.0,
    "bonusHQCV": 13262508.852272727,
    "totalGross": 15732145.21590909,
    "bhxhDeduction": 0,
    "tax": 3146429.043181818,
    "net": 12585700.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 3.0,
    "baseSalary": 5500000.0,
    "actualBase": 750000.0,
    "bonusHQCV": 5506924.090909091,
    "totalGross": 6532378.636363637,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 6532400.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 10.5,
    "baseSalary": 5500000.0,
    "actualBase": 2556250.0,
    "bonusHQCV": 18769432.943181816,
    "totalGross": 22264523.852272727,
    "bhxhDeduction": 0,
    "tax": 3146429.043181818,
    "net": 19118100.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Thị Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 4.0,
    "baseSalary": 5500000.0,
    "actualBase": 850000.0,
    "bonusHQCV": 290545.45454545453,
    "totalGross": 1390909.0909090908,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1390900.0
  },
  {
    "empId": "MS08",
    "name": "Hoàng Thị Hương Li",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "01.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 6.5,
    "baseSalary": 5500000.0,
    "actualBase": 1381250.0,
    "bonusHQCV": 472136.3636363636,
    "totalGross": 2260227.2727272725,
    "bhxhDeduction": 0,
    "tax": 226022.72727272726,
    "net": 2034200.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 14.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046667.0,
    "totalGross": 16666667.0,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 14.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 7480000.0,
    "totalGross": 17000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 16212500.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 14.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 14.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 15212500.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 4.0,
    "baseSalary": 5500000.0,
    "actualBase": 2750000.0,
    "bonusHQCV": 21153325.0,
    "totalGross": 24913325.0,
    "bhxhDeduction": 0,
    "tax": 590332.5,
    "net": 24323000.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Thị Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 13.0,
    "baseSalary": 5500000.0,
    "actualBase": 4441250.0,
    "bonusHQCV": 1518100.0,
    "totalGross": 7267500.0,
    "bhxhDeduction": 0,
    "tax": 1453500.0,
    "net": 5814000.0
  },
  {
    "empId": "MS08",
    "name": "Nguyễn Hương Li",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 8.0,
    "baseSalary": 5500000.0,
    "actualBase": 1870000.0,
    "bonusHQCV": 639200.0,
    "totalGross": 3060000.0,
    "bhxhDeduction": 0,
    "tax": 306000.0,
    "net": 2754000.0
  },
  {
    "empId": "MS08",
    "name": "Nguyễn Hương Li",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 3025000.0,
    "bonusHQCV": 1034000.0,
    "totalGross": 4950000.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 4372500.0
  },
  {
    "empId": "MS08",
    "name": "Nguyễn Hương Li",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 13.0,
    "baseSalary": 5500000.0,
    "actualBase": 4895000.0,
    "bonusHQCV": 1673200.0,
    "totalGross": 8010000.0,
    "bhxhDeduction": 577500.0,
    "tax": 306000.0,
    "net": 7126500.0
  },
  {
    "empId": "MS10",
    "name": "Bùi Thị Thương",
    "dept": "Giáo viên",
    "title": "Giáo viên TA VN",
    "month": "02.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 9.0,
    "baseSalary": 5500000.0,
    "actualBase": 2103750.0,
    "bonusHQCV": 2249100.0,
    "totalGross": 4972500.0,
    "bhxhDeduction": 0,
    "tax": 497250.0,
    "net": 4475300.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046667.000000002,
    "totalGross": 16666667.000000002,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 22.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 7267500.000000001,
    "totalGross": 16787500.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 16000000.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 15212500.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 22.0,
    "baseSalary": 4960000.0,
    "actualBase": 4216000.0,
    "bonusHQCV": 884680.0,
    "totalGross": 6392680.0,
    "bhxhDeduction": 0,
    "tax": 544068.0,
    "net": 5848600.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 14.0,
    "baseSalary": 4960000.0,
    "actualBase": 2682909.090909091,
    "bonusHQCV": 2185705.454545454,
    "totalGross": 5690796.363636363,
    "bhxhDeduction": 0,
    "tax": 508497.8181818182,
    "net": 5182300.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 22.0,
    "baseSalary": 5500000.0,
    "actualBase": 4675000.0,
    "bonusHQCV": 2938875.0,
    "totalGross": 8990875.0,
    "bhxhDeduction": 0,
    "tax": 803887.5,
    "net": 8187000.0
  },
  {
    "empId": "MS15",
    "name": "Nguyễn Thị Thuỳ Trang",
    "dept": "Vận hành",
    "title": "Vận hành",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 6.0,
    "baseSalary": 5500000.0,
    "actualBase": 1275000.0,
    "bonusHQCV": 569693.1818181818,
    "totalGross": 2220238.6363636362,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 2220200.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 8.5,
    "baseSalary": 5500000.0,
    "actualBase": 2125000.0,
    "bonusHQCV": 16345751.136363637,
    "totalGross": 19251205.681818184,
    "bhxhDeduction": 0,
    "tax": 148537.55681818185,
    "net": 19102700.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Thị Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 22.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 1880000.0,
    "totalGross": 9000000.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8422500.0
  },
  {
    "empId": "MS08",
    "name": "Nguyễn Hương Li",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 1250000.0,
    "bonusHQCV": 427272.7272727273,
    "totalGross": 2045454.5454545454,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 2045500.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên TA VN",
    "month": "03.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 17.0,
    "baseSalary": 5500000.0,
    "actualBase": 3612500.0,
    "bonusHQCV": 1614130.6818181816,
    "totalGross": 6290676.136363636,
    "bhxhDeduction": 0,
    "tax": 629067.6136363636,
    "net": 5661600.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046667.000000002,
    "totalGross": 16666667.000000002,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 20.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 7480000.0,
    "totalGross": 17000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 16212500.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 10.0,
    "baseSalary": 7500000.0,
    "actualBase": 5113636.363636363,
    "bonusHQCV": 3327272.7272727275,
    "totalGross": 10909090.909090908,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 10121600.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 4960000.0,
    "actualBase": 4960000.0,
    "bonusHQCV": 1040800.0,
    "totalGross": 7520800.0,
    "bhxhDeduction": 520800.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 8.0,
    "baseSalary": 4960000.0,
    "actualBase": 1533090.909090909,
    "bonusHQCV": 1248974.5454545454,
    "totalGross": 3251883.636363636,
    "bhxhDeduction": 0,
    "tax": 290570.18181818177,
    "net": 2961300.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 10.0,
    "baseSalary": 4960000.0,
    "actualBase": 2705454.5454545454,
    "bonusHQCV": 2204072.727272727,
    "totalGross": 5738618.181818182,
    "bhxhDeduction": 520800.0,
    "tax": 0,
    "net": 5217800.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử việc",
    "workDays": 7.0,
    "baseSalary": 4960000.0,
    "actualBase": 1341454.5454545454,
    "bonusHQCV": 281489.0909090909,
    "totalGross": 2034034.5454545454,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 2034000.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 27.0,
    "baseSalary": 9920000.0,
    "actualBase": 6301454.545454545,
    "bonusHQCV": 1322289.0909090908,
    "totalGross": 9554834.545454545,
    "bhxhDeduction": 520800.0,
    "tax": 0,
    "net": 9034000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 18.0,
    "baseSalary": 9920000.0,
    "actualBase": 4238545.454545454,
    "bonusHQCV": 3453047.2727272725,
    "totalGross": 8990501.818181816,
    "bhxhDeduction": 520800.0,
    "tax": 290570.18181818177,
    "net": 8179100.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 3457500.0,
    "totalGross": 10577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS15",
    "name": "Nguyễn Thị Thuỳ Trang",
    "dept": "Vận hành",
    "title": "Vận hành",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 16.0,
    "baseSalary": 5500000.0,
    "actualBase": 3400000.0,
    "bonusHQCV": 1519181.8181818181,
    "totalGross": 5920636.363636363,
    "bhxhDeduction": 0,
    "tax": 522827.2727272727,
    "net": 5397800.0
  },
  {
    "empId": "MS16",
    "name": "Phạm Thị Hương Thuỷ",
    "dept": "Vận hành",
    "title": "Kế toán",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 17.0,
    "baseSalary": 5500000.0,
    "actualBase": 3612500.0,
    "bonusHQCV": 3862090.9090909096,
    "totalGross": 8538636.363636365,
    "bhxhDeduction": 0,
    "tax": 780300.0000000002,
    "net": 7758300.0
  },
  {
    "empId": "MS19",
    "name": "Bác Hạnh",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Part Time",
    "workDays": 18.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 9000000.0,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 2.0,
    "baseSalary": 5300000.0,
    "actualBase": 409545.45454545453,
    "bonusHQCV": 213079.54545454544,
    "totalGross": 740079.5454545454,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 740100.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 8.0,
    "baseSalary": 5500000.0,
    "actualBase": 2500000.0,
    "bonusHQCV": 19230295.454545453,
    "totalGross": 22648477.27272727,
    "bhxhDeduction": 0,
    "tax": 373029.5454545453,
    "net": 22275400.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 1880000.0,
    "totalGross": 9000000.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8422500.0
  },
  {
    "empId": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 17.0,
    "baseSalary": 5500000.0,
    "actualBase": 3612500.0,
    "bonusHQCV": 1285721.5909090908,
    "totalGross": 5962267.045454545,
    "bhxhDeduction": 0,
    "tax": 522663.0681818182,
    "net": 5439600.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử việc",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 1062500.0,
    "bonusHQCV": 474744.3181818182,
    "totalGross": 1850198.8636363635,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1850200.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 25.0,
    "baseSalary": 5500000.0,
    "actualBase": 6562500.0,
    "bonusHQCV": 2932244.3181818184,
    "totalGross": 11427698.863636363,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 10850200.0
  },
  {
    "empId": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "04.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 16.0,
    "baseSalary": 5500000.0,
    "actualBase": 3400000.0,
    "bonusHQCV": 1519181.8181818181,
    "totalGross": 5920636.363636363,
    "bhxhDeduction": 0,
    "tax": 592063.6363636364,
    "net": 5328600.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046667.0,
    "totalGross": 16666667.0,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS03",
    "name": "Lê Thị Kim Liên",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 21.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 7480000.0,
    "totalGross": 17000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 16212500.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 15212500.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 736500.0,
    "totalGross": 7556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 3736500.0,
    "totalGross": 10556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 3457499.9999999995,
    "totalGross": 10577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS19",
    "name": "Bác Hạnh",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Part Time",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 11666676.0,
    "bhxhDeduction": 0,
    "tax": 1166667.6,
    "net": 10500000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 20.0,
    "baseSalary": 5300000.0,
    "actualBase": 4290476.19047619,
    "bonusHQCV": 2232261.904761905,
    "totalGross": 7753214.285714285,
    "bhxhDeduction": 0,
    "tax": 684654.761904762,
    "net": 7068600.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 1.0,
    "baseSalary": 5300000.0,
    "actualBase": 252380.95238095237,
    "bonusHQCV": 131309.52380952382,
    "totalGross": 456071.4285714286,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 456100.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 4542857.142857143,
    "bonusHQCV": 2363571.4285714286,
    "totalGross": 8209285.714285714,
    "bhxhDeduction": 0,
    "tax": 684654.761904762,
    "net": 7524700.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 10.0,
    "baseSalary": 5500000.0,
    "actualBase": 2619047.619047619,
    "bonusHQCV": 20146023.80952381,
    "totalGross": 23726976.19047619,
    "bhxhDeduction": 0,
    "tax": 476507.14285714296,
    "net": 23250500.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 1880000.0,
    "totalGross": 9000000.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8422500.0
  },
  {
    "empId": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 4.0,
    "baseSalary": 5500000.0,
    "actualBase": 890476.1904761904,
    "bonusHQCV": 316928.5714285714,
    "totalGross": 1469690.4761904762,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1469700.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử việc",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 1113095.238095238,
    "bonusHQCV": 497351.1904761904,
    "totalGross": 1938303.5714285714,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1938300.0
  },
  {
    "empId": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 17.0,
    "baseSalary": 5500000.0,
    "actualBase": 4452380.952380952,
    "bonusHQCV": 1584642.857142857,
    "totalGross": 7348452.380952381,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 6771000.0
  },
  {
    "empId": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 5342857.142857143,
    "bonusHQCV": 1901571.4285714284,
    "totalGross": 8818142.857142856,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8240700.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 1113095.238095238,
    "bonusHQCV": 497351.1904761904,
    "totalGross": 1938303.5714285714,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1938300.0
  },
  {
    "empId": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 16.0,
    "baseSalary": 5500000.0,
    "actualBase": 4190476.1904761903,
    "bonusHQCV": 1872380.9523809524,
    "totalGross": 7297142.857142856,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 6719600.0
  },
  {
    "empId": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "05.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5303571.428571428,
    "bonusHQCV": 2369732.1428571427,
    "totalGross": 9235446.428571427,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8657900.0
  },
  {
    "empId": "MS01",
    "name": "Trần Thị Ngọc Diệp",
    "dept": "HO",
    "title": "Chủ tịch HĐQT",
    "month": "05.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 27113333.0,
    "totalGross": 33333333.0,
    "bhxhDeduction": 0,
    "tax": 3333333.3000000003,
    "net": 30000000.0
  },
  {
    "empId": "MS02",
    "name": "Nguyễn Thị Hà",
    "dept": "HO",
    "title": "Tổng giám đốc",
    "month": "05.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 22557778.0,
    "totalGross": 27777778.0,
    "bhxhDeduction": 0,
    "tax": 2777777.8000000003,
    "net": 25000000.0
  },
  {
    "empId": "MS03",
    "name": "Nguyễn Thu Hiền",
    "dept": "HO",
    "title": "Chuyên viên MKT",
    "month": "05.2026",
    "scope": "HO",
    "status": "Part Time",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 5555556.0,
    "bhxhDeduction": 0,
    "tax": 555555.6,
    "net": 5000000.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 24157767.0,
    "totalGross": 27777767.0,
    "bhxhDeduction": 0,
    "tax": 2777776.7,
    "net": 25000000.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 2.0,
    "baseSalary": 7500000.0,
    "actualBase": 579545.4545454545,
    "bonusHQCV": 592488.6363636364,
    "totalGross": 1451761.3636363635,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1451800.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 7500000.0,
    "actualBase": 7499999.999999999,
    "bonusHQCV": 4880000.0,
    "totalGross": 16000000.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 15212500.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 736500.0,
    "totalGross": 7556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 3736500.0,
    "totalGross": 10556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 3457500.0,
    "totalGross": 10577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 2736500.0,
    "totalGross": 9556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 17.5,
    "baseSalary": 5500000.0,
    "actualBase": 4625000.0,
    "bonusHQCV": 35576046.59090909,
    "totalGross": 41899682.95454546,
    "bhxhDeduction": 0,
    "tax": 3290209.3181818193,
    "net": 38609500.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS17",
    "name": "Lê Thị Bích Hường",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 1957499.9999999998,
    "totalGross": 9077500.0,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 9077500.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.5,
    "baseSalary": 5500000.0,
    "actualBase": 5375000.0,
    "bonusHQCV": 2401647.7272727275,
    "totalGross": 9359829.545454547,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8782300.0
  },
  {
    "empId": "MS18",
    "name": "Nguyễn Hương Thảo",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 18.5,
    "baseSalary": 5500000.0,
    "actualBase": 4875000.0,
    "bonusHQCV": 2178238.6363636362,
    "totalGross": 8489147.727272727,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 7911600.0
  },
  {
    "empId": "MS21",
    "name": "Triệu Thị Thu",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 19.5,
    "baseSalary": 5500000.0,
    "actualBase": 5125000.0,
    "bonusHQCV": 5085397.7272727275,
    "totalGross": 11719943.181818182,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11142400.0
  },
  {
    "empId": "MS22",
    "name": "Nguyễn Thị Hằng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 4457500.0,
    "totalGross": 11577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11000000.0
  },
  {
    "empId": "MS23",
    "name": "Hoàng Thị Ánh Mão",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "06.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 20.5,
    "baseSalary": 5500000.0,
    "actualBase": 4356250.0,
    "bonusHQCV": 2738497.159090909,
    "totalGross": 8377860.795454545,
    "bhxhDeduction": 0,
    "tax": 837786.0795454546,
    "net": 7540100.0
  },
  {
    "empId": "MS01",
    "name": "Trần Thị Ngọc Diệp",
    "dept": "HO",
    "title": "Chủ tịch HĐQT",
    "month": "06.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 27113333.0,
    "totalGross": 33333333.0,
    "bhxhDeduction": 0,
    "tax": 3333333.3000000003,
    "net": 30000000.0
  },
  {
    "empId": "MS02",
    "name": "Nguyễn Thị Hà",
    "dept": "HO",
    "title": "Tổng giám đốc",
    "month": "06.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 22557778.0,
    "totalGross": 27777778.0,
    "bhxhDeduction": 0,
    "tax": 2777777.8000000003,
    "net": 25000000.0
  },
  {
    "empId": "MS03",
    "name": "Nguyễn Thu Hiền",
    "dept": "HO",
    "title": "Chuyên viên MKT",
    "month": "06.2026",
    "scope": "HO",
    "status": "Part Time",
    "workDays": 22.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 5555556.0,
    "bhxhDeduction": 0,
    "tax": 555555.6,
    "net": 5000000.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046666.999999998,
    "totalGross": 16666666.999999998,
    "bhxhDeduction": 0,
    "tax": 1666666.7,
    "net": 15000000.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 23.0,
    "baseSalary": 7500000.0,
    "actualBase": 6375000.0,
    "bonusHQCV": 6517375.0,
    "totalGross": 15969375.0,
    "bhxhDeduction": 0,
    "tax": 1501737.5,
    "net": 14467600.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 18.5,
    "baseSalary": 7500000.0,
    "actualBase": 6032608.695652174,
    "bonusHQCV": 3925217.391304348,
    "totalGross": 12869565.217391305,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 12082100.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 736500.0,
    "totalGross": 7556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 3736500.0,
    "totalGross": 10556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 3457500.0,
    "totalGross": 10577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 2736500.0,
    "totalGross": 9556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.5,
    "baseSalary": 5500000.0,
    "actualBase": 4902173.9130434785,
    "bonusHQCV": 37708101.08695652,
    "totalGross": 44410709.782608695,
    "bhxhDeduction": 0,
    "tax": 3772055.0,
    "net": 40638700.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS21",
    "name": "Triệu Thị Thu",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 5457500.0,
    "totalGross": 12577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 12000000.0
  },
  {
    "empId": "MS22",
    "name": "Nguyễn Thị Hằng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 4457500.0,
    "totalGross": 11577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11000000.0
  },
  {
    "empId": "MS23",
    "name": "Hoàng Thị Ánh Mão",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "07.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 22.5,
    "baseSalary": 5500000.0,
    "actualBase": 4573369.565217392,
    "bonusHQCV": 4538029.891304348,
    "totalGross": 10458464.673913043,
    "bhxhDeduction": 0,
    "tax": 952716.0326086956,
    "net": 9505700.0
  },
  {
    "empId": "MS01",
    "name": "Trần Thị Ngọc Diệp",
    "dept": "HO",
    "title": "Chủ tịch HĐQT",
    "month": "07.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 27113333.0,
    "totalGross": 33333333.0,
    "bhxhDeduction": 0,
    "tax": 3333333.3000000003,
    "net": 30000000.0
  },
  {
    "empId": "MS02",
    "name": "Nguyễn Thị Hà",
    "dept": "HO",
    "title": "Tổng giám đốc",
    "month": "07.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 22557778.0,
    "totalGross": 27777778.0,
    "bhxhDeduction": 0,
    "tax": 2777777.8000000003,
    "net": 25000000.0
  },
  {
    "empId": "MS03",
    "name": "Nguyễn Thu Hiền",
    "dept": "HO",
    "title": "Chuyên viên MKT",
    "month": "07.2026",
    "scope": "HO",
    "status": "Part Time",
    "workDays": 23.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 5555556.0,
    "bhxhDeduction": 0,
    "tax": 555555.6,
    "net": 5000000.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 13046667.0,
    "totalGross": 16666667.0,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 5768889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 19.5,
    "baseSalary": 7500000.0,
    "actualBase": 5919642.857142857,
    "bonusHQCV": 6051848.214285715,
    "totalGross": 14828705.357142856,
    "bhxhDeduction": 0,
    "tax": 1394470.5357142857,
    "net": 13434200.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 0,
    "baseSalary": 7500000.0,
    "actualBase": 357142.85714285716,
    "bonusHQCV": 365119.04761904763,
    "totalGross": 894642.8571428573,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 894600.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính thức",
    "workDays": 19.5,
    "baseSalary": 7500000.0,
    "actualBase": 6276785.714285715,
    "bonusHQCV": 6416967.261904762,
    "totalGross": 15723348.214285713,
    "bhxhDeduction": 0,
    "tax": 1394470.5357142857,
    "net": 14328800.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 14.0,
    "baseSalary": 7500000.0,
    "actualBase": 5357142.857142857,
    "bonusHQCV": 3485714.2857142854,
    "totalGross": 11428571.428571427,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 10641100.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 736500.0,
    "totalGross": 7556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 3736500.0,
    "totalGross": 10556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 6457500.0,
    "totalGross": 13577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 13000000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 2736500.0,
    "totalGross": 9556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS25",
    "name": "Trần Thị Hà Quyên",
    "dept": "Vận hành",
    "title": "Kế toán",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 12.5,
    "baseSalary": 5500000.0,
    "actualBase": 3005357.1428571427,
    "bonusHQCV": 4074991.0714285714,
    "totalGross": 7965562.5,
    "bhxhDeduction": 0,
    "tax": 735356.25,
    "net": 7230200.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 10.0,
    "baseSalary": 5500000.0,
    "actualBase": 2880952.3809523806,
    "bonusHQCV": 22160626.19047619,
    "totalGross": 26099673.80952381,
    "bhxhDeduction": 0,
    "tax": 704157.8571428572,
    "net": 25395500.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS21",
    "name": "Triệu Thị Thu",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 5457500.0,
    "totalGross": 12577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 12000000.0
  },
  {
    "empId": "MS22",
    "name": "Nguyễn Thị Hằng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 4457500.0,
    "totalGross": 11577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11000000.0
  },
  {
    "empId": "MS26",
    "name": "Nguyễn Thị Hồng Nhung",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 20.0,
    "baseSalary": 5500000.0,
    "actualBase": 4675000.0,
    "bonusHQCV": 2088875.0,
    "totalGross": 8140875.0,
    "bhxhDeduction": 0,
    "tax": 718887.5,
    "net": 7422000.0
  },
  {
    "empId": "MS27",
    "name": "Phan Thị Hà Phương",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 15.0,
    "baseSalary": 5500000.0,
    "actualBase": 3561904.7619047617,
    "bonusHQCV": 2239142.857142857,
    "totalGross": 6850190.476190476,
    "bhxhDeduction": 0,
    "tax": 612485.7142857142,
    "net": 6237700.0
  },
  {
    "empId": "MS28",
    "name": "Nguyễn Thị Trung Anh",
    "dept": "Giáo viên",
    "title": "Giáo viên TA VN",
    "month": "08.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 5.0,
    "baseSalary": 5500000.0,
    "actualBase": 1335714.2857142857,
    "bonusHQCV": 1185142.857142857,
    "totalGross": 2914285.714285714,
    "bhxhDeduction": 0,
    "tax": 264228.5714285714,
    "net": 2650100.0
  },
  {
    "empId": "MS01",
    "name": "Trần Thị Ngọc Diệp",
    "dept": "HO",
    "title": "Chủ tịch HĐQT",
    "month": "08.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 27113333.0,
    "totalGross": 33333333.0,
    "bhxhDeduction": 0,
    "tax": 3333333.3000000003,
    "net": 30000000.0
  },
  {
    "empId": "MS02",
    "name": "Nguyễn Thị Hà",
    "dept": "HO",
    "title": "Tổng giám đốc",
    "month": "08.2026",
    "scope": "HO",
    "status": "Chính Thức",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 22557778.0,
    "totalGross": 27777778.0,
    "bhxhDeduction": 0,
    "tax": 2777777.8000000003,
    "net": 25000000.0
  },
  {
    "empId": "MS03",
    "name": "Nguyễn Thu Hiền",
    "dept": "HO",
    "title": "Chuyên viên MKT",
    "month": "08.2026",
    "scope": "HO",
    "status": "Part Time",
    "workDays": 20.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 0,
    "totalGross": 5555556.0,
    "bhxhDeduction": 0,
    "tax": 555555.6,
    "net": 5000000.0
  },
  {
    "empId": "MS02",
    "name": "Bùi Thanh Anh",
    "dept": "BGH",
    "title": "Hiệu trưởng",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 16666667.0,
    "totalGross": 16666667.0,
    "bhxhDeduction": 0,
    "tax": 1666666.7000000002,
    "net": 15000000.0
  },
  {
    "empId": "MS09",
    "name": "Nguyễn Thị Thu",
    "dept": "BGH",
    "title": "Quản lý chương trình TA",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 0,
    "actualBase": 0,
    "bonusHQCV": 8888889.0,
    "totalGross": 8888889.0,
    "bhxhDeduction": 0,
    "tax": 888888.9,
    "net": 8000000.0
  },
  {
    "empId": "MS24",
    "name": "Trương Hoàng Diễm",
    "dept": "BGH",
    "title": "Hiệu phó cơ sở",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 7500000.0,
    "actualBase": 7500000.0,
    "bonusHQCV": 7667500.0,
    "totalGross": 18787500.0,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 18000000.0
  },
  {
    "empId": "MS04",
    "name": "Nguyễn Thị Thu Hảo",
    "dept": "Vận hành",
    "title": "Trưởng phòng vận hành",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 14.7,
    "baseSalary": 7500000.0,
    "actualBase": 5445652.173913043,
    "bonusHQCV": 3543304.347826087,
    "totalGross": 11617391.304347824,
    "bhxhDeduction": 787500.0,
    "tax": 0,
    "net": 10829900.0
  },
  {
    "empId": "MS12",
    "name": "Đinh Thị Bích Ngọc",
    "dept": "Vận hành",
    "title": "HK",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 736500.0,
    "totalGross": 7556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 7000000.0
  },
  {
    "empId": "MS13",
    "name": "Lương Văn Châm",
    "dept": "Vận hành",
    "title": "Bảo vệ",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5300000.0,
    "actualBase": 5300000.0,
    "bonusHQCV": 3736500.0,
    "totalGross": 10556500.0,
    "bhxhDeduction": 556500.0,
    "tax": 0,
    "net": 10000000.0
  },
  {
    "empId": "MS14",
    "name": "Nguyễn Thị Phúc",
    "dept": "Vận hành",
    "title": "Y tế",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 6457500.0,
    "totalGross": 13577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 13000000.0
  },
  {
    "empId": "MS20",
    "name": "Nguyễn Thị Thu Hiền",
    "dept": "Vận hành",
    "title": "NV Bếp",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5310000.0,
    "actualBase": 5310000.0,
    "bonusHQCV": 2736500.0,
    "totalGross": 9566500.0,
    "bhxhDeduction": 557550.0,
    "tax": 0,
    "net": 9009000.0
  },
  {
    "empId": "MS25",
    "name": "Trần Thị Hà Quyên",
    "dept": "Vận hành",
    "title": "Kế toán",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 9.0,
    "baseSalary": 5500000.0,
    "actualBase": 2235869.5652173916,
    "bonusHQCV": 3031635.8695652173,
    "totalGross": 5926070.652173914,
    "bhxhDeduction": 0,
    "tax": 547076.6304347827,
    "net": 5379000.0
  },
  {
    "empId": "MS30",
    "name": "Vũ Thùy Duyên",
    "dept": "Kế toán",
    "title": "Phụ trách kế toán kiêm HCNS",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 7.0,
    "baseSalary": 7150000.0,
    "actualBase": 1849673.9130434783,
    "bonusHQCV": 3427717.3913043477,
    "totalGross": 5950000.0,
    "bhxhDeduction": 0,
    "tax": 566026.0869565217,
    "net": 5384000.0
  },
  {
    "empId": "MS06",
    "name": "Eugene",
    "dept": "Giáo viên",
    "title": "Giáo viên nước ngoài",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 9.5,
    "baseSalary": 5500000.0,
    "actualBase": 2271739.1304347827,
    "bonusHQCV": 17474485.86956522,
    "totalGross": 20580572.826086957,
    "bhxhDeduction": 0,
    "tax": 212311.25,
    "net": 20368300.0
  },
  {
    "empId": "MS07",
    "name": "Nguyễn Ánh Hồng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 16.0,
    "baseSalary": 5500000.0,
    "actualBase": 4304347.826086957,
    "bonusHQCV": 1923260.8695652175,
    "totalGross": 7495434.782608696,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 6917900.0
  },
  {
    "empId": "MS11",
    "name": "Phùng Thị Lụa",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 2457500.0,
    "totalGross": 9577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 9000000.0
  },
  {
    "empId": "MS21",
    "name": "Triệu Thị Thu",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 5457500.0,
    "totalGross": 12577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 12000000.0
  },
  {
    "empId": "MS22",
    "name": "Nguyễn Thị Hằng",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 4457500.0,
    "totalGross": 11577500.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11000000.0
  },
  {
    "empId": "MS26",
    "name": "Nguyễn Thị Hồng Nhung",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 19.5,
    "baseSalary": 5500000.0,
    "actualBase": 5141304.347826087,
    "bonusHQCV": 2297228.2608695654,
    "totalGross": 8952880.43478261,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 8375400.0
  },
  {
    "empId": "MS27",
    "name": "Phan Thị Hà Phương",
    "dept": "Giáo viên",
    "title": "Giáo viên mầm non",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Thử Việc",
    "workDays": 2.0,
    "baseSalary": 5500000.0,
    "actualBase": 813043.4782608696,
    "bonusHQCV": 511108.6956521739,
    "totalGross": 1563630.4347826086,
    "bhxhDeduction": 0,
    "tax": 0,
    "net": 1563600.0
  },
  {
    "empId": "MS29",
    "name": "Hoàng Thị Ngọc",
    "dept": "Giáo viên",
    "title": "Giáo viên TA VN",
    "month": "09.2026",
    "scope": "Cơ sở Phong Lan",
    "status": "Chính Thức",
    "workDays": 21.0,
    "baseSalary": 5500000.0,
    "actualBase": 5500000.0,
    "bonusHQCV": 4600000.0,
    "totalGross": 12000000.0,
    "bhxhDeduction": 577500.0,
    "tax": 0,
    "net": 11422500.0
  }
];

/**
 * HÀM NẠP TẤT CẢ DỮ LIỆU VÀO GOOGLE SHEET
 * Tự động xóa sạch dữ liệu cũ và khởi tạo cấu trúc 6 bảng chuẩn hóa
 */
function importAllMF14Data() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Sheet Nhan_Vien
  let shNV = ss.getSheetByName("Nhan_Vien");
  if (!shNV) { shNV = ss.insertSheet("Nhan_Vien"); } else { shNV.clear(); }
  const nvHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính",
    "Địa chỉ / HKTT", "Lương Gross (VNĐ)", "Lương Net thực tế (VNĐ)",
    "Lương đóng BHXH (VNĐ)", "10.5% BHXH trừ lương", "Số tài khoản", "Ngân hàng",
    "Số HĐLĐ", "Loại HĐLĐ", "Trạng thái", "Tháng hoạt động"
  ];
  shNV.appendRow(nvHeaders);
  formatHeaderRow(shNV);
  
  const nvRows = EMPLOYEES_DATA.map(function(e) {
    return [
      e.id,
      e.name,
      e.dept,
      e.position,
      e.gender,
      e.address,
      e.salary.gross,
      e.salary.net,
      e.salary.bhxhBase,
      e.salary.bhxh105,
      e.bank.account,
      e.bank.bankName + (e.bank.branch ? " - " + e.bank.branch : ""),
      e.contract.number,
      e.contract.type,
      e.status,
      e.activeMonths.join(", ")
    ];
  });
  if (nvRows.length > 0) {
    shNV.getRange(2, 1, nvRows.length, nvHeaders.length).setValues(nvRows);
    // Định dạng tiền tệ cột Lương (Gross, Net, BHXH)
    shNV.getRange(2, 7, nvRows.length, 4).setNumberFormat("#,##0");
  }
  shNV.autoResizeColumns(1, nvHeaders.length);

  // 2. Sheet Bang_Luong_Lich_Su (Toàn bộ 164 bản ghi lương từ 10/2025 -> 09/2026)
  let shBL = ss.getSheetByName("Bang_Luong_Lich_Su");
  if (!shBL) { shBL = ss.insertSheet("Bang_Luong_Lich_Su"); } else { shBL.clear(); }
  const blHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Tháng", "Khối / Cơ sở",
    "Tình trạng", "Ngày công thực tế", "Lương cơ bản", "Lương theo ngày công",
    "Thưởng HQCV (B)", "Tổng thu nhập trước thuế (Gross)", "BHXH trừ NLĐ", "Thuế TNCN", "Thực lĩnh Net"
  ];
  shBL.appendRow(blHeaders);
  formatHeaderRow(shBL);
  
  const blRows = PAYROLL_HISTORY_DATA.map(function(p) {
    return [
      p.empId,
      p.name,
      p.dept,
      p.title,
      p.month,
      p.scope,
      p.status,
      p.workDays,
      p.baseSalary,
      p.actualBase,
      p.bonusHQCV,
      p.totalGross,
      p.bhxhDeduction,
      p.tax,
      p.net
    ];
  });
  if (blRows.length > 0) {
    shBL.getRange(2, 1, blRows.length, blHeaders.length).setValues(blRows);
    shBL.getRange(2, 9, blRows.length, 7).setNumberFormat("#,##0");
  }
  shBL.autoResizeColumns(1, blHeaders.length);

  // 3. Sheet Hop_Dong (Có cột liên kết Google Drive)
  let shHD = ss.getSheetByName("Hop_Dong");
  if (!shHD) { shHD = ss.insertSheet("Hop_Dong"); } else { shHD.clear(); }
  const hdHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh",
    "Số HĐLĐ", "Loại hợp đồng", "Ngày bắt đầu", "Ngày kết thúc",
    "Trạng thái hợp đồng", "Link Hợp đồng scan (Google Drive)", "Ghi chú"
  ];
  shHD.appendRow(hdHeaders);
  formatHeaderRow(shHD);
  
  const hdRows = EMPLOYEES_DATA.map(function(e) {
    const isBGH = e.dept === "Ban giám hiệu" || e.position.indexOf("Hiệu") !== -1;
    return [
      e.id,
      e.name,
      e.dept,
      e.position,
      e.contract.number,
      isBGH ? "HĐLĐ Không xác định thời hạn" : "HĐLĐ 12 tháng",
      "01/10/2025",
      isBGH ? "Không thời hạn" : "31/12/2026",
      e.status === "Đang làm việc" ? "Đã ký" : "Hết hạn",
      "https://drive.google.com/drive/folders/" + FOLDER_DRIVE_ID,
      "Tài khoản: " + e.bank.bankName + " " + e.bank.account
    ];
  });
  if (hdRows.length > 0) {
    shHD.getRange(2, 1, hdRows.length, hdHeaders.length).setValues(hdRows);
  }
  shHD.autoResizeColumns(1, hdHeaders.length);

  // 4. Sheet Phong_Ban
  let shPB = ss.getSheetByName("Phong_Ban");
  if (!shPB) { shPB = ss.insertSheet("Phong_Ban"); } else { shPB.clear(); }
  const pbHeaders = ["Phòng ban", "Số nhân sự hiện tại", "Định biên quy định", "Mô tả / Phạm vi"];
  shPB.appendRow(pbHeaders);
  formatHeaderRow(shPB);
  const pbRows = [
    ["Ban giám hiệu", 5, 5, "BGH cơ sở, quản lý chuyên môn giáo dục mầm non & TA"],
    ["Vận hành", 9, 10, "Vận hành cơ sở, Y tế, HK, Bảo vệ, Bếp"],
    ["Giáo viên", 13, 15, "Giáo viên mầm non, GV tiếng Anh bản ngữ & Việt Nam"],
    ["Kế toán", 1, 2, "Phụ trách kế toán kiêm HCNS"],
    ["HO", 2, 2, "Hội đồng quản trị & Khối Văn phòng"]
  ];
  shPB.getRange(2, 1, pbRows.length, pbHeaders.length).setValues(pbRows);
  shPB.autoResizeColumns(1, pbHeaders.length);

  // 5. Sheet Tai_Khoan_Ngan_Hang
  let shTK = ss.getSheetByName("Tai_Khoan_Ngan_Hang");
  if (!shTK) { shTK = ss.insertSheet("Tai_Khoan_Ngan_Hang"); } else { shTK.clear(); }
  const tkHeaders = ["STT", "Mã NV", "Họ và tên", "Số tài khoản", "Ngân hàng", "Chi nhánh", "Lương Net tháng 09/2026"];
  shTK.appendRow(tkHeaders);
  formatHeaderRow(shTK);
  let stt = 1;
  const tkRows = EMPLOYEES_DATA.map(function(e) {
    return [
      stt++,
      e.id,
      e.name,
      e.bank.account,
      e.bank.bankName,
      e.bank.branch,
      e.salary.net
    ];
  });
  if (tkRows.length > 0) {
    shTK.getRange(2, 1, tkRows.length, tkHeaders.length).setValues(tkRows);
    shTK.getRange(2, 7, tkRows.length, 1).setNumberFormat("#,##0");
  }
  shTK.autoResizeColumns(1, tkHeaders.length);

  // Xóa Sheet1 mặc định nếu có
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  Logger.log("✓ ĐÃ ĐỒNG BỘ THÀNH CÔNG " + EMPLOYEES_DATA.length + " NHÂN SỰ VÀ " + PAYROLL_HISTORY_DATA.length + " BẢN GHI LƯƠNG!");
  return {
    status: "success",
    message: "Đã nạp toàn bộ dữ liệu chuẩn xác từ 17 file Excel vào Google Sheet!",
    totalEmployees: EMPLOYEES_DATA.length,
    totalPayrollRecords: PAYROLL_HISTORY_DATA.length
  };
}

function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#14532d"); // Xanh thương hiệu MF14
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

// =========================================================================
// API 2 CHIỀU (WEB APP HTTP GATEWAY CHO FRONTEND)
// =========================================================================

/**
 * GET: Trả về toàn bộ dữ liệu trực tiếp từ Google Sheet cho Frontend
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const shNV = ss.getSheetByName("Nhan_Vien");
    const shBL = ss.getSheetByName("Bang_Luong_Lich_Su");
    const shHD = ss.getSheetByName("Hop_Dong");
    
    // Nếu sheet chưa có dữ liệu thì nạp tự động
    if (!shNV || shNV.getLastRow() <= 1) {
      importAllMF14Data();
    }
    
    const nvData = shNV.getDataRange().getValues();
    const nvHeaders = nvData[0];
    const employees = [];
    for (let i = 1; i < nvData.length; i++) {
      const row = nvData[i];
      if (!row[0]) continue;
      employees.push({
        id: row[0],
        name: row[1],
        dept: row[2],
        position: row[3],
        gender: row[4],
        address: row[5],
        salary: {
          gross: Number(row[6]) || 0,
          net: Number(row[7]) || 0,
          bhxhBase: Number(row[8]) || 0,
          bhxh105: Number(row[9]) || 0
        },
        bank: {
          account: String(row[10] || ""),
          bankName: String(row[11] || "")
        },
        contract: {
          number: String(row[12] || ""),
          type: String(row[13] || ""),
          status: String(row[14] || "")
        },
        status: String(row[14] || "Đang làm việc")
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      totalEmployees: employees.length,
      employees: employees,
      folderDriveId: FOLDER_DRIVE_ID,
      sheetId: SPREADSHEET_ID
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST: Nhận dữ liệu cập nhật từ Frontend hoặc upload file lên Google Drive
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "";

    if (action === "importAllData" || action === "syncAllData") {
      const res = importAllMF14Data();
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // TÍNH NĂNG: UPLOAD HỢP ĐỒNG TRỰC TIẾP LÊN GOOGLE DRIVE
    if (action === "uploadContractToDrive") {
      const empId = data.empId || "";
      const fileName = data.fileName || (empId + "_HopDongLaoDong.pdf");
      const base64Content = data.base64Content || "";
      const mimeType = data.mimeType || "application/pdf";

      if (!base64Content) {
        throw new Error("Thiếu nội dung file base64.");
      }

      const decoded = Utilities.base64Decode(base64Content);
      const blob = Utilities.newBlob(decoded, mimeType, fileName);
      
      const folder = DriveApp.getFolderById(FOLDER_DRIVE_ID);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileUrl = file.getUrl();

      // Cập nhật link vào Google Sheet
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      const shHD = ss.getSheetByName("Hop_Dong");
      if (shHD) {
        const rows = shHD.getDataRange().getValues();
        for (let r = 1; r < rows.length; r++) {
          if (String(rows[r][0]).trim() === empId.trim()) {
            shHD.getRange(r + 1, 10).setValue(fileUrl);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileUrl: fileUrl,
        fileId: file.getId(),
        message: "Hợp đồng đã được lưu trực tiếp vào Google Drive thành công!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
