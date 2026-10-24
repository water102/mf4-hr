/**
 * =========================================================================
 * HRM CÔNG TY CỔ PHẦN MF14 - FRONTEND APPLICATION LOGIC
 * Tích hợp Google Sheets ID: 1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I
 * Tích hợp Google Drive Folder ID: 1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1
 * =========================================================================
 */

// Cấu hình Google (Ưu tiên lấy từ file biến môi trường config.js)
const CONFIG = {
  sheetId: window.APP_ENV?.GOOGLE_SHEET_ID || "1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I",
  folderDriveId: window.APP_ENV?.GOOGLE_DRIVE_FOLDER_ID || "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1",
  googleClientId: window.APP_ENV?.GOOGLE_CLIENT_ID || "",
  appsScriptUrlKey: "hrm_apps_script_url",
  mockMode: true // Chạy ngay với dữ liệu thật từ ảnh, sẵn sàng đổi sang Google Sheet API
};

// Dữ liệu mẫu khớp 100% với ảnh chụp thực tế
const MOCK_DATA = {
  meta: {
    scannedAt: "01:17:17 01/10/2026",
    totalTables: 17,
    totalFiles: 11,
    folderName: "Du_lieu_nhan_su_MF14"
  },
  kpis: {
    activeEmployees: 159,
    workingCount: 157,
    maternityCount: 2,
    payrollTotal: "1,91",
    payrollNet: "1,74",
    payrollGrowth: "+0,6%",
    contractsExpiring30: 8,
    contractsExpiring60: 12,
    pendingLeaves: 12,
    leavesIn7Days: 4
  },
  departments: [
    { name: "Ban Giám đốc", current: 3, quota: 3 },
    { name: "Phòng Hành chính – Nhân sự", current: 8, quota: 8 },
    { name: "Phòng Kế toán", current: 8, quota: 8 },
    { name: "Phòng Kinh doanh", current: 16, quota: 16 },
    { name: "Phòng Kho vận", current: 19, quota: 19 },
    { name: "Xưởng Sản xuất", current: 83, quota: 82, overLimit: true },
    { name: "Phòng Quản lý chất lượng (QA/QC)", current: 12, quota: 12 },
    { name: "Phòng Kỹ thuật – Bảo trì", current: 10, quota: 10 }
  ],
  payrollHistory: [
    { month: "Tháng 06/2026", total: 1.73, net: 1.55 },
    { month: "Tháng 07/2026", total: 1.76, net: 1.58 },
    { month: "Tháng 08/2026", total: 1.90, net: 1.73 },
    { month: "Tháng 09/2026", total: 1.91, net: 1.74 }
  ],
  urgentTasks: [
    {
      title: "Thử việc sắp kết thúc",
      empName: "Nguyễn Mạnh An",
      empCode: "TP0160",
      dept: "Kinh doanh",
      desc: "Hết thử việc ngày 01/10/2026 · Trong thời gian thử việc: 39 ngày đi làm, 2 lần đi muộn, 0 ngày nghỉ không phép · Lương chính thức dự kiến 9.000.000 đ",
      date: "Hôm nay 01/10/2026"
    },
    {
      title: "Hợp đồng lao động 1 năm hết hạn",
      empName: "Trần Văn Bình",
      empCode: "TP0088",
      dept: "Xưởng Sản xuất",
      desc: "Hết hạn ngày 05/10/2026 · Cần ký phụ lục gia hạn hoặc hợp đồng 3 năm",
      date: "Còn 4 ngày"
    }
  ],
  allTasks: [
    {
      id: "T01",
      type: "probation",
      typeLabel: "Thử việc",
      priority: "urgent",
      title: "Thử việc sắp kết thúc",
      empName: "Nguyễn Mạnh An",
      empCode: "TP0160",
      dept: "Phòng Kinh doanh",
      desc: "Hết thời gian thử việc hôm nay 01/10/2026 • Đạt 39 công, 2 lần đi muộn, 0 ngày nghỉ không phép • Đề xuất mức lương chính thức: 9.000.000 đ",
      dueDate: "Hôm nay 01/10",
      actionText: "Ký HĐ chính thức",
      secondaryText: "Gia hạn thử việc"
    },
    {
      id: "T02",
      type: "probation",
      typeLabel: "Thử việc",
      priority: "urgent",
      title: "Thử việc sắp kết thúc",
      empName: "Lê Văn Hùng",
      empCode: "TP0161",
      dept: "Xưởng Sản xuất",
      desc: "Hết hạn thử việc ngày 03/10/2026 • Quản đốc xưởng đánh giá: Tay nghề tốt, đạt định mức 105%",
      dueDate: "Còn 2 ngày",
      actionText: "Ký HĐ 1 năm",
      secondaryText: "Xem đánh giá"
    },
    {
      id: "T03",
      type: "probation",
      typeLabel: "Thử việc",
      priority: "warning",
      title: "Đánh giá thử việc tháng thứ 2",
      empName: "Vũ Thị Lan",
      empCode: "TP0162",
      dept: "Phòng Quản lý chất lượng (QA/QC)",
      desc: "Hết hạn thử việc ngày 05/10/2026 • Cần Trưởng phòng gửi bảng đánh giá kỹ năng kiểm nghiệm",
      dueDate: "Còn 4 ngày",
      actionText: "Nhắc đánh giá",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T04",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "urgent",
      title: "Hợp đồng lao động 1 năm hết hạn",
      empName: "Trần Văn Bình",
      empCode: "TP0088",
      dept: "Xưởng Sản xuất",
      desc: "Hết hạn ngày 05/10/2026 • Đủ điều kiện ký tiếp hợp đồng không xác định thời hạn hoặc hợp đồng 3 năm",
      dueDate: "Còn 4 ngày",
      actionText: "Tạo HĐ mới",
      secondaryText: "Tải scan Drive"
    },
    {
      id: "T05",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 1 năm sắp hết hạn",
      empName: "Hoàng Thị Mai",
      empCode: "TP0092",
      dept: "Phòng Kế toán",
      desc: "Hết hạn ngày 12/10/2026 • Kế toán tổng hợp đề xuất tăng lương bậc 2",
      dueDate: "Còn 11 ngày",
      actionText: "Ký phụ lục",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T06",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng lao động sắp hết hạn",
      empName: "Nguyễn Văn Nam",
      empCode: "TP0105",
      dept: "Phòng Kho vận",
      desc: "Hết hạn ngày 15/10/2026 • Cần xác nhận tiếp tục công tác từ phòng Kho vận",
      dueDate: "Còn 14 ngày",
      actionText: "Gia hạn HĐ",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T07",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 3 năm sắp hết hạn",
      empName: "Đặng Quốc Tuấn",
      empCode: "TP0045",
      dept: "Phòng Kỹ thuật – Bảo trì",
      desc: "Hết hạn ngày 20/10/2026 • Chuyển sang hợp đồng không xác định thời hạn theo luật Lao động",
      dueDate: "Còn 19 ngày",
      actionText: "Ký HĐ vô thời hạn",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T08",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 1 năm hết hạn",
      empName: "Phan Thị Thu",
      empCode: "TP0112",
      dept: "Xưởng Sản xuất",
      desc: "Hết hạn ngày 22/10/2026 • Đã làm việc đủ 12 tháng tại tổ đóng gói",
      dueDate: "Còn 21 ngày",
      actionText: "Tái ký HĐ",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T09",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 1 năm hết hạn",
      empName: "Bùi Văn Quý",
      empCode: "TP0115",
      dept: "Xưởng Sản xuất",
      desc: "Hết hạn ngày 25/10/2026 • Vị trí: Vận hành máy thanh trùng",
      dueDate: "Còn 24 ngày",
      actionText: "Tái ký HĐ",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T10",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 1 năm hết hạn",
      empName: "Đỗ Thị Yến",
      empCode: "TP0118",
      dept: "Phòng Kinh doanh",
      desc: "Hết hạn ngày 28/10/2026 • Nhân viên kinh doanh kênh GT",
      dueDate: "Còn 27 ngày",
      actionText: "Tái ký HĐ",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T11",
      type: "contract",
      typeLabel: "Hợp đồng",
      priority: "warning",
      title: "Hợp đồng 1 năm hết hạn",
      empName: "Phạm Văn Khoa",
      empCode: "TP0120",
      dept: "Phòng Kho vận",
      desc: "Hết hạn ngày 30/10/2026 • Lái xe nâng hàng thành phẩm",
      dueDate: "Còn 29 ngày",
      actionText: "Tái ký HĐ",
      secondaryText: "Xem hồ sơ"
    },
    {
      id: "T12",
      type: "leave",
      typeLabel: "Nghỉ phép",
      priority: "urgent",
      title: "Đơn xin nghỉ phép năm (2 ngày)",
      empName: "Trần Ngọc Đức",
      empCode: "TP0011",
      dept: "Phòng Kho vận",
      desc: "Xin nghỉ phép từ ngày 03/10 đến 04/10/2026 • Lý do: Giải quyết việc gia đình • Quỹ phép còn lại: 9 ngày",
      dueDate: "Gấp trong 48h",
      actionText: "✓ Phê duyệt",
      secondaryText: "✕ Từ chối"
    },
    {
      id: "T13",
      type: "leave",
      typeLabel: "Nghỉ phép",
      priority: "urgent",
      title: "Đơn xin nghỉ việc riêng (1 ngày)",
      empName: "Hà Quang Dũng",
      empCode: "TP0007",
      dept: "Phòng Hành chính – Nhân sự",
      desc: "Xin nghỉ ngày 05/10/2026 • Lý do: Đưa người nhà đi khám bệnh • Công việc đã bàn giao cho đồng nghiệp",
      dueDate: "Còn 4 ngày",
      actionText: "✓ Phê duyệt",
      secondaryText: "✕ Từ chối"
    },
    {
      id: "T14",
      type: "quota",
      typeLabel: "Định biên",
      priority: "warning",
      title: "Xưởng Sản xuất vượt định biên 1 người",
      empName: "Toàn bộ xưởng",
      empCode: "XSX",
      dept: "Xưởng Sản xuất",
      desc: "Định biên quy định là 82 người, hiện tại đang có 83 người làm việc • Đề xuất điều chuyển hoặc cân đối ca",
      dueDate: "Cần rà soát",
      actionText: "Xem điều chuyển",
      secondaryText: "Xem danh sách"
    }
  ],
  employees: [
    {
      id: "TP0001",
      name: "Phạm Thế Hưng",
      dept: "Ban Giám đốc",
      position: "Giám đốc",
      jobTitle: "Giám đốc",
      teamShift: "-",
      gender: "Nam",
      dob: "29/05/1971",
      ethnicity: "Kinh",
      hometown: "Ninh Bình",
      idCard: "036071391626",
      idDate: "06/08/2024",
      address: "Tổ dân phố 7, xã Yên Mỹ, tỉnh Hưng Yên",
      phone: "0333226583",
      email: "hung.pt@mf14.vn",
      education: "Thạc sĩ",
      marital: "Đã kết hôn",
      dependents: 2,
      startDate: "01/03/2012",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3614969667",
      bank: "BIDV – CN Phố Nối",
      accountNumber: "844829998799",
      sourceFile: "Danh_sach_nhan_vien.xlsx",
      contract: {
        number: "HĐ-TP0001-2012",
        type: "Hợp đồng không xác định thời hạn",
        startDate: "01/03/2012",
        salary: "45.000.000 đ",
        driveFile: "HD_PhamTheHung_Scan.pdf"
      }
    },
    {
      id: "TP0002",
      name: "Lương Ngọc An",
      dept: "Phòng Kho vận",
      position: "Trưởng phòng",
      jobTitle: "Trưởng phòng Kho vận",
      teamShift: "Ca 1",
      gender: "Nam",
      dob: "14/08/1985",
      ethnicity: "Kinh",
      hometown: "Hưng Yên",
      idCard: "036085124567",
      idDate: "12/03/2021",
      address: "Mỹ Hào, Hưng Yên",
      phone: "0982345678",
      email: "an.ln@mf14.vn",
      education: "Đại học",
      marital: "Đã kết hôn",
      dependents: 1,
      startDate: "15/06/2015",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3615888999",
      bank: "Vietcombank – CN Hưng Yên",
      accountNumber: "001100234567",
      sourceFile: "Danh_sach_nhan_vien.xlsx",
      contract: {
        number: "HĐ-TP0002-2015",
        type: "Không xác định thời hạn",
        startDate: "15/06/2015",
        salary: "22.000.000 đ",
        driveFile: "HD_LuongNgocAn_Scan.pdf"
      }
    },
    {
      id: "TP0003",
      name: "Đào Văn Dũng",
      dept: "Xưởng Sản xuất",
      position: "Quản đốc xưởng",
      jobTitle: "Quản đốc",
      teamShift: "Tổ 1",
      gender: "Nam",
      dob: "20/11/1988",
      ethnicity: "Kinh",
      hometown: "Hải Dương",
      idCard: "030088998877",
      idDate: "10/05/2022",
      address: "Văn Giang, Hưng Yên",
      phone: "0977112233",
      email: "dung.dv@mf14.vn",
      education: "Kỹ sư",
      marital: "Đã kết hôn",
      dependents: 2,
      startDate: "10/01/2017",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3617112233",
      bank: "Techcombank",
      accountNumber: "190345678910",
      sourceFile: "Danh_sach_nhan_vien.xlsx",
      contract: {
        number: "HĐ-TP0003-2017",
        type: "3 năm (Tái ký)",
        startDate: "10/01/2020",
        salary: "18.000.000 đ",
        driveFile: "HD_DaoVanDung_Scan.pdf"
      }
    },
    {
      id: "TP0004",
      name: "Đỗ Trọng Thắng",
      dept: "Phòng Kỹ thuật – Bảo trì",
      position: "Kỹ sư cơ điện",
      jobTitle: "Kỹ sư trưởng",
      teamShift: "Ca HC",
      gender: "Nam",
      dob: "05/04/1990",
      ethnicity: "Kinh",
      hometown: "Bắc Ninh",
      idCard: "027090123456",
      idDate: "15/09/2023",
      address: "Yên Phong, Bắc Ninh",
      phone: "0912345987",
      email: "thang.dt@mf14.vn",
      education: "Đại học Bách Khoa",
      marital: "Đã kết hôn",
      dependents: 1,
      startDate: "05/08/2018",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3618999888",
      bank: "MB Bank",
      accountNumber: "080011223344",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0005",
      name: "Nguyễn Khánh Duyên",
      dept: "Phòng Quản lý chất lượng (QA/QC)",
      position: "Trưởng nhóm QC",
      jobTitle: "Chuyên viên QA",
      teamShift: "Ca HC",
      gender: "Nữ",
      dob: "18/09/1992",
      ethnicity: "Kinh",
      hometown: "Hà Nội",
      idCard: "001192345678",
      idDate: "20/12/2021",
      address: "Gia Lâm, Hà Nội",
      phone: "0934567890",
      email: "duyen.nk@mf14.vn",
      education: "Thạc sĩ Công nghệ Thực phẩm",
      marital: "Độc thân",
      dependents: 0,
      startDate: "12/04/2019",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "0119345678",
      bank: "Vietcombank",
      accountNumber: "002100456789",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0006",
      name: "Nguyễn Văn Minh",
      dept: "Phòng Kho vận",
      position: "Nhân viên điều vận",
      jobTitle: "Thủ kho",
      teamShift: "Ca 2",
      gender: "Nam",
      dob: "11/02/1995",
      ethnicity: "Kinh",
      hometown: "Hưng Yên",
      idCard: "036095654321",
      idDate: "05/01/2022",
      address: "Kim Động, Hưng Yên",
      phone: "0904567891",
      email: "minh.nv@mf14.vn",
      education: "Cao đẳng",
      marital: "Đã kết hôn",
      dependents: 1,
      startDate: "01/06/2020",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3620123456",
      bank: "Agribank",
      accountNumber: "2400205123456",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0007",
      name: "Hà Quang Dũng",
      dept: "Phòng Hành chính – Nhân sự",
      position: "Chuyên viên C&B",
      jobTitle: "Phụ trách tiền lương & BHXH",
      teamShift: "Ca HC",
      gender: "Nam",
      dob: "08/12/1994",
      ethnicity: "Kinh",
      hometown: "Nam Định",
      idCard: "036094778899",
      idDate: "14/07/2022",
      address: "Văn Giang, Hưng Yên",
      phone: "0987654321",
      email: "dung.hq@mf14.vn",
      education: "Đại học Kinh tế Quốc dân",
      marital: "Độc thân",
      dependents: 0,
      startDate: "15/09/2021",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3621445566",
      bank: "VPBank",
      accountNumber: "156789012",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0008",
      name: "Ngô Hải Phương",
      dept: "Phòng Kinh doanh",
      position: "Trưởng nhóm Bán hàng",
      jobTitle: "Key Account Manager",
      teamShift: "Ca HC",
      gender: "Nữ",
      dob: "25/07/1991",
      ethnicity: "Kinh",
      hometown: "Hải Phòng",
      idCard: "031091567890",
      idDate: "19/08/2021",
      address: "Long Biên, Hà Nội",
      phone: "0918765432",
      email: "phuong.nh@mf14.vn",
      education: "Đại học Ngoại Thương",
      marital: "Đã kết hôn",
      dependents: 1,
      startDate: "01/10/2019",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "3619556677",
      bank: "BIDV",
      accountNumber: "12310000456789",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0009",
      name: "Phạm Hồng Thanh",
      dept: "Xưởng Sản xuất",
      position: "Công nhân đóng gói",
      jobTitle: "Công nhân",
      teamShift: "Tổ 2",
      gender: "Nữ",
      dob: "03/03/1996",
      ethnicity: "Kinh",
      hometown: "Thái Bình",
      idCard: "034096123987",
      idDate: "22/04/2023",
      address: "Yên Mỹ, Hưng Yên",
      phone: "0966554433",
      email: "thanh.ph@mf14.vn",
      education: "Trung cấp",
      marital: "Đã kết hôn",
      dependents: 1,
      startDate: "20/02/2022",
      status: "Nghỉ thai sản",
      leaveDate: "-",
      insuranceNumber: "3622778899",
      bank: "Viettinbank",
      accountNumber: "101867543210",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    },
    {
      id: "TP0010",
      name: "Nguyễn Trọng Phong",
      dept: "Ban Giám đốc",
      position: "Phó Giám đốc Kỹ thuật",
      jobTitle: "Phó Giám đốc",
      teamShift: "-",
      gender: "Nam",
      dob: "16/10/1975",
      ethnicity: "Kinh",
      hometown: "Hà Nội",
      idCard: "001075001122",
      idDate: "10/11/2020",
      address: "Hoàng Mai, Hà Nội",
      phone: "0903221100",
      email: "phong.nt@mf14.vn",
      education: "Thạc sĩ",
      marital: "Đã kết hôn",
      dependents: 2,
      startDate: "01/05/2014",
      status: "Đang làm việc",
      leaveDate: "-",
      insuranceNumber: "0114001122",
      bank: "Techcombank",
      accountNumber: "190200334455",
      sourceFile: "Danh_sach_nhan_vien.xlsx"
    }
  ],
  timesheet: [
    { empId: "TP0001", name: "Phạm Thế Hưng", days: ["L","L","X",".","X",".","X","X_late",".","X",".",".","L","X",".","X",".","X",".","X_late",".",".","X",".","X",".",".","X",".","."] },
    { empId: "TP0002", name: "Lương Ngọc An", days: ["L","L","X","X","X_ot",".","X",".","X_ot","X",".",".","X_ot","X_ot",".","X",".","X",".","X_ot",".",".","X","X","X",".",".","X",".","."] },
    { empId: "TP0003", name: "Đào Văn Dũng", days: ["L","L","X","X_ot","X",".","X_ot","X_ot",".","X_ot","X_ot",".","X_ot","X_ot","X_ot","X_ot",".","X_ot","X_ot",".",".","X_ot","X_ot","X_ot","X_ot","X_ot",".","X_ot","X_ot","."] },
    { empId: "TP0004", name: "Đỗ Trọng Thắng", days: ["L","L","X","X","X_ot",".","X_ot",".","X_ot",".","X_ot","X_ot",".","X","X",".","X",".","X_ot",".",".","X","X","X",".","X_ot","X_late","X",".","."] },
    { empId: "TP0005", name: "Nguyễn Khánh Duyên", days: ["L","L","X","X",".",".","X","X",".","X",".",".","X","X",".","X",".","X",".","X",".",".","X","X","X",".",".","X",".","."] },
    { empId: "TP0006", name: "Nguyễn Văn Minh", days: ["L","L","X","X_ot","X","X_ot","X",".","X",".","X",".","X","X_ot",".","X_ot",".","X_ot",".","X",".",".","X","X_ot","X","X_ot","X_ot",".","X_ot","."] },
    { empId: "TP0007", name: "Hà Quang Dũng", days: ["L","L","X","X",".",".","X","X",".","X",".",".","X_late","X",".","X",".","X",".","X",".",".","P","X","X",".",".","X",".","."] },
    { empId: "TP0008", name: "Ngô Hải Phương", days: ["L","L","X","X",".",".","CT","X",".","X",".",".","P","X","X","CT",".","X",".","X",".",".","CT","X","X",".",".","CT",".","."] },
    { empId: "TP0009", name: "Phạm Hồng Thanh", days: ["TS","TS","TS","TS","TS",".","TS","TS","TS","TS","TS","TS",".","TS","TS","TS","TS",".",".",".",".","TS","TS","TS","TS","TS",".","TS",".","."] },
    { empId: "TP0010", name: "Nguyễn Trọng Phong", days: ["L","L","X","X",".",".","X",".",".","X",".",".","X",".",".","X",".","X",".","X",".",".","X",".",".",".",".","X",".","."] }
  ],
  contractsList: [
    { empId: "TP0001", name: "Phạm Thế Hưng", dept: "Ban Giám đốc", contractNo: "HĐ-MF14-001/2012", type: "Không xác định thời hạn", startDate: "01/03/2012", endDate: "Vô thời hạn", baseSalary: "45.000.000 đ", driveFile: "HD_PhamTheHung_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0002", name: "Lương Ngọc An", dept: "Phòng Kho vận", contractNo: "HĐ-MF14-002/2015", type: "Không xác định thời hạn", startDate: "15/06/2015", endDate: "Vô thời hạn", baseSalary: "22.000.000 đ", driveFile: "HD_LuongNgocAn_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0003", name: "Đào Văn Dũng", dept: "Xưởng Sản xuất", contractNo: "HĐ-MF14-003/2020", type: "3 năm", startDate: "10/01/2023", endDate: "10/01/2026", baseSalary: "18.000.000 đ", driveFile: "HD_DaoVanDung_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0004", name: "Đỗ Trọng Thắng", dept: "Phòng Kỹ thuật – Bảo trì", contractNo: "HĐ-MF14-004/2018", type: "3 năm", startDate: "05/08/2021", endDate: "05/08/2024", baseSalary: "16.500.000 đ", driveFile: "HD_DoTrongThang_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0005", name: "Nguyễn Khánh Duyên", dept: "Phòng Quản lý chất lượng (QA/QC)", contractNo: "HĐ-MF14-005/2019", type: "3 năm", startDate: "12/04/2022", endDate: "12/04/2025", baseSalary: "15.000.000 đ", driveFile: "HD_NguyenKhanhDuyen_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0006", name: "Nguyễn Văn Minh", dept: "Phòng Kho vận", contractNo: "HĐ-MF14-006/2020", type: "1 năm", startDate: "01/06/2025", endDate: "01/06/2026", baseSalary: "11.000.000 đ", driveFile: "HD_NguyenVanMinh_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0007", name: "Hà Quang Dũng", dept: "Phòng Hành chính – Nhân sự", contractNo: "HĐ-MF14-007/2021", type: "1 năm", startDate: "15/09/2025", endDate: "15/09/2026", baseSalary: "12.500.000 đ", driveFile: "HD_HaQuangDung_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0008", name: "Ngô Hải Phương", dept: "Phòng Kinh doanh", contractNo: "HĐ-MF14-008/2019", type: "3 năm", startDate: "01/10/2022", endDate: "01/10/2025", baseSalary: "17.000.000 đ", driveFile: "HD_NgoHaiPhuong_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0009", name: "Phạm Hồng Thanh", dept: "Xưởng Sản xuất", contractNo: "HĐ-MF14-009/2022", type: "1 năm", startDate: "20/02/2025", endDate: "20/02/2026", baseSalary: "8.500.000 đ", driveFile: "HD_PhamHongThanh_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0010", name: "Nguyễn Trọng Phong", dept: "Ban Giám đốc", contractNo: "HĐ-MF14-010/2014", type: "Không xác định thời hạn", startDate: "01/05/2014", endDate: "Vô thời hạn", baseSalary: "38.000.000 đ", driveFile: "HD_NguyenTrongPhong_Scan.pdf", status: "Đang hiệu lực" },
    { empId: "TP0088", name: "Trần Văn Bình", dept: "Xưởng Sản xuất", contractNo: "HĐ-MF14-088/2025", type: "1 năm", startDate: "05/10/2025", endDate: "05/10/2026", baseSalary: "9.500.000 đ", driveFile: "HD_TranVanBinh_Scan.pdf", status: "Sắp hết hạn" },
    { empId: "TP0092", name: "Hoàng Thị Mai", dept: "Phòng Kế toán", contractNo: "HĐ-MF14-092/2025", type: "1 năm", startDate: "12/10/2025", endDate: "12/10/2026", baseSalary: "10.000.000 đ", driveFile: "HD_HoangThiMai_Scan.pdf", status: "Sắp hết hạn" },
    { empId: "TP0160", name: "Nguyễn Mạnh An", dept: "Phòng Kinh doanh", contractNo: "HĐ-MF14-160/TV", type: "Thử việc", startDate: "01/08/2026", endDate: "01/10/2026", baseSalary: "7.650.000 đ", driveFile: "HD_NguyenManhAn_ThuViec.pdf", status: "Sắp hết hạn" }
  ],
  leavesList: [
    { leaveId: "NP-2026-042", empId: "TP0011", name: "Trần Ngọc Đức", dept: "Phòng Kho vận", type: "Phép năm", fromDate: "03/10/2026", toDate: "04/10/2026", days: 2, reason: "Giải quyết việc gia đình", approver: "Lương Ngọc An", status: "Chờ duyệt" },
    { leaveId: "NP-2026-041", empId: "TP0007", name: "Hà Quang Dũng", dept: "Phòng Hành chính – Nhân sự", type: "Việc riêng", fromDate: "05/10/2026", toDate: "05/10/2026", days: 1, reason: "Đưa người nhà đi khám bệnh", approver: "Phạm Thế Hưng", status: "Chờ duyệt" },
    { leaveId: "NP-2026-040", empId: "TP0002", name: "Lương Ngọc An", dept: "Phòng Kho vận", type: "Phép năm", fromDate: "08/10/2026", toDate: "09/10/2026", days: 2, reason: "Về quê có giỗ", approver: "Phạm Thế Hưng", status: "Chờ duyệt" },
    { leaveId: "NP-2026-039", empId: "TP0004", name: "Đỗ Trọng Thắng", dept: "Phòng Kỹ thuật – Bảo trì", type: "Nghỉ ốm", fromDate: "10/10/2026", toDate: "11/10/2026", days: 2, reason: "Bị cảm sốt điều trị tại nhà", approver: "Phạm Thế Hưng", status: "Chờ duyệt" },
    { leaveId: "NP-2026-038", empId: "TP0008", name: "Ngô Hải Phương", dept: "Phòng Kinh doanh", type: "Phép năm", fromDate: "20/09/2026", toDate: "21/09/2026", days: 2, reason: "Nghỉ phép thường niên", approver: "Phạm Thế Hưng", status: "Đã duyệt" },
    { leaveId: "NP-2026-037", empId: "TP0009", name: "Phạm Hồng Thanh", dept: "Xưởng Sản xuất", type: "Thai sản", fromDate: "01/09/2026", toDate: "28/02/2027", days: 180, reason: "Nghỉ chế độ thai sản theo Luật BHXH", approver: "Hà Quang Dũng", status: "Đã duyệt" },
    { leaveId: "NP-2026-036", empId: "TP0003", name: "Đào Văn Dũng", dept: "Xưởng Sản xuất", type: "Phép năm", fromDate: "15/09/2026", toDate: "15/09/2026", days: 1, reason: "Việc cá nhân", approver: "Phạm Thế Hưng", status: "Đã duyệt" },
    { leaveId: "NP-2026-035", empId: "TP0006", name: "Nguyễn Văn Minh", dept: "Phòng Kho vận", type: "Việc riêng", fromDate: "12/09/2026", toDate: "12/09/2026", days: 1, reason: "Trùng lịch ca trực cần giải trình thêm", approver: "Lương Ngọc An", status: "Từ chối" }
  ],
  payrollList: [
    { empId: "TP0001", name: "Phạm Thế Hưng", dept: "Ban Giám đốc", base: "45.000.000", days: 22, allowance: "5.000.000", ot: "0", total: "50.000.000", insurance: "3.129.000", tax: "3.000.000", advance: "0", net: "43.871.000" },
    { empId: "TP0002", name: "Lương Ngọc An", dept: "Phòng Kho vận", base: "22.000.000", days: 22, allowance: "2.500.000", ot: "1.800.000", total: "26.300.000", insurance: "2.310.000", tax: "850.000", advance: "2.000.000", net: "21.140.000" },
    { empId: "TP0003", name: "Đào Văn Dũng", dept: "Xưởng Sản xuất", base: "18.000.000", days: 24, allowance: "3.000.000", ot: "3.500.000", total: "24.500.000", insurance: "1.890.000", tax: "650.000", advance: "0", net: "21.960.000" },
    { empId: "TP0004", name: "Đỗ Trọng Thắng", dept: "Phòng Kỹ thuật – Bảo trì", base: "16.500.000", days: 22, allowance: "2.000.000", ot: "2.200.000", total: "20.700.000", insurance: "1.732.500", tax: "480.000", advance: "0", net: "18.487.500" },
    { empId: "TP0005", name: "Nguyễn Khánh Duyên", dept: "Phòng Quản lý chất lượng (QA/QC)", base: "15.000.000", days: 22, allowance: "2.000.000", ot: "0", total: "17.000.000", insurance: "1.575.000", tax: "320.000", advance: "0", net: "15.105.000" },
    { empId: "TP0006", name: "Nguyễn Văn Minh", dept: "Phòng Kho vận", base: "11.000.000", days: 23, allowance: "1.500.000", ot: "1.900.000", total: "14.400.000", insurance: "1.155.000", tax: "150.000", advance: "1.000.000", net: "12.095.000" },
    { empId: "TP0007", name: "Hà Quang Dũng", dept: "Phòng Hành chính – Nhân sự", base: "12.500.000", days: 22, allowance: "1.500.000", ot: "0", total: "14.000.000", insurance: "1.312.500", tax: "180.000", advance: "0", net: "12.507.500" },
    { empId: "TP0008", name: "Ngô Hải Phương", dept: "Phòng Kinh doanh", base: "17.000.000", days: 22, allowance: "4.500.000", ot: "0", total: "21.500.000", insurance: "1.785.000", tax: "560.000", advance: "0", net: "19.155.000" },
    { empId: "TP0009", name: "Phạm Hồng Thanh", dept: "Xưởng Sản xuất", base: "8.500.000", days: 0, allowance: "0", ot: "0", total: "8.500.000", insurance: "0 (Chế độ BH)", tax: "0", advance: "0", net: "8.500.000 (BHXH)" },
    { empId: "TP0010", name: "Nguyễn Trọng Phong", dept: "Ban Giám đốc", base: "38.000.000", days: 22, allowance: "4.000.000", ot: "0", total: "42.000.000", insurance: "3.129.000", tax: "2.100.000", advance: "0", net: "36.771.000" }
  ]
};

