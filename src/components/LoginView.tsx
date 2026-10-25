import React, { useState } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle, Info } from "lucide-react";
import { loginWithUserPassword } from "../firebase";

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ tên đăng nhập (hoặc email) và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await loginWithUserPassword(usernameOrEmail, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Lỗi đăng nhập:", err);
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setErrorMsg("Tên đăng nhập / Email hoặc mật khẩu không chính xác.");
      } else if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
        setErrorMsg("Tính năng Authentication chưa được bật trong Firebase Console! Bạn vui lòng vào Firebase Console > Authentication > Sign-in method > Kích hoạt Email/Password và tạo tài khoản.");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("Bạn đã nhập sai nhiều lần. Vui lòng đợi ít phút và thử lại.");
      } else if (code === "auth/invalid-email") {
        setErrorMsg("Định dạng email hoặc tên đăng nhập không hợp lệ.");
      } else {
        setErrorMsg(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối và thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-radial from-slate-800 via-slate-900 to-slate-950 p-4 select-none">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-8 z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MF14 HRM CLOUD
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Công ty Cổ phần MF14 • Cổng Quản trị Nhân sự & Tiền lương
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên đăng nhập hoặc Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin hoặc admin@mf14.vn"
                autoComplete="username"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              * Có thể nhập tên người dùng (VD: <span className="text-slate-400">admin</span>) hoặc email đầy đủ.
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Info Note */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Info size={14} className="text-blue-400 shrink-0" />
            <span>Xác thực an toàn qua Firebase Cloud Auth</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Quyền hạn Firestore được phân quyền tự động theo User UID.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-500">
        © 2026 CÔNG TY CỔ PHẦN MF14 • Bảo mật dữ liệu nội bộ
      </footer>
    </div>
  );
};
