import React from "react";
import { LayoutDashboard, Users, FileText, CalendarCheck, DollarSign } from "lucide-react";

export type AppView = "dashboard" | "employees" | "contracts" | "payroll" | "timesheet";

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  employeeCount: number;
  contractCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  employeeCount,
  contractCount
}) => {
  const navItems = [
    {
      id: "dashboard" as const,
      label: "Bảng điều hành",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "employees" as const,
      label: "Danh sách nhân sự",
      icon: Users,
      badge: employeeCount
    },
    {
      id: "contracts" as const,
      label: "Quản lý hợp đồng",
      icon: FileText,
      badge: contractCount
    },
    {
      id: "timesheet" as const,
      label: "Bảng chấm công",
      icon: CalendarCheck,
      badge: null
    },
    {
      id: "payroll" as const,
      label: "Bảng tính lương",
      icon: DollarSign,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-emerald-900/30">
          MF
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white text-base tracking-tight leading-tight">
            Nhân sự MF14
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Công ty cổ phần MF14
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
          Chức năng chính
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-emerald-700 text-emerald-100"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/20">
        <div className="font-medium text-slate-300">Hệ thống Quản trị HRM</div>
        <div className="text-[11px] text-slate-400 mt-0.5">MF14 Management System</div>
      </div>
    </aside>
  );
};
