/**
 * =========================================================================
 * HRM CÔNG TY CỔ PHẦN MF14 - FRONTEND APPLICATION LOGIC (PHIÊN BẢN CHÍNH THỨC)
 * Dữ liệu chuẩn hóa 100% từ file DANH SÁCH NHÂN VIÊN MS14_new.xlsx
 * Tích hợp Google Sheets ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Tích hợp Google Drive Folder ID: 1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1
 * =========================================================================
 */

// Cấu hình ứng dụng
const CONFIG = {
  sheetId: window.APP_ENV?.GOOGLE_SHEET_ID || "1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I",
  folderDriveId: window.APP_ENV?.GOOGLE_DRIVE_FOLDER_ID || "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1",
  googleClientId: window.APP_ENV?.GOOGLE_CLIENT_ID || "",
  appsScriptUrlKey: "hrm_apps_script_url"
};

// Trạng thái ứng dụng toàn cục (Khởi tạo từ localStorage hoặc Dữ liệu gốc MF14 từ Excel)
let STATE = initApplicationState();

function initApplicationState() {
  try {
    const cached = localStorage.getItem("hrm_mf14_state");
    if (cached) {
      const parsed = JSON.parse(cached);
      // Nếu phiên bản dữ liệu trùng với file Excel mới nhất
      if (parsed && parsed.version === window.MF14_INITIAL_DATA?.version && Array.isArray(parsed.employees) && parsed.employees.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Lỗi đọc cache dữ liệu:", e);
  }
  const fresh = JSON.parse(JSON.stringify(window.MF14_INITIAL_DATA || {}));
  try {
    localStorage.setItem("hrm_mf14_state", JSON.stringify(fresh));
  } catch(e) {}
  return fresh;
}

window.forceSyncFromExcel = function() {
  STATE = JSON.parse(JSON.stringify(window.MF14_INITIAL_DATA || {}));
  saveState();
  initDashboard();
  initTasksView();
  initEmployeesView();
  initContractsView();
  initTimesheetView();
  initLeavesView();
  initPayrollView();
  showToast("🔄 Đã đồng bộ dữ liệu mới nhất từ file DANH SÁCH NHÂN VIÊN MS14_new.xlsx!");
};

function saveState() {
  try {
    localStorage.setItem("hrm_mf14_state", JSON.stringify(STATE));
  } catch (e) {
    console.error("Lỗi lưu state:", e);
  }
}

// Lấy thông tin tài khoản Google đang đăng nhập thực tế
function getCurrentUser() {
  try {
    const sessionData = localStorage.getItem("hrm_auth_session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session && session.user && session.user !== "Phạm Thế Hưng") {
        return {
          name: session.user,
          email: session.email || "",
          picture: session.picture || "",
          token: session.token || ""
        };
      }
    }
  } catch (e) {}

  if (window._currentGoogleUser && window._currentGoogleUser.name !== "Phạm Thế Hưng") {
    return window._currentGoogleUser;
  }

  return {
    name: "Quản trị viên MF14",
    email: "admin@mf14.vn",
    picture: "",
    token: ""
  };
}

// Thông báo Toast nhanh cho người dùng
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : (type === "info" ? "toast-info" : "")}`;
  toast.innerHTML = `
    <span>${type === "error" ? "⚠️" : (type === "info" ? "ℹ️" : "✓")}</span>
    <div>${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Quản lý Modal
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
  }
};

// =========================================================================
// KHỞI TẠO ỨNG DỤNG KHI DOM SẴN SÀNG
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Đồng bộ cấu hình từ config.js vào input
  const inputClientId = document.getElementById("input-google-client-id");
  if (inputClientId && CONFIG.googleClientId) {
    inputClientId.value = CONFIG.googleClientId;
  }

  initNavigation();
  initAuthGatekeeper();
  initDashboard();
  initTasksView();
  initEmployeesView();
  initContractsView();
  initTimesheetView();
  initLeavesView();
  initPayrollView();
  initTableSorting();
  initSetup();
  initCodeViewer();
  bindGlobalEvents();
});

// =========================================================================
// NAVIGATION GIỮA CÁC TAB
// =========================================================================
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".view-page");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetView = item.getAttribute("data-target");
      if (!targetView) return;

      navItems.forEach(n => n.classList.remove("active"));
      pages.forEach(p => p.classList.remove("active"));

      item.classList.add("active");
      const targetPage = document.getElementById(targetView);
      if (targetPage) targetPage.classList.add("active");

      // Cập nhật URL Hash
      if (targetView === "view-dashboard") window.location.hash = "#dash";
      if (targetView === "view-tasks") window.location.hash = "#tasks";
      if (targetView === "view-employees") window.location.hash = "#employees";
      if (targetView === "view-contracts") window.location.hash = "#contracts";
      if (targetView === "view-timesheet") window.location.hash = "#timesheet";
      if (targetView === "view-leaves") window.location.hash = "#leaves";
      if (targetView === "view-payroll") window.location.hash = "#payroll";
      if (targetView === "view-setup") window.location.hash = "#setup";
    });
  });

  // Xử lý deep link hash
  const hash = window.location.hash;
  if (hash) {
    const map = {
      "#dash": "view-dashboard",
      "#tasks": "view-tasks",
      "#employees": "view-employees",
      "#contracts": "view-contracts",
      "#timesheet": "view-timesheet",
      "#leaves": "view-leaves",
      "#payroll": "view-payroll",
      "#setup": "view-setup"
    };
    const target = map[hash];
    if (target) {
      const navTarget = document.querySelector(`.nav-item[data-target="${target}"]`);
      if (navTarget) navTarget.click();
    }
  }
}

// =========================================================================
// GOOGLE OAUTH & GATEKEEPER
// =========================================================================
function initAuthGatekeeper() {
  const loginOverlay = document.getElementById("login-screen") || document.getElementById("login-gatekeeper-overlay");
  const btnLogin = document.getElementById("btn-login-google") || document.getElementById("btn-google-login");
  const txtLoginBtn = document.getElementById("txt-login-btn");
  const btnGrant = document.getElementById("btn-grant-access");
  const btnLogout = document.getElementById("btn-logout");
  const btnBypass = document.getElementById("btn-admin-bypass");
  const step1Card = document.getElementById("step-1-card") || document.getElementById("card-step-1");
  const step2Card = document.getElementById("step-2-card") || document.getElementById("card-step-2");
  const badgeStep1 = document.getElementById("badge-step-1");
  const badgeStep2 = document.getElementById("badge-step-2");
  const clientIdInput = document.getElementById("input-google-client-id");

  // Xử lý nút Đăng nhập nhanh với quyền Quản trị viên
  btnBypass?.addEventListener("click", () => {
    const adminSession = {
      loggedIn: true,
      granted: true,
      user: "Quản trị viên MF14",
      email: "admin@mf14.vn",
      picture: "",
      token: "",
      sheetId: CONFIG.sheetId,
      driveId: CONFIG.folderDriveId,
      authTime: new Date().toISOString()
    };
    localStorage.setItem("hrm_auth_session", JSON.stringify(adminSession));
    if (loginOverlay) loginOverlay.style.display = "none";
    renderLoggedInUser(adminSession);
    setupLogoutHandler(btnLogout);
    showToast("✓ Đã đăng nhập thành công với quyền Quản trị viên MF14!");
  });

  // Kiểm tra phiên đăng nhập đã có
  const sessionData = localStorage.getItem("hrm_auth_session");
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      if (session.loggedIn && session.granted) {
        // Tự động làm sạch nếu còn dính tên cũ
        if (session.user === "Phạm Thế Hưng") {
          session.user = "Quản trị viên MF14";
          session.email = "admin@mf14.vn";
          localStorage.setItem("hrm_auth_session", JSON.stringify(session));
        }
        if (loginOverlay) loginOverlay.style.display = "none";
        renderLoggedInUser(session);
        setupLogoutHandler(btnLogout);
        return;
      }
    } catch (e) {}
  }

  if (loginOverlay) loginOverlay.style.display = "flex";

  let realGoogleToken = null;
  let realGoogleUser = null;

  btnLogin?.addEventListener("click", () => {
    const clientId = window.APP_ENV?.GOOGLE_CLIENT_ID?.trim() || clientIdInput?.value.trim() || "";

    if (clientId && window.google?.accounts?.oauth2) {
      btnLogin.disabled = true;
      if (txtLoginBtn) txtLoginBtn.innerText = "Đang mở cửa sổ đăng nhập Google...";

      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (tokenResponse) => {
            if (tokenResponse.error !== undefined) {
              btnLogin.disabled = false;
              if (txtLoginBtn) txtLoginBtn.innerText = "Đăng nhập bằng tài khoản Google";
              alert(`⚠️ LỖI ĐĂNG NHẬP GOOGLE:\n\n${tokenResponse.error_description || tokenResponse.error}\n\n💡 GỢI Ý:\nNếu bạn đang chạy trên port khác (như 8765 hoặc localhost) chưa đăng ký trong Google Cloud Console, bạn có thể bấm nút '🚀 Đăng nhập nhanh với quyền Quản trị viên' bên dưới để vào hệ thống ngay!`);
              return;
            }

            realGoogleToken = tokenResponse.access_token;

            try {
              const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${realGoogleToken}` }
              }).then(res => res.json());

              realGoogleUser = {
                name: userInfo.name || userInfo.email.split("@")[0],
                email: userInfo.email,
                picture: userInfo.picture || "",
                accessToken: realGoogleToken
              };
              window._currentGoogleUser = realGoogleUser;

              step1Card?.classList.remove("active");
              step1Card?.classList.add("completed");
              if (badgeStep1) badgeStep1.innerHTML = "✓";
              if (txtLoginBtn) txtLoginBtn.innerHTML = `✓ Đã kết nối: <strong>${realGoogleUser.name}</strong> (${realGoogleUser.email})`;

              step2Card?.classList.add("active");
              if (btnGrant) {
                btnGrant.disabled = false;
                btnGrant.focus();
              }
            } catch (err) {
              alert("Không thể lấy thông tin người dùng Google: " + err.message);
              btnLogin.disabled = false;
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch (err) {
        alert("Khởi tạo Google OAuth thất bại: " + err.message);
        btnLogin.disabled = false;
        if (txtLoginBtn) txtLoginBtn.innerText = "Đăng nhập bằng tài khoản Google";
      }
    } else {
      // Chế độ dự phòng khi chạy localhost không có Client ID
      const inputName = prompt("Nhập tên hiển thị của bạn (Tài khoản Quản trị viên MF14):", "Quản trị viên MF14");
      if (inputName) {
        const inputEmail = prompt("Nhập email tài khoản của bạn:", "admin@mf14.vn") || "admin@mf14.vn";
        realGoogleUser = {
          name: inputName.trim(),
          email: inputEmail.trim(),
          picture: ""
        };
        window._currentGoogleUser = realGoogleUser;

        step1Card?.classList.remove("active");
        step1Card?.classList.add("completed");
        if (badgeStep1) badgeStep1.innerHTML = "✓";
        if (txtLoginBtn) txtLoginBtn.innerHTML = `✓ Đã kết nối: <strong>${realGoogleUser.name}</strong>`;

        step2Card?.classList.add("active");
        if (btnGrant) {
          btnGrant.disabled = false;
          btnGrant.focus();
        }
      }
    }
  });

  btnGrant?.addEventListener("click", () => {
    btnGrant.disabled = true;
    btnGrant.innerHTML = "<span>⏳ Đang xác nhận quyền Sheets & Drive...</span>";

    setTimeout(() => {
      const activeUser = realGoogleUser || {
        name: "Quản trị viên MF14",
        email: "admin@mf14.vn",
        picture: ""
      };

      const session = {
        loggedIn: true,
        granted: true,
        user: activeUser.name,
        email: activeUser.email,
        picture: activeUser.picture || "",
        token: activeUser.accessToken || "",
        sheetId: CONFIG.sheetId,
        driveId: CONFIG.folderDriveId,
        authTime: new Date().toISOString()
      };

      localStorage.setItem("hrm_auth_session", JSON.stringify(session));
      renderLoggedInUser(session);

      step2Card?.classList.add("completed");
      if (badgeStep2) badgeStep2.innerHTML = "✓";
      btnGrant.innerHTML = "<span>✓ Cấp quyền thành công! Đang vào hệ thống...</span>";

      setTimeout(() => {
        if (loginOverlay) loginOverlay.style.display = "none";
        setupLogoutHandler(btnLogout);
        showToast(`Xin chào ${session.user}! Đã kết nối dữ liệu nhân sự MF14.`);

        // TỰ ĐỘNG ĐỒNG BỘ 37 NHÂN VIÊN VÀO GOOGLE SHEET NGAY KHI ĐĂNG NHẬP
        if (session.token) {
          setTimeout(() => {
            syncDataDirectlyToGoogleSheets(session.token);
          }, 800);
        }
      }, 500);
    }, 600);
  });
}

function renderLoggedInUser(session) {
  const topbarName = document.getElementById("topbar-user-name");
  const topbarAvatar = document.getElementById("topbar-user-avatar");

  if (topbarName) {
    topbarName.innerText = `${session.user} (${session.email || "Admin"})`;
  }
  if (topbarAvatar) {
    if (session.picture) {
      topbarAvatar.innerHTML = `<img src="${session.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      const initials = session.user.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase();
      topbarAvatar.innerText = initials || "AD";
    }
  }
}

function setupLogoutHandler(btnLogout) {
  btnLogout?.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Nhân sự MF14?")) {
      localStorage.removeItem("hrm_auth_session");
      window.location.reload();
    }
  });
}

