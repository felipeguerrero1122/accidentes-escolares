import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/student-form";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateAgeAtDate, formatDate } from "@/lib/utils";

function displayValue(value?: string | null) {
  return value?.trim() ? value : "No registrado";
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) notFound();
  const age = calculateAgeAtDate(student.birthDate, new Date());

  return (
    <div className="space-y-6">
      <PageHeader title={student.fullName} description="Ficha completa del alumno con sus datos base, información del apoderado y antecedentes de salud." />

      <section className={`grid gap-6 ${session.role === "ADMIN" ? "xl:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <article className="card p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Ficha del alumno</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">{student.fullName}</h2>
              <p className="mt-2 text-sm text-slate-600">Información registrada actualmente en la base maestra de estudiantes.</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${student.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
              {student.active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">Datos del alumno</h3>
              <dl className="mt-4 space-y-4 text-sm text-slate-700">
                <div><dt className="font-medium text-slate-500">ID alumno</dt><dd className="mt-1 text-base text-slate-900">{displayValue(student.studentCode)}</dd></div>
                <div><dt className="font-medium text-slate-500">RUT</dt><dd className="mt-1 text-base text-slate-900">{displayValue(student.rut)}</dd></div>
                <div><dt className="font-medium text-slate-500">Curso / Nivel</dt><dd className="mt-1 text-base text-slate-900">{displayValue(student.gradeLevel)}</dd></div>
                <div><dt className="font-medium text-slate-500">Edad</dt><dd className="mt-1 text-xl font-semibold text-ink">{age ?? "No registrado"}</dd></div>
                <div><dt className="font-medium text-slate-500">Fecha de nacimiento</dt><dd className="mt-1 text-base text-slate-900">{student.birthDate ? formatDate(student.birthDate) : "No registrado"}</dd></div>
              </dl>
            </section>

            <section className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">Información del apoderado</h3>
              <dl className="mt-4 space-y-4 text-sm text-slate-700">
                <div><dt className="font-medium text-slate-500">Apoderado</dt><dd className="mt-1 text-base text-slate-900">{displayValue(student.guardianName)}</dd></div>
                <div><dt className="font-medium text-slate-500">Teléfono</dt><dd className="mt-1 text-base text-slate-900">{displayValue(student.guardianPhone)}</dd></div>
              </dl>
            </section>

            <section className="rounded-3xl bg-slate-50 p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink">Salud y observaciones</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div><p className="font-medium text-slate-500">Salud / Alergias</p><p className="mt-2 min-h-28 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">{displayValue(student.healthNotes)}</p></div>
                <div><p className="font-medium text-slate-500">Observaciones</p><p className="mt-2 min-h-28 rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700">{displayValue(student.observations)}</p></div>
              </div>
            </section>
          </div>
        </article>

        {session.role === "ADMIN" ? (
          <aside className="space-y-4">
            <div className="card p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Edición</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Actualizar ficha</h2>
              <p className="mt-2 text-sm text-slate-600">Modifica los datos del alumno y del apoderado sin salir de esta ficha.</p>
            </div>

            <StudentForm initialValues={{ id: student.id, studentCode: student.studentCode, fullName: student.fullName, rut: student.rut, gradeLevel: student.gradeLevel, birthDate: student.birthDate ? student.birthDate.toISOString().slice(0, 10) : "", guardianName: student.guardianName, guardianPhone: student.guardianPhone, healthNotes: student.healthNotes, observations: student.observations, active: student.active }} />
          </aside>
        ) : null}
      </section>
    </div>
  );
}
