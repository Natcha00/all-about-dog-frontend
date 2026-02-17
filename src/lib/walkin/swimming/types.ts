// src/lib/swimming/types.ts

export type SwimPet = {
    id: number;
    name?: string;
    size: "small" | "large";
  };
  
  export type SwimPriceConfig = {
    small: number; // ราคา/ตัว/รอบ
    large: number; // ราคา/ตัว/รอบ
    vipSurcharge: number; // ค่าบวกเพิ่มแบบ VIP (ทั้งบิล)
  };
  
  export type SwimPricingLine = {
    label: string;
    amount: number;
  };
  
  export type SwimPricing = {
    lines: SwimPricingLine[];
    subtotal: number;
    total: number;
  };
  