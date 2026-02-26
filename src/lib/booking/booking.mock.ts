import type { Booking } from "./booking.types";

export const bookingMock: Booking[] = [
  {
    id: "RSV-20260001",
    status: "pending",
    serviceType: "boarding",
    pets: [
      {
        petId: 1,
        petName: "อัลมอนด์",
        petImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
      {
        petId: 8,
        petName: "ถั่วดำ",
        petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=60",
        petSize: "large",
      },
    ],
    startAt: "12/01/2569",
    endAt: "14/01/2569",
    price: 1200,
  },

  {
    id: "RSV-20260002",
    status: "WaitingSlip",
    serviceType: "swim",
    pets: [
      {
        petId: 2,
        petName: "โมจิ",
        petImage: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&auto=format&fit=crop&q=60",
        petSize: "large",
      },
      {
        petId: 9,
        petName: "ปุยฝ้าย",
        petImage: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
    ],
    startAt: "16/01/2569",
    slotLabel: "14:00 - 15:00",
    price: 500,
  },

  {
    id: "RSV-20260003",
    status: "slip_uploaded",
    serviceType: "boarding",
    pets: [
      {
        petId: 3,
        petName: "บ๊อบบี้",
        petImage: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
    ],
    startAt: "18/01/2569",
    endAt: "19/01/2569",
    price: 800,
    slipUrl: "/mock/slip.jpg",
  },

  {
    id: "RSV-20260004",
    status: "slip_verified",
    serviceType: "swim",
    pets: [
      {
        petId: 4,
        petName: "ชาเขียว",
        petImage: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
      {
        petId: 10,
        petName: "โซดา",
        petImage: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
      {
        petId: 11,
        petName: "โกโก้",
        petImage: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?w=600&auto=format&fit=crop&q=60",
        petSize: "large",
      },
    ],
    startAt: "20/01/2569",
    slotLabel: "10:00 - 11:00",
    price: 450,
    verifiedBy: "staff01",
    verifiedAt: "19/01/2569 18:20",
  },

  {
    id: "RSV-20260005",
    status: "check-in",
    serviceType: "boarding",
    pets: [
      {
        petId: 5,
        petName: "คุ้กกี้",
        petImage: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?w=600&auto=format&fit=crop&q=60",
        petSize: "large",
      },
      {
        petId: 12,
        petName: "บัวลอย",
        petImage: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
    ],
    startAt: "22/01/2569",
    endAt: "24/01/2569",
    price: 2400,
    checkInAt: "22/01/2569 10:02",
  },

  {
    id: "RSV-20260006",
    status: "finished",
    serviceType: "swim",
    pets: [
      {
        petId: 6,
        petName: "มะลิ",
        petImage: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
    ],
    startAt: "10/01/2569",
    slotLabel: "15:00 - 16:00",
    price: 450,
    checkInAt: "10/01/2569 14:55",
    checkOutAt: "10/01/2569 16:05",
  },

  {
    id: "RSV-20260007",
    status: "cancelled",
    serviceType: "boarding",
    pets: [
      {
        petId: 7,
        petName: "นัทตี้",
        petImage: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=600&auto=format&fit=crop&q=60",
        petSize: "small",
      },
    ],
    startAt: "05/01/2569",
    endAt: "06/01/2569",
    price: 600,
    cancelledReason: "สลิปไม่ตรงยอด/ข้อมูลไม่ครบ",
  },
];