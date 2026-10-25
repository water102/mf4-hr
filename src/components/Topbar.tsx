import React from "react";
import { Download, ShieldCheck, LogOut } from "lucide-react";
import type { User } from "firebase/auth";

interface TopbarProps {
  title: string;
  subtitle?: string;
  currentUser?: User | null;
  onExportExcel: () => void;
  onLogout?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  currentUser,
  onExportExcel,
  onLogout
}) => {
  // Rút gọn email hiển thị
  const displayName = currentUser?.email 
    ? currentUser.email.split("@")[0]
    : "Quản trị viên";

  const userInitial = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
        )}
      </div>

      {/* Topbar Actions */}
      <div className="flex items-center gap-3">
        {/* Nút Xuất Báo Cáo Excel */}
        <button
          onClick={onExportExcel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          title="Tải xuống toàn bộ dữ liệu Excel cho kế toán"
        >
          <Download size={15} />
          <span>Xuất Excel (.xlsx)</span>
        </button>

        {/* User Profile Badge & Logout Button */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userInitial}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                {displayName}
                <ShieldCheck size={13} className="text-emerald-600" />
              </span>
              {currentUser?.email && (
                <span className="text-[10px] text-slate-400 leading-tight">
                  {currentUser.email}
                </span>
              )}
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
