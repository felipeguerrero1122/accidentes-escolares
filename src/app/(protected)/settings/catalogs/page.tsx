import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { CatalogsAdmin } from "@/components/catalogs-admin";
import { UsersAdmin } from "@/components/users-admin";

export default async function CatalogsPage() {
  await requireAdmin();

  const [places, injuries, users] = await Promise.all([
    prisma.catalogPlace.findMany({ orderBy: { name: "asc" } }),
    prisma.catalogInjury.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, active: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes y catálogos" description="Administra listas base e importa alumnos o accidentes desde archivos." />
      <CatalogsAdmin places={places} injuries={injuries} />
      <UsersAdmin users={users} />
    </div>
  );
}
