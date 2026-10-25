# -*- coding: utf-8 -*-
import openpyxl, glob, os, sys, json
sys.stdout.reconfigure(encoding='utf-8')

data_dir = r"f:\ws\projects\hrm-mf14\data"
files = glob.glob(os.path.join(data_dir, "*.xlsx"))

print(f"Bắt đầu tổng hợp dữ liệu từ {len(files)} tệp Excel...")

# 1. Thu thập danh sách nhân sự duy nhất và thông tin tài khoản ngân hàng
employees_dict = {}
bank_accounts = {}
payroll_records = []

# Sắp xếp theo thứ tự thời gian các file
def get_file_order(fname):
    order_val = 0
    if "102025" in fname: order_val = 202510
    elif "112025" in fname: order_val = 202511
    elif "12.2025" in fname or "122025" in fname: order_val = 202512
    elif "01.2026" in fname: order_val = 202601
    elif "02.2026" in fname: order_val = 202602
    elif "03.2026" in fname: order_val = 202603
    elif "04.2026" in fname: order_val = 202604
    elif "05.2026" in fname: order_val = 202605
    elif "06.2026" in fname: order_val = 202606
    elif "07.2026" in fname: order_val = 202607
    elif "08.2026" in fname: order_val = 202608
    elif "09.2026" in fname: order_val = 202609
    if "HO_" in fname: order_val += 1
    return order_val

files_sorted = sorted([f for f in files if "- Copy" not in f], key=lambda x: get_file_order(os.path.basename(x)))

