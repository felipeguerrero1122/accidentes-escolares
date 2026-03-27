import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { catalogSchema } from "@/lib/validations";

function mapCatalogError(error: unknown, duplicateMessage: string, inUseMessage: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return badRequest(duplicateMessage);
    if (error.code === "P2003") return badRequest(inUseMessage);
  }

  throw error;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const { id } = await context.params;
  const existing = await prisma.catalogPlace.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("Lugar no encontrado.");

  const parsed = catalogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Lugar inválido.", parsed.error.flatten());

  try {
    const updated = await prisma.catalogPlace.update({
      where: { id },
      data: { name: parsed.data.name.trim() }
    });

    return ok(updated);
  } catch (error) {
    return mapCatalogError(error, "Ya existe un lugar con ese nombre.", "No se puede eliminar porque ya está en uso en accidentes registrados.");
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const { id } = await context.params;
  const existing = await prisma.catalogPlace.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return notFound("Lugar no encontrado.");

  try {
    await prisma.catalogPlace.delete({ where: { id } });
    return ok({ success: true });
  } catch (error) {
    return mapCatalogError(error, "Ya existe un lugar con ese nombre.", "No se puede eliminar porque ya está en uso en accidentes registrados.");
  }
}
