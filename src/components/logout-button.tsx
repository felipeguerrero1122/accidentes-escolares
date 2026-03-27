"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={onLogout} className="outline-btn w-full rounded-xl px-4 py-2 text-sm font-medium">
      Cerrar sesión
    </button>
  );
}