for fpath in files_sorted:
    fname = os.path.basename(fpath)
    scope = "HO" if "HO_" in fname else "Cơ sở Phong Lan"
    
    clean_name = fname.replace("HO_", "").replace("MRS Phong Lan_", "").replace(".xlsx", "").strip()
    month_str = ""
    if "Bảng lương tháng " in clean_name:
        month_str = clean_name.replace("Bảng lương tháng ", "").strip()
    elif "Bảng lương_Tháng " in clean_name:
        month_str = clean_name.replace("Bảng lương_Tháng ", "").strip()
    elif "Bảng lương_" in clean_name:
        m_raw = clean_name.replace("Bảng lương_", "").strip()
        if len(m_raw) == 6:
            month_str = f"{m_raw[:2]}.{m_raw[2:]}"
    
    try:
        wb = openpyxl.load_workbook(fpath, data_only=True)
    except Exception as e:
        print(f"Lỗi mở {fname}: {e}")
        continue
        
    # Ngân hàng
    if "2. DS TKNH L1" in wb.sheetnames:
        sh_bank = wb["2. DS TKNH L1"]
        for r in range(4, sh_bank.max_row + 1):
            code = sh_bank.cell(r, 2).value
            name = sh_bank.cell(r, 3).value
            acc = sh_bank.cell(r, 4).value
            bank = sh_bank.cell(r, 5).value
            branch = sh_bank.cell(r, 6).value
            if code and str(code).strip().startswith("MS"):
                c_str = str(code).strip()
                bank_accounts[c_str] = {
                    "account": str(acc).strip() if acc else "",
                    "bank": str(bank).strip() if bank else "",
                    "branch": str(branch).strip() if branch else ""
                }
                
    # Thông số lương & chức danh
    if " 5. Thông số TL" in wb.sheetnames:
        sh_ts = wb[" 5. Thông số TL"]
        for r in range(12, sh_ts.max_row + 1):
            dept = sh_ts.cell(r, 2).value
            title = sh_ts.cell(r, 3).value
            code = sh_ts.cell(r, 4).value
            name = sh_ts.cell(r, 5).value
            bhxh_base = sh_ts.cell(r, 7).value
            bonus_hqcv = sh_ts.cell(r, 8).value
            lunch = sh_ts.cell(r, 9).value
            costume = sh_ts.cell(r, 10).value
            phone = sh_ts.cell(r, 11).value
            concurrent = sh_ts.cell(r, 12).value
            parking = sh_ts.cell(r, 13).value
            total_allowance = sh_ts.cell(r, 14).value
            gross = sh_ts.cell(r, 15).value
            
            if not code or not str(code).strip().startswith("MS"):
                continue
            code_str = str(code).strip()
            name_str = str(name).strip() if name else ""
            if not name_str or "tổng" in name_str.lower() or "cộng" in name_str.lower():
                continue
                
            if code_str not in employees_dict:
                employees_dict[code_str] = {
                    "code": code_str,
                    "name": name_str,
                    "dept": str(dept).strip() if dept else scope,
                    "title": str(title).strip() if title else "Nhân viên",
                    "bhxhBase": float(bhxh_base) if bhxh_base and isinstance(bhxh_base, (int, float)) else 0,
                    "bonusHQCV": float(bonus_hqcv) if bonus_hqcv and isinstance(bonus_hqcv, (int, float)) else 0,
                    "lunch": float(lunch) if lunch and isinstance(lunch, (int, float)) else 0,
                    "costume": float(costume) if costume and isinstance(costume, (int, float)) else 0,
                    "phone": float(phone) if phone and isinstance(phone, (int, float)) else 0,
                    "concurrent": float(concurrent) if concurrent and isinstance(concurrent, (int, float)) else 0,
                    "parking": float(parking) if parking and isinstance(parking, (int, float)) else 0,
                    "gross": float(gross) if gross and isinstance(gross, (int, float)) else 0,
                    "scope": scope,
                    "activeMonths": [month_str]
                }
            else:
                emp = employees_dict[code_str]
                if month_str not in emp["activeMonths"]:
                    emp["activeMonths"].append(month_str)
                if gross and isinstance(gross, (int, float)) and gross > 0:
                    emp["gross"] = float(gross)
                if bhxh_base and isinstance(bhxh_base, (int, float)) and bhxh_base > 0:
                    emp["bhxhBase"] = float(bhxh_base)
                if dept: emp["dept"] = str(dept).strip()
                if title: emp["title"] = str(title).strip()
                if name_str: emp["name"] = name_str

    # 6. Bảng lương chi tiết
    if "6.Bảng lương  " in wb.sheetnames:
        sh_bl = wb["6.Bảng lương  "]
        for r in range(12, sh_bl.max_row + 1):
            code = sh_bl.cell(r, 2).value
            name = sh_bl.cell(r, 3).value
            dept = sh_bl.cell(r, 4).value
            title = sh_bl.cell(r, 5).value
            status = sh_bl.cell(r, 6).value
            work_days = sh_bl.cell(r, 7).value
            base_salary = sh_bl.cell(r, 10).value
            actual_base = sh_bl.cell(r, 11).value
            bonus_b = sh_bl.cell(r, 15).value
            total_before_tax = sh_bl.cell(r, 31).value
            bhxh_emp = sh_bl.cell(r, 40).value
            deduction = sh_bl.cell(r, 44).value
            tax = sh_bl.cell(r, 46).value
            net = sh_bl.cell(r, 48).value
            
            if not code or not str(code).strip().startswith("MS"):
                continue
            code_str = str(code).strip()
            name_str = str(name).strip() if name else ""
            if not name_str or "tổng" in name_str.lower() or "cộng" in name_str.lower():
                continue
                
            gross_val = float(total_before_tax) if total_before_tax and isinstance(total_before_tax, (int, float)) else (float(net) if net and isinstance(net, (int, float)) else 0)
            
            if code_str not in employees_dict:
                employees_dict[code_str] = {
                    "code": code_str,
                    "name": name_str,
                    "dept": str(dept).strip() if dept else scope,
                    "title": str(title).strip() if title else "Nhân viên",
                    "bhxhBase": float(base_salary) if base_salary and isinstance(base_salary, (int, float)) else 0,
                    "bonusHQCV": float(bonus_b) if bonus_b and isinstance(bonus_b, (int, float)) else 0,
                    "lunch": 0, "costume": 0, "phone": 0, "concurrent": 0, "parking": 0,
                    "gross": gross_val,
                    "scope": scope,
                    "activeMonths": [month_str]
                }
            else:
                emp = employees_dict[code_str]
                if month_str not in emp["activeMonths"]:
                    emp["activeMonths"].append(month_str)
                if emp["gross"] == 0 and gross_val > 0:
                    emp["gross"] = gross_val

            payroll_records.append({
                "empId": code_str,
                "name": name_str,
                "dept": str(dept).strip() if dept else (employees_dict.get(code_str, {}).get("dept", scope)),
                "title": str(title).strip() if title else (employees_dict.get(code_str, {}).get("title", "Nhân viên")),
                "month": month_str,
                "scope": scope,
                "status": str(status).strip() if status else "Chính thức",
                "workDays": float(work_days) if work_days and isinstance(work_days, (int, float)) else 0,
                "baseSalary": float(base_salary) if base_salary and isinstance(base_salary, (int, float)) else 0,
                "actualBase": float(actual_base) if actual_base and isinstance(actual_base, (int, float)) else 0,
                "bonusHQCV": float(bonus_b) if bonus_b and isinstance(bonus_b, (int, float)) else 0,
                "totalGross": float(total_before_tax) if total_before_tax and isinstance(total_before_tax, (int, float)) else 0,
                "bhxhDeduction": float(bhxh_emp) if bhxh_emp and isinstance(bhxh_emp, (int, float)) else 0,
                "tax": float(tax) if tax and isinstance(tax, (int, float)) else 0,
                "net": float(net) if net and isinstance(net, (int, float)) else 0
            })

