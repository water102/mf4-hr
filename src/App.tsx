import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { 
  db, 
  autoSeedIfEmpty, 
  openContractFile, 
  deleteEmployeeFromFirestore,
  saveTimesheetToFirestore,
  loadTimesheetsFromFirestore,
  onAuthStatusChanged,
  logoutUser
} from "./firebase";
import { initialMF14Data } from "./data/initialData";
import { INITIAL_TIMESHEETS } from "./data/initialTimesheets";
import type { Employee, ContractItem, PayrollRecord, MonthlyTimesheet } from "./types";
import { Sidebar, type AppView } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { LoginView } from "./components/LoginView";
import { DashboardView } from "./components/DashboardView";
import { EmployeesView } from "./components/EmployeesView";
import { ContractsView } from "./components/ContractsView";
import { TimesheetView } from "./components/TimesheetView";
import { PayrollView } from "./components/PayrollView";
import { EmployeeDrawer } from "./components/EmployeeDrawer";
import { ContractEditModal } from "./components/ContractEditModal";
import { EmployeeEditModal } from "./components/EmployeeEditModal";
import { exportHRMDataToExcel } from "./utils/excel";
import { generateDefaultMonthlyTimesheet } from "./utils/timesheet";

export const App: React.FC = () => {
  // Trạng thái dữ liệu (Khởi tạo sẵn từ bộ dữ liệu chuẩn hóa 100% từ 17 file Excel)
  const [employees, setEmployees] = useState<Employee[]>(
    () => (initialMF14Data.employees as unknown as Employee[]) || []
  );
  const [contracts, setContracts] = useState<ContractItem[]>(
    () => (initialMF14Data.contractsList as unknown as ContractItem[]) || []
  );
  const [payroll, setPayroll] = useState<PayrollRecord[]>(
    () => (initialMF14Data.payrollHistory as unknown as PayrollRecord[]) || []
  );

  // Bảng chấm công (Khởi tạo sẵn 12 tháng lịch sử & tự động tạo tháng hiện tại)
  const [timesheets, setTimesheets] = useState<Record<string, MonthlyTimesheet>>(() => {
    const initial = { ...(INITIAL_TIMESHEETS as Record<string, MonthlyTimesheet>) };
    const now = new Date();
    const curMonthKey = `${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
    if (!initial[curMonthKey]) {
      initial[curMonthKey] = generateDefaultMonthlyTimesheet(
        initialMF14Data.employees as unknown as Employee[],
        curMonthKey
      );
    }
    return initial;
  });

  // Điều hướng View
  const [currentView, setCurrentView] = useState<AppView>("dashboard");

  // Modal & Drawer
  const [selectedDrawerEmpId, setSelectedDrawerEmpId] = useState<string | null>(null);
  const [editingContractEmpId, setEditingContractEmpId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

  // Trạng thái xác thực Firebase Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Lắng nghe phiên đăng nhập Firebase Auth
  useEffect(() => {
    const unsubAuth = onAuthStatusChanged((user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubAuth();
  }, []);

  // 1. Tự động nạp dữ liệu và lắng nghe Realtime Firebase Firestore hai chiều khi đã đăng nhập
  useEffect(() => {
    if (!currentUser) return;

    // Tự động kiểm tra và đẩy 30 nhân sự, bảng lương & chấm công lên Firestore nếu trống
    autoSeedIfEmpty().then(() => {
      loadTimesheetsFromFirestore().then((remoteTs) => {
        if (remoteTs && Object.keys(remoteTs).length > 0) {
          setTimesheets(prev => ({ ...prev, ...remoteTs }));
        }
      });
    });

    // Lắng nghe thay đổi Realtime nhân sự
    const unsubEmployees = onSnapshot(collection(db, "employees"), (snapshot) => {
      if (!snapshot.empty) {
        const list: Employee[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as Employee));
        list.sort((a, b) => (a.id || "").localeCompare(b.id || "", undefined, { numeric: true }));
        setEmployees(list);
      }
    }, (err) => {
      console.warn("Lưu ý kết nối Firestore Employees:", err);
    });

    // Lắng nghe thay đổi Realtime hợp đồng
    const unsubContracts = onSnapshot(collection(db, "contracts"), (snapshot) => {
      if (!snapshot.empty) {
        const list: ContractItem[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as ContractItem));
        list.sort((a, b) => (a.empId || "").localeCompare(b.empId || "", undefined, { numeric: true }));
        setContracts(list);
      }
    }, (err) => {
      console.warn("Lưu ý kết nối Firestore Contracts:", err);
    });

    // Lắng nghe thay đổi Realtime bảng lương
    const unsubPayroll = onSnapshot(collection(db, "payroll"), (snapshot) => {
      if (!snapshot.empty) {
        const list: PayrollRecord[] = [];
        snapshot.forEach((doc) => list.push(doc.data() as PayrollRecord));
        setPayroll(list);
      }
    }, (err) => {
      console.warn("Lưu ý kết nối Firestore Payroll:", err);
    });

    return () => {
      unsubEmployees();
      unsubContracts();
      unsubPayroll();
    };
  }, [currentUser]);

  // Xử lý lưu bảng chấm công
  const handleSaveTimesheet = async (ts: MonthlyTimesheet) => {
    setTimesheets(prev => ({
      ...prev,
      [ts.month]: ts
    }));
    await saveTimesheetToFirestore(ts);
  };

  // Tính ID tiếp theo khi thêm nhân viên mới (VD: MS31, MS32...)
  const nextEmployeeId = React.useMemo(() => {
    const maxNum = employees.reduce((max, e) => {
      const match = e.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `MS${String(maxNum + 1).padStart(2, "0")}`;
  }, [employees]);

  // View Titles
  const viewTitles: Record<AppView, { title: string; subtitle: string }> = {
    dashboard: { title: "Bảng điều hành", subtitle: "Tổng quan hoạt động nhân sự và tiền lương" },
    employees: { title: "Danh sách nhân sự", subtitle: "Quản lý hồ sơ nhân viên Công ty Cổ phần MF14" },
    contracts: { title: "Quản lý hợp đồng", subtitle: "Theo dõi thời hạn và lưu trữ bản scan hợp đồng" },
    timesheet: { title: "Bảng chấm công", subtitle: "Theo dõi ngày công thực tế (Sheet 3) & tự động tính lương" },
    payroll: { title: "Bảng tính lương", subtitle: "Chi tiết thu nhập và trích nộp bảo hiểm theo kỳ" }
  };

  // Helper mở xem file scan hợp đồng
  const handleViewContractScan = async (c: ContractItem) => {
    await openContractFile(c);
  };

  // Helper xóa nhân viên
  const handleDeleteEmployee = async (empId: string) => {
    try {
      await deleteEmployeeFromFirestore(empId);
      setEmployees(prev => prev.filter(e => e.id !== empId));
      setContracts(prev => prev.filter(c => c.empId !== empId));
    } catch (e: unknown) {
      alert("Lỗi xóa nhân viên: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // Màn hình chờ khi đang kiểm tra phiên đăng nhập
  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white select-none">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-sm font-semibold tracking-wide text-slate-200">Đang khởi tạo hệ thống HRM MF14...</p>
        <p className="text-xs text-slate-500 mt-1">Kiểm tra phiên đăng nhập an toàn</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị màn hình Đăng nhập
  if (!currentUser) {
    return <LoginView />;
  }

  // Đối tượng nhân viên và hợp đồng đang được mở xem trong Drawer
  const activeDrawerEmp = employees.find(e => e.id === selectedDrawerEmpId) || null;
  const activeDrawerContract = contracts.find(c => c.empId === selectedDrawerEmpId) || null;

  // Đối tượng hợp đồng đang chỉnh sửa
  const activeEditContract = contracts.find(c => c.empId === editingContractEmpId) || null;
  const activeEditContractEmp = employees.find(e => e.id === editingContractEmpId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Sidebar Trái */}
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        employeeCount={employees.length}
        contractCount={contracts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Trên */}
        <Topbar
          title={viewTitles[currentView].title}
          subtitle={viewTitles[currentView].subtitle}
          currentUser={currentUser}
          onLogout={() => logoutUser()}
          onExportExcel={() => exportHRMDataToExcel(employees, contracts, payroll)}
        />

        {/* Dynamic Views */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentView === "dashboard" && (
            <DashboardView
              employees={employees}
              contracts={contracts}
              payroll={payroll}
              onNavigate={setCurrentView}
              onOpenContractModal={(empId) => setEditingContractEmpId(empId)}
              onOpenEmployeeDrawer={(empId) => setSelectedDrawerEmpId(empId)}
            />
          )}

          {currentView === "employees" && (
            <EmployeesView
              employees={employees}
              onOpenDrawer={(empId) => setSelectedDrawerEmpId(empId)}
              onEditEmployee={(emp) => setEditingEmployee(emp)}
              onAddNewEmployee={() => setIsAddEmployeeModalOpen(true)}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {currentView === "contracts" && (
            <ContractsView
              contracts={contracts}
              onOpenContractModal={(empId) => setEditingContractEmpId(empId)}
              onViewContractScan={handleViewContractScan}
              onOpenEmployeeDrawer={(empId) => setSelectedDrawerEmpId(empId)}
            />
          )}

          {currentView === "timesheet" && (
            <TimesheetView
              timesheets={timesheets}
              employees={employees}
              onSaveTimesheet={handleSaveTimesheet}
              onOpenEmployeeDrawer={(empId) => setSelectedDrawerEmpId(empId)}
            />
          )}

          {currentView === "payroll" && (
            <PayrollView
              payroll={payroll}
              timesheets={timesheets}
              employees={employees}
              onOpenEmployeeDrawer={(empId) => setSelectedDrawerEmpId(empId)}
              onNavigateToTimesheet={() => setCurrentView("timesheet")}
            />
          )}
        </main>
      </div>

      {/* Slide-over Drawer Hồ sơ chi tiết */}
      <EmployeeDrawer
        isOpen={Boolean(selectedDrawerEmpId)}
        onClose={() => setSelectedDrawerEmpId(null)}
        employee={activeDrawerEmp}
        contract={activeDrawerContract}
        onEditEmployee={(emp) => {
          setSelectedDrawerEmpId(null);
          setEditingEmployee(emp);
        }}
        onEditContract={(empId) => {
          setSelectedDrawerEmpId(null);
          setEditingContractEmpId(empId);
        }}
        onViewContractScan={handleViewContractScan}
      />

      {/* Modal Chỉnh Sửa Hợp Đồng & Tải lên Scan vào Firestore */}
      {editingContractEmpId && (
        <ContractEditModal
          isOpen={Boolean(editingContractEmpId)}
          onClose={() => setEditingContractEmpId(null)}
          empId={editingContractEmpId}
          contract={activeEditContract}
          employee={activeEditContractEmp}
          onSaved={(updated) => {
            setContracts(prev => {
              const idx = prev.findIndex(c => c.empId === updated.empId);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updated;
                return next;
              }
              return [...prev, updated];
            });
          }}
        />
      )}

      {/* Modal Chỉnh Sửa hoặc Thêm Mới Nhân Viên */}
      {(editingEmployee || isAddEmployeeModalOpen) && (
        <EmployeeEditModal
          isOpen={Boolean(editingEmployee || isAddEmployeeModalOpen)}
          onClose={() => {
            setEditingEmployee(null);
            setIsAddEmployeeModalOpen(false);
          }}
          employee={editingEmployee}
          nextId={nextEmployeeId}
          onSaved={(savedEmp) => {
            setEmployees(prev => {
              const idx = prev.findIndex(e => e.id === savedEmp.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedEmp;
                return next;
              }
              return [...prev, savedEmp];
            });
          }}
        />
      )}
    </div>
  );
};

export default App;