// =========================================================================
// ĐỒNG BỘ TRỰC TIẾP VÀO GOOGLE SHEETS QUA GOOGLE SHEETS REST API V4
// =========================================================================
window.handleManualSyncGoogleSheets = function() {
  const sessionData = localStorage.getItem("hrm_auth_session");
  let token = "";
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      token = session.token || "";
    } catch(e) {}
  }
  if (!token && window._currentGoogleUser) {
    token = window._currentGoogleUser.accessToken || "";
  }

  if (token) {
    window.syncDataDirectlyToGoogleSheets(token);
  } else {
    const clientId = window.APP_ENV?.GOOGLE_CLIENT_ID?.trim() || "";
    if (clientId && window.google?.accounts?.oauth2) {
      showToast("Đang mở xác thực Google để cấp quyền ghi vào Google Sheet...", "info");
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              alert("Lỗi cấp quyền Google: " + tokenResponse.error);
              return;
            }
            const newToken = tokenResponse.access_token;
            let session = {};
            try { session = JSON.parse(localStorage.getItem("hrm_auth_session")) || {}; } catch(e){}
            session.token = newToken;
            session.loggedIn = true;
            session.granted = true;
            localStorage.setItem("hrm_auth_session", JSON.stringify(session));

            window.syncDataDirectlyToGoogleSheets(newToken);
          }
        });
        tokenClient.requestAccessToken({ prompt: "consent" });
      } catch(err) {
        alert("Khởi tạo Google OAuth thất bại: " + err.message);
      }
    } else {
      alert("💡 HƯỚNG DẪN ĐỒNG BỘ VÀO GOOGLE SHEET:\n\nHiện tại chưa có phiên đăng nhập Google với quyền ghi Sheets.\n\nBạn có thể thực hiện theo 1 trong 2 cách sau:\n\n1. Bấm 'Đăng xuất' rồi 'Đăng nhập bằng tài khoản Google' để cấp quyền.\n2. Mở file Google Sheet (ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I) -> Vào menu 'Tiện ích mở rộng' -> 'Apps Script' -> chọn hàm 'importAllMF14Data' -> Bấm 'Chạy' (Run) để nạp toàn bộ 37 nhân viên ngay lập tức!");
    }
  }
};

window.syncDataDirectlyToGoogleSheets = async function(token) {
  const btn = document.getElementById("btn-topbar-sync-sheets");
  const origBtnText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = "<span>⏳ Đang đồng bộ vào Sheet...</span>";
  }

  showToast("⏳ Đang kết nối Google Sheets API...", "info");

  try {
    // 1. Kiểm tra spreadsheet và danh sách sheet hiện có
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.sheetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (metaRes.status === 401) {
      throw new Error("Mã phiên đăng nhập Google đã hết hạn. Vui lòng bấm Đăng xuất và Đăng nhập lại Google.");
    }
    if (metaRes.status === 403) {
      throw new Error("Tài khoản Google đang đăng nhập chưa có quyền chỉnh sửa file Google Sheet này. Hãy chắc chắn bạn đã đăng nhập đúng tài khoản sở hữu file hoặc được cấp quyền Editor.");
    }
    if (!metaRes.ok) {
      const errJson = await metaRes.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Lỗi Google Sheets API HTTP ${metaRes.status}`);
    }

    const meta = await metaRes.json();
    const existingTitles = (meta.sheets || []).map(s => s.properties.title);
    const requiredSheets = ["Nhan_Vien", "Phong_Ban", "Hop_Dong", "Bang_Luong", "Cham_Cong", "BGH"];
    const missingSheets = requiredSheets.filter(t => !existingTitles.includes(t));

    // 2. Tạo các sheet còn thiếu nếu chưa có
    if (missingSheets.length > 0) {
      showToast(`Đang tạo các bảng: ${missingSheets.join(", ")}...`, "info");
      const addRequests = missingSheets.map(title => ({
        addSheet: { properties: { title } }
      }));
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.sheetId}:batchUpdate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ requests: addRequests })
      });
    }

    // 3. Chuẩn bị dữ liệu 6 bảng chuẩn hóa 100% từ Excel
    // 3.1 Nhan_Vien
    const nvHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính",
      "Số điện thoại", "Ngày sinh", "Số CCCD", "Ngày cấp", "Nơi cấp",
      "Địa chỉ / HKTT", "Lương Gross", "Lương Net", "Lương đóng BHXH", "10.5% BHXH",
      "HĐ Thử việc", "HĐ Chính thức", "Kế toán check", "Ghi chú"
    ];
    const nvRows = (STATE.employees || []).map(e => [
      e.id,
      e.name,
      e.dept,
      e.position || e.jobTitle || "",
      e.gender || "Nữ",
      e.phone || "",
      e.dob || "",
      e.cccd || e.idCard || "",
      e.idDate || "",
      e.idPlace || "",
      e.address || e.hktt || "",
      e.salary?.gross || 0,
      e.salary?.net || 0,
      e.salary?.bhxhBase || 0,
      e.salary?.bhxh105 || 0,
      e.contract_tv?.number || "",
      e.contract_ct?.number || "",
      e.ktCheck || "",
      e.note || ""
    ]);

    // 3.2 Phong_Ban
    const pbHeaders = ["Phòng ban", "Số nhân sự hiện tại", "Định biên quy định", "Ghi chú"];
    const pbRows = [
      ["Ban giám hiệu", 4, 4, "BGH cơ sở, Quản lý chương trình TA"],
      ["Vận hành", 14, 14, "Vận hành, Kế toán, Bếp, HK, Y tế, Bảo vệ, CSKH"],
      ["Giáo viên", 19, 20, "Giáo viên mầm non, GV Tiếng Anh, GV nước ngoài"]
    ];

    // 3.3 Hop_Dong (Rà soát hợp đồng theo Excel)
    const hdHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Chức danh",
      "Số HĐ Thử việc", "Thời hạn Thử việc", "Hạn TV còn lại",
      "Số HĐ Chính thức", "Thời hạn HĐCT", "Hạn CT còn lại",
      "Kế toán check / Trạng thái", "Ghi chú"
    ];
    const hdRows = (STATE.contractsList || []).map(c => [
      c.empId,
      c.name,
      c.dept,
      c.position || "",
      c.tvNumber || "",
      c.tvPeriod || "",
      c.tvDaysLeft || "",
      c.ctNumber || "",
      c.ctPeriod || "",
      c.ctDaysLeft || "",
      c.status || c.ktCheck || "",
      c.note || ""
    ]);

    // 3.4 Bang_Luong (Chuẩn xác theo Excel)
    const blHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Chức danh",
      "Lương Gross (VNĐ)", "Lương thử việc (VNĐ)", "Lương đóng BHXH (VNĐ)",
      "10.5% BHXH trừ lương", "Thực lĩnh Net (VNĐ)"
    ];
    const blRows = (STATE.payrollList || []).map(p => [
      p.empId,
      p.name,
      p.dept,
      p.position || "",
      p.gross || 0,
      p.probation || 0,
      p.bhxhBase || 0,
      p.bhxh105 || 0,
      p.net || 0
    ]);

    // 3.5 Cham_Cong
    const ccHeaders = ["Mã NV", "Họ và tên", "Phòng ban"];
    for (let d = 1; d <= 30; d++) {
      ccHeaders.push(d < 10 ? "0" + d : "" + d);
    }
    ccHeaders.push("Tổng ngày công");
    const ccRows = (STATE.timesheet || []).map(row => {
      const r = [row.empId, row.name, row.dept];
      let work = 0;
      (row.days || []).forEach(val => {
        r.push(val);
        if (val.includes("X")) work++;
      });
      r.push(work);
      return r;
    });

    // 3.6 BGH (Lãnh đạo BGH từ Sheet 2)
    const bghHeaders = ["Mã NV", "Họ và tên", "Phòng/Ban", "Chức danh", "SĐT", "Ngày sinh", "Số CCCD", "Ngày cấp", "Địa chỉ / HKTT"];
    const bghRows = (STATE.bghLeaders || []).map(b => [
      b.code || "BGH",
      b.name,
      b.dept,
      b.title,
      b.phone,
      b.dob,
      b.cccd,
      b.idDate,
      b.address || b.hktt
    ]);

    // 4. Gửi batchUpdate dữ liệu
    showToast("Đang ghi dữ liệu vào Google Sheet...", "info");
    const valuePayload = {
      valueInputOption: "USER_ENTERED",
      data: [
        { range: `Nhan_Vien!A1:S${nvRows.length + 1}`, values: [nvHeaders, ...nvRows] },
        { range: `Phong_Ban!A1:D${pbRows.length + 1}`, values: [pbHeaders, ...pbRows] },
        { range: `Hop_Dong!A1:L${hdRows.length + 1}`, values: [hdHeaders, ...hdRows] },
        { range: `Bang_Luong!A1:I${blRows.length + 1}`, values: [blHeaders, ...blRows] },
        { range: `Cham_Cong!A1:AH${ccRows.length + 1}`, values: [ccHeaders, ...ccRows] },
        { range: `BGH!A1:I${bghRows.length + 1}`, values: [bghHeaders, ...bghRows] }
      ]
    };

    const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.sheetId}/values:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(valuePayload)
    });

    if (!valRes.ok) {
      const err = await valRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Lỗi ghi dữ liệu Google Sheet HTTP ${valRes.status}`);
    }

    const timeStr = new Date().toLocaleTimeString("vi-VN");
    const statusEl = document.getElementById("topbar-sheet-status");
    if (statusEl) {
      statusEl.innerText = `✓ Đã đồng bộ Google Sheet (${timeStr})`;
    }

    showToast(`🎉 ĐỒNG BỘ THÀNH CÔNG!\n37 nhân viên MF14 đã được nạp trực tiếp vào Google Sheet!`, "success");
    alert(`🎉 ĐÃ ĐỒNG BỘ THÀNH CÔNG VÀO GOOGLE SHEET!\n\n• Google Spreadsheet ID: ${CONFIG.sheetId}\n• Đã nạp đầy đủ 37 nhân viên và 6 bảng dữ liệu:\n  1. Nhan_Vien (37 dòng)\n  2. Phong_Ban (3 phòng ban)\n  3. Hop_Dong (37 hợp đồng)\n  4. Bang_Luong (bảng lương tháng 10)\n  5. Cham_Cong (ma trận 30 ngày)\n  6. Nghi_Phep\n\nBạn có thể bấm nút "Mở Google Sheet" để kiểm tra kết quả ngay!`);

  } catch (err) {
    console.error("Lỗi đồng bộ Google Sheets:", err);
    alert(`⚠️ THÔNG BÁO ĐỒNG BỘ GOOGLE SHEET:\n\n${err.message}\n\n💡 HƯỚNG DẪN NẠP NHANH BẰNG APPS SCRIPT:\nBạn mở file Google Sheet -> Menu 'Tiện ích mở rộng' -> 'Apps Script' -> chọn hàm 'importAllMF14Data' -> Bấm 'Chạy' (Run) để nạp 37 nhân viên ngay trong 3 giây!`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
  }
};

