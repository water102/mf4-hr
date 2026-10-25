import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  limit, 
  query, 
  writeBatch,
  orderBy
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import type { Employee, ContractItem, PayrollRecord, MonthlyTimesheet } from "./types";
import { initialMF14Data } from "./data/initialData";
import { INITIAL_TIMESHEETS } from "./data/initialTimesheets";

export const firebaseConfig = {
  apiKey: "AIzaSyA2SgXmnXEoz05AqFK8tk96t8mbE5uFick",
  authDomain: "hrm-mf14.firebaseapp.com",
  projectId: "hrm-mf14",
  storageBucket: "hrm-mf14.firebasestorage.app",
  messagingSenderId: "220230180928",
  appId: "1:220230180928:web:d14afee5fc94f28c73bfa5",
  measurementId: "G-D3PNS5D329"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper đăng nhập bằng Username hoặc Email + Password
export async function loginWithUserPassword(usernameOrEmail: string, password: string): Promise<User> {
  const cleanInput = usernameOrEmail.trim();
  // Nếu người dùng nhập tên người dùng không có @ (ví dụ: 'admin'), tự động thêm domain '@mf14.vn'
  const email = cleanInput.includes("@") ? cleanInput : `${cleanInput}@mf14.vn`;
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Helper đăng xuất
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Lắng nghe thay đổi trạng thái đăng nhập
export function onAuthStatusChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Tự động nạp dữ liệu chuẩn lên Firestore nếu collection còn trống
export async function autoSeedIfEmpty() {
  try {
    const q = query(collection(db, "employees"), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log("🔥 Đang tự động nạp dữ liệu ban đầu lên Cloud Firestore...");
      const batch = writeBatch(db);

      // 1. Nạp danh sách nhân viên
      (initialMF14Data.employees as unknown as Employee[]).forEach((emp) => {
        const ref = doc(db, "employees", emp.id);
        batch.set(ref, emp);
      });

      // 2. Nạp hợp đồng
      (initialMF14Data.contractsList as unknown as ContractItem[]).forEach((c) => {
        const ref = doc(db, "contracts", c.empId);
        batch.set(ref, c);
      });

      // 3. Nạp lịch sử lương
      (initialMF14Data.payrollHistory as unknown as PayrollRecord[]).forEach((p, idx) => {
        const docId = `${p.empId}_${p.month}`.replace(/\./g, "_");
        const ref = doc(db, "payroll", docId || `p_${idx}`);
        batch.set(ref, p);
      });

      await batch.commit();
      console.log("✓ Đã nạp thành công 30 nhân sự & 164 bản ghi lương lên Cloud Firestore!");
    }

    // Kiểm tra timesheets
    const tsQ = query(collection(db, "timesheets"), limit(1));
    const tsSnap = await getDocs(tsQ);
    if (tsSnap.empty && INITIAL_TIMESHEETS) {
      console.log("🔥 Đang nạp dữ liệu chấm công lịch sử lên Firestore...");
      for (const monthKey of Object.keys(INITIAL_TIMESHEETS)) {
        const ts = INITIAL_TIMESHEETS[monthKey];
        const docId = monthKey.replace(/\./g, "_");
        await setDoc(doc(db, "timesheets", docId), ts);
      }
      console.log("✓ Đã nạp thành công dữ liệu chấm công lên Cloud Firestore!");
    }
  } catch (err) {
    console.warn("Lưu ý về Firestore Seed:", err);
  }
}

// Lưu bảng chấm công của một tháng (hỗ trợ offline localStorage nếu Firestore chưa cấp quyền)
export async function saveTimesheetToFirestore(timesheet: MonthlyTimesheet) {
  // Luôn lưu bản sao vào localStorage để không bao giờ mất dữ liệu
  try {
    localStorage.setItem(`mf14_timesheet_${timesheet.month}`, JSON.stringify(timesheet));
  } catch {}

  try {
    const docId = timesheet.month.replace(/\./g, "_");
    await setDoc(doc(db, "timesheets", docId), timesheet);
  } catch (err) {
    // Không ném lỗi nếu Firestore chưa cấu hình rules cho collection timesheets
  }
}

// Tải tất cả bảng chấm công (ưu tiên Firestore, tự động merge localStorage)
export async function loadTimesheetsFromFirestore(): Promise<Record<string, MonthlyTimesheet>> {
  const result: Record<string, MonthlyTimesheet> = {};

  // 1. Đọc từ localStorage trước
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mf14_timesheet_")) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || "");
          if (val && val.month) {
            result[val.month] = val;
          }
        } catch {}
      }
    }
  } catch {}

  // 2. Đọc từ Firestore nếu có kết nối và quyền
  try {
    const snap = await getDocs(collection(db, "timesheets"));
    snap.forEach((d) => {
      const data = d.data() as MonthlyTimesheet;
      if (data.month) {
        result[data.month] = data;
      }
    });
  } catch (err) {
    // Bỏ qua nếu rules chưa cấp
  }

  return result;
}

