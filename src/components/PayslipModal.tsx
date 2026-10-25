import React, { useRef, useState } from "react";
import { X, Download, Printer, CheckCircle, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { PayrollRecord, EmployeeTimesheetRow, Employee } from "../types";
import { formatCurrency } from "../utils/format";

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
  employee: Employee | null;
  timesheetRow?: EmployeeTimesheetRow | null;
  standardDays?: number;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  record,
  employee,
  timesheetRow,
  standardDays = 22
}) => {
  const payslipRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  if (!isOpen || !record) return null;

  // Lấy các chỉ số ngày công từ timesheet hoặc record
  const workDaysOfficial = timesheetRow ? (timesheetRow.xDays + timesheetRow.onlineDays) : record.workDays;
  const workDaysProbation = 0;
  const holidayDays = timesheetRow?.holidayDays || 0;
  const paidLeaveDays = timesheetRow?.paidLeaveDays || 0;
  const unpaidDays = timesheetRow?.unpaidDays || 0;
  const actualStandardDays = timesheetRow?.standardDays || standardDays;

  // Thu nhập
  const baseSalary = record.baseSalary || employee?.salary?.gross || 10000000;
  const actualBaseSalary = record.actualBase || Math.round((baseSalary / actualStandardDays) * record.workDays);
  
  // Các khoản hỗ trợ (ăn trưa, gửi xe, điện thoại, trang phục)
  const lunch = employee?.salary?.allowances?.lunch ?? 730000;
  const actualLunch = Math.round((lunch / actualStandardDays) * (timesheetRow ? (timesheetRow.xDays + timesheetRow.onlineDays + timesheetRow.halfDays * 0.5) : record.workDays));
  const phone = employee?.salary?.allowances?.phone || 0;
  const costume = employee?.salary?.allowances?.costume || 0;
  const parking = employee?.salary?.allowances?.parking || 0;
  const allowancesTotal = actualLunch + phone + costume + parking;

  const bonusHQCV = record.bonusHQCV || 0;
  const totalGross = record.totalGross || (actualBaseSalary + allowancesTotal + bonusHQCV);

  // Các khoản trừ
  const bhxhBase = employee?.salary?.bhxhBase || 5000000;
  const bhxhDeduction = record.bhxhDeduction || (record.workDays >= 14 ? Math.round(bhxhBase * 0.105) : 0);
  const tax = record.tax || 0;
  const unionFee = 0;
  const totalDeductions = bhxhDeduction + tax + unionFee;

  // Thực lĩnh
  const netSalary = record.net || (totalGross - totalDeductions);

  // Bảo hiểm công ty đóng (21.5%: BHXH 17.5%, BHYT 3%, BHTN 1%)
  const companyInsurance = record.workDays >= 14 ? Math.round(bhxhBase * 0.215) : 0;
  const totalCompanyCost = totalGross + companyInsurance;

  // Hàm tải file PDF
  const handleDownloadPdf = async () => {
    if (!payslipRef.current) return;
    setIsExporting(true);
    try {
      const element = payslipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // Tăng chất lượng phân giải chữ rõ nét
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // Khắc phục triệt để lỗi Tailwind v4 oklch() color function
          const dummyCanvas = document.createElement("canvas");
          const ctx = dummyCanvas.getContext("2d");
          if (!ctx) return;

          const printArea = clonedDoc.getElementById("payslip-print-area");
          if (!printArea) return;

          const allElements = [printArea, ...Array.from(printArea.querySelectorAll("*"))] as HTMLElement[];
          const colorProps = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderBottomColor",
            "borderLeftColor",
            "borderRightColor",
            "outlineColor",
            "textDecorationColor"
          ];

          allElements.forEach((el) => {
            const computed = window.getComputedStyle(el);

            colorProps.forEach((prop) => {
              const val = (computed as any)[prop];
              if (val && typeof val === "string" && val.includes("oklch")) {
                try {
                  ctx.fillStyle = "#ffffff";
                  ctx.fillStyle = val;
                  el.style.setProperty(prop, ctx.fillStyle, "important");
                } catch {
                  el.style.setProperty(prop, "#334155", "important");
                }
              }
            });

            if (computed.boxShadow && computed.boxShadow.includes("oklch")) {
              el.style.boxShadow = "none";
            }
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const cleanName = record.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
      const fileName = `PhieuLuong_${record.empId}_${cleanName}_Thang_${record.month.replace(".", "_")}.pdf`;
      pdf.save(fileName);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      console.error("Lỗi xuất PDF:", err);
      alert("Có lỗi khi xuất file PDF phiếu lương: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  // Hàm in phiếu lương
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm">
              Phiếu lương nhân viên - {record.name} ({record.empId})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer size={14} />
              <span>In</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all ${
                exported
                  ? "bg-emerald-500 text-white"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {exported ? <CheckCircle size={14} /> : <Download size={14} />}
              <span>{isExporting ? "Đang tạo PDF..." : exported ? "Đã tải xong!" : "Tải PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nội dung Phiếu Lương (Vùng in và xuất PDF chuẩn mẫu sheet 8) */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-60px)] bg-slate-100 flex justify-center">
          <div
            id="payslip-print-area"
            ref={payslipRef}
            className="w-full max-w-xl bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm text-slate-800 font-sans space-y-3.5"
          >
            {/* 1. Header Công ty (Đã bỏ logo theo yêu cầu) */}
            <div className="border-b-2 border-emerald-600 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950 uppercase tracking-tight">
                  CÔNG TY CỔ PHẦN MF14
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Clubhouse 3 đường Phong Lan 1, KĐT Vinhomes Riverside, P. Phúc Lợi, TP. Hà Nội
                </p>
                <p className="text-[11px] text-slate-600 font-mono">
                  MST: 0111258406
                </p>
              </div>

              {/* Tiêu đề chính */}
              <div className="text-center mt-3 pt-2 border-t border-slate-100">
                <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wide">
                  PHIẾU LƯƠNG THÁNG {record.month}
                </h2>
                <p className="text-[11px] text-slate-500 italic mt-0.5">
                  (Kèm theo Bảng lương & Chấm công Công ty CP MF14)
                </p>
              </div>
            </div>

            {/* 2. Thông tin nhân sự & Ngày công */}
            <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-50/80 p-3 rounded-lg border border-slate-200">
              {/* Cột trái: Thông tin nhân sự */}
              <div className="space-y-1 border-r border-slate-200/80 pr-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã NV:</span>
                  <span className="font-bold text-slate-900 font-mono">{record.empId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Họ & Tên:</span>
                  <span className="font-bold text-slate-900">{record.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng ban:</span>
                  <span className="font-semibold text-slate-800">{record.dept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chức vụ:</span>
                  <span className="font-semibold text-slate-800">{record.title || employee?.position || "Nhân viên"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tình trạng:</span>
                  <span className="font-semibold text-emerald-800">{record.status || employee?.status || "Chính Thức"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phép tồn:</span>
                  <span className="font-semibold text-slate-800">1 ngày</span>
                </div>
              </div>

              {/* Cột phải: Thống kê ngày công */}
              <div className="space-y-1 pl-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Công tiêu chuẩn:</span>
                  <span className="font-bold text-slate-900">{actualStandardDays} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Công chính thức:</span>
                  <span className="font-bold text-emerald-700">{workDaysOfficial} công</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Công thử việc:</span>
                  <span className="font-semibold text-slate-700">{workDaysProbation} công</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nghỉ lễ, chế độ:</span>
                  <span className="font-semibold text-rose-700">{holidayDays} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nghỉ phép năm:</span>
                  <span className="font-semibold text-purple-700">{paidLeaveDays} ngày</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nghỉ không lương:</span>
                  <span className="font-semibold text-slate-500">{unpaidDays} ngày</span>
                </div>
              </div>
            </div>

            {/* 3. Bảng Chi Tiết Thu Nhập & Các Khoản Trừ (Sheet 8 template) */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-1.5 px-2.5 text-left border-r border-slate-300 w-[110px]">Khoản mục</th>
                    <th className="py-1.5 px-2.5 text-left border-r border-slate-300">Chi tiết thu nhập & Giảm trừ</th>
                    <th className="py-1.5 px-2.5 text-right w-[120px] whitespace-nowrap">Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* (1) Các Khoản Cộng */}
                  <tr className="bg-emerald-50/20">
                    <td rowSpan={8} className="py-1.5 px-2.5 font-bold text-slate-800 align-top border-r border-slate-300 bg-slate-50/50">
                      <div>Các Khoản Cộng</div>
                      <div className="text-[10px] text-slate-500 font-normal">(1) Thu nhập</div>
                    </td>
                    <td className="py-1 px-2.5 border-r border-slate-200">Lương cơ bản theo ngày công</td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(actualBaseSalary)} đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Hỗ trợ (ăn trưa, gửi xe, điện thoại, trang phục)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrency(allowancesTotal)} đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Thưởng YTCLCV (Ý thức chất lượng công việc)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrency(bonusHQCV)} đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Thưởng hiệu quả kinh doanh</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Làm thêm giờ (OT)</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Phúc lợi</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Các khoản cộng khác</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr className="bg-emerald-50/80 font-bold border-t border-emerald-200">
                    <td className="py-1.5 px-2.5 border-r border-slate-200 text-emerald-950 uppercase text-[10px]">
                      Tổng các khoản cộng (Gross)
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-emerald-900 whitespace-nowrap">
                      {formatCurrency(totalGross)} đ
                    </td>
                  </tr>

                  {/* (2) Các Khoản Trừ */}
                  <tr className="bg-amber-50/20">
                    <td rowSpan={6} className="py-1.5 px-2.5 font-bold text-slate-800 align-top border-r border-slate-300 bg-slate-50/50">
                      <div>Các Khoản Trừ</div>
                      <div className="text-[10px] text-slate-500 font-normal">(2) Giảm trừ</div>
                    </td>
                    <td className="py-1 px-2.5 border-r border-slate-200">Trích nộp BHXH, BHYT, BHTN (10.5%)</td>
                    <td className="py-1 px-2.5 text-right font-mono font-semibold text-amber-800 whitespace-nowrap">
                      {formatCurrency(bhxhDeduction)} đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Thuế TNCN tạm tính</td>
                    <td className="py-1 px-2.5 text-right font-mono font-semibold text-amber-800 whitespace-nowrap">
                      {formatCurrency(tax)} đ
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Tiền Phí Công Đoàn</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Hoàn thuế TNCN 2024</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2.5 border-r border-slate-200">Các Khoản Trừ Khác</td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-400 whitespace-nowrap">0 đ</td>
                  </tr>
                  <tr className="bg-amber-50/80 font-bold border-t border-amber-200">
                    <td className="py-1.5 px-2.5 border-r border-slate-200 text-amber-950 uppercase text-[10px]">
                      Tổng các khoản trừ
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-amber-900 whitespace-nowrap">
                      {formatCurrency(totalDeductions)} đ
                    </td>
                  </tr>

                  {/* (3) Thực Lĩnh & Chi phí DN */}
                  <tr className="bg-emerald-600 text-white font-extrabold">
                    <td className="py-2.5 px-2.5 uppercase text-[10px] border-r border-emerald-500">
                      Thực lĩnh
                    </td>
                    <td className="py-2.5 px-2.5 uppercase text-[11px] border-r border-emerald-500 font-bold">
                      Số tiền thực lĩnh của nhân sự ((1) - (2))
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-sm whitespace-nowrap">
                      {formatCurrency(netSalary)} đ
                    </td>
                  </tr>

                  {/* Chi phí BHXH công ty đóng */}
                  <tr className="bg-slate-50 text-slate-600">
                    <td rowSpan={2} className="py-1.5 px-2.5 font-semibold text-slate-500 align-top border-r border-slate-300 text-[10px]">
                      Ghi chú thêm
                    </td>
                    <td className="py-1 px-2.5 border-r border-slate-200">
                      Tiền Bảo Hiểm Công Ty Đóng Cho Nhân Viên (21.5%)
                    </td>
                    <td className="py-1 px-2.5 text-right font-mono text-slate-700 whitespace-nowrap">
                      {formatCurrency(companyInsurance)} đ
                    </td>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600">
                    <td className="py-1 px-2.5 border-r border-slate-200 font-semibold text-slate-700">
                      Tổng chi phí lương của công ty dành cho nhân sự
                    </td>
                    <td className="py-1 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(totalCompanyCost)} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Khối chữ ký phê duyệt */}
            <div className="pt-4 grid grid-cols-3 gap-3 text-center text-[11px]">
              <div>
                <span className="font-bold text-slate-800 uppercase block">Người lập biểu</span>
                <span className="text-[10px] text-slate-400 italic block mt-0.5">(Ký, họ tên)</span>
                <div className="h-10"></div>
                <span className="font-semibold text-slate-700 block">Kế toán lương</span>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block">Kế toán trưởng</span>
                <span className="text-[10px] text-slate-400 italic block mt-0.5">(Ký, họ tên)</span>
                <div className="h-10"></div>
                <span className="font-semibold text-slate-700 block">Bùi Thanh Anh</span>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block">Người nhận tiền</span>
                <span className="text-[10px] text-slate-400 italic block mt-0.5">(Ký, họ tên)</span>
                <div className="h-10"></div>
                <span className="font-semibold text-slate-700 block">{record.name}</span>
              </div>
            </div>

            {/* Footer Ngày in */}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-[9px] text-slate-400 italic">
              <span>Hệ thống Quản trị Nhân sự & Tiền lương MF14</span>
              <span>Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
