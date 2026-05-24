require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Iniciando el seeder de admin en La Cripta...');

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('No has definido ADMIN_PASSWORD en tu archivo .env');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@lacripta.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      status: 'Activo',
      coins: 500,
    },
    create: {
      dni: '00000000A',
      name: 'Admin',
      email: 'admin@lacripta.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'Activo',
      coins: 500,
    },
  });

  console.log('Admin creado o actualizado con exito');
  console.log(`Email: ${admin.email}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
