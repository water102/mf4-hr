import json, sys

with open(r'f:\ws\projects\hrm-mf14\data\employees.json', 'r', encoding='utf-8') as f:
    employees = json.load(f)

# Format rows for Nhan_Vien
nv_rows = []
for e in employees:
    nv_rows.append([
        e['id'],
        e['name'],
        e['dept'],
        e['position'] or e['jobTitle'] or '',
        e['gender'],
        e['phone'],
        e['dob'],
        e['idCard'],
        e['idDate'],
        e['idPlace'],
        e['address'] or e['hktt'],
        e['salary']['gross'] or e['salary']['probation'] or 0,
        e['salary']['net'] or 0,
        e['salary']['bhxhBase'] or 0,
        e['contract']['number'] if e.get('contract') else '',
        e['contract']['type'] if e.get('contract') else '',
        e['contract']['status'] if e.get('contract') else '',
        e['note']
    ])

# Format rows for Hop_Dong
hd_rows = []
for e in employees:
    c = e.get('contract', {})
    hd_rows.append([
        e['id'],
        e['name'],
        e['dept'],
        c.get('number', ''),
        c.get('type', ''),
        c.get('startDate', ''),
        c.get('endDate', ''),
        c.get('salary', ''),
        c.get('driveFile', ''),
        c.get('status', ''),
        e['note']
    ])

# Format rows for Bang_Luong
bl_rows = []
for e in employees:
    sal = e.get('salary', {})
    base = sal.get('gross') or sal.get('probation') or sal.get('net') or 10000000
    allowance = 1500000 if e['dept'] == 'Ban giám hiệu' else (1000000 if e['dept'] == 'Giáo viên' else 800000)
    total = base + allowance
    ins = sal.get('bhxhDeduct') or int(base * 0.105)
    tax = int((total - 11000000) * 0.05) if total > 11000000 else 0
    net = sal.get('net') or (total - ins - tax)
    bl_rows.append([
        e['id'],
        e['name'],
        e['dept'],
        base,
        22,
        allowance,
        0,
        total,
        ins,
        tax,
        net
    ])

