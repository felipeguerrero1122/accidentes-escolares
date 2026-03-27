import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, unauthorized } from "@/lib/http";
import { AccidentPdfDocument } from "@/lib/pdf/accident-report";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await context.params;
  const accident = await prisma.accident.findUnique({
    where: { id },
    include: { student: true }
  });

  if (!accident) return notFound("Accidente no encontrado.");

  const pdf = await renderToBuffer(AccidentPdfDocument({ accident, student: accident.student }));
  const body = new Uint8Array(pdf);

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=ficha-accidente-${accident.recordNumber}.pdf`
    }
  });
}
