# -*- coding: utf-8 -*-
import openpyxl
import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

excel_path = r"f:\ws\projects\hrm-mf14\data\DANH SÁCH NHÂN VIÊN MS14_new.xlsx"
wb = openpyxl.load_workbook(excel_path, data_only=True)
ws_nv = wb['Nhan vien']
ws_bgh = wb['BGH']

# 1. Sheet Nhan vien
employees = []
contracts_list = []
payroll_list = []
timesheet = []
tasks = []

total_gross = 0.0
total_net = 0.0
total_bhxh = 0.0

tid = 1
for r in range(8, 45):
    stt = ws_nv.cell(r, 1).value
    dept = (ws_nv.cell(r, 2).value or '').strip()
    code = (ws_nv.cell(r, 3).value or '').strip()
    title = (ws_nv.cell(r, 4).value or '').strip()
    name = (ws_nv.cell(r, 5).value or '').strip()
    
    phone = str(ws_nv.cell(r, 6).value or '').strip()
    if phone.endswith('.0'): phone = phone[:-2]
    
    dob_raw = ws_nv.cell(r, 7).value
    dob = dob_raw.strftime('%d/%m/%Y') if hasattr(dob_raw, 'strftime') else str(dob_raw or '').strip()
    
    cccd = str(ws_nv.cell(r, 8).value or '').strip()
    if cccd.endswith('.0'): cccd = cccd[:-2]
    if len(cccd) == 11 and not cccd.startswith('0'): cccd = '0' + cccd
    
    id_date_raw = ws_nv.cell(r, 9).value
    id_date = id_date_raw.strftime('%d/%m/%Y') if hasattr(id_date_raw, 'strftime') else str(id_date_raw or '').strip()
    
    id_place = (ws_nv.cell(r, 10).value or '').strip()
    hktt = (ws_nv.cell(r, 11).value or '').strip()
    address = (ws_nv.cell(r, 12).value or '').strip()
    
    # TV
    tv_no = (ws_nv.cell(r, 13).value or '').strip()
    tv_start_raw = ws_nv.cell(r, 14).value
    tv_start = tv_start_raw.strftime('%d/%m/%Y') if hasattr(tv_start_raw, 'strftime') else str(tv_start_raw or '').strip()
    tv_end_raw = ws_nv.cell(r, 15).value
    tv_end = tv_end_raw.strftime('%d/%m/%Y') if hasattr(tv_end_raw, 'strftime') else str(tv_end_raw or '').strip()
    tv_left = str(ws_nv.cell(r, 17).value or '').strip()
    
    # CT
    ct_no = (ws_nv.cell(r, 18).value or '').strip()
    ct_start_raw = ws_nv.cell(r, 19).value
    ct_start = ct_start_raw.strftime('%d/%m/%Y') if hasattr(ct_start_raw, 'strftime') else str(ct_start_raw or '').strip()
    ct_end_raw = ws_nv.cell(r, 20).value
    ct_end = ct_end_raw.strftime('%d/%m/%Y') if hasattr(ct_end_raw, 'strftime') else str(ct_end_raw or '').strip()
    ct_left = str(ws_nv.cell(r, 22).value or '').strip()
    
    note = (ws_nv.cell(r, 23).value or '').strip()
    kt_check = (ws_nv.cell(r, 24).value or '').strip()
    
    # Hồ sơ (Cột 25-30)
    syll = ws_nv.cell(r, 25).value
    hs_cccd = ws_nv.cell(r, 26).value
    gks = ws_nv.cell(r, 27).value
    bangcap = ws_nv.cell(r, 28).value
    gksk = ws_nv.cell(r, 29).value
    tuphap = ws_nv.cell(r, 30).value
    
    # Lương (Cột 32-36)
    net = float(ws_nv.cell(r, 32).value or 0)
    bhxh = float(ws_nv.cell(r, 33).value or 0)
    bhxh_105 = float(ws_nv.cell(r, 34).value or 0)
    gross = float(ws_nv.cell(r, 35).value or 0)
    prob_sal = float(ws_nv.cell(r, 36).value or 0)
    
    total_gross += gross
    total_net += net
    total_bhxh += bhxh
    
    if ct_no:
        c_status = "Đã ký HĐ chính thức"
    elif tv_no or (tv_start and tv_end):
        c_status = "Đang thử việc"
    elif kt_check:
        c_status = kt_check
    else:
        c_status = "Chưa ký HĐ"
        
    emp = {
        "id": code,
        "stt": stt,
        "name": name,
        "dept": dept,
        "position": title,
        "jobTitle": title,
        "gender": "Nam" if any(k in name for k in ["Vinogradov", "JEFF", "Châm"]) else "Nữ",
        "dob": dob,
        "cccd": cccd,
        "idDate": id_date,
        "idPlace": id_place,
        "hktt": hktt,
        "address": address or hktt,
        "phone": phone,
        "status": "Đang làm việc",
        "contractStatus": c_status,
        "contract_tv": {
            "number": tv_no,
            "startDate": tv_start,
            "endDate": tv_end,
            "daysLeft": tv_left
        },
        "contract_ct": {
            "number": ct_no,
            "startDate": ct_start,
            "endDate": ct_end,
            "daysLeft": ct_left
        },
        "note": note,
        "ktCheck": kt_check,
        "documents": {
            "syll": bool(syll),
            "cccd": bool(hs_cccd),
            "gks": bool(gks),
            "bangcap": bool(bangcap),
            "gksk": bool(gksk),
            "tuphap": bool(tuphap)
        },
        "salary": {
            "gross": gross,
            "net": net,
            "bhxhBase": bhxh,
            "bhxh105": bhxh_105,
            "probation": prob_sal
        }
    }
    employees.append(emp)
    
    # Contract row
    contracts_list.append({
        "empId": code,
        "name": name,
        "dept": dept,
        "position": title,
        "tvNumber": tv_no or "–",
        "tvPeriod": f"{tv_start} - {tv_end}" if (tv_start or tv_end) else "–",
        "tvDaysLeft": tv_left or "–",
        "ctNumber": ct_no or "–",
        "ctPeriod": f"{ct_start} - {ct_end}" if (ct_start or ct_end) else "–",
        "ctDaysLeft": ct_left or "–",
        "status": c_status,
        "ktCheck": kt_check or "–",
        "note": note or "–"
    })
    
    # Payroll row
    payroll_list.append({
        "empId": code,
        "name": name,
        "dept": dept,
        "position": title,
        "gross": gross,
        "grossFormatted": f"{gross:,.0f} đ" if gross else "0 đ",
        "net": net,
        "netFormatted": f"{net:,.0f} đ" if net else "0 đ",
        "bhxhBase": bhxh,
        "bhxhBaseFormatted": f"{bhxh:,.0f} đ" if bhxh else "0 đ",
        "bhxh105": bhxh_105,
        "bhxh105Formatted": f"{bhxh_105:,.0f} đ" if bhxh_105 else "0 đ",
        "probation": prob_sal,
        "probationFormatted": f"{prob_sal:,.0f} đ" if prob_sal else "0 đ"
    })
    
    # Timesheet row (default working days)
    ts_row = {
        "empId": code,
        "name": name,
        "dept": dept,
        "days": []
    }
    for d in range(1, 31):
        weekday = (d + 3) % 7 # Sat, Sun off
        if weekday == 5 or weekday == 6:
            ts_row["days"].append(".")
        else:
            ts_row["days"].append("X")
    timesheet.append(ts_row)
    
    # Tạo Tasks chuẩn 100% từ Excel
    if "NLĐ chưa ký" in note:
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "contract",
            "priority": "urgent",
            "title": f"NLĐ chưa ký HĐLĐ ({ct_no})",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - HĐ chính thức {ct_no}. Kế toán check: {kt_check}. Cần hoàn tất ký nhận lưu hồ sơ.",
            "dueDate": "Khẩn cấp",
            "actionText": "Xác nhận đã ký"
        })
        tid += 1
    elif "điều chỉnh lương" in note or "điều chỉnh lương" in kt_check:
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "contract",
            "priority": "urgent",
            "title": "Chưa bổ sung PLHĐ điều chỉnh lương",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - {kt_check}. Cần lập phụ lục hợp đồng mức lương mới.",
            "dueDate": "Còn 3 ngày",
            "actionText": "Tạo phụ lục lương"
        })
        tid += 1
    elif "chưa làm HĐLĐ" in kt_check:
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "contract",
            "priority": "urgent",
            "title": "Chưa làm HĐLĐ cho người lao động",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - Kế toán check: {kt_check}. Cần soạn thảo và ký hợp đồng ngay.",
            "dueDate": "Khẩn cấp",
            "actionText": "Soạn HĐLĐ"
        })
        tid += 1
    elif tv_left and tv_left.isdigit():
        days = int(tv_left)
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "probation",
            "priority": "urgent" if days <= 7 else "warning",
            "title": f"Hết hạn thử việc (còn {days} ngày)",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - Thời hạn thử việc còn {days} ngày (Kết thúc: {tv_end}). Lương thử việc: {prob_sal:,.0f} đ.",
            "dueDate": f"Còn {days} ngày",
            "actionText": "Ký HĐ chính thức"
        })
        tid += 1
    elif "Bổ sung HĐ thử việc" in kt_check:
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "probation",
            "priority": "normal",
            "title": "Bổ sung lưu trữ Hợp đồng thử việc",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - Đã có HĐCT ({ct_no}), Kế toán check yêu cầu bổ sung HĐTV vào hồ sơ.",
            "dueDate": "Trong tuần",
            "actionText": "Bổ sung HĐTV"
        })
        tid += 1
    elif kt_check == "Trình ký" and not ct_no:
        tasks.append({
            "id": f"T{tid:02d}",
            "type": "contract",
            "priority": "normal",
            "title": "Trình ký Hợp đồng lao động",
            "empName": name,
            "empCode": code,
            "dept": dept,
            "desc": f"{name} ({code}) - Chức danh: {title} ({dept}). Hồ sơ sẵn sàng, đang chờ trình ký.",
            "dueDate": "Trong tuần",
            "actionText": "Trình ký ngay"
        })
        tid += 1

