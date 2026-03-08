"use client";

import HomeBanner from "@/components/home/HomeBanner";
import HomeServices from "@/components/home/HomeServices";

export default function Home() {
  return (
    <div className="min-h-screen p-4 space-y-6">
      <HomeBanner />
      <HomeServices />
    </div>
  );
}
