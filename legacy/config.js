/**
 * =========================================================================
 * CẤU HÌNH BIẾN MÔI TRƯỜNG & DỊCH VỤ CLOUD - CÔNG TY CỔ PHẦN MF14
 * =========================================================================
 * 
 * HỆ THỐNG ĐỒNG BỘ 2 CHIỀU THỜI GIAN THỰC QUA FIREBASE CLOUD (FIRESTORE & STORAGE):
 * 1. Vào https://console.firebase.google.com/ tạo project (VD: hrm-mf14)
 * 2. Bật Firestore Database & Storage (chọn Test mode)
 * 3. Vào Project Settings -> Lấy firebaseConfig và dán vào bên dưới:
 */

window.APP_ENV = {
  // Cấu hình Firebase Cloud (Firestore Database + Firebase Storage lưu hợp đồng):
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyA2SgXmnXEoz05AqFK8tk96t8mbE5uFick",
    authDomain: "hrm-mf14.firebaseapp.com",
    projectId: "hrm-mf14",
    storageBucket: "hrm-mf14.firebasestorage.app",
    messagingSenderId: "220230180928",
    appId: "1:220230180928:web:d14afee5fc94f28c73bfa5",
    measurementId: "G-D3PNS5D329"
  },

  // Cấu hình Google Spreadsheet ID (nếu cần xuất báo cáo)
  GOOGLE_SHEET_ID: "1g-5OPngL2RuGu44C0kbmzP7d9p28UsUy0KZ4t5pny9I",

  // Google Drive Folder ID
  GOOGLE_DRIVE_FOLDER_ID: "1N2_STeZOdgR9_ka_xjZJdoEQhgUWlzX1",

  // URL Google Apps Script Web App (Tải thẳng file vào Google Drive tự động)
  APPS_SCRIPT_URL: ""
};
