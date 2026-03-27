import { PrismaClient } from "@prisma/client";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { getNextRecordNumber } from "@/lib/accidents";
import { calculateAgeAtDate, coerceDate, normalizePhone, normalizeRut, parseBooleanYesNo } from "@/lib/utils";

type ImportIssue = {
  row: number;
  message: string;
};

function sheetToObjects(buffer: Buffer, preferredSheet?: string, headerRowIndex = 0) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const name = preferredSheet && workbook.SheetNames.includes(preferredSheet) ? preferredSheet : workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name], {
    defval: null,
    range: headerRowIndex
  });
}

export async function importStudentsFile(prisma: PrismaClient, fileName: string, buffer: Buffer) {
  const issues: ImportIssue[] = [];
  const rows = fileName.endsWith(".csv")
    ? (Papa.parse<Record<string, string>>(buffer.toString("utf-8"), { header: true }).data as Record<string, unknown>[])
    : sheetToObjects(buffer, "Base_Estudiantes", 2);

  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const studentCode = String(row["ID Alumno"] ?? row["student_code"] ?? "").trim();
    const fullName = String(row["Nombre completo"] ?? row["full_name"] ?? "").trim();
    const rut = normalizeRut(String(row["RUT"] ?? row["rut"] ?? ""));
    const gradeLevel = String(row["Curso / Nivel"] ?? row["grade_level"] ?? "").trim();

    if (!studentCode || !fullName || !rut || !gradeLevel) {
      issues.push({ row: index + 2, message: "Fila omitida por datos mínimos faltantes." });
      continue;
    }

    await prisma.student.upsert({
      where: { rut },
      update: {
        studentCode,
        fullName,
        gradeLevel,
        birthDate: coerceDate(row["Fecha de nacimiento"] as string | number | null),
        guardianName: String(row["Apoderado"] ?? "").trim() || null,
        guardianPhone: normalizePhone(String(row["Teléfono"] ?? "")),
        healthNotes: String(row["Alergias / salud"] ?? "").trim() || null,
        observations: String(row["Observaciones"] ?? "").trim() || null,
        active: true
      },
      create: {
        studentCode,
        fullName,
        rut,
        gradeLevel,
        birthDate: coerceDate(row["Fecha de nacimiento"] as string | number | null),
        guardianName: String(row["Apoderado"] ?? "").trim() || null,
        guardianPhone: normalizePhone(String(row["Teléfono"] ?? "")),
        healthNotes: String(row["Alergias / salud"] ?? "").trim() || null,
        observations: String(row["Observaciones"] ?? "").trim() || null
      }
    });

    imported += 1;
  }

  return { imported, issues };
}

export async function importAccidentsFile(prisma: PrismaClient, fileName: string, buffer: Buffer) {
  const issues: ImportIssue[] = [];
  const rows = fileName.endsWith(".csv")
    ? (Papa.parse<Record<string, string>>(buffer.toString("utf-8"), { header: true }).data as Record<string, unknown>[])
    : sheetToObjects(buffer, "Registro_Accidentes", 2);

  let nextRecord = await getNextRecordNumber();
  let imported = 0;

  for (const [index, row] of rows.entries()) {
    const rut = normalizeRut(String(row["RUT"] ?? ""));
    const student = rut ? await prisma.student.findUnique({ where: { rut } }) : null;
    const description = String(row["Descripción del accidente"] ?? "").trim();
    const place = String(row["Lugar del accidente"] ?? "").trim();
    const accidentDate = coerceDate(row["Fecha"] as string | number | null);
    const accidentTime = String(row["Hora"] ?? "").trim();

    if (!student || !accidentDate || !accidentTime || !place || !description) {
      issues.push({ row: index + 2, message: "Fila omitida por alumno inexistente o accidente incompleto." });
      continue;
    }

    await prisma.accident.create({
      data: {
        recordNumber: Number(row["N° Registro"]) || nextRecord,
        studentId: student.id,
        accidentDate,
        accidentTime,
        place,
        description,
        injuryType: String(row["Tipo de lesión"] ?? "").trim() || null,
        firstAid: String(row["Primeros auxilios"] ?? "").trim() || null,
        referred: parseBooleanYesNo(String(row["¿Requirió derivación?"] ?? "")),
        healthCenter: String(row["Centro de salud derivado"] ?? "").trim() || null,
        guardianInformed: parseBooleanYesNo(String(row["¿Apoderado informado?"] ?? "")),
        guardianNoticeTime: String(row["Hora aviso apoderado"] ?? "").trim() || null,
        responsibleName: String(row["Responsable"] ?? "").trim() || null,
        observations: String(row["Observaciones"] ?? "").trim() || null,
        studentRut: student.rut,
        studentCode: student.studentCode,
        studentFullName: student.fullName,
        studentGradeLevel: student.gradeLevel,
        studentAgeAtAccident: calculateAgeAtDate(student.birthDate, accidentDate),
        guardianNameSnapshot: student.guardianName,
        guardianPhoneSnapshot: student.guardianPhone
      }
    });

    nextRecord += 1;
    imported += 1;
  }

  return { imported, issues };
}
