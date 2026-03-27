import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, Settings, TriangleAlert, Users } from "lucide-react";
import { UserRole } from "@prisma/client";
import { LogoutButton } from "@/components/logout-button";
import { APP_TITLE } from "@/lib/constants";

type Props = {
  user: {
    name: string;
    role: UserRole;
  };
  children: ReactNode;
};

export function AppShell({ user, children }: Props) {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/students", label: "Alumnos", icon: Users },
    { href: "/accidents", label: "Accidentes", icon: TriangleAlert },
    ...(user.role === UserRole.ADMIN ? [{ href: "/settings/catalogs", label: "Ajustes", icon: Settings }] : [])
  ];

  return (
    <div className="app-shell min-h-screen bg-[#FFF5F7]">
      <div className="app-shell__grid mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="app-shell__sidebar card flex h-fit flex-col gap-6 p-5">
          <div>
            <p className="section-kicker">Sistema</p>
            <h1 className="mt-2 text-2xl font-semibold text-pink-900">{APP_TITLE}</h1>
          </div>

          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-pink-900 hover:bg-white"
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="soft-panel mt-auto rounded-2xl p-4 text-sm text-pink-700">
            <p className="font-semibold text-pink-900">{user.name}</p>
            <p>{user.role === UserRole.ADMIN ? "Administrador" : "Operador"}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="app-shell__main space-y-6">{children}</main>
      </div>
    </div>
  );
}
