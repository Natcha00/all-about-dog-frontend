/**
 * ข้อมูลบัญชีรับโอน — แสดงหน้ารายละเอียดการจองเมื่อสถานะ "รอชำระเงิน" (waiting_slip)
 * แก้ค่าตรงนี้ให้ตรงบัญชีร้านจริง
 */
export const BANK_TRANSFER_FOR_BOOKING = {
  bankName: "ธนาคารกสิกรไทย",
  accountNumber: "000-0-00000-0",
  accountHolder: "All About Dog",
} as const;