// Lưu nhân viên vào Firestore
export async function saveEmployeeToFirestore(emp: Employee) {
  try {
    await setDoc(doc(db, "employees", emp.id), emp, { merge: true });
  } catch (err) {
    console.error("Lỗi lưu nhân viên:", err);
    throw err;
  }
}

// Xóa nhân viên khỏi Firestore
export async function deleteEmployeeFromFirestore(empId: string) {
  try {
    await deleteDoc(doc(db, "employees", empId));
    await deleteDoc(doc(db, "contracts", empId));
  } catch (err) {
    console.error("Lỗi xóa nhân viên:", err);
    throw err;
  }
}

// Lưu hợp đồng vào Firestore
export async function saveContractToFirestore(contract: ContractItem) {
  try {
    await setDoc(doc(db, "contracts", contract.empId), contract, { merge: true });
    // Cập nhật lại trạng thái hợp đồng trong employee
    await setDoc(doc(db, "employees", contract.empId), {
      contract: {
        number: contract.ctNumber || contract.tvNumber || "",
        status: contract.status || "Đã ký",
        driveFileUrl: contract.driveFileUrl || "",
        fileName: contract.fileName || ""
      },
      ktCheck: contract.ktCheck || contract.status || ""
    }, { merge: true });
  } catch (err) {
    console.error("Lỗi lưu hợp đồng:", err);
    throw err;
  }
}

// Tải file hợp đồng scan trực tiếp lên Firestore (100% Miễn Phí, Hỗ trợ cả file lớn chia chunks)
export async function uploadContractFileToFirestore(
  empId: string,
  file: File,
  onProgress?: (msg: string) => void
): Promise<string> {
  onProgress?.(`Đang đọc file [${file.name}]...`);
  
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
  reader.readAsDataURL(file);
  const dataUrl = await base64Promise;

  onProgress?.("Đang lưu trữ vào Cloud Firestore...");

  // File <= 800KB: Lưu trực tiếp trong document
  if (file.size <= 800 * 1024) {
    await setDoc(doc(db, "contracts", empId), {
      driveFileUrl: dataUrl,
      fileData: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "application/pdf",
      hasChunks: false,
      uploadedAt: new Date().toISOString()
    }, { merge: true });

    await setDoc(doc(db, "employees", empId), {
      contract: {
        driveFileUrl: dataUrl,
        fileName: file.name
      }
    }, { merge: true });

    return dataUrl;
  } else {
    // File > 800KB: Tự động chia nhỏ chunks lưu subcollection (hỗ trợ file scan lên tới 10MB)
    const CHUNK_SIZE = 500 * 1024;
    const totalChunks = Math.ceil(dataUrl.length / CHUNK_SIZE);
    const batch = writeBatch(db);

    for (let i = 0; i < totalChunks; i++) {
      const chunkStr = dataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkRef = doc(db, "contracts", empId, "file_chunks", `c_${String(i).padStart(4, "0")}`);
      batch.set(chunkRef, { index: i, data: chunkStr });
    }
    await batch.commit();

    const refUrl = `firestore:${empId}`;
    await setDoc(doc(db, "contracts", empId), {
      driveFileUrl: refUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "application/pdf",
      hasChunks: true,
      totalChunks,
      uploadedAt: new Date().toISOString()
    }, { merge: true });

    await setDoc(doc(db, "employees", empId), {
      contract: {
        driveFileUrl: refUrl,
        fileName: file.name
      }
    }, { merge: true });

    return refUrl;
  }
}

// Mở xem file hợp đồng scan
export async function openContractFile(contract: ContractItem) {
  let url = contract.driveFileUrl || contract.fileData || "";
  const fileName = contract.fileName || `${contract.empId}_HopDong.pdf`;

  if (!url) {
    alert("Nhân viên này chưa có file scan hợp đồng nào được lưu!");
    return;
  }

  // Nếu file được chia chunks
  if (url.startsWith("firestore:")) {
    try {
      const q = query(
        collection(db, "contracts", contract.empId, "file_chunks"),
        orderBy("index")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        let fullData = "";
        snap.forEach(d => {
          fullData += d.data().data || "";
        });
        openDataUrlInTab(fullData, fileName);
        return;
      }
    } catch (e: unknown) {
      alert("Không thể tải file hợp đồng từ Cloud: " + (e instanceof Error ? e.message : String(e)));
      return;
    }
  }

  if (url.startsWith("data:")) {
    openDataUrlInTab(url, fileName);
    return;
  }

  // URL thông thường
  window.open(url, "_blank");
}

function openDataUrlInTab(dataUrl: string, fileName: string) {
  try {
    const parts = dataUrl.split(";base64,");
    const contentType = parts[0].replace("data:", "") || "application/pdf";
    const byteCharacters = atob(parts[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);
    const w = window.open(blobUrl, "_blank");
    if (!w) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error("Lỗi hiển thị file:", err);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
