/**
 * Định dạng số tiền kiểu Việt Nam:
 * - Dùng dấu chấm "." để phân cách hàng nghìn
 * - Làm tròn số nguyên (không lấy số thập phân)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toLocaleString("vi-VN");
}

/**
 * Định dạng số lượng người hoặc ngày công
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Math.round(Number(value)).toLocaleString("vi-VN");
}
