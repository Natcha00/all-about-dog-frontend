"use client";

import { CircleAdd, CircleItemProps, CircleProfiles } from "@/components/ui/circleProfile";

interface MyDogsGridProps {
  dogs: CircleItemProps[];
}

export default function MyDogsGrid({ dogs }: MyDogsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 place-items-center">
      <div className="w-28 text-center">
        <CircleAdd />
      </div>
      {dogs.map((dog) => (
        <div key={dog.id} className="w-28 text-center">
          <CircleProfiles items={[dog]} />
        </div>
      ))}
    </div>
  );
}
