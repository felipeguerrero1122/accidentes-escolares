import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, created, forbidden, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { catalogSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return ok(await prisma.catalogPlace.findMany({ where: { active: true }, orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const parsed = catalogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Lugar inválido.", parsed.error.flatten());

  return created(
    await prisma.catalogPlace.create({
      data: { name: parsed.data.name.trim() }
    })
  );
}
