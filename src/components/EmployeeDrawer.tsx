import React, { useState } from "react";
import { X, User, FileText, DollarSign, Edit2 } from "lucide-react";
import type { Employee, ContractItem } from "../types";
import { formatCurrency } from "../utils/format";

interface EmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  contract: ContractItem | null;
  onEditEmployee: (emp: Employee) => void;
  onEditContract: (empId: string) => void;
  onViewContractScan: (contract: ContractItem) => void;
}

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({
  isOpen,
  onClose,
  employee,
  contract,
  onEditEmployee,
  onEditContract,
  onViewContractScan
}) => {
  const [activeTab, setActiveTab] = useState<"personal" | "contract" | "salary">("personal");

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                {employee.name.split(" ").slice(-1)[0]?.charAt(0) || "NV"}
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {employee.name}
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                    {employee.id}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {employee.position} • {employee.dept}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditEmployee(employee)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title="Sửa hồ sơ"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
            <button
              onClick={() => setActiveTab("personal")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "personal"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <User size={14} />
              <span>Thông tin cá nhân</span>
            </button>
            <button
              onClick={() => setActiveTab("contract")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "contract"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText size={14} />
              <span>Hợp đồng ({contract?.status || "HĐLĐ"})</span>
            </button>
            <button
              onClick={() => setActiveTab("salary")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "salary"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <DollarSign size={14} />
              <span>Lương & BHXH</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: THÔNG TIN CÁ NHÂN */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Hồ sơ định danh & Liên lạc
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Giới tính</span>
                      <span className="font-semibold text-slate-800">{employee.gender || "–"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Ngày sinh</span>
                      <span className="font-semibold text-slate-800">{employee.dob || "–"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số CCCD / Hộ chiếu</span>
                      <span className="font-mono font-semibold text-slate-800">{employee.cccd || "–"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số điện thoại</span>
                      <span className="font-semibold text-slate-800">{employee.phone || "–"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Địa chỉ thường trú / Nơi ở</span>
                      <span className="font-medium text-slate-800">{employee.address || "–"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tài khoản nhận lương (Ngân hàng)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số tài khoản</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {employee.bank?.account || "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Ngân hàng</span>
                      <span className="font-semibold text-slate-800">
                        {employee.bank?.bankName || "–"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <span className="text-slate-400 block text-[11px]">Ghi chú nhân sự</span>
                  <p className="text-slate-700 font-medium">
                    {employee.note || "Không có ghi chú thêm."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: HỢP ĐỒNG */}
            {activeTab === "contract" && (
              <div className="space-y-4">
                {/* HĐ Thử việc */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      1. Hợp đồng thử việc
                    </span>
                    {contract?.tvDaysLeft && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {contract.tvDaysLeft}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số hợp đồng TV</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {contract?.tvNumber || "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Thời hạn</span>
                      <span className="font-medium text-slate-800">
                        {contract?.tvPeriod || "–"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* HĐ Chính thức */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Hợp đồng chính thức
                    </span>
                    {contract?.ctDaysLeft && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {contract.ctDaysLeft}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số hợp đồng CT</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {contract?.ctNumber || "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Thời hạn</span>
                      <span className="font-medium text-slate-800">
                        {contract?.ctPeriod || "–"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bản scan hợp đồng */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-900">
                        Bản scan hợp đồng (Cloud Storage)
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        {contract?.driveFileUrl || contract?.fileData ? "✓ Đã lưu file trên Cloud" : "Chưa có file scan"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {contract && (contract.driveFileUrl || contract.fileData) && (
                        <button
                          onClick={() => onViewContractScan(contract)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Xem bản scan
                        </button>
                      )}
                      <button
                        onClick={() => onEditContract(employee.id)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Tải file mới / Sửa HĐ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LƯƠNG & BHXH */}
            {activeTab === "salary" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chính sách lương thỏa thuận
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Lương Gross</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {employee.salary?.gross ? `${formatCurrency(employee.salary.gross)} đ` : "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Lương Net (Thực lĩnh)</span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {employee.salary?.net ? `${formatCurrency(employee.salary.net)} đ` : "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Mức đóng BHXH cơ bản</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {employee.salary?.bhxhBase ? `${formatCurrency(employee.salary.bhxhBase)} đ` : "0 đ"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Trừ BHXH người lao động (10.5%)</span>
                      <span className="font-mono font-semibold text-amber-700">
                        {employee.salary?.bhxh105 ? `${formatCurrency(employee.salary.bhxh105)} đ` : "0 đ"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phụ cấp */}
                {employee.salary?.allowances && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phụ cấp chức danh
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {employee.salary.allowances.lunch ? (
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Ăn trưa</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {formatCurrency(employee.salary.allowances.lunch)} đ
                          </span>
                        </div>
                      ) : null}
                      {employee.salary.allowances.phone ? (
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Điện thoại</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {formatCurrency(employee.salary.allowances.phone)} đ
                          </span>
                        </div>
                      ) : null}
                      {employee.salary.allowances.costume ? (
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Trang phục</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {formatCurrency(employee.salary.allowances.costume)} đ
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => onEditEmployee(employee)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