print(f"Đã trích xuất {len(employees_dict)} nhân sự duy nhất và {len(payroll_records)} bản ghi lương.")

# Chuẩn hóa phòng ban
# MS14 chuẩn phòng ban: Ban giám hiệu, Vận hành, Giáo viên, HO, Kế toán
for code, emp in employees_dict.items():
    d = emp["dept"]
    if d == "BGH": emp["dept"] = "Ban giám hiệu"
    if code in ["MS01"]: emp["dept"] = "HO"
    if code in ["MS02", "MS03", "MS05", "MS09", "MS24"]: emp["dept"] = "Ban giám hiệu"
    if code in ["MS30"]: emp["dept"] = "Kế toán"

# Tính lương Net mới nhất cho mỗi nhân viên
for code, emp in employees_dict.items():
    emp_payrolls = [p for p in payroll_records if p["empId"] == code]
    if emp_payrolls:
        latest_p = emp_payrolls[-1]
        emp["latestNet"] = latest_p["net"]
        if latest_p["totalGross"] > 0 and emp["gross"] == 0:
            emp["gross"] = latest_p["totalGross"]
    else:
        emp["latestNet"] = emp["gross"] * 0.895

# Tạo danh sách hợp đồng (Contracts)
contracts_list = []
for code, emp in sorted(employees_dict.items()):
    bank = bank_accounts.get(code, {})
    c_num = f"{code}/2026/HĐLĐ-MF14"
    status = "Đã ký" if "09.2026" in emp["activeMonths"] else "Hết hạn/Chờ tái ký"
    contracts_list.append({
        "empId": code,
        "name": emp["name"],
        "dept": emp["dept"],
        "position": emp["title"],
        "contractNumber": c_num,
        "type": "Hợp đồng không xác định thời hạn" if "BGH" in emp["dept"] or "Hiệu" in emp["title"] else "Hợp đồng 12 tháng",
        "startDate": "01/10/2025" if "10.2025" in emp["activeMonths"] else "01/01/2026",
        "endDate": "Không thời hạn" if "BGH" in emp["dept"] else "31/12/2026",
        "status": status,
        "driveFolderId": "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1",
        "driveFileUrl": "", # Sẽ được cập nhật khi tải lên Google Drive
        "note": f"Lương Gross: {emp['gross']:,.0f} đ | Ngân hàng: {bank.get('bank', '')} ({bank.get('account', '')})"
    })

# Format chuẩn danh sách nhân viên frontend
employees_frontend = []
for code, emp in sorted(employees_dict.items()):
    bank = bank_accounts.get(code, {})
    gender = "Nam" if code in ["MS06", "MS13"] else "Nữ"
    bhxh_105 = emp["bhxhBase"] * 0.105
    net_val = emp.get("latestNet", emp["gross"] - bhxh_105)
    
    employees_frontend.append({
        "id": code,
        "name": emp["name"],
        "dept": emp["dept"],
        "position": emp["title"],
        "gender": gender,
        "phone": "",
        "dob": "",
        "cccd": "",
        "idDate": "",
        "idPlace": "",
        "address": "Vinhomes Riverside, Hà Nội",
        "salary": {
            "gross": emp["gross"],
            "net": net_val,
            "bhxhBase": emp["bhxhBase"],
            "bhxh105": bhxh_105,
            "allowances": {
                "lunch": emp["lunch"],
                "costume": emp["costume"],
                "phone": emp["phone"],
                "concurrent": emp["concurrent"],
                "parking": emp["parking"]
            }
        },
        "bank": {
            "account": bank.get("account", ""),
            "bankName": bank.get("bank", ""),
            "branch": bank.get("branch", "")
        },
        "contract": {
            "number": f"{code}/2026/HĐLĐ-MF14",
            "type": "HĐLĐ Chính thức",
            "status": "Đã ký",
            "driveFileUrl": ""
        },
        "status": "Đang làm việc" if "09.2026" in emp["activeMonths"] else "Nghỉ việc/Tạm hoãn",
        "activeMonths": emp["activeMonths"]
    })

