# -*- coding: utf-8 -*-
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r"f:\ws\projects\hrm-mf14\app.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update initDashboard to include renderPayrollBars
old_init_dash = """function initDashboard() {
  renderDashboardKPIs();
  renderDepartmentBars();
  renderUrgentTasks();
}"""

new_init_dash = """function initDashboard() {
  renderDashboardKPIs();
  renderDepartmentBars();
  renderPayrollBars();
  renderUrgentTasks();
}

function renderPayrollBars() {
  const container = document.getElementById("payroll-bars-container");
  if (!container) return;
  const history = STATE.payrollHistory || [
    { month: "Tháng 07/2026", total: 0.40, net: 0.38 },
    { month: "Tháng 08/2026", total: 0.41, net: 0.39 },
    { month: "Tháng 09/2026", total: 0.42, net: 0.40 },
    { month: "Tháng 10/2026", total: 0.43, net: 0.41 }
  ];
  container.innerHTML = history.map(h => `
    <div class="payroll-bar-group">
      <span class="bar-val-label">${h.total.toFixed(2).replace('.', ',')}</span>
      <div class="payroll-bar-stack">
        <div class="bar-total" style="height: ${Math.round((h.total / 0.5) * 100)}%;"></div>
        <div class="bar-net" style="height: ${Math.round((h.net / 0.5) * 100)}%;"></div>
      </div>
      <span class="bar-month-name">${h.month}</span>
    </div>
  `).join("");
}"""

if old_init_dash in content:
    content = content.replace(old_init_dash, new_init_dash)
    print("✓ Replaced initDashboard & added renderPayrollBars")
else:
    print("! Could not find old_init_dash")

# 2. Update renderDashboardKPIs
old_kpi = """function renderDashboardKPIs() {
  const emps = STATE.employees || [];
  const activeCount = emps.filter(e => e.status !== "Đã nghỉ việc").length;
  const leavesCount = (STATE.leavesList || []).filter(l => l.status === "Chờ duyệt").length;
  
  // Tính tổng lương
  let totalGross = 0;
  emps.forEach(e => {
    const s = e.salary?.gross || e.salary?.probation || 10000000;
    totalGross += Number(s) || 0;
  });
  const grossBn = (totalGross / 1000000000).toFixed(2).replace(".", ",");
  const netBn = ((totalGross * 0.88) / 1000000000).toFixed(2).replace(".", ",");

  // Hợp đồng sắp hết hạn
  const expiringContracts = (STATE.contractsList || []).filter(c => c.status === "Sắp hết hạn" || c.status === "Chưa ký HĐ").length;

  const elEmp = document.getElementById("kpi-total-emp");
  const elEmpSub = document.getElementById("kpi-emp-subtext");
  const elPay = document.getElementById("kpi-payroll-val");
  const elPayNet = document.getElementById("kpi-payroll-net");
  const elExp = document.getElementById("kpi-contracts-expiring");
  const elLeave = document.getElementById("kpi-pending-leaves");

  if (elEmp) elEmp.innerText = activeCount;
  if (elEmpSub) elEmpSub.innerHTML = `<strong>${activeCount}</strong> đang đi làm • <strong>${emps.length - activeCount}</strong> đã nghỉ`;
  if (elPay) elPay.innerText = grossBn;
  if (elPayNet) elPayNet.innerText = `${netBn} tỷ`;
  if (elExp) elExp.innerText = expiringContracts;
  if (elLeave) elLeave.innerText = leavesCount;
}"""

new_kpi = """function renderDashboardKPIs() {
  const emps = STATE.employees || [];
  const activeCount = emps.filter(e => e.status !== "Đã nghỉ việc").length;
  const leavesCount = (STATE.leavesList || []).filter(l => l.status === "Chờ duyệt").length;
  
  let totalGross = 0;
  let totalNet = 0;
  emps.forEach(e => {
    totalGross += Number(e.salary?.gross) || 0;
    totalNet += Number(e.salary?.net) || 0;
  });
  const grossBn = (totalGross / 1000000000).toFixed(2).replace(".", ",");
  const netBn = (totalNet / 1000000000).toFixed(2).replace(".", ",");

  const urgentTasksCount = (STATE.allTasks || []).filter(t => t.status !== "done").length;

  const elEmp = document.getElementById("kpi-total-emp");
  const elEmpSub = document.getElementById("kpi-emp-subtext");
  const elPay = document.getElementById("kpi-payroll-val");
  const elPayNet = document.getElementById("kpi-payroll-net");
  const elExp = document.getElementById("kpi-contracts-expiring");
  const elLeave = document.getElementById("kpi-pending-leaves");

  if (elEmp) elEmp.innerText = activeCount;
  if (elEmpSub) elEmpSub.innerHTML = `<strong>${activeCount}</strong> nhân sự • <strong>3</strong> phòng ban`;
  if (elPay) elPay.innerText = grossBn;
  if (elPayNet) elPayNet.innerText = `${netBn} tỷ`;
  if (elExp) elExp.innerText = urgentTasksCount;
  if (elLeave) elLeave.innerText = leavesCount;
}"""

