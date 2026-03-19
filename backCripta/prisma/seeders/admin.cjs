require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Iniciando la plantación de datos en La Cripta...');

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      '¡ALERTA! No has definido ADMIN_PASSWORD en tu archivo .env',
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lacripta.com' },
    update: {},
    create: {
      dni: '00000000A',
      name: 'Admin',
      email: 'admin@lacripta.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'Activo',
    },
  });

  console.log('Admin creado con éxito');
  console.log(`Email: ${admin.email}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
