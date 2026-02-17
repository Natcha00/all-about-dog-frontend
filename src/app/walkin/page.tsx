// src/app/walkin/page.tsx

import WalkInWizard from "@/components/ui/walkin/WalkInWizard";


export default function StaffWalkInPage() {
  return (
    <main className="min-h-screen bg-[#F7F4E8]/80 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        <WalkInWizard />
      </div>
    </main>
  );
}
