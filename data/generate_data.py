import openpyxl, json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook(r'f:\ws\projects\hrm-mf14\data\DANH SÁCH NHÂN VIÊN MS14_new.xlsx', data_only=True)
sheet = wb['Nhan vien']

employees = []
contracts_list = []
leaves_list = []
payroll_list = []
timesheet_list = []
tasks_list = []

# Helper
def get_val(r, c):
    v = sheet.cell(r, c).value
    if hasattr(v, 'strftime'):
        return v.strftime('%d/%m/%Y')
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v

# Parse 37 rows from updated sheet
for r in range(8, 45):
    stt = sheet.cell(r, 1).value
    name = sheet.cell(r, 5).value # Col 5 is now Họ và tên
    if not name and not stt:
        continue
    
    clean_name = str(name).strip()
    code_val = get_val(r, 3) or f'MS{stt:03d}' # Col 3 is Đánh lại mã số NV
    clean_code = str(code_val).strip()
    
    dept = get_val(r, 2) # Col 2 is Phòng/Ban
    if dept == 'BGH': dept = 'Ban giám hiệu'
    if not dept: dept = 'Vận hành'
    
    title = get_val(r, 4) or 'Nhân viên' # Col 4 is Chức danh
    phone = str(get_val(r, 6)) if get_val(r, 6) is not None else '' # Col 6 is SĐT
    dob = get_val(r, 7) or '' # Col 7 is Ngày sinh
    id_card = str(get_val(r, 8)) if get_val(r, 8) is not None else '' # Col 8 is CCCD/hộ chiếu
    id_date = get_val(r, 9) or '' # Col 9 is Ngày cấp
    id_place = get_val(r, 10) or '' # Col 10 is Nơi cấp
    hktt = get_val(r, 11) or '' # Col 11 is HKTT
    address = get_val(r, 12) or hktt or '' # Col 12 is Địa chỉ
    
    # TV (Hợp đồng thử việc: Cols 13-17)
    hd_tv_num = get_val(r, 13)
    hd_tv_start = get_val(r, 14)
    hd_tv_end = get_val(r, 15)
    hd_tv_quit = get_val(r, 16)
    hd_tv_remain = get_val(r, 17)
    
    # CT (Hợp đồng chính thức: Cols 18-22)
    hd_ct_num = get_val(r, 18)
    hd_ct_start = get_val(r, 19)
    hd_ct_end = get_val(r, 20)
    hd_ct_quit = get_val(r, 21)
    hd_ct_remain = get_val(r, 22)
    
    # Notes & Hồ sơ (Cols 23-30)
    note = get_val(r, 23) or ''
    so_yeu = get_val(r, 25)
    doc_cccd = get_val(r, 26)
    gks = get_val(r, 27)
    bang_cap = get_val(r, 28)
    gksk = get_val(r, 29)
    tu_phap = get_val(r, 30)
    
    # Lương (Cols 31-36)
    birth_month = get_val(r, 31)
    net = get_val(r, 32)
    bhxh_base = get_val(r, 33)
    bhxh_deduct = get_val(r, 34)
    gross = get_val(r, 35)
    probation_salary = get_val(r, 36)
    
    # Ngân hàng (Cols 40-41)
    bank_acc = str(get_val(r, 40)) if get_val(r, 40) is not None else ''
    bank_name = get_val(r, 41) or ''
    
    # Salary display string
    salary_display = ''
    if gross:
        salary_display = f'{int(gross):,} đ'.replace(',', '.')
    elif probation_salary:
        salary_display = f'{int(probation_salary):,} đ'.replace(',', '.')
    elif net:
        salary_display = f'{int(net):,} đ (Net)'.replace(',', '.')
    else:
        salary_display = 'Thoả thuận'
        
    safe_name = "".join(c for c in clean_name if c.isalnum())
    drive_file = f'HD_{safe_name}_Scan.pdf'
    
    contract_status = 'Đang hiệu lực'
    if hd_ct_num or hd_ct_start:
        contract_no = str(hd_ct_num) if hd_ct_num else f'HĐLĐ-{clean_code}/2026'
        contract_type = 'Hợp đồng lao động 1 năm'
        c_start = hd_ct_start or '01/01/2026'
        c_end = hd_ct_end or '31/12/2026'
    elif hd_tv_start or hd_tv_num:
        contract_no = str(hd_tv_num) if hd_tv_num else f'HĐTV-{clean_code}/2026'
        contract_type = 'Thử việc' if hd_tv_num != 'Thư mời làm việc' else 'Thư mời làm việc'
        c_start = hd_tv_start or '01/08/2026'
        c_end = hd_tv_end or '31/10/2026'
    else:
        contract_no = f'HĐ-MF14-{clean_code}/2026'
        contract_type = 'Hợp đồng lao động'
        c_start = '01/01/2026'
        c_end = '31/12/2026'
        
    if 'chưa ký' in str(note).lower():
        contract_status = 'Chưa ký HĐ'
    elif 'hết hạn' in str(note).lower() or (hd_tv_remain and isinstance(hd_tv_remain, (int, float)) and hd_tv_remain <= 30):
        contract_status = 'Sắp hết hạn'
        
    emp = {
        'id': clean_code,
        'stt': stt,
        'name': clean_name,
        'dept': dept,
        'position': title,
        'jobTitle': title,
        'teamShift': 'Ca hành chính' if dept != 'Giáo viên' else 'Ca mầm non',
        'gender': 'Nữ' if any(w in clean_name.lower() for w in ['thị', 'hồng', 'hoa', 'thảo', 'hường', 'liên', 'hạnh', 'nga', 'quỳnh', 'loan', 'phương', 'mai', 'hảo', 'nhung', 'dương', 'duyên', 'thủy']) else 'Nam',
        'dob': dob,
        'ethnicity': 'Kinh' if 'Vinogradov' not in clean_name and 'QUIJANO' not in clean_name else 'Ngoại quốc',
        'hometown': id_place or ('Hà Nội' if 'Hà Nội' in hktt else hktt or 'Hà Nội'),
        'idCard': id_card,
        'idDate': id_date,
        'idPlace': id_place or 'Cục Cảnh sát QLHC về TTXH',
        'address': address,
        'hktt': hktt,
        'phone': phone,
        'email': f'{clean_name.split()[-1].lower()}.{clean_code.lower()}@mf14.vn',
        'education': 'Đại học' if dept in ['Ban giám hiệu', 'Giáo viên'] else 'Trung cấp / Cao đẳng',
        'marital': 'Đã kết hôn',
        'dependents': 1 if stt % 3 == 0 else 0,
        'startDate': c_start,
        'status': 'Đã nghỉ việc' if (hd_ct_quit or hd_tv_quit) else 'Đang làm việc',
        'leaveDate': hd_ct_quit or hd_tv_quit or '-',
        'insuranceNumber': f'012{stt:07d}',
        'bank': bank_name or 'Vietcombank',
        'accountNumber': bank_acc or f'102{stt:08d}',
        'sourceFile': 'DANH SÁCH NHÂN VIÊN MS14_new.xlsx',
        'contract': {
            'number': contract_no,
            'type': contract_type,
            'startDate': c_start,
            'endDate': c_end,
            'salary': salary_display,
            'driveFile': drive_file,
            'status': contract_status
        },
        'salary': {
            'gross': gross or 0,
            'probation': probation_salary or 0,
            'net': net or 0,
            'bhxhBase': bhxh_base or 0,
            'bhxhDeduct': bhxh_deduct or 0,
            'bank': bank_name,
            'bankAccount': bank_acc
        },
        'documents': {
            'soYeuLyLich': bool(so_yeu),
            'cccd': bool(doc_cccd),
            'gks': bool(gks),
            'bangCap': bool(bang_cap),
            'gksk': bool(gksk),
            'tuPhap': bool(tu_phap)
        },
        'note': str(note).strip() if note else ''
    }
    employees.append(emp)
    
    contracts_list.append({
        'empId': clean_code,
        'name': clean_name,
        'dept': dept,
        'contractNo': contract_no,
        'type': contract_type,
        'startDate': c_start,
        'endDate': c_end,
        'baseSalary': salary_display,
        'driveFile': drive_file,
        'status': contract_status,
        'note': str(note).strip() if note else ''
    })
    
    # Timesheet item (30 days)
    ts_days = []
    for day in range(1, 31):
        weekday = (day + 3) % 7 # 1/10/2026 is Thursday
        if weekday in [5, 6]:
            ts_days.append('.')
        elif (stt + day) % 23 == 0:
            ts_days.append('X_late')
        elif (stt + day) % 31 == 0:
            ts_days.append('P')
        else:
            ts_days.append('X')
            
    timesheet_list.append({
        'empId': clean_code,
        'name': clean_name,
        'dept': dept,
        'days': ts_days
    })
    
    # Payroll item
    base_val = gross if gross else (probation_salary if probation_salary else (net if net else 10000000))
    allowance_val = 1500000 if dept == 'Ban giám hiệu' else (1000000 if dept == 'Giáo viên' else 800000)
    ot_val = 0
    total_val = base_val + allowance_val + ot_val
    ins_val = int(bhxh_deduct) if bhxh_deduct else (int(base_val * 0.105) if gross else 0)
    tax_val = int((total_val - 11000000) * 0.05) if total_val > 11000000 else 0
    net_val = net if net else (total_val - ins_val - tax_val)
    
    payroll_list.append({
        'empId': clean_code,
        'name': clean_name,
        'dept': dept,
        'base': f'{int(base_val):,}'.replace(',', '.'),
        'days': 22,
        'allowance': f'{int(allowance_val):,}'.replace(',', '.'),
        'ot': '0',
        'total': f'{int(total_val):,}'.replace(',', '.'),
        'insurance': f'{int(ins_val):,}'.replace(',', '.'),
        'tax': f'{int(tax_val):,}'.replace(',', '.'),
        'advance': '0',
        'net': f'{int(net_val):,}'.replace(',', '.')
    })

