import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@colegio.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: UserRole.ADMIN
    }
  });

  const places = ["Sala", "Patio", "Baño", "Comedor", "Gimnasio", "Pasillo", "Transporte", "Otro"];
  const injuries = ["Golpe", "Corte", "Caída", "Esguince", "Fractura", "Quemadura", "Mareo", "Otro"];

  await Promise.all(
    places.map((name) =>
      prisma.catalogPlace.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  await Promise.all(
    injuries.map((name) =>
      prisma.catalogInjury.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
