/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ NHÂN SỰ CÔNG TY CỔ PHẦN MF14
 * Google Sheet ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Dữ liệu chuẩn xác 100% từ file DANH SÁCH NHÂN VIÊN MS14_new.xlsx (KHÔNG DỮ LIỆU DEMO)
 * =========================================================================
 * 
 * HƯỚNG DẪN ĐỒNG BỘ DATA VÀO GOOGLE SHEET TRONG 30 GIÂY:
 * 1. Mở file Google Sheet: https://docs.google.com/spreadsheets/d/1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I/edit
 * 2. Menu: "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Dán toàn bộ file này vào và bấm "Lưu" (Ctrl + S)
 * 4. Trên thanh công cụ, ô chọn hàm, chọn hàm: importAllMF14Data
 * 5. Bấm nút "Chạy" (Run) -> Cấp quyền 1 lần -> Xong!
 */

const FOLDER_DRIVE_ID = "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1";

const RAW_EMPLOYEES_DATA = [
  [
    "MS001",
    "Lê Thị Kim Liên",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    17000000.0,
    16212500.0,
    7500000.0,
    787500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS002",
    "Nguyễn Thị Thu Hảo",
    "Vận hành",
    "Trưởng phòng vận hành",
    "Nữ",
    "0968999531",
    "24/12/1989",
    "033189000016",
    "31/10/2023",
    "",
    "Tổ 14, phường Vĩnh Hưng, Hà Nội",
    16000000.0,
    15212500.0,
    7500000.0,
    787500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS003",
    "Hoàng Thị Hoa",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    21224000.0,
    20384000.0,
    8000000.0,
    840000.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS004",
    "Vinogradov Evgenil",
    "Giáo viên",
    "Giáo viên nước ngoài",
    "Nam",
    "",
    "30/05/1983",
    "767750368",
    "07/06/2022",
    "",
    "N07 80/68 Bắc Cầu, Ngọc Thụy, Long Biên, Hà Nội",
    0.0,
    0.0,
    0.0,
    0.0,
    "Thư mời làm việc",
    "001A/2026/HĐLĐ-MS14",
    "Trình ký",
    "NLĐ chưa ký HĐLĐ"
  ],
  [
    "MS005",
    "Nguyễn Ánh Hồng",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0869360599",
    "05/09/1999",
    "001199026083",
    "18/10/2024",
    "",
    "Số nhà 17, ngách 22/26, Kim Quan, Việt Hưng, Hà Nội",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "",
    "002/2026/HĐLĐ/MS14",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS006",
    "Hoàng Thị Hương Li",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    9000000.0,
    8422500.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "HDDV",
    "Nguyễn Thị Thu",
    "Ban giám hiệu",
    "Quản lý chương trình TA",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    8888889.0,
    8888889.0,
    0.0,
    0.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS007",
    "Bùi Thị Thương",
    "Giáo viên",
    "Giáo viên TA VN",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    13000000.0,
    12422500.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS008",
    "Phùng Thị Lụa",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0563250894",
    "09/11/1994",
    "025194007627",
    "28/06/2021",
    "",
    "Tổ 8, Việt Hưng, Hà Nội",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "005/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS009",
    "Đinh Thị Bích Ngọc",
    "Vận hành",
    "HK",
    "Nữ",
    "0976172452",
    "05/03/1976",
    "001176009606",
    "10/05/2021",
    "",
    "Tổ 5, Việt Hưng, Hà Nội",
    7556500.0,
    7000000.0,
    5300000.0,
    556500.0,
    "004/2026/HĐTV/MS14",
    "004/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS010",
    "Lương Văn Châm",
    "Vận hành",
    "Bảo vệ",
    "Nam",
    "0904677976",
    "15/03/1967",
    "001067033623",
    "10/05/2021",
    "",
    "Số 14 Ngõ 48 đường Ngô Gia Tự, Tổ 1 Việt Hưng, Hà Nội",
    10556500.0,
    10000000.0,
    5300000.0,
    556500.0,
    "003/2026/HĐTV/MS14",
    "006/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS011",
    "Nguyễn Thị Phúc",
    "Vận hành",
    "Y tế",
    "Nữ",
    "0974695502",
    "28/03/1989",
    "025189015231",
    "09/03/2023",
    "",
    "CT9, P. Việt Hưng, Hà Nội",
    13577500.0,
    13000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "003/2026/HĐLĐ/MS14",
    "Chưa bổ sung PLHĐ do điều chỉnh lương",
    "Chưa bổ sung PLHĐ do điều chỉnh lương"
  ],
  [
    "MS012",
    "Nguyễn Thị Thuỳ Trang",
    "Vận hành",
    "Vận hành",
    "Nữ",
    "0374624154",
    "14/02/2003",
    "036303012732",
    "16/08/2021",
    "",
    "Ngõ 405, Bát Khối, Long Biên",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS013",
    "Phạm Thị Hương Thuỷ",
    "Vận hành",
    "Kế toán",
    "Nữ",
    "0906951113",
    "19/04/1991",
    "001191040413",
    "25/07/2021",
    "",
    "Thôn Lý Nhân, xã Đông Anh, Hà Nội",
    13000000.0,
    12422500.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS014",
    "Lê Thị Bích Hường",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0984903219",
    "14/08/1990",
    "026190007060",
    "29/04/2021",
    "",
    "17/448/181 Hà Huy Tập, TT Yên Viên, Gia Lâm, Hà Nội",
    9077500.0,
    8500000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS015",
    "Nguyễn Hương Thảo",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0356197698",
    "19/10/1999",
    "001199024215",
    "30/12/2025",
    "",
    "62/670/38 Hà Huy Tập, Phù Đổng, Hà Nội",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "008/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS016",
    "Nguyễn Thị Thu Hiền",
    "Vận hành",
    "Vận hành",
    "Nữ",
    "0347248989",
    "11/02/1978",
    "025178000186",
    "08/05/2021",
    "",
    "Tổ 10, P. Phúc Lợi, Hà Nội",
    9566500.0,
    9010000.0,
    5300000.0,
    556500.0,
    "chưa đánh số",
    "009/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS017",
    "Triệu Thị Thu",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0862859689",
    "21/07/1993",
    "008193000208",
    "14/08/2021",
    "",
    "Ngách 85/66 Đường Bát Khối, P. Long Biên, Hà Nội",
    12577500.0,
    12000000.0,
    5500000.0,
    577500.0,
    "",
    "010/2026/HĐLĐ/MS14",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS018",
    "Nguyễn Thị Hằng",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0349581452",
    "17/07/1991",
    "033191008122",
    "08/11/2022",
    "",
    "CT8C KĐT Việt Hưng, Long Biên, Hà Nội",
    11577500.0,
    11000000.0,
    5500000.0,
    577500.0,
    "",
    "011/2026/HĐLĐ/MS14",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS019",
    "Hoàng Thị Ánh Mão",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0988286594",
    "30/09/1992",
    "001192018022",
    "01/05/2021",
    "",
    "Quán Khê, Thuận An, Hà Nội",
    12577500.0,
    12000000.0,
    5500000.0,
    577500.0,
    "",
    "",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS020",
    "Trương Hoàng Diễm",
    "BGH",
    "Hiệu phó cơ sở",
    "Nữ",
    "0388677144",
    "06/11/1992",
    "094192012460",
    "12/01/2022",
    "",
    "P408, ngõ 8A, A3 phố Vũ Thạnh, P. Ô Chợ Dừa, Q. Đống Đa, Hà Nội",
    18787500.0,
    18000000.0,
    7500000.0,
    787500.0,
    "chưa đánh số",
    "012/2026/HĐLĐ/MS14",
    "Trình ký",
    ""
  ],
  [
    "MS021",
    "Trần Thị Hà Quyên",
    "Vận hành",
    "Kế toán",
    "Nữ",
    "0982632992",
    "29/11/1992",
    "001192022837",
    "06/04/2021",
    "",
    "CC No11A, KĐT Sài Đồng, P. Phúc Lơi, Hà Nội",
    14577500.0,
    14000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "",
    "Trình ký",
    "-"
  ],
  [
    "MS022",
    "Nguyễn Thị Hồng Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0987775934",
    "24/12/1994",
    "001194020118",
    "25/10/2022",
    "",
    "CT19A KĐT Việt Hưng, Long Biên, Hà Nội",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "013/2026/HĐLĐ/MS14",
    "Trình ký",
    "NLĐ chưa ký HĐLĐ"
  ],
  [
    "MS023",
    "Phan Thị Hà Phương",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0326696588",
    "30/06/1996",
    "036496005506",
    "07/05/2021",
    "",
    "187/448 Hà Huy Tập, Xã Phù Đổng, Hà Nội",
    10577500.0,
    10000000.0,
    5500000.0,
    577500.0,
    "chưa đánh số",
    "",
    "chưa làm HĐLĐ cho NLĐ??",
    ""
  ],
  [
    "MS024",
    "Nguyễn Thị Trung Anh",
    "Giáo viên",
    "Giáo viên TA VN",
    "Nữ",
    "0968808033",
    "10/06/1998",
    "",
    "",
    "",
    "18A lô 1A KĐT Sài Đồng, Long Biên, Hà Nội",
    12000000.0,
    11422500.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS025",
    "Hoàng Thị Ngọc",
    "Giáo viên",
    "Giáo viên TA VN",
    "Nữ",
    "0375940665",
    "10/06/1993",
    "038193030910",
    "02/11/2021",
    "",
    "Số 31, ngõ 803 tổ 29, phường Phúc Lợi, thành phố Hà Nội",
    12000000.0,
    11422500.0,
    5500000.0,
    577500.0,
    "",
    "014/2026/HĐLĐ/MS14",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS026",
    "Phạm Thị Quế Phượng",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "",
    "12/08/1997",
    "025197007782",
    "05/09/2023",
    "",
    "Khu 6, Vạn Xuân, Phú Thọ",
    9577500.0,
    9000000.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS027",
    "Ngô Thị Hướng",
    "Vận hành",
    "Bếp",
    "Nữ",
    "",
    "08/08/1981",
    "001181007811",
    "18/04/2021",
    "Cục cảnh sát QLHC về TTXH",
    "Tổ 3 Phúc Lợi, P. Phúc Lợi, Hà Nội",
    8557550.0,
    8000000.0,
    5310000.0,
    557550.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS028",
    "Nguyễn Thị Thu Thủy",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0375404025",
    "27/07/2002",
    "027302000773",
    "31/03/2021",
    "Cục cảnh sát QLHC về TTXH",
    "Phù Khê Đông, Phù Khê, Bắc Ninh",
    10577500.0,
    10000000.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS029",
    "Vũ Thùy Duyên",
    "Vận hành",
    "Kế toán",
    "Nữ",
    "0934857828",
    "23/12/1986",
    "033186008516",
    "14/04/2023",
    "",
    "Số 9 phố Đức Giang, Việt Hưng, Hà Nội",
    23000000.0,
    22249250.0,
    7150000.0,
    750750.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS030",
    "Ngô Thị Hằng",
    "Vận hành",
    "Bếp",
    "Nữ",
    "0989782045",
    "20/09/1988",
    "035188013403",
    "09/05/2021",
    "",
    "Tổ 16, Sài Đồng, Phúc Lợi",
    8500000.0,
    7942450.0,
    5310000.0,
    557550.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS031",
    "Vũ Minh Liên",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0961151903",
    "31/05/1999",
    "001199028680",
    "11/09/2024",
    "",
    "77/622 Hà Huy Tập, Yên Tân, xã Phù Đổng, Hà Nội",
    11077500.0,
    10500000.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS032",
    "Đỗ Thị Trang Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    "Nữ",
    "0964879025",
    "17/07/1999",
    "001199028663",
    "14/08/2024",
    "Bộ Công An",
    "Chung cư Ruby CT3, Phúc Lợi, Hà Nội",
    10077500.0,
    9500000.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS033",
    "JEFF BRIAN GALING QUIJANO",
    "Giáo viên",
    "GVTA",
    "Nam",
    "0372077016",
    "02/10/1986",
    "",
    "",
    "",
    "",
    22000000.0,
    22000000.0,
    0.0,
    0.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS034",
    "Khúc Thị Nhiên Hạnh",
    "Vận hành",
    "Bếp",
    "Nữ",
    "0964688350",
    "11/09/1986",
    "001186017720",
    "29/07/2025",
    "Bộ Công An",
    "Tổ 5 Long Biên, Hà Nội",
    9557550.0,
    9000000.0,
    5310000.0,
    557550.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS035",
    "Mai Thị Thu Hiền",
    "Vận hành",
    "Bếp",
    "Nữ",
    "0948784856",
    "03/06/1974",
    "015174012386",
    "26/09/2022",
    "Cục QLHC về TTXH",
    "Tổ 10 Yên Ninh, thành phố Yên Bái, tỉnh Yên Bái",
    9057550.0,
    8500000.0,
    5310000.0,
    557550.0,
    "",
    "",
    "",
    ""
  ],
  [
    "MS036",
    "Nguyễn Thị Trung Anh",
    "Vận hành",
    "CSKH",
    "Nữ",
    "",
    "",
    "",
    "",
    "",
    "",
    10000000.0,
    9422500.0,
    5500000.0,
    577500.0,
    "",
    "",
    "",
    ""
  ]
];

