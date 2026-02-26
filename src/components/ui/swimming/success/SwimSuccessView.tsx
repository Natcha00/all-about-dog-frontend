"use client";

import SwimSuccessCard from "./SwimSuccessCard";

export default function SwimSuccessView(props: {
  bookingNo: string;
  date: string;
  time: string;
  vip: boolean;
  ownerPlay: boolean;
  total: number;
  petIds: number[];
}) {
  const {
    bookingNo,
    date,
    time,
    vip,
    ownerPlay,
    total,
    petIds,
  } = props;

  return (
    <main className="bg-[#fff7ea] px-6 py-2">
      <div className="mx-auto w-full max-w-md">
        <div className="mt-6">
          <SwimSuccessCard
            bookingNo={bookingNo}
            date={date}
            time={time}
            vip={vip}
            ownerPlay={ownerPlay}
            total={total}
            petIds={petIds}
          />
        </div>
      </div>
    </main>
  );
}
