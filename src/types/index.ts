export interface SalaryInfo {
  gross: number;
  net: number;
  bhxhBase: number;
  bhxh105: number;
  probation?: number;
  allowances?: {
    lunch?: number;
    costume?: number;
    phone?: number;
    concurrent?: number;
    parking?: number;
  };
}

export interface BankInfo {
  account: string;
  bankName: string;
  branch: string;
}

export interface ContractDetails {
  number: string;
  type: string;
  status: string;
  driveFileUrl?: string;
  fileName?: string;
  startDate?: string;
  endDate?: string;
  daysLeft?: string;
}

export interface Employee {
  id: string; // MS01 -> MS30
  name: string;
  dept: string;
  position: string;
  gender: string;
  phone: string;
  dob: string;
  cccd: string;
  idDate: string;
  idPlace: string;
  address: string;
  status: string;
  salary: SalaryInfo;
  bank: BankInfo;
  contract?: ContractDetails;
  contract_tv?: {
    number?: string;
    startDate?: string;
    endDate?: string;
    daysLeft?: string;
  };
  contract_ct?: {
    number?: string;
    startDate?: string;
    endDate?: string;
    daysLeft?: string;
  };
  ktCheck?: string;
  note?: string;
  activeMonths?: string[];
}

export interface ContractItem {
  empId: string;
  name: string;
  dept: string;
  position: string;
  tvNumber?: string;
  tvPeriod?: string;
  tvDaysLeft?: string;
  ctNumber?: string;
  ctPeriod?: string;
  ctDaysLeft?: string;
  status: string;
  ktCheck?: string;
  note?: string;
  driveFileUrl?: string;
  fileData?: string;
  fileName?: string;
  fileSize?: number;
  hasChunks?: boolean;
}

export interface PayrollRecord {
  empId: string;
  name: string;
  dept: string;
  title: string;
  month: string; // e.g. "09.2026", "10.2025"
  scope: string;
  status: string;
  workDays: number;
  baseSalary: number;
  actualBase: number;
  bonusHQCV: number;
  totalGross: number;
  bhxhDeduction: number;
  tax: number;
  net: number;
  isAutoCalculated?: boolean;
}

export type AttendanceStatus =
  | "X"
  | "x"
  | "N1"
  | "On"
  | "ON"
  | "on"
  | "On/2"
  | "on/2"
  | "P"
  | "p"
  | "P1"
  | "C"
  | "c"
  | "C/2"
  | "c/2"
  | "L"
  | "l"
  | "L1"
  | "L/2"
  | "K"
  | "k"
  | "O"
  | "o"
  | "TS"
  | "ts"
  | ""
  | string;

export interface EmployeeTimesheetRow {
  empId: string;
  name: string;
  dept: string;
  position?: string;
  status?: string;
  days: Record<number, AttendanceStatus>; // 1 -> 31
  xDays: number;            // Đủ công
  halfDays: number;         // Nửa công (N1)
  onlineDays: number;       // Online (On)
  weekendWorkDays: number;  // Làm T7, CN (C)
  paidLeaveDays: number;    // Phép (P, P1)
  holidayDays: number;      // Lễ Tết (L, L1)
  unpaidDays: number;       // Không lương (K)
  totalPaidDays: number;    // Tổng công tính lương
  standardDays: number;     // Số công chuẩn tháng
}

export interface MonthlyTimesheet {
  month: string; // "10.2026", "09.2026"
  year: number;
  monthNumber: number;
  daysInMonth: number;
  standardDays: number;
  records: Record<string, EmployeeTimesheetRow>;
  updatedAt?: string;
  isPartialMonth?: boolean; // Tháng chưa hết (tính đến ngày hiện tại)
  calculatedToDay?: number; // Ngày tính đến
}