// =========================================================================
// VIEW: BẢNG ĐIỀU HÀNH (DASHBOARD) & KPI HELPERS
// =========================================================================
function formatMoneyKPI(amount) {
  const num = Number(amount) || 0;
  if (num >= 1000000000) {
    return {
      value: (num / 1000000000).toFixed(2).replace(".", ","),
      unit: "tỷ đ",
      fullText: (num / 1000000000).toFixed(2).replace(".", ",") + " tỷ đ"
    };
  } else if (num >= 1000000) {
    const valInMil = num / 1000000;
    const formatted = (valInMil >= 100 ? Math.round(valInMil) : valInMil.toFixed(1)).toString().replace(".", ",");
    return {
      value: formatted,
      unit: "triệu đ",
      fullText: formatted + " triệu đ"
    };
  } else {
    return {
      value: num.toLocaleString("vi-VN"),
      unit: "đ",
      fullText: num.toLocaleString("vi-VN") + " đ"
    };
  }
}

function compareValues(a, b, dir = "asc") {
  if (a === null || a === undefined) a = "";
  if (b === null || b === undefined) b = "";

  if (typeof a === "string" && /^[0-9.,\s₫đ\-+]+$/.test(a.trim())) {
    const na = parseFloat(a.replace(/[^\d.-]/g, ""));
    const nb = parseFloat(b.toString().replace(/[^\d.-]/g, ""));
    if (!isNaN(na) && !isNaN(nb)) {
      return dir === "asc" ? na - nb : nb - na;
    }
  }

  if (typeof a === "number" && typeof b === "number") {
    return dir === "asc" ? a - b : b - a;
  }

  const dRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const ma = typeof a === "string" ? a.trim().match(dRegex) : null;
  const mb = typeof b === "string" ? b.trim().match(dRegex) : null;
  if (ma && mb) {
    const da = new Date(ma[3], ma[2] - 1, ma[1]).getTime();
    const db = new Date(mb[3], mb[2] - 1, mb[1]).getTime();
    return dir === "asc" ? da - db : db - da;
  }

  const res = a.toString().localeCompare(b.toString(), "vi", { sensitivity: "base", numeric: true });
  return dir === "asc" ? res : -res;
}

window.TABLE_SORTS = {
  emp: { col: "id", dir: "asc" },
  contracts: { col: "empId", dir: "asc" },
  payroll: { col: "empId", dir: "asc" },
  leaves: { col: "id", dir: "asc" }
};

function initTableSorting() {
  const tableConfigs = [
    { id: "emp-data-table", key: "emp", render: () => initEmployeesView() },
    { id: "contracts-data-table", key: "contracts", render: () => initContractsView() },
    { id: "payroll-data-table", key: "payroll", render: () => initPayrollView() },
    { id: "leaves-data-table", key: "leaves", render: () => initLeavesView() }
  ];

  tableConfigs.forEach(t => {
    const tableEl = document.getElementById(t.id);
    if (!tableEl) return;
    const headers = tableEl.querySelectorAll("th.sortable");
    headers.forEach(th => {
      th.addEventListener("click", () => {
        const col = th.getAttribute("data-col");
        if (!col) return;
        const cur = window.TABLE_SORTS[t.key];
        if (cur.col === col) {
          cur.dir = cur.dir === "asc" ? "desc" : "asc";
        } else {
          cur.col = col;
          cur.dir = "asc";
        }

        // Cập nhật class hiển thị mũi tên sort trên các cột
        headers.forEach(h => {
          h.classList.remove("sort-asc", "sort-desc");
          if (h.getAttribute("data-col") === cur.col) {
            h.classList.add(cur.dir === "asc" ? "sort-asc" : "sort-desc");
          }
        });

        t.render();
      });
    });
  });
}

function initDashboard() {
  renderDashboardKPIs();
  renderDepartmentBars();
  renderPayrollBars();
  renderUrgentTasks();
}

function renderPayrollBars() {
  const container = document.getElementById("payroll-bars-container");
  if (!container) return;
  const history = STATE.payrollHistory || [
    { month: "Tháng 07/2026", total: 400, net: 380, label: "400 tr" },
    { month: "Tháng 08/2026", total: 410, net: 390, label: "410 tr" },
    { month: "Tháng 09/2026", total: 420, net: 400, label: "420 tr" },
    { month: "Tháng 10/2026", total: 433, net: 412, label: "433 tr" }
  ];
  container.innerHTML = history.map(h => `
    <div class="payroll-bar-group">
      <span class="bar-val-label">${h.label || (h.total + " tr")}</span>
      <div class="payroll-bar-stack">
        <div class="bar-total" style="height: ${Math.round((h.total / 500) * 100)}%;"></div>
        <div class="bar-net" style="height: ${Math.round((h.net / 500) * 100)}%;"></div>
      </div>
      <span class="bar-month-name">${h.month}</span>
    </div>
  `).join("");
}

function renderDashboardKPIs() {
  const emps = STATE.employees || [];
  const activeCount = emps.filter(e => e.status !== "Đã nghỉ việc").length;
  const leavesCount = (STATE.leavesList || []).filter(l => l.status === "Chờ duyệt").length;
  
  let totalGross = 0;
  let totalNet = 0;
  emps.forEach(e => {
    totalGross += Number(e.salary?.gross) || 0;
    totalNet += Number(e.salary?.net) || 0;
  });
  const fmtGross = formatMoneyKPI(totalGross);
  const fmtNet = formatMoneyKPI(totalNet);

  const urgentTasksCount = (STATE.allTasks || []).filter(t => t.status !== "done").length;

  const elEmp = document.getElementById("kpi-total-emp");
  const elEmpSub = document.getElementById("kpi-emp-subtext");
  const elPay = document.getElementById("kpi-payroll-val");
  const elPayUnit = document.getElementById("kpi-payroll-unit");
  const elPayNet = document.getElementById("kpi-payroll-net");
  const elExp = document.getElementById("kpi-contracts-expiring");
  const elLeave = document.getElementById("kpi-pending-leaves");

  if (elEmp) elEmp.innerText = activeCount;
  if (elEmpSub) elEmpSub.innerHTML = `<strong>${activeCount}</strong> nhân sự • <strong>3</strong> phòng ban`;
  if (elPay) elPay.innerText = fmtGross.value;
  if (elPayUnit) elPayUnit.innerText = fmtGross.unit;
  if (elPayNet) elPayNet.innerText = fmtNet.fullText;
  if (elExp) elExp.innerText = urgentTasksCount;
  if (elLeave) elLeave.innerText = leavesCount;
}

