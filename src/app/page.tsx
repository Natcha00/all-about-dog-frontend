"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { DEFAULT_AVATAR_IMAGE } from "@/lib/constants";
import type { DogApiItem } from "@/lib/dogs/dog.type";
import type { AnnouncementApiResponse } from "@/lib/walkin/walkin/announcementApi";
import HomeBanner from "@/components/home/HomeBanner";
import HomeServices from "@/components/home/HomeServices";

type DogOwnerProfile = {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  address: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
};

type ReservationCounts = {
  pending: number;
  waiting_slip: number;
  slip_uploaded: number;
  slip_verified: number;
  check_in: number;
  finished: number;
  cancelled: number;
};

type ReservationItem = {
  id: string;
  status: string;
  serviceType: string;
  statusLabel: string;
  dogs: Array<{ name: string }>;
  dogsLabel: string;
  totalPrice: number;
  date?: string;
  timeSlot?: { start: string; end: string };
  checkInDate?: string;
  checkOutDate?: string;
};

type ReservationResponse = {
  counts: ReservationCounts;
  items: ReservationItem[];
};

const ORANGE = "#F2A245";

function getUpcomingReservations(items: ReservationItem[]): ReservationItem[] {
  const upcoming = items.filter(
    (item) => item.status !== "finished" && item.status !== "cancelled",
  );

  const toKey = (item: ReservationItem) => {
    const date = item.checkInDate ?? item.date ?? "";
    const time = item.timeSlot?.start ?? "00:00";
    return `${date} ${time}`;
  };

  return upcoming
    .slice()
    .sort((a, b) => {
      const ka = toKey(a);
      const kb = toKey(b);
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return 0;
    })
    .slice(0, 5);
}

