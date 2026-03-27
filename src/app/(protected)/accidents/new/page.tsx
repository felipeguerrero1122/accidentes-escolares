import { AccidentForm } from "@/components/accident-form";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function NewAccidentPage() {
  await requireAdmin();

  const [places, injuries] = await Promise.all([
    prisma.catalogPlace.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.catalogInjury.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  return <AccidentForm places={places} injuries={injuries} />;
}