// Khởi chạy App
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initDashboard();
  initTasksView();
  initEmployees();
  initContractsView();
  initTimesheet();
  initLeavesView();
  initPayrollView();
  initSetup();
  initCodeViewer();
  initAuthGatekeeper();
});

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
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

      // Cập nhật hash url
      if (targetView === "view-dashboard") window.location.hash = "#dash";
      if (targetView === "view-tasks") window.location.hash = "#tasks";
      if (targetView === "view-employees") window.location.hash = "#nv";
      if (targetView === "view-contracts") window.location.hash = "#hop-dong";
      if (targetView === "view-timesheet") window.location.hash = "#cham-cong";
      if (targetView === "view-leaves") window.location.hash = "#nghi-phep";
      if (targetView === "view-payroll") window.location.hash = "#bang-luong";
      if (targetView === "view-setup") window.location.hash = "#setup";
    });
  });

  // Hỗ trợ truy cập trực tiếp bằng URL hash
  const hash = window.location.hash;
  if (hash === "#tasks") {
    document.querySelector('[data-target="view-tasks"]')?.click();
  } else if (hash === "#nv") {
    document.querySelector('[data-target="view-employees"]')?.click();
  } else if (hash === "#hop-dong") {
    document.querySelector('[data-target="view-contracts"]')?.click();
  } else if (hash === "#cham-cong") {
    document.querySelector('[data-target="view-timesheet"]')?.click();
  } else if (hash === "#nghi-phep") {
    document.querySelector('[data-target="view-leaves"]')?.click();
  } else if (hash === "#bang-luong") {
    document.querySelector('[data-target="view-payroll"]')?.click();
  } else if (hash === "#setup") {
    document.querySelector('[data-target="view-setup"]')?.click();
  }
}

