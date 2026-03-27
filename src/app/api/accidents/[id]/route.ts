import { NextRequest } from "next/server";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { accidentPatchSchema } from "@/lib/validations";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await context.params;
  const accident = await prisma.accident.findUnique({
    where: { id },
    include: { student: true }
  });

  if (!accident) return notFound("Accidente no encontrado.");
  return ok(accident);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const payload = await request.json().catch(() => null);
  const parsed = accidentPatchSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Accidente inválido.", parsed.error.flatten());
  }

  const { id } = await context.params;
  const existing = await prisma.accident.findUnique({ where: { id } });
  if (!existing) return notFound("Accidente no encontrado.");

  const accident = await prisma.accident.update({
    where: { id },
    data: {
      ...parsed.data,
      accidentDate:
        "accidentDate" in parsed.data && parsed.data.accidentDate ? new Date(parsed.data.accidentDate) : undefined,
      caseClosureDate:
        "caseClosureDate" in parsed.data
          ? parsed.data.caseClosureDate
            ? new Date(parsed.data.caseClosureDate)
            : null
          : undefined
    }
  });

  return ok(accident);
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const { id } = await context.params;
  const existing = await prisma.accident.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("Accidente no encontrado.");

  await prisma.accident.delete({ where: { id } });
  return ok({ success: true });
}
