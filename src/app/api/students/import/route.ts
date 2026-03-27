import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized, badRequest, forbidden, ok } from "@/lib/http";
import { importStudentsFile } from "@/lib/importers/excel";
import { isAdmin } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();
  if (!isAdmin(session.role)) return forbidden();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequest("Debes enviar un archivo.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await importStudentsFile(prisma, file.name, buffer);

  return ok(result);
}