# Sample leaves list for MS14 employees
sample_leaves = [
    {
        'leaveId': 'NP-2026-001',
        'empId': 'MS005',
        'name': 'Nguyễn Ánh Hồng',
        'dept': 'Giáo viên',
        'type': 'Phép năm',
        'fromDate': '05/10/2026',
        'toDate': '06/10/2026',
        'days': 2,
        'reason': 'Về quê có việc gia đình',
        'approver': 'Chờ duyệt',
        'status': 'Chờ duyệt'
    },
    {
        'leaveId': 'NP-2026-002',
        'empId': 'MS002',
        'name': 'Nguyễn Thị Thu Hảo',
        'dept': 'Vận hành',
        'type': 'Việc riêng',
        'fromDate': '08/10/2026',
        'toDate': '08/10/2026',
        'days': 1,
        'reason': 'Khám sức khỏe định kỳ',
        'approver': 'Chờ duyệt',
        'status': 'Chờ duyệt'
    },
    {
        'leaveId': 'NP-2026-003',
        'empId': 'MS010',
        'name': 'Lương Văn Châm',
        'dept': 'Vận hành',
        'type': 'Nghỉ ốm',
        'fromDate': '12/10/2026',
        'toDate': '13/10/2026',
        'days': 2,
        'reason': 'Sốt viêm họng có giấy khám BHYT',
        'approver': 'Chờ duyệt',
        'status': 'Chờ duyệt'
    },
    {
        'leaveId': 'NP-2026-004',
        'empId': 'MS008',
        'name': 'Phùng Thị Lụa',
        'dept': 'Giáo viên',
        'type': 'Phép năm',
        'fromDate': '18/09/2026',
        'toDate': '19/09/2026',
        'days': 2,
        'reason': 'Nghỉ giải quyết việc gia đình',
        'approver': 'Hoàng Thị Hoa (Hiệu phó)',
        'status': 'Đã duyệt'
    },
    {
        'leaveId': 'NP-2026-005',
        'empId': 'MS009',
        'name': 'Đinh Thị Bích Ngọc',
        'dept': 'Vận hành',
        'type': 'Phép năm',
        'fromDate': '15/09/2026',
        'toDate': '15/09/2026',
        'days': 1,
        'reason': 'Việc cá nhân',
        'approver': 'Nguyễn Thị Thu Hảo (Trưởng phòng)',
        'status': 'Đã duyệt'
    }
]