gas_script = f"""/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ NHÂN SỰ CÔNG TY CỔ PHẦN MF14
 * Google Sheet ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Google Drive Folder ID: 1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1
 * Dữ liệu chuẩn hóa 37 nhân viên từ file DANH SÁCH NHÂN VIÊN MS14_new.xlsx
 * =========================================================================
 * 
 * HƯỚNG DẪN ĐỒNG BỘ DATA VÀO GOOGLE SHEET TRONG 30 GIÂY:
 * --------------------------------------------------------
 * CÁCH 1: CHẠY TRỰC TIẾP TRÊN GOOGLE APPS SCRIPT (KHÔNG CẦN DEPLOY WEB APP):
 * 1. Mở file Google Sheet của bạn (ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I)
 * 2. Chọn menu: "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa hết code cũ, dán toàn bộ file này vào và bấm "Lưu" (Ctrl + S)
 * 4. Trên thanh công cụ, tại ô chọn hàm, chọn hàm: importAllMF14Data
 * 5. Bấm nút "Chạy" (Run) -> Cấp quyền truy cập 1 lần -> Xong!
 *    Toàn bộ 37 nhân viên, 3 phòng ban, 37 hợp đồng và bảng lương sẽ xuất hiện ngay!
 * 
 * CÁCH 2: KẾT NỐI QUA WEB APP:
 * 1. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 2. Loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng: "Tôi" (Me)
 *    - Ai có quyền truy cập: "Bất kỳ ai" (Anyone)
 * 3. Bấm "Triển khai", sao chép Web App URL và dán vào file config.js hoặc mục Cài đặt trên Web!
 */

const FOLDER_DRIVE_ID = "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1";

// Dữ liệu 37 nhân viên chuẩn hóa từ Excel
const RAW_EMPLOYEES_DATA = {json.dumps(nv_rows, ensure_ascii=False, indent=2)};

// Dữ liệu hợp đồng lao động
const RAW_CONTRACTS_DATA = {json.dumps(hd_rows, ensure_ascii=False, indent=2)};

// Dữ liệu bảng lương tháng 10/2026
const RAW_PAYROLL_DATA = {json.dumps(bl_rows, ensure_ascii=False, indent=2)};

/**
 * HÀM ĐỒNG BỘ 1-CLICK: TỰ ĐỘNG TẠO 6 SHEETS VÀ NẠP TOÀN BỘ 37 NHÂN SỰ
 */
function importAllMF14Data() {{
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Nhan_Vien
  let shNV = ss.getSheetByName("Nhan_Vien");
  if (!shNV) {{
    shNV = ss.insertSheet("Nhan_Vien");
  }} else {{
    shNV.clear();
  }}

  const nvHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính",
    "Số điện thoại", "Ngày sinh", "Số CCCD", "Ngày cấp", "Nơi cấp",
    "Địa chỉ / HKTT", "Lương Gross (VNĐ)", "Lương Net (VNĐ)", "Lương đóng BHXH",
    "Số HĐLĐ", "Loại HĐ", "Trạng thái HĐ", "Ghi chú"
  ];
  shNV.appendRow(nvHeaders);
  formatHeaderRow(shNV);

  if (RAW_EMPLOYEES_DATA.length > 0) {{
    shNV.getRange(2, 1, RAW_EMPLOYEES_DATA.length, nvHeaders.length).setValues(RAW_EMPLOYEES_DATA);
    // Định dạng cột số tiền
    shNV.getRange(2, 12, RAW_EMPLOYEES_DATA.length, 3).setNumberFormat("#,##0");
  }}
  shNV.autoResizeColumns(1, nvHeaders.length);

  // 2. Sheet Phong_Ban
  let shPB = ss.getSheetByName("Phong_Ban");
  if (!shPB) {{
    shPB = ss.insertSheet("Phong_Ban");
  }} else {{
    shPB.clear();
  }}
  const pbHeaders = ["Phòng ban", "Số nhân sự hiện tại", "Định biên quy định", "Ghi chú"];
  shPB.appendRow(pbHeaders);
  formatHeaderRow(shPB);
  shPB.appendRow(["Ban giám hiệu", 4, 4, "Hiệu phó, Quản lý chương trình TA"]);
  shPB.appendRow(["Vận hành", 14, 14, "Vận hành, Kế toán, Bếp, HK, Y tế, Bảo vệ, CSKH"]);
  shPB.appendRow(["Giáo viên", 19, 20, "Giáo viên mầm non, GV Tiếng Anh, GV nước ngoài"]);
  shPB.autoResizeColumns(1, pbHeaders.length);

  // 3. Sheet Hop_Dong
  let shHD = ss.getSheetByName("Hop_Dong");
  if (!shHD) {{
    shHD = ss.insertSheet("Hop_Dong");
  }} else {{
    shHD.clear();
  }}
  const hdHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Số hợp đồng", "Loại hợp đồng",
    "Ngày bắt đầu", "Ngày kết thúc", "Mức lương", "Link bản scan Drive", "Trạng thái", "Ghi chú"
  ];
  shHD.appendRow(hdHeaders);
  formatHeaderRow(shHD);
  if (RAW_CONTRACTS_DATA.length > 0) {{
    shHD.getRange(2, 1, RAW_CONTRACTS_DATA.length, hdHeaders.length).setValues(RAW_CONTRACTS_DATA);
  }}
  shHD.autoResizeColumns(1, hdHeaders.length);

  // 4. Sheet Bang_Luong
  let shBL = ss.getSheetByName("Bang_Luong");
  if (!shBL) {{
    shBL = ss.insertSheet("Bang_Luong");
  }} else {{
    shBL.clear();
  }}
  const blHeaders = [
    "Mã NV", "Họ và tên", "Phòng ban", "Lương cơ bản Gross", "Ngày công",
    "Phụ cấp", "Tăng ca (OT)", "Tổng thu nhập", "BHXH (10.5%)", "Thuế TNCN", "Thực lĩnh chuyển khoản"
  ];
  shBL.appendRow(blHeaders);
  formatHeaderRow(shBL);
  if (RAW_PAYROLL_DATA.length > 0) {{
    shBL.getRange(2, 1, RAW_PAYROLL_DATA.length, blHeaders.length).setValues(RAW_PAYROLL_DATA);
    shBL.getRange(2, 4, RAW_PAYROLL_DATA.length, 1).setNumberFormat("#,##0");
    shBL.getRange(2, 6, RAW_PAYROLL_DATA.length, 6).setNumberFormat("#,##0");
  }}
  shBL.autoResizeColumns(1, blHeaders.length);

  // 5. Sheet Cham_Cong
  let shCC = ss.getSheetByName("Cham_Cong");
  if (!shCC) {{
    shCC = ss.insertSheet("Cham_Cong");
  }} else {{
    shCC.clear();
  }}
  const ccHeaders = ["Mã NV", "Họ và tên", "Phòng ban"];
  for (let d = 1; d <= 30; d++) {{
    ccHeaders.push(d < 10 ? "0" + d : "" + d);
  }}
  ccHeaders.push("Tổng ngày công", "Đi muộn", "Nghỉ phép");
  shCC.appendRow(ccHeaders);
  formatHeaderRow(shCC);

  // Điền chấm công mẫu tháng 10/2026 cho 37 người
  RAW_EMPLOYEES_DATA.forEach((emp, idx) => {{
    const row = [emp[0], emp[1], emp[2]];
    let workDays = 0;
    let lateDays = 0;
    for (let day = 1; day <= 30; day++) {{
      const weekday = (day + 3) % 7; // Thứ 7, CN nghỉ
      if (weekday === 5 || weekday === 6) {{
        row.push(".");
      }} else if ((idx + day) % 23 === 0) {{
        row.push("X_late");
        workDays++;
        lateDays++;
      }} else {{
        row.push("X");
        workDays++;
      }}
    }}
    row.push(workDays, lateDays, 0);
    shCC.appendRow(row);
  }});
  shCC.autoResizeColumns(1, ccHeaders.length);

  // 6. Sheet Nghi_Phep
  let shNP = ss.getSheetByName("Nghi_Phep");
  if (!shNP) {{
    shNP = ss.insertSheet("Nghi_Phep");
  }} else {{
    shNP.clear();
  }}
  const npHeaders = ["Mã đơn", "Mã NV", "Họ và tên", "Phòng ban", "Loại phép", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái", "Người duyệt"];
  shNP.appendRow(npHeaders);
  formatHeaderRow(shNP);

  shNP.appendRow(["NP-2026-001", "MS005", "Nguyễn Ánh Hồng", "Giáo viên", "Phép năm", "05/10/2026", "06/10/2026", 2, "Về quê có việc gia đình", "Chờ duyệt", "Chờ duyệt"]);
  shNP.appendRow(["NP-2026-002", "MS002", "Nguyễn Thị Thu Hảo", "Vận hành", "Việc riêng", "08/10/2026", "08/10/2026", 1, "Khám sức khỏe định kỳ", "Chờ duyệt", "Chờ duyệt"]);
  shNP.appendRow(["NP-2026-003", "MS010", "Lương Văn Châm", "Vận hành", "Nghỉ ốm", "12/10/2026", "13/10/2026", 2, "Sốt viêm họng có giấy BHYT", "Chờ duyệt", "Chờ duyệt"]);
  shNP.appendRow(["NP-2026-004", "MS008", "Phùng Thị Lụa", "Giáo viên", "Phép năm", "18/09/2026", "19/09/2026", 2, "Giải quyết việc cá nhân", "Đã duyệt", "Hoàng Thị Hoa"]);
  shNP.autoResizeColumns(1, npHeaders.length);

  // Xóa Sheet1 mặc định nếu có
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (defaultSheet && ss.getSheets().length > 1) {{
    try {{ ss.deleteSheet(defaultSheet); }} catch(e){{}}
  }}

  Logger.log("✓ Đã đồng bộ thành công toàn bộ dữ liệu 37 nhân viên MF14 vào Google Sheet!");
  return {{
    status: "success",
    message: "Đã đồng bộ thành công toàn bộ dữ liệu 37 nhân viên MF14 vào 6 bảng Google Sheet!",
    totalEmployees: RAW_EMPLOYEES_DATA.length
  }};
}}

function formatHeaderRow(sheet) {{
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#14532d"); // Màu xanh thương hiệu MF14
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}}

/**
 * XỬ LÝ YÊU CẦU GET TỪ WEB APP HOẶC TRÌNH DUYỆT
 */
function doGet(e) {{
  try {{
    const action = e.parameter?.action || "importAllData";
    
    if (action === "importAllData" || action === "initDatabase") {{
      const result = importAllMF14Data();
      return createJsonResponse(result);
    }}
    
    if (action === "getAllData") {{
      const data = fetchAllHRData();
      return createJsonResponse({{ status: "success", data: data }});
    }}

    return createJsonResponse({{ status: "error", message: "Hành động không hợp lệ" }});
  }} catch (err) {{
    return createJsonResponse({{ status: "error", message: err.toString() }});
  }}
}}

/**
 * XỬ LÝ YÊU CẦU POST ĐỒNG BỘ TỪ WEB APP
 */
function doPost(e) {{
  try {{
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "syncAllData" || action === "importAllData") {{
      const result = importAllMF14Data();
      return createJsonResponse(result);
    }}

    if (action === "uploadContract") {{
      const fileData = postData.fileBase64;
      const fileName = postData.fileName;
      const mimeType = postData.mimeType || "application/pdf";
      const empId = postData.empId;

      const folder = DriveApp.getFolderById(FOLDER_DRIVE_ID);
      const decoded = Utilities.base64Decode(fileData.split(',')[1] || fileData);
      const blob = Utilities.newBlob(decoded, mimeType, fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return createJsonResponse({{
        status: "success",
        message: "Tải lên hợp đồng thành công!",
        fileUrl: file.getUrl(),
        fileId: file.getId()
      }});
    }}

    return createJsonResponse({{ status: "error", message: "Hành động POST không hợp lệ" }});
  }} catch (err) {{
    return createJsonResponse({{ status: "error", message: err.toString() }});
  }}
}}

function fetchAllHRData() {{
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {{
    employees: getSheetDataAsJson(ss.getSheetByName("Nhan_Vien")),
    departments: getSheetDataAsJson(ss.getSheetByName("Phong_Ban")),
    contracts: getSheetDataAsJson(ss.getSheetByName("Hop_Dong")),
    attendance: getSheetDataAsJson(ss.getSheetByName("Cham_Cong")),
    leaves: getSheetDataAsJson(ss.getSheetByName("Nghi_Phep")),
    payroll: getSheetDataAsJson(ss.getSheetByName("Bang_Luong"))
  }};
}}

function getSheetDataAsJson(sheet) {{
  if (!sheet || sheet.getLastRowNum() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {{
    const row = {{}};
    for (let j = 0; j < headers.length; j++) {{
      row[headers[j]] = values[i][j];
    }}
    rows.push(row);
  }}
  return rows;
}}

function createJsonResponse(obj) {{
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}}
"""

with open(r'f:\ws\projects\hrm-mf14\google-apps-script.js', 'w', encoding='utf-8') as f:
    f.write(gas_script)

print("Successfully written google-apps-script.js with complete data!")