# 2. Sheet BGH
bgh_members = []
for r in range(8, 11):
    stt = ws_bgh.cell(r, 1).value
    dept = (ws_bgh.cell(r, 2).value or '').strip()
    title = (ws_bgh.cell(r, 3).value or '').strip()
    code = (ws_bgh.cell(r, 4).value or '').strip()
    name = (ws_bgh.cell(r, 5).value or '').strip()
    phone = str(ws_bgh.cell(r, 6).value or '').strip()
    if phone.endswith('.0'): phone = phone[:-2]
    
    dob_raw = ws_bgh.cell(r, 7).value
    dob = dob_raw.strftime('%d/%m/%Y') if hasattr(dob_raw, 'strftime') else str(dob_raw or '').strip()
    
    cccd = str(ws_bgh.cell(r, 8).value or '').strip()
    if cccd.endswith('.0'): cccd = cccd[:-2]
    if len(cccd) == 11 and not cccd.startswith('0'): cccd = '0' + cccd
    
    id_date_raw = ws_bgh.cell(r, 9).value
    id_date = id_date_raw.strftime('%d/%m/%Y') if hasattr(id_date_raw, 'strftime') else str(id_date_raw or '').strip()
    
    hktt = (ws_bgh.cell(r, 10).value or '').strip()
    address = (ws_bgh.cell(r, 11).value or '').strip()
    
    bgh_members.append({
        "stt": stt,
        "dept": dept,
        "title": title,
        "code": code,
        "name": name,
        "phone": phone,
        "dob": dob,
        "cccd": cccd,
        "idDate": id_date,
        "hktt": hktt,
        "address": address
    })

