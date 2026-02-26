// src/lib/boarding/boardingLogic.ts
export type Plan = 1 | 2 | 3;

export type RoomType = "SMALL" | "LARGE" | "VIP";

export type Pet = {
  id: number;
  name?: string;
  size: "small" | "large";
  canShare?: boolean;
};

export type RoomAssignment = {
  roomType: RoomType;
  roomNo: number;
  petIds: number[];
};

export type RoomCounts = { SMALL: number; LARGE: number; VIP: number };

export type Pricing = {
  roomCosts: { label: string; perNight: number }[];
  perNight: number;
  total: number;
};

export type PriceConfig = {
  PLAN1: { SMALL: number; LARGE: number; VIP: number };
  PLAN2: {
    SMALL: { first: number; additional: number };
    LARGE: { first: number; additional: number };
  };
  PLAN3: { VIP: { first: number; additional: number } };
};

export const DEFAULT_PRICE: PriceConfig = {
  PLAN1: { SMALL: 450, LARGE: 600, VIP: 1500 },
  PLAN2: {
    SMALL: { first: 450, additional: 380 },
    LARGE: { first: 600, additional: 510 },
  },
  PLAN3: { VIP: { first: 1500, additional: 500 } },
};

export function getPlanLabel(plan: Plan) {
  if (plan === 1) return "แบบ 1 : มาตรฐาน";
  if (plan === 2) return "แบบ 2 : นอนด้วยกัน";
  return "แบบ 3 : VIP บ้านเดี่ยว";
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** ✅ ตัวไหนอยู่ห้องไหน (Summary/Confirm ใช้อันเดียวกัน) */
export function allocateAssignments(pets: Pet[], plan: Plan): RoomAssignment[] {
  const smallPets = pets.filter((p) => p.size === "small");
  const largePets = pets.filter((p) => p.size === "large");

  // Plan 1: 1 ตัว/ห้อง
  if (plan === 1) {
    const rooms: RoomAssignment[] = [];
    smallPets.forEach((p, idx) =>
      rooms.push({ roomType: "SMALL", roomNo: idx + 1, petIds: [p.id] })
    );
    largePets.forEach((p, idx) =>
      rooms.push({ roomType: "LARGE", roomNo: idx + 1, petIds: [p.id] })
    );
    return rooms;
  }

  // Plan 2: รวมตามขนาด (small 3 ตัว/ห้อง, large 2 ตัว/ห้อง)
  if (plan === 2) {
    const rooms: RoomAssignment[] = [];
    chunk(smallPets, 3).forEach((g, idx) =>
      rooms.push({ roomType: "SMALL", roomNo: idx + 1, petIds: g.map((x) => x.id) })
    );
    chunk(largePets, 2).forEach((g, idx) =>
      rooms.push({ roomType: "LARGE", roomNo: idx + 1, petIds: g.map((x) => x.id) })
    );
    return rooms;
  }

  // Plan 3: VIP 1 หลัง รวมทั้งหมด
  return pets.length ? [{ roomType: "VIP", roomNo: 1, petIds: pets.map((p) => p.id) }] : [];
}

/** ✅ นับจำนวนห้องจาก assignments */
export function countRooms(assignments: RoomAssignment[]): RoomCounts {
  return {
    SMALL: assignments.filter((r) => r.roomType === "SMALL").length,
    LARGE: assignments.filter((r) => r.roomType === "LARGE").length,
    VIP: assignments.filter((r) => r.roomType === "VIP").length,
  };
}

// src/lib/boarding/boarding.logic.ts
export function formatThaiDateTime(date: string, time: string) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  const ddmmyyyy = `${d}/${m}/${y}`;
  return time ? `${ddmmyyyy} ${time}` : ddmmyyyy;
}


/** ✅ คำนวณราคา (Summary/Confirm ใช้อันเดียวกัน) */
export function calcPricing(params: {
  plan: Plan;
  nights: number;
  assignments: RoomAssignment[];
  price?: PriceConfig;
}): Pricing {
  const n = Math.max(1, params.nights);
  const { plan, assignments } = params;
  const price = params.price ?? DEFAULT_PRICE;

  // PLAN 1: คิดต่อห้อง/คืน
  if (plan === 1) {
    const rooms = countRooms(assignments);
    const roomCosts = [
      ...(rooms.SMALL > 0
        ? [{ label: `ตึกหมาเล็ก (${rooms.SMALL} ห้อง)`, perNight: rooms.SMALL * price.PLAN1.SMALL }]
        : []),
      ...(rooms.LARGE > 0
        ? [{ label: `ตึกหมาใหญ่ (${rooms.LARGE} ห้อง)`, perNight: rooms.LARGE * price.PLAN1.LARGE }]
        : []),
      ...(rooms.VIP > 0
        ? [{ label: `VIP (${rooms.VIP} ห้อง)`, perNight: rooms.VIP * price.PLAN1.VIP }]
        : []),
    ];
    const perNight = roomCosts.reduce((s, x) => s + x.perNight, 0);
    return { roomCosts, perNight, total: perNight * n };
  }

  // PLAN 3: VIP บ้านเดี่ยว (คิดตามจำนวนตัวในบ้าน)
  if (plan === 3) {
    const vip = assignments.find((r) => r.roomType === "VIP");
    const count = vip?.petIds.length ?? 0;

    const perNight =
      count <= 0
        ? 0
        : price.PLAN3.VIP.first + Math.max(0, count - 1) * price.PLAN3.VIP.additional;

    const roomCosts = count > 0 ? [{ label: `VIP 1 (${count} ตัว)`, perNight }] : [];
    return { roomCosts, perNight, total: perNight * n };
  }

  // PLAN 2: นอนด้วยกัน (คิดตามจำนวนตัวในห้อง)
  let perNight = 0;
  const roomCosts: { label: string; perNight: number }[] = [];

  for (const r of assignments) {
    const count = r.petIds.length;
    if (count <= 0) continue;

    if (r.roomType === "SMALL") {
      const cost =
        price.PLAN2.SMALL.first + Math.max(0, count - 1) * price.PLAN2.SMALL.additional;
      perNight += cost;
      roomCosts.push({ label: `ห้องเล็ก ${r.roomNo} (${count} ตัว)`, perNight: cost });
    }

    if (r.roomType === "LARGE") {
      const cost =
        price.PLAN2.LARGE.first + Math.max(0, count - 1) * price.PLAN2.LARGE.additional;
      perNight += cost;
      roomCosts.push({ label: `ห้องใหญ่ ${r.roomNo} (${count} ตัว)`, perNight: cost });
    }
  }

  return { roomCosts, perNight, total: perNight * n };
}
