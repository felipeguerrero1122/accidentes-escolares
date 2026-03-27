import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { composeFullName, normalizePhone, normalizeRut } from "@/lib/utils";
import { studentSchema } from "@/lib/validations";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await context.params;
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return notFound("Alumno no encontrado.");

  return ok(student);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const payload = await request.json().catch(() => null);
  const parsed = studentSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return badRequest("Alumno inválido.", parsed.error.flatten());
  }

  const { id } = await context.params;
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return notFound("Alumno no encontrado.");

  const fullName =
    parsed.data.fullName !== undefined ||
    parsed.data.givenNames !== undefined ||
    parsed.data.paternalSurname !== undefined ||
    parsed.data.maternalSurname !== undefined
      ? composeFullName({
          givenNames: parsed.data.givenNames ?? existing.givenNames,
          paternalSurname: parsed.data.paternalSurname ?? existing.paternalSurname,
          maternalSurname: parsed.data.maternalSurname ?? existing.maternalSurname,
          fallback: parsed.data.fullName ?? existing.fullName
        })
      : undefined;

  const student = await prisma.student.update({
    where: { id },
    data: {
      ...parsed.data,
      fullName,
      rut: parsed.data.rut ? normalizeRut(parsed.data.rut) : undefined,
      guardianPhone:
        "guardianPhone" in parsed.data ? normalizePhone(parsed.data.guardianPhone ?? null) : undefined,
      phoneNumber: "phoneNumber" in parsed.data ? normalizePhone(parsed.data.phoneNumber ?? null) : undefined,
      birthDate:
        "birthDate" in parsed.data ? (parsed.data.birthDate ? new Date(parsed.data.birthDate) : null) : undefined
    }
  });

  return ok(student);
}
