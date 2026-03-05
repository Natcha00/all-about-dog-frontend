"use client";

import { useState } from "react";

type TabId = "main" | "test";

export default function Home() {
  const [tab, setTab] = useState<TabId>("main");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  async function handleTestLogin() {
    setLoginStatus("กำลังยิง API...");
    try {
      const res = await fetch("/api/auth/test-login", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLoginStatus("สำเร็จ: ตั้งค่า accessToken ใน cookies แล้ว");
      } else {
        setLoginStatus(`ผิดพลาด: ${data.error || res.status} - ${JSON.stringify(data.detail || data)}`);
      }
    } catch (e) {
      setLoginStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex gap-2 border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => setTab("main")}
          className={`px-4 py-2 rounded-t ${tab === "main" ? "bg-gray-200 font-medium" : "bg-gray-100"}`}
        >
          หลัก
        </button>
        <button
          type="button"
          onClick={() => setTab("test")}
          className={`px-4 py-2 rounded-t ${tab === "test" ? "bg-gray-200 font-medium" : "bg-gray-100"}`}
        >
          ทดสอบ
        </button>
      </div>

      {tab === "main" && <div>k</div>}

      {tab === "test" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            ปุ่มด้านล่างจะยิง API login (maya.chen@gmail.com / x) แล้วเอา accessToken ไปใส่ใน cookies
          </p>
          <button
            type="button"
            onClick={handleTestLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login ทดสอบ
          </button>
          {loginStatus && (
            <pre className="p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
              {loginStatus}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
