import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { userUpdateSchema } from "@/lib/validations";

async function ensureAdminSession() {
  const session = await getSession();
  if (!session) return { error: unauthorized() };
  if (!isAdmin(session.role)) return { error: forbidden() };
  return { session };
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await ensureAdminSession();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) return notFound("Usuario no encontrado.");

  const parsed = userUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Usuario inválido.", parsed.error.flatten());

  const email = parsed.data.email.toLowerCase();
  const duplicate = await prisma.user.findFirst({
    where: {
      email,
      NOT: { id }
    },
    select: { id: true }
  });
  if (duplicate) return badRequest("El email ya está registrado.");

  if (auth.session.sub === id && parsed.data.active === false) {
    return badRequest("No puedes desactivar tu propio usuario.");
  }

  if (existingUser.role === UserRole.ADMIN && parsed.data.role === "OPERATOR") {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN, active: true }
    });
    if (adminCount <= 1) {
      return badRequest("Debe existir al menos un administrador activo.");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role === "ADMIN" ? UserRole.ADMIN : UserRole.OPERATOR,
      active: parsed.data.active,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) } : {})
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true
    }
  });

  return ok(updatedUser);
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await ensureAdminSession();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true }
  });
  if (!existingUser) return notFound("Usuario no encontrado.");

  if (auth.session.sub === id) {
    return badRequest("No puedes eliminar tu propio usuario.");
  }

  if (existingUser.role === UserRole.ADMIN) {
    const adminCount = await prisma.user.count({
      where: { role: UserRole.ADMIN, active: true }
    });
    if (adminCount <= 1) {
      return badRequest("Debe existir al menos un administrador activo.");
    }
  }

  await prisma.user.delete({ where: { id } });
  return ok({ success: true });
}
