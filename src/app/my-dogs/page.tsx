"use client";

import React, { useState } from "react";
import { CircleAdd, CircleItemProps, CircleProfiles } from "@/components/ui/circleProfile";

const listDog: CircleItemProps[] = [
  { id: 1, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria ferguson" },
  { id: 2, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria ferguson" },
  { id: 3, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria ferguson" },
  { id: 4, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
  { id: 5, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria ferguson" },
  { id: 6, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
  { id: 7, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
  { id: 8, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
  { id: 9, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
  { id: 10, image: "https://www.course-api.com/images/people/person-1.jpeg", name: "maria fergusonnnnnnnnnnnn" },
];

export default function MyPets() {
  const [dogs] = useState<CircleItemProps[]>(listDog);

  return (
    <div className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      
      <h1 className="text-center text-2xl font-extrabold text-gray-900 mb-6">
        สัตว์เลี้ยงของฉัน
      </h1>

      <div className="grid grid-cols-2 gap-6 place-items-center">
        
        {/* Add Button */}
        <div className="w-28 text-center">
          <CircleAdd />
        </div>

        {/* Dogs */}
        {dogs.map((dog) => (
          <div key={dog.id} className="w-28 text-center">
            <CircleProfiles items={[dog]} />
          </div>
        ))}

      </div>
    </div>
  );
}

