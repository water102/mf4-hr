import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Calendar,
  Search,
  Upload,
  Download,
  Save,
  CheckCircle2,
  CalendarCheck,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import type {
  MonthlyTimesheet,
  AttendanceStatus,
  Employee
} from "../types";
import {
  getDayOfWeekName,
  isWeekend,
  calculateRowTotals,
  exportTimesheetToExcel,
  parseTimesheetFromExcel,
  generateDefaultMonthlyTimesheet
} from "../utils/timesheet";

interface TimesheetViewProps {
  timesheets: Record<string, MonthlyTimesheet>;
  employees: Employee[];
  onSaveTimesheet: (timesheet: MonthlyTimesheet) => Promise<void>;
  onOpenEmployeeDrawer: (empId: string) => void;
}

const STATUS_OPTIONS: { code: AttendanceStatus; label: string; desc: string; color: string }[] = [
  { code: "X", label: "X", desc: "Đủ công (1)", color: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold" },
  { code: "N1", label: "N1", desc: "Nửa công (0.5)", color: "bg-amber-100 text-amber-800 border-amber-300 font-bold" },
  { code: "On", label: "On", desc: "Làm Online (1)", color: "bg-sky-100 text-sky-800 border-sky-300 font-bold" },
  { code: "P", label: "P", desc: "Nghỉ phép (1)", color: "bg-purple-100 text-purple-800 border-purple-300 font-bold" },
  { code: "P1", label: "P1", desc: "Nửa phép (0.5)", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { code: "L", label: "L", desc: "Nghỉ Lễ (1)", color: "bg-rose-100 text-rose-800 border-rose-300 font-bold" },
  { code: "K", label: "K", desc: "Không lương (0)", color: "bg-slate-200 text-slate-800 border-slate-300 font-bold" },
  { code: "C", label: "C", desc: "Làm T7/CN (1)", color: "bg-pink-100 text-pink-800 border-pink-300 font-bold" },
  { code: "", label: "-", desc: "Nghỉ cuối tuần / Chưa chấm", color: "bg-transparent text-slate-400" }
];

export const TimesheetView: React.FC<TimesheetViewProps> = ({
  timesheets,
  employees,
  onSaveTimesheet,
  onOpenEmployeeDrawer
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách các tháng có sẵn
  const availableMonths = useMemo(() => {
    const set = new Set(Object.keys(timesheets));
    // Luôn bao gồm tháng hiện tại
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
  }, [timesheets]);

  const todayDate = useMemo(() => new Date().getDate(), []);
  const currentMonthNum = useMemo(() => new Date().getMonth() + 1, []);
  const currentYearNum = useMemo(() => new Date().getFullYear(), []);
  const currentMonthKey = `${String(currentMonthNum).padStart(2, "0")}.${currentYearNum}`;

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || currentMonthKey);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Khởi tạo activeTimesheet
  const [activeTimesheet, setActiveTimesheet] = useState<MonthlyTimesheet>(() => {
    if (timesheets[selectedMonth]) return timesheets[selectedMonth];
    return generateDefaultMonthlyTimesheet(employees, selectedMonth);
  });

  // Chỉ đồng bộ lại khi người dùng chọn THÁNG KHÁC (selectedMonth thay đổi)
  useEffect(() => {
    if (timesheets[selectedMonth]) {
      const ts = timesheets[selectedMonth];
      // Đảm bảo đủ nhân sự nếu có nhân sự mới
      const mergedRecords = { ...ts.records };
      let hasNew = false;
      for (const emp of employees) {
        if (!mergedRecords[emp.id]) {
          hasNew = true;
          const days: Record<number, AttendanceStatus> = {};
          const isCurrent = selectedMonth === currentMonthKey;
          const maxDay = isCurrent ? Math.min(ts.daysInMonth, todayDate) : ts.daysInMonth;
          for (let d = 1; d <= ts.daysInMonth; d++) {
            if (d <= maxDay && !isWeekend(ts.year, ts.monthNumber, d)) {
              days[d] = "X";
            } else {
              days[d] = "";
            }
          }
          const totals = calculateRowTotals(days, ts.daysInMonth, ts.standardDays);
          mergedRecords[emp.id] = {
            empId: emp.id,
            name: emp.name,
            dept: emp.dept,
            position: emp.position,
            status: emp.status,
            days,
            ...totals
          };
        }
      }
      setActiveTimesheet(hasNew ? { ...ts, records: mergedRecords } : ts);
    } else {
      const defaultTs = generateDefaultMonthlyTimesheet(employees, selectedMonth);
      setActiveTimesheet(defaultTs);
    }
  }, [selectedMonth, timesheets, employees, currentMonthKey, todayDate]);

  // Kiểm tra tháng đang chọn có phải tháng hiện tại không
  const isCurrentMonth = useMemo(() => {
    const [m, y] = selectedMonth.split(".").map(Number);
    return m === currentMonthNum && y === currentYearNum;
  }, [selectedMonth, currentMonthNum, currentYearNum]);

  // Đổi trạng thái 1 ngày công (click chuột trái xoay vòng trạng thái)
  const handleToggleDay = (empId: string, day: number) => {
    const record = activeTimesheet.records[empId];
    if (!record) return;

    const currentStatus = record.days[day] || "";
    // Xoay vòng trạng thái: "" -> X -> N1 -> On -> P -> L -> K -> ""
    const cycle: AttendanceStatus[] = ["", "X", "N1", "On", "P", "L", "K"];
    const nextIndex = (cycle.indexOf(currentStatus) + 1) % cycle.length;
    const nextStatus = cycle[nextIndex];

    const newDays = { ...record.days, [day]: nextStatus };
    const totals = calculateRowTotals(newDays, activeTimesheet.daysInMonth, activeTimesheet.standardDays);

    const updated: MonthlyTimesheet = {
      ...activeTimesheet,
      records: {
        ...activeTimesheet.records,
        [empId]: {
          ...record,
          days: newDays,
          ...totals
        }
      },
      updatedAt: new Date().toISOString()
    };

    setActiveTimesheet(updated);
    // Gọi onSaveTimesheet ngoài callback, tránh lỗi setState trong render
    onSaveTimesheet(updated).catch(() => {});
  };

  // Chấm đủ công tới hôm nay (cho tháng hiện tại)
  const handleFillUntilToday = () => {
    const newRecords = { ...activeTimesheet.records };
    const maxDay = isCurrentMonth ? Math.min(activeTimesheet.daysInMonth, todayDate) : activeTimesheet.daysInMonth;

    for (const empId of Object.keys(newRecords)) {
      const rec = newRecords[empId];
      const days = { ...rec.days };
      for (let d = 1; d <= activeTimesheet.daysInMonth; d++) {
        if (d <= maxDay) {
          if (!isWeekend(activeTimesheet.year, activeTimesheet.monthNumber, d)) {
            if (!days[d] || days[d] === "K") {
              days[d] = "X";
            }
          } else {
            days[d] = "";
          }
        } else {
          days[d] = ""; // Ngày tương lai
        }
      }
      const totals = calculateRowTotals(days, activeTimesheet.daysInMonth, activeTimesheet.standardDays);
      newRecords[empId] = { ...rec, days, ...totals };
    }

    const updated: MonthlyTimesheet = {
      ...activeTimesheet,
      records: newRecords,
      isPartialMonth: isCurrentMonth,
      calculatedToDay: maxDay,
      updatedAt: new Date().toISOString()
    };

    setActiveTimesheet(updated);
    onSaveTimesheet(updated).catch(() => {});
  };

  // Chấm đủ công cả tháng (T2 - T6)
  const handleFillFullMonth = () => {
    const newRecords = { ...activeTimesheet.records };
    for (const empId of Object.keys(newRecords)) {
      const rec = newRecords[empId];
      const days = { ...rec.days };
      for (let d = 1; d <= activeTimesheet.daysInMonth; d++) {
        if (!isWeekend(activeTimesheet.year, activeTimesheet.monthNumber, d)) {
          days[d] = "X";
        } else {
          days[d] = "";
        }
      }
      const totals = calculateRowTotals(days, activeTimesheet.daysInMonth, activeTimesheet.standardDays);
      newRecords[empId] = { ...rec, days, ...totals };
    }

    const updated: MonthlyTimesheet = {
      ...activeTimesheet,
      records: newRecords,
      isPartialMonth: false,
      calculatedToDay: activeTimesheet.daysInMonth,
      updatedAt: new Date().toISOString()
    };

    setActiveTimesheet(updated);
    onSaveTimesheet(updated).catch(() => {});
  };

  // Lưu bảng chấm công
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveTimesheet(activeTimesheet);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Lỗi khi lưu chấm công:", err);
      alert("Lỗi khi lưu bảng chấm công lên hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    exportTimesheetToExcel(activeTimesheet);
  };

  // Import từ file Excel
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseTimesheetFromExcel(file, employees);
      setSelectedMonth(parsed.month);
      setActiveTimesheet(parsed);
      await onSaveTimesheet(parsed);
      alert(`Đã nhập thành công bảng chấm công tháng ${parsed.month} từ file Excel!`);
    } catch (err: any) {
      console.error("Lỗi đọc file Excel:", err);
      alert("Không thể đọc sheet '3. BẢNG CHẤM CÔNG' từ file: " + (err.message || ""));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Lọc danh sách nhân viên
  const filteredRecords = useMemo(() => {
    const list = Object.values(activeTimesheet.records);
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(r =>
      r.name.toLowerCase().includes(term) ||
      r.empId.toLowerCase().includes(term) ||
      r.dept.toLowerCase().includes(term)
    );
  }, [activeTimesheet, searchTerm]);

  // Thống kê toàn công ty
  const stats = useMemo(() => {
    const list = Object.values(activeTimesheet.records);
    const totalWorkingDays = list.reduce((s, r) => s + r.totalPaidDays, 0);
    const avgDays = list.length > 0 ? (totalWorkingDays / list.length).toFixed(1) : "0";
    const totalPaidLeave = list.reduce((s, r) => s + r.paidLeaveDays, 0);
    const totalUnpaid = list.reduce((s, r) => s + r.unpaidDays, 0);

    return {
      count: list.length,
      totalWorkingDays,
      avgDays,
      totalPaidLeave,
      totalUnpaid
    };
  }, [activeTimesheet]);

  // Helper render status cell
  const renderCellStatus = (status: AttendanceStatus | undefined) => {
    if (!status) return null;
    switch (status) {
      case "X":
        return <span className="text-[11px] font-bold text-emerald-700">X</span>;
      case "N1":
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded">½</span>;
      case "On":
        return <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1 rounded">On</span>;
      case "P":
        return <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-1 rounded">P</span>;
      case "P1":
        return <span className="text-[10px] font-bold text-purple-600">P/2</span>;
      case "L":
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1 rounded">L</span>;
      case "K":
        return <span className="text-[11px] font-bold text-slate-400">K</span>;
      case "C":
        return <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-1 rounded">C</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Ẩn input file */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportExcel}
        accept=".xlsx,.xls"
        className="hidden"
      />

      {/* Top Banner & Notification */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-4 rounded-xl text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Bảng Chấm Công - Sheet 3 (Kỳ tháng {selectedMonth})
              </h2>
              {isCurrentMonth ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                  <Sparkles size={11} />
                  Tháng hiện tại (Lũy kế đến ngày {todayDate})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700 text-slate-300">
                  <CheckCircle2 size={11} />
                  Tháng đã hoàn thành
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isCurrentMonth
                ? `Mặc định nhân viên có đi làm (X) từ ngày 01 đến ngày ${todayDate}/${selectedMonth}. Bảng tính lương tự động cập nhật theo số công này!`
                : `Dữ liệu ngày công chuẩn hóa tháng ${selectedMonth}. Click vào từng ô để thay đổi trạng thái ngày công.`}
            </p>
          </div>
        </div>

        {/* Nút lưu & thao tác */}
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
            title="Nhập sheet '3. BẢNG CHẤM CÔNG' từ file Excel"
          >
            <Upload size={14} />
            <span>Nhập Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            <Download size={14} />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all ${
              saveSuccess
                ? "bg-emerald-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            <Save size={14} />
            <span>{isSaving ? "Đang lưu..." : saveSuccess ? "Đã lưu thành công!" : "Lưu chấm công"}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Chọn tháng, Chấm nhanh, Tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Chọn tháng */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Kỳ chấm công:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã NV..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Nút tác vụ nhanh */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {isCurrentMonth && (
            <button
              onClick={handleFillUntilToday}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Chấm đủ công tới hôm nay (ngày {todayDate})</span>
            </button>
          )}

          <button
            onClick={handleFillFullMonth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw size={13} className="text-slate-500" />
            <span>Chấm đủ cả tháng</span>
          </button>
        </div>
      </div>

      {/* KPI Thống kê chấm công */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Số nhân sự chấm công
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {stats.count} <span className="text-xs text-slate-500 font-medium font-sans">nhân viên</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Công chuẩn tháng {selectedMonth}
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">
            {activeTimesheet.standardDays} <span className="text-xs text-slate-500 font-medium font-sans">ngày làm việc</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {isCurrentMonth ? `Công bình quân (lũy kế tới ngày ${todayDate})` : "Công bình quân tháng"}
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {stats.avgDays} <span className="text-xs text-slate-500 font-medium font-sans">công/người</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tổng ngày nghỉ phép (P)
          </div>
          <div className="text-xl font-extrabold text-purple-700 mt-1">
            {stats.totalPaidLeave} <span className="text-xs text-slate-500 font-medium font-sans">ngày phép</span>
          </div>
        </div>
      </div>

      {/* Bảng chú giải ký hiệu (Legend) */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
          <Info size={13} className="text-slate-400" />
          Ký hiệu:
        </span>
        {STATUS_OPTIONS.filter(o => o.code !== "").map(opt => (
          <div key={opt.code} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
            <span className={`px-1.5 py-0.2 rounded text-[11px] ${opt.color}`}>
              {opt.label}
            </span>
            <span className="text-[11px] text-slate-600">{opt.desc}</span>
          </div>
        ))}
        <span className="text-[11px] text-slate-400 italic ml-auto">
          * Click vào ô ngày để chuyển đổi nhanh ký hiệu
        </span>
      </div>

      {/* Bảng Ma Trận Chấm Công (Sticky headers & Left columns) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase select-none shadow-xs">
              {/* Hàng 1: Tiêu đề cột & Số ngày trong tháng */}
              <tr>
                <th className="py-2 px-2 text-center border-r border-slate-200 sticky left-0 z-30 bg-slate-100 w-10">
                  STT
                </th>
                <th className="py-2 px-2 border-r border-slate-200 sticky left-10 z-30 bg-slate-100 w-16">
                  Mã NV
                </th>
                <th className="py-2 px-3 border-r border-slate-200 sticky left-26 z-30 bg-slate-100 min-w-[150px]">
                  Họ và tên
                </th>
                <th className="py-2 px-2 border-r border-slate-200 sticky left-[234px] z-30 bg-slate-100 min-w-[90px]">
                  Phòng ban
                </th>

                {/* Các ngày trong tháng 1..daysInMonth */}
                {Array.from({ length: activeTimesheet.daysInMonth }, (_, i) => i + 1).map(day => {
                  const weekend = isWeekend(activeTimesheet.year, activeTimesheet.monthNumber, day);
                  const isToday = isCurrentMonth && day === todayDate;
                  const dayName = getDayOfWeekName(activeTimesheet.year, activeTimesheet.monthNumber, day);

                  return (
                    <th
                      key={day}
                      className={`py-1 px-0.5 text-center min-w-[28px] max-w-[32px] border-r border-slate-200/80 ${
                        isToday
                          ? "bg-emerald-100 text-emerald-900 border-b-2 border-b-emerald-600 font-extrabold"
                          : weekend
                          ? "bg-slate-200/70 text-slate-500"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="text-[11px] leading-tight font-bold">{day}</div>
                      <div className={`text-[9px] font-medium leading-none ${weekend ? "text-slate-400" : "text-slate-500"}`}>
                        {dayName}
                      </div>
                    </th>
                  );
                })}

                {/* Các cột tổng kết */}
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-emerald-50 text-emerald-900 font-bold min-w-[55px]">
                  X
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-amber-50 text-amber-900 font-bold min-w-[50px]">
                  N1
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-sky-50 text-sky-900 font-bold min-w-[50px]">
                  On
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-purple-50 text-purple-900 font-bold min-w-[50px]">
                  Phép
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-rose-50 text-rose-900 font-bold min-w-[50px]">
                  Lễ
                </th>
                <th className="py-2 px-2 text-center border-r border-slate-200 bg-slate-100 text-slate-600 font-bold min-w-[50px]">
                  Không Lương
                </th>
                <th className="py-2 px-3 text-center border-r border-slate-200 bg-emerald-600 text-white font-extrabold min-w-[85px]">
                  Tổng công
                </th>
                <th className="py-2 px-2 text-center bg-slate-100 text-slate-600 font-bold min-w-[60px]">
                  Chuẩn
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTimesheet.daysInMonth + 12}
                    className="py-12 text-center text-slate-400 font-sans"
                  >
                    Không tìm thấy nhân viên phù hợp
                  </td>
                </tr>
              ) : (
                filteredRecords.map((row, idx) => {
                  return (
                    <tr
                      key={row.empId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 sticky left-0 z-10 bg-white group-hover:bg-slate-50 text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Mã NV */}
                      <td className="py-1.5 px-2 font-bold text-slate-900 border-r border-slate-200/80 sticky left-10 z-10 bg-white group-hover:bg-slate-50">
                        <button
                          onClick={() => onOpenEmployeeDrawer(row.empId)}
                          className="hover:text-emerald-700 hover:underline cursor-pointer"
                        >
                          {row.empId}
                        </button>
                      </td>

                      {/* Họ tên */}
                      <td className="py-1.5 px-3 font-semibold text-slate-800 border-r border-slate-200/80 sticky left-26 z-10 bg-white group-hover:bg-slate-50 font-sans truncate max-w-[170px]">
                        {row.name}
                      </td>

                      {/* Phòng ban */}
                      <td className="py-1.5 px-2 border-r border-slate-200/80 sticky left-[234px] z-10 bg-white group-hover:bg-slate-50 font-sans text-xs text-slate-500">
                        {row.dept}
                      </td>

                      {/* Từng ngày trong tháng */}
                      {Array.from({ length: activeTimesheet.daysInMonth }, (_, i) => i + 1).map(day => {
                        const weekend = isWeekend(activeTimesheet.year, activeTimesheet.monthNumber, day);
                        const isToday = isCurrentMonth && day === todayDate;
                        const status = row.days[day];

                        return (
                          <td
                            key={day}
                            onClick={() => handleToggleDay(row.empId, day)}
                            title={`Ngày ${day}/${activeTimesheet.month}: ${status || "Nghỉ"} (Click để đổi)`}
                            className={`py-1 px-0.5 text-center border-r border-slate-100 cursor-pointer select-none transition-colors ${
                              isToday
                                ? "bg-emerald-50/70 hover:bg-emerald-100/90 font-bold"
                                : weekend
                                ? "bg-slate-100/50 hover:bg-slate-200/60"
                                : "hover:bg-emerald-50/50"
                            }`}
                          >
                            <div className="w-full h-6 flex items-center justify-center">
                              {renderCellStatus(status)}
                            </div>
                          </td>
                        );
                      })}

                      {/* Tổng hợp công */}
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-emerald-50/40 font-bold text-emerald-800">
                        {row.xDays}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-amber-50/40 text-amber-800">
                        {row.halfDays}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-sky-50/40 text-sky-800">
                        {row.onlineDays}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-purple-50/40 text-purple-800">
                        {row.paidLeaveDays}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-rose-50/40 text-rose-800">
                        {row.holidayDays}
                      </td>
                      <td className="py-1.5 px-2 text-center border-r border-slate-200/80 bg-slate-50 text-slate-500">
                        {row.unpaidDays}
                      </td>
                      {/* Tổng công tính lương */}
                      <td className="py-1.5 px-3 text-center border-r border-slate-200/80 bg-emerald-100/70 font-extrabold text-emerald-900 text-sm">
                        {row.totalPaidDays}
                      </td>
                      {/* Chuẩn */}
                      <td className="py-1.5 px-2 text-center text-slate-500 font-sans text-xs">
                        {row.standardDays}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
