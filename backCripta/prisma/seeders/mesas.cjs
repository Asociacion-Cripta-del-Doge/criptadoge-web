require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Iniciando el seeder de mesas en La Cripta...');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const mesas = [
    { orden: 1, asientos: 4, esDePago: false },
    { orden: 2, asientos: 4, esDePago: false },
    { orden: 3, asientos: 4, esDePago: false },
  ];

  for (const mesa of mesas) {
    await prisma.mesa.upsert({
      where: { orden: mesa.orden },
      update: mesa,
      create: mesa,
    });
    console.log(
      `Mesa ${mesa.orden} creada o actualizada: ${mesa.asientos} huecos gratis`,
    );
  }

  console.log('Todas las mesas iniciales han sido plantadas con exito');

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error('Error inyectando las mesas:', e.message || e);
  process.exit(1);
});
