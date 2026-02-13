"use client";

import React from "react";
import SlotCard, { Slot } from "./SlotCard";

type Props = {
  slots: Slot[];
  selectedTime: string;
  isVip: boolean;
  onSelectTime: (time: string) => void;
};

export default function SlotsGrid({ slots, selectedTime, isVip, onSelectTime }: Props) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-8">
      {slots.map((slot) => {
        // ✅ กติกา VIP: เลือกได้เฉพาะ slot ที่ booked = 0
        const vipDisabled = isVip ? slot.booked !== 0 : false;

        return (
          <SlotCard
            key={slot.time}
            slot={slot}
            active={selectedTime === slot.time}
            disabled={vipDisabled}
            isVip={isVip}
            onSelect={onSelectTime}
          />
        );
      })}
    </div>
  );
}