export default function DogOwnerHomePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<DogOwnerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [dogs, setDogs] = useState<DogApiItem[]>([]);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [dogsError, setDogsError] = useState<string | null>(null);

  const [reservationCounts, setReservationCounts] = useState<ReservationCounts | null>(null);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const [announcement, setAnnouncement] = useState<AnnouncementApiResponse | null>(null);
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementExpanded, setAnnouncementExpanded] = useState<"swimming" | "boarding" | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch("/api/account/profile", { credentials: "include" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
        }
        const data: DogOwnerProfile = await res.json();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (e) {
        if (!cancelled) {
          setProfileError(
            e instanceof Error ? e.message : "โหลดข้อมูลผู้ใช้ไม่สำเร็จ",
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadDogs() {
      setDogsLoading(true);
      setDogsError(null);
      try {
        const res = await fetch("/api/dog", { credentials: "include" });
        if (!res.ok) {
          throw new Error("โหลดรายการสุนัขไม่สำเร็จ");
        }
        const data: unknown = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data) ? (data as DogApiItem[]) : [];
          setDogs(list);
        }
      } catch (e) {
        if (!cancelled) {
          setDogsError(
            e instanceof Error ? e.message : "โหลดรายการสุนัขไม่สำเร็จ",
          );
        }
      } finally {
        if (!cancelled) {
          setDogsLoading(false);
        }
      }
    }

    void loadDogs();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReservations() {
      setReservationsLoading(true);
      setReservationsError(null);
      try {
        const res = await fetch("/api/reservation?tab=all", {
          credentials: "include",
        });
        const data: ReservationResponse = await res
          .json()
          .catch(() => ({ counts: null, items: [] } as unknown as ReservationResponse));

        if (!res.ok) {
          if (!cancelled) {
            setReservationsError(
              (data as unknown as { error?: string })?.error ??
                "โหลดการจองไม่สำเร็จ",
            );
            setReservations([]);
            setReservationCounts(null);
          }
          return;
        }

        if (!cancelled) {
          setReservationCounts(data.counts);
          setReservations(data.items);
        }
      } catch (e) {
        if (!cancelled) {
          setReservationsError(
            e instanceof Error ? e.message : "โหลดการจองไม่สำเร็จ",
          );
          setReservations([]);
          setReservationCounts(null);
        }
      } finally {
        if (!cancelled) {
          setReservationsLoading(false);
        }
      }
    }

    void loadReservations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnnouncement() {
      setAnnouncementLoading(true);
      try {
        const res = await fetch("/api/offering/announcement");
        if (!res.ok) {
          return;
        }
        const data: AnnouncementApiResponse = await res.json();
        if (!cancelled) {
          setAnnouncement(data);
        }
      } catch {
        // ignore error, banner is optional
      } finally {
        if (!cancelled) {
          setAnnouncementLoading(false);
        }
      }
    }

    void loadAnnouncement();

    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingReservations = useMemo(
    () => getUpcomingReservations(reservations),
    [reservations],
  );

  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "ผู้ใช้";

  const avatarSrc = profile?.profilePictureUrl || DEFAULT_AVATAR_IMAGE;

  return (
    <main className="min-h-screen bg-[#F7F4E8] px-4 py-6 pb-28 max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-black text-white grid place-items-center text-xs font-extrabold shadow-sm">
            DOG
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-black/50">แดชบอร์ดเจ้าของสุนัข</span>
            <span className="text-sm font-extrabold text-black">
              All About Dog
            </span>
          </div>
        </div>
        <Link
          href="/account/profile"
          className="flex items-center gap-2 rounded-full bg-white/80 px-2 py-1.5 shadow-sm ring-1 ring-black/5 active:scale-95 transition"
        >
          <div className="h-8 w-8 rounded-full overflow-hidden bg-white ring-1 ring-black/10">
            <AppImage
              src={avatarSrc}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-xs font-semibold text-black/80 max-w-[90px] truncate">
            {profileLoading ? "..." : displayName}
          </span>
        </Link>
      </header>
      <div className="space-y-4 mb-5">

      <HomeBanner />

      <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-black">
              การจองที่กำลังจะมาถึง
            </h3>
            <Link
              href="/service/booking"
              className="text-[11px] text-black/55 underline"
            >
              ดูทั้งหมด
            </Link>
          </div>
          <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm px-4 py-3">
            {reservationsLoading ? (
              <p className="text-xs text-black/50">กำลังโหลดการจอง...</p>
            ) : reservationsError ? (
              <p className="text-xs text-rose-600">{reservationsError}</p>
            ) : upcomingReservations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-black/60">
                  ยังไม่มีการจองที่กำลังจะมาถึง
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/walkin")}
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#F2A245] px-4 py-2 text-[11px] font-extrabold text-white active:scale-95 transition"
                >
                  จองใหม่
                </button>
              </div>
            ) : (
              <div className="relative -mx-1">
                <ul className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 px-1">
                  {upcomingReservations.map((item, index) => {
                    const isBoarding = item.serviceType === "boarding";
                    const dateLabel = isBoarding
                      ? `${item.checkInDate ?? ""} - ${item.checkOutDate ?? ""}`
                      : item.date ?? "";
                    const timeLabel =
                      !isBoarding && item.timeSlot
                        ? `${item.timeSlot.start} - ${item.timeSlot.end}`
                        : null;
                    const serviceLabel = isBoarding
                      ? "บริการฝากเลี้ยง"
                      : "บริการว่ายน้ำ";

                    return (
                      <li
                        key={item.id}
                        className="snap-center flex-none w-full"
                        aria-label={`การจองที่ ${index + 1} จาก ${upcomingReservations.length}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/service/booking/${item.id}`)
                          }
                          className="w-full rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm ring-1 ring-black/5 active:scale-[0.99] transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-black">
                                {serviceLabel}
                              </p>
                              <p className="mt-0.5 text-[11px] text-black/60 truncate">
                                {item.dogsLabel}
                              </p>
                              <p className="mt-0.5 text-[10px] text-black/50">
                                {dateLabel}
                                {timeLabel ? ` • ${timeLabel}` : null}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/70">
                                {item.statusLabel}
                              </span>
                              <span className="text-[11px] font-extrabold text-black">
                                ฿{item.totalPrice.toLocaleString("th-TH")}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          </div>

      {/* ─── หมวด: ข้อมูลของฉัน ─── */}
      <section aria-labelledby="section-my-info" className="mb-8">
        {/* My Dogs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-black">
              สุนัขของฉัน
            </h3>
            <div className="flex items-center gap-2">
              <Link
                href="/my-dogs"
                className="text-[11px] text-black/55 underline"
              >
                ดูทั้งหมด
              </Link>
              <button
                type="button"
                onClick={() => router.push("/my-dogs/create")}
                className="rounded-2xl bg-black text-white text-[11px] font-semibold px-3 py-1.5 active:scale-95 transition"
              >
                เพิ่มสุนัข
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 ring-1 ring-black/5 shadow-sm px-4 py-3">
            {dogsLoading ? (
              <p className="text-xs text-black/50">กำลังโหลดรายการสุนัข...</p>
            ) : dogsError ? (
              <p className="text-xs text-rose-600">{dogsError}</p>
            ) : dogs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-black/60">
                  ยังไม่มีข้อมูลสุนัข
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/my-dogs/create")}
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#F2A245] px-4 py-2 text-[11px] font-extrabold text-white active:scale-95 transition"
                >
                  เพิ่มสุนัขตัวแรก
                </button>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {dogs.slice(0, 5).map((dog) => (
                  <button
                    key={dog.id}
                    type="button"
                    onClick={() => router.push(`/my-dogs/${dog.id}`)}
                    className="flex-shrink-0 w-28 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden text-left active:scale-95 transition"
                  >
                    <div className="h-20 w-full bg-black/5 overflow-hidden">
                      <AppImage
                        src={dog.dogPictureUrl || "/images/placeholder.svg"}
                        alt={dog.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="px-2 py-2">
                      <p className="text-[11px] font-extrabold text-black truncate">
                        {dog.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-black/55 truncate">
                        {dog.breed?.nameTh || dog.breed?.nameEng}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-sm font-extrabold text-black mb-2">เมนูด่วน</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => router.push("/walkin")}
              className="rounded-3xl bg-[#F2A245] text-white text-[11px] font-extrabold px-3 py-3 shadow-sm active:scale-95 transition"
            >
              จองใหม่
            </button>
            <button
              type="button"
              onClick={() => router.push("/service/schedule")}
              className="rounded-3xl bg-white text-[11px] font-extrabold text-black px-3 py-3 shadow-sm ring-1 ring-black/5 active:scale-95 transition"
            >
              ดูการจองทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => router.push("/account/profile")}
              className="rounded-3xl bg-white text-[11px] font-extrabold text-black px-3 py-3 shadow-sm ring-1 ring-black/5 active:scale-95 transition"
            >
              โปรไฟล์ของฉัน
            </button>
          </div>
        </div>
      </section>

      {/* ─── หมวด: บริการและการจอง ─── */}
      <section aria-labelledby="section-services" className="mb-8">
        <h2
          id="section-services"
          className="text-[10px] font-bold uppercase tracking-wider text-black/45 mb-3 flex items-center gap-2"
        >
          <span className="h-px flex-1 max-w-[40px] bg-black/20" />
          บริการและการจอง
          <span className="h-px flex-1 bg-black/20" />
        </h2>

        <div className="space-y-4 mb-5">
          <HomeServices />
        </div>

        {/* Upcoming reservations */}
        <div>
          

          
        </div>
      </section>

      {/* ─── หมวด: ประกาศจากร้าน ─── */}
      {!announcementLoading && announcement && (
        <section aria-labelledby="section-announcement" className="mb-6">
          <h2
            id="section-announcement"
            className="text-[10px] font-bold uppercase tracking-wider text-black/45 mb-3 flex items-center gap-2"
          >
            <span className="h-px flex-1 max-w-[40px] bg-black/20" />
            ประกาศจากร้าน
            <span className="h-px flex-1 bg-black/20" />
          </h2>
          <div className="space-y-2">
            {/* Swimming card */}
            <div className="rounded-2xl bg-[#FFF9F0] ring-1 ring-amber-200/80 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setAnnouncementExpanded((v) =>
                    v === "swimming" ? null : "swimming",
                  )
                }
                className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-amber-950">
                    {announcement.swimming.title}
                  </p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5 line-clamp-1">
                    {announcement.swimming.intro?.[0]}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-700">
                  {announcementExpanded === "swimming" ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>
              {announcementExpanded === "swimming" && (
                <div className="px-4 pb-3 pt-0 border-t border-amber-200/60 text-[11px] text-amber-900/90 space-y-2.5">
                  {announcement.swimming.intro?.length > 1 && (
                    <ul className="list-disc list-inside space-y-0.5">
                      {announcement.swimming.intro.slice(1).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  )}
                  {announcement.swimming.highlights?.length ? (
                    <ul className="list-disc list-inside space-y-0.5">
                      {announcement.swimming.highlights.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="font-semibold text-amber-950">
                    {announcement.swimming.pricingTitle}
                  </p>
                  <p>{announcement.swimming.pricingNote}</p>
                  <ul className="space-y-0.5">
                    {announcement.swimming.contents?.map((c, i) => (
                      <li key={i}>
                        <span className="font-semibold">{c.priceLabel}</span>
                        {c.breeds?.length ? (
                          <span className="text-amber-900/75">
                            {" "}
                            — {c.breeds.slice(0, 3).join(", ")}
                            {c.breeds.length > 3 ? " ..." : ""}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold text-amber-950 pt-0.5">
                    {announcement.swimming.conditionTitle}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {announcement.swimming.conditions?.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Boarding card */}
            <div className="rounded-2xl bg-[#FFF9F0] ring-1 ring-amber-200/80 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setAnnouncementExpanded((v) =>
                    v === "boarding" ? null : "boarding",
                  )
                }
                className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-amber-950">
                    {announcement.boarding.title}
                  </p>
                  <p className="text-[11px] text-amber-800/80 mt-0.5 line-clamp-1">
                    {announcement.boarding.intro?.[0]}
                  </p>
                </div>
                <span className="flex-shrink-0 text-amber-700">
                  {announcementExpanded === "boarding" ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </span>
              </button>
              {announcementExpanded === "boarding" && (
                <div className="px-4 pb-3 pt-0 border-t border-amber-200/60 text-[11px] text-amber-900/90 space-y-2.5">
                  {announcement.boarding.highlights?.length ? (
                    <ul className="list-disc list-inside space-y-0.5">
                      {announcement.boarding.highlights.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="font-semibold text-amber-950">
                    {announcement.boarding.pricingTitle}
                  </p>
                  <p>{announcement.boarding.pricingNote}</p>
                  <ul className="space-y-0.5">
                    {announcement.boarding.contents?.map((c, i) => (
                      <li key={i}>
                        <span className="font-semibold">{c.priceLabel}</span>
                        {c.breeds?.length ? (
                          <span className="text-amber-900/75">
                            {" "}
                            — {c.breeds.join(", ")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold text-amber-950 pt-0.5">
                    {announcement.boarding.conditionTitle}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {announcement.boarding.conditions?.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

