import AccountHeader from "@/components/ui/account/AccountHeader";
import AccountMenu from "@/components/ui/account/AccountMenu";

export default function AccountPage() {
  return (
    <div className="min-h-screen">
      <div className="h-[env(safe-area-inset-top)]" />

      <div className="mx-auto max-w-[420px] px-4 pb-24">
        <AccountHeader
          name="จิรภา เลา"
          subtitle="จัดการข้อมูลบัญชีและความปลอดภัย"
          avatarSrc="/images/avatar.png"
        />

        <AccountMenu />

        <p className="mt-4 text-center text-[12px] text-black/45">
          เวอร์ชัน 1.0 • AllAboutDog
        </p>
      </div>
    </div>
  );
}
