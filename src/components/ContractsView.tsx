import React, { useState, useMemo } from "react";
import { Search, Filter, FileText, Edit2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ContractItem } from "../types";

interface ContractsViewProps {
  contracts: ContractItem[];
  onOpenContractModal: (empId: string) => void;
  onViewContractScan: (contract: ContractItem) => void;
  onOpenEmployeeDrawer: (empId: string) => void;
}

type ContractSortField = 
  | "name" 
  | "dept" 
  | "tvNumber" 
  | "tvPeriod" 
  | "tvDaysLeft" 
  | "ctNumber" 
  | "ctPeriod" 
  | "ctDaysLeft" 
  | "status";

type SortOrder = "asc" | "desc";

export const ContractsView: React.FC<ContractsViewProps> = ({
  contracts,
  onOpenContractModal,
  onViewContractScan,
  onOpenEmployeeDrawer
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // State sắp xếp
  const [sortField, setSortField] = useState<ContractSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: ContractSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field: ContractSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={13} className="text-slate-400 group-hover:text-slate-600 shrink-0" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={13} className="text-emerald-700 shrink-0 font-bold" />
    ) : (
      <ArrowDown size={13} className="text-emerald-700 shrink-0 font-bold" />
    );
  };

  const processedContracts = useMemo(() => {
    const filtered = contracts.filter(c => {
      const matchSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ctNumber && c.ctNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.tvNumber && c.tvNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "signed" && c.status?.includes("Đã ký")) ||
        (selectedStatus === "expiring" && ((c.ctDaysLeft && !c.ctDaysLeft.includes("–")) || (c.tvDaysLeft && !c.tvDaysLeft.includes("–"))));

      return matchSearch && matchStatus;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
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
        case "tvNumber":
          comparison = (a.tvNumber || "").localeCompare(b.tvNumber || "");
          break;
        case "tvPeriod":
          comparison = (a.tvPeriod || "").localeCompare(b.tvPeriod || "");
          break;
        case "tvDaysLeft": {
          const numA = parseInt((a.tvDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          const numB = parseInt((b.tvDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          comparison = numA - numB;
          break;
        }
        case "ctNumber":
          comparison = (a.ctNumber || "").localeCompare(b.ctNumber || "");
          break;
        case "ctPeriod":
          comparison = (a.ctPeriod || "").localeCompare(b.ctPeriod || "");
          break;
        case "ctDaysLeft": {
          const numA = parseInt((a.ctDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          const numB = parseInt((b.ctDaysLeft || "").replace(/\D/g, ""), 10) || 0;
          comparison = numA - numB;
          break;
        }
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "", "vi");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [contracts, searchTerm, selectedStatus, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên nhân sự, mã NV, số hợp đồng..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Lọc trạng thái */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả tình trạng hợp đồng</option>
              <option value="signed">Đã ký HĐLĐ</option>
              <option value="expiring">Có thời hạn theo dõi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng Hợp Đồng (Hỗ trợ Ghim Header & Sắp xếp các cột) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-230px)] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-xs border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider select-none shadow-xs">
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nhân sự</span>
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
                  onClick={() => handleSort("tvNumber")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>HĐ Thử việc</span>
                    {renderSortIcon("tvNumber")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("tvPeriod")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Thời hạn TV</span>
                    {renderSortIcon("tvPeriod")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("tvDaysLeft")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Hạn TV</span>
                    {renderSortIcon("tvDaysLeft")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ctNumber")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>HĐ Chính thức</span>
                    {renderSortIcon("ctNumber")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ctPeriod")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Thời hạn CT</span>
                    {renderSortIcon("ctPeriod")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ctDaysLeft")}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Hạn CT</span>
                    {renderSortIcon("ctDaysLeft")}
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
              {processedContracts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy hợp đồng nào phù hợp.
                  </td>
                </tr>
              ) : (
                processedContracts.map((c) => {
                  const hasScan = Boolean(c.driveFileUrl || c.fileData);
                  return (
                    <tr key={c.empId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <button
                          onClick={() => onOpenEmployeeDrawer(c.empId)}
                          className="font-bold text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer text-left"
                        >
                          {c.name}
                        </button>
                        <span className="block text-[11px] text-slate-400 font-mono">
                          {c.empId} • {c.position || "–"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {c.dept}
                      </td>

                      {/* HĐ Thử việc */}
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-700">
                        {c.tvNumber || "–"}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {c.tvPeriod || "–"}
                      </td>
                      <td className="py-2.5 px-4">
                        {c.tvDaysLeft ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            {c.tvDaysLeft}
                          </span>
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </td>

                      {/* HĐ Chính thức */}
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                        {c.ctNumber || "–"}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {c.ctPeriod || "–"}
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

                      {/* Trạng thái */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {c.status || "Đã ký HĐ"}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Nút Xem HĐ Scan */}
                          <button
                            onClick={() => onViewContractScan(c)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                              hasScan
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                            }`}
                            title={hasScan ? "Mở xem bản scan hợp đồng" : "Chưa có file scan"}
                          >
                            <FileText size={13} />
                            <span>{hasScan ? "Xem HĐ" : "Chưa có"}</span>
                          </button>

                          {/* Nút Sửa HĐ */}
                          <button
                            onClick={() => onOpenContractModal(c.empId)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            title="Sửa hợp đồng & tải lên bản scan mới"
                          >
                            <Edit2 size={13} />
                            <span>Sửa</span>
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
            Theo dõi <strong>{processedContracts.length}</strong> hợp đồng lao động (Bấm vào tiêu đề cột để sắp xếp)
          </span>
          <span>Bản scan lưu trữ trực tiếp trên Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
