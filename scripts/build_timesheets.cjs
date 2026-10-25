const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xlsx'));
const allTimesheets = {};

function calculateTotals(days, daysInMonth, standardDays) {
  let xDays = 0;
  let halfDays = 0;
  let onlineDays = 0;
  let weekendWorkDays = 0;
  let paidLeaveDays = 0;
  let holidayDays = 0;
  let unpaidDays = 0;
  let totalPaidDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const rawVal = days[d];
    if (!rawVal) continue;
    const val = String(rawVal).trim();

    if (val === "X" || val === "x") {
      xDays += 1;
      totalPaidDays += 1;
    } else if (val === "N1") {
      halfDays += 1;
      totalPaidDays += 0.5;
    } else if (val === "On" || val === "ON" || val === "on") {
      onlineDays += 1;
      totalPaidDays += 1;
    } else if (val === "On/2" || val === "on/2") {
      onlineDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "P" || val === "p") {
      paidLeaveDays += 1;
      totalPaidDays += 1;
    } else if (val === "P1") {
      paidLeaveDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "C" || val === "c") {
      weekendWorkDays += 1;
      totalPaidDays += 1;
    } else if (val === "C/2" || val === "c/2") {
      weekendWorkDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "L" || val === "l") {
      holidayDays += 1;
      totalPaidDays += 1;
    } else if (val === "L1" || val === "L/2" || val === "l1") {
      holidayDays += 0.5;
      totalPaidDays += 0.5;
    } else if (val === "K" || val === "k" || val === "O" || val === "o") {
      unpaidDays += 1;
    }
  }

  return {
    xDays,
    halfDays,
    onlineDays,
    weekendWorkDays,
    paidLeaveDays,
    holidayDays,
    unpaidDays,
    totalPaidDays,
    standardDays
  };
}

for (const file of files) {
  try {
    let monthKey = '';
    const mMatch = file.match(/(?:tháng|Tháng|Bảng lương_)?\s*([0-9]{2})[._]([0-9]{4})/i);
    const mMatch2 = file.match(/_([0-9]{2})([0-9]{4})\.xlsx/);
    if (mMatch) {
      monthKey = mMatch[1] + '.' + mMatch[2];
    } else if (mMatch2) {
      monthKey = mMatch2[1] + '.' + mMatch2[2];
    } else {
      continue;
    }

    const filePath = path.join(dataDir, file);
    const wb = XLSX.readFile(filePath);
    const sheetName = wb.SheetNames.find(s => s.includes('CHẤM CÔNG') || s.includes('BẢNG CHẤM CÔNG'));
    if (!sheetName) continue;

    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    const [mStr, yStr] = monthKey.split('.');
    const mNum = parseInt(mStr, 10);
    const yNum = parseInt(yStr, 10);
    const daysInMonth = new Date(yNum, mNum, 0).getDate();

    if (!allTimesheets[monthKey]) {
      allTimesheets[monthKey] = {
        month: monthKey,
        year: yNum,
        monthNumber: mNum,
        daysInMonth,
        standardDays: 22,
        records: {}
      };
    }

    for (let r = 10; r < json.length; r++) {
      const row = json[r];
      if (!row || !row[1] || !String(row[1]).startsWith('MS')) continue;
      const empId = String(row[1]).trim();
      const days = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const val = row[6 + d];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          days[d] = String(val).trim();
        }
      }
      if (!allTimesheets[monthKey].records[empId]) {
        const totals = calculateTotals(days, daysInMonth, 22);
        allTimesheets[monthKey].records[empId] = {
          empId,
          name: String(row[5] || '').trim(),
          dept: String(row[2] || '').trim(),
          position: String(row[3] || '').trim(),
          days,
          ...totals
        };
      }
    }
  } catch(e) {
    console.error('Error parsing', file, e.message);
  }
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'initialTimesheets.ts');
const fileContent = `// Auto-generated historical timesheets from data/ Excel files
import type { MonthlyTimesheet } from "../types";

export const INITIAL_TIMESHEETS: Record<string, MonthlyTimesheet> = ${JSON.stringify(allTimesheets, null, 2)};
`;

fs.writeFileSync(outPath, fileContent, 'utf8');
console.log('Successfully generated complete timesheets:', outPath);