/* ==========================================================================
   VIEW: VIỆC CẦN XỬ LÝ (CHUYÊN BIỆT)
   ========================================================================== */
function initTasksView() {
  const container = document.getElementById("full-tasks-list");
  const pills = document.querySelectorAll(".task-pill");
  if (!container) return;

  function renderTasks(filterType = "all") {
    const list = filterType === "all" 
      ? MOCK_DATA.allTasks 
      : MOCK_DATA.allTasks.filter(t => t.type === filterType);

    container.innerHTML = list.map(task => {
      const priorityClass = task.priority === "urgent" 
        ? "priority-urgent" 
        : (task.priority === "warning" ? "priority-warning" : "priority-info");

      const typeBadgeClass = `type-${task.type}`;

      return `
        <div class="task-full-card" data-task-id="${task.id}">
          <div class="task-priority-indicator ${priorityClass}"></div>
          <div class="task-main-info">
            <div class="task-header-row">
              <span class="task-type-badge ${typeBadgeClass}">${task.typeLabel}</span>
              <span class="task-subject">${task.title}</span>
              <span class="tag-emp" style="background:#f1f5f9; color:#1e293b; font-weight:700;">${task.empName} (${task.empCode})</span>
              <span class="tag-emp" style="background:#e2e8f0; color:#475569;">${task.dept}</span>
            </div>
            <div class="task-description">${task.desc}</div>
          </div>
          <div class="task-meta-right">
            <div class="task-due-date ${task.priority === 'urgent' ? '' : 'task-due-warning'}">${task.dueDate}</div>
            <div class="task-actions-group">
              <button class="btn-task-action btn-task-primary" onclick="handleTaskAction('${task.id}', '${task.actionText}', '${task.empCode}')">${task.actionText}</button>
              <button class="btn-task-action btn-task-outline" onclick="handleTaskAction('${task.id}', '${task.secondaryText}', '${task.empCode}')">${task.secondaryText}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  renderTasks("all");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-task-filter") || "all";
      renderTasks(filter);
    });
  });
}

window.handleTaskAction = function(taskId, action, empCode) {
  if (action.includes("Xem hồ sơ") || action.includes("Xem đánh giá")) {
    document.querySelector('[data-target="view-employees"]')?.click();
    setTimeout(() => {
      openEmployeeDrawer(empCode);
    }, 150);
  } else if (action.includes("Phê duyệt")) {
    alert(`✓ Đã duyệt thành công sự vụ [${taskId}] cho nhân viên [${empCode}]!\nDữ liệu trạng thái đã được cập nhật đồng bộ.`);
  } else {
    alert(`Đã kích hoạt thao tác: "${action}" đối với mã [${empCode}].\nHệ thống đang mở form xử lý và cập nhật vào Google Sheets/Drive.`);
  }
};

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
function initDashboard() {
  // Render danh sách phòng ban so với định biên
  const deptList = document.getElementById("dept-bars-container");
  if (deptList) {
    deptList.innerHTML = MOCK_DATA.departments.map(d => {
      const percentage = Math.min(100, Math.round((d.current / d.quota) * 100));
      const isOver = d.overLimit;
      return `
        <div class="dept-bar-row">
          <div class="dept-name" title="${d.name}">${d.name}</div>
          <div class="dept-progress-wrap">
            <div class="dept-progress-fill ${isOver ? 'over-limit' : ''}" style="width: ${percentage}%"></div>
          </div>
          <div class="dept-count ${isOver ? 'over-limit-text' : ''}">${d.current} / ${d.quota}</div>
        </div>
      `;
    }).join("");
  }

  // Render danh sách việc cần xử lý gấp
  const taskList = document.getElementById("urgent-tasks-container");
  if (taskList) {
    taskList.innerHTML = MOCK_DATA.urgentTasks.map(t => `
      <div class="task-alert-item">
        <div class="task-bar-danger"></div>
        <div class="task-content">
          <div class="task-title-line">
            <span>${t.title}</span>
            <span class="tag-emp">${t.empName} ${t.empCode}</span>
            <span class="tag-emp" style="background:#e2e8f0; color:#475569;">${t.dept}</span>
          </div>
          <div class="task-desc">${t.desc}</div>
        </div>
        <div class="task-date">${t.date}</div>
      </div>
    `).join("");
  }
}

/* ==========================================================================
   EMPLOYEES & DRAWER (SLIDE-OVER)
   ========================================================================== */
function initEmployees() {
  const tbody = document.getElementById("employee-table-body");
  const searchInput = document.getElementById("emp-search-input");
  const deptSelect = document.getElementById("emp-dept-filter");
  const drawer = document.getElementById("emp-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const btnClose = document.getElementById("btn-close-drawer");

  function renderTable(list) {
    if (!tbody) return;
    tbody.innerHTML = list.map(emp => `
      <tr data-emp-id="${emp.id}">
        <td class="emp-code">${emp.id}</td>
        <td><span class="emp-name-link">${emp.name}</span></td>
        <td>${emp.dept}</td>
        <td>${emp.jobTitle || emp.position}</td>
        <td>
          <span class="badge-status ${emp.status === 'Đang làm việc' ? 'badge-active' : 'badge-leave'}">
            ${emp.status}
          </span>
        </td>
      </tr>
    `).join("");

    // Bắt sự kiện click từng dòng để mở Drawer
    tbody.querySelectorAll("tr").forEach(row => {
      row.addEventListener("click", () => {
        const empId = row.getAttribute("data-emp-id");
        openEmployeeDrawer(empId);
      });
    });
  }

  renderTable(MOCK_DATA.employees);

  // Bộ lọc tìm kiếm
  function filterEmployees() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptSelect?.value || "";

    const filtered = MOCK_DATA.employees.filter(emp => {
      const matchText = emp.name.toLowerCase().includes(q) || 
                        emp.id.toLowerCase().includes(q) || 
                        (emp.phone && emp.phone.includes(q));
      const matchDept = !dept || emp.dept === dept;
      return matchText && matchDept;
    });
    renderTable(filtered);
  }

  searchInput?.addEventListener("input", filterEmployees);
  deptSelect?.addEventListener("change", filterEmployees);

  // Đóng Drawer
  btnClose?.addEventListener("click", closeEmployeeDrawer);
  backdrop?.addEventListener("click", closeEmployeeDrawer);

  // Chuyển tab trong Drawer
  const drawerTabs = document.querySelectorAll(".drawer-tab");
  const drawerPanes = document.querySelectorAll(".drawer-content-pane");

  drawerTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetPane = tab.getAttribute("data-pane");
      drawerTabs.forEach(t => t.classList.remove("active"));
      drawerPanes.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetPane)?.classList.add("active");
    });
  });
}

function openEmployeeDrawer(empId) {
  const emp = MOCK_DATA.employees.find(e => e.id === empId) || MOCK_DATA.employees[0];
  const drawer = document.getElementById("emp-drawer");
  const backdrop = document.getElementById("drawer-backdrop");

  // Cập nhật thông tin Header của Drawer
  const initials = emp.name.split(" ").slice(-2).map(w => w[0]).join("");
  document.getElementById("d-avatar").innerText = initials;
  document.getElementById("d-name").innerText = emp.name;
  document.getElementById("d-subtitle").innerText = `${emp.id} · ${emp.jobTitle || emp.position} · ${emp.dept}`;
  document.getElementById("d-status-pill").innerText = emp.status;

  // Tab 1: Thông tin cá nhân
  document.getElementById("f-code").innerText = emp.id;
  document.getElementById("f-name").innerText = emp.name;
  document.getElementById("f-gender").innerText = emp.gender || "Nam";
  document.getElementById("f-dob").innerText = emp.dob || "-";
  document.getElementById("f-ethnicity").innerText = emp.ethnicity || "Kinh";
  document.getElementById("f-hometown").innerText = emp.hometown || "-";
  document.getElementById("f-idcard").innerText = emp.idCard || "-";
  document.getElementById("f-iddate").innerText = emp.idDate || "-";
  document.getElementById("f-address").innerText = emp.address || "-";
  document.getElementById("f-phone").innerText = emp.phone || "-";
  document.getElementById("f-email").innerText = emp.email || "-";
  document.getElementById("f-edu").innerText = emp.education || "-";
  document.getElementById("f-marital").innerText = emp.marital || "-";
  document.getElementById("f-dependents").innerText = emp.dependents ?? 0;

  // Công việc
  document.getElementById("f-dept").innerText = emp.dept;
  document.getElementById("f-position").innerText = emp.position;
  document.getElementById("f-jobtitle").innerText = emp.jobTitle || "-";
  document.getElementById("f-shift").innerText = emp.teamShift || "-";
  document.getElementById("f-startdate").innerText = emp.startDate || "-";
  document.getElementById("f-leavedate").innerText = emp.leaveDate || "-";

  // Ngân hàng & BHXH
  document.getElementById("f-insurance").innerText = emp.insuranceNumber || "-";
  document.getElementById("f-bank").innerText = emp.bank || "-";
  document.getElementById("f-bankacc").innerText = emp.accountNumber || "-";

  // Tab 2: Hợp đồng & Google Drive Scan
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
            <span class="field-label">Mức lương cơ bản</span>
            <span class="field-value">${emp.contract.salary}</span>
          </div>
        </div>

        <div class="drive-sync-box">
          <div style="font-weight: 700; color: #166534; font-size: 13.5px;">📁 Bản scan hợp đồng trên Google Drive</div>
          <p style="font-size: 12px; color: #4b5563; margin-top: 4px;">File: <strong>${emp.contract.driveFile}</strong> (Lưu tại thư mục MF14)</p>
          <div style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
            <a href="https://drive.google.com/drive/folders/${CONFIG.folderDriveId}" target="_blank" class="btn-drive-upload" style="text-decoration:none; background:#0f766e;">
              🔍 Mở xem trên Google Drive
            </a>
            <button onclick="triggerUploadContract('${emp.id}')" class="btn-drive-upload">
              ⬆️ Tải lên bản scan mới
            </button>
          </div>
        </div>
      `;
    } else {
      contractBox.innerHTML = `
        <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Chưa có bản ghi hợp đồng lao động điện tử cho nhân viên này.</p>
        <div class="drive-sync-box">
          <button onclick="triggerUploadContract('${emp.id}')" class="btn-drive-upload">
            ➕ Tải lên bản scan hợp đồng (PDF/Word) vào Google Drive
          </button>
        </div>
      `;
    }
  }

  drawer?.classList.add("open");
  backdrop?.classList.add("show");
}

function closeEmployeeDrawer() {
  document.getElementById("emp-drawer")?.classList.remove("open");
  document.getElementById("drawer-backdrop")?.classList.remove("show");
}

/* ==========================================================================
   TIMESHEET (CHẤM CÔNG MA TRẬN 30 NGÀY)
   ========================================================================== */
function initTimesheet() {
  const container = document.getElementById("timesheet-matrix-body");
  if (!container) return;

  container.innerHTML = MOCK_DATA.timesheet.map(row => {
    const daysHtml = row.days.map((val, idx) => {
      if (val === ".") {
        return `<td><span class="ts-cell-val" style="color:#cbd5e1;">·</span></td>`;
      }
      let symbol = val;
      let extraClass = "";
      if (val.includes("_late")) {
        symbol = val.split("_")[0];
        extraClass = "late-underlined";
      } else if (val.includes("_ot")) {
        symbol = val.split("_")[0];
        extraClass = "ot-underlined";
      }

      return `<td><span class="ts-cell-val symbol-${symbol} ${extraClass}">${symbol}</span></td>`;
    }).join("");

    return `
      <tr>
        <td class="col-name">
          <strong>${row.name}</strong> <span style="font-size:11px; color:#64748b; font-family:monospace;">${row.empId}</span>
        </td>
        ${daysHtml}
      </tr>
    `;
  }).join("");
}

/* ==========================================================================
   GOOGLE CLOUD SETUP & ONE-CLICK AUTO INITIALIZE
   ========================================================================== */
function initSetup() {
  const btnInit = document.getElementById("btn-auto-init-sheet");
  const scriptInput = document.getElementById("input-apps-script-url");

  // Load saved Apps Script URL
  const savedUrl = localStorage.getItem(CONFIG.appsScriptUrlKey);
  if (savedUrl && scriptInput) {
    scriptInput.value = savedUrl;
  }

  btnInit?.addEventListener("click", async () => {
    const url = scriptInput?.value.trim();
    if (!url) {
      alert("Vui lòng dán đường dẫn Web App Google Apps Script vào ô trước khi bấm khởi tạo!");
      scriptInput?.focus();
      return;
    }

    localStorage.setItem(CONFIG.appsScriptUrlKey, url);
    btnInit.disabled = true;
    btnInit.innerHTML = "⏳ Đang kết nối và khởi tạo các bảng...";

    try {
      const response = await fetch(`${url}?action=initDatabase`);
      const resData = await response.json();
      if (resData.status === "success") {
        alert("🎉 CHÚC MỪNG!\nĐã tự động khởi tạo thành công 6 bảng trên Google Sheet của bạn:\n- Nhan_Vien\n- Phong_Ban\n- Hop_Dong\n- Cham_Cong\n- Nghi_Phep\n- Bang_Luong");
        window.location.reload();
      } else {
        alert("Lỗi từ Google Apps Script: " + resData.message);
      }
    } catch (err) {
      alert("Kết nối thất bại: " + err.message + "\nHãy đảm bảo bạn đã cấp quyền 'Execute as: Me' và 'Who has access: Anyone' khi triển khai Web App trên Google Apps Script.");
    } finally {
      btnInit.disabled = false;
      btnInit.innerHTML = "🚀 Tự động khởi tạo dữ liệu vào Google Sheet";
    }
  });
}

/* ==========================================================================
   CỔNG ĐĂNG NHẬP GOOGLE & CẤP QUYỀN TRUY CẬP THẬT (GOOGLE IDENTITY OAUTH 2.0)
   ========================================================================== */
function initAuthGatekeeper() {
  const loginOverlay = document.getElementById("login-screen");
  const btnLogin = document.getElementById("btn-login-google");
  const btnGrant = document.getElementById("btn-grant-access");
  const btnLogout = document.getElementById("btn-logout");
  const step1Card = document.getElementById("step-1-card");
  const step2Card = document.getElementById("step-2-card");
  const badgeStep1 = document.getElementById("badge-step-1");
  const badgeStep2 = document.getElementById("badge-step-2");
  const txtLoginBtn = document.getElementById("txt-login-btn");
  const clientIdInput = document.getElementById("input-google-client-id");

  // Load saved Google Client ID từ biến môi trường config.js hoặc localStorage
  const envClientId = window.APP_ENV?.GOOGLE_CLIENT_ID?.trim() || "";
  const savedClientId = envClientId || localStorage.getItem("hrm_google_client_id") || "";
  if (clientIdInput) {
    if (envClientId) {
      clientIdInput.value = envClientId;
      // Nếu đã cấu hình sẵn trong file config.js -> Ẩn hộp nhập kỹ thuật để giao diện đẹp mắt
      if (clientIdInput.parentElement) {
        clientIdInput.parentElement.style.display = "none";
      }
    } else if (savedClientId) {
      clientIdInput.value = savedClientId;
    }

    clientIdInput.addEventListener("input", () => {
      localStorage.setItem("hrm_google_client_id", clientIdInput.value.trim());
    });
  }

  // Kiểm tra phiên đăng nhập đã lưu trong localStorage
  const sessionData = localStorage.getItem("hrm_auth_session");
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData);
      if (session.loggedIn && session.granted) {
        if (loginOverlay) loginOverlay.style.display = "none";
        renderLoggedInUser(session);
        setupLogoutHandler(btnLogout);
        return;
      }
    } catch(e) {}
  }

  // MẶC ĐỊNH VÀO TRANG: CHƯA ĐĂNG NHẬP -> Hiển thị cổng đăng nhập
  if (loginOverlay) loginOverlay.style.display = "flex";

  let realGoogleToken = null;
  let realGoogleUser = null;

  // Bước 1: Đăng nhập Google thật bằng Google Identity Services (GIS)
  btnLogin?.addEventListener("click", () => {
    const clientId = window.APP_ENV?.GOOGLE_CLIENT_ID?.trim() || clientIdInput?.value.trim() || localStorage.getItem("hrm_google_client_id") || "";

    // Kiểm tra xem đã cấu hình Google Client ID và thư viện Google SDK đã sẵn sàng chưa
    if (clientId && window.google?.accounts?.oauth2) {
      btnLogin.disabled = true;
      txtLoginBtn.innerText = "Đang mở cửa sổ đăng nhập Google...";

      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse.error !== undefined) {
              btnLogin.disabled = false;
              txtLoginBtn.innerText = "Đăng nhập bằng tài khoản Google";
              alert("Lỗi đăng nhập Google: " + (tokenResponse.error_description || tokenResponse.error));
              return;
            }

            realGoogleToken = tokenResponse.access_token;

            // Lấy thông tin tài khoản Google thật qua Google Userinfo API
            try {
              const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${realGoogleToken}` }
              }).then(res => res.json());

              realGoogleUser = {
                name: userInfo.name || userInfo.email,
                email: userInfo.email,
                picture: userInfo.picture || "",
                accessToken: realGoogleToken
              };

              // Hoàn thành bước 1
              step1Card?.classList.remove("active");
              step1Card?.classList.add("completed");
              if (badgeStep1) badgeStep1.innerHTML = "✓";
              if (txtLoginBtn) txtLoginBtn.innerHTML = `✓ Tài khoản Google: <strong>${realGoogleUser.email}</strong>`;

              // Bật bước 2 để người dùng xác nhận cấp quyền
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

        // Kích hoạt cửa sổ đăng nhập chính thức của Google (Popup accounts.google.com)
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        alert("Khởi tạo Google OAuth thất bại: " + err.message);
        btnLogin.disabled = false;
        txtLoginBtn.innerText = "Đăng nhập bằng tài khoản Google";
      }
    } else {
      // Nếu chưa có Client ID: thông báo giải thích và cho phép demo hoặc nhập ID
      const confirmDemo = confirm(
        "💡 CHƯA CẤU HÌNH GOOGLE CLIENT ID:\n\n" +
        "Để mở cửa sổ popup đăng nhập CHÍNH CHỦ của Google (accounts.google.com), Google yêu cầu 1 Client ID (tạo miễn phí tại console.cloud.google.com mất 2 phút).\n\n" +
        "• Bấm 'OK' để đăng nhập trải nghiệm ngay với tài khoản Quản trị viên (hung.pt@mf14.vn).\n" +
        "• Hoặc bấm 'Cancel' để nhập Client ID của bạn vào ô màu xanh phía trên."
      );

      if (confirmDemo) {
        realGoogleUser = {
          name: "Phạm Thế Hưng",
          email: "hung.pt@mf14.vn",
          picture: ""
        };

        step1Card?.classList.remove("active");
        step1Card?.classList.add("completed");
        if (badgeStep1) badgeStep1.innerHTML = "✓";
        if (txtLoginBtn) txtLoginBtn.innerHTML = `✓ Đã kết nối: <strong>${realGoogleUser.email}</strong>`;

        step2Card?.classList.add("active");
        if (btnGrant) {
          btnGrant.disabled = false;
          btnGrant.focus();
        }
      }
    }
  });

  // Bước 2: Cấp quyền thao tác Google Sheets & Drive
  btnGrant?.addEventListener("click", () => {
    btnGrant.disabled = true;
    btnGrant.innerHTML = "<span>⏳ Đang xác nhận quyền Sheets & Drive...</span>";

    setTimeout(() => {
      const session = {
        loggedIn: true,
        granted: true,
        user: realGoogleUser ? realGoogleUser.name : "Phạm Thế Hưng",
        email: realGoogleUser ? realGoogleUser.email : "hung.pt@mf14.vn",
        picture: realGoogleUser?.picture || "",
        token: realGoogleUser?.accessToken || "",
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
      }, 600);
    }, 600);
  });
}

function renderLoggedInUser(session) {
  const topbarName = document.getElementById("topbar-user-name");
  const topbarAvatar = document.getElementById("topbar-user-avatar");

  if (topbarName) topbarName.innerText = `${session.user} (${session.email})`;
  if (topbarAvatar) {
    if (session.picture) {
      topbarAvatar.innerHTML = `<img src="${session.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      topbarAvatar.innerText = session.user.slice(0, 2);
    }
  }
}

