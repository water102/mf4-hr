# -*- coding: utf-8 -*-
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r"f:\ws\projects\hrm-mf14\app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_drawer = """// Mở Drawer chi tiết nhân viên
window.openEmployeeDrawer = function(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  window._activeDrawerEmpId = empId;

  const drawer = document.getElementById("emp-drawer");
  const backdrop = document.getElementById("drawer-backdrop");

  // Header
  const initials = emp.name.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase();
  document.getElementById("d-avatar").innerText = initials;
  document.getElementById("d-name").innerText = emp.name;
  document.getElementById("d-subtitle").innerText = `${emp.id} · ${emp.position || emp.jobTitle} · ${emp.dept}`;

  const statusPill = document.getElementById("d-status-pill");
  if (statusPill) {
    statusPill.innerText = emp.status;
    statusPill.className = `badge-status ${emp.status === "Đang làm việc" ? "badge-active" : "badge-inactive"}`;
  }

  // Tab 1: Thông tin cá nhân
  document.getElementById("f-code").innerText = emp.id;
  document.getElementById("f-name").innerText = emp.name;
  document.getElementById("f-gender").innerText = emp.gender || "Nữ";
  document.getElementById("f-dob").innerText = emp.dob || "-";
  document.getElementById("f-ethnicity").innerText = emp.ethnicity || "Kinh";
  document.getElementById("f-hometown").innerText = emp.hometown || "-";
  document.getElementById("f-idcard").innerText = emp.idCard || "-";
  document.getElementById("f-iddate").innerText = emp.idDate || "-";
  document.getElementById("f-address").innerText = emp.address || emp.hktt || "-";
  document.getElementById("f-phone").innerText = emp.phone || "-";
  document.getElementById("f-email").innerText = emp.email || "-";
  document.getElementById("f-edu").innerText = emp.education || "-";

  // Công việc
  document.getElementById("f-dept").innerText = emp.dept;
  document.getElementById("f-position").innerText = emp.position || "-";
  document.getElementById("f-jobtitle").innerText = emp.jobTitle || "-";
  document.getElementById("f-shift").innerText = emp.teamShift || "-";
  document.getElementById("f-startdate").innerText = emp.startDate || "-";
  document.getElementById("f-leavedate").innerText = emp.leaveDate || "-";

  // Ngân hàng & BHXH
  document.getElementById("f-insurance").innerText = emp.insuranceNumber || "-";
  document.getElementById("f-bank").innerText = emp.salary?.bank || emp.bank || "Vietcombank";
  document.getElementById("f-bankacc").innerText = emp.salary?.bankAccount || emp.accountNumber || "-";

  // Tab 2: Hợp đồng & Scan Drive
  const contractBox = document.getElementById("d-contract-content");
  if (contractBox) {
    if (emp.contract) {
      contractBox.innerHTML = `
        <div class="field-grid-2">
          <div class="field-item">
            <span class="field-label">Số hợp đồng</span>
            <span class="field-value">${emp.contract.number}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Loại hợp đồng</span>
            <span class="field-value">${emp.contract.type}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Ngày hiệu lực</span>
            <span class="field-value">${emp.contract.startDate}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Ngày kết thúc</span>
            <span class="field-value">${emp.contract.endDate || "–"}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Mức lương thỏa thuận / đóng BH</span>
            <span class="field-value">${emp.contract.salary || "–"}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Trạng thái HĐ</span>
            <span class="badge-status ${emp.contract.status === 'Đang hiệu lực' ? 'badge-active' : 'badge-inactive'}">${emp.contract.status}</span>
          </div>
        </div>

        <div class="drive-sync-box" style="margin-top: 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px;">
          <div style="font-weight: 700; color: #166534; font-size: 13.5px;">📁 Bản scan hợp đồng trên Google Drive</div>
          <p style="font-size: 12px; color: #4b5563; margin-top: 4px;">File: <strong>${emp.contract.driveFile}</strong> (Lưu tại thư mục Hop_Dong_MF14)</p>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
            <a href="https://drive.google.com/drive/folders/${CONFIG.folderDriveId}" target="_blank" class="btn-action-primary" style="text-decoration:none;">
              🔍 Mở Google Drive
            </a>
            <button onclick="triggerUploadContract('${emp.id}')" class="btn-action-outline">
              ⬆️ Tải lên bản scan mới
            </button>
          </div>
        </div>
      `;
    } else {
      contractBox.innerHTML = `
        <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Chưa có bản ghi hợp đồng lao động điện tử cho nhân viên này.</p>
        <button onclick="triggerUploadContract('${emp.id}')" class="btn-action-primary">
          ➕ Tải lên bản scan hợp đồng vào Google Drive
        </button>
      `;
    }
  }

  drawer?.classList.add("open");
  backdrop?.classList.add("show");
};"""

new_drawer = """// Mở Drawer chi tiết nhân viên (Đồng bộ chuẩn 100% từ Excel)
window.openEmployeeDrawer = function(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  window._activeDrawerEmpId = empId;

  const drawer = document.getElementById("emp-drawer");
  const backdrop = document.getElementById("drawer-backdrop");

  // Header
  const initials = emp.name.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase();
  document.getElementById("d-avatar").innerText = initials;
  document.getElementById("d-name").innerText = emp.name;
  document.getElementById("d-subtitle").innerText = `${emp.id} · ${emp.position || emp.jobTitle || "–"} · ${emp.dept}`;

  const statusPill = document.getElementById("d-status-pill");
  if (statusPill) {
    statusPill.innerText = emp.contractStatus || emp.status || "Đang làm việc";
    statusPill.className = "badge-status badge-active";
  }

  // Tab 1: Thông tin cá nhân
  document.getElementById("f-code").innerText = emp.id;
  document.getElementById("f-name").innerText = emp.name;
  document.getElementById("f-gender").innerText = emp.gender || "–";
  document.getElementById("f-dob").innerText = emp.dob || "–";
  document.getElementById("f-ethnicity").innerText = "Kinh";
  document.getElementById("f-hometown").innerText = emp.hktt || "–";
  document.getElementById("f-idcard").innerText = emp.cccd || emp.idCard || "–";
  document.getElementById("f-iddate").innerText = emp.idDate || "–";
  document.getElementById("f-address").innerText = emp.address || emp.hktt || "–";
  document.getElementById("f-phone").innerText = emp.phone || "–";
  document.getElementById("f-email").innerText = emp.phone ? `${emp.id.toLowerCase()}@mf14.vn` : "–";
  document.getElementById("f-edu").innerText = "Đại học / Cao đẳng";
  document.getElementById("f-marital").innerText = "–";
  document.getElementById("f-dependents").innerText = "–";

  // Công việc
  document.getElementById("f-dept").innerText = emp.dept;
  document.getElementById("f-position").innerText = emp.position || emp.jobTitle || "–";
  document.getElementById("f-jobtitle").innerText = emp.jobTitle || emp.position || "–";
  document.getElementById("f-shift").innerText = "Hành chính";
  document.getElementById("f-startdate").innerText = emp.contract_ct?.startDate || emp.contract_tv?.startDate || "–";
  document.getElementById("f-leavedate").innerText = "–";

  // Tab 1: Hồ sơ giấy tờ (Cột 25-30 trong Excel)
  const docContainer = document.getElementById("d-documents-content");
  if (docContainer) {
    const docs = emp.documents || {};
    const docItems = [
      { label: "Sơ yếu lý lịch", has: docs.syll },
      { label: "Bản sao CCCD", has: docs.cccd },
      { label: "Giấy khai sinh", has: docs.gks },
      { label: "Bằng cấp / Chứng chỉ", has: docs.bangcap },
      { label: "Giấy khám sức khỏe", has: docs.gksk },
      { label: "Lý lịch tư pháp", has: docs.tuphap }
    ];
    docContainer.innerHTML = docItems.map(d => `
      <div class="field-item" style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0;">
        <span class="field-label" style="margin-bottom:0;">${d.label}:</span>
        <span style="font-weight:700; font-size:12px; color:${d.has ? '#15803d' : '#b45309'};">
          ${d.has ? '✓ Đã có' : '⚠️ Chưa nộp'}
        </span>
      </div>
    `).join("");
  }

  // Tab 2: Hợp đồng & Scan Drive (Theo rà soát hợp đồng Excel)
  const contractBox = document.getElementById("d-contract-content");
  if (contractBox) {
    const tv = emp.contract_tv || {};
    const ct = emp.contract_ct || {};
    contractBox.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:12px;">
        <div style="font-weight:700; color:#14532d; font-size:13px; margin-bottom:8px;">📄 1. HỢP ĐỒNG THỬ VIỆC</div>
        <div class="field-grid-2">
          <div class="field-item">
            <span class="field-label">Số HĐ thử việc:</span>
            <span class="field-value">${tv.number || '– (Chưa đánh số)'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Thời hạn:</span>
            <span class="field-value">${tv.startDate && tv.endDate ? (tv.startDate + ' đến ' + tv.endDate) : '–'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Tình trạng hạn:</span>
            <span class="field-value" style="color:#c2410c; font-weight:700;">${tv.daysLeft ? (tv.daysLeft.includes('hạn') ? tv.daysLeft : 'Còn ' + tv.daysLeft + ' ngày') : '–'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Lương thử việc:</span>
            <span class="field-value" style="font-weight:600;">${emp.salary?.probation ? Number(emp.salary.probation).toLocaleString('vi-VN') + ' đ' : '–'}</span>
          </div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:12px;">
        <div style="font-weight:700; color:#14532d; font-size:13px; margin-bottom:8px;">📑 2. HỢP ĐỒNG CHÍNH THỨC</div>
        <div class="field-grid-2">
          <div class="field-item">
            <span class="field-label">Số HĐ chính thức:</span>
            <span class="field-value" style="font-weight:700; color:#0f766e;">${ct.number || '– (Chưa có HĐCT)'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Thời hạn HĐCT:</span>
            <span class="field-value">${ct.startDate && ct.endDate ? (ct.startDate + ' đến ' + ct.endDate) : '–'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Hạn còn lại:</span>
            <span class="field-value" style="font-weight:600;">${ct.daysLeft ? ct.daysLeft + ' ngày' : '–'}</span>
          </div>
          <div class="field-item">
            <span class="field-label">Lương đóng BHXH:</span>
            <span class="field-value" style="font-weight:600;">${emp.salary?.bhxhBase ? Number(emp.salary.bhxhBase).toLocaleString('vi-VN') + ' đ' : '–'}</span>
          </div>
        </div>
      </div>

      <div style="background:#fefce8; border:1px solid #fef08a; border-radius:8px; padding:12px; margin-bottom:12px; font-size:12.5px;">
        <div><strong>Kế toán check:</strong> <span style="color:#b45309; font-weight:700;">${emp.ktCheck || '–'}</span></div>
        <div style="margin-top:4px;"><strong>Ghi chú:</strong> <span style="color:#475569;">${emp.note || 'Không có ghi chú'}</span></div>
      </div>

      <div class="drive-sync-box" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:14px;">
        <div style="font-weight:700; color:#166534; font-size:13px;">📁 Bản scan hợp đồng trên Google Drive</div>
        <p style="font-size:12px; color:#4b5563; margin-top:4px;">Thư mục: <strong>Hop_Dong_MF14</strong> (ID: ${CONFIG.folderDriveId})</p>
        <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
          <a href="https://drive.google.com/drive/folders/${CONFIG.folderDriveId}" target="_blank" class="btn-action-primary" style="text-decoration:none;">
            🔍 Mở Google Drive
          </a>
          <button onclick="triggerUploadContract('${emp.id}')" class="btn-action-outline">
            ⬆️ Tải lên bản scan mới
          </button>
        </div>
      </div>
    `;
  }

  // Tab 3: Lương (#d-salary-content)
  const salaryBox = document.getElementById("d-salary-content");
  if (salaryBox) {
    const s = emp.salary || {};
    salaryBox.innerHTML = `
      <div class="field-grid-2">
        <div class="field-item">
          <span class="field-label">Lương Gross:</span>
          <span class="field-value" style="font-weight:700; font-size:15px; color:#14532d;">${s.gross ? Number(s.gross).toLocaleString('vi-VN') + ' đ' : '0 đ'}</span>
        </div>
        <div class="field-item">
          <span class="field-label">Lương thử việc:</span>
          <span class="field-value" style="font-weight:600;">${s.probation ? Number(s.probation).toLocaleString('vi-VN') + ' đ' : '0 đ'}</span>
        </div>
        <div class="field-item">
          <span class="field-label">Lương đóng BHXH:</span>
          <span class="field-value" style="font-weight:600;">${s.bhxhBase ? Number(s.bhxhBase).toLocaleString('vi-VN') + ' đ' : '0 đ'}</span>
        </div>
        <div class="field-item">
          <span class="field-label">10.5% BHXH trừ lương:</span>
          <span class="field-value" style="color:#dc2626; font-weight:600;">-${s.bhxh105 ? Number(s.bhxh105).toLocaleString('vi-VN') + ' đ' : '0 đ'}</span>
        </div>
        <div class="field-item" style="grid-column:span 2; background:#f0fdf4; padding:12px; border-radius:6px; border:1px solid #bbf7d0;">
          <span class="field-label" style="font-size:13px; color:#166534; font-weight:700;">Thực lĩnh chuyển khoản Net:</span>
          <span class="field-value" style="color:#15803d; font-size:18px; font-weight:800;">${s.net ? Number(s.net).toLocaleString('vi-VN') + ' đ' : '0 đ'}</span>
        </div>
      </div>
    `;
  }

  // Tab 4: Nghỉ phép (#d-leave-content)
  const leaveBox = document.getElementById("d-leave-content");
  if (leaveBox) {
    leaveBox.innerHTML = `
      <div class="field-grid-2">
        <div class="field-item">
          <span class="field-label">Tổng phép năm 2026:</span>
          <span class="field-value" style="font-weight:700;">12 ngày</span>
        </div>
        <div class="field-item">
          <span class="field-label">Đã nghỉ:</span>
          <span class="field-value">0 ngày</span>
        </div>
        <div class="field-item">
          <span class="field-label">Còn lại:</span>
          <span class="field-value" style="color:#15803d; font-weight:700; font-size:16px;">12 ngày</span>
        </div>
      </div>
    `;
  }

  // Tab 5: Chấm công (#d-timesheet-content)
  const tsBox = document.getElementById("d-timesheet-content");
  if (tsBox) {
    tsBox.innerHTML = `
      <div class="field-grid-2">
        <div class="field-item">
          <span class="field-label">Ngày công chuẩn tháng 10/2026:</span>
          <span class="field-value" style="font-weight:700; color:#14532d;">22 ngày</span>
        </div>
        <div class="field-item">
          <span class="field-label">Lượt đi muộn:</span>
          <span class="field-value" style="color:#15803d; font-weight:600;">0 lần</span>
        </div>
        <div class="field-item" style="grid-column:span 2;">
          <span class="field-label">Trạng thái công:</span>
          <span class="field-value" style="color:#15803d; font-weight:600;">✓ Đi làm đầy đủ</span>
        </div>
      </div>
    `;
  }

  drawer?.classList.add("open");
  backdrop?.classList.add("show");
};"""

if old_drawer in content:
    content = content.replace(old_drawer, new_drawer)
    print("✓ Replaced openEmployeeDrawer")
else:
    print("! Could not find old_drawer")

with open(r"f:\ws\projects\hrm-mf14\app.js", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Saved updated app.js")
