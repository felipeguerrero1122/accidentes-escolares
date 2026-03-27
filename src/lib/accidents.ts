import { prisma } from "@/lib/db";
import { calculateAgeAtDate, coerceDate, normalizeRut, splitFullName } from "@/lib/utils";

const WEEKDAY_ORDER = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export async function getNextRecordNumber() {
  const last = await prisma.accident.findFirst({
    orderBy: { recordNumber: "desc" },
    select: { recordNumber: true }
  });

  return (last?.recordNumber ?? 0) + 1;
}

export async function buildAccidentSnapshot(studentId: string, accidentDateInput: string | Date) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new Error("Alumno no encontrado.");
  }

  const accidentDate = coerceDate(accidentDateInput);
  if (!accidentDate) {
    throw new Error("Fecha de accidente inválida.");
  }

  const splitName = splitFullName(student.fullName);

  return {
    student,
    snapshot: {
      studentRut: normalizeRut(student.rut),
      studentCode: student.studentCode,
      studentFullName: student.fullName,
      studentPaternalSurname: student.paternalSurname || splitName.paternalSurname || null,
      studentMaternalSurname: student.maternalSurname || splitName.maternalSurname || null,
      studentGivenNames: student.givenNames || splitName.givenNames || null,
      studentGradeLevel: student.gradeLevel,
      studentSchoolSchedule: student.schoolSchedule,
      studentSex: student.sex,
      studentBirthDateSnapshot: student.birthDate ? new Date(student.birthDate) : null,
      studentAgeAtAccident: calculateAgeAtDate(student.birthDate, accidentDate),
      guardianNameSnapshot: student.guardianName,
      guardianPhoneSnapshot: student.guardianPhone,
      phoneAreaCodeSnapshot: student.phoneAreaCode,
      phoneNumberSnapshot: student.phoneNumber,
      residenceStreetSnapshot: student.residenceStreet,
      residenceNumberSnapshot: student.residenceNumber,
      residenceNeighborhoodSnapshot: student.residenceNeighborhood,
      residenceCommuneSnapshot: student.residenceCommune,
      residenceCitySnapshot: student.residenceCity
    }
  };
}

function formatDayKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayLabel(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santiago"
  }).format(new Date(year, month - 1, day));
}

function getWeekdayLabel(value: Date) {
  const day = value.getDay();
  switch (day) {
    case 1:
      return "Lunes";
    case 2:
      return "Martes";
    case 3:
      return "Miércoles";
    case 4:
      return "Jueves";
    case 5:
      return "Viernes";
    default:
      return null;
  }
}

export async function getDashboardSummary() {
  const [total, withReferral, withoutGuardianNotice, missingDescription, lastAccident] = await Promise.all([
    prisma.accident.count(),
    prisma.accident.count({ where: { referred: true } }),
    prisma.accident.count({ where: { guardianInformed: false } }),
    prisma.accident.count({ where: { description: "" } }),
    prisma.accident.findFirst({
      orderBy: { recordNumber: "desc" },
      select: { recordNumber: true }
    })
  ]);

  const accidents = await prisma.accident.findMany({
    select: {
      accidentDate: true,
      studentGradeLevel: true,
      injuryType: true
    }
  });

  const byGradeMap = new Map<string, number>();
  const byInjuryMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  const byWeekdayMap = new Map<string, number>(WEEKDAY_ORDER.map((day) => [day, 0]));

  for (const accident of accidents) {
    byGradeMap.set(accident.studentGradeLevel, (byGradeMap.get(accident.studentGradeLevel) ?? 0) + 1);
    if (accident.injuryType) {
      byInjuryMap.set(accident.injuryType, (byInjuryMap.get(accident.injuryType) ?? 0) + 1);
    }

    const dayKey = formatDayKey(accident.accidentDate);
    byDayMap.set(dayKey, (byDayMap.get(dayKey) ?? 0) + 1);

    const weekdayLabel = getWeekdayLabel(accident.accidentDate);
    if (weekdayLabel) {
      byWeekdayMap.set(weekdayLabel, (byWeekdayMap.get(weekdayLabel) ?? 0) + 1);
    }
  }

  const weekdayRanking = WEEKDAY_ORDER.map((label) => ({
    label,
    count: byWeekdayMap.get(label) ?? 0
  }));

  const topWeekday = weekdayRanking.reduce<{ label: string; count: number } | null>((currentBest, row) => {
    if (!currentBest || row.count > currentBest.count) return row;
    return currentBest;
  }, null);

  return {
    total,
    withReferral,
    withoutGuardianNotice,
    missingDescription,
    lastRecordNumber: lastAccident?.recordNumber ?? 0,
    accidentsByGrade: Array.from(byGradeMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    accidentsByInjury: Array.from(byInjuryMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    accidentsByDay: Array.from(byDayMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([label, count]) => ({ label: formatDayLabel(label), count })),
    topGrade:
      Array.from(byGradeMap.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)[0]?.label ?? "-",
    topInjury:
      Array.from(byInjuryMap.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)[0]?.label ?? "-",
    topWeekdayLabel: topWeekday && topWeekday.count > 0 ? topWeekday.label : "-",
    topWeekdayCount: topWeekday?.count ?? 0
  };
}
