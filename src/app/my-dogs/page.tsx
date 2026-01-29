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
    <div className="min-h-screen overflow-y-auto">
      <div className="text-center text-2xl font-semibold m-4 text-gray-700">
        สัตว์เลี้ยงของฉัน
      </div>

      <div className="grid grid-cols-2 gap-8 place-items-center">
        <article className="w-28 text-center">
          <CircleAdd />
        </article>

        <CircleProfiles items={dogs} />
      </div>
    </div>
  );
}
