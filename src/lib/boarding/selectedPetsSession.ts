// src/lib/boarding/selectedPetsSession.ts
// ✅ ใช้จริง: เก็บ “สัตว์ที่เลือก” ลง sessionStorage และอ่านกลับมา
// - ใช้ตอนกด “ต่อไป” จากหน้าเลือกสัตว์ (write)
// - ใช้ตอนหน้า calendar/summary/confirm (read)

export type PetSize = "small" | "large";

export type StoredSelectedPet = {
  id: number;
  name: string;
  image: string;
  size: PetSize;
};

const KEY = "selectedPets";

/** ทำ path รูปให้ถูกกับ Next.js
 * - "public/images/a.jpg" -> "/images/a.jpg"
 * - "images/a.jpg" -> "/images/a.jpg"
 * - "/images/a.jpg" -> "/images/a.jpg"
 */
function normalizeImagePath(src: unknown): string {
  const s = String(src ?? "").trim();
  if (!s) return "";

  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // กันคนเผลอใส่ "public/..."
  if (s.startsWith("public/")) return "/" + s.replace(/^public\//, "");

  // ถ้าเป็น "images/xxx" ให้เติม "/"
  if (!s.startsWith("/")) return "/" + s;

  return s;
}

function normalizeSize(size: unknown): PetSize | null {
  const s = String(size ?? "").toLowerCase().trim();
  if (s === "small") return "small";
  if (s === "large") return "large";
  return null;
}

/** ✅ เขียนลง sessionStorage */
export function writeSelectedPetsToSession(pets: unknown[]): void {
  if (typeof window === "undefined") return;

  const cleaned: StoredSelectedPet[] = (Array.isArray(pets) ? pets : [])
    .map((p: any) => {
      const id = Number(p?.id);
      const name = String(p?.name ?? "").trim();
      const image = normalizeImagePath(p?.image);
      const size = normalizeSize(p?.size);

      if (!Number.isFinite(id) || id <= 0) return null;
      if (!name) return null;
      if (!image) return null;
      if (!size) return null;

      return { id, name, image, size };
    })
    .filter(Boolean) as StoredSelectedPet[];

  // กัน id ซ้ำ (เอาตัวแรก)
  const seen = new Set<number>();
  const unique = cleaned.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));

  sessionStorage.setItem(KEY, JSON.stringify(unique));
}

/** ✅ อ่านจาก sessionStorage */
export function readSelectedPetsFromSession(): StoredSelectedPet[] {
  if (typeof window === "undefined") return [];

  const raw = sessionStorage.getItem(KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cleaned: StoredSelectedPet[] = parsed
      .map((p: any) => {
        const id = Number(p?.id);
        const name = String(p?.name ?? "").trim();
        const image = normalizeImagePath(p?.image);
        const size = normalizeSize(p?.size);

        if (!Number.isFinite(id) || id <= 0) return null;
        if (!name) return null;
        if (!image) return null;
        if (!size) return null;

        return { id, name, image, size };
      })
      .filter(Boolean) as StoredSelectedPet[];

    // กัน id ซ้ำ
    const seen = new Set<number>();
    return cleaned.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  } catch {
    return [];
  }
}

/** ✅ ล้าง sessionStorage (เผื่อใช้ตอนกดย้อนกลับ/เริ่มใหม่) */
export function clearSelectedPetsSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/** ✅ helper: เอาเฉพาะตัวที่อยู่ใน query petIds */
export function filterSelectedPetsByIds(
  pets: StoredSelectedPet[],
  petIds: number[]
): StoredSelectedPet[] {
  const set = new Set(petIds.filter((n) => Number.isFinite(n) && n > 0));
  return pets.filter((p) => set.has(p.id));
}