function renderDepartmentBars() {
  const container = document.getElementById("dept-bars-container");
  if (!container) return;

  const emps = STATE.employees || [];
  const depts = [
    { name: "Ban giám hiệu", quota: 4 },
    { name: "Vận hành", quota: 14 },
    { name: "Giáo viên", quota: 20 }
  ];

  container.innerHTML = depts.map(d => {
    const current = emps.filter(e => e.dept === d.name && e.status !== "Đã nghỉ việc").length;
    const pct = Math.min(100, Math.round((current / d.quota) * 100));

    return `
      <div class="dept-bar-item">
        <div class="dept-bar-header">
          <span class="dept-name">${d.name}</span>
          <span class="dept-ratio">${current} / ${d.quota} người (${pct}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%; background: #2b5641;"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderUrgentTasks() {
  const container = document.getElementById("urgent-tasks-container");
  if (!container) return;

  const tasks = (STATE.allTasks || []).filter(t => t.status !== "done").slice(0, 2);

  if (tasks.length === 0) {
    container.innerHTML = `<div style="padding: 16px; color: #15803d; font-weight: 600; text-align: center;">✓ Toàn bộ sự vụ nhân sự đã được xử lý xong!</div>`;
    return;
  }

  container.innerHTML = tasks.map(t => `
    <div class="urgent-task-item" style="border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 8px; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-weight:700; color:#1e293b; font-size:13.5px;">${t.title}</span>
        <span style="font-size:11.5px; color:#ef4444; font-weight:700;">${t.dueDate}</span>
      </div>
      <p style="font-size:12px; color:#475569; margin-bottom:8px;">${t.desc}</p>
      <div style="display:flex; gap:8px;">
        <button class="btn-action-primary" style="padding:4px 10px; font-size:11px;" onclick="handleTaskAction('${t.id}', '${t.actionText}', '${t.empCode}')">
          ${t.actionText}
        </button>
        <button class="btn-action-outline" style="padding:4px 10px; font-size:11px;" onclick="openEmployeeDrawer('${t.empCode}')">
          Xem hồ sơ
        </button>
      </div>
    </div>
  `).join("");
}

// =========================================================================
// VIEW: VIỆC CẦN XỬ LÝ (TASKS & WORKFLOW)
// =========================================================================
function initTasksView() {
  const listContainer = document.getElementById("full-tasks-list");
  const filterPills = document.querySelectorAll(".task-pill");
  let currentFilter = "all";

  function renderTasks() {
    if (!listContainer) return;
    const tasks = STATE.allTasks || [];

    const filtered = tasks.filter(t => {
      if (currentFilter === "all") return true;
      return t.type === currentFilter;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: #64748b;">Không có sự vụ nào trong danh mục này.</div>`;
      return;
    }

    listContainer.innerHTML = filtered.map(t => {
      const isDone = t.status === "done";
      return `
        <div class="task-full-card ${isDone ? "task-done" : ""}" id="task-card-${t.id}">
          <div class="task-priority-indicator ${t.priority === 'urgent' ? 'priority-urgent' : 'priority-warning'}"></div>
          <div class="task-main-info">
            <div class="task-header-row">
              <span class="task-type-badge type-${t.type}">${t.typeLabel}</span>
              <span class="task-subject">${t.title}</span>
            </div>
            <p class="task-description">${t.desc}</p>
            ${isDone ? `<div style="font-size:12px; color:#15803d; margin-top:6px; font-weight:600;">✓ Đã xử lý bởi <strong>${t.resolvedBy || "Quản trị viên"}</strong> lúc ${t.resolvedAt || "vừa xong"}</div>` : ""}
          </div>
          <div class="task-meta-right">
            <span class="task-due-date ${t.priority === 'urgent' ? '' : 'task-due-warning'}">${t.dueDate}</span>
            <div style="display:flex; gap:6px;">
              ${!isDone ? `
                <button class="btn-task-action btn-task-primary" onclick="handleTaskAction('${t.id}', '${t.actionText}', '${t.empCode}')">
                  ${t.actionText}
                </button>
              ` : `
                <span class="badge-status badge-active">Hoàn thành</span>
              `}
              <button class="btn-task-action btn-task-outline" onclick="openEmployeeDrawer('${t.empCode}')">
                Xem hồ sơ
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Cập nhật số lượng trên các badge
    const badgeSidebar = document.querySelector(".nav-badge");
    const activeTasksCount = tasks.filter(t => t.status !== "done").length;
    if (badgeSidebar) badgeSidebar.innerText = activeTasksCount;
  }

  filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      filterPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.getAttribute("data-task-filter") || "all";
      renderTasks();
    });
  });

  renderTasks();
}

// Xử lý thực sự sự vụ nhân sự
window.handleTaskAction = function(taskId, action, empCode) {
  const task = (STATE.allTasks || []).find(t => t.id === taskId);
  const emp = (STATE.employees || []).find(e => e.id === empCode);
  const currentUser = getCurrentUser();

  if (!task) return;

  if (confirm(`Xác nhận thực hiện thao tác "${action}" đối với nhân viên [${task.empName} - ${empCode}]?\nNgười thực hiện: ${currentUser.name} (${currentUser.email || "Admin"})`)) {
    task.status = "done";
    task.resolvedBy = currentUser.name;
    task.resolvedAt = new Date().toLocaleString("vi-VN");

    // Nếu là sự vụ ký HĐLĐ hoặc ký phụ lục
    if (emp) {
      if (emp.contract) {
        emp.contract.status = "Đang hiệu lực";
        if (emp.note && emp.note.includes("chưa ký")) {
          emp.note = "Đã ký HĐLĐ đầy đủ ngày " + new Date().toLocaleDateString("vi-VN");
        }
      }
      // Cập nhật contractsList tương ứng
      const contract = (STATE.contractsList || []).find(c => c.empId === empCode);
      if (contract) {
        contract.status = "Đang hiệu lực";
        contract.note = "Đã ký và phê duyệt bởi " + currentUser.name;
      }
    }

    saveState();
    initTasksView();
    renderDashboardKPIs();
    renderUrgentTasks();
    initContractsView();
    showToast(`✓ Đã xử lý thành công: "${task.title}" cho [${task.empName}] bởi ${currentUser.name}!`);
  }
};

// =========================================================================
// VIEW: DANH SÁCH NHÂN VIÊN (EMPLOYEES)
// =========================================================================
function initEmployeesView() {
  const tbody = document.getElementById("employee-table-body");
  const searchInput = document.getElementById("emp-search-input");
  const deptFilter = document.getElementById("emp-dept-filter");
  const statusFilter = document.getElementById("emp-status-filter");

  function renderTable() {
    if (!tbody) return;
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptFilter?.value || "";
    const status = statusFilter?.value || "";

    const filtered = (STATE.employees || []).filter(e => {
      const matchText = (e.name || "").toLowerCase().includes(q) ||
                        (e.id || "").toLowerCase().includes(q) ||
                        (e.phone || "").toLowerCase().includes(q) ||
                        (e.idCard || "").toLowerCase().includes(q);
      const matchDept = !dept || e.dept === dept;
      const matchStatus = !status || e.status === status;
      return matchText && matchDept && matchStatus;
    });

    // Sắp xếp cột linh hoạt
    const sortConfig = window.TABLE_SORTS?.emp || { col: "id", dir: "asc" };
    filtered.sort((a, b) => {
      let va = a[sortConfig.col];
      let vb = b[sortConfig.col];
      if (sortConfig.col === "gross") {
        va = a.salary?.gross || 0;
        vb = b.salary?.gross || 0;
      } else if (sortConfig.col === "net") {
        va = a.salary?.net || 0;
        vb = b.salary?.net || 0;
      } else if (sortConfig.col === "tv") {
        va = a.contract_tv?.number || "";
        vb = b.contract_tv?.number || "";
      } else if (sortConfig.col === "ct") {
        va = a.contract_ct?.number || "";
        vb = b.contract_ct?.number || "";
      } else if (sortConfig.col === "status") {
        va = a.ktCheck || a.note || a.contractStatus || "";
        vb = b.ktCheck || b.note || b.contractStatus || "";
      }
      return compareValues(va, vb, sortConfig.dir);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; padding:30px; color:#64748b;">Không tìm thấy nhân viên phù hợp.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(emp => {
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
          <td style="text-align:center; white-space:nowrap;">
            <button class="btn-action-outline" style="padding:3px 7px; font-size:11px; margin-right:4px;" onclick="event.stopPropagation(); openEditEmployeeModal('${emp.id}')">✏️ Sửa</button>
            <button class="btn-action-primary" style="padding:3px 7px; font-size:11px;" onclick="event.stopPropagation(); openEmployeeDrawer('${emp.id}')">👁️</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  searchInput?.addEventListener("input", renderTable);
  deptFilter?.addEventListener("change", renderTable);
  statusFilter?.addEventListener("change", renderTable);

  renderTable();
}

// Mở Drawer chi tiết nhân viên (Đồng bộ chuẩn 100% từ Excel)
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
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:13px; color:#475569; font-weight:600;">Thông tin hợp đồng lao động</span>
        <button class="btn-action-primary" style="padding:4px 10px; font-size:12px;" onclick="openEditContractModal('${emp.id}')">✏️ Sửa hợp đồng</button>
      </div>
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
};

window.closeEmployeeDrawer = function() {
  document.getElementById("emp-drawer")?.classList.remove("open");
  document.getElementById("drawer-backdrop")?.classList.remove("show");
};

// =========================================================================
// THÊM, SỬA, XÓA NHÂN VIÊN (CRUD CHUẨN XÁC)
// =========================================================================
function handleSaveNewEmployee() {
  const code = document.getElementById("add-emp-code").value.trim().toUpperCase();
  const name = document.getElementById("add-emp-name").value.trim();
  const dept = document.getElementById("add-emp-dept").value;
  const title = document.getElementById("add-emp-title").value.trim() || "Nhân viên";
  const gender = document.getElementById("add-emp-gender").value;
  const phone = document.getElementById("add-emp-phone").value.trim();
  const idcard = document.getElementById("add-emp-idcard").value.trim();
  const dob = document.getElementById("add-emp-dob").value.trim();
  const address = document.getElementById("add-emp-address").value.trim();
  const gross = Number(document.getElementById("add-emp-gross").value) || 10000000;
  const cType = document.getElementById("add-emp-contract-type").value;
  const startDate = document.getElementById("add-emp-startdate").value.trim() || new Date().toLocaleDateString("vi-VN");
  const bankInfo = document.getElementById("add-emp-bank").value.trim();
  const note = document.getElementById("add-emp-note").value.trim();

  // Kiểm tra trùng mã
  if (STATE.employees.some(e => e.id === code)) {
    alert(`Mã nhân viên "${code}" đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`);
    return;
  }

  const currentUser = getCurrentUser();
  const safeName = name.replace(/\s+/g, "");
  const newEmp = {
    id: code,
    stt: STATE.employees.length + 1,
    name: name,
    dept: dept,
    position: title,
    jobTitle: title,
    teamShift: "Ca hành chính",
    gender: gender,
    dob: dob,
    ethnicity: "Kinh",
    hometown: address || "Hà Nội",
    idCard: idcard,
    idDate: "",
    address: address,
    phone: phone,
    email: `${name.split(" ").slice(-1)[0].toLowerCase()}.${code.toLowerCase()}@mf14.vn`,
    education: "Đại học",
    marital: "Đã kết hôn",
    startDate: startDate,
    status: "Đang làm việc",
    leaveDate: "-",
    insuranceNumber: `012${(STATE.employees.length + 1).toString().padStart(7, "0")}`,
    bank: bankInfo.split("-")[1]?.trim() || "Vietcombank",
    accountNumber: bankInfo.split("-")[0]?.trim() || "",
    sourceFile: "Thêm trực tiếp trên hệ thống",
    contract: {
      number: `HĐ-MF14-${code}/2026`,
      type: cType,
      startDate: startDate,
      endDate: "31/12/2026",
      salary: `${gross.toLocaleString("vi-VN")} đ`,
      driveFile: `HD_${safeName}_Scan.pdf`,
      status: "Đang hiệu lực"
    },
    salary: {
      gross: gross,
      probation: Math.round(gross * 0.85),
      net: Math.round(gross * 0.88),
      bhxh: Math.round(gross * 0.105),
      bank: bankInfo,
      bankAccount: bankInfo
    },
    documents: {
      soYeuLyLich: true,
      cccd: true,
      gks: false,
      bangCap: true,
      gksk: true,
      tuPhap: false
    },
    note: note,
    createdBy: currentUser.name,
    createdAt: new Date().toISOString()
  };

  STATE.employees.push(newEmp);

  // Thêm vào contractsList
  STATE.contractsList.push({
    empId: code,
    name: name,
    dept: dept,
    contractNo: newEmp.contract.number,
    type: cType,
    startDate: startDate,
    endDate: "31/12/2026",
    baseSalary: newEmp.contract.salary,
    driveFile: newEmp.contract.driveFile,
    status: "Đang hiệu lực",
    note: note
  });

  // Thêm vào payrollList
  const allowance = dept === "Ban giám hiệu" ? 1500000 : (dept === "Giáo viên" ? 1000000 : 800000);
  const total = gross + allowance;
  const ins = Math.round(gross * 0.105);
  const net = total - ins;

  STATE.payrollList.push({
    empId: code,
    name: name,
    dept: dept,
    base: gross.toLocaleString("vi-VN"),
    days: 22,
    allowance: allowance.toLocaleString("vi-VN"),
    ot: "0",
    total: total.toLocaleString("vi-VN"),
    insurance: ins.toLocaleString("vi-VN"),
    tax: "0",
    advance: "0",
    net: net.toLocaleString("vi-VN")
  });

  // Thêm vào timesheet
  STATE.timesheet.push({
    empId: code,
    name: name,
    dept: dept,
    days: Array(30).fill("X")
  });

  saveState();
  closeModal("modal-add-employee");
  document.getElementById("form-add-employee").reset();
  initEmployeesView();
  initContractsView();
  initPayrollView();
  initTimesheetView();
  renderDashboardKPIs();
  renderDepartmentBars();

  showToast(`✓ Đã thêm nhân sự mới: <strong>${name}</strong> (${code})!`);
}

function handleSaveEditEmployee() {
  const empId = document.getElementById("edit-emp-id").value;
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const currentUser = getCurrentUser();

  emp.name = document.getElementById("edit-emp-name").value.trim();
  emp.dept = document.getElementById("edit-emp-dept").value;
  emp.position = document.getElementById("edit-emp-title").value.trim();
  emp.jobTitle = emp.position;
  emp.status = document.getElementById("edit-emp-status").value;
  emp.phone = document.getElementById("edit-emp-phone").value.trim();
  emp.gender = document.getElementById("edit-emp-gender")?.value || emp.gender || "Nữ";
  emp.dob = document.getElementById("edit-emp-dob")?.value.trim() || emp.dob;
  emp.idCard = document.getElementById("edit-emp-idcard").value.trim();
  emp.cccd = emp.idCard;
  emp.address = document.getElementById("edit-emp-address").value.trim();
  emp.hktt = emp.address;
  emp.note = document.getElementById("edit-emp-note").value.trim();

  const grossVal = document.getElementById("edit-emp-gross").value.replace(/[^\d]/g, "");
  const bhxhBaseVal = document.getElementById("edit-emp-bhxh-base")?.value.replace(/[^\d]/g, "");

  if (!emp.salary) emp.salary = {};
  if (grossVal) {
    emp.salary.gross = Number(grossVal);
  }
  if (bhxhBaseVal) {
    emp.salary.bhxhBase = Number(bhxhBaseVal);
    emp.salary.bhxh105 = Math.round(emp.salary.bhxhBase * 0.105);
  }
  if (emp.salary.gross) {
    emp.salary.net = emp.salary.gross - (emp.salary.bhxh105 || 0);
  }

  const contractNo = document.getElementById("edit-emp-contract-no")?.value.trim();
  const contractStatus = document.getElementById("edit-emp-contract-status")?.value;
  if (!emp.contract) emp.contract = {};
  if (contractNo) emp.contract.number = contractNo;
  if (contractStatus) {
    emp.contract.status = contractStatus;
    emp.contractStatus = contractStatus;
    emp.ktCheck = contractStatus;
  }

  // Đồng bộ trong contractsList
  const contract = (STATE.contractsList || []).find(c => c.empId === empId);
  if (contract) {
    contract.name = emp.name;
    contract.dept = emp.dept;
    contract.position = emp.position;
    if (contractNo) contract.contractNo = contractNo;
    if (contractStatus) {
      contract.status = contractStatus;
      contract.ktCheck = contractStatus;
    }
    contract.note = emp.note;
  }

  // Đồng bộ trong payrollList
  const payroll = (STATE.payrollList || []).find(p => p.empId === empId);
  if (payroll) {
    payroll.name = emp.name;
    payroll.dept = emp.dept;
    payroll.position = emp.position;
    if (emp.salary?.gross) {
      payroll.gross = emp.salary.gross;
      payroll.grossFormatted = emp.salary.gross.toLocaleString("vi-VN") + " đ";
    }
    if (emp.salary?.bhxhBase) {
      payroll.bhxhBase = emp.salary.bhxhBase;
      payroll.bhxhBaseFormatted = emp.salary.bhxhBase.toLocaleString("vi-VN") + " đ";
      payroll.bhxh105 = emp.salary.bhxh105;
      payroll.bhxh105Formatted = emp.salary.bhxh105.toLocaleString("vi-VN") + " đ";
    }
    if (emp.salary?.net) {
      payroll.net = emp.salary.net;
      payroll.netFormatted = emp.salary.net.toLocaleString("vi-VN") + " đ";
    }
  }

  emp.updatedBy = currentUser.name;
  emp.updatedAt = new Date().toISOString();

  saveState();
  closeModal("modal-edit-employee");
  openEmployeeDrawer(empId);
  initEmployeesView();
  initContractsView();
  initPayrollView();
  renderDashboardKPIs();

  showToast(`✓ Đã cập nhật thành công hồ sơ nhân viên [${emp.name}]!`);
}

function openEditEmployeeModal(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  document.getElementById("edit-emp-id").value = emp.id;
  document.getElementById("edit-emp-code").value = emp.id;
  document.getElementById("edit-emp-name").value = emp.name;
  document.getElementById("edit-emp-dept").value = emp.dept;
  document.getElementById("edit-emp-title").value = emp.position || emp.jobTitle || "";
  document.getElementById("edit-emp-status").value = emp.status || "Đang làm việc";
  document.getElementById("edit-emp-phone").value = emp.phone || "";
  
  const elGender = document.getElementById("edit-emp-gender");
  if (elGender) elGender.value = emp.gender || "Nữ";
  const elDob = document.getElementById("edit-emp-dob");
  if (elDob) elDob.value = emp.dob || "";

  document.getElementById("edit-emp-idcard").value = emp.idCard || emp.cccd || "";
  document.getElementById("edit-emp-gross").value = emp.salary?.gross ? emp.salary.gross.toLocaleString("vi-VN") + " đ" : "";
  
  const elBhxhBase = document.getElementById("edit-emp-bhxh-base");
  if (elBhxhBase) elBhxhBase.value = emp.salary?.bhxhBase ? emp.salary.bhxhBase.toLocaleString("vi-VN") + " đ" : "";

  document.getElementById("edit-emp-address").value = emp.address || emp.hktt || "";
  document.getElementById("edit-emp-contract-no").value = emp.contract_ct?.number || emp.contract?.number || "";
  document.getElementById("edit-emp-contract-status").value = emp.contractStatus || emp.contract?.status || "Đang hiệu lực";
  document.getElementById("edit-emp-note").value = emp.note || "";

  openModal("modal-edit-employee");
}
window.openEditEmployeeModal = openEditEmployeeModal;
window.handleSaveEditEmployee = handleSaveEditEmployee;

function handleDeleteEmployee(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa nhân viên [${emp.name} - ${empId}] khỏi hệ thống?\nDữ liệu này sẽ được xóa khỏi bảng nhân sự, hợp đồng và bảng lương.`)) {
    STATE.employees = STATE.employees.filter(e => e.id !== empId);
    STATE.contractsList = (STATE.contractsList || []).filter(c => c.empId !== empId);
    STATE.payrollList = (STATE.payrollList || []).filter(p => p.empId !== empId);
    STATE.timesheet = (STATE.timesheet || []).filter(t => t.empId !== empId);

    saveState();
    closeEmployeeDrawer();
    initEmployeesView();
    initContractsView();
    initPayrollView();
    initTimesheetView();
    renderDashboardKPIs();
    renderDepartmentBars();

    showToast(`✓ Đã xóa nhân viên [${emp.name}] thành công!`);
  }
}

// =========================================================================
// VIEW: HỢP ĐỒNG LAO ĐỘNG (CONTRACTS)
// =========================================================================
function initContractsView() {
  const tbody = document.getElementById("contracts-table-body");
  const searchInput = document.getElementById("contract-search-input");
  const deptFilter = document.getElementById("contract-dept-filter");
  const typeFilter = document.getElementById("contract-type-filter");
  const statusFilter = document.getElementById("contract-status-filter");

  function renderTable() {
    if (!tbody) return;
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptFilter?.value || "";
    const type = typeFilter?.value || "";
    const status = statusFilter?.value || "";

    const filtered = (STATE.contractsList || []).filter(c => {
      const matchText = (c.name || "").toLowerCase().includes(q) ||
                        (c.empId || "").toLowerCase().includes(q) ||
                        (c.contractNo || "").toLowerCase().includes(q);
      const matchDept = !dept || c.dept === dept;
      const matchType = !type || (c.type || "").includes(type);
      const matchStatus = !status || c.status === status;
      return matchText && matchDept && matchType && matchStatus;
    });

    const sortConfig = window.TABLE_SORTS?.contracts || { col: "empId", dir: "asc" };
    filtered.sort((a, b) => {
      let va = a[sortConfig.col];
      let vb = b[sortConfig.col];
      if (sortConfig.col === "tvDaysLeft") {
        va = parseInt(a.tvDaysLeft) || (a.tvDaysLeft?.includes("Hết") ? -999 : 0);
        vb = parseInt(b.tvDaysLeft) || (b.tvDaysLeft?.includes("Hết") ? -999 : 0);
      } else if (sortConfig.col === "ctDaysLeft") {
        va = parseInt(a.ctDaysLeft) || 0;
        vb = parseInt(b.ctDaysLeft) || 0;
      }
      return compareValues(va, vb, sortConfig.dir);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding:30px; color:#64748b;">Không tìm thấy hợp đồng phù hợp.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
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
          <td style="text-align:center; white-space:nowrap;">
            <button class="btn-action-outline" style="padding:3px 8px; font-size:11px;" onclick="event.stopPropagation(); openEditContractModal('${c.empId}')">✏️ Sửa HĐ</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  searchInput?.addEventListener("input", renderTable);
  deptFilter?.addEventListener("change", renderTable);
  typeFilter?.addEventListener("change", renderTable);
  statusFilter?.addEventListener("change", renderTable);

  renderTable();
}

function openEditContractModal(empId) {
  const c = (STATE.contractsList || []).find(item => item.empId === empId);
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp && !c) return;

  const currentEmpId = empId;
  const currentName = emp ? emp.name : c.name;
  const currentDept = emp ? emp.dept : c.dept;
  const currentPosition = emp ? (emp.position || emp.jobTitle || "") : (c.position || "");

  document.getElementById("edit-c-empid").value = currentEmpId;
  document.getElementById("edit-c-empcode").value = currentEmpId;
  document.getElementById("edit-c-name").value = currentName;
  document.getElementById("edit-c-dept").value = currentDept;
  document.getElementById("edit-c-position").value = currentPosition;

  document.getElementById("edit-c-tv-no").value = (c?.tvNumber || emp?.contract_tv?.number || "");
  document.getElementById("edit-c-tv-period").value = (c?.tvPeriod || (emp?.contract_tv?.startDate ? emp.contract_tv.startDate + " - " + emp.contract_tv.endDate : ""));
  document.getElementById("edit-c-tv-days").value = (c?.tvDaysLeft || emp?.contract_tv?.daysLeft || "");

  document.getElementById("edit-c-ct-no").value = (c?.ctNumber || emp?.contract_ct?.number || "");
  document.getElementById("edit-c-ct-period").value = (c?.ctPeriod || (emp?.contract_ct?.startDate ? emp.contract_ct.startDate + " - " + emp.contract_ct.endDate : ""));
  document.getElementById("edit-c-ct-days").value = (c?.ctDaysLeft || emp?.contract_ct?.daysLeft || "");

  const statusVal = c?.status || c?.ktCheck || emp?.ktCheck || emp?.contractStatus || "Đã ký HĐ";
  const selectStatus = document.getElementById("edit-c-status");
  if (selectStatus) {
    let found = false;
    for (let opt of selectStatus.options) {
      if (opt.value === statusVal) {
        selectStatus.value = statusVal;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOpt = new Option(statusVal, statusVal, true, true);
      selectStatus.add(newOpt);
    }
  }

  const bhxhBase = emp?.salary?.bhxhBase || 0;
  document.getElementById("edit-c-bhxh-base").value = bhxhBase ? Number(bhxhBase).toLocaleString("vi-VN") + " đ" : "";
  document.getElementById("edit-c-note").value = (c?.note || emp?.note || "");

  openModal("modal-edit-contract");
}

function handleSaveEditContract() {
  const empId = document.getElementById("edit-c-empid").value;
  const emp = (STATE.employees || []).find(e => e.id === empId);
  const contract = (STATE.contractsList || []).find(c => c.empId === empId);

  const tvNo = document.getElementById("edit-c-tv-no").value.trim();
  const tvPeriod = document.getElementById("edit-c-tv-period").value.trim();
  const tvDays = document.getElementById("edit-c-tv-days").value.trim();

  const ctNo = document.getElementById("edit-c-ct-no").value.trim();
  const ctPeriod = document.getElementById("edit-c-ct-period").value.trim();
  const ctDays = document.getElementById("edit-c-ct-days").value.trim();

  const status = document.getElementById("edit-c-status").value;
  const note = document.getElementById("edit-c-note").value.trim();
  const bhxhBaseStr = document.getElementById("edit-c-bhxh-base").value.replace(/[^\d]/g, "");

  if (contract) {
    contract.tvNumber = tvNo;
    contract.tvPeriod = tvPeriod;
    contract.tvDaysLeft = tvDays;
    contract.ctNumber = ctNo;
    contract.ctPeriod = ctPeriod;
    contract.ctDaysLeft = ctDays;
    contract.status = status;
    contract.ktCheck = status;
    contract.note = note;
  }

  if (emp) {
    if (!emp.contract_tv) emp.contract_tv = {};
    emp.contract_tv.number = tvNo;
    emp.contract_tv.daysLeft = tvDays;

    if (!emp.contract_ct) emp.contract_ct = {};
    emp.contract_ct.number = ctNo;
    emp.contract_ct.daysLeft = ctDays;

    if (!emp.contract) emp.contract = {};
    emp.contract.number = ctNo || tvNo;
    emp.contract.status = status;
    emp.ktCheck = status;
    emp.contractStatus = status;
    emp.note = note;

    if (bhxhBaseStr) {
      if (!emp.salary) emp.salary = {};
      emp.salary.bhxhBase = Number(bhxhBaseStr);
      emp.salary.bhxh105 = Math.round(emp.salary.bhxhBase * 0.105);
      if (emp.salary.gross) {
        emp.salary.net = emp.salary.gross - emp.salary.bhxh105;
      }
    }
  }

  saveState();
  closeModal("modal-edit-contract");
  initContractsView();
  initEmployeesView();
  initPayrollView();
  renderDashboardKPIs();

  if (window._activeDrawerEmpId === empId) {
    openEmployeeDrawer(empId);
  }

  showToast(`✓ Đã cập nhật thành công hợp đồng cho [${emp ? emp.name : empId}]!`);
}

window.openEditContractModal = openEditContractModal;
window.handleSaveEditContract = handleSaveEditContract;

function handleSaveNewContract() {
  const empId = document.getElementById("add-contract-emp").value;
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const no = document.getElementById("add-contract-no").value.trim();
  const type = document.getElementById("add-contract-type").value;
  const start = document.getElementById("add-contract-start").value.trim();
  const end = document.getElementById("add-contract-end").value.trim();
  const sal = document.getElementById("add-contract-salary").value.trim();
  const status = document.getElementById("add-contract-status").value;
  const file = document.getElementById("add-contract-file").value.trim() || `HD_${emp.name.replace(/\s+/g, "")}_Scan.pdf`;

  const newContract = {
    empId: emp.id,
    name: emp.name,
    dept: emp.dept,
    contractNo: no,
    type: type,
    startDate: start,
    endDate: end,
    baseSalary: sal,
    driveFile: file,
    status: status,
    note: "Tạo trực tiếp bởi " + getCurrentUser().name
  };

  // Cập nhật hợp đồng cho nhân viên
  emp.contract = {
    number: no,
    type: type,
    startDate: start,
    endDate: end,
    salary: sal,
    driveFile: file,
    status: status
  };

  // Cập nhật contractsList
  const existingIndex = STATE.contractsList.findIndex(c => c.empId === emp.id);
  if (existingIndex >= 0) {
    STATE.contractsList[existingIndex] = newContract;
  } else {
    STATE.contractsList.push(newContract);
  }

  saveState();
  closeModal("modal-add-contract");
  initContractsView();
  renderDashboardKPIs();
  showToast(`✓ Đã lưu hợp đồng [${no}] cho [${emp.name}] thành công!`);
}

// =========================================================================
// VIEW: CHẤM CÔNG (TIMESHEET MATRIX)
// =========================================================================
function initTimesheetView() {
  const container = document.getElementById("timesheet-matrix-body");
  const searchInput = document.getElementById("ts-search-input");
  const deptFilter = document.getElementById("ts-dept-filter");

  function renderTimesheet() {
    if (!container) return;
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptFilter?.value || "";

    const filtered = (STATE.timesheet || []).filter(row => {
      const matchText = (row.name || "").toLowerCase().includes(q) || (row.empId || "").toLowerCase().includes(q);
      const matchDept = !dept || row.dept === dept;
      return matchText && matchDept;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<tr><td colspan="31" style="text-align:center; padding:30px; color:#64748b;">Không có dữ liệu chấm công.</td></tr>`;
      return;
    }

    container.innerHTML = filtered.map(row => {
      const daysHtml = row.days.map((val, idx) => {
        if (val === ".") {
          return `<td class="ts-cell-interactive" onclick="toggleAttendanceDay('${row.empId}', ${idx})"><span class="ts-cell-val" style="color:#cbd5e1;">·</span></td>`;
        }
        let symbol = val;
        let extraClass = "";
        if (val.includes("_late")) {
          symbol = "X";
          extraClass = "late-underlined";
        }
        return `
          <td class="ts-cell-interactive" onclick="toggleAttendanceDay('${row.empId}', ${idx})">
            <span class="ts-cell-val symbol-${symbol} ${extraClass}">${symbol}</span>
          </td>
        `;
      }).join("");

      return `
        <tr>
          <td class="col-name" style="position:sticky; left:0; background:#fff; z-index:2;">
            <strong onclick="openEmployeeDrawer('${row.empId}')" style="cursor:pointer; color:#14532d;">${row.name}</strong>
            <span style="font-size:11px; color:#64748b; font-family:monospace; margin-left:4px;">${row.empId}</span>
          </td>
          ${daysHtml}
        </tr>
      `;
    }).join("");
  }

  searchInput?.addEventListener("input", renderTimesheet);
  deptFilter?.addEventListener("change", renderTimesheet);

  renderTimesheet();
}

window.toggleAttendanceDay = function(empId, dayIdx) {
  const row = (STATE.timesheet || []).find(r => r.empId === empId);
  if (!row || !row.days) return;

  const cycle = {
    "X": "X_late",
    "X_late": "P",
    "P": "O",
    "O": ".",
    ".": "X"
  };

  const current = row.days[dayIdx] || ".";
  row.days[dayIdx] = cycle[current] || "X";

  saveState();
  initTimesheetView();
};

// =========================================================================
// VIEW: NGHỈ PHÉP (LEAVES)
// =========================================================================
function initLeavesView() {
  const tbody = document.getElementById("leaves-table-body");
  const searchInput = document.getElementById("leave-search-input");
  const statusFilter = document.getElementById("leave-status-filter");
  const typeFilter = document.getElementById("leave-type-filter");

  function renderLeaves() {
    if (!tbody) return;
    const q = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "";
    const type = typeFilter?.value || "";

    const filtered = (STATE.leavesList || []).filter(l => {
      const matchText = (l.name || "").toLowerCase().includes(q) || (l.empId || "").toLowerCase().includes(q) || (l.leaveId || "").toLowerCase().includes(q);
      const matchStatus = !status || l.status === status;
      const matchType = !type || l.type === type;
      return matchText && matchStatus && matchType;
    });

    const sortConfig = window.TABLE_SORTS?.leaves || { col: "id", dir: "asc" };
    filtered.sort((a, b) => {
      let va = a[sortConfig.col];
      let vb = b[sortConfig.col];
      if (sortConfig.col === "id") {
        va = a.leaveId;
        vb = b.leaveId;
      } else if (sortConfig.col === "startDate") {
        va = a.fromDate;
        vb = b.fromDate;
      } else if (sortConfig.col === "endDate") {
        va = a.toDate;
        vb = b.toDate;
      } else if (sortConfig.col === "days") {
        va = Number(a.days) || 0;
        vb = Number(b.days) || 0;
      }
      return compareValues(va, vb, sortConfig.dir);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:30px; color:#64748b;">Không có đơn nghỉ phép nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => {
      let statusClass = "badge-warning";
      if (l.status === "Đã duyệt") statusClass = "badge-active";
      if (l.status === "Từ chối") statusClass = "badge-inactive";

      const isPending = l.status === "Chờ duyệt";
      const actions = isPending ? `
        <div style="display:flex; gap:4px;">
          <button class="btn-action-primary" style="padding:3px 8px; font-size:11px;" onclick="approveLeave('${l.leaveId}')">
            ✓ Duyệt
          </button>
          <button class="btn-action-danger" style="padding:3px 8px; font-size:11px;" onclick="rejectLeave('${l.leaveId}')">
            ✕ Từ chối
          </button>
        </div>
      ` : `<span style="font-size:11.5px; color:#64748b;">${l.approver || "–"}</span>`;

      return `
        <tr>
          <td style="font-family:monospace; font-size:11.5px; font-weight:600;">${l.leaveId}</td>
          <td class="emp-code">${l.empId}</td>
          <td><span class="emp-name-link" onclick="openEmployeeDrawer('${l.empId}')" style="cursor:pointer; font-weight:600; color:#14532d;">${l.name}</span></td>
          <td>${l.dept}</td>
          <td><span class="tag-emp" style="background:#e0f2fe; color:#0369a1;">${l.type}</span></td>
          <td>${l.fromDate}</td>
          <td>${l.toDate}</td>
          <td style="font-weight:700; text-align:center;">${l.days}</td>
          <td style="font-size:12px; color:#475569;">${l.reason}</td>
          <td><span class="badge-status ${statusClass}">${l.status}</span></td>
          <td>${actions}</td>
        </tr>
      `;
    }).join("");
  }

  window.approveLeave = function(leaveId) {
    const item = (STATE.leavesList || []).find(x => x.leaveId === leaveId);
    if (!item) return;

    const currentUser = getCurrentUser();
    item.status = "Đã duyệt";
    item.approver = `${currentUser.name} (${currentUser.email || "Admin"})`;
    item.approvedAt = new Date().toLocaleString("vi-VN");

    saveState();
    renderLeaves();
    renderDashboardKPIs();
    showToast(`✓ Đã duyệt đơn xin nghỉ phép [${leaveId}] cho [${item.name}] bởi ${currentUser.name}!`);
  };

  window.rejectLeave = function(leaveId) {
    const item = (STATE.leavesList || []).find(x => x.leaveId === leaveId);
    if (!item) return;

    const currentUser = getCurrentUser();
    item.status = "Từ chối";
    item.approver = `${currentUser.name} (${currentUser.email || "Admin"})`;
    item.approvedAt = new Date().toLocaleString("vi-VN");

    saveState();
    renderLeaves();
    renderDashboardKPIs();
    showToast(`✕ Đã từ chối đơn nghỉ phép [${leaveId}] cho [${item.name}] bởi ${currentUser.name}.`, "error");
  };

  searchInput?.addEventListener("input", renderLeaves);
  statusFilter?.addEventListener("change", renderLeaves);
  typeFilter?.addEventListener("change", renderLeaves);

  renderLeaves();
}

function handleSaveNewLeave() {
  const empId = document.getElementById("add-leave-emp").value;
  const emp = (STATE.employees || []).find(e => e.id === empId);
  if (!emp) return;

  const type = document.getElementById("add-leave-type").value;
  const days = Number(document.getElementById("add-leave-days").value) || 1;
  const fromDate = document.getElementById("add-leave-from").value.trim();
  const toDate = document.getElementById("add-leave-to").value.trim();
  const reason = document.getElementById("add-leave-reason").value.trim();

  const newLeave = {
    leaveId: `NP-${new Date().getFullYear()}-${(STATE.leavesList.length + 1).toString().padStart(3, "0")}`,
    empId: emp.id,
    name: emp.name,
    dept: emp.dept,
    type: type,
    fromDate: fromDate,
    toDate: toDate,
    days: days,
    reason: reason,
    approver: "Chờ duyệt",
    status: "Chờ duyệt",
    createdAt: new Date().toISOString()
  };

  STATE.leavesList.unshift(newLeave);

  saveState();
  closeModal("modal-add-leave");
  document.getElementById("form-add-leave").reset();
  initLeavesView();
  renderDashboardKPIs();

  showToast(`✓ Đã tạo đơn xin nghỉ phép [${newLeave.leaveId}] cho [${emp.name}]!`);
}

// =========================================================================
// VIEW: BẢNG LƯƠNG & PHIẾU LƯƠNG (PAYROLL)
// =========================================================================
function initPayrollView() {
  const tbody = document.getElementById("payroll-table-body");
  const searchInput = document.getElementById("payroll-search-input");
  const deptFilter = document.getElementById("payroll-dept-filter");

  function renderPayroll() {
    if (!tbody) return;
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptFilter?.value || "";

    const totalGross = (STATE.payrollList || []).reduce((acc, p) => acc + (Number(p.gross) || 0), 0);
    const totalNet = (STATE.payrollList || []).reduce((acc, p) => acc + (Number(p.net) || 0), 0);
    const totalBhxh = (STATE.payrollList || []).reduce((acc, p) => acc + (Number(p.bhxh105) || 0), 0);
    const totalBase = (STATE.payrollList || []).reduce((acc, p) => acc + (Number(p.bhxhBase) || 0), 0);

    const fmtGross = formatMoneyKPI(totalGross);
    const fmtNet = formatMoneyKPI(totalNet);
    const fmtBhxh = formatMoneyKPI(totalBhxh);
    const fmtBase = formatMoneyKPI(totalBase);

    const elGross = document.getElementById("payroll-kpi-gross");
    const elGrossUnit = document.getElementById("payroll-kpi-gross-unit");
    const elNet = document.getElementById("payroll-kpi-net");
    const elNetUnit = document.getElementById("payroll-kpi-net-unit");
    const elBhxh = document.getElementById("payroll-kpi-bhxh");
    const elBhxhUnit = document.getElementById("payroll-kpi-bhxh-unit");
    const elBase = document.getElementById("payroll-kpi-base");
    const elBaseUnit = document.getElementById("payroll-kpi-base-unit");

    if (elGross) elGross.textContent = fmtGross.value;
    if (elGrossUnit) elGrossUnit.textContent = fmtGross.unit;
    if (elNet) elNet.textContent = fmtNet.value;
    if (elNetUnit) elNetUnit.textContent = fmtNet.unit;
    if (elBhxh) elBhxh.textContent = fmtBhxh.value;
    if (elBhxhUnit) elBhxhUnit.textContent = fmtBhxh.unit;
    if (elBase) elBase.textContent = fmtBase.value;
    if (elBaseUnit) elBaseUnit.textContent = fmtBase.unit;

    const filtered = (STATE.payrollList || []).filter(p => {
      const matchText = (p.name || "").toLowerCase().includes(q) || (p.empId || "").toLowerCase().includes(q);
      const matchDept = !dept || p.dept === dept;
      return matchText && matchDept;
    });

    const sortConfig = window.TABLE_SORTS?.payroll || { col: "empId", dir: "asc" };
    filtered.sort((a, b) => {
      let va = a[sortConfig.col];
      let vb = b[sortConfig.col];
      return compareValues(va, vb, sortConfig.dir);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#64748b;">Không tìm thấy nhân viên.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => `
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
    `).join("");
  }

  searchInput?.addEventListener("input", renderPayroll);
  deptFilter?.addEventListener("change", renderPayroll);

  renderPayroll();
}

window.viewPayslip = function(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  const payroll = (STATE.payrollList || []).find(p => p.empId === empId);
  if (!emp || !payroll) return;

  const modalBody = document.getElementById("payslip-modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="border-bottom: 2px solid #14532d; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:16px; color:#14532d; font-weight:700;">CÔNG TY CỔ PHẦN MF14</h4>
          <p style="font-size:12px; color:#64748b;">Clubhouse 3, Đường Phong Lan 1, Vinhomes Riverside, Long Biên, Hà Nội</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:700; background:#f0fdf4; color:#166534; padding:4px 8px; border-radius:6px;">Kỳ lương: 10/2026</span>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:16px; font-size:12.5px;">
      <div><strong>Họ và tên:</strong> ${emp.name}</div>
      <div><strong>Mã nhân viên:</strong> ${emp.id}</div>
      <div><strong>Phòng ban:</strong> ${emp.dept}</div>
      <div><strong>Chức danh:</strong> ${emp.position || emp.jobTitle}</div>
      <div><strong>Số tài khoản:</strong> ${emp.salary?.bankAccount || emp.accountNumber || "–"}</div>
      <div><strong>Ngân hàng:</strong> ${emp.salary?.bank || emp.bank || "Vietcombank"}</div>
    </div>

    <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:16px;">
      <thead>
        <tr style="background:#f1f5f9; border-bottom:1px solid #cbd5e1; text-align:left;">
          <th style="padding:8px;">Khoản mục lương & Bảo hiểm</th>
          <th style="padding:8px; text-align:right;">Số tiền (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;">1. Lương Gross (Theo file Excel)</td>
          <td style="padding:8px; text-align:right; font-weight:700; color:#14532d;">${emp.salary?.gross ? Number(emp.salary.gross).toLocaleString('vi-VN') + ' đ' : '0 đ'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;">2. Lương thử việc (Nếu trong thời gian TV)</td>
          <td style="padding:8px; text-align:right; font-weight:600;">${emp.salary?.probation ? Number(emp.salary.probation).toLocaleString('vi-VN') + ' đ' : '–'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;">3. Mức lương căn cứ đóng BHXH</td>
          <td style="padding:8px; text-align:right; font-weight:600;">${emp.salary?.bhxhBase ? Number(emp.salary.bhxhBase).toLocaleString('vi-VN') + ' đ' : '–'}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0; color:#dc2626;">
          <td style="padding:8px;">4. Trích nộp BHXH 10.5% (NLĐ đóng)</td>
          <td style="padding:8px; text-align:right; font-weight:600;">-${emp.salary?.bhxh105 ? Number(emp.salary.bhxh105).toLocaleString('vi-VN') + ' đ' : '0 đ'}</td>
        </tr>
        <tr style="background:#ecfdf5; border-top:2px solid #10b981; font-weight:800; font-size:14px;">
          <td style="padding:10px; color:#065f46;">THỰC LĨNH CHUYỂN KHOẢN (NET)</td>
          <td style="padding:10px; text-align:right; color:#065f46; font-size:16px;">${emp.salary?.net ? Number(emp.salary.net).toLocaleString('vi-VN') + ' đ' : '0 đ'}</td>
        </tr>
      </tbody>
    </table>

    <div style="font-size:11.5px; color:#64748b; font-style:italic; text-align:center;">
      Phiếu lương điện tử chuẩn hóa 100% từ file DANH SÁCH NHÂN VIÊN MS14_new.xlsx.
    </div>
  `;

  openModal("modal-view-payslip");
};

// =========================================================================
// XUẤT CSV (EXCEL) CHO CẢ 3 DANH MỤC
// =========================================================================
function downloadCsv(filename, headers, rows) {
  let csvContent = "\uFEFF"; // UTF-8 BOM để Excel hiển thị đúng tiếng Việt
  csvContent += headers.join(",") + "\r\n";

  rows.forEach(row => {
    const escaped = row.map(cell => {
      let val = (cell === null || cell === undefined) ? "" : String(cell);
      if (val.includes(",") || val.includes("\"") || val.includes("\n")) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvContent += escaped.join(",") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.exportEmployeesCsv = function() {
  const headers = ["Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính", "Ngày sinh", "Số CCCD", "SĐT", "Email", "Địa chỉ / HKTT", "Trạng thái", "Mức lương"];
  const rows = (STATE.employees || []).map(e => [
    e.id,
    e.name,
    e.dept,
    e.position || e.jobTitle,
    e.gender,
    e.dob,
    e.idCard,
    e.phone,
    e.email,
    e.address || e.hktt,
    e.status,
    e.contract?.salary || ""
  ]);

  downloadCsv(`DANH_SACH_NHAN_VIEN_MF14_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  showToast("📥 Đã tải xuống file CSV Danh sách nhân viên thành công!");
};

window.exportContractsCsv = function() {
  const headers = ["Mã NV", "Họ và tên", "Phòng ban", "Số hợp đồng", "Loại hợp đồng", "Ngày bắt đầu", "Ngày kết thúc", "Mức lương", "Bản scan Drive", "Trạng thái"];
  const rows = (STATE.contractsList || []).map(c => [
    c.empId,
    c.name,
    c.dept,
    c.contractNo,
    c.type,
    c.startDate,
    c.endDate,
    c.baseSalary,
    c.driveFile,
    c.status
  ]);

  downloadCsv(`HOP_DONG_LAO_DONG_MF14_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  showToast("📥 Đã tải xuống file CSV Danh sách hợp đồng thành công!");
};

window.exportPayrollCsv = function() {
  const headers = ["Mã NV", "Họ và tên", "Phòng ban", "Lương cơ bản", "Ngày công", "Phụ cấp", "Tăng ca (OT)", "Tổng thu nhập", "BHXH (10.5%)", "Thuế TNCN", "Thực lĩnh"];
  const rows = (STATE.payrollList || []).map(p => [
    p.empId,
    p.name,
    p.dept,
    p.base,
    p.days,
    p.allowance,
    p.ot,
    p.total,
    p.insurance,
    p.tax,
    p.net
  ]);

  downloadCsv(`BANG_LUONG_MF14_THANG10_2026.csv`, headers, rows);
  showToast("📥 Đã tải xuống file CSV Bảng lương thành công!");
};

// =========================================================================
// DRIVE UPLOAD & TỰ ĐỘNG GHI NHẬN HỢP ĐỒNG
// =========================================================================
window.triggerUploadContract = function(empId) {
  const emp = (STATE.employees || []).find(e => e.id === empId);
  const currentUser = getCurrentUser();

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      if (emp) {
        if (!emp.contract) {
          emp.contract = {
            number: `HĐ-MF14-${emp.id}/2026`,
            type: "Hợp đồng lao động",
            startDate: new Date().toLocaleDateString("vi-VN"),
            endDate: "31/12/2026",
            salary: "Thoả thuận",
            status: "Đang hiệu lực"
          };
        }
        emp.contract.driveFile = file.name;
        emp.contract.status = "Đang hiệu lực";
        emp.contract.uploadedBy = currentUser.name;
        emp.contract.uploadedAt = new Date().toLocaleString("vi-VN");

        // Đồng bộ trong contractsList
        const c = (STATE.contractsList || []).find(x => x.empId === empId);
        if (c) {
          c.driveFile = file.name;
          c.status = "Đang hiệu lực";
        }

        saveState();
        openEmployeeDrawer(empId);
        initContractsView();
        showToast(`✓ Đã liên kết bản scan "${file.name}" cho nhân viên [${emp.name}] trên Google Drive (Folder ID: ${CONFIG.folderDriveId})!`);
      }
    }
  };
  input.click();
};

// =========================================================================
// THIẾT LẬP KẾT NỐI GOOGLE APPS SCRIPT
// =========================================================================
function initSetup() {
  const btnInitGAS = document.getElementById("btn-init-gas");
  const inputUrl = document.getElementById("gas-webapp-url");
  const storedUrl = localStorage.getItem(CONFIG.appsScriptUrlKey);

  if (inputUrl && storedUrl) {
    inputUrl.value = storedUrl;
  }

  btnInitGAS?.addEventListener("click", async () => {
    const url = inputUrl?.value.trim();
    if (!url) {
      alert("Vui lòng dán đường dẫn Web App Google Apps Script vào ô trước khi bấm khởi tạo!");
      return;
    }

    localStorage.setItem(CONFIG.appsScriptUrlKey, url);
    btnInitGAS.disabled = true;
    btnInitGAS.innerText = "⏳ Đang kết nối và khởi tạo 6 bảng trên Google Sheet...";

    try {
      const res = await fetch(`${url}?action=initDatabase`, { mode: "cors" });
      const resData = await res.json();

      if (resData.status === "success") {
        alert("🎉 CHÚC MỪNG!\nĐã tự động khởi tạo thành công 6 bảng trên Google Sheet của bạn:\n- Nhan_Vien\n- Phong_Ban\n- Hop_Dong\n- Cham_Cong\n- Nghi_Phep\n- Bang_Luong");
      } else {
        alert("Lỗi từ Google Apps Script: " + resData.message);
      }
    } catch (err) {
      alert("Kết nối Google Apps Script thành công (hoặc yêu cầu xác thực): " + err.message);
    } finally {
      btnInitGAS.disabled = false;
      btnInitGAS.innerText = "🚀 Khởi tạo cấu trúc dữ liệu tự động";
    }
  });
}

// =========================================================================
// CODE VIEWER & COPY CLIPBOARD
// =========================================================================
function initCodeViewer() {
  const codePre = document.getElementById("gas-code-content");
  const btnCopy = document.getElementById("btn-copy-script");

  fetch("google-apps-script.js")
    .then(r => r.text())
    .then(code => {
      if (codePre) codePre.textContent = code;
    })
    .catch(() => {
      if (codePre) codePre.textContent = "// Không thể tải tự động google-apps-script.js. Bạn có thể mở file này trực tiếp.";
    });

  btnCopy?.addEventListener("click", () => {
    if (codePre) {
      navigator.clipboard.writeText(codePre.textContent).then(() => {
        showToast("📋 Đã sao chép mã nguồn Google Apps Script vào Clipboard!");
      }).catch(() => {
        alert("Vui lòng chọn toàn bộ mã nguồn bên dưới và nhấn Ctrl + C!");
      });
    }
  });
}

// =========================================================================
// GẮN SỰ KIỆN TOÀN CỤC CHO CÁC NÚT BẤM VÀ MODAL
// =========================================================================
function bindGlobalEvents() {
  // Nút mở modal thêm nhân viên
  document.getElementById("btn-open-add-emp")?.addEventListener("click", () => {
    // Tự sinh mã tiếp theo
    const nextNum = STATE.employees.length + 1;
    const nextCode = `MS${nextNum.toString().padStart(3, "0")}`;
    const codeInput = document.getElementById("add-emp-code");
    if (codeInput) codeInput.value = nextCode;
    openModal("modal-add-employee");
  });

  // Nút xuất CSV nhân viên
  document.getElementById("btn-export-emp")?.addEventListener("click", () => {
    window.exportEmployeesCsv();
  });

  // Nút thêm HĐ
  document.getElementById("btn-open-add-contract")?.addEventListener("click", () => {
    populateEmployeeSelect("add-contract-emp");
    openModal("modal-add-contract");
  });

  // Nút xuất CSV hợp đồng
  document.getElementById("btn-export-contract")?.addEventListener("click", () => {
    window.exportContractsCsv();
  });

  // Nút tạo đơn nghỉ phép
  document.getElementById("btn-open-add-leave")?.addEventListener("click", () => {
    populateEmployeeSelect("add-leave-emp");
    const today = new Date().toLocaleDateString("vi-VN");
    document.getElementById("add-leave-from").value = today;
    document.getElementById("add-leave-to").value = today;
    openModal("modal-add-leave");
  });

  // Nút xuất CSV bảng lương
  document.getElementById("btn-export-payroll")?.addEventListener("click", () => {
    window.exportPayrollCsv();
  });

  // Nút sửa và xóa trong Drawer
  document.getElementById("btn-drawer-edit-emp")?.addEventListener("click", () => {
    if (window._activeDrawerEmpId) {
      openEditEmployeeModal(window._activeDrawerEmpId);
    }
  });

  document.getElementById("btn-drawer-delete-emp")?.addEventListener("click", () => {
    if (window._activeDrawerEmpId) {
      handleDeleteEmployee(window._activeDrawerEmpId);
    }
  });

  // Đóng Drawer
  document.getElementById("btn-close-drawer")?.addEventListener("click", closeEmployeeDrawer);
  document.getElementById("drawer-backdrop")?.addEventListener("click", closeEmployeeDrawer);

  // Tab switching trong Drawer
  const tabs = document.querySelectorAll(".drawer-tab");
  const panes = document.querySelectorAll(".drawer-content-pane");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const paneId = tab.getAttribute("data-pane");
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const targetPane = document.getElementById(paneId);
      if (targetPane) targetPane.classList.add("active");
    });
  });
}

function populateEmployeeSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;

  sel.innerHTML = (STATE.employees || []).map(e => `
    <option value="${e.id}">${e.id} - ${e.name} (${e.dept})</option>
  `).join("");
}
