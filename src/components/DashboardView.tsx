import React, { useState, useMemo } from "react";
import { Users, DollarSign, Clock, Building2, ArrowRight, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Employee, ContractItem, PayrollRecord } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";

interface DashboardViewProps {
  employees: Employee[];
  contracts: ContractItem[];
  payroll: PayrollRecord[];
  onNavigate: (view: "employees" | "contracts" | "payroll") => void;
  onOpenContractModal: (empId: string) => void;
  onOpenEmployeeDrawer: (empId: string) => void;
}

type ExpiringSortField = "name" | "dept" | "tvDaysLeft" | "ctDaysLeft";
type SortOrder = "asc" | "desc";

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  contracts,
  payroll,
  onNavigate,
  onOpenContractModal,
  onOpenEmployeeDrawer
}) => {
  const [sortField, setSortField] = useState<ExpiringSortField>("ctDaysLeft");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: ExpiringSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: ExpiringSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 group-hover:text-slate-600 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={12} className="text-emerald-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown size={12} className="text-emerald-700 shrink-0 font-bold" />
    );
  };

  // Tính toán KPI
  const activeEmployees = employees.filter(e => !e.status.includes("Nghỉ việc")).length;
  
  // Tính tổng lương tháng gần nhất (09.2026 hoặc tháng có nhiều bản ghi nhất)
  const latestMonth = "09.2026";
  const latestPayroll = payroll.filter(p => p.month === latestMonth);
  const totalGross = latestPayroll.reduce((sum, p) => sum + (p.totalGross || 0), 0);
  const totalNet = latestPayroll.reduce((sum, p) => sum + (p.net || 0), 0);

  // Hợp đồng sắp hết hạn
  const expiringContracts = useMemo(() => {
    const list = contracts.filter(c => {
      const days = c.ctDaysLeft || c.tvDaysLeft || "";
      if (days.includes("hết hạn") || days.includes("0 ngày")) return true;
      const num = parseInt(days.replace(/\D/g, ""), 10);
      return !isNaN(num) && num > 0 && num <= 60;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name": {
          const nameA = a.name.trim().split(" ").slice(-1)[0] || a.name;
          const nameB = b.name.trim().split(" ").slice(-1)[0] || b.name;
          comparison = nameA.localeCompare(nameB, "vi");
          break;
        }
        case "dept":
          comparison = (a.dept || "").localeCompare(b.dept || "", "vi");
          break;
        case "tvDaysLeft": {
          const numA = parseInt((a.tvDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          const numB = parseInt((b.tvDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          comparison = numA - numB;
          break;
        }
        case "ctDaysLeft": {
          const numA = parseInt((a.ctDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          const numB = parseInt((b.ctDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          comparison = numA - numB;
          break;
        }
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [contracts, sortField, sortOrder]);

  // Cơ cấu phòng ban
  const deptMap: Record<string, number> = {};
  employees.forEach(e => {
    const d = e.dept || "Khác";
    deptMap[d] = (deptMap[d] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards (Định dạng tiền Việt Nam '.') */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Nhân sự */}
        <div 
          onClick={() => onNavigate("employees")}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nhân sự hoạt động
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(activeEmployees)}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ {formatNumber(employees.length)} nhân sự</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>Xem danh sách</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Quỹ lương tháng */}
        <div 
          onClick={() => onNavigate("payroll")}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quỹ lương ({latestMonth})
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalGross)}
            </span>
            <span className="text-xs text-slate-500 font-medium font-sans">đ (Gross)</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Thực lĩnh Net: <strong className="text-slate-800 font-mono">{formatCurrency(totalNet)} đ</strong>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
            <span>Bảng tính chi tiết</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Hợp đồng sắp đến hạn */}
        <div 
          onClick={() => onNavigate("contracts")}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hợp đồng cần lưu ý
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {formatNumber(expiringContracts.length)}
            </span>
            <span className="text-xs text-slate-500 font-medium">trong 60 ngày</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">
            Bao gồm cả HĐ thử việc & chính thức
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
            <span>Rà soát hợp đồng</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Phòng ban & Cơ sở */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phòng ban & Cơ sở
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(Object.keys(deptMap).length)}
            </span>
            <span className="text-xs text-slate-500 font-medium">bộ phận trực thuộc</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium truncate">
            {Object.keys(deptMap).slice(0, 3).join(", ")}...
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-purple-600 font-semibold">
            <span>Cơ sở HO & MN Phong Lan</span>
          </div>
        </div>
      </div>

      {/* Grid: Expiring Contracts Table & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách hợp đồng cần rà soát (Ghim Header & Cho phép Sort) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">
                Danh sách hợp đồng cần gia hạn / rà soát ({expiringContracts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate("contracts")}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider select-none shadow-xs">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Nhân sự</span>
                      {renderSortIcon("name")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("dept")}
                    className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Phòng ban</span>
                      {renderSortIcon("dept")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("tvDaysLeft")}
                    className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Hạn Thử việc</span>
                      {renderSortIcon("tvDaysLeft")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("ctDaysLeft")}
                    className="py-2.5 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                  >
                    <div className="flex items-center gap-1">
                      <span>Hạn Chính thức</span>
                      {renderSortIcon("ctDaysLeft")}
                    </div>
                  </th>
                  <th className="py-2.5 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringContracts.slice(0, 10).map((c) => (
                  <tr key={c.empId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span
                        onClick={() => onOpenEmployeeDrawer(c.empId)}
                        className="font-semibold text-slate-800 hover:text-emerald-600 cursor-pointer"
                      >
                        {c.name}
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono">
                        {c.empId}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{c.dept}</td>
                    <td className="py-2.5 px-4">
                      {c.tvDaysLeft ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {c.tvDaysLeft}
                        </span>
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {c.ctDaysLeft ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {c.ctDaysLeft}
                        </span>
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => onOpenContractModal(c.empId)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                      >
                        Sửa HĐ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phân bổ theo phòng ban */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Cơ cấu nhân sự theo bộ phận
            </h3>
            <div className="space-y-3">
              {Object.entries(deptMap).map(([dept, count]) => {
                const pct = Math.round((count / employees.length) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{dept}</span>
                      <span className="text-slate-500">{formatNumber(count)} người ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Dữ liệu tổng hợp từ 30 nhân sự chuẩn hóa thuộc Công ty Cổ phần MF14.
          </div>
        </div>
      </div>
    </div>
  );
};
