import Link from "next/link";
import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { AccidentEditForm } from "@/components/accident-edit-form";
import { DeleteAccidentButton } from "@/components/delete-accident-button";
import { PageHeader } from "@/components/page-header";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AccidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) notFound();

  const { id } = await params;
  const [accident, places, injuries] = await Promise.all([
    prisma.accident.findUnique({ where: { id } }),
    prisma.catalogPlace.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.catalogInjury.findMany({ where: { active: true }, orderBy: { name: "asc" } })
  ]);

  if (!accident) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ficha accidente #${accident.recordNumber}`}
        description="Detalle completo del accidente con datos congelados del alumno al momento del evento."
        actions={
          <div className="flex flex-wrap items-start gap-3">
            <Link href={`/api/accidents/${accident.id}/pdf`} target="_blank" className="rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
              Abrir PDF
            </Link>
            {session.role === UserRole.ADMIN ? <DeleteAccidentButton accidentId={accident.id} /> : null}
          </div>
        }
      />

      <section className={`grid gap-6 ${session.role === UserRole.ADMIN ? "xl:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        <article className="card grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-ink">Fecha:</span> {formatDate(accident.accidentDate)}</p>
            <p><span className="font-semibold text-ink">Hora:</span> {accident.accidentTime}</p>
            <p><span className="font-semibold text-ink">RUT:</span> {accident.studentRut}</p>
            <p><span className="font-semibold text-ink">Alumno:</span> {accident.studentFullName}</p>
            <p><span className="font-semibold text-ink">Curso:</span> {accident.studentGradeLevel}</p>
            <p><span className="font-semibold text-ink">Edad:</span> {accident.studentAgeAtAccident ?? "-"}</p>
            <p><span className="font-semibold text-ink">Apoderado:</span> {accident.guardianNameSnapshot ?? "-"}</p>
            <p><span className="font-semibold text-ink">Teléfono:</span> {accident.guardianPhoneSnapshot ?? "-"}</p>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-ink">Lugar:</span> {accident.place}</p>
            <p><span className="font-semibold text-ink">Tipo de lesión:</span> {accident.injuryType ?? "-"}</p>
            <p><span className="font-semibold text-ink">Primeros auxilios:</span> {accident.firstAid ?? "-"}</p>
            <p><span className="font-semibold text-ink">Derivación:</span> {accident.referred ? "Sí" : "No"}</p>
            <p><span className="font-semibold text-ink">Centro de salud:</span> {accident.healthCenter ?? "-"}</p>
            <p><span className="font-semibold text-ink">Apoderado informado:</span> {accident.guardianInformed ? "Sí" : "No"}</p>
            <p><span className="font-semibold text-ink">Hora aviso:</span> {accident.guardianNoticeTime ?? "-"}</p>
            <p><span className="font-semibold text-ink">Responsable:</span> {accident.responsibleName ?? "-"}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="font-semibold text-ink">Descripción</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{accident.description}</p>
          </div>
          <div className="lg:col-span-2">
            <p className="font-semibold text-ink">Observaciones</p>
            <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">{accident.observations ?? "-"}</p>
          </div>
        </article>

        {session.role === UserRole.ADMIN ? (
          <aside>
            <AccidentEditForm
              accidentId={accident.id}
              places={places}
              injuries={injuries}
              initialValues={{
                accidentDate: accident.accidentDate.toISOString().slice(0, 10),
                accidentTime: accident.accidentTime,
                place: accident.place,
                injuryType: accident.injuryType ?? "",
                firstAid: accident.firstAid ?? "",
                referred: accident.referred,
                healthCenter: accident.healthCenter ?? "",
                guardianInformed: accident.guardianInformed,
                guardianNoticeTime: accident.guardianNoticeTime ?? "",
                responsibleName: accident.responsibleName ?? "",
                description: accident.description,
                observations: accident.observations ?? ""
              }}
            />
          </aside>
        ) : null}
      </section>
    </div>
  );
}
