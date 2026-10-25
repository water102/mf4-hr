import * as XLSX from "xlsx";
import type { Employee, ContractItem, PayrollRecord } from "../types";

export function exportHRMDataToExcel(
  employees: Employee[],
  contracts: ContractItem[],
  payroll: PayrollRecord[]
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Danh sách nhân sự
  const empRows = employees.map((emp, idx) => ({
    "STT": idx + 1,
    "Mã NV": emp.id,
    "Họ và tên": emp.name,
    "Phòng ban": emp.dept,
    "Vị trí / Chức danh": emp.position,
    "Giới tính": emp.gender || "–",
    "Ngày sinh": emp.dob || "–",
    "Số CCCD": emp.cccd || "–",
    "Số điện thoại": emp.phone || "–",
    "Địa chỉ": emp.address || "–",
    "Lương Gross (VNĐ)": emp.salary?.gross || 0,
    "Lương Net (VNĐ)": emp.salary?.net || 0,
    "Lương đóng BHXH (VNĐ)": emp.salary?.bhxhBase || 0,
    "Trạng thái": emp.status || "Đang làm việc",
    "Tài khoản NH": emp.bank?.account || "–",
    "Ngân hàng": emp.bank?.bankName || "–"
  }));
  const wsEmp = XLSX.utils.json_to_sheet(empRows);
  XLSX.utils.book_append_sheet(wb, wsEmp, "Danh Sách Nhân Sự");

  // Sheet 2: Quản lý Hợp đồng lao động
  const contractRows = contracts.map((c, idx) => ({
    "STT": idx + 1,
    "Mã NV": c.empId,
    "Họ và tên": c.name,
    "Phòng ban": c.dept,
    "Vị trí": c.position,
    "Số HĐ Thử việc": c.tvNumber || "–",
    "Thời hạn Thử việc": c.tvPeriod || "–",
    "Hạn còn lại (TV)": c.tvDaysLeft || "–",
    "Số HĐ Chính thức": c.ctNumber || "–",
    "Thời hạn HĐCT": c.ctPeriod || "–",
    "Hạn còn lại (CT)": c.ctDaysLeft || "–",
    "Trạng thái HĐ": c.status,
    "Ghi chú": c.note || "–"
  }));
  const wsContract = XLSX.utils.json_to_sheet(contractRows);
  XLSX.utils.book_append_sheet(wb, wsContract, "Theo Dõi Hợp Đồng");

  // Sheet 3: Lịch sử Bảng lương 12 tháng (10/2025 - 09/2026)
  const payrollRows = payroll.map((p, idx) => ({
    "STT": idx + 1,
    "Tháng": p.month,
    "Mã NV": p.empId,
    "Họ và tên": p.name,
    "Phòng ban": p.dept,
    "Chức vụ": p.title,
    "Cơ sở / Đơn vị": p.scope,
    "Loại HĐ": p.status,
    "Ngày công": p.workDays,
    "Lương cơ bản": p.baseSalary,
    "Lương thực tế": p.actualBase,
    "HQCV / Thưởng": p.bonusHQCV,
    "Tổng thu nhập (Gross)": p.totalGross,
    "Trừ BHXH (10.5%)": p.bhxhDeduction,
    "Thuế TNCN": p.tax,
    "Thực lĩnh (Net)": p.net
  }));
  const wsPayroll = XLSX.utils.json_to_sheet(payrollRows);
  XLSX.utils.book_append_sheet(wb, wsPayroll, "Lịch Sử Bảng Lương");

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  XLSX.writeFile(wb, `BaoCao_NhanSu_TienLuong_MF14_${dateStr}.xlsx`);
}
