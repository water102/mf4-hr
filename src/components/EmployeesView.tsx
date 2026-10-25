import React, { useState, useMemo } from "react";
import { Search, Plus, Filter, UserCheck, Eye, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Employee } from "../types";
import { formatCurrency } from "../utils/format";

interface EmployeesViewProps {
  employees: Employee[];
  onOpenDrawer: (empId: string) => void;
  onEditEmployee: (emp: Employee) => void;
  onAddNewEmployee: () => void;
  onDeleteEmployee: (empId: string) => void;
}

type SortField = "id" | "name" | "dept" | "position" | "gross" | "bhxhBase" | "status";
type SortOrder = "asc" | "desc";

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  onOpenDrawer,
  onEditEmployee,
  onAddNewEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // State sắp xếp
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-slate-400 group-hover:text-slate-600 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={13} className="text-emerald-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown size={13} className="text-emerald-700 shrink-0 font-bold" />
    );
  };

  // Danh sách phòng ban
  const departments = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.dept).filter(Boolean)));
  }, [employees]);

  // Bộ lọc & sắp xếp dữ liệu
  const processedEmployees = useMemo(() => {
    const filtered = employees.filter(emp => {
      const matchSearch =
        !searchTerm ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchTerm)) ||
        (emp.cccd && emp.cccd.includes(searchTerm));

      const matchDept = selectedDept === "all" || emp.dept === selectedDept;
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && !emp.status?.includes("Nghỉ việc")) ||
        (selectedStatus === "inactive" && emp.status?.includes("Nghỉ việc"));

      return matchSearch && matchDept && matchStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "id":
          comparison = (a.id || "").localeCompare(b.id || "", undefined, { numeric: true });
          break;
        case "name": {
          // Tách tên để sắp xếp theo tên chính kiểu tiếng Việt
          const nameA = a.name.trim().split(" ").slice(-1)[0] || a.name;
          const nameB = b.name.trim().split(" ").slice(-1)[0] || b.name;
          comparison = nameA.localeCompare(nameB, "vi", { sensitivity: "base" });
          if (comparison === 0) comparison = a.name.localeCompare(b.name, "vi");
          break;
        }
        case "dept":
          comparison = (a.dept || "").localeCompare(b.dept || "", "vi");
          break;
        case "position":
          comparison = (a.position || "").localeCompare(b.position || "", "vi");
          break;
        case "gross":
          comparison = (a.salary?.gross || 0) - (b.salary?.gross || 0);
          break;
        case "bhxhBase":
          comparison = (a.salary?.bhxhBase || 0) - (b.salary?.bhxhBase || 0);
          break;
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "", "vi");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [employees, searchTerm, selectedDept, selectedStatus, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã NV, SĐT, CCCD..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Lọc phòng ban */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Lọc trạng thái */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Nghỉ việc / Tạm hoãn</option>
          </select>
        </div>

        {/* Nút thêm mới */}
        <button
          onClick={onAddNewEmployee}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Thêm nhân sự mới</span>
        </button>
      </div>

      {/* Bảng danh sách nhân sự (Hỗ trợ Ghim Header & Sắp xếp các cột) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-230px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider select-none shadow-xs">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Mã NV</span>
                    {renderSortIcon("id")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Họ và tên</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("dept")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Phòng ban</span>
                    {renderSortIcon("dept")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("position")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Chức danh / Vị trí</span>
                    {renderSortIcon("position")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("gross")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Lương Gross (VNĐ)</span>
                    {renderSortIcon("gross")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("bhxhBase")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Đóng BHXH (VNĐ)</span>
                    {renderSortIcon("bhxhBase")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Trạng thái</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp với điều kiện lọc.
                  </td>
                </tr>
              ) : (
                processedEmployees.map((emp) => {
                  const isInactive = emp.status?.includes("Nghỉ việc");
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                        {emp.id}
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => onOpenDrawer(emp.id)}
                          className="font-bold text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer text-left"
                        >
                          {emp.name}
                        </button>
                        <div className="text-[11px] text-slate-400">
                          {emp.gender || "–"} • {emp.phone || "Chưa có SĐT"}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {emp.dept}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-medium">
                        {emp.position || "–"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {emp.salary?.gross ? `${formatCurrency(emp.salary.gross)} đ` : "–"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-600 font-mono">
                        {emp.salary?.bhxhBase ? `${formatCurrency(emp.salary.bhxhBase)} đ` : "–"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isInactive
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <UserCheck size={11} />
                          {emp.status || "Đang làm việc"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenDrawer(emp.id)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Sửa hồ sơ"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa nhân viên [${emp.name}] khỏi hệ thống?`)) {
                                onDeleteEmployee(emp.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa nhân viên"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>
            Hiển thị <strong>{processedEmployees.length}</strong> / {employees.length} nhân sự (Bấm vào tiêu đề cột để sắp xếp)
          </span>
          <span>Công ty Cổ phần MF14</span>
        </div>
      </div>
    </div>
  );
};
