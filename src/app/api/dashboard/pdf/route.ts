import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/http";
import { getDashboardSummary } from "@/lib/accidents";
import { DashboardPdfDocument } from "@/lib/pdf/dashboard-report";

export async function GET(_: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  const [summary, settings] = await Promise.all([
    getDashboardSummary(),
    prisma.schoolSettings.findUnique({ where: { id: "default" } })
  ]);

  const pdf = await renderToBuffer(
    DashboardPdfDocument({
      generatedAt: new Date(),
      establishmentName: settings?.establishmentName ?? null,
      summary
    })
  );

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=dashboard-accidentes.pdf"
    }
  });
}
