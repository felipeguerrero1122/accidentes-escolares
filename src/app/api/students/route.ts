import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { composeFullName, normalizePhone, normalizeRut } from "@/lib/utils";
import { studentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(request.url);
  const rut = searchParams.get("rut") ?? undefined;
  const name = searchParams.get("name") ?? undefined;
  const gradeLevel = searchParams.get("grade_level") ?? undefined;
  const active = searchParams.get("active");

  const students = await prisma.student.findMany({
    where: {
      rut: rut ? normalizeRut(rut) : undefined,
      gradeLevel: gradeLevel || undefined,
      active: active ? active === "true" : undefined,
      fullName: name ? { contains: name, mode: "insensitive" } : undefined
    },
    orderBy: [{ gradeLevel: "asc" }, { fullName: "asc" }]
  });

  return ok(students);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const payload = await request.json().catch(() => null);
  const parsed = studentSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Alumno inválido.", parsed.error.flatten());
  }

  const fullName = composeFullName({
    givenNames: parsed.data.givenNames,
    paternalSurname: parsed.data.paternalSurname,
    maternalSurname: parsed.data.maternalSurname,
    fallback: parsed.data.fullName
  });

  const createdStudent = await prisma.student.create({
    data: {
      ...parsed.data,
      fullName,
      rut: normalizeRut(parsed.data.rut),
      guardianPhone: normalizePhone(parsed.data.guardianPhone),
      phoneNumber: normalizePhone(parsed.data.phoneNumber),
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null
    }
  });

  return created(createdStudent);
}
