import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TableCard } from "@/components/table-card";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function AccidentsPage({
  searchParams
}: {
  searchParams: Promise<{
    rut?: string;
    grade?: string;
    injury?: string;
    referred?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const session = await requireSession();
  const { rut, grade, injury, referred, dateFrom, dateTo } = await searchParams;
  const accidents = await prisma.accident.findMany({
    where: {
      studentRut: rut || undefined,
      studentGradeLevel: grade || undefined,
      injuryType: injury || undefined,
      referred: referred ? referred === "true" : undefined,
      accidentDate:
        dateFrom || dateTo
          ? {
              gte: dateFrom ? new Date(dateFrom) : undefined,
              lte: dateTo ? new Date(dateTo) : undefined
            }
          : undefined
    },
    orderBy: [{ accidentDate: "desc" }, { recordNumber: "desc" }]
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de accidentes"
        description="Consulta el registro histórico de accidentes escolares."
        actions={
          session.role === "ADMIN" ? (
            <Link href="/accidents/new" className="primary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
              Registrar accidente
            </Link>
          ) : null
        }
      />

      <form className="card grid gap-4 p-6 md:grid-cols-3 xl:grid-cols-6">
        <input name="rut" placeholder="RUT" defaultValue={rut ?? ""} />
        <input name="grade" placeholder="Curso / Nivel" defaultValue={grade ?? ""} />
        <input name="injury" placeholder="Tipo de lesión" defaultValue={injury ?? ""} />
        <input name="dateFrom" type="date" defaultValue={dateFrom ?? ""} />
        <input name="dateTo" type="date" defaultValue={dateTo ?? ""} />
        <select name="referred" defaultValue={referred ?? ""}>
          <option value="">Todas las derivaciones</option>
          <option value="true">Sólo con derivación</option>
          <option value="false">Sólo sin derivación</option>
        </select>
        <div className="md:col-span-3 xl:col-span-6">
          <button type="submit" className="secondary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
            Filtrar
          </button>
        </div>
      </form>

      <TableCard title="Registro histórico">
        <table className="min-w-full text-sm">
          <thead className="table-head text-left">
            <tr>
              <th className="px-6 py-3">Registro</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Alumno</th>
              <th className="px-6 py-3">Curso</th>
              <th className="px-6 py-3">Lugar</th>
              <th className="px-6 py-3">Lesión</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map((accident) => (
              <tr key={accident.id} className="table-row">
                <td className="px-6 py-3">
                  <Link href={`/accidents/${accident.id}`} className="font-medium text-pink-900">
                    #{accident.recordNumber}
                  </Link>
                </td>
                <td className="px-6 py-3">{formatDate(accident.accidentDate)}</td>
                <td className="px-6 py-3">{accident.studentFullName}</td>
                <td className="px-6 py-3">{accident.studentGradeLevel}</td>
                <td className="px-6 py-3">{accident.place}</td>
                <td className="px-6 py-3">{accident.injuryType ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
