import React, { useState, useEffect } from "react";
import { X, UserPlus, Save } from "lucide-react";
import type { Employee } from "../types";
import { saveEmployeeToFirestore } from "../firebase";
import { CurrencyInput } from "./CurrencyInput";

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSaved: (emp: Employee) => void;
  nextId?: string;
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSaved,
  nextId = "MS31"
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    } else {
      setFormData({
        id: nextId,
        name: "",
        dept: "HO",
        position: "",
        gender: "Nữ",
        phone: "",
        dob: "",
        cccd: "",
        address: "",
        status: "Đang làm việc",
        salary: {
          gross: 10000000,
          net: 9000000,
          bhxhBase: 5000000,
          bhxh105: 525000
        },
        bank: {
          account: "",
          bankName: "",
          branch: ""
        }
      });
    }
  }, [employee, isOpen, nextId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert("Vui lòng nhập họ và tên nhân sự!");
      return;
    }

    const gross = Number(formData.salary?.gross || 0);
    const bhxhBase = Number(formData.salary?.bhxhBase || 0);
    const bhxh105 = Math.round(bhxhBase * 0.105);
    const net = gross > bhxh105 ? gross - bhxh105 : gross;

    const updated: Employee = {
      id: formData.id || nextId,
      name: formData.name.trim(),
      dept: formData.dept || "HO",
      position: formData.position || "Nhân viên",
      gender: formData.gender || "Nữ",
      phone: formData.phone || "",
      dob: formData.dob || "",
      cccd: formData.cccd || "",
      idDate: formData.idDate || "",
      idPlace: formData.idPlace || "",
      address: formData.address || "",
      status: formData.status || "Đang làm việc",
      salary: {
        gross,
        net,
        bhxhBase,
        bhxh105,
        allowances: formData.salary?.allowances || {}
      },
      bank: {
        account: formData.bank?.account || "",
        bankName: formData.bank?.bankName || "",
        branch: formData.bank?.branch || ""
      },
      contract: formData.contract,
      contract_tv: formData.contract_tv,
      contract_ct: formData.contract_ct,
      note: formData.note || ""
    };

    try {
      await saveEmployeeToFirestore(updated);
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      alert("Lỗi lưu hồ sơ nhân viên: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm">
              {employee ? `Cập nhật hồ sơ: ${employee.name}` : `Thêm nhân viên mới (${formData.id})`}
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
          {/* Thông tin định danh */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Mã NV</label>
              <input
                type="text"
                value={formData.id || ""}
                disabled={Boolean(employee)}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md font-mono font-bold text-emerald-800"
              />
            </div>
            <div className="col-span-2">
              <label className="text-slate-500 font-medium block mb-1">Họ và tên *</label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Phòng ban</label>
              <select
                value={formData.dept || "HO"}
                onChange={(e) => setFormData(prev => ({ ...prev, dept: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-medium"
              >
                <option value="HO">HO</option>
                <option value="Vận hành">Vận hành</option>
                <option value="Ban giám hiệu">Ban giám hiệu</option>
                <option value="Khối Mầm non">Khối Mầm non</option>
                <option value="Khối Bếp">Khối Bếp</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Chức danh / Vị trí</label>
              <input
                type="text"
                value={formData.position || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="VD: Giáo viên mầm non"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Giới tính</label>
              <select
                value={formData.gender || "Nữ"}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-medium"
              >
                <option value="Nữ">Nữ</option>
                <option value="Nam">Nam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0987654321"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Ngày sinh</label>
              <input
                type="text"
                value={formData.dob || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                placeholder="DD/MM/YYYY"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">CCCD / Hộ chiếu</label>
              <input
                type="text"
                value={formData.cccd || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cccd: e.target.value }))}
                placeholder="001199..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Địa chỉ thường trú</label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="VD: Tổ 14, Phúc Lợi, Long Biên, Hà Nội"
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
            />
          </div>

          {/* Lương & Đóng BHXH */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
                Chính sách tiền lương & Phụ cấp
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Format tiền tệ VNĐ (dấu . phân cách)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-semibold block mb-1 text-xs">Lương Gross thỏa thuận</label>
                <CurrencyInput
                  value={formData.salary?.gross ?? 0}
                  onValueChangeNumber={(gross) => {
                    setFormData(prev => ({
                      ...prev,
                      salary: {
                        ...prev.salary,
                        gross,
                        net: Math.round(gross * 0.9),
                        bhxhBase: prev.salary?.bhxhBase || 0,
                        bhxh105: prev.salary?.bhxh105 || 0,
                        allowances: prev.salary?.allowances || {}
                      }
                    }));
                  }}
                  className="font-bold text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1 text-xs">Mức đóng BHXH cơ bản</label>
                <CurrencyInput
                  value={formData.salary?.bhxhBase ?? 0}
                  onValueChangeNumber={(bhxhBase) => {
                    setFormData(prev => ({
                      ...prev,
                      salary: {
                        ...prev.salary,
                        gross: prev.salary?.gross || 0,
                        net: prev.salary?.net || 0,
                        bhxhBase,
                        bhxh105: Math.round(bhxhBase * 0.105),
                        allowances: prev.salary?.allowances || {}
                      }
                    }));
                  }}
                  className="font-semibold text-slate-800 bg-white"
                />
              </div>
            </div>

            {/* Phụ cấp ăn trưa, điện thoại, trang phục */}
            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Các khoản phụ cấp hàng tháng
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 font-medium block mb-1 text-xs">Phụ cấp ăn trưa</label>
                  <CurrencyInput
                    value={formData.salary?.allowances?.lunch ?? 730000}
                    onValueChangeNumber={(lunch) => {
                      setFormData(prev => ({
                        ...prev,
                        salary: {
                          ...prev.salary,
                          gross: prev.salary?.gross || 0,
                          net: prev.salary?.net || 0,
                          bhxhBase: prev.salary?.bhxhBase || 0,
                          bhxh105: prev.salary?.bhxh105 || 0,
                          allowances: {
                            ...prev.salary?.allowances,
                            lunch
                          }
                        }
                      }));
                    }}
                    className="text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1 text-xs">Phụ cấp điện thoại</label>
                  <CurrencyInput
                    value={formData.salary?.allowances?.phone ?? 0}
                    onValueChangeNumber={(phone) => {
                      setFormData(prev => ({
                        ...prev,
                        salary: {
                          ...prev.salary,
                          gross: prev.salary?.gross || 0,
                          net: prev.salary?.net || 0,
                          bhxhBase: prev.salary?.bhxhBase || 0,
                          bhxh105: prev.salary?.bhxh105 || 0,
                          allowances: {
                            ...prev.salary?.allowances,
                            phone
                          }
                        }
                      }));
                    }}
                    className="text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1 text-xs">Phụ cấp trang phục</label>
                  <CurrencyInput
                    value={formData.salary?.allowances?.costume ?? 0}
                    onValueChangeNumber={(costume) => {
                      setFormData(prev => ({
                        ...prev,
                        salary: {
                          ...prev.salary,
                          gross: prev.salary?.gross || 0,
                          net: prev.salary?.net || 0,
                          bhxhBase: prev.salary?.bhxhBase || 0,
                          bhxh105: prev.salary?.bhxh105 || 0,
                          allowances: {
                            ...prev.salary?.allowances,
                            costume
                          }
                        }
                      }));
                    }}
                    className="text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tài khoản ngân hàng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Số tài khoản ngân hàng</label>
              <input
                type="text"
                value={formData.bank?.account || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bank: { ...prev.bank, account: e.target.value, bankName: prev.bank?.bankName || "", branch: "" }
                }))}
                placeholder="1029384756"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Tên ngân hàng</label>
              <input
                type="text"
                value={formData.bank?.bankName || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bank: { ...prev.bank, bankName: e.target.value, account: prev.bank?.account || "", branch: "" }
                }))}
                placeholder="Vietcombank / Techcombank..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
              />
            </div>
          </div>

          {/* Trạng thái & Ghi chú */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 font-medium block mb-1">Trạng thái làm việc</label>
              <select
                value={formData.status || "Đang làm việc"}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md font-semibold text-slate-700"
              >
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Nghỉ việc/Tạm hoãn">Nghỉ việc / Tạm hoãn</option>
              </select>
            </div>
            <div>
              <label className="text-slate-500 font-medium block mb-1">Ghi chú</label>
              <input
                type="text"
                value={formData.note || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Ghi chú hồ sơ..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              <Save size={15} />
              <span>{employee ? "Lưu thay đổi" : "Tạo nhân viên"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