if old_kpi in content:
    content = content.replace(old_kpi, new_kpi)
    print("✓ Replaced renderDashboardKPIs")
else:
    print("! Could not find old_kpi")

# 3. Update initEmployeesView rendering
old_emp_render = """    tbody.innerHTML = filtered.map(emp => {
      const isActive = emp.status === "Đang làm việc";
      return `
        <tr>
          <td class="emp-code">${emp.id}</td>
          <td>
            <span class="emp-name-link" onclick="openEmployeeDrawer('${emp.id}')" style="cursor:pointer; font-weight:600; color:#14532d;">
              ${emp.name}
            </span>
          </td>
          <td>${emp.dept}</td>
          <td>${emp.position || emp.jobTitle || "-"}</td>
          <td>
            <span class="badge-status ${isActive ? "badge-active" : "badge-inactive"}">
              ${emp.status}
            </span>
          </td>
        </tr>
      `;
    }).join("");"""

new_emp_render = """    tbody.innerHTML = filtered.map(emp => {
      const grossStr = emp.salary?.gross ? Number(emp.salary.gross).toLocaleString("vi-VN") + " đ" : "0 đ";
      const netStr = emp.salary?.net ? Number(emp.salary.net).toLocaleString("vi-VN") + " đ" : "0 đ";
      const tvStr = emp.contract_tv?.number || (emp.contract_tv?.startDate ? "Thử việc (" + emp.contract_tv.startDate + ")" : "–");
      const ctStr = emp.contract_ct?.number || "–";
      const statusNote = emp.ktCheck || emp.note || emp.contractStatus || "–";
      
      let badgeBg = "#f1f5f9";
      let badgeColor = "#334155";
      if (statusNote.includes("Trình ký")) { badgeBg = "#fef3c7"; badgeColor = "#92400e"; }
      else if (statusNote.includes("Bổ sung")) { badgeBg = "#fed7aa"; badgeColor = "#9a3412"; }
      else if (statusNote.includes("Đã ký")) { badgeBg = "#dcfce7"; badgeColor = "#166534"; }
      else if (statusNote.includes("chưa ký") || statusNote.includes("??")) { badgeBg = "#fee2e2"; badgeColor = "#991b1b"; }

      return `
        <tr>
          <td class="emp-code">${emp.id}</td>
          <td>
            <span class="emp-name-link" onclick="openEmployeeDrawer('${emp.id}')" style="cursor:pointer; font-weight:600; color:#14532d;">
              ${emp.name}
            </span>
          </td>
          <td>${emp.dept}</td>
          <td>${emp.position || emp.jobTitle || "–"}</td>
          <td>${emp.phone || "–"}</td>
          <td>${emp.dob || "–"}</td>
          <td style="font-family:monospace;">${emp.cccd || emp.idCard || "–"}</td>
          <td style="font-size:12px; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${emp.address || emp.hktt || ''}">${emp.address || emp.hktt || "–"}</td>
          <td style="font-weight:600; text-align:right;">${grossStr}</td>
          <td style="font-weight:700; color:#15803d; text-align:right;">${netStr}</td>
          <td style="font-size:12px;">${tvStr}</td>
          <td style="font-size:12px; font-weight:600; color:#0f766e;">${ctStr}</td>
          <td>
            <span class="badge-status" style="background:${badgeBg}; color:${badgeColor}; font-size:11px; padding:3px 8px;">
              ${statusNote}
            </span>
          </td>
        </tr>
      `;
    }).join("");"""

if old_emp_render in content:
    content = content.replace(old_emp_render, new_emp_render)
    print("✓ Replaced initEmployeesView renderTable")
else:
    print("! Could not find old_emp_render")

# 4. Update initContractsView rendering
old_contract_render = """    tbody.innerHTML = filtered.map(c => {
      let statusClass = "badge-active";
      if (c.status === "Sắp hết hạn") statusClass = "badge-warning";
      if (c.status === "Chưa ký HĐ" || c.status === "Đã hết hạn") statusClass = "badge-inactive";

      return `
        <tr>
          <td class="emp-code">${c.empId}</td>
          <td>
            <span class="emp-name-link" onclick="openEmployeeDrawer('${c.empId}')" style="cursor:pointer; font-weight:600; color:#14532d;">
              ${c.name}
            </span>
          </td>
          <td>${c.dept}</td>
          <td style="font-family:monospace; font-weight:600;">${c.contractNo}</td>
          <td><span class="tag-emp" style="background:#f1f5f9; color:#334155;">${c.type}</span></td>
          <td>${c.startDate}</td>
          <td>${c.endDate || "–"}</td>
          <td style="font-weight:600;">${c.baseSalary}</td>
          <td><span class="badge-status ${statusClass}">${c.status}</span></td>
        </tr>
      `;
    }).join("");"""