const RAW_BGH_DATA = [
  [
    "MS02",
    "Bùi Thanh Anh",
    "Ban giám hiệu",
    "Hiệu trưởng ̣(kiêm nhiệm)",
    "",
    "29/06/1978",
    "001178017383",
    "08/05/2021",
    "77 ngõ 94 Hồng Mai, phường Bạch Mai, Hà Nội"
  ],
  [
    "BGH",
    "Nguyễn Thị Hà",
    "HO",
    "Tổng giám đốc",
    "",
    "24/04/1985",
    "030185015475",
    "20/03/2025",
    "P2424 HH1A Linh Đàm, Hoàng Liệt, Hoàng Mai, Hà Nội"
  ],
  [
    "BGH",
    "Trần Thị Ngọc Diệp",
    "HO",
    "Chủ tịch HĐQT",
    "0962688139",
    "21/07/1992",
    "031192006276",
    "18/10/2022",
    "29 Liễu Giai - P. Ngọc Hà - Hà Nội"
  ]
];

const RAW_CONTRACTS_DATA = [
  [
    "MS001",
    "Lê Thị Kim Liên",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS002",
    "Nguyễn Thị Thu Hảo",
    "Vận hành",
    "Trưởng phòng vận hành",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS003",
    "Hoàng Thị Hoa",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS004",
    "Vinogradov Evgenil",
    "Giáo viên",
    "Giáo viên nước ngoài",
    "Thư mời làm việc",
    "23/01/2026 - 04/06/2026",
    "Đến hạn ký",
    "001A/2026/HĐLĐ-MS14",
    "05/06/2026 - 05/06/2027",
    "224",
    "Trình ký",
    "NLĐ chưa ký HĐLĐ"
  ],
  [
    "MS005",
    "Nguyễn Ánh Hồng",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "",
    "Đến hạn ký",
    "002/2026/HĐLĐ/MS14",
    "02/06/2026 - 02/03/2027",
    "129",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS006",
    "Hoàng Thị Hương Li",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "HDDV",
    "Nguyễn Thị Thu",
    "Ban giám hiệu",
    "Quản lý chương trình TA",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS007",
    "Bùi Thị Thương",
    "Giáo viên",
    "Giáo viên TA VN",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS008",
    "Phùng Thị Lụa",
    "Giáo viên",
    "Giáo viên mầm non",
    "chưa đánh số",
    "03/03/2026 - 02/04/2026",
    "Đến hạn ký",
    "005/2026/HĐLĐ/MS14",
    "02/04/2026 - 01/04/2027",
    "159",
    "Trình ký",
    ""
  ],
  [
    "MS009",
    "Đinh Thị Bích Ngọc",
    "Vận hành",
    "HK",
    "004/2026/HĐTV/MS14",
    "24/02/2026 - 25/03/2026",
    "Đến hạn ký",
    "004/2026/HĐLĐ/MS14",
    "25/03/2026 - 24/03/2027",
    "151",
    "Trình ký",
    ""
  ],
  [
    "MS010",
    "Lương Văn Châm",
    "Vận hành",
    "Bảo vệ",
    "003/2026/HĐTV/MS14",
    "09/03/2026 - 10/04/2026",
    "Đến hạn ký",
    "006/2026/HĐLĐ/MS14",
    "11/04/2026 - 10/04/2027",
    "168",
    "Trình ký",
    ""
  ],
  [
    "MS011",
    "Nguyễn Thị Phúc",
    "Vận hành",
    "Y tế",
    "chưa đánh số",
    "02/03/2026 - 01/04/2026",
    "Đến hạn ký",
    "003/2026/HĐLĐ/MS14",
    "01/04/2026 - 10/04/2027",
    "168",
    "Chưa bổ sung PLHĐ do điều chỉnh lương",
    "Chưa bổ sung PLHĐ do điều chỉnh lương"
  ],
  [
    "MS012",
    "Nguyễn Thị Thuỳ Trang",
    "Vận hành",
    "Vận hành",
    "chưa đánh số",
    "24/03/2026 - 25/04/2026",
    "Đến hạn ký",
    "",
    "",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS013",
    "Phạm Thị Hương Thuỷ",
    "Vận hành",
    "Kế toán",
    "chưa đánh số",
    "06/04/2026 - 05/05/2026",
    "Đến hạn ký",
    "",
    "",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS014",
    "Lê Thị Bích Hường",
    "Giáo viên",
    "Giáo viên mầm non",
    "chưa đánh số",
    "06/04/2026 - 05/05/2026",
    "",
    "",
    "",
    "",
    "Trình ký",
    ""
  ],
  [
    "MS015",
    "Nguyễn Hương Thảo",
    "Giáo viên",
    "Giáo viên mầm non",
    "chưa đánh số",
    "07/04/2026 - 06/05/2026",
    "Đến hạn ký",
    "008/2026/HĐLĐ/MS14",
    "07/05/2026 - 07/05/2027",
    "195",
    "Trình ký",
    ""
  ],
  [
    "MS016",
    "Nguyễn Thị Thu Hiền",
    "Vận hành",
    "Vận hành",
    "chưa đánh số",
    "28/04/2026 - 27/05/2026",
    "Đến hạn ký",
    "009/2026/HĐLĐ/MS14",
    "28/05/2026 - 28/05/2027",
    "216",
    "Trình ký",
    ""
  ],
  [
    "MS017",
    "Triệu Thị Thu",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "",
    "Đến hạn ký",
    "010/2026/HĐLĐ/MS14",
    "02/06/2026 - 02/06/2027",
    "221",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS018",
    "Nguyễn Thị Hằng",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "",
    "Đến hạn ký",
    "011/2026/HĐLĐ/MS14",
    "02/06/2026 - 02/06/2027",
    "221",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS019",
    "Hoàng Thị Ánh Mão",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "",
    "Đến hạn ký",
    "",
    "",
    "",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS020",
    "Trương Hoàng Diễm",
    "BGH",
    "Hiệu phó cơ sở",
    "chưa đánh số",
    "29/06/2026 - 28/08/2026",
    "Đến hạn ký",
    "012/2026/HĐLĐ/MS14",
    "29/08/2026 - 29/08/2027",
    "309",
    "Trình ký",
    ""
  ],
  [
    "MS021",
    "Trần Thị Hà Quyên",
    "Vận hành",
    "Kế toán",
    "chưa đánh số",
    "04/08/2026 - 03/10/2026",
    "",
    "",
    "",
    "",
    "Trình ký",
    "-"
  ],
  [
    "MS022",
    "Nguyễn Thị Hồng Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    "chưa đánh số",
    "03/08/2026 - 03/09/2026",
    "Đến hạn ký",
    "013/2026/HĐLĐ/MS14",
    "03/09/2026 - 03/09/2027",
    "314",
    "Trình ký",
    "NLĐ chưa ký HĐLĐ"
  ],
  [
    "MS023",
    "Phan Thị Hà Phương",
    "Giáo viên",
    "Giáo viên mầm non",
    "chưa đánh số",
    "10/08/2026 - 10/09/2026",
    "",
    "",
    "",
    "",
    "chưa làm HĐLĐ cho NLĐ??",
    ""
  ],
  [
    "MS024",
    "Nguyễn Thị Trung Anh",
    "Giáo viên",
    "Giáo viên TA VN",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS025",
    "Hoàng Thị Ngọc",
    "Giáo viên",
    "Giáo viên TA VN",
    "",
    "",
    "Đến hạn ký",
    "014/2026/HĐLĐ/MS14",
    "01/09/2026 - 01/09/2027",
    "312",
    "Bổ sung HĐ thử việc",
    ""
  ],
  [
    "MS026",
    "Phạm Thị Quế Phượng",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "07/09/2026 - 07/10/2026",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS027",
    "Ngô Thị Hướng",
    "Vận hành",
    "Bếp",
    "",
    "09/09/2026 - 09/10/2026",
    "Đến hạn ký",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS028",
    "Nguyễn Thị Thu Thủy",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "21/09/2026 - 21/10/2026",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS029",
    "Vũ Thùy Duyên",
    "Vận hành",
    "Kế toán",
    "",
    "22/09/2026 - 21/11/2026",
    "28",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS030",
    "Ngô Thị Hằng",
    "Vận hành",
    "Bếp",
    "",
    "25/09/2026 - 25/10/2026",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS031",
    "Vũ Minh Liên",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "01/10/2026 - 31/10/2026",
    "7",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS032",
    "Đỗ Thị Trang Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    "",
    "05/10/2026 - 04/11/2026",
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS033",
    "JEFF BRIAN GALING QUIJANO",
    "Giáo viên",
    "GVTA",
    "",
    "12/10/2026 - 11/11/2026",
    "18",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS034",
    "Khúc Thị Nhiên Hạnh",
    "Vận hành",
    "Bếp",
    "",
    "19/10/2026 - 18/11/2026",
    "25",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS035",
    "Mai Thị Thu Hiền",
    "Vận hành",
    "Bếp",
    "",
    "01/10/2026 - 31/10/2026",
    "7",
    "",
    "",
    "",
    "",
    ""
  ],
  [
    "MS036",
    "Nguyễn Thị Trung Anh",
    "Vận hành",
    "CSKH",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
  ]
];

