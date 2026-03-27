import { NextRequest } from "next/server";
import { loginWithCredentials } from "@/lib/auth";
import { badRequest, unauthorized, ok } from "@/lib/http";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest("Credenciales inválidas.", parsed.error.flatten());
  }

  const user = await loginWithCredentials(parsed.data.email, parsed.data.password);
  if (!user) return unauthorized("Email o contraseña incorrectos.");

  return ok({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}