new_contract_render = """    tbody.innerHTML = filtered.map(c => {
      let statusClass = "badge-active";
      const statusText = c.status || c.ktCheck || "–";
      if (statusText.includes("Trình ký") || statusText.includes("Bổ sung")) statusClass = "badge-warning";
      if (statusText.includes("Chưa") || statusText.includes("??")) statusClass = "badge-inactive";

      return `
        <tr>
          <td class="emp-code">${c.empId}</td>
          <td>
            <span class="emp-name-link" onclick="openEmployeeDrawer('${c.empId}')" style="cursor:pointer; font-weight:600; color:#14532d;">
              ${c.name}
            </span>
          </td>
          <td>${c.dept}</td>
          <td>${c.position || "–"}</td>
          <td style="font-size:12px;">${c.tvNumber || "–"}</td>
          <td style="font-size:11.5px;">${c.tvPeriod || "–"}</td>
          <td style="font-weight:600; color:#c2410c;">${c.tvDaysLeft ? (c.tvDaysLeft.includes('hạn') ? c.tvDaysLeft : c.tvDaysLeft + ' ngày') : "–"}</td>
          <td style="font-weight:700; color:#0f766e; font-size:12px;">${c.ctNumber || "–"}</td>
          <td style="font-size:11.5px;">${c.ctPeriod || "–"}</td>
          <td style="font-weight:600;">${c.ctDaysLeft ? c.ctDaysLeft + ' ngày' : "–"}</td>
          <td><span class="badge-status ${statusClass}">${statusText}</span></td>
          <td style="font-size:12px; color:#64748b;">${c.note || "–"}</td>
        </tr>
      `;
    }).join("");"""

if old_contract_render in content:
    content = content.replace(old_contract_render, new_contract_render)
    print("✓ Replaced initContractsView renderTable")
else:
    print("! Could not find old_contract_render")

# 5. Update initPayrollView rendering
old_payroll_render = """    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td class="emp-code">${p.empId}</td>
        <td><span class="emp-name-link" onclick="openEmployeeDrawer('${p.empId}')" style="cursor:pointer; font-weight:600; color:#14532d;">${p.name}</span></td>
        <td>${p.dept}</td>
        <td style="font-weight:600;">${p.base} đ</td>
        <td style="text-align:center;">${p.days}</td>
        <td>${p.allowance} đ</td>
        <td>${p.ot} đ</td>
        <td style="font-weight:700; color:#0f766e;">${p.total} đ</td>
        <td style="color:#b91c1c;">${p.insurance} đ</td>
        <td style="font-weight:700; color:#15803d; font-size:13.5px;">${p.net} đ</td>
        <td>
          <button class="btn-action-outline" style="padding:3px 8px; font-size:11px;" onclick="viewPayslip('${p.empId}')">
            🔍 Phiếu lương
          </button>
        </td>
      </tr>
    `).join("");"""

new_payroll_render = """    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td class="emp-code">${p.empId}</td>
        <td><span class="emp-name-link" onclick="openEmployeeDrawer('${p.empId}')" style="cursor:pointer; font-weight:600; color:#14532d;">${p.name}</span></td>
        <td>${p.dept}</td>
        <td>${p.position || "–"}</td>
        <td style="font-weight:600; text-align:right;">${p.grossFormatted || p.gross || "0 đ"}</td>
        <td style="text-align:right;">${p.probationFormatted || p.probation || "0 đ"}</td>
        <td style="text-align:right;">${p.bhxhBaseFormatted || p.bhxhBase || "0 đ"}</td>
        <td style="color:#b91c1c; text-align:right;">${p.bhxh105Formatted || p.bhxh105 || "0 đ"}</td>
        <td style="font-weight:700; color:#15803d; font-size:13.5px; text-align:right;">${p.netFormatted || p.net || "0 đ"}</td>
        <td>
          <button class="btn-action-outline" style="padding:3px 8px; font-size:11px;" onclick="viewPayslip('${p.empId}')">
            🔍 Phiếu lương
          </button>
        </td>
      </tr>
    `).join("");"""

if old_payroll_render in content:
    content = content.replace(old_payroll_render, new_payroll_render)
    print("✓ Replaced initPayrollView renderPayroll")
else:
    print("! Could not find old_payroll_render")

with open(r"f:\ws\projects\hrm-mf14\app.js", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Saved updated app.js")
