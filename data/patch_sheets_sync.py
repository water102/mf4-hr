# -*- coding: utf-8 -*-
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r"f:\ws\projects\hrm-mf14\app.js", "r", encoding="utf-8") as f:
    content = f.read()

old_sync = """    const existingTitles = (meta.sheets || []).map(s => s.properties.title);
    const requiredSheets = ["Nhan_Vien", "Phong_Ban", "Hop_Dong", "Bang_Luong", "Cham_Cong", "Nghi_Phep"];
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

    // 3. Chuẩn bị dữ liệu 6 bảng
    // 3.1 Nhan_Vien
    const nvHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Chức danh", "Giới tính",
      "Số điện thoại", "Ngày sinh", "Số CCCD", "Ngày cấp", "Nơi cấp",
      "Địa chỉ / HKTT", "Lương Gross (VNĐ)", "Lương Net (VNĐ)", "Lương đóng BHXH",
      "Số HĐLĐ", "Loại HĐ", "Trạng thái HĐ", "Ghi chú"
    ];
    const nvRows = (STATE.employees || []).map(e => [
      e.id,
      e.name,
      e.dept,
      e.position || e.jobTitle || "",
      e.gender || "",
      e.phone || "",
      e.dob || "",
      e.idCard || "",
      e.idDate || "",
      e.idPlace || "",
      e.address || e.hktt || "",
      e.salary?.gross || e.salary?.probation || 0,
      e.salary?.net || 0,
      e.salary?.bhxhBase || 0,
      e.contract?.number || "",
      e.contract?.type || "",
      e.contract?.status || "",
      e.note || ""
    ]);

    // 3.2 Phong_Ban
    const pbHeaders = ["Phòng ban", "Số nhân sự hiện tại", "Định biên quy định", "Ghi chú"];
    const pbRows = [
      ["Ban giám hiệu", 4, 4, "BGH cơ sở"],
      ["Vận hành", 14, 14, "Vận hành, Kế toán, Bếp, HK, Y tế, Bảo vệ, CSKH"],
      ["Giáo viên", 19, 20, "Giáo viên mầm non, GV Tiếng Anh, GV nước ngoài"]
    ];

    // 3.3 Hop_Dong
    const hdHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Số hợp đồng", "Loại hợp đồng",
      "Ngày bắt đầu", "Ngày kết thúc", "Mức lương", "Bản scan Google Drive", "Trạng thái", "Ghi chú"
    ];
    const hdRows = (STATE.contractsList || []).map(c => [
      c.empId,
      c.name,
      c.dept,
      c.contractNo,
      c.type,
      c.startDate,
      c.endDate || "",
      c.baseSalary,
      c.driveFile,
      c.status,
      c.note || ""
    ]);

    // 3.4 Bang_Luong
    const blHeaders = [
      "Mã NV", "Họ và tên", "Phòng ban", "Lương cơ bản Gross", "Ngày công",
      "Phụ cấp", "Tăng ca (OT)", "Tổng thu nhập", "BHXH (10.5%)", "Thuế TNCN", "Thực lĩnh chuyển khoản"
    ];
    const blRows = (STATE.payrollList || []).map(p => [
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

    // 3.5 Cham_Cong
    const ccHeaders = ["Mã NV", "Họ và tên", "Phòng ban"];
    for (let d = 1; d <= 30; d++) {
      ccHeaders.push(d < 10 ? "0" + d : "" + d);
    }
    ccHeaders.push("Tổng ngày công", "Đi muộn", "Nghỉ phép");
    const ccRows = (STATE.timesheet || []).map(row => {
      const r = [row.empId, row.name, row.dept];
      let work = 0;
      let late = 0;
      (row.days || []).forEach(val => {
        r.push(val);
        if (val.includes("X")) work++;
        if (val.includes("_late")) late++;
      });
      r.push(work, late, 0);
      return r;
    });

    // 3.6 Nghi_Phep
    const npHeaders = ["Mã đơn", "Mã NV", "Họ và tên", "Phòng ban", "Loại phép", "Từ ngày", "Đến ngày", "Số ngày", "Lý do", "Trạng thái", "Người duyệt"];
    const npRows = (STATE.leavesList || []).map(l => [
      l.leaveId,
      l.empId,
      l.name,
      l.dept,
      l.type,
      l.fromDate,
      l.toDate,
      l.days,
      l.reason,
      l.status,
      l.approver
    ]);

    // 4. Gửi batchUpdate dữ liệu
    showToast("Đang ghi dữ liệu vào Google Sheet...", "info");
    const valuePayload = {
      valueInputOption: "USER_ENTERED",
      data: [
        { range: `Nhan_Vien!A1:R${nvRows.length + 1}`, values: [nvHeaders, ...nvRows] },
        { range: `Phong_Ban!A1:D${pbRows.length + 1}`, values: [pbHeaders, ...pbRows] },
        { range: `Hop_Dong!A1:K${hdRows.length + 1}`, values: [hdHeaders, ...hdRows] },
        { range: `Bang_Luong!A1:K${blRows.length + 1}`, values: [blHeaders, ...blRows] },
        { range: `Cham_Cong!A1:AI${ccRows.length + 1}`, values: [ccHeaders, ...ccRows] },
        { range: `Nghi_Phep!A1:K${npRows.length + 1}`, values: [npHeaders, ...npRows] }
      ]
    };"""

new_sync = """    const existingTitles = (meta.sheets || []).map(s => s.properties.title);
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
    };"""

if old_sync in content:
    content = content.replace(old_sync, new_sync)
    print("✓ Replaced syncDataDirectlyToGoogleSheets payload")
else:
    print("! Could not find old_sync")

with open(r"f:\ws\projects\hrm-mf14\app.js", "w", encoding="utf-8") as f:
    f.write(content)

print("✓ Saved updated app.js")
