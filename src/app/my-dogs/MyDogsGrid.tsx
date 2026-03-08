"use client";

import { CircleAdd, CircleItemProps, CircleProfiles } from "@/components/ui/circleProfile";
import { Trash2 } from "lucide-react";

interface MyDogsGridProps {
  dogs: CircleItemProps[];
  onDelete?: (id: number) => void;
}

export default function MyDogsGrid({ dogs, onDelete }: MyDogsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 place-items-center">
      <div className="w-28 text-center">
        <CircleAdd />
      </div>
      {dogs.map((dog) => (
        <div key={dog.id} className="w-28 text-center relative group">
          <CircleProfiles items={[dog]} />
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(dog.id)}
              className="
                absolute top-0 right-0 p-1.5 rounded-full
                bg-red-100 text-red-600 hover:bg-red-200 active:scale-95
                transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
              "
              aria-label={`ลบ ${dog.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
