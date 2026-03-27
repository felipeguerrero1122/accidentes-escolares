import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/lib/db";
import { importAccidentsFile, importStudentsFile } from "../src/lib/importers/excel";

async function main() {
  const input = process.argv[2] ?? "base_datos_accidente_escolar_v3 (1).xlsm";
  const filePath = path.resolve(process.cwd(), input);
  const buffer = await fs.readFile(filePath);

  const students = await importStudentsFile(prisma, filePath, buffer);
  const accidents = await importAccidentsFile(prisma, filePath, buffer);

  console.log("Importación completada");
  console.log(`Alumnos importados: ${students.imported}`);
  console.log(`Observaciones alumnos: ${students.issues.length}`);
  console.log(`Accidentes importados: ${accidents.imported}`);
  console.log(`Observaciones accidentes: ${accidents.issues.length}`);

  if (students.issues.length) {
    console.log("Primeras observaciones alumnos:", students.issues.slice(0, 10));
  }

  if (accidents.issues.length) {
    console.log("Primeras observaciones accidentes:", accidents.issues.slice(0, 10));
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
