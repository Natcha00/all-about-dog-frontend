// src/lib/swimming/swimming.logic.ts
import type { SwimPet, SwimPriceConfig, SwimPricing } from "./types";

export const DEFAULT_SWIM_PRICE: SwimPriceConfig = {
  small: 450,
  large: 550,
  vipSurcharge: 200, // ปรับได้
};

export function calcSwimPricing(args: {
  pets: SwimPet[];
  isVip: boolean;
  price?: SwimPriceConfig;
}): SwimPricing {
  const price = args.price ?? DEFAULT_SWIM_PRICE;
  const pets = args.pets ?? [];

  const lines: SwimPricing["lines"] = [];

  const smallCount = pets.filter((p) => p.size === "small").length;
  const largeCount = pets.filter((p) => p.size === "large").length;

  if (smallCount > 0) {
    lines.push({
      label: `สุนัขขนาดเล็ก ${smallCount} ตัว x ${price.small.toLocaleString()} บาท`,
      amount: smallCount * price.small,
    });
  }

  if (largeCount > 0) {
    lines.push({
      label: `สุนัขขนาดใหญ่ ${largeCount} ตัว x ${price.large.toLocaleString()} บาท`,
      amount: largeCount * price.large,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);

  if (args.isVip) {
    lines.push({
      label: `ค่าบริการ VIP`,
      amount: price.vipSurcharge,
    });
  }

  const total = subtotal + (args.isVip ? price.vipSurcharge : 0);

  return {
    lines,
    subtotal,
    total,
  };
}
