import { NextRequest } from "next/server";
import { buildAccidentSnapshot, getNextRecordNumber } from "@/lib/accidents";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { sanitizeObjectStrings, sanitizeTextForDb } from "@/lib/utils";
import { accidentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const rut = searchParams.get("rut") ?? undefined;
  const grade = searchParams.get("grade_level") ?? undefined;
  const injury = searchParams.get("injury_type") ?? undefined;
  const referred = searchParams.get("referred");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

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

  return ok(accidents);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const payload = await request.json().catch(() => null);
  const parsed = accidentSchema.safeParse(sanitizeObjectStrings(payload));
  if (!parsed.success) {
    return badRequest("Accidente inválido.", parsed.error.flatten());
  }

  const { student, snapshot } = await buildAccidentSnapshot(parsed.data.studentId, parsed.data.accidentDate);
  const recordNumber = await getNextRecordNumber();
  const requiredText = (value: string) => sanitizeTextForDb(value) ?? value;
  const safeSnapshot = {
    ...snapshot,
    studentBirthDateSnapshot: snapshot.studentBirthDateSnapshot instanceof Date ? snapshot.studentBirthDateSnapshot : null,
    studentRut: requiredText(snapshot.studentRut),
    studentCode: requiredText(snapshot.studentCode),
    studentFullName: requiredText(snapshot.studentFullName),
    studentPaternalSurname: sanitizeTextForDb(snapshot.studentPaternalSurname),
    studentMaternalSurname: sanitizeTextForDb(snapshot.studentMaternalSurname),
    studentGivenNames: sanitizeTextForDb(snapshot.studentGivenNames),
    studentGradeLevel: requiredText(snapshot.studentGradeLevel),
    studentSchoolSchedule: sanitizeTextForDb(snapshot.studentSchoolSchedule),
    studentSex: sanitizeTextForDb(snapshot.studentSex),
    guardianNameSnapshot: sanitizeTextForDb(snapshot.guardianNameSnapshot),
    guardianPhoneSnapshot: sanitizeTextForDb(snapshot.guardianPhoneSnapshot),
    phoneAreaCodeSnapshot: sanitizeTextForDb(snapshot.phoneAreaCodeSnapshot),
    phoneNumberSnapshot: sanitizeTextForDb(snapshot.phoneNumberSnapshot),
    residenceStreetSnapshot: sanitizeTextForDb(snapshot.residenceStreetSnapshot),
    residenceNumberSnapshot: sanitizeTextForDb(snapshot.residenceNumberSnapshot),
    residenceNeighborhoodSnapshot: sanitizeTextForDb(snapshot.residenceNeighborhoodSnapshot),
    residenceCommuneSnapshot: sanitizeTextForDb(snapshot.residenceCommuneSnapshot),
    residenceCitySnapshot: sanitizeTextForDb(snapshot.residenceCitySnapshot)
  };

  const accident = await prisma.accident.create({
    data: {
      recordNumber,
      studentId: student.id,
      accidentDate: new Date(parsed.data.accidentDate),
      accidentTime: parsed.data.accidentTime,
      place: parsed.data.place,
      description: parsed.data.description,
      injuryType: parsed.data.injuryType || null,
      firstAid: parsed.data.firstAid || null,
      referred: parsed.data.referred,
      healthCenter: parsed.data.healthCenter || null,
      guardianInformed: parsed.data.guardianInformed,
      guardianNoticeTime: parsed.data.guardianNoticeTime || null,
      responsibleName: parsed.data.responsibleName || null,
      observations: parsed.data.observations || null,
      accidentContext: parsed.data.accidentContext || null,
      witnessAName: parsed.data.witnessAName || null,
      witnessAId: parsed.data.witnessAId || null,
      witnessBName: parsed.data.witnessBName || null,
      witnessBId: parsed.data.witnessBId || null,
      accidentCircumstances: parsed.data.accidentCircumstances || null,
      medicalServiceCode: parsed.data.medicalServiceCode || null,
      medicalEstablishmentCode: parsed.data.medicalEstablishmentCode || null,
      medicalEstablishmentName: parsed.data.medicalEstablishmentName || null,
      medicalDiagnosis: parsed.data.medicalDiagnosis || null,
      affectedBodyPart: parsed.data.affectedBodyPart || null,
      hospitalized: parsed.data.hospitalized ?? null,
      hospitalizationDays: parsed.data.hospitalizationDays ?? null,
      hasIncapacity: parsed.data.hasIncapacity ?? null,
      incapacityDays: parsed.data.incapacityDays ?? null,
      incapacityTypeCode: parsed.data.incapacityTypeCode || null,
      caseClosureCauseCode: parsed.data.caseClosureCauseCode || null,
      caseClosureDate: parsed.data.caseClosureDate ? new Date(parsed.data.caseClosureDate) : null,
      createdByUserId: session.sub,
      ...safeSnapshot
    }
  });

  return created(accident);
}
