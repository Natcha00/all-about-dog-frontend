export type PetSizeParam = "small" | "large";
export type PetParam = { id: number; size: PetSizeParam };

export function encodePetsParam(pets: PetParam[]) {
  // 1:large,2:small
  return pets.map((p) => `${p.id}:${p.size}`).join(",");
}

export function decodePetsParam(value: string | null | undefined): PetParam[] {
  if (!value) return [];

  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const [idRaw, sizeRaw] = token.split(":");
      const id = Number(idRaw);
      const size = sizeRaw === "small" ? "small" : sizeRaw === "large" ? "large" : null;
      if (!Number.isFinite(id) || id <= 0 || !size) return null;
      return { id, size };
    })
    .filter(Boolean) as PetParam[];
}
