import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TableCard } from "@/components/table-card";
import { requireSession } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/accidents";

export default async function DashboardPage() {
  const session = await requireSession();
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vista general de accidentes, derivaciones, aviso al apoderado y distribución por curso o lesión."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/api/dashboard/pdf" target="_blank" className="secondary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
              Abrir PDF
            </Link>
            {session.role === "ADMIN" ? (
              <Link href="/accidents/new" className="primary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
                Nuevo accidente
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <StatCard label="Total accidentes" value={summary.total} />
        <StatCard label="Con derivación" value={summary.withReferral} />
        <StatCard label="Sin aviso apoderado" value={summary.withoutGuardianNotice} />
        <StatCard label="Sin descripción" value={summary.missingDescription} />
        <StatCard label="Último registro" value={summary.lastRecordNumber} />
        <StatCard label="Curso con más accidentes" value={summary.topGrade} />
        <StatCard label="Lesión más frecuente" value={summary.topInjury} />
        <StatCard label="Día con más accidentes" value={summary.topWeekdayLabel} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TableCard title="Accidentes por curso">
          <table className="min-w-full text-sm">
            <thead className="table-head text-left">
              <tr>
                <th className="px-6 py-3">Curso</th>
                <th className="px-6 py-3">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {summary.accidentsByGrade.length > 0 ? (
                summary.accidentsByGrade.map((row) => (
                  <tr key={row.label} className="table-row">
                    <td className="px-6 py-3">{row.label}</td>
                    <td className="px-6 py-3">{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td className="px-6 py-3" colSpan={2}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Accidentes por tipo de lesión">
          <table className="min-w-full text-sm">
            <thead className="table-head text-left">
              <tr>
                <th className="px-6 py-3">Lesión</th>
                <th className="px-6 py-3">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {summary.accidentsByInjury.length > 0 ? (
                summary.accidentsByInjury.map((row) => (
                  <tr key={row.label} className="table-row">
                    <td className="px-6 py-3">{row.label}</td>
                    <td className="px-6 py-3">{row.count}</td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td className="px-6 py-3" colSpan={2}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>

      <TableCard title="Accidentes por día">
        <table className="min-w-full text-sm">
          <thead className="table-head text-left">
            <tr>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {summary.accidentsByDay.length > 0 ? (
              summary.accidentsByDay.map((row) => (
                <tr key={row.label} className="table-row">
                  <td className="px-6 py-3">{row.label}</td>
                  <td className="px-6 py-3">{row.count}</td>
                </tr>
              ))
            ) : (
              <tr className="table-row">
                <td className="px-6 py-3" colSpan={2}>Sin registros</td>
              </tr>
            )}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