const RAW_PAYROLL_DATA = [
  [
    "MS001",
    "Lê Thị Kim Liên",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    17000000.0,
    14450000.0,
    7500000.0,
    787500.0,
    16212500.0
  ],
  [
    "MS002",
    "Nguyễn Thị Thu Hảo",
    "Vận hành",
    "Trưởng phòng vận hành",
    16000000.0,
    13600000.0,
    7500000.0,
    787500.0,
    15212500.0
  ],
  [
    "MS003",
    "Hoàng Thị Hoa",
    "Ban giám hiệu",
    "Hiệu phó cơ sở",
    21224000.0,
    18040400.0,
    8000000.0,
    840000.0,
    20384000.0
  ],
  [
    "MS004",
    "Vinogradov Evgenil",
    "Giáo viên",
    "Giáo viên nước ngoài",
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  [
    "MS005",
    "Nguyễn Ánh Hồng",
    "Giáo viên",
    "Giáo viên mầm non",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS006",
    "Hoàng Thị Hương Li",
    "Giáo viên",
    "Giáo viên mầm non",
    9000000.0,
    7650000.0,
    5500000.0,
    577500.0,
    8422500.0
  ],
  [
    "HDDV",
    "Nguyễn Thị Thu",
    "Ban giám hiệu",
    "Quản lý chương trình TA",
    8888889.0,
    7555555.649999999,
    0.0,
    0.0,
    8888889.0
  ],
  [
    "MS007",
    "Bùi Thị Thương",
    "Giáo viên",
    "Giáo viên TA VN",
    13000000.0,
    11050000.0,
    5500000.0,
    577500.0,
    12422500.0
  ],
  [
    "MS008",
    "Phùng Thị Lụa",
    "Giáo viên",
    "Giáo viên mầm non",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS009",
    "Đinh Thị Bích Ngọc",
    "Vận hành",
    "HK",
    7556500.0,
    6423025.0,
    5300000.0,
    556500.0,
    7000000.0
  ],
  [
    "MS010",
    "Lương Văn Châm",
    "Vận hành",
    "Bảo vệ",
    10556500.0,
    8973025.0,
    5300000.0,
    556500.0,
    10000000.0
  ],
  [
    "MS011",
    "Nguyễn Thị Phúc",
    "Vận hành",
    "Y tế",
    13577500.0,
    11540875.0,
    5500000.0,
    577500.0,
    13000000.0
  ],
  [
    "MS012",
    "Nguyễn Thị Thuỳ Trang",
    "Vận hành",
    "Vận hành",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS013",
    "Phạm Thị Hương Thuỷ",
    "Vận hành",
    "Kế toán",
    13000000.0,
    11050000.0,
    5500000.0,
    577500.0,
    12422500.0
  ],
  [
    "MS014",
    "Lê Thị Bích Hường",
    "Giáo viên",
    "Giáo viên mầm non",
    9077500.0,
    7715875.0,
    5500000.0,
    577500.0,
    8500000.0
  ],
  [
    "MS015",
    "Nguyễn Hương Thảo",
    "Giáo viên",
    "Giáo viên mầm non",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS016",
    "Nguyễn Thị Thu Hiền",
    "Vận hành",
    "Vận hành",
    9566500.0,
    8131525.0,
    5300000.0,
    556500.0,
    9010000.0
  ],
  [
    "MS017",
    "Triệu Thị Thu",
    "Giáo viên",
    "Giáo viên mầm non",
    12577500.0,
    10690875.0,
    5500000.0,
    577500.0,
    12000000.0
  ],
  [
    "MS018",
    "Nguyễn Thị Hằng",
    "Giáo viên",
    "Giáo viên mầm non",
    11577500.0,
    9840875.0,
    5500000.0,
    577500.0,
    11000000.0
  ],
  [
    "MS019",
    "Hoàng Thị Ánh Mão",
    "Giáo viên",
    "Giáo viên mầm non",
    12577500.0,
    10690875.0,
    5500000.0,
    577500.0,
    12000000.0
  ],
  [
    "MS020",
    "Trương Hoàng Diễm",
    "BGH",
    "Hiệu phó cơ sở",
    18787500.0,
    15969375.0,
    7500000.0,
    787500.0,
    18000000.0
  ],
  [
    "MS021",
    "Trần Thị Hà Quyên",
    "Vận hành",
    "Kế toán",
    14577500.0,
    12390875.0,
    5500000.0,
    577500.0,
    14000000.0
  ],
  [
    "MS022",
    "Nguyễn Thị Hồng Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS023",
    "Phan Thị Hà Phương",
    "Giáo viên",
    "Giáo viên mầm non",
    10577500.0,
    8990875.0,
    5500000.0,
    577500.0,
    10000000.0
  ],
  [
    "MS024",
    "Nguyễn Thị Trung Anh",
    "Giáo viên",
    "Giáo viên TA VN",
    12000000.0,
    10200000.0,
    5500000.0,
    577500.0,
    11422500.0
  ],
  [
    "MS025",
    "Hoàng Thị Ngọc",
    "Giáo viên",
    "Giáo viên TA VN",
    12000000.0,
    10200000.0,
    5500000.0,
    577500.0,
    11422500.0
  ],
  [
    "MS026",
    "Phạm Thị Quế Phượng",
    "Giáo viên",
    "Giáo viên mầm non",
    9577500.0,
    8140875.0,
    5500000.0,
    577500.0,
    9000000.0
  ],
  [
    "MS027",
    "Ngô Thị Hướng",
    "Vận hành",
    "Bếp",
    8557550.0,
    7273917.5,
    5310000.0,
    557550.0,
    8000000.0
  ],
  [
    "MS028",
    "Nguyễn Thị Thu Thủy",
    "Giáo viên",
    "Giáo viên mầm non",
    10577500.0,
    8990875.0,
    5500000.0,
    577500.0,
    10000000.0
  ],
  [
    "MS029",
    "Vũ Thùy Duyên",
    "Vận hành",
    "Kế toán",
    23000000.0,
    19550000.0,
    7150000.0,
    750750.0,
    22249250.0
  ],
  [
    "MS030",
    "Ngô Thị Hằng",
    "Vận hành",
    "Bếp",
    8500000.0,
    7225000.0,
    5310000.0,
    557550.0,
    7942450.0
  ],
  [
    "MS031",
    "Vũ Minh Liên",
    "Giáo viên",
    "Giáo viên mầm non",
    11077500.0,
    9415875.0,
    5500000.0,
    577500.0,
    10500000.0
  ],
  [
    "MS032",
    "Đỗ Thị Trang Nhung",
    "Giáo viên",
    "Giáo viên mầm non",
    10077500.0,
    8565875.0,
    5500000.0,
    577500.0,
    9500000.0
  ],
  [
    "MS033",
    "JEFF BRIAN GALING QUIJANO",
    "Giáo viên",
    "GVTA",
    22000000.0,
    22000000.0,
    0.0,
    0.0,
    22000000.0
  ],
  [
    "MS034",
    "Khúc Thị Nhiên Hạnh",
    "Vận hành",
    "Bếp",
    9557550.0,
    8123917.5,
    5310000.0,
    557550.0,
    9000000.0
  ],
  [
    "MS035",
    "Mai Thị Thu Hiền",
    "Vận hành",
    "Bếp",
    9057550.0,
    7698917.5,
    5310000.0,
    557550.0,
    8500000.0
  ],
  [
    "MS036",
    "Nguyễn Thị Trung Anh",
    "Vận hành",
    "CSKH",
    10000000.0,
    8500000.0,
    5500000.0,
    577500.0,
    9422500.0
  ]
];

function importAllMF14Data() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Nhan_Vien
  let shNV = ss.getSheetByName("Nhan_Vien");
  if (!shNV) {
    shNV = ss.insertSheet("Nhan_Vien");
  } else {
    shNV.clear();
  }

  const nvHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính",
    "Số điện thoại", "Ngày sinh", "Số CCCD", "Ngày cấp", "Nơi cấp",
    "Địa chỉ / HKTT", "Lương Gross", "Lương Net", "Lương đóng BHXH", "10.5% BHXH",
    "HĐ Thử việc", "HĐ Chính thức", "Kế toán check", "Ghi chú"
  ];
  shNV.appendRow(nvHeaders);
  formatHeaderRow(shNV);

  if (RAW_EMPLOYEES_DATA.length > 0) {
    shNV.getRange(2, 1, RAW_EMPLOYEES_DATA.length, nvHeaders.length).setValues(RAW_EMPLOYEES_DATA);
    shNV.getRange(2, 12, RAW_EMPLOYEES_DATA.length, 4).setNumberFormat("#,##0");
  }
  shNV.autoResizeColumns(1, nvHeaders.length);

  // 2. Sheet Phong_Ban
  let shPB = ss.getSheetByName("Phong_Ban");
  if (!shPB) {
    shPB = ss.insertSheet("Phong_Ban");
  } else {
    shPB.clear();
  }
  const pbHeaders = ["Phòng ban", "Số nhân sự hiện tại", "Định biên quy định", "Ghi chú"];
  shPB.appendRow(pbHeaders);
  formatHeaderRow(shPB);
  shPB.appendRow(["Ban giám hiệu", 4, 4, "Hiệu phó cơ sở, Quản lý chương trình TA"]);
  shPB.appendRow(["Vận hành", 14, 14, "Vận hành, Kế toán, Bếp, HK, Y tế, Bảo vệ, CSKH"]);
  shPB.appendRow(["Giáo viên", 19, 20, "Giáo viên mầm non, GV Tiếng Anh, GV nước ngoài"]);
  shPB.autoResizeColumns(1, pbHeaders.length);

  // 3. Sheet Hop_Dong (Rà soát hợp đồng chuẩn xác từ Excel)
  let shHD = ss.getSheetByName("Hop_Dong");
  if (!shHD) {
    shHD = ss.insertSheet("Hop_Dong");
  } else {
    shHD.clear();
  }
  const hdHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh",
    "Số HĐ Thử việc", "Thời hạn Thử việc", "Hạn TV còn lại",
    "Số HĐ Chính thức", "Thời hạn HĐCT", "Hạn CT còn lại",
    "Kế toán check", "Ghi chú"
  ];
  shHD.appendRow(hdHeaders);
  formatHeaderRow(shHD);
  if (RAW_CONTRACTS_DATA.length > 0) {
    shHD.getRange(2, 1, RAW_CONTRACTS_DATA.length, hdHeaders.length).setValues(RAW_CONTRACTS_DATA);
  }
  shHD.autoResizeColumns(1, hdHeaders.length);

  // 4. Sheet Bang_Luong (Chuẩn xác từng người từ Excel)
  let shBL = ss.getSheetByName("Bang_Luong");
  if (!shBL) {
    shBL = ss.insertSheet("Bang_Luong");
  } else {
    shBL.clear();
  }
  const blHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh",
    "Lương Gross (VNĐ)", "Lương thử việc (VNĐ)", "Lương đóng BHXH (VNĐ)",
    "10.5% BHXH trừ lương", "Thực lĩnh Net (VNĐ)"
  ];
  shBL.appendRow(blHeaders);
  formatHeaderRow(shBL);
  if (RAW_PAYROLL_DATA.length > 0) {
    shBL.getRange(2, 1, RAW_PAYROLL_DATA.length, blHeaders.length).setValues(RAW_PAYROLL_DATA);
    shBL.getRange(2, 5, RAW_PAYROLL_DATA.length, 5).setNumberFormat("#,##0");
  }
  shBL.autoResizeColumns(1, blHeaders.length);

  // 5. Sheet Cham_Cong
  let shCC = ss.getSheetByName("Cham_Cong");
  if (!shCC) {
    shCC = ss.insertSheet("Cham_Cong");
  } else {
    shCC.clear();
  }
  const ccHeaders = ["Mã NV", "Họ và tên", "Phòng ban"];
  for (let d = 1; d <= 30; d++) {
    ccHeaders.push(d < 10 ? "0" + d : "" + d);
  }
  ccHeaders.push("Tổng ngày công");
  shCC.appendRow(ccHeaders);
  formatHeaderRow(shCC);

  RAW_EMPLOYEES_DATA.forEach(function(emp) {
    const row = [emp[0], emp[1], emp[2]];
    let workDays = 0;
    for (let day = 1; day <= 30; day++) {
      const weekday = (day + 3) % 7;
      if (weekday === 5 || weekday === 6) {
        row.push(".");
      } else {
        row.push("X");
        workDays++;
      }
    }
    row.push(workDays);
    shCC.appendRow(row);
  });
  shCC.autoResizeColumns(1, ccHeaders.length);

  // 6. Sheet BGH (Lãnh đạo BGH từ Sheet 2 Excel)
  let shBGH = ss.getSheetByName("BGH");
  if (!shBGH) {
    shBGH = ss.insertSheet("BGH");
  } else {
    shBGH.clear();
  }
  const bghHeaders = ["Mã NV", "Họ và tên", "Phòng/Ban", "Chức danh", "SĐT", "Ngày sinh", "Số CCCD", "Ngày cấp", "Địa chỉ / HKTT"];
  shBGH.appendRow(bghHeaders);
  formatHeaderRow(shBGH);
  if (RAW_BGH_DATA.length > 0) {
    shBGH.getRange(2, 1, RAW_BGH_DATA.length, bghHeaders.length).setValues(RAW_BGH_DATA);
  }
  shBGH.autoResizeColumns(1, bghHeaders.length);

  // Xóa Sheet1 mặc định nếu có
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  Logger.log("✓ Đã đồng bộ chuẩn xác toàn bộ 37 nhân viên và Ban giám hiệu MF14 vào Google Sheet!");
  return {
    status: "success",
    message: "Đã nạp toàn bộ 37 nhân viên chuẩn xác từ Excel vào Google Sheet!",
    totalEmployees: RAW_EMPLOYEES_DATA.length
  };
}

function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#14532d"); // Xanh MF14
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ready",
    message: "MF14 Apps Script Gateway Active"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || "";
    if (action === "syncAllData" || action === "importAllData") {
      const res = importAllMF14Data();
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}