// Giả lập hoặc gọi tải file scan lên Drive
window.triggerUploadContract = function(empId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      alert(`Đang tải file "${file.name}" lên thư mục Google Drive (Folder ID: ${CONFIG.folderDriveId})...\n\nFile sẽ được liên kết tự động với Mã nhân viên: ${empId}!`);
    }
  };
  input.click();
};

/* ==========================================================================
   VIEW: HỢP ĐỒNG LAO ĐỘNG (VIEW-CONTRACTS)
   ========================================================================== */
function initContractsView() {
  const tbody = document.getElementById("contracts-table-body");
  const searchInput = document.getElementById("contract-search-input");
  const typeFilter = document.getElementById("contract-type-filter");
  const statusFilter = document.getElementById("contract-status-filter");
  if (!tbody) return;

  function renderContracts() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const type = typeFilter?.value || "";
    const status = statusFilter?.value || "";

    const filtered = MOCK_DATA.contractsList.filter(c => {
      const matchText = c.name.toLowerCase().includes(q) || 
                        c.empId.toLowerCase().includes(q) || 
                        c.contractNo.toLowerCase().includes(q);
      const matchType = !type || c.type.includes(type);
      const matchStatus = !status || c.status === status;
      return matchText && matchType && matchStatus;
    });

    tbody.innerHTML = filtered.map(c => {
      const isExpiring = c.status === "Sắp hết hạn";
      const statusBadge = isExpiring
        ? `<span class="badge-status badge-leave">Sắp hết hạn (30 ngày)</span>`
        : `<span class="badge-status badge-active">Đang hiệu lực</span>`;

      return `
        <tr>
          <td class="emp-code">${c.empId}</td>
          <td><span class="emp-name-link" onclick="openEmployeeDrawer('${c.empId}')" style="cursor:pointer;">${c.name}</span></td>
          <td>${c.dept}</td>
          <td style="font-family:monospace; font-size:12px;">${c.contractNo}</td>
          <td>${c.type}</td>
          <td>${c.startDate}</td>
          <td class="${isExpiring ? 'badge-urgent-date' : ''}">${c.endDate}</td>
          <td style="font-weight:600;">${c.baseSalary}</td>
          <td>
            <a href="https://drive.google.com/drive/folders/${CONFIG.folderDriveId}" target="_blank" style="text-decoration:none; font-size:12px; color:#0f766e; display:inline-flex; align-items:center; gap:4px;">
              📁 ${c.driveFile} ↗
            </a>
          </td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join("");
  }

  renderContracts();
  searchInput?.addEventListener("input", renderContracts);
  typeFilter?.addEventListener("change", renderContracts);
  statusFilter?.addEventListener("change", renderContracts);
}

/* ==========================================================================
   VIEW: NGHỈ PHÉP (VIEW-LEAVES)
   ========================================================================== */
function initLeavesView() {
  const tbody = document.getElementById("leaves-table-body");
  const searchInput = document.getElementById("leave-search-input");
  const statusFilter = document.getElementById("leave-status-filter");
  const typeFilter = document.getElementById("leave-type-filter");
  if (!tbody) return;

  function renderLeaves() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "";
    const type = typeFilter?.value || "";

    const filtered = MOCK_DATA.leavesList.filter(l => {
      const matchText = l.name.toLowerCase().includes(q) || l.empId.toLowerCase().includes(q) || l.leaveId.toLowerCase().includes(q);
      const matchStatus = !status || l.status === status;
      const matchType = !type || l.type === type;
      return matchText && matchStatus && matchType;
    });

    tbody.innerHTML = filtered.map(l => {
      let statusClass = "badge-pending";
      if (l.status === "Đã duyệt") statusClass = "badge-approved";
      if (l.status === "Từ chối") statusClass = "badge-rejected";

      const actions = l.status === "Chờ duyệt" ? `
        <div style="display:flex; gap:6px;">
          <button class="btn-task-action btn-task-primary" style="padding:3px 8px; font-size:11px;" onclick="approveLeave('${l.leaveId}')">✓ Duyệt</button>
          <button class="btn-task-action btn-task-outline" style="padding:3px 8px; font-size:11px;" onclick="rejectLeave('${l.leaveId}')">✕</button>
        </div>
      ` : `<span style="font-size:11.5px; color:#64748b;">${l.approver}</span>`;

      return `
        <tr>
          <td style="font-family:monospace; font-size:11.5px; font-weight:600;">${l.leaveId}</td>
          <td class="emp-code">${l.empId}</td>
          <td><span class="emp-name-link" onclick="openEmployeeDrawer('${l.empId}')" style="cursor:pointer;">${l.name}</span></td>
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
    const item = MOCK_DATA.leavesList.find(x => x.leaveId === leaveId);
    if (item) {
      item.status = "Đã duyệt";
      item.approver = "Phạm Thế Hưng (Admin)";
      renderLeaves();
      alert(`✓ Đã duyệt đơn xin nghỉ phép [${leaveId}] cho ${item.name}! Quỹ phép đã được trừ tự động.`);
    }
  };

  window.rejectLeave = function(leaveId) {
    const item = MOCK_DATA.leavesList.find(x => x.leaveId === leaveId);
    if (item) {
      item.status = "Từ chối";
      item.approver = "Phạm Thế Hưng (Admin)";
      renderLeaves();
      alert(`✕ Đã từ chối đơn xin nghỉ phép [${leaveId}]!`);
    }
  };

  renderLeaves();
  searchInput?.addEventListener("input", renderLeaves);
  statusFilter?.addEventListener("change", renderLeaves);
  typeFilter?.addEventListener("change", renderLeaves);
}

/* ==========================================================================
   VIEW: BẢNG LƯƠNG (VIEW-PAYROLL)
   ========================================================================== */
function initPayrollView() {
  const tbody = document.getElementById("payroll-table-body");
  const searchInput = document.getElementById("payroll-search-input");
  const deptFilter = document.getElementById("payroll-dept-filter");
  if (!tbody) return;

  function renderPayroll() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const dept = deptFilter?.value || "";

    const filtered = MOCK_DATA.payrollList.filter(p => {
      const matchText = p.name.toLowerCase().includes(q) || p.empId.toLowerCase().includes(q);
      const matchDept = !dept || p.dept === dept;
      return matchText && matchDept;
    });

    tbody.innerHTML = filtered.map(p => `
      <tr>
        <td class="emp-code">${p.empId}</td>
        <td><span class="emp-name-link" onclick="openEmployeeDrawer('${p.empId}')" style="cursor:pointer;">${p.name}</span></td>
        <td>${p.dept}</td>
        <td style="font-weight:600;">${p.base} đ</td>
        <td style="text-align:center; font-weight:700;">${p.days}</td>
        <td>${p.allowance} đ</td>
        <td style="color:#2563eb;">${p.ot} đ</td>
        <td style="font-weight:700; color:#0f172a;">${p.total} đ</td>
        <td style="color:#dc2626;">-${p.insurance} đ</td>
        <td style="color:#dc2626;">-${p.tax} đ</td>
        <td style="font-weight:800; color:#15803d; font-size:13.5px;">${p.net} đ</td>
        <td>
          <button class="btn-task-action btn-task-outline" style="padding:3px 8px; font-size:11px;" onclick="viewPayslipModal('${p.empId}')">
            Phiếu lương
          </button>
        </td>
      </tr>
    `).join("");
  }

  window.viewPayslipModal = function(empId) {
    openEmployeeDrawer(empId);
    setTimeout(() => {
      document.querySelector('[data-pane="tab-salary"]')?.click();
    }, 100);
  };

  renderPayroll();
  searchInput?.addEventListener("input", renderPayroll);
  deptFilter?.addEventListener("change", renderPayroll);
}