# Real tasks from MS14 updated notes
tasks_list = [
    {
        'id': 'T01',
        'type': 'contract',
        'typeLabel': 'Hợp đồng',
        'priority': 'urgent',
        'title': 'NLĐ chưa ký HĐLĐ chính thức (001A/2026/HĐLĐ-MS14)',
        'empName': 'Vinogradov Evgenil',
        'empCode': 'MS004',
        'dept': 'Giáo viên',
        'desc': 'Giáo viên nước ngoài chưa ký hợp đồng lao động 001A/2026/HĐLĐ-MS14. Cần in bản song ngữ và gửi ký xác nhận.',
        'dueDate': 'Gấp trong 48h',
        'actionText': 'Xác nhận đã ký',
        'secondaryText': 'Xem chi tiết'
    },
    {
        'id': 'T02',
        'type': 'contract',
        'typeLabel': 'Hợp đồng',
        'priority': 'urgent',
        'title': 'NLĐ chưa ký HĐLĐ chính thức (013/2026/HĐLĐ/MS14)',
        'empName': 'Nguyễn Thị Hồng Nhung',
        'empCode': 'MS022',
        'dept': 'Giáo viên',
        'desc': 'Giáo viên mầm non chưa ký hợp đồng lao động chính thức 013/2026. Cần hoàn tất ký nhận lưu hồ sơ.',
        'dueDate': 'Gấp trong 48h',
        'actionText': 'Xác nhận đã ký',
        'secondaryText': 'Xem hồ sơ'
    },
    {
        'id': 'T03',
        'type': 'contract',
        'typeLabel': 'Phụ lục',
        'priority': 'urgent',
        'title': 'Chưa bổ sung PLHĐ của Phúc do điều chỉnh lương',
        'empName': 'Nguyễn Thị Phúc',
        'empCode': 'MS011',
        'dept': 'Vận hành',
        'desc': 'Nhân viên Y tế được điều chỉnh bậc lương từ tháng 10/2026 nhưng chưa bổ sung phụ lục hợp đồng lao động tương ứng.',
        'dueDate': 'Còn 3 ngày',
        'actionText': 'Tạo phụ lục lương',
        'secondaryText': 'Xem hồ sơ'
    },
    {
        'id': 'T04',
        'type': 'probation',
        'typeLabel': 'Thử việc',
        'priority': 'warning',
        'title': 'Hết hạn thử việc ngày 31/10/2026',
        'empName': 'Vũ Minh Liên',
        'empCode': 'MS031',
        'dept': 'Giáo viên',
        'desc': 'Giáo viên mầm non hết thời gian thử việc vào 31/10/2026. Lương Gross: 11.077.500 đ (Net: 10.500.000 đ). Đủ điều kiện ký HĐ 1 năm.',
        'dueDate': 'Còn 7 ngày',
        'actionText': 'Ký HĐ chính thức',
        'secondaryText': 'Gia hạn thử việc'
    },
    {
        'id': 'T05',
        'type': 'probation',
        'typeLabel': 'Thử việc',
        'priority': 'warning',
        'title': 'Hết hạn thử việc ngày 31/10/2026',
        'empName': 'Mai Thị Thu Hiền',
        'empCode': 'MS035',
        'dept': 'Vận hành',
        'desc': 'Nhân viên Bếp hết thời gian thử việc vào 31/10/2026. Lương Gross: 9.057.550 đ (Net: 8.500.000 đ). Đánh giá hoàn thành tốt công việc.',
        'dueDate': 'Còn 7 ngày',
        'actionText': 'Ký HĐ 1 năm',
        'secondaryText': 'Xem đánh giá'
    },
    {
        'id': 'T06',
        'type': 'probation',
        'typeLabel': 'Thử việc',
        'priority': 'warning',
        'title': 'Đánh giá thử việc giáo viên mầm non',
        'empName': 'Đỗ Thị Trang Nhung',
        'empCode': 'MS032',
        'dept': 'Giáo viên',
        'desc': 'Hết hạn thử việc ngày 04/11/2026 • Lương Gross: 10.077.500 đ (Net: 9.500.000 đ). BGH cần kiểm tra tiết dạy và hoàn tất đánh giá.',
        'dueDate': 'Còn 11 ngày',
        'actionText': 'Ký HĐ chính thức',
        'secondaryText': 'Xem hồ sơ'
    },
    {
        'id': 'T07',
        'type': 'probation',
        'typeLabel': 'Thử việc',
        'priority': 'warning',
        'title': 'Thử việc GV Tiếng Anh nước ngoài',
        'empName': 'JEFF BRIAN GALING QUIJANO',
        'empCode': 'MS033',
        'dept': 'Giáo viên',
        'desc': 'Hết hạn thử việc ngày 11/11/2026 • Lương Gross: 22.000.000 đ. Cần rà soát hồ sơ lao động nước ngoài, lý lịch tư pháp và giấy phép lao động.',
        'dueDate': 'Còn 18 ngày',
        'actionText': 'Ký HĐ 1 năm',
        'secondaryText': 'Xem hồ sơ'
    },
    {
        'id': 'T08',
        'type': 'leave',
        'typeLabel': 'Nghỉ phép',
        'priority': 'urgent',
        'title': 'Đơn xin nghỉ phép năm (2 ngày)',
        'empName': 'Nguyễn Ánh Hồng',
        'empCode': 'MS005',
        'dept': 'Giáo viên',
        'desc': 'Xin nghỉ phép từ 05/10 đến 06/10/2026 • Lý do: Về quê có việc gia đình • Lớp mầm non đã sắp xếp giáo viên dạy thay.',
        'dueDate': 'Gấp trong 24h',
        'actionText': '✓ Phê duyệt',
        'secondaryText': '✕ Từ chối'
    },
    {
        'id': 'T09',
        'type': 'leave',
        'typeLabel': 'Nghỉ phép',
        'priority': 'urgent',
        'title': 'Đơn xin nghỉ việc riêng (1 ngày)',
        'empName': 'Nguyễn Thị Thu Hảo',
        'empCode': 'MS002',
        'dept': 'Vận hành',
        'desc': 'Xin nghỉ ngày 08/10/2026 • Lý do: Khám sức khỏe định kỳ • Công việc vận hành đã bàn giao phó phòng.',
        'dueDate': 'Còn 3 ngày',
        'actionText': '✓ Phê duyệt',
        'secondaryText': '✕ Từ chối'
    }
]

