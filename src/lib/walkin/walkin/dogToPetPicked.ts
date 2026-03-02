import type { DogApiItem } from "@/lib/dogs/dog.type";
import type { PetPicked } from "./types.mock";

/**
 * Map backend GET /dog item to walkin PICK MODE shape (PetPicked).
 */
export function mapDogApiItemToPetPicked(item: DogApiItem): PetPicked {
  const size = item.breed?.size === "large" ? "large" : "small";
  return {
    id: item.id,
    name: item.name,
    size: size as "small" | "large",
    breed: item.breed?.nameTh ?? item.breed?.nameEng ?? null,
    weightKg: item.weight ?? null,
  };
}

export function mapDogApiListToPetPicked(items: DogApiItem[]): PetPicked[] {
  return items.map(mapDogApiItemToPetPicked);
}
