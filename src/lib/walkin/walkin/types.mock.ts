// src/app/staff/walkin/_mocks/types.mock.ts

export type CustomerDraft = {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

export type PetPicked = {
  id: number;
  name: string;
  size: "small" | "large";

  // ✅ เพิ่มเพื่อคิดราคาว่ายน้ำ
  breed?: string;       // ชื่อสายพันธุ์ (เช่น "ชิวาวา", "สุนัขไทย", "โกลเด้นรีทรีฟเวอร์")
  weightKg?: number;    // น้ำหนักเป็นตัวเลข (เช่น 6.5)
};


export type ServiceType = "boarding" | "swimming";

export type BoardingDraft = {
  serviceType: "boarding";
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  plan: 1 | 2 | 3;
  total: number;

  customerNote?: string; // ✅ หมายเหตุจากลูกค้า
};

export type SwimmingDraft = {
  serviceType: "swimming";
  date: string;
  time: string;
  isVip: boolean;
  ownerPlay: boolean;
  total: number;

  customerNote?: string; // ✅ หมายเหตุจากลูกค้า
};

export type BookingDraft = BoardingDraft | SwimmingDraft;

/* ================= MOCKS ================= */

export const EMPTY_CUSTOMER: CustomerDraft = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
};

// mock "ฐานข้อมูลลูกค้าเก่า"
export const MOCK_CUSTOMERS = [
  { id: "cus_1001", firstName: "พิม", lastName: "ใจดี", phone: "0890001111", email: "pim@example.com" },
  { id: "cus_1002", firstName: "โอม", lastName: "สายลุย", phone: "0812223333", email: "ohm@example.com" },
  { id: "cus_1003", firstName: "ฝน", lastName: "ยิ้มเก่ง", phone: "0957778888" },
] as const;

// mock "สุนัขของลูกค้า" (ทำเป็นหลายตัวเพื่อเทส multi-select)
// types.mock.ts
// src/lib/walkin/walkin/customer.mock.ts
/**
 * ✅ ฝั่งลูกค้า: สมมติว่า login แล้ว → เรามีหมาของ user อยู่แล้ว
 * ใช้แทน MOCK_PETS_BY_CUSTOMER ที่ผูกกับ customerId แบบ staff
 */
export const MOCK_MY_PETS: PetPicked[] = [
  { id: 101, name: "อังเปา", size: "small", breed: "ชิวาวา", weightKg: 2.3 },
  { id: 102, name: "อัลมอนด์", size: "large", breed: "โกลเด้นรีทรีฟเวอร์", weightKg: 28 },
  { id: 103, name: "ดำ", size: "large", breed: "สุนัขไทย", weightKg: 18 },
];