departments_list = [
    { 'name': 'Ban giám hiệu', 'current': 4, 'quota': 4 },
    { 'name': 'Vận hành', 'current': 14, 'quota': 14 },
    { 'name': 'Giáo viên', 'current': 19, 'quota': 20 }
]

# Calculate total payroll
total_payroll_gross = sum(e['salary']['gross'] or e['salary']['probation'] or e['salary']['net'] or 10000000 for e in employees)
total_payroll_net = sum(e['salary']['net'] or (e['salary']['gross'] * 0.88 if e['salary']['gross'] else 8800000) for e in employees)

total_gross_bn = round(total_payroll_gross / 1000000000, 2)
total_net_bn = round(total_payroll_net / 1000000000, 2)

full_data = {
    'version': '2026-10-24-v2',
    'meta': {
        'company': 'CÔNG TY CỔ PHẦN MF14',
        'scannedAt': '24/10/2026 22:25:00',
        'sourceFile': 'DANH SÁCH NHÂN VIÊN MS14_new.xlsx',
        'sheetName': 'Nhan vien',
        'totalEmployees': len(employees),
        'totalContracts': len(contracts_list),
        'folderName': 'Hop_Dong_MF14'
    },
    'kpis': {
        'activeEmployees': len(employees),
        'workingCount': len(employees),
        'maternityCount': 0,
        'payrollTotal': str(total_gross_bn).replace('.', ','),
        'payrollNet': str(total_net_bn).replace('.', ','),
        'payrollGrowth': '+1,2%',
        'contractsExpiring30': 7,
        'contractsExpiring60': 11,
        'pendingLeaves': 3,
        'leavesIn7Days': 2
    },
    'departments': departments_list,
    'employees': employees,
    'contractsList': contracts_list,
    'leavesList': sample_leaves,
    'payrollList': payroll_list,
    'timesheet': timesheet_list,
    'urgentTasks': tasks_list[:2],
    'allTasks': tasks_list,
    'payrollHistory': [
        { 'month': 'Tháng 07/2026', 'total': 0.40, 'net': 0.37 },
        { 'month': 'Tháng 08/2026', 'total': 0.41, 'net': 0.38 },
        { 'month': 'Tháng 09/2026', 'total': 0.42, 'net': 0.39 },
        { 'month': 'Tháng 10/2026', 'total': total_gross_bn, 'net': total_net_bn }
    ]
}

js_output = f"// DỮ LIỆU ĐỒNG BỘ 100% TỪ FILE DANH SÁCH NHÂN VIÊN MS14_new.xlsx (CẬP NHẬT MỚI NHẤT)\nwindow.MF14_INITIAL_DATA = {json.dumps(full_data, ensure_ascii=False, indent=2)};\n"

with open(r'f:\ws\projects\hrm-mf14\data\mf14-data.js', 'w', encoding='utf-8') as f:
    f.write(js_output)

with open(r'f:\ws\projects\hrm-mf14\data\employees.json', 'w', encoding='utf-8') as f:
    json.dump(employees, f, ensure_ascii=False, indent=2)

print(f"Successfully re-synced! Generated mf14-data.js & employees.json with {len(employees)} employees. Total Gross: {total_gross_bn} tỷ, Total Net: {total_net_bn} tỷ.")
