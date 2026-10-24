/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ NHÂN SỰ CÔNG TY CỔ PHẦN MF14
 * Google Sheet ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Google Drive Folder ID: 1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1
 * =========================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT 1 LẦN DUY NHẤT:
 * 1. Mở file Google Sheet của bạn
 * 2. Chọn menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa code cũ, dán toàn bộ nội dung file này vào
 * 4. Bấm "Lưu" (Ctrl + S)
 * 5. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 *    - Chọn loại: "Ứng dụng web" (Web app)
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 6. Bấm "Triển khai" và sao chép đường link Web App URL dán vào ứng dụng!
 */

const FOLDER_DRIVE_ID = "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1";

/**
 * Xử lý yêu cầu GET từ Web App (Lấy dữ liệu hoặc khởi tạo)
 */
function doGet(e) {
  try {
    const action = e.parameter.action || "getAllData";
    
    if (action === "initDatabase") {
      const result = initializeDatabaseStructure();
      return createJsonResponse({ status: "success", message: "Khởi tạo thành công!", data: result });
    }
    
    if (action === "getAllData") {
      const data = fetchAllHRData();
      return createJsonResponse({ status: "success", data: data });
    }

    return createJsonResponse({ status: "error", message: "Hành động không hợp lệ" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Xử lý yêu cầu POST (Tải file hợp đồng scan lên Drive hoặc cập nhật nhân viên)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "uploadContract") {
      // Nhận base64 file và lưu vào Google Drive folder
      const fileData = postData.fileBase64;
      const fileName = postData.fileName;
      const mimeType = postData.mimeType || "application/pdf";
      const empId = postData.empId;

      const folder = DriveApp.getFolderById(FOLDER_DRIVE_ID);
      const decoded = Utilities.base64Decode(fileData.split(',')[1] || fileData);
      const blob = Utilities.newBlob(decoded, mimeType, fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileUrl = file.getUrl();

      // Cập nhật link vào sheet Hop_Dong
      saveContractRecord(empId, fileName, fileUrl);

      return createJsonResponse({
        status: "success",
        message: "Tải lên hợp đồng thành công!",
        fileUrl: fileUrl,
        fileId: file.getId()
      });
    }

    if (action === "updateEmployee") {
      updateEmployeeData(postData.employee);
      return createJsonResponse({ status: "success", message: "Cập nhật nhân viên thành công!" });
    }

    return createJsonResponse({ status: "error", message: "Hành động POST không hợp lệ" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Hàm tự động tạo toàn bộ cấu trúc các bảng trên Google Sheet nếu chưa có
 */
function initializeDatabaseStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Nhan_Vien
  let shNV = ss.getSheetByName("Nhan_Vien");
  if (!shNV) {
    shNV = ss.insertSheet("Nhan_Vien");
    const headers = [
      "Mã NV", "Họ và tên", "Giới tính", "Ngày sinh", "Dân tộc", "Quê quán",
      "Số CCCD", "Ngày cấp", "Địa chỉ thường trú", "Số điện thoại", "Email công ty",
      "Trình độ", "Tình trạng hôn nhân", "Số người phụ thuộc",
      "Phòng ban", "Chức vụ", "Chức danh", "Tổ/Ca", "Ngày vào làm", "Trạng thái", "Ngày nghỉ việc",
      "Số sổ BHXH", "Ngân hàng", "Số tài khoản"
    ];
    shNV.appendRow(headers);
    formatHeaderRow(shNV);
  }

  // 2. Sheet Phong_Ban
  let shPB = ss.getSheetByName("Phong_Ban");
  if (!shPB) {
    shPB = ss.insertSheet("Phong_Ban");
    shPB.appendRow(["Phòng ban", "Định biên", "Ghi chú"]);
    shPB.appendRow(["Ban Giám đốc", 3, ""]);
    shPB.appendRow(["Phòng Hành chính – Nhân sự", 8, ""]);
    shPB.appendRow(["Phòng Kế toán", 8, ""]);
    shPB.appendRow(["Phòng Kinh doanh", 16, ""]);
    shPB.appendRow(["Phòng Kho vận", 19, ""]);
    shPB.appendRow(["Xưởng Sản xuất", 82, "Định biên 82"]);
    shPB.appendRow(["Phòng Quản lý chất lượng (QA/QC)", 12, ""]);
    shPB.appendRow(["Phòng Kỹ thuật – Bảo trì", 10, ""]);
    formatHeaderRow(shPB);
  }

  // 3. Sheet Hop_Dong
  let shHD = ss.getSheetByName("Hop_Dong");
  if (!shHD) {
    shHD = ss.insertSheet("Hop_Dong");
    shHD.appendRow(["Mã NV", "Số HĐ", "Loại hợp đồng", "Ngày bắt đầu", "Ngày kết thúc", "Lương đóng BH", "Link bản scan Drive", "Trạng thái"]);
    formatHeaderRow(shHD);
  }

  // 4. Sheet Cham_Cong
  let shCC = ss.getSheetByName("Cham_Cong");
  if (!shCC) {
    shCC = ss.insertSheet("Cham_Cong");
    const ccHeaders = ["Mã NV", "Họ và tên", "Tháng"];
    for (let i = 1; i <= 31; i++) {
      ccHeaders.push(i < 10 ? "0" + i : "" + i);
    }
    ccHeaders.push("Ngày công", "Nghỉ phép", "Đi muộn", "Tăng ca (giờ)");
    shCC.appendRow(ccHeaders);
    formatHeaderRow(shCC);
  }

  // 5. Sheet Nghi_Phep
  let shNP = ss.getSheetByName("Nghi_Phep");
  if (!shNP) {
    shNP = ss.insertSheet("Nghi_Phep");
    shNP.appendRow(["Mã đơn", "Mã NV", "Họ tên", "Phòng ban", "Loại phép", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái", "Người duyệt"]);
    formatHeaderRow(shNP);
  }

  // 6. Sheet Bang_Luong
  let shBL = ss.getSheetByName("Bang_Luong");
  if (!shBL) {
    shBL = ss.insertSheet("Bang_Luong");
    shBL.appendRow(["Mã NV", "Họ tên", "Tháng", "Lương cơ bản", "Phụ cấp", "Lương tăng ca", "Tổng thu nhập", "BHXH", "Thuế TNCN", "Tạm ứng", "Thực lĩnh"]);
    formatHeaderRow(shBL);
  }

  // Xóa Sheet1 mặc định nếu trống
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Trang tính1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  return { success: true, sheetsCreated: ["Nhan_Vien", "Phong_Ban", "Hop_Dong", "Cham_Cong", "Nghi_Phep", "Bang_Luong"] };
}

function formatHeaderRow(sheet) {
  const range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#183D2D");
  range.setFontColor("#FFFFFF");
  range.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function fetchAllHRData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    employees: getSheetDataAsJson(ss.getSheetByName("Nhan_Vien")),
    departments: getSheetDataAsJson(ss.getSheetByName("Phong_Ban")),
    contracts: getSheetDataAsJson(ss.getSheetByName("Hop_Dong")),
    attendance: getSheetDataAsJson(ss.getSheetByName("Cham_Cong")),
    leaves: getSheetDataAsJson(ss.getSheetByName("Nghi_Phep")),
    payroll: getSheetDataAsJson(ss.getSheetByName("Bang_Luong"))
  };
}

function getSheetDataAsJson(sheet) {
  if (!sheet || sheet.getLastRowNum() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function saveContractRecord(empId, fileName, fileUrl) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("Hop_Dong");
  if (sh) {
    sh.appendRow([empId, "HĐ-" + empId + "-" + new Date().getFullYear(), "Hợp đồng lao động", new Date(), "", "", fileUrl, "Đang hiệu lực"]);
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