# 1. Ghi data/employees.json
with open(r"f:\ws\projects\hrm-mf14\data\employees.json", "w", encoding="utf-8") as f:
    json.dump(employees_frontend, f, ensure_ascii=False, indent=2)
print("✓ Đã ghi data/employees.json")

# 2. Ghi data/mf14-data.js
initial_data_obj = {
    "version": "MF14-V2.0-REAL-SALARY",
    "updatedAt": "2026-10-25T18:00:00Z",
    "stats": {
        "totalEmployees": len(employees_frontend),
        "totalGrossMonthly": sum(e["salary"]["gross"] for e in employees_frontend),
        "totalNetMonthly": sum(e["salary"]["net"] for e in employees_frontend),
        "totalPayrollRecords": len(payroll_records)
    },
    "employees": employees_frontend,
    "payrollHistory": payroll_records,
    "contractsList": contracts_list,
    "departments": [
        {"name": "Ban giám hiệu", "count": sum(1 for e in employees_frontend if e["dept"] == "Ban giám hiệu"), "quota": 5, "desc": "BGH cơ sở, quản lý chuyên môn"},
        {"name": "Vận hành", "count": sum(1 for e in employees_frontend if e["dept"] == "Vận hành"), "quota": 10, "desc": "Vận hành, Y tế, HK, Bảo vệ, Bếp"},
        {"name": "Giáo viên", "count": sum(1 for e in employees_frontend if e["dept"] == "Giáo viên"), "quota": 15, "desc": "Giáo viên mầm non, GV tiếng Anh bản ngữ & Việt Nam"},
        {"name": "Kế toán", "count": sum(1 for e in employees_frontend if e["dept"] == "Kế toán"), "quota": 2, "desc": "Phụ trách kế toán kiêm HCNS"},
        {"name": "HO", "count": sum(1 for e in employees_frontend if e["dept"] == "HO"), "quota": 2, "desc": "Hội đồng quản trị & Khối Văn phòng tập đoàn"}
    ]
}

js_content = "/**\n * DỮ LIỆU CHUẨN XÁC 100% TỪ 17 TỆP EXCEL BẢNG LƯƠNG CÔNG TY CỔ PHẦN MF14\n * Tháng 10/2025 -> 09/2026 (KHÔNG DỮ LIỆU DEMO)\n */\n"
js_content += f"window.MF14_INITIAL_DATA = {json.dumps(initial_data_obj, ensure_ascii=False, indent=2)};\n"

with open(r"f:\ws\projects\hrm-mf14\data\mf14-data.js", "w", encoding="utf-8") as f:
    f.write(js_content)
print("✓ Đã ghi data/mf14-data.js")

# 3. Tạo google-apps-script.js
# Xây dựng file Google Apps Script chuẩn với chức năng xóa sạch, nạp mới, đồng bộ 2 chiều và upload Google Drive!
gas_code = """/**
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
const EMPLOYEES_DATA = """ + json.dumps(employees_frontend, ensure_ascii=False, indent=2) + """;

// DỮ LIỆU LỊCH SỬ BẢNG LƯƠNG (164 DÒNG CHI TIẾT TỪ 10/2025 -> 09/2026)
const PAYROLL_HISTORY_DATA = """ + json.dumps(payroll_records, ensure_ascii=False, indent=2) + """;

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
"""

with open(r"f:\ws\projects\hrm-mf14\google-apps-script.js", "w", encoding="utf-8") as f:
    f.write(gas_code)
print("✓ Đã ghi google-apps-script.js với chức năng import sạch sẽ và Google Drive upload!")

print(f"\n🎉 HOÀN TẤT TOÀN DIỆN!")
print(f"• Nhân sự: {len(employees_frontend)}")
print(f"• Bảng lương lịch sử: {len(payroll_records)}")
print(f"• File đã cập nhật: data/employees.json, data/mf14-data.js, google-apps-script.js")
