import * as XLSX from "xlsx";
import type { AttendanceStatus, EmployeeTimesheetRow, MonthlyTimesheet, Employee } from "../types";

/**
 * Trả về số ngày trong tháng (28, 29, 30, 31)
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Kiểm tra xem ngày đó có phải là cuối tuần không
 * 0: Chủ Nhật, 6: Thứ Bảy
 */
export function isWeekend(year: number, month: number, day: number): boolean {
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Lấy tên thứ tiếng Việt (T2, T3, T4, T5, T6, T7, CN)
 */
export function getDayOfWeekName(year: number, month: number, day: number): string {
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  switch (dayOfWeek) {
    case 0: return "CN";
    case 1: return "T2";
    case 2: return "T3";
    case 3: return "T4";
    case 4: return "T5";
    case 5: return "T6";
    case 6: return "T7";
    default: return "";
  }
}

/**
 * Tính số ngày làm việc tiêu chuẩn trong tháng (các ngày từ Thứ 2 đến Thứ 6)
 */
export function calculateStandardDays(year: number, month: number): number {
  const days = getDaysInMonth(year, month);
  let standard = 0;
  for (let d = 1; d <= days; d++) {
    if (!isWeekend(year, month, d)) {
      standard++;
    }
  }
  return standard || 22;
}

/**
 * Tính toán các tổng số công từ mảng ngày
 */
export function calculateRowTotals(
  days: Record<number, AttendanceStatus>,
  maxDay: number,
  standardDays: number
): {
  xDays: number;
  halfDays: number;
  onlineDays: number;
  weekendWorkDays: number;
  paidLeaveDays: number;
  holidayDays: number;
  unpaidDays: number;
  totalPaidDays: number;
  standardDays: number;
} {
  let xDays = 0;
  let halfDays = 0;
  let onlineDays = 0;
  let weekendWorkDays = 0;
  let paidLeaveDays = 0;
  let holidayDays = 0;
  let unpaidDays = 0;
  let totalPaidDays = 0;

  for (let d = 1; d <= maxDay; d++) {
    const rawVal = days[d];
    if (!rawVal) continue;
    const val = String(rawVal).trim();

    if (val === "X" || val === "x") {
      xDays += 1;
      totalPaidDays += 1;
    } else if (val === "N1") {
      halfDays += 1;
      totalPaidDays += 0.5;
    } else if (val === "On" || val === "ON" || val === "on") {
      onlineDays += 1;
      totalPaidDays += 1;
    } else if (val === "On/2" || val === "on/2") {
      onlineDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "P" || val === "p") {
      paidLeaveDays += 1;
      totalPaidDays += 1;
    } else if (val === "P1") {
      paidLeaveDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "C" || val === "c") {
      weekendWorkDays += 1;
      totalPaidDays += 1;
    } else if (val === "C/2" || val === "c/2") {
      weekendWorkDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "L" || val === "l") {
      holidayDays += 1;
      totalPaidDays += 1;
    } else if (val === "L1" || val === "L/2" || val === "l1") {
      holidayDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "K" || val === "k" || val === "O" || val === "o") {
      unpaidDays += 1;
    } else if (val === "TS" || val === "ts") {
      // Thai sản (hưởng BHXH, 0 công tính lương cty)
    }
  }

  return {
    xDays,
    halfDays,
    onlineDays,
    weekendWorkDays,
    paidLeaveDays,
    holidayDays,
    unpaidDays,
    totalPaidDays,
    standardDays
  };
}

/**
 * Tự động tạo bảng chấm công mặc định cho một tháng
 * Quy tắc:
 * - Tháng chưa hết (tháng hiện tại): Mặc định có đi làm (X) từ đầu tháng tới ngày hiện tại!
 * - Tháng trong quá khứ: Mặc định đi làm đủ công cả tháng.
 * - Tháng trong tương lai: Để trống.
 */
export function generateDefaultMonthlyTimesheet(
  employees: Employee[],
  monthStr: string // "MM.YYYY" e.g. "10.2026"
): MonthlyTimesheet {
  const [mStr, yStr] = monthStr.split(".");
  const monthNumber = parseInt(mStr, 10);
  const year = parseInt(yStr, 10);
  const daysInMonth = getDaysInMonth(year, monthNumber);
  const standardDays = calculateStandardDays(year, monthNumber);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  let maxDayToFill = daysInMonth;
  let isPartialMonth = false;
  let calculatedToDay = daysInMonth;

  if (year === currentYear && monthNumber === currentMonth) {
    // Tháng hiện tại (chưa hết tháng)
    maxDayToFill = Math.min(daysInMonth, currentDay);
    isPartialMonth = true;
    calculatedToDay = maxDayToFill;
  } else if (year > currentYear || (year === currentYear && monthNumber > currentMonth)) {
    // Tháng tương lai
    maxDayToFill = 0;
    isPartialMonth = false;
    calculatedToDay = 0;
  }

  const records: Record<string, EmployeeTimesheetRow> = {};

  for (const emp of employees) {
    const days: Record<number, AttendanceStatus> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      if (d <= maxDayToFill) {
        if (isWeekend(year, monthNumber, d)) {
          days[d] = ""; // Nghỉ T7, CN
        } else {
          days[d] = "X"; // Mặc định có đi làm
        }
      } else {
        days[d] = ""; // Chưa tới ngày
      }
    }

    const totals = calculateRowTotals(days, calculatedToDay, standardDays);

    records[emp.id] = {
      empId: emp.id,
      name: emp.name,
      dept: emp.dept,
      position: emp.position,
      status: emp.status,
      days,
      ...totals
    };
  }

  return {
    month: monthStr,
    year,
    monthNumber,
    daysInMonth,
    standardDays,
    records,
    isPartialMonth,
    calculatedToDay,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Xuất dữ liệu chấm công ra file Excel đúng mẫu sheet 3
 */
export function exportTimesheetToExcel(timesheet: MonthlyTimesheet): void {
  const wb = XLSX.utils.book_new();

  const headers = [
    "STT",
    "Mã NV",
    "Phòng ban",
    "Chức danh",
    "Họ & Tên"
  ];

  // Thêm các ngày 1..daysInMonth
  for (let d = 1; d <= timesheet.daysInMonth; d++) {
    const dayName = getDayOfWeekName(timesheet.year, timesheet.monthNumber, d);
    headers.push(`${d} (${dayName})`);
  }

  headers.push(
    "Đủ công (X)",
    "Nửa công (N1)",
    "Online (On)",
    "Cuối tuần (C)",
    "Phép (P)",
    "Lễ Tết (L)",
    "Không Lương (K)",
    "Tổng công tính lương",
    "Công chuẩn tháng"
  );

  const rows: any[] = [];
  const empList = Object.values(timesheet.records);

  empList.forEach((r, idx) => {
    const row: any[] = [
      idx + 1,
      r.empId,
      r.dept,
      r.position || "",
      r.name
    ];

    for (let d = 1; d <= timesheet.daysInMonth; d++) {
      row.push(r.days[d] || "");
    }

    row.push(
      r.xDays,
      r.halfDays,
      r.onlineDays,
      r.weekendWorkDays,
      r.paidLeaveDays,
      r.holidayDays,
      r.unpaidDays,
      r.totalPaidDays,
      r.standardDays
    );

    rows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, "3. BẢNG CHẤM CÔNG");
  XLSX.writeFile(wb, `BangChamCong_MF14_Thang_${timesheet.month.replace(".", "_")}.xlsx`);
}

/**
 * Đọc file Excel tải lên để import sheet "3. BẢNG CHẤM CÔNG"
 */
export async function parseTimesheetFromExcel(
  file: File,
  employees: Employee[]
): Promise<MonthlyTimesheet> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array" });

  const sheetName = wb.SheetNames.find(
    s => s.includes("CHẤM CÔNG") || s.includes("BẢNG CHẤM CÔNG")
  ) || wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  const json: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Tìm tháng/năm từ sheet hoặc tên file
  let month = 10;
  let year = 2026;

  // Thử tìm trong các hàng đầu
  for (let r = 0; r < Math.min(10, json.length); r++) {
    const row = json[r];
    if (!row) continue;
    for (let c = 0; c < row.length; c++) {
      const cell = String(row[c] || "");
      const match = cell.match(/tháng\s*([0-9]{1,2})[\/._]([0-9]{4})/i);
      if (match) {
        month = parseInt(match[1], 10);
        year = parseInt(match[2], 10);
        break;
      }
    }
  }

  // Thử tìm theo tên file nếu không thấy
  const fileNameMatch = file.name.match(/(?:tháng|Tháng|Bảng lương_)?\s*([0-9]{2})[._]([0-9]{4})/i);
  if (fileNameMatch) {
    month = parseInt(fileNameMatch[1], 10);
    year = parseInt(fileNameMatch[2], 10);
  }

  const monthStr = `${String(month).padStart(2, "0")}.${year}`;
  const daysInMonth = getDaysInMonth(year, month);
  const standardDays = calculateStandardDays(year, month);

  // Tạo khung timesheet ban đầu
  const resultTimesheet = generateDefaultMonthlyTimesheet(employees, monthStr);

  // Tìm hàng bắt đầu chứa dữ liệu nhân viên (thường row[1] bắt đầu bằng MS)
  for (let r = 5; r < json.length; r++) {
    const row = json[r];
    if (!row || !row[1]) continue;
    const empId = String(row[1]).trim();
    if (!empId.startsWith("MS")) continue;

    const days: Record<number, AttendanceStatus> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const val = row[6 + d];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        days[d] = String(val).trim() as AttendanceStatus;
      } else {
        days[d] = "";
      }
    }

    const totals = calculateRowTotals(days, daysInMonth, standardDays);

    const empInfo = employees.find(e => e.id === empId);

    resultTimesheet.records[empId] = {
      empId,
      name: String(row[5] || empInfo?.name || ""),
      dept: String(row[2] || empInfo?.dept || ""),
      position: String(row[3] || empInfo?.position || ""),
      status: empInfo?.status || "Đang làm việc",
      days,
      ...totals
    };
  }

  resultTimesheet.updatedAt = new Date().toISOString();
  return resultTimesheet;
}
