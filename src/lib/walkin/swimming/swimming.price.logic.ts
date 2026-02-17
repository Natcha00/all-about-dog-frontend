// src/lib/swimming/swimming.price.logic.ts

export type SwimPetInfo = {
    breed?: string;
    weightKg?: number;
  };
  
  export type DogSize = "small" | "large";
  
  // ✅ ตารางราคา “ตามรูป/ข้อความคุณ”
  export const PRICE_TABLE: Array<{
    price: number;
    size: DogSize;
    breeds: string[];
  }> = [
    {
      price: 450,
      size: "small",
      breeds: [
        "ชิวาวา",
        "มอลทีส",
        "พุดเดิ้ลทอยส์",
        "ปักกิ่ง",
        "ชิสุห์",
        "ยอร์คเชีย เทอร์เรีย",
      ],
    },
    {
      price: 500,
      size: "large",
      breeds: ["เวสตี้", "คอร์กี้", "บีเกิ้ล", "ดัชชุน", "บิ๊ก เกรยฮาวด์"],
    },
    {
      price: 550,
      size: "large",
      breeds: ["ชิบะ", "อิงลิชคอกเกอร์", "บ็อกเซอร์", "บลูเทอร์เรีย"],
    },
    {
      price: 600,
      size: "large",
      breeds: ["พิทบลูเทอร์เรีย", "ร็อตไวเลอร์", "ลาบลาดอร์", "โดเบอร์แมน"],
    },
    {
      price: 650,
      size: "large",
      breeds: [
        "อาคิตะอินุ",
        "เยอรมันเชพเพิร์ด",
        "โกลเด้นรีทรีฟเวอร์",
        "ไจแอนท์ชเนาเซอร์",
      ],
    },
    {
      price: 850,
      size: "large",
      breeds: ["เชาว์เชาว์", "ซามอยด์", "ไซบีเรียน ฮัสกี้"],
    },
    {
      price: 950,
      size: "large",
      breeds: ["ไซบีเรียน ฮัสกี้ (วูล์ฟโค้ด)", "เกรทเดน", "อิงลิช บูลมาสทิฟ"],
    },
    {
      price: 1000,
      size: "large",
      breeds: ["อลาสกัน มาลามิวท์", "เซนต์เบอร์นาร์ด", "คอเคเซียน"],
    },
  ];
  
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  
  // ✅ map กลางตัวเดียวพอ (มีทั้ง price + size)
  export const BREED_META = new Map<string, { price: number; size: DogSize }>();
  
  for (const row of PRICE_TABLE) {
    for (const b of row.breeds) {
      BREED_META.set(normalize(b), { price: row.price, size: row.size });
    }
  }
  
  // ✅ helper: ดึง meta ของพันธุ์
  export function getBreedMeta(breed?: string) {
    if (!breed) return null;
    return BREED_META.get(normalize(breed)) ?? null;
  }
  
  // ✅ size สำหรับ “จองห้อง” (ถ้าไม่เจอ → small)
  export function getDogSizeFromBreed(breed?: string, weightKg?: number): DogSize {
    const b = (breed ?? "").trim();
  
    // ✅ สุนัขไทย: ตัดสินจากน้ำหนัก (สมเหตุสมผลกับ requirement เดิม)
    if (normalize(b) === normalize("สุนัขไทย")) {
      if (typeof weightKg === "number" && Number.isFinite(weightKg)) {
        return weightKg < 20 ? "large" : "large"; // สุนัขไทยคุณถือว่าไปโซนใหญ่ทั้งหมดก็ได้
        // ถ้าคุณอยากให้ <20 เป็น small ก็เปลี่ยนเป็น:
        // return weightKg < 20 ? "small" : "large";
      }
      return "large";
    }
  
    const meta = getBreedMeta(b);
    return meta?.size ?? "small";
  }
  
  // ✅ ราคา “ต่อ 1 ตัว” สำหรับ “ว่ายน้ำ”
  export function swimPricePerDog(pet: SwimPetInfo): number {
    const breed = (pet.breed ?? "").trim();
    const w = pet.weightKg;
  
    // 1) สุนัขไทย: ตัดด้วยน้ำหนัก (ตามสเปคคุณ)
    if (normalize(breed) === normalize("สุนัขไทย")) {
      if (typeof w === "number" && Number.isFinite(w)) {
        return w < 20 ? 500 : 550;
      }
      return 450; // ไม่รู้ weight → เริ่มต้น
    }
  
    // 2) สายพันธุ์อื่น: lookup ตามตาราง
    const meta = getBreedMeta(breed);
    if (meta) return meta.price;
  
    // 3) ไม่เจอพันธุ์: fallback
    return 450;
  }
  
  // ✅ ราคารวม (VIP ไม่บวกเพิ่ม)
  export function swimTotalPrice(pets: SwimPetInfo[]): number {
    return (pets ?? []).reduce((sum, p) => sum + swimPricePerDog(p), 0);
  }
  
  // ✅ เหมือน backend ส่งรายการพันธุ์ (unique + sort)
  export function mockFetchSwimBreeds(): Promise<string[]> {
    const all = PRICE_TABLE.flatMap((r) => r.breeds);
    const unique = Array.from(new Set(all));
    unique.sort((a, b) => a.localeCompare(b, "th"));
    // ถ้าอยากให้มี "สุนัขไทย" ใน dropdown ด้วย:
    // if (!unique.includes("สุนัขไทย")) unique.unshift("สุนัขไทย");
    return Promise.resolve(unique);
  }
  