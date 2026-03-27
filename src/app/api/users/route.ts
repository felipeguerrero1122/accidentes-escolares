import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { userSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true
    }
  });

  return ok(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const parsed = userSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Usuario inválido.", parsed.error.flatten());

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role === "ADMIN" ? UserRole.ADMIN : UserRole.OPERATOR
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

  return created(user);
}
