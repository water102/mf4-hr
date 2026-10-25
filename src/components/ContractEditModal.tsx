import React, { useState, useEffect } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import type { ContractItem, Employee } from "../types";
import { uploadContractFileToFirestore, saveContractToFirestore } from "../firebase";

interface ContractEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  empId: string;
  contract: ContractItem | null;
  employee: Employee | null;
  onSaved: (updatedContract: ContractItem) => void;
}

export const ContractEditModal: React.FC<ContractEditModalProps> = ({
  isOpen,
  onClose,
  empId,
  contract,
  employee,
  onSaved
}) => {
  const [formData, setFormData] = useState<Partial<ContractItem>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (contract) {
      setFormData({ ...contract });
    } else if (employee) {
      setFormData({
        empId: employee.id,
        name: employee.name,
        dept: employee.dept,
        position: employee.position,
        tvNumber: employee.contract_tv?.number || "",
        tvPeriod: employee.contract_tv?.startDate ? `${employee.contract_tv.startDate} - ${employee.contract_tv.endDate || ""}` : "",
        tvDaysLeft: employee.contract_tv?.daysLeft || "",
        ctNumber: employee.contract_ct?.number || "",
        ctPeriod: employee.contract_ct?.startDate ? `${employee.contract_ct.startDate} - ${employee.contract_ct.endDate || ""}` : "",
        ctDaysLeft: employee.contract_ct?.daysLeft || "",
        status: employee.ktCheck || "Đã ký HĐ",
        note: employee.note || "",
        driveFileUrl: employee.contract?.driveFileUrl || ""
      });
    }
    setSelectedFile(null);
    setUploadStatus("");
  }, [contract, employee, isOpen]);

  if (!isOpen) return null;

  const handleUploadFile = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn 1 file PDF hoặc ảnh scan trước khi tải lên!");
      return;
    }
    try {
      setIsUploading(true);
      const fileUrl = await uploadContractFileToFirestore(
        empId,
        selectedFile,
        (msg) => setUploadStatus(msg)
      );
      setFormData(prev => ({
        ...prev,
        driveFileUrl: fileUrl,
        fileName: selectedFile.name
      }));
      setUploadStatus(`✓ Đã lưu file [${selectedFile.name}] vào Cloud Firestore thành công!`);
    } catch (err: unknown) {
      setUploadStatus("Lỗi tải file: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ContractItem = {
      empId,
      name: formData.name || employee?.name || "",
      dept: formData.dept || employee?.dept || "",
      position: formData.position || employee?.position || "",
      tvNumber: formData.tvNumber || "",
      tvPeriod: formData.tvPeriod || "",
      tvDaysLeft: formData.tvDaysLeft || "",
      ctNumber: formData.ctNumber || "",
      ctPeriod: formData.ctPeriod || "",
      ctDaysLeft: formData.ctDaysLeft || "",
      status: formData.status || "Đã ký HĐ",
      ktCheck: formData.status || "Đã ký HĐ",
      note: formData.note || "",
      driveFileUrl: formData.driveFileUrl || "",
      fileName: formData.fileName || ""
    };

    try {
      await saveContractToFirestore(updated);
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      alert("Lỗi lưu hợp đồng: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm">
              Chỉnh sửa hợp đồng: {formData.name} ({empId})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Thông tin nhân viên (chỉ đọc) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Họ và tên</span>
              <span className="font-bold text-slate-800">{formData.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phòng ban & Vị trí</span>
              <span className="font-medium text-slate-700">{formData.dept} • {formData.position}</span>
            </div>
          </div>

          {/* Khối HĐ Thử việc */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              1. Hợp đồng thử việc
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Số HĐ Thử việc</label>
                <input
                  type="text"
                  value={formData.tvNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tvNumber: e.target.value }))}
                  placeholder="VD: 01/2026/HĐTV-MF14"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Thời hạn TV</label>
                <input
                  type="text"
                  value={formData.tvPeriod || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tvPeriod: e.target.value }))}
                  placeholder="01/04/2026 - 31/05/2026"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Hạn còn lại TV</label>
                <input
                  type="text"
                  value={formData.tvDaysLeft || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, tvDaysLeft: e.target.value }))}
                  placeholder="Hết hạn TV / 30 ngày"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Khối HĐ Chính thức */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
              2. Hợp đồng chính thức
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Số HĐ Chính thức</label>
                <input
                  type="text"
                  value={formData.ctNumber || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctNumber: e.target.value }))}
                  placeholder="VD: 12/2026/HĐLĐ-MF14"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Thời hạn CT</label>
                <input
                  type="text"
                  value={formData.ctPeriod || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctPeriod: e.target.value }))}
                  placeholder="01/06/2026 - 31/05/2027"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Hạn còn lại CT</label>
                <input
                  type="text"
                  value={formData.ctDaysLeft || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctDaysLeft: e.target.value }))}
                  placeholder="VD: 180 ngày"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Tình trạng & Ghi chú */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Tình trạng hợp đồng</label>
              <select
                value={formData.status || "Đã ký HĐ"}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700"
              >
                <option value="Đã ký HĐ">Đã ký HĐ</option>
                <option value="Chưa ký HĐ">Chưa ký HĐ</option>
                <option value="Bổ sung hồ sơ">Bổ sung hồ sơ</option>
                <option value="Đang hiệu lực">Đang hiệu lực</option>
                <option value="Sắp hết hạn">Sắp hết hạn</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Ghi chú</label>
              <input
                type="text"
                value={formData.note || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="VD: Đã nộp bản scan..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
              />
            </div>
          </div>

          {/* KHỐI TẢI LÊN BẢN SCAN LÊN CLOUD FIRESTORE */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Upload size={14} />
                Lưu trữ Bản Scan Hợp đồng (Cloud Firestore - 100% Miễn phí)
              </span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Tự động lưu vĩnh viễn
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-slate-600 block text-[11px]">
                Chọn file scan từ máy tính (PDF hoặc Ảnh):
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700"
                />
                <button
                  type="button"
                  onClick={handleUploadFile}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-md font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  {isUploading ? "⏳ Đang tải..." : "⬆ Tải lên Cloud"}
                </button>
              </div>

              {uploadStatus && (
                <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mt-1">
                  <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-emerald-200/60">
              <label className="text-slate-500 block text-[11px] mb-1">
                Hoặc link xem trực tiếp (nếu có sẵn link Google Drive):
              </label>
              <input
                type="text"
                value={formData.driveFileUrl || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, driveFileUrl: e.target.value }))}
                placeholder="https://drive.google.com/... hoặc dán link tại đây"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-slate-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              ✓ Cập nhật hợp đồng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
