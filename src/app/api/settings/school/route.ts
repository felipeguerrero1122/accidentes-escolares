import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/http";
import { isAdmin } from "@/lib/permissions";
import { schoolSettingsSchema } from "@/lib/validations";

const SETTINGS_ID = "default";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const settings = await prisma.schoolSettings.findUnique({ where: { id: SETTINGS_ID } });
  return ok(settings);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const payload = await request.json().catch(() => null);
  const parsed = schoolSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest("Configuración inválida.", parsed.error.flatten());
  }

  const settings = await prisma.schoolSettings.upsert({
    where: { id: SETTINGS_ID },
    update: parsed.data,
    create: {
      id: SETTINGS_ID,
      ...parsed.data
    }
  });

  return ok(settings);
}