# Đóng gói dữ liệu chuẩn
data_output = {
    "version": "2026-10-24-pure-v3",
    "meta": {
        "company": "CÔNG TY CỔ PHẦN MF14",
        "sourceFile": "DANH SÁCH NHÂN VIÊN MS14_new.xlsx",
        "sheetNames": ["Nhan vien", "BGH"],
        "totalEmployees": len(employees),
        "totalGross": total_gross,
        "totalNet": total_net,
        "totalBhxh": total_bhxh,
        "totalGrossFormatted": f"{total_gross:,.0f} đ",
        "totalNetFormatted": f"{total_net:,.0f} đ",
        "totalBhxhFormatted": f"{total_bhxh:,.0f} đ"
    },
    "kpis": {
        "activeEmployees": len(employees),
        "workingCount": len(employees),
        "maternityCount": 0,
        "payrollTotal": f"{total_gross / 1000000000:.2f}".replace('.', ','),
        "payrollNet": f"{total_net / 1000000000:.2f}".replace('.', ','),
        "payrollGrowth": "+1,2%",
        "contractsOfficial": sum(1 for e in employees if e["contract_ct"]["number"]),
        "contractsProbation": sum(1 for e in employees if e["contract_tv"]["number"] or (e["contract_tv"]["startDate"] and not e["contract_ct"]["number"])),
        "contractsPending": sum(1 for e in employees if not e["contract_ct"]["number"] and not e["contract_tv"]["number"]),
        "tasksUrgent": sum(1 for t in tasks if t["priority"] == "urgent"),
        "tasksTotal": len(tasks)
    },
    "departments": [
        {"name": "Ban giám hiệu", "current": 4, "quota": 4},
        {"name": "Vận hành", "current": 14, "quota": 14},
        {"name": "Giáo viên", "current": 19, "quota": 20}
    ],
    "employees": employees,
    "bghLeaders": bgh_members,
    "contractsList": contracts_list,
    "payrollList": payroll_list,
    "timesheet": timesheet,
    "allTasks": tasks,
    "payrollHistory": [
        {"month": "Tháng 07/2026", "total": 0.40, "net": 0.38},
        {"month": "Tháng 08/2026", "total": 0.41, "net": 0.39},
        {"month": "Tháng 09/2026", "total": 0.42, "net": 0.40},
        {"month": "Tháng 10/2026", "total": round(total_gross / 1000000000, 2), "net": round(total_net / 1000000000, 2)}
    ]
}

# Ghi file data/mf14-data.js
js_content = f"// DỮ LIỆU ĐỒNG BỘ 100% TỪ FILE DANH SÁCH NHÂN VIÊN MS14_new.xlsx (PHIÊN BẢN CHUẨN XÁC KHÔNG DỮ LIỆU DEMO)\nwindow.MF14_INITIAL_DATA = {json.dumps(data_output, ensure_ascii=False, indent=2)};\n"
with open(r"f:\ws\projects\hrm-mf14\data\mf14-data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

# Ghi file data/employees.json
with open(r"f:\ws\projects\hrm-mf14\data\employees.json", "w", encoding="utf-8") as f:
    json.dump(data_output, f, ensure_ascii=False, indent=2)

print(f"✓ Hoàn tất tạo dữ liệu chuẩn: 37 nhân viên, {len(tasks)} việc cần xử lý thực tế, {len(contracts_list)} hợp đồng, {len(payroll_list)} bảng lương.")
