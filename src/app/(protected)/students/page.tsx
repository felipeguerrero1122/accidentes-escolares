import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TableCard } from "@/components/table-card";
import { requireSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

const GRADE_ORDER = [
  "pre kinder",
  "kinder",
  "primero",
  "segundo",
  "tercero",
  "cuarto",
  "quinto",
  "sexto",
  "septimo",
  "octavo"
];

type StudentRow = {
  id: string;
  studentCode: string;
  fullName: string;
  rut: string;
  gradeLevel: string;
  guardianName: string | null;
};

function normalizeGradeLevel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getGradeRank(value: string) {
  const normalized = normalizeGradeLevel(value);

  if (normalized.includes("pre kinder") || normalized.includes("prekinder")) {
    return 0;
  }

  if (normalized === "kinder" || normalized.startsWith("kinder ")) {
    return 1;
  }

  const index = GRADE_ORDER.findIndex((grade) => {
    if (grade === "pre kinder" || grade === "kinder") return false;
    return normalized === grade || normalized.startsWith(`${grade} `) || normalized.includes(` ${grade} `);
  });

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; grade?: string }>;
}) {
  const sql = getSql();
  const session = await requireSession();
  const { q, grade } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";
  const gradeFilter = grade?.trim() ?? "";

  const students = (await sql`
    SELECT
      id,
      "studentCode",
      "fullName",
      rut,
      "gradeLevel",
      "guardianName"
    FROM "Student"
    ORDER BY "fullName" ASC
  `) as StudentRow[];

  const filteredStudents = students.filter((student) => {
    const matchesGrade = !gradeFilter || student.gradeLevel === gradeFilter;
    const matchesQuery =
      !query ||
      student.fullName.toLowerCase().includes(query) ||
      student.rut.toLowerCase().includes(query) ||
      student.studentCode.toLowerCase().includes(query);

    return matchesGrade && matchesQuery;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const gradeRankDiff = getGradeRank(a.gradeLevel) - getGradeRank(b.gradeLevel);
    if (gradeRankDiff !== 0) return gradeRankDiff;

    const gradeNameDiff = a.gradeLevel.localeCompare(b.gradeLevel, "es", { sensitivity: "base" });
    if (gradeNameDiff !== 0) return gradeNameDiff;

    return a.fullName.localeCompare(b.fullName, "es", { sensitivity: "base" });
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumnos"
        description="Padrón maestro de estudiantes, apoderados y datos base usados en el formulario de accidentes."
        actions={
          session.role === "ADMIN" ? (
            <Link href="/students/new" className="primary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
              Nuevo alumno
            </Link>
          ) : null
        }
      />

      <form className="card grid gap-4 p-6 md:grid-cols-[1fr_220px_auto]">
        <input name="q" placeholder="Buscar por nombre, RUT o código" defaultValue={q ?? ""} />
        <input name="grade" placeholder="Curso / Nivel" defaultValue={grade ?? ""} />
        <button type="submit" className="secondary-btn rounded-2xl px-5 py-3 text-sm font-semibold">
          Filtrar
        </button>
      </form>

      <TableCard title="Listado de alumnos">
        <table className="min-w-full text-sm">
          <thead className="table-head text-left">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">RUT</th>
              <th className="px-6 py-3">Curso</th>
              <th className="px-6 py-3">Apoderado</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.id} className="table-row">
                <td className="px-6 py-3">
                  <Link href={`/students/${student.id}`} className="font-medium text-pink-900">
                    {student.studentCode}
                  </Link>
                </td>
                <td className="px-6 py-3">{student.fullName}</td>
                <td className="px-6 py-3">{student.rut}</td>
                <td className="px-6 py-3">{student.gradeLevel}</td>
                <td className="px-6 py-3">{student.guardianName ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>
    </div>
  );
}
