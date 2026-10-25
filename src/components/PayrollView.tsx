import React, { useState, useMemo } from "react";
import { Search, Calendar, Download, ArrowUpDown, ArrowUp, ArrowDown, CalendarCheck, Sparkles, ExternalLink, FileText } from "lucide-react";
import type { PayrollRecord, MonthlyTimesheet, Employee } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";
import { PayslipModal } from "./PayslipModal";
import * as XLSX from "xlsx";

interface PayrollViewProps {
  payroll: PayrollRecord[];
  timesheets?: Record<string, MonthlyTimesheet>;
  employees?: Employee[];
  onOpenEmployeeDrawer: (empId: string) => void;
  onNavigateToTimesheet?: (month?: string) => void;
}

type PayrollSortField = 
  | "empId" 
  | "name" 
  | "dept" 
  | "scope" 
  | "workDays" 
  | "baseSalary" 
  | "bonusHQCV" 
  | "totalGross" 
  | "bhxhDeduction" 
  | "tax" 
  | "net";

type SortOrder = "asc" | "desc";

export const PayrollView: React.FC<PayrollViewProps> = ({
  payroll,
  timesheets = {},
  employees = [],
  onOpenEmployeeDrawer,
  onNavigateToTimesheet
}) => {
  // Lấy danh sách tháng có trong dữ liệu payroll và timesheets
  const availableMonths = useMemo(() => {
    const set = new Set(payroll.map(p => p.month).filter(Boolean));
    Object.keys(timesheets).forEach(m => set.add(m));
    const now = new Date();
    const curMonthKey = `${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
    set.add(curMonthKey);
    set.add("10.2026");
    set.add("09.2026");

    return Array.from(set).sort((a, b) => {
      const [m1, y1] = a.split(".").map(Number);
      const [m2, y2] = b.split(".").map(Number);
      return (y2 * 12 + m2) - (y1 * 12 + m1);
    });
  }, [payroll, timesheets]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || "10.2026");
  const [searchTerm, setSearchTerm] = useState("");

  // Sắp xếp
  const [sortField, setSortField] = useState<PayrollSortField>("empId");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: PayrollSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: PayrollSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={12} className="text-emerald-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown size={12} className="text-emerald-700 shrink-0 font-bold" />
    );
  };

  // Thông tin chấm công của tháng được chọn
  const activeTimesheet = useMemo(() => {
    return timesheets[selectedMonth] || null;
  }, [timesheets, selectedMonth]);

  // Dữ liệu tháng được chọn (Tự động tính lương từ Bảng Chấm Công)
  const monthRecords = useMemo(() => {
    const existing = payroll.filter(p => p.month === selectedMonth);

    // Nếu không có dữ liệu payroll tĩnh hoặc có timesheet -> đồng bộ/tính toán theo timesheet
    if (activeTimesheet) {
      const standardDays = activeTimesheet.standardDays || 22;
      const empMap = new Map(employees.map(e => [e.id, e]));
      const existingMap = new Map(existing.map(p => [p.empId, p]));

      // Duyệt qua tất cả nhân viên có bản ghi chấm công
      const tsRecords = Object.values(activeTimesheet.records);

      if (tsRecords.length > 0) {
        return tsRecords.map(ts => {
          const emp = empMap.get(ts.empId);
          const oldPay = existingMap.get(ts.empId);

          const workDays = ts.totalPaidDays;
          const baseSalary = emp?.salary?.gross || oldPay?.baseSalary || 10000000;
          const bhxhBase = emp?.salary?.bhxhBase || 5000000;

          // Lương thực tế theo ngày công: (Lương cơ bản / công chuẩn) * ngày công
          const actualBase = Math.round((baseSalary / standardDays) * workDays);

          // Phụ cấp ăn trưa theo số ngày đi làm thực tế
          const lunchPerDay = Math.round((emp?.salary?.allowances?.lunch ?? 730000) / standardDays);
          const lunchTotal = Math.round(lunchPerDay * (ts.xDays + ts.onlineDays + ts.halfDays * 0.5));

          // Các phụ cấp khác
          const phone = emp?.salary?.allowances?.phone || 0;
          const costume = emp?.salary?.allowances?.costume || 0;
          const bonusHQCV = oldPay?.bonusHQCV || 0;

          // Tổng Gross
          const totalGross = actualBase + lunchTotal + phone + costume + bonusHQCV;

          // Trích đóng BHXH (10.5% nếu làm việc >= 14 ngày công trong tháng)
          const bhxhDeduction = workDays >= 14 ? Math.round(bhxhBase * 0.105) : 0;

          // Thuế TNCN (giảm trừ gia cảnh 11 triệu VND)
          const taxableIncome = Math.max(0, totalGross - bhxhDeduction - 11000000);
          const tax = taxableIncome > 0 ? Math.round(taxableIncome * 0.05) : 0;

          // Thực lĩnh Net
          const net = totalGross - bhxhDeduction - tax;

          return {
            empId: ts.empId,
            name: ts.name || emp?.name || "",
            dept: ts.dept || emp?.dept || "HO",
            title: ts.position || emp?.position || "Nhân viên",
            month: selectedMonth,
            scope: oldPay?.scope || "HO",
            status: ts.status || emp?.status || "Chính Thức",
            workDays,
            baseSalary,
            actualBase,
            bonusHQCV,
            totalGross,
            bhxhDeduction,
            tax,
            net,
            isAutoCalculated: true
          } as PayrollRecord;
        });
      }
    }

    return existing;
  }, [payroll, selectedMonth, activeTimesheet, employees]);

  // Thống kê KPI tháng
  const stats = useMemo(() => {
    const totalGross = monthRecords.reduce((s, p) => s + (p.totalGross || 0), 0);
    const totalNet = monthRecords.reduce((s, p) => s + (p.net || 0), 0);
    const totalBhxh = monthRecords.reduce((s, p) => s + (p.bhxhDeduction || 0), 0);
    const totalTax = monthRecords.reduce((s, p) => s + (p.tax || 0), 0);
    return {
      count: monthRecords.length,
      totalGross,
      totalNet,
      totalBhxh,
      totalTax
    };
  }, [monthRecords]);

  // Bộ lọc & Sắp xếp dữ liệu
  const processedRecords = useMemo(() => {
    const filtered = !searchTerm
      ? monthRecords
      : monthRecords.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.dept.toLowerCase().includes(searchTerm.toLowerCase())
        );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "empId":
          comparison = (a.empId || "").localeCompare(b.empId || "", undefined, { numeric: true });
          break;
        case "name": {
          const nameA = a.name.trim().split(" ").slice(-1)[0] || a.name;
          const nameB = b.name.trim().split(" ").slice(-1)[0] || b.name;
          comparison = nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
          if (comparison === 0) comparison = a.name.localeCompare(b.name, "vi");
          break;
        }
        case "dept":
          comparison = (a.dept || "").localeCompare(b.dept || "", "vi");
          break;
        case "scope":
          comparison = (a.scope || "").localeCompare(b.scope || "", "vi");
          break;
        case "workDays":
          comparison = (a.workDays || 0) - (b.workDays || 0);
          break;
        case "baseSalary":
          comparison = (a.baseSalary || 0) - (b.baseSalary || 0);
          break;
        case "bonusHQCV":
          comparison = (a.bonusHQCV || 0) - (b.bonusHQCV || 0);
          break;
        case "totalGross":
          comparison = (a.totalGross || 0) - (b.totalGross || 0);
          break;
        case "bhxhDeduction":
          comparison = (a.bhxhDeduction || 0) - (b.bhxhDeduction || 0);
          break;
        case "tax":
          comparison = (a.tax || 0) - (b.tax || 0);
          break;
        case "net":
          comparison = (a.net || 0) - (b.net || 0);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [monthRecords, searchTerm, sortField, sortOrder]);

  // State xem phiếu lương PDF
  const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecord | null>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  // Nhân viên tương ứng với phiếu lương đang chọn
  const selectedEmployee = useMemo(() => {
    if (!selectedPayslipRecord) return null;
    return employees.find(e => e.id === selectedPayslipRecord.empId) || null;
  }, [selectedPayslipRecord, employees]);

  // Dòng chấm công tương ứng với phiếu lương đang chọn
  const selectedTimesheetRow = useMemo(() => {
    if (!selectedPayslipRecord || !activeTimesheet) return null;
    return activeTimesheet.records[selectedPayslipRecord.empId] || null;
  }, [selectedPayslipRecord, activeTimesheet]);

  // Xuất bảng lương riêng của tháng
  const handleExportMonthExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows = processedRecords.map((p, idx) => ({
      "STT": idx + 1,
      "Mã NV": p.empId,
      "Họ và tên": p.name,
      "Phòng ban": p.dept,
      "Chức vụ": p.title,
      "Cơ sở": p.scope,
      "Ngày công": p.workDays,
      "Lương cơ bản": p.baseSalary,
      "Lương thực tế": p.actualBase,
      "HQCV / Thưởng": p.bonusHQCV,
      "Tổng Gross": p.totalGross,
      "Trừ BHXH (10.5%)": p.bhxhDeduction,
      "Thuế TNCN": p.tax,
      "Thực lĩnh (Net)": p.net
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, `Luong_${selectedMonth}`);
    XLSX.writeFile(wb, `BangLuong_MF14_Thang_${selectedMonth.replace(".", "_")}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Banner thông báo tự động tính từ Chấm Công */}
      {activeTimesheet && (
        <div className="bg-emerald-900/90 border border-emerald-700/50 p-3.5 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  ⚡ Bảng lương tự động tính từ Bảng Chấm Công (Tháng {selectedMonth})
                </span>
                {activeTimesheet.isPartialMonth ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    Tạm tính lũy kế đến ngày {activeTimesheet.calculatedToDay || new Date().getDate()}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-800 text-emerald-200">
                    Đủ công cả tháng ({activeTimesheet.standardDays} ngày chuẩn)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/90 mt-0.5">
                Ngày công thực tế, lương thực nhận, phụ cấp ăn trưa và bảo hiểm được tính toán thời gian thực theo từng ngày công.
              </p>
            </div>
          </div>

          {onNavigateToTimesheet && (
            <button
              onClick={() => onNavigateToTimesheet(selectedMonth)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <CalendarCheck size={14} />
              <span>Xem Bảng Chấm Công</span>
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}

      {/* Month Selector & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Chọn tháng */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Kỳ tính lương:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã NV..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Nút xuất Excel tháng */}
        <button
          onClick={handleExportMonthExcel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Download size={15} />
          <span>Xuất Excel Tháng {selectedMonth}</span>
        </button>
      </div>

      {/* KPI Thống kê quỹ lương tháng (Format tiền Việt Nam '.') */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Số người nhận lương
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatNumber(stats.count)} <span className="text-xs text-slate-500 font-medium font-sans">nhân sự</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng thu nhập (Gross)
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {formatCurrency(stats.totalGross)} <span className="text-xs text-slate-500 font-medium font-sans">đ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Trừ BHXH (10.5%)
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 font-mono">
            {formatCurrency(stats.totalBhxh)} <span className="text-xs text-slate-500 font-medium font-sans">đ</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng thực lĩnh (Net)
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            {formatCurrency(stats.totalNet)} <span className="text-xs text-slate-500 font-medium font-sans">đ</span>
          </div>
        </div>
      </div>

      {/* Bảng Chi Tiết Lương (Ghim Table Header & Cho phép Sort ở các cột) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider select-none shadow-xs">
              <tr>
                <th
                  onClick={() => handleSort("empId")}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Mã NV</span>
                    {renderSortIcon("empId")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Họ và tên</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dept")}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Phòng ban</span>
                    {renderSortIcon("dept")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("scope")}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Cơ sở</span>
                    {renderSortIcon("scope")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("workDays")}
                  className="py-3 px-2 text-center cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Công</span>
                    {renderSortIcon("workDays")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("baseSalary")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lương cơ bản</span>
                    {renderSortIcon("baseSalary")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("bonusHQCV")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Thưởng HQCV</span>
                    {renderSortIcon("bonusHQCV")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("totalGross")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Tổng Gross</span>
                    {renderSortIcon("totalGross")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("bhxhDeduction")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Trừ BHXH</span>
                    {renderSortIcon("bhxhDeduction")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("tax")}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Thuế TNCN</span>
                    {renderSortIcon("tax")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("net")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group bg-emerald-50/50"
                >
                  <div className="flex items-center justify-end gap-1 text-emerald-800">
                    <span>Thực lĩnh Net</span>
                    {renderSortIcon("net")}
                  </div>
                </th>
                <th className="py-3 px-3 text-center border-l border-slate-200 text-slate-700 min-w-[100px]">
                  Phiếu lương (PDF)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 font-sans">
                    Không có bản ghi lương nào trong tháng {selectedMonth}.
                  </td>
                </tr>
              ) : (
                processedRecords.map((p, idx) => (
                  <tr key={`${p.empId}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-emerald-700">
                      {p.empId}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-800">
                      <button
                        onClick={() => onOpenEmployeeDrawer(p.empId)}
                        className="hover:text-emerald-600 transition-colors cursor-pointer text-left"
                      >
                        {p.name}
                      </button>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {p.title || "–"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">
                      {p.dept}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">
                      {p.scope}
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-700">
                      {p.workDays}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {p.baseSalary ? `${formatCurrency(p.baseSalary)} đ` : "–"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      {p.bonusHQCV ? `${formatCurrency(p.bonusHQCV)} đ` : "0 đ"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {p.totalGross ? `${formatCurrency(p.totalGross)} đ` : "–"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-700 font-medium">
                      {p.bhxhDeduction ? `${formatCurrency(p.bhxhDeduction)} đ` : "0 đ"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">
                      {p.tax ? `${formatCurrency(p.tax)} đ` : "0 đ"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-800 bg-emerald-50/40 text-xs">
                      {p.net ? `${formatCurrency(p.net)} đ` : "–"}
                    </td>
                    <td className="py-2.5 px-3 text-center border-l border-slate-100 font-sans">
                      <button
                        onClick={() => {
                          setSelectedPayslipRecord(p);
                          setIsPayslipModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                        title="Tải phiếu lương định dạng PDF mẫu chuẩn sheet 8"
                      >
                        <FileText size={12} className="text-emerald-600" />
                        <span>Tải PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>
            Bảng lương tháng <strong>{selectedMonth}</strong> • Tổng {processedRecords.length} nhân sự (Bấm vào tiêu đề cột để sắp xếp)
          </span>
          <span>Dữ liệu số tiền làm tròn, phân cách hàng nghìn theo chuẩn Việt Nam (.)</span>
        </div>
      </div>

      {/* Modal Phiếu Lương PDF */}
      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => {
          setIsPayslipModalOpen(false);
          setSelectedPayslipRecord(null);
        }}
        record={selectedPayslipRecord}
        employee={selectedEmployee}
        timesheetRow={selectedTimesheetRow}
        standardDays={activeTimesheet?.standardDays || 22}
      />
    </div>
  );
};