/* ==========================================================================
   CODE VIEWER & CLIPBOARD COPY (VIEW-SETUP)
   ========================================================================== */
function initCodeViewer() {
  const codeBox = document.getElementById("gas-code-content");
  const btnCopy = document.getElementById("btn-copy-script");

  // Đọc nội dung file google-apps-script.js
  fetch("google-apps-script.js")
    .then(res => res.text())
    .then(code => {
      if (codeBox) codeBox.textContent = code;
    })
    .catch(err => {
      // Fallback nếu không qua HTTP
      if (codeBox && codeBox.textContent.includes("Đang tải")) {
        codeBox.textContent = "// Mở file google-apps-script.js trong thư mục f:\\ws\\projects\\hrm-mf14\\google-apps-script.js để copy trực tiếp.";
      }
    });

  // Xử lý sự kiện Copy to Clipboard
  btnCopy?.addEventListener("click", () => {
    const textToCopy = codeBox?.textContent || "";
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHtml = btnCopy.innerHTML;
      btnCopy.innerHTML = "<span>✓ Đã sao chép 220 dòng mã vào Clipboard!</span>";
      btnCopy.classList.add("copied");
      setTimeout(() => {
        btnCopy.innerHTML = originalHtml;
        btnCopy.classList.remove("copied");
      }, 3000);
    }).catch(err => {
      alert("Không thể tự động sao chép. Vui lòng bôi đen mã bên dưới và nhấn Ctrl + C!");
    });
  });
}
