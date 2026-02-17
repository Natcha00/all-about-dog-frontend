export type ServiceKey = "swimming" | "boarding";

export type RuleLine =
  | { type: "text"; text: string }
  | { type: "bullet"; text: string }
  | { type: "number"; text: string };

export type PriceGroup = {
  priceLabel: string;      // เช่น "450 บาท"
  description?: string;    // เช่น "สุนัขไทยน้ำหนัก < 20 kg"
  breeds?: string[];       // list สายพันธุ์
};

export type ServiceRulesDTO = {
  key: ServiceKey;
  title: string;
  intro: string[];
  highlights: string[];      // bullet
  pricingTitle?: string;
  pricingNote?: string;
  priceGroups?: PriceGroup[];
  extraNotes?: string[];     // bullet
  conditionsTitle?: string;
  conditions: RuleLine[];    // bullet/number/text
};

// ✅ mock เหมือน backend response
export const MOCK_SERVICE_RULES: Record<ServiceKey, ServiceRulesDTO> = {
  swimming: {
    key: "swimming",
    title: "สระว่ายน้ำ",
    intro: [
      "สระว่ายน้ำระบบเกลือมาตรฐาน 8×3 เมตร ว่ายได้ทั้งสุนัขและเจ้าของ",
      "ให้บริการเป็นรอบ รอบละ 1 ชั่วโมง",
    ],
    highlights: [
      "เปิดให้บริการวันอังคารถึงวันอาทิตย์ (หยุดเฉพาะวันจันทร์) เวลา 10:00–19:00 น.",
      "จำกัดจำนวนไม่เกิน 5 ตัว/รอบ",
      "VIP เหมารอบไม่มีค่ายบริการเพิ่ม แต่ต้องเป็นรอบที่ว่างสนิท",
    ],
    pricingTitle: "อัตราค่าบริการ",
    pricingNote: "ราคาว่ายน้ำเริ่มต้นที่ 450 บาท ขึ้นกับน้ำหนักและขนาดสายพันธุ์",
    priceGroups: [
      {
        priceLabel: "450 บาท",
        breeds: ["ชิวาวา", "มอลทีส", "พุดเดิ้ลทอยส์", "ปักกิ่ง", "ชิสุห์", "ยอร์คเชีย เทอร์เรีย"],
      },
      {
        priceLabel: "500 บาท",
        description: "สุนัขไทยที่น้ำหนักน้อยกว่า 20 kg",
        breeds: ["เวสตี้", "คอร์กี้", "บีเกิ้ล", "ดัชชุน", "บิ๊ก เกรยฮาวด์"],
      },
      {
        priceLabel: "550 บาท",
        description: "สุนัขไทยที่น้ำหนักมากกว่า 20 kg",
        breeds: ["ชิบะ", "อิงลิชคอกเกอร์", "บ็อกเซอร์", "บลูเทอร์เรีย"],
      },
      {
        priceLabel: "600 บาท",
        breeds: ["พิทบลูเทอร์เรีย", "ร็อตไวเลอร์", "ลาบลาดอร์", "โดเบอร์แมน"],
      },
      {
        priceLabel: "650 บาท",
        breeds: ["อาคิตะอินุ", "เยอรมันเชพเพิร์ด", "โกลเด้นรีทรีฟเวอร์", "ไจแอนท์ชเนาเซอร์"],
      },
      {
        priceLabel: "850 บาท",
        breeds: ["เชาว์เชาว์", "ซามอยด์", "ไซบีเรียน ฮัสกี้"],
      },
      {
        priceLabel: "950 บาท",
        breeds: ["ไซบีเรียน ฮัสกี้(วูล์ฟโค้ด)", "เกรดเดน", "อิงลิช บูลมาสทิฟ"],
      },
      {
        priceLabel: "1,000 บาท",
        breeds: ["อลาสกัน มาลามิวท์", "เซนต์เบอร์นาร์ด", "คอเคเซียน"],
      },
    ],
    extraNotes: [],
    conditionsTitle: "ข้อกำหนดการให้บริการ",
    conditions: [
      { type: "number", text: "กรุณาจองรอบล่วงหน้า และมาก่อนเวลา 10 นาทีเพื่อเตรียมตัว" },
      { type: "number", text: "น้องหมาต้องไม่มีโรคติดต่อ และไม่อยู่ช่วงติดสัด" },
      { type: "number", text: "ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้" },
      { type: "number", text: "กรณีผลัดขนหนัก อาจมีค่าทำความสะอาดเพิ่ม 200+ บาท" },
    ],
  },

  boarding: {
    key: "boarding",
    title: "บริการรับฝากเลี้ยง",
    intro: ["โรงแรมของเรามีห้องพัก 3 ประเภท"],
    highlights: [
      "มี 3 สนามใหญ่ ปล่อยวิ่ง 4–5 รอบ/วัน",
      "มีกล้องให้ดูตามห้องพักของน้อง",
    ],
    pricingTitle: "ประเภทห้องและราคา",
    pricingNote: "ราคาค่าฝากคิดเป็นคืน",
    priceGroups: [
      {
        priceLabel: "ตึกหมาใหญ่ (9 ห้อง)",
        description: "สำหรับหมาไซส์กลาง–ใหญ่ (คอกสูง 1.5 ม.)",
        breeds: ["คืนละ 600/ห้อง", "ตัวที่ 2 นอนด้วยกัน ตัวละ 510 ต่อคืน"],
      },
      {
        priceLabel: "ตึกหมาเล็ก (13 ห้อง)",
        description: "สำหรับไซส์เล็ก (คอกสูง 1 ม.)",
        breeds: ["คืนละ 450 บาท/ห้อง", "ตัวที่ 2 นอนด้วยกัน ตัวละ 380 ต่อคืน"],
      },
      {
        priceLabel: "ห้อง VIP (1 ห้อง)",
        description: "ไซส์ 12 ตร.ม. สำหรับน้องที่มาบ้านเดียวกัน นอนบ้านเดียว",
        breeds: ["ตัวแรก 1500", "ตัวต่อไปตัวละ 500"],
      },
    ],
    extraNotes: [],
    conditionsTitle: "ข้อกำหนดการให้บริการ",
    conditions: [
      {
        type: "number",
        text: "เจ้าของสามารถ check-in ตั้งแต่ 8:00 น. เป็นต้นไป และ check-out ไม่เกิน 18:00 น. (หลัง 18:00 น. คิดค่ารับฝากชั่วโมงละ 50 บาท)",
      },
      {
        type: "number",
        text: "ค่าบริการไม่รวมอาหาร กรุณานำอาหารของน้องมาเอง รวมถึงสายจูงและเบาะนอน",
      },
      {
        type: "number",
        text: "ต้องไม่มีเห็บหมัด ต้องแสดงหลักฐานการฉีดวัคซีน และไม่ดุร้ายจนควบคุมไม่ได้",
      },
    ],
  },
};

// ✅ mock fetch (รอ backend)
export async function fetchServiceRules(): Promise<Record<ServiceKey, ServiceRulesDTO>> {
  return MOCK_SERVICE_RULES;
}
