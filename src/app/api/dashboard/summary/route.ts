import { getSession } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/accidents";
import { ok, unauthorized } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  return ok(await getDashboardSummary());
}
