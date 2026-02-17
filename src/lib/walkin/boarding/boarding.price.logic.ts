// src/lib/boarding/boarding.price.logic.ts

import { PetPicked } from "../walkin/types.mock";

export type Plan = 1 | 2 | 3;

export type BoardingPriceConfig = {
  PLAN1: { SMALL: number; LARGE: number };
  PLAN2: {
    SMALL: { first: number; additional: number };
    LARGE: { first: number; additional: number };
  };
  PLAN3: { VIP: { first: number; additional: number } };
};

export const DEFAULT_BOARDING_PRICE: BoardingPriceConfig = {
  PLAN1: { SMALL: 450, LARGE: 600 },
  PLAN2: {
    SMALL: { first: 450, additional: 380 },
    LARGE: { first: 600, additional: 510 },
  },
  PLAN3: { VIP: { first: 1500, additional: 500 } },
};

export function calcBoardingTotal(params: {
  pets: PetPicked[];
  plan: Plan;
  nights: number;
  price?: BoardingPriceConfig;
}): { perNight: number; total: number } {
  const { pets, plan } = params;
  const price = params.price ?? DEFAULT_BOARDING_PRICE;
  const nights = Math.max(1, Math.floor(params.nights || 0));

  if (!pets?.length) return { perNight: 0, total: 0 };

  const small = pets.filter((p) => p.size === "small").length;
  const large = pets.filter((p) => p.size === "large").length;

  // ✅ Plan 3: VIP (รวมทุกตัว)
  if (plan === 3) {
    const count = pets.length;
    const perNight =
      price.PLAN3.VIP.first + Math.max(0, count - 1) * price.PLAN3.VIP.additional;
    return { perNight, total: perNight * nights };
  }

  // ✅ Plan 1: มาตรฐาน (1 ตัว/ห้อง)
  if (plan === 1) {
    const perNight = small * price.PLAN1.SMALL + large * price.PLAN1.LARGE;
    return { perNight, total: perNight * nights };
  }

  // ✅ Plan 2: นอนด้วยกัน (คิดตัวแรก + ตัวถัดไป) แยกตามไซส์
  let perNight = 0;

  if (small > 0) {
    perNight +=
      price.PLAN2.SMALL.first + Math.max(0, small - 1) * price.PLAN2.SMALL.additional;
  }

  if (large > 0) {
    perNight +=
      price.PLAN2.LARGE.first + Math.max(0, large - 1) * price.PLAN2.LARGE.additional;
  }

  return { perNight, total: perNight * nights };
}
